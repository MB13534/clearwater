import React, { useEffect, useRef, useState } from "react";
import styled, { ThemeProvider } from "styled-components/macro";
import { NavLink } from "react-router-dom";

import { Helmet } from "react-helmet-async";

import {
  Accordion,
  AccordionDetails,
  Box,
  Card,
  CardHeader,
  Divider as MuiDivider,
  FormControlLabel,
  Grid as MuiGrid,
  lighten,
  List,
  ListItem,
  Radio,
  RadioGroup,
  Typography as MuiTypography,
} from "@material-ui/core";

import { spacing } from "@material-ui/system";

import { useAuth0 } from "@auth0/auth0-react";
import Panel from "../../../components/panels/Panel";
import DashboardMap from "../../../components/map/DashboardMap";
import { useQuery } from "react-query";
import { findRawRecords } from "../../../services/crudService";
import useService from "../../../hooks/useService";
import { useApp } from "../../../AppProvider";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Table from "../../../components/Table";
import axios from "axios";
import TimeseriesLineChart from "../../../components/graphs/TimeseriesLineChart";
import {
  firstOfYear,
  lastOfYear,
  lineColors,
  renderStatusChip,
  oneYearAgo,
} from "../../../utils";
import { onPointClickSetCoordinateRefs } from "../../../utils/map";
import SaveRefButton from "../../../components/graphs/SaveRefButton";
import ExportDataButton from "../../../components/graphs/ExportDataButton";
import OptionsPicker from "../../../components/pickers/OptionsPicker";
import Link from "@material-ui/core/Link";
import { Edit } from "@material-ui/icons";
import mapboxgl from "mapbox-gl";
import { jssPreset, StylesProvider } from "@material-ui/core/styles";
import DatePicker from "../../../components/pickers/DatePicker";
import { customSecondary } from "../../../theme/variants";
import Button from "@material-ui/core/Button";
import ReactDOM from "react-dom";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/styles";
import createTheme from "../../../theme";
import MainPopup from "../../../components/map/components/MainPopup";
import { create } from "jss";
import { useSelector } from "react-redux";

const jss = create({
  ...jssPreset(),
  insertionPoint: document.getElementById("jss-insertion-point"),
});

const Divider = styled(MuiDivider)(spacing);

const Typography = styled(MuiTypography)(spacing);

const SidebarSection = styled(MuiTypography)`
  ${spacing}
  color: ${() => customSecondary[500]};
  padding: ${(props) => props.theme.spacing(4)}px
    ${(props) => props.theme.spacing(7)}px
    ${(props) => props.theme.spacing(1)}px;
  opacity: 0.9;
  font-weight: ${(props) => props.theme.typography.fontWeightBold};
  display: block;
`;

const TitleContainer = styled.span`
  width: 100%;
`;

const TableWrapper = styled.div`
  overflow-y: auto;
  max-width: calc(100vw - ${(props) => props.theme.spacing(12)}px);
  height: 100%;
  width: 100%;
`;

const MapContainer = styled.div`
  height: calc(627px);
  width: 100%;
`;

const TimeseriesContainer = styled.div`
  height: calc(800px - 146px);
  overflow-y: auto;
  width: 100%;
`;

const TimeseriesWrapper = styled.div`
  height: calc(100% - 58px);
  width: 100%;
`;

const Grid = styled(MuiGrid)(spacing);

