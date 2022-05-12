import React, { useEffect, useRef, useState } from "react";
import styled, { ThemeProvider } from "styled-components/macro";
import { NavLink } from "react-router-dom";

import { Helmet } from "react-helmet-async";

import {
  Accordion,
  AccordionDetails,
  Box,
  Breadcrumbs as MuiBreadcrumbs,
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
import { useQuery } from "react-query";
import { findRawRecords } from "../../../services/crudService";
import { onPointClickSetCoordinateRefs } from "../../../utils/map";
import { jssPreset, StylesProvider } from "@material-ui/core/styles";
import useService from "../../../hooks/useService";
import { useApp } from "../../../AppProvider";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Table from "../../../components/Table";
import axios from "axios";
import TimeseriesLineChart from "../../../components/graphs/TimeseriesLineChart";
import {
  lineColors,
  renderStatusChip,
  firstOfYear,
  lastOfYear,
  filterDataForWellOwner,
} from "../../../utils";
import SaveRefButton from "../../../components/graphs/SaveRefButton";
import ExportDataButton from "../../../components/graphs/ExportDataButton";
import Link from "@material-ui/core/Link";
import { Edit } from "@material-ui/icons";
import mapboxgl from "mapbox-gl";
import DatePicker from "../../../components/pickers/DatePicker";
import { customSecondary } from "../../../theme/variants";
import Button from "@material-ui/core/Button";
import DashboardMap from "../../../components/map/DashboardMap";
import ReactDOM from "react-dom";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/styles";
import createTheme from "../../../theme";
import MainPopup from "../../../components/map/components/MainPopup";
import { create } from "jss";
import { useSelector } from "react-redux";
import WaterLevels from "./WaterLevels";

const jss = create({
  ...jssPreset(),
  insertionPoint: document.getElementById("jss-insertion-point"),
});

const Divider = styled(MuiDivider)(spacing);

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);

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
  height: calc(458px);
  width: 100%;
`;

const TimeseriesContainer = styled.div`
  height: calc(600px - 146px);
  overflow-y: auto;
  width: 100%;
`;

const TimeseriesWrapper = styled.div`
  height: calc(100% - 58px);
  width: 100%;
`;

const Grid = styled(MuiGrid)(spacing);

function NewWaterLevels() {
  const theme = useSelector((state) => state.themeReducer);
  const { getAccessTokenSilently } = useAuth0();
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
    startDate: null,
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
    has_waterlevels: "Water Levels",
  };

  const handleRadioChange = (event) => {
    setRadioValue(event.target.value);
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
    setCurrentSelectedEditTableData(null);
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
    ["UiListWells", currentUser],
    async () => {
      if (!currentUser) return;
      try {
        const response = await service([findRawRecords, ["UiListWells"]]);
        let userData = [...response];
        if (currentUser.isUser) {
          userData = filterDataForWellOwner(userData, currentUser);
        }
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
  const [currentSelectedEditTableData, setCurrentSelectedEditTableData] =
    useState(null);

  useEffect(() => {
    if (currentSelectedPoint) {
      async function send() {
        try {
          const token = await getAccessTokenSilently();
          const headers = { Authorization: `Bearer ${token}` };

          const { data: graphResults } = await axios.post(
            `${process.env.REACT_APP_ENDPOINT}/api/graph-depthtowater/${currentSelectedPoint}`,
            {
              cuwcd_well_number: currentSelectedPoint,
            },
            { headers }
          );

          if (graphResults.length) {
            setCurrentSelectedTimeseriesData(graphResults);
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
  }, [currentSelectedPoint, currentSelectedEditTableData]); // eslint-disable-line

  const [unfilteredEditTableResults, setunfilteredEditTableResults] =
    useState(null);
  useEffect(() => {
    if (currentSelectedPoint) {
      async function send() {
        try {
          const token = await getAccessTokenSilently();
          const headers = { Authorization: `Bearer ${token}` };

          const { data: editTableResults } = await axios.post(
            `${process.env.REACT_APP_ENDPOINT}/api/dm-depth-to-waters/${currentSelectedPoint}`,
            {
              cuwcd_well_number: currentSelectedPoint,
            },
            { headers }
          );
          setunfilteredEditTableResults(editTableResults);

          if (editTableResults?.length > 0) {
            const dateFilteredEditTableResults = editTableResults.filter(
              (item) =>
                new Date(item.collected_datetime) >= filterValues.startDate &&
                new Date(item.collected_datetime) <=
                  (filterValues.endDate || new Date(3000, 0, 1))
            );
            setCurrentSelectedEditTableData(dateFilteredEditTableResults);
          } else {
            setCurrentSelectedEditTableData(null);
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

  useEffect(() => {
    if (currentSelectedPoint) {
      const dateFilteredEditTableResults = unfilteredEditTableResults.filter(
        (item) =>
          new Date(item.collected_datetime) >= filterValues.startDate &&
          new Date(item.collected_datetime) <=
            (filterValues.endDate || new Date(3000, 0, 1))
      );
      setCurrentSelectedEditTableData(dateFilteredEditTableResults);
    }
  }, [filterValues]); // eslint-disable-line

  useEffect(() => {
    if (currentSelectedPoint) {
      setCurrentTableLabel(
        filteredData.filter(
          (item) => item.cuwcd_well_number === currentSelectedPoint
        )[0]
      );
    }
  }, [currentSelectedPoint, filteredData]);

  const [annotatedLines, setAnnotatedLines] = useState({});
  const [filteredMutatedGraphData, setFilteredMutatedGraphData] = useState({});
  useEffect(() => {
    if (
      currentSelectedTimeseriesData?.length &&
      currentTableLabel &&
      geologicFormations
    ) {
      const currentNdxGeologicFormations = geologicFormations.filter(
        (location) => location.well_ndx === currentTableLabel.well_ndx
      )[0];

      //mutate data for chartJS to use
      let graphData;
      if (radioValue === "has_waterlevels") {
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
              fill: true,
              maxBarThickness: 25,
            },
          ],
        };
      }
      const annotations = {
        annotations: {
          ...(currentNdxGeologicFormations.top_austin !== null && {
            topAustinLine: {
              type: "line",
              yScaleID: "yL",
              yMin: currentNdxGeologicFormations.top_austin,
              yMax: currentNdxGeologicFormations.top_austin,
              borderColor: "#008B00",
              borderWidth: 3,
              display: false,
              label: {
                position: "90%",
                enabled: true,
                backgroundColor: "#008B00",
                borderColor: "#008B00",
                borderRadius: 10,
                borderWidth: 2,
                color: "white",
                content: () =>
                  "Austin: " + currentNdxGeologicFormations.top_austin + " ft",
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
              borderColor: "#8B7355",
              borderWidth: 3,
              display: false,
              label: {
                position: "80%",
                enabled: true,
                backgroundColor: "#8B7355",
                borderColor: "#8B7355",
                borderRadius: 10,
                borderWidth: 2,
                color: "white",
                content: () =>
                  "Del Rio: " + currentNdxGeologicFormations.top_delrio + " ft",
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
              borderColor: "#A9A9A9",
              borderWidth: 3,
              display: false,
              label: {
                position: "70%",
                enabled: true,
                backgroundColor: "#A9A9A9",
                borderColor: "#A9A9A9",
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
              borderColor: "#CD8500",
              borderWidth: 3,
              display: false,
              label: {
                position: "60%",
                enabled: true,
                backgroundColor: "#CD8500",
                borderColor: "#CD8500",
                borderRadius: 10,
                borderWidth: 2,
                color: "white",
                content: () =>
                  "Walnut: " + currentNdxGeologicFormations.top_walnut + " ft",
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
              borderColor: "#6E8B3D",
              borderWidth: 3,
              display: false,
              label: {
                position: "50%",
                enabled: true,
                backgroundColor: "#6E8B3D",
                borderColor: "#6E8B3D",
                borderRadius: 10,
                borderWidth: 2,
                color: "white",
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
              borderColor: "#8B3A3A",
              borderWidth: 3,
              display: false,
              label: {
                position: "40%",
                enabled: true,
                backgroundColor: "#8B3A3A",
                borderColor: "#8B3A3A",
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
              borderColor: "#9370DB",
              borderWidth: 3,
              display: false,
              label: {
                position: "30%",
                enabled: true,
                backgroundColor: "#9370DB",
                borderColor: "#9370DB",
                borderRadius: 10,
                borderWidth: 2,
                color: "white",
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
              borderColor: lineColors.cyan,
              borderWidth: 3,
              display: false,
              label: {
                position: "20%",
                enabled: true,
                backgroundColor: lineColors.cyan,
                borderColor: lineColors.cyan,
                borderRadius: 10,
                borderWidth: 2,
                color: "black",
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

      setFilteredMutatedGraphData(graphData);
    } else {
      setFilteredMutatedGraphData(null);
    }
  }, [currentSelectedTimeseriesData, currentTableLabel, geologicFormations]); // eslint-disable-line

  const [isGraphRefCurrent, setIsGraphRefCurrent] = useState(false);

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

  const searchTableColumns = [
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

  const formatTableTitle = (location, graphType) => {
    if (!location) return null;
    if (graphType === "Water Levels") {
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
    } else {
      return null;
    }
  };

  return (
    <React.Fragment>
      <Helmet title="Well Water Levels" />
      <Typography variant="h3" gutterBottom display="inline">
        Well Water Levels Data
      </Typography>

      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NavLink} exact to="/dashboard">
          Dashboard
        </Link>
        <Typography>Well Water Levels</Typography>
      </Breadcrumbs>

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
                  setRadioValue={setRadioValue}
                  defaultFilterValue={
                    currentUser?.isUser ? "all" : "has_waterlevels"
                  }
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
                          value="has_waterlevels"
                          control={<Radio />}
                          label={radioLabels["has_waterlevels"]}
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

      {Boolean(currentSelectedEditTableData) ? (
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="table-content"
                id="table-header"
              >
                <Typography variant="h4" ml={2}>
                  Well Water Levels Data
                </Typography>
              </AccordionSummary>
              {currentSelectedEditTableData && (
                <Panel>
                  <AccordionDetails>
                    <div style={{ width: "100%" }}>
                      <WaterLevels
                        data={currentSelectedEditTableData}
                        wellData={filteredData}
                        currentSelectedPoint={currentSelectedPoint}
                      />
                    </div>
                  </AccordionDetails>
                </Panel>
              )}
            </Accordion>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={
                  radioValue === "all"
                    ? "Filter Data and Click a Point on the Map to View Corresponding Well Water Levels Data"
                    : `Select a Point on the Map to View Corresponding Well Water Levels Data`
                }
              />
            </Card>
          </Grid>
        </Grid>
      )}

      {Boolean(filteredMutatedGraphData) ? (
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <div ref={divSaveRef}>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon data-html2canvas-ignore="true" />}
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
                              flexDirection: "row",
                              justifyContent: "start",
                              alignItems: "center",
                            }}
                          >
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
                            style={{ display: "flex", alignItems: "flex-end" }}
                            mb={1}
                          >
                            <ExportDataButton
                              title="cuwcd_well_number"
                              data={currentSelectedTimeseriesData}
                              filterValues={filterValues}
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
                          radioValue === "has_waterlevels"
                            ? { height: "calc(100% - 58px)" }
                            : null
                        }
                      >
                        <TimeseriesLineChart
                          data={filteredMutatedGraphData}
                          error={error}
                          isLoading={isLoading}
                          yLLabel="Water Level (Feet Below Ground Level)"
                          reverseLegend={false}
                          yLReverse={true}
                          ref={graphSaveRef}
                          setIsGraphRefCurrent={setIsGraphRefCurrent}
                          filterValues={filterValues}
                          type="scatter"
                          displayLegend={false}
                          stacked={false}
                          xLabelUnit="day"
                          maxTicksX={12}
                          maxTicksYL={6}
                          maxTicksYR={5}
                          align="center"
                          annotatedLines={annotatedLines}
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
                    columns={searchTableColumns}
                    data={filteredData}
                    height="350px"
                    actions={[
                      (rowData) => ({
                        icon: "water",
                        tooltip: "Water Levels",
                        disabled: !rowData.has_waterlevels,
                        onClick: (event, rowData) => {
                          setRadioValue("has_waterlevels");
                          setCurrentSelectedPoint(rowData.cuwcd_well_number);
                          setCurrentSelectedTimeseriesData(null);
                          setCurrentSelectedEditTableData(null);
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
    </React.Fragment>
  );
}

export default NewWaterLevels;