function Default() {
  const theme = useSelector((state) => state.themeReducer);
  const { user, getAccessTokenSilently } = useAuth0();
  const service = useService({ toast: false });
  const { currentUser } = useApp();

  const [map, setMap] = useState();
  const [currentTableLabel, setCurrentTableLabel] = useState();

  const divSaveRef = useRef(null);
  const graphSaveRef = useRef(null);
  const currentlyPaintedPointRef = useRef(null);
  const coordinatesContainerRef = useRef(null);
  const popUpRef = useRef(
    new mapboxgl.Popup({ maxWidth: "310px", focusAfterOpen: false })
  );
  const longRef = useRef(null);
  const latRef = useRef(null);
  const eleRef = useRef(null);

  //date filter defaults
  const defaultFilterValues = {
    // startDate: lastOfJanuary,
    startDate: oneYearAgo,
    endDate: null,
  };
  const [filterValues, setFilterValues] = useState(defaultFilterValues);
  const changeFilterValues = (name, value) => {
    setFilterValues((prevState) => {
      let newFilterValues = { ...prevState };
      newFilterValues[name] = value;
      return newFilterValues;
    });
  };

  const [radioValue, setRadioValue] = React.useState("all");
  const radioLabels = {
    all: "All",
    has_production: "Well Production",
    has_waterlevels: "Water Levels",
    has_wqdata: "Water Quality",
    search: "Wells Search",
  };

  const handleRadioChange = (event) => {
    setRadioValue(event.target.value);
    setProductionUnitsLabels({
      yLLabel: "Monthly Well Production, Gallons",
      yRLabel: "Annual Production and Allocations, Gallons",
    });
    map.fire("closeAllPopups");
    if (map.getLayer("locations")) {
      map.setFeatureState(
        {
          source: "locations",
          id: currentlyPaintedPointRef.current,
        },
        { clicked: false }
      );
    }
    setCurrentSelectedTimeseriesData(null);
    setCurrentSelectedPoint(null);
  };

  const handlePointInteractions = (pointFeatures) => {
    map.fire("closeAllPopups");

    const coordinates = pointFeatures.location_geometry.coordinates;

    map.flyTo({
      center: coordinates,
      zoom: 14,
      padding: { bottom: 250 },
    });

    //uncolor previously painted/selected point
    map.setFeatureState(
      {
        source: "locations",
        id: currentlyPaintedPointRef.current,
      },
      { clicked: false }
    );

    //set the id to color the point yellow
    currentlyPaintedPointRef.current = pointFeatures.well_ndx;
    map.setFeatureState(
      { source: "locations", id: pointFeatures.well_ndx },
      { clicked: true }
    );

    //sets ref.current.innerHTMLs for coordinates popup
    coordinatesContainerRef.current.style.display = "block";
    onPointClickSetCoordinateRefs(
      coordinatesContainerRef,
      longRef,
      latRef,
      eleRef,
      pointFeatures.latitude_dd,
      pointFeatures.longitude_dd
    );

    //handles main point click popup
    const excludedPopupFields = [
      "id",
      "has_production",
      "has_waterlevels",
      "has_wqdata",
      "well_ndx",
      "location_geometry",
      "authorized_users",
      "is_well_owner",
      "tableData",
      "is_permitted",
      "is_exempt",
      "is_monitoring",
      "well_type",
      "tableData",
    ];

    const popupNode = document.createElement("div");
    ReactDOM.render(
      //MJB adding style providers to the popup
      <StylesProvider jss={jss}>
        <MuiThemeProvider theme={createTheme(theme.currentTheme)}>
          <ThemeProvider theme={createTheme(theme.currentTheme)}>
            <MainPopup
              excludeFields={excludedPopupFields}
              feature={pointFeatures}
              currentUser={currentUser}
            />
          </ThemeProvider>
        </MuiThemeProvider>
      </StylesProvider>,
      popupNode
    );

    popUpRef.current.setLngLat(coordinates).setDOMContent(popupNode).addTo(map);

    map.on("closeAllPopups", () => {
      popUpRef.current.remove();
    });
  };

  const [filteredData, setFilteredData] = React.useState([]);
  const { data, isLoading, error } = useQuery(
    ["UiListWellsAllWells", currentUser],
    async () => {
      if (!currentUser) return;
      try {
        const response = await service([findRawRecords, ["UiListWells"]]);
        let userData = [...response];
        // if (currentUser.isUser) {
        //   userData = filterDataForWellOwner(userData, currentUser);
        // }
        //filters out any well that does not have geometry data
        const filterData = userData.filter(
          (location) => location.location_geometry
        );
        setFilteredData(filterData);
        return filterData;
      } catch (err) {
        console.error(err);
      }
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const { data: geologicFormations } = useQuery(
    ["data-wells-formations-crosstab"],
    async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_ENDPOINT}/api/data-wells-formations-crosstab`
        );

        return data;
      } catch (err) {
        console.error(err);
      }
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  //paramaters in picker that are selected by user
  const [selectedWQParameter, setSelectedWQParameter] = useState(6);
  const { data: wQparameterOptions } = useQuery(
    ["ListWQParameters", currentUser],
    async () => {
      try {
        const response = await service([findRawRecords, ["ListWQParameters"]]);
        return response.map((parameter) => ({
          label: parameter.wq_parameter_name,
          value: parameter.wq_parameter_ndx,
        }));
      } catch (err) {
        console.error(err);
      }
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (data?.length > 0) {
      if (radioValue === "all") {
        setFilteredData(data);
      } else {
        setFilteredData(data.filter((item) => item[radioValue]));
      }
    }
  }, [radioValue, data]);

  const [currentSelectedPoint, setCurrentSelectedPoint] = useState(null);
  const [currentSelectedTimeseriesData, setCurrentSelectedTimeseriesData] =
    useState(null);

  useEffect(() => {
    if (currentSelectedPoint && !["all", "search"].includes(radioValue)) {
      async function send() {
        try {
          const token = await getAccessTokenSilently();
          const headers = { Authorization: `Bearer ${token}` };

          const endpoint = {
            has_production: "graph-wellproductions",
            has_waterlevels: "graph-depthtowater",
            has_wqdata: "graph-waterquality",
          };

          const { data: results } = await axios.post(
            `${process.env.REACT_APP_ENDPOINT}/api/${endpoint[radioValue]}/${currentSelectedPoint}`,
            {
              cuwcd_well_number: currentSelectedPoint,
            },
            { headers }
          );

          if (results.length) {
            setCurrentSelectedTimeseriesData(results);
          } else {
            setCurrentSelectedTimeseriesData(null);
          }
        } catch (err) {
          // Is this error because we cancelled it ourselves?
          if (axios.isCancel(err)) {
            console.log(`call was cancelled`);
          } else {
            console.error(err);
          }
        }
      }
      send();
    }
  }, [currentSelectedPoint]); // eslint-disable-line

  const [annotatedLines, setAnnotatedLines] = useState({});
  const [filteredMutatedGraphData, setFilteredMutatedGraphData] = useState({});
  useEffect(() => {
    if (
      currentSelectedTimeseriesData?.length &&
      currentTableLabel &&
      geologicFormations
    ) {
      //mutate data for chartJS to use
      let graphData;
      if (radioValue === "has_production") {
        setAnnotatedLines({});
        graphData = {
          labels: currentSelectedTimeseriesData.map(
            (item) => new Date(item.report_date)
          ),
          datasets: [
            {
              label: "Annual Allocation (g)",
              type: "line",
              yAxisID: "yR",
              pointStyle: "line",
              backgroundColor: lineColors.darkGray,
              borderColor: lineColors.darkGray,
              data: currentSelectedTimeseriesData.map(
                (item) => item.allocation_gallons
              ),
              pointRadius: 0,
              pointHoverRadius: 0,
              borderWidth: 4,
              spanGaps: true,
              hidden: false,
            },
            {
              label: "Annual Allocation (af)",
              type: "line",
              yAxisID: "yR",
              pointStyle: "line",
              backgroundColor: lineColors.darkGray,
              borderColor: lineColors.darkGray,
              data: currentSelectedTimeseriesData.map(
                (item) => item.allocation_af
              ),
              pointRadius: 0,
              pointHoverRadius: 0,
              borderWidth: 4,
              spanGaps: true,
              hidden: true,
            },
            {
              label: "Cumulative Pumping (g)",
              type: "line",
              yAxisID: "yR",
              pointStyle: "rect",
              stepped: "middle",
              backgroundColor: "rgba(141, 144, 147, .5)",
              borderColor: lineColors.gray,
              data: currentSelectedTimeseriesData.map(
                (item) => item.cum_production_gallons
              ),
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 0,
              borderWidth: 2,
              spanGaps: true,
              hidden: false,
            },
            {
              label: "Cumulative Pumping (af)",
              type: "line",
              yAxisID: "yR",
              pointStyle: "rect",
              stepped: "middle",
              backgroundColor: "rgba(141, 144, 147, .5)",
              borderColor: lineColors.gray,
              data: currentSelectedTimeseriesData.map(
                (item) => item.cum_production_af
              ),
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 0,
              borderWidth: 2,
              spanGaps: true,
              hidden: true,
            },
            {
              label: "Operational Permit Pumping (g)",
              type: "bar",
              yAxisID: "yL",
              pointStyle: "rect",
              backgroundColor: "rgba(67, 99, 215, .7)",
              borderColor: lineColors.blue,
              data: currentSelectedTimeseriesData.map(
                (item) => item.o_pumping_gallons
              ),
              borderWidth: 2,
              spanGaps: true,
              hidden: false,
              barPercentage: 0.2,
            },
            {
              label: "Operational Permit Pumping (af)",
              type: "bar",
              yAxisID: "yL",
              pointStyle: "rect",
              backgroundColor: "rgba(67, 99, 215, .7)",
              borderColor: lineColors.blue,
              data: currentSelectedTimeseriesData.map(
                (item) => item.o_pumping_af
              ),
              borderWidth: 2,
              spanGaps: true,
              hidden: true,
              barPercentage: 0.2,
            },
            {
              label: "Historical Pumping (g)",
              type: "bar",
              yAxisID: "yL",
              pointStyle: "rect",
              backgroundColor: "rgba(245, 130, 49, .7)",
              borderColor: lineColors.orange,
              data: currentSelectedTimeseriesData.map(
                (item) => item.h_pumping_gallons
              ),
              borderWidth: 2,
              spanGaps: true,
              hidden: false,
              barPercentage: 0.2,
            },
            {
              label: "Historical Pumping (af)",
              type: "bar",
              yAxisID: "yL",
              pointStyle: "rect",
              backgroundColor: "rgba(245, 130, 49, .7)",
              borderColor: lineColors.orange,
              data: currentSelectedTimeseriesData.map(
                (item) => item.h_pumping_af
              ),
              borderWidth: 2,
              spanGaps: true,
              hidden: true,
              barPercentage: 0.2,
            },
          ],
        };
      } else if (radioValue === "has_waterlevels") {
        const currentNdxGeologicFormations = geologicFormations.filter(
          (location) => location.well_ndx === currentTableLabel.well_ndx
        )[0];

        graphData = {
          labels: currentSelectedTimeseriesData.map(
            (item) => new Date(item.collected_date)
          ),
          datasets: [
            {
              label: currentSelectedTimeseriesData[0].cuwcd_well_number,
              backgroundColor: lighten(lineColors.blue, 0.5),
              borderColor: lineColors.blue,
              data: currentSelectedTimeseriesData.map((item) => item.dtw_ft),
              borderWidth: 2,
              pointHoverRadius: 9,
              pointRadius: 7,
              fill: "start",
              maxBarThickness: 25,
            },
          ],
        };

        const annotations = {
          annotations: {
            ...(currentNdxGeologicFormations.top_austin !== null && {
              topAustinLine: {
                type: "line",
                yScaleID: "yL",
                yMin: currentNdxGeologicFormations.top_austin,
                yMax: currentNdxGeologicFormations.top_austin,
                borderColor: "#94CE94",
                borderWidth: 3,
                display: false,
                label: {
                  position: "90%",
                  enabled: true,
                  backgroundColor: "#94CE94",
                  borderColor: "#94CE94",
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "black",
                  content: () =>
                    "Austin: " +
                    currentNdxGeologicFormations.top_austin +
                    " ft",
                  rotation: "auto",
                },
              },
            }),
            ...(currentNdxGeologicFormations.top_delrio !== null && {
              topDelrioLine: {
                type: "line",
                yScaleID: "yL",
                yMin: currentNdxGeologicFormations.top_delrio,
                yMax: currentNdxGeologicFormations.top_delrio,
                borderColor: "#E8BA6C",
                borderWidth: 3,
                display: false,
                label: {
                  position: "80%",
                  enabled: true,
                  backgroundColor: "#E8BA6C",
                  borderColor: "#E8BA6C",
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "white",
                  content: () =>
                    "Del Rio: " +
                    currentNdxGeologicFormations.top_delrio +
                    " ft",
                  rotation: "auto",
                },
              },
            }),
            ...(currentNdxGeologicFormations.top_edwards !== null && {
              topEdwardsLine: {
                type: "line",
                yScaleID: "yL",
                yMin: currentNdxGeologicFormations.top_edwards,
                yMax: currentNdxGeologicFormations.top_edwards,
                borderColor: "#C5FBC7",
                borderWidth: 3,
                display: false,
                label: {
                  position: "70%",
                  enabled: true,
                  backgroundColor: "#C5FBC7",
                  borderColor: "#C5FBC7",
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "black",
                  content: () =>
                    "Edwards: " +
                    currentNdxGeologicFormations.top_edwards +
                    " ft",
                  rotation: "auto",
                },
              },
            }),
            ...(currentNdxGeologicFormations.top_walnut !== null && {
              topWalnutLine: {
                type: "line",
                yScaleID: "yL",
                yMin: currentNdxGeologicFormations.top_walnut,
                yMax: currentNdxGeologicFormations.top_walnut,
                borderColor: "#097608",
                borderWidth: 3,
                display: false,
                label: {
                  position: "60%",
                  enabled: true,
                  backgroundColor: "#097608",
                  borderColor: "#097608",
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "white",
                  content: () =>
                    "Walnut: " +
                    currentNdxGeologicFormations.top_walnut +
                    " ft",
                  rotation: "auto",
                },
              },
            }),
            ...(currentNdxGeologicFormations.top_glen_rose !== null && {
              topGlenRoseLine: {
                type: "line",
                yScaleID: "yL",
                yMin: currentNdxGeologicFormations.top_glen_rose,
                yMax: currentNdxGeologicFormations.top_glen_rose,
                borderColor: "#99DEF5",
                borderWidth: 3,
                display: false,
                label: {
                  position: "50%",
                  enabled: true,
                  backgroundColor: "#99DEF5",
                  borderColor: "#99DEF5",
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "black",
                  content: () =>
                    "Glen Rose: " +
                    currentNdxGeologicFormations.top_glen_rose +
                    " ft",
                  rotation: "auto",
                },
              },
            }),
            ...(currentNdxGeologicFormations.top_hensell !== null && {
              topHensellLine: {
                type: "line",
                yScaleID: "yL",
                yMin: currentNdxGeologicFormations.top_hensell,
                yMax: currentNdxGeologicFormations.top_hensell,
                borderColor: "#C454C4",
                borderWidth: 3,
                display: false,
                label: {
                  position: "40%",
                  enabled: true,
                  backgroundColor: "#C454C4",
                  borderColor: "#C454C4",
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "white",
                  content: () =>
                    "Hensell: " +
                    currentNdxGeologicFormations.top_hensell +
                    " ft",
                  rotation: "auto",
                },
              },
            }),
            ...(currentNdxGeologicFormations.top_pearsall !== null && {
              topPearsallLine: {
                type: "line",
                yScaleID: "yL",
                yMin: currentNdxGeologicFormations.top_pearsall,
                yMax: currentNdxGeologicFormations.top_pearsall,
                borderColor: "#DFE094",
                borderWidth: 3,
                display: false,
                label: {
                  position: "30%",
                  enabled: true,
                  backgroundColor: "#DFE094",
                  borderColor: "#DFE094",
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "black",
                  content: () =>
                    "Pearsall: " +
                    currentNdxGeologicFormations.top_pearsall +
                    " ft",
                  rotation: "auto",
                },
              },
            }),
            ...(currentNdxGeologicFormations.top_hosston !== null && {
              topHosstonLine: {
                type: "line",
                yScaleID: "yL",
                yMin: currentNdxGeologicFormations.top_hosston,
                yMax: currentNdxGeologicFormations.top_hosston,
                borderColor: "#403ECD",
                borderWidth: 3,
                display: false,
                label: {
                  position: "20%",
                  enabled: true,
                  backgroundColor: "#403ECD",
                  borderColor: "#403ECD",
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "white",
                  content: () =>
                    "Hosston: " +
                    currentNdxGeologicFormations.top_hosston +
                    " ft",
                  rotation: "auto",
                },
              },
            }),

            ...(currentTableLabel.screen_top_depth_ft !== null && {
              topOfScreenLine: {
                type: "line",
                yScaleID: "yL",
                yMin: currentTableLabel.screen_top_depth_ft,
                yMax: currentTableLabel.screen_top_depth_ft,
                borderColor: "black",
                borderWidth: 3,
                borderDash: [6, 6],
                borderDashOffset: 0,
                display: false,
                label: {
                  position: "start",
                  yAdjust: -15,
                  enabled: true,
                  backgroundColor: "black",
                  borderColor: "black",
                  borderRadius: 10,
                  borderWidth: 2,
                  content: () =>
                    "Top of Screen: " +
                    currentTableLabel?.screen_top_depth_ft +
                    " ft",
                  rotation: "auto",
                },
              },
            }),
            ...(currentTableLabel.screen_bottom_depth_ft !== null && {
              bottomOfScreenLine: {
                type: "line",
                yScaleID: "yL",
                yMin: currentTableLabel.screen_bottom_depth_ft,
                yMax: currentTableLabel.screen_bottom_depth_ft,
                borderColor: "black",
                borderWidth: 3,
                borderDash: [6, 6],
                borderDashOffset: 0,
                display: false,
                label: {
                  position: "end",
                  yAdjust: 15,
                  enabled: true,
                  backgroundColor: "black",
                  borderColor: "black",
                  borderRadius: 10,
                  borderWidth: 2,
                  content: () =>
                    "Bottom of Screen: " +
                    currentTableLabel.screen_bottom_depth_ft +
                    " ft",
                  rotation: "auto",
                },
              },
            }),
          },
        };

        setAnnotatedLines(annotations);
      } else if (radioValue === "has_wqdata") {
        const parameterFilteredData = currentSelectedTimeseriesData.filter(
          (item) => item.wq_parameter_ndx === selectedWQParameter
        );

        setAnnotatedLines({});

        graphData =
          parameterFilteredData.length === 0
            ? []
            : {
                labels: parameterFilteredData.map(
                  (item) => new Date(item.test_date)
                ),
                units: parameterFilteredData[0].unit_desc,
                parameter: parameterFilteredData[0].wq_parameter_name,
                datasets: [
                  {
                    label: parameterFilteredData[0].cuwcd_well_number,
                    backgroundColor: lighten(lineColors.blue, 0.5),
                    borderColor: lineColors.blue,
                    data: parameterFilteredData.map(
                      (item) => item.result_value
                    ),
                    pointStyle: "circle",
                    borderWidth: 2,
                    pointHoverRadius: 9,
                    pointRadius: 7,
                  },
                ],
              };
      }

      setFilteredMutatedGraphData(graphData);
    } else {
      setFilteredMutatedGraphData(null);
      setAnnotatedLines({});
    }
  }, [currentSelectedTimeseriesData, selectedWQParameter, currentTableLabel]); // eslint-disable-line

  const handleToggleAnnotation = (lineLabel) => {
    setAnnotatedLines((prevState) => {
      let newState = { ...prevState };

      if (lineLabel === "Screening Interval") {
        newState.annotations.topOfScreenLine.display =
          !newState.annotations.topOfScreenLine.display;
        newState.annotations.bottomOfScreenLine.display =
          !newState.annotations.bottomOfScreenLine.display;
      }
      if (lineLabel === "Geologic Formations") {
        if (newState?.annotations?.topHosstonLine?.display !== undefined) {
          newState.annotations.topHosstonLine.display =
            !newState.annotations.topHosstonLine.display;
        }
        if (newState?.annotations?.topPearsallLine?.display !== undefined) {
          newState.annotations.topPearsallLine.display =
            !newState.annotations.topPearsallLine.display;
        }

        if (newState?.annotations?.topHensellLine?.display !== undefined) {
          newState.annotations.topHensellLine.display =
            !newState.annotations.topHensellLine.display;
        }

        if (newState?.annotations?.topGlenRoseLine?.display !== undefined) {
          newState.annotations.topGlenRoseLine.display =
            !newState.annotations.topGlenRoseLine.display;
        }

        if (newState?.annotations?.topWalnutLine?.display !== undefined) {
          newState.annotations.topWalnutLine.display =
            !newState.annotations.topWalnutLine.display;
        }

        if (newState?.annotations?.topEdwardsLine?.display !== undefined) {
          newState.annotations.topEdwardsLine.display =
            !newState.annotations.topEdwardsLine.display;
        }

        if (newState?.annotations?.topDelrioLine?.display !== undefined) {
          newState.annotations.topDelrioLine.display =
            !newState.annotations.topDelrioLine.display;
        }

        if (newState?.annotations?.topAustinLine?.display !== undefined) {
          newState.annotations.topAustinLine.display =
            !newState.annotations.topAustinLine.display;
        }
      }

      return newState;
    });
  };

  const statusChipColors = {
    Active: lineColors.blue,
    Inactive: lineColors.gray,
    Abandoned: lineColors.gray,
    "Never Drilled": lineColors.orange,
    Capped: lineColors.red,
    Plugged: lineColors.red,
    Proposed: lineColors.green,
    Unknown: lineColors.olive,
  };

  const tableColumns = [
    {
      title: "CUWCD Well Number",
      field: "cuwcd_well_number",
    },
    { title: "State Well Number", field: "state_well_number" },
    { title: "Well Name", field: "well_name" },
    { title: "Source Aquifer", field: "source_aquifer" },
    { title: "Well Depth (ft)", field: "well_depth_ft" },
    { title: "Primary Well Use", field: "primary_use" },
    { title: "Current Owner", field: "well_owner" },
    {
      title: "Well Status",
      field: "well_status",
      render: (rowData) => {
        return renderStatusChip(rowData.well_status, statusChipColors);
      },
    },
  ];

  useEffect(() => {
    if (currentSelectedPoint) {
      setCurrentTableLabel(
        filteredData.filter(
          (item) => item.cuwcd_well_number === currentSelectedPoint
        )[0]
      );
    }
  }, [currentSelectedPoint, filteredData]);

  const waterQualityReport = {
    2: "E. coli?",
    1: "A family of bacteria common in soils, plants and animals. The presence/absence test only indicates if coliform bacteria are present. No distinction is made on the origin of the coliform bacteria. A positive result warrants further analysis, an inspection of the well integrity and well/water system disinfection. Coliform bacteria should not be present under the federal drinking water standard. Coliform Bacteria - A family of bacteria common in soils, plants and animals. The presence/absence test only indicates if coliform bacteria are present. No distinction is made on the origin of the coliform bacteria. A positive result warrants further analysis, an inspection of the well integrity and well/water system disinfection. Coliform bacteria should not be present under the federal drinking water standard.",
    6: "The pH of water is a measure of the concentration of hydrogen ions. pH is expressed on a scale from 1 to 14, with 1 being most acidic, 7 neutral and 14 being the most basic or alkaline. The pH of drinking water should be between 6.5 and 8.5 to meet the federal secondary drinking water standard.",
    3: "Conductivity measures the ability of water to conduct an electric current and is useful to quickly assess water quality. Conductivity increases with the number of dissolved ions in the water but is affected by temperature and the specific ions in solution. High conductivity or large changes may warrant further analysis. There is no EPA or TCEQ drinking water standard for conductivity.",
    4: "Total Dissolved Solids refers to dissolved minerals (ions) and is a good general indicator of water quality. The value reported for this parameter is calculated by the conductivity meter as a function of the conductivity value and may not account for all the factors affecting the Conductivity-TDS relationship. TDS values reported by CUWCD should be considered as ???apparent???. The accuracy may range approximately +/- 25 percent from values reported by certified laboratories. The TCEQ secondary drinking water standard for TDS is 1000 mg/L. Water is considered fresh if TDS is 1000 mg/L or less.",
    5: "Salinity?",
    7: "Alkalinity does not refer to pH, but instead refers to the ability of water to resist change in pH and may be due to dissolved bicarbonates. Low water alkalinity may cause corrosion; high alkalinity may cause scale formation. There is no EPA or TCEQ drinking water standard for alkalinity.",
    8: '???Hard" water may be indicated by large amounts of soap required to form suds and scale deposits in pipes and water heaters. Hardness is caused by calcium, magnesium, manganese or iron in the form of bicarbonates, carbonates, sulfates or chlorides.',
    9: "Nitrate/Nitrite - Nitrate and Nitrite are of special concern to infants and can cause ???blue baby??? syndrome. The federal drinking water standard for nitrate is 10 mg/L. The federal drinking water standard for nitrite is 1 mg/L. Nitrate or nitrite may indicate an impact from sewage, fertilizer or animal waste.",
    10: "Nitrate/Nitrite - Nitrate and Nitrite are of special concern to infants and can cause ???blue baby??? syndrome. The federal drinking water standard for nitrate is 10 mg/L. The federal drinking water standard for nitrite is 1 mg/L. Nitrate or nitrite may indicate an impact from sewage, fertilizer or animal waste.",
    11: "Phosphates may indicate impact from laundering agents. Testing for phosphates provides a general indicator of water quality. There is no EPA or TCEQ drinking water standard for phosphate.",
    12: "Sulfate compounds are many of the dissolved salts found in groundwater. Sulfate can produce laxative effects, bad taste or smell. The TCEQ secondary drinking water standard for sulfate is 300 mg/L.",
    13: "Fluoride may occur naturally and is sometimes added to drinking water to promote strong teeth. Fluoride may stain children???s teeth. The federal drinking water standard for fluoride is 4.0 mg/L. Water Quality Assessment What are the parameters being assessed?",
  };

  const formatTableTitle = (location, graphType) => {
    if (!location) return null;
    if (graphType === "Well Production") {
      return (
        <>
          <Typography variant="h4" pl={2} style={{ lineHeight: 1.3 }}>
            <strong>Reported Well Production for Well: </strong>
            {location.well_name ?? "NA"} {location.cuwcd_well_number ?? "NA"}
            <Box>
              <strong>Aquifer: </strong>
              {location.source_aquifer ?? "NA"}
            </Box>
            {location.state_well_number && (
              <Box>
                <strong>State Well Number: </strong>
                {location.state_well_number}
              </Box>
            )}
          </Typography>
          <br />
          <Typography variant="subtitle1" pl={2} style={{ lineHeight: 1.3 }}>
            <Box>
              <strong>Owner: </strong>
              {location.well_owner ?? "NA"}
            </Box>
            <Box>
              <strong>Permit Info: </strong>
              {location.permit_number ?? "NA"}
            </Box>
            <Box>
              <strong>Aggregated System: </strong>
              {location.agg_system_name ?? "NA"}
            </Box>
          </Typography>
        </>
      );
    } else if (graphType === "Water Levels") {
      return (
        <>
          <Typography variant="h4" pl={2} style={{ lineHeight: 1.3 }}>
            <strong>Reported Water Levels for Well: </strong>
            {location.well_name ?? "NA"} {location.cuwcd_well_number ?? "NA"}
            <Box>
              <strong>Aquifer: </strong>
              {location.source_aquifer ?? "NA"}
            </Box>
            {location.state_well_number && (
              <Box>
                <strong>State Well Number: </strong>
                {location.state_well_number}
              </Box>
            )}
          </Typography>
          <br />
          <Typography variant="subtitle1" pl={2} style={{ lineHeight: 1.3 }}>
            <Box component="span" mr={6}>
              <strong>Well Depth: </strong>
              {location.well_depth_ft ? `${location.well_depth_ft} ft` : "NA"}
            </Box>
            <Box component="span" mr={6}>
              <strong>Top of Screen: </strong>
              {location.screen_top_depth_ft
                ? `${location.screen_top_depth_ft} ft`
                : "NA"}
            </Box>
            <Box component="span" mr={6}>
              <strong>Bottom of Screen: </strong>
              {location.screen_bottom_depth_ft
                ? `${location.screen_bottom_depth_ft} ft`
                : "NA"}
            </Box>
          </Typography>
        </>
      );
    } else if (graphType === "Water Quality") {
      return (
        <>
          <Typography variant="h4" pl={2} style={{ lineHeight: 1.3 }}>
            <strong>
              Reported{" "}
              {
                wQparameterOptions.filter(
                  (item) => item.value === selectedWQParameter
                )[0].label
              }{" "}
              Measurements for Well:{" "}
            </strong>
            {location.well_name ?? "NA"} {location.cuwcd_well_number ?? "NA"}
            <Box>
              <strong>Aquifer: </strong>
              {location.source_aquifer ?? "NA"}
            </Box>
            {location.state_well_number && (
              <Box>
                <strong>State Well Number: </strong>
                {location.state_well_number}
              </Box>
            )}
          </Typography>
          <br />
          <Typography variant="subtitle1" pl={2} style={{ lineHeight: 1.3 }}>
            <Box>
              About{" "}
              {
                wQparameterOptions.filter(
                  (item) => item.value === selectedWQParameter
                )[0].label
              }
              :{" "}
            </Box>

            <Box>{waterQualityReport[selectedWQParameter]}</Box>
          </Typography>
        </>
      );
    } else {
      return null;
    }
  };

  const [productionUnitsLabels, setProductionUnitsLabels] = useState({
    yLLabel: "Monthly Well Production, Gallons",
    yRLabel: "Annual Production and Allocations, Gallons",
  });
  const changeProductionUnitsLabels = (name, value) => {
    setProductionUnitsLabels((prevState) => {
      let newLabelsValues = { ...prevState };
      newLabelsValues[name] = value;
      return newLabelsValues;
    });
  };

  const [isGraphRefCurrent, setIsGraphRefCurrent] = useState(false);

  const handleToggleProductionUnitsChange = () => {
    for (let x = 0; x < filteredMutatedGraphData.datasets.length; x++) {
      graphSaveRef.current.setDatasetVisibility(
        x,
        !graphSaveRef.current.isDatasetVisible(x)
      );
    }

    graphSaveRef.current.config._config.options.scales.yL.title.text =
      productionUnitsLabels.yLLabel === "Monthly Well Production, Gallons"
        ? "Monthly Well Production, Acre-Feet"
        : "Monthly Well Production, Gallons";

    graphSaveRef.current.config._config.options.scales.yR.title.text =
      productionUnitsLabels.yRLabel ===
      "Annual Production and Allocations, Gallons"
        ? "Annual Production and Allocations, Acre-Feet"
        : "Annual Production and Allocations, Gallons";

    changeProductionUnitsLabels(
      "yLLabel",
      productionUnitsLabels.yLLabel === "Monthly Well Production, Gallons"
        ? "Monthly Well Production, Acre-Feet"
        : "Monthly Well Production, Gallons"
    );

    changeProductionUnitsLabels(
      "yRLabel",
      productionUnitsLabels.yRLabel ===
        "Annual Production and Allocations, Gallons"
        ? "Annual Production and Allocations, Acre-Feet"
        : "Annual Production and Allocations, Gallons"
    );

    graphSaveRef.current.update();
  };

  return (
    <React.Fragment>
      <Helmet title="Dashboard" />
      <Grid justify="space-between" container spacing={6}>
        <Grid item>
          <Typography variant="h3" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="subtitle1">
            Welcome back, {user?.name}!
          </Typography>
        </Grid>
      </Grid>

      <Divider my={6} />

      <Grid container spacing={6}>
        <Grid item xs={12} sm={7} md={8} lg={9}>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="map"
              id="map"
            >
              <Typography variant="h4" ml={2}>
                Map
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <MapContainer>
                <DashboardMap
                  map={map}
                  setMap={setMap}
                  data={filteredData}
                  isLoading={isLoading}
                  error={error}
                  setCurrentSelectedPoint={setCurrentSelectedPoint}
                  radioValue={radioValue}
                  currentlyPaintedPointRef={currentlyPaintedPointRef}
                  coordinatesContainerRef={coordinatesContainerRef}
                  longRef={longRef}
                  latRef={latRef}
                  eleRef={eleRef}
                />
              </MapContainer>
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={12} sm={5} md={4} lg={3}>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="map"
              id="map"
            >
              <Typography variant="h4" ml={2}>
                Filters
              </Typography>
            </AccordionSummary>
            <AccordionDetails style={{ display: "block" }}>
              <List disablePadding>
                <RadioGroup
                  aria-label="data"
                  name="data"
                  value={radioValue}
                  onChange={handleRadioChange}
                >
                  <SidebarSection>Data Selection</SidebarSection>
                  <Grid container>
                    <Grid item xs={6} sm={12}>
                      <ListItem>
                        <FormControlLabel
                          value="all"
                          control={<Radio />}
                          label={radioLabels["all"]}
                        />
                      </ListItem>
                    </Grid>
                    <Grid item xs={6} sm={12}>
                      <ListItem>
                        <FormControlLabel
                          value="has_production"
                          control={<Radio />}
                          label={radioLabels["has_production"]}
                        />
                      </ListItem>
                    </Grid>
                  </Grid>
                  <Grid container>
                    <Grid item xs={6} sm={12}>
                      <ListItem>
                        <FormControlLabel
                          value="has_waterlevels"
                          control={<Radio />}
                          label={radioLabels["has_waterlevels"]}
                        />
                      </ListItem>
                    </Grid>
                    <Grid item xs={6} sm={12}>
                      <ListItem>
                        <FormControlLabel
                          value="has_wqdata"
                          control={<Radio />}
                          label={radioLabels["has_wqdata"]}
                        />
                      </ListItem>
                    </Grid>
                    <Grid item xs={6} sm={12}>
                      <ListItem>
                        <FormControlLabel
                          value="search"
                          control={<Radio />}
                          label={radioLabels["search"]}
                        />
                      </ListItem>
                    </Grid>
                  </Grid>
                </RadioGroup>
                <SidebarSection>Date Range</SidebarSection>
                <ListItem>
                  <DatePicker
                    label="Start Date"
                    name="startDate"
                    selectedDate={filterValues.startDate}
                    setSelectedDate={changeFilterValues}
                    checked={filterValues.checked}
                  />
                </ListItem>
                <ListItem>
                  <DatePicker
                    label="End Date"
                    name="endDate"
                    selectedDate={filterValues.endDate}
                    setSelectedDate={changeFilterValues}
                    checked={filterValues.checked}
                  />
                </ListItem>
                <SidebarSection>Quick Set</SidebarSection>
                <Grid container>
                  <Grid item xs={6} sm={12}>
                    <ListItem>
                      <Button
                        size="small"
                        style={{ width: "100%" }}
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          changeFilterValues("startDate", null);
                          changeFilterValues("endDate", null);
                        }}
                      >
                        Period of Record
                      </Button>
                    </ListItem>
                  </Grid>
                  <Grid item xs={6} sm={12}>
                    <ListItem
                      style={{
                        alignItems: "stretch",
                        height: "100%",
                      }}
                    >
                      <Button
                        size="small"
                        style={{ width: "100%" }}
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                          changeFilterValues("startDate", firstOfYear);
                          changeFilterValues("endDate", lastOfYear);
                        }}
                      >
                        Current Year
                      </Button>
                    </ListItem>
                  </Grid>
                </Grid>
              </List>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
      {radioValue !== "search" && (
        <>
          {Boolean(filteredMutatedGraphData) ? (
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <div ref={divSaveRef}>
                  <Accordion defaultExpanded>
                    <AccordionSummary
                      expandIcon={
                        <ExpandMoreIcon data-html2canvas-ignore="true" />
                      }
                      aria-controls="time-series"
                      id="time-series"
                    >
                      <TitleContainer>
                        {formatTableTitle(
                          currentTableLabel,
                          radioLabels[radioValue]
                        )}
                      </TitleContainer>
                    </AccordionSummary>
                    <Panel>
                      <AccordionDetails>
                        <TimeseriesContainer>
                          <span data-html2canvas-ignore="true">
                            <Grid container pb={2}>
                              <Grid
                                item
                                style={{
                                  flexGrow: 1,
                                  maxWidth: "calc(100% - 110px)",
                                  display: "flex",
                                  flexDirection:
                                    radioValue === "has_waterlevels"
                                      ? "row"
                                      : "column",
                                  justifyContent:
                                    radioValue === "has_waterlevels"
                                      ? "start"
                                      : "center",
                                  alignItems:
                                    radioValue === "has_waterlevels"
                                      ? "center"
                                      : "start",
                                }}
                              >
                                {radioValue === "has_wqdata" &&
                                  wQparameterOptions && (
                                    <>
                                      <SidebarSection ml={-3}>
                                        Parameters
                                      </SidebarSection>
                                      <ListItem
                                        style={{
                                          paddingLeft: 0,
                                          paddingRight: 0,
                                        }}
                                      >
                                        <OptionsPicker
                                          selectedOption={selectedWQParameter}
                                          setSelectedOption={
                                            setSelectedWQParameter
                                          }
                                          options={wQparameterOptions}
                                          label="Water Quality Parameters"
                                        />
                                      </ListItem>
                                    </>
                                  )}
                                {radioValue === "has_production" &&
                                  isGraphRefCurrent && (
                                    <>
                                      <Button
                                        size="small"
                                        style={{ width: "130px" }}
                                        variant="contained"
                                        color="primary"
                                        onClick={
                                          handleToggleProductionUnitsChange
                                        }
                                      >
                                        Switch Units
                                      </Button>
                                    </>
                                  )}
                                {radioValue === "has_waterlevels" &&
                                  isGraphRefCurrent && (
                                    <>
                                      <Button
                                        size="small"
                                        style={{
                                          width: "200px",
                                          marginRight: "20px",
                                        }}
                                        color="primary"
                                        variant="contained"
                                        onClick={() =>
                                          handleToggleAnnotation(
                                            "Screening Interval"
                                          )
                                        }
                                        disabled={
                                          currentTableLabel?.screen_bottom_depth_ft ===
                                            null ||
                                          currentTableLabel?.screen_bottom_depth_ft ===
                                            null
                                        }
                                      >
                                        Toggle Screening Interval
                                      </Button>
                                      <Button
                                        size="small"
                                        style={{ width: "200px" }}
                                        color="primary"
                                        variant="contained"
                                        onClick={() =>
                                          handleToggleAnnotation(
                                            "Geologic Formations"
                                          )
                                        }
                                      >
                                        Toggle Geologic Formations
                                      </Button>
                                    </>
                                  )}
                              </Grid>
                              <Grid
                                item
                                style={{
                                  display: "flex",
                                  alignItems: "flex-end",
                                }}
                                mb={1}
                              >
                                <ExportDataButton
                                  title="cuwcd_well_number"
                                  data={currentSelectedTimeseriesData}
                                  filterValues={filterValues}
                                  parameter={selectedWQParameter}
                                />
                                <SaveRefButton
                                  data-html2canvas-ignore
                                  ref={divSaveRef}
                                  title={currentSelectedPoint}
                                />
                              </Grid>
                            </Grid>
                          </span>
                          <TimeseriesWrapper
                            style={
                              radioValue === "has_wqdata"
                                ? { height: "calc(100% - 118px)" }
                                : radioValue === "has_production"
                                ? { height: "calc(100% - 58px)" }
                                : null
                            }
                          >
                            <TimeseriesLineChart
                              data={filteredMutatedGraphData}
                              error={error}
                              isLoading={isLoading}
                              yLLabel={
                                radioValue === "has_waterlevels"
                                  ? "Water Level (Feet Below Ground Level)"
                                  : radioValue === "has_production"
                                  ? productionUnitsLabels.yLLabel
                                  : `${filteredMutatedGraphData?.parameter} (${filteredMutatedGraphData?.units})`
                              }
                              yRLLabel={
                                radioValue === "has_production" &&
                                productionUnitsLabels.yRLabel
                              }
                              reverseLegend={false}
                              yLReverse={radioValue === "has_waterlevels"}
                              ref={graphSaveRef}
                              filterValues={filterValues}
                              type={
                                radioValue === "has_production"
                                  ? "bar"
                                  : "scatter"
                              }
                              displayLegend={radioValue === "has_production"}
                              setIsGraphRefCurrent={setIsGraphRefCurrent}
                              stacked={true}
                              xLabelUnit={
                                radioValue === "has_production"
                                  ? "month"
                                  : "day"
                              }
                              maxTicksX={12}
                              maxTicksYL={6}
                              maxTicksYR={5}
                              align={
                                radioValue === "has_production"
                                  ? "start"
                                  : "center"
                              }
                              annotatedLines={annotatedLines}
                              beginAtZero={radioValue === "has_waterlevels"}
                            />
                          </TimeseriesWrapper>
                        </TimeseriesContainer>
                      </AccordionDetails>
                    </Panel>
                  </Accordion>
                </div>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Card>
                  <CardHeader
                    title={
                      radioValue === "all"
                        ? "Filter Data and Click a Point on the Map to View Corresponding Summary"
                        : `Select a Point on the Map to View ${radioLabels[radioValue]} Summary`
                    }
                  />
                  {radioValue === "has_wqdata" && wQparameterOptions && (
                    <Box mr={2} ml={2}>
                      <SidebarSection>Parameters</SidebarSection>
                      <ListItem>
                        <OptionsPicker
                          selectedOption={selectedWQParameter}
                          setSelectedOption={setSelectedWQParameter}
                          options={wQparameterOptions}
                          label="Water Quality Parameters"
                        />
                      </ListItem>
                    </Box>
                  )}
                </Card>
              </Grid>
            </Grid>
          )}

          <Grid container spacing={6}>
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="table-content"
                  id="table-header"
                >
                  <Typography variant="h4" ml={2}>
                    Search Wells
                  </Typography>
                </AccordionSummary>
                <Panel>
                  <AccordionDetails>
                    <TableWrapper>
                      <Table
                        pageSize={10}
                        isLoading={isLoading}
                        label="Search Well Table"
                        columns={tableColumns}
                        data={filteredData}
                        height="350px"
                        actions={[
                          (rowData) => ({
                            icon: "bar_chart",
                            tooltip: "Production",
                            disabled: !rowData.has_production,
                            onClick: (event, rowData) => {
                              setRadioValue("has_production");
                              setCurrentSelectedPoint(
                                rowData.cuwcd_well_number
                              );
                              setCurrentSelectedTimeseriesData(null);
                              handlePointInteractions(rowData);
                            },
                          }),
                          (rowData) => ({
                            icon: "water",
                            tooltip: "Water Levels",
                            disabled: !rowData.has_waterlevels,
                            onClick: (event, rowData) => {
                              setRadioValue("has_waterlevels");
                              setCurrentSelectedPoint(
                                rowData.cuwcd_well_number
                              );
                              setCurrentSelectedTimeseriesData(null);
                              handlePointInteractions(rowData);
                            },
                          }),
                          (rowData) => ({
                            icon: "bloodtype",
                            tooltip: "Water Quality",
                            disabled: !rowData.has_wqdata,
                            onClick: (event, rowData) => {
                              setRadioValue("has_wqdata");
                              setCurrentSelectedPoint(
                                rowData.cuwcd_well_number
                              );
                              setCurrentSelectedTimeseriesData(null);
                              handlePointInteractions(rowData);
                            },
                          }),
                          (rowData) =>
                            !currentUser.isUser && {
                              icon: () => {
                                return (
                                  <Link
                                    component={NavLink}
                                    exact
                                    to={"/models/dm-wells/" + rowData.id}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                  >
                                    <Edit />
                                  </Link>
                                );
                              },
                              tooltip: "Edit Well",
                            },
                          () => ({
                            icon: "near_me",
                            tooltip: "Fly to on Map",
                            onClick: (event, rowData) => {
                              handlePointInteractions(rowData);
                            },
                          }),
                        ]}
                      />
                    </TableWrapper>
                  </AccordionDetails>
                </Panel>
              </Accordion>
            </Grid>
          </Grid>
        </>
      )}
    </React.Fragment>
  );
}

export default Default;
