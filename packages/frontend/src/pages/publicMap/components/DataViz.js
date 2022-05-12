import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  lighten,
  Grid as MuiGrid,
  Accordion,
  AccordionDetails,
  Typography as MuiTypography,
  ListItem,
  Card,
  CardHeader,
  Tooltip,
  Paper,
} from "@material-ui/core";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import { spacing } from "@material-ui/system";
import { firstOfYear, lastOfYear, lineColors } from "../../../utils";
import { useQuery } from "react-query";
import DatePicker from "../../../components/pickers/DatePicker";
import Panel from "../../../components/panels/Panel";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import OptionsPicker from "../../../components/pickers/OptionsPicker";
import Button from "@material-ui/core/Button";
import ExportDataButton from "../../../components/graphs/ExportDataButton";
import SaveRefButton from "../../../components/graphs/SaveRefButton";
import TimeseriesLineChart from "../../../components/graphs/TimeseriesLineChart";
import { customSecondary } from "../../../theme/variants";
import IconButton from "@material-ui/core/IconButton";
import { Close } from "@material-ui/icons";

const fadeIn = keyframes`
  from {
    transform: scale(.25);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    transform: scale(1);
    opacity: 0;
  }

  to {
    transform: scale(.25);
    opacity: 1;
  }
`;

const OuterContainer = styled(Box)`
  margin-left: 49px;
  bottom: 30px;
  z-index: 3;
  position: absolute;
  max-height: 400px;
  width: calc(100% - 49px - 49px);
  visibility: ${({ open }) => (open ? "visible" : "hidden")};
  animation: ${({ open }) => (open ? fadeIn : fadeOut)} 0.5s linear;
  transition: visibility 0.5s linear;
`;

const Viz = styled.div`
  height: 400px;
  max-width: 100%;
`;

const TimeseriesContainer = styled.div`
  height: calc(500px - 146px);
  width: 100%;
`;

const TimeseriesWrapper = styled.div`
  height: calc(100% - 58px);
  width: 100%;
`;

const TitleContainer = styled.span`
  width: 100%;
`;

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

const CloseContainer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
`;

const Grid = styled(MuiGrid)(spacing);
const Typography = styled(MuiTypography)(spacing);

const DataViz = ({
  open = false,
  dataVizWellNumber,
  dataVizGraphType,
  onClose,
  wells,
}) => {
  const divSaveRef = useRef(null);
  const graphSaveRef = useRef(null);

  //date filter defaults
  const defaultFilterValues = {
    // startDate: lastOfJanuary,
    startDate: null,
    endDate: new Date(),
  };

  const [currentTableLabel, setCurrentTableLabel] = useState();

  const [filterValues, setFilterValues] = useState(defaultFilterValues);
  const changeFilterValues = (name, value) => {
    setFilterValues((prevState) => {
      let newFilterValues = { ...prevState };
      newFilterValues[name] = value;
      return newFilterValues;
    });
  };

  const graphLabels = {
    count_production: "Well Production",
    count_waterlevels: "Water Levels",
    count_wqdata: "Water Quality",
  };

  const [currentSelectedTimeseriesData, setCurrentSelectedTimeseriesData] =
    useState(null);
  useEffect(() => {
    if (dataVizWellNumber && dataVizGraphType) {
      async function send() {
        try {
          const endpoint = {
            count_production: "graph-wellproductions",
            count_waterlevels: "graph-depthtowater",
            count_wqdata: "graph-waterquality",
          };

          const { data: results } = await axios.post(
            `${process.env.REACT_APP_ENDPOINT}/api/${endpoint[dataVizGraphType]}/${dataVizWellNumber}`,
            {
              cuwcd_well_number: dataVizWellNumber,
            }
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
  }, [dataVizWellNumber, dataVizGraphType]); // eslint-disable-line

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
    ["ListWQParameters"],
    async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_ENDPOINT}/api/list-wq-parameters`
        );

        return data.map((parameter) => ({
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
      if (dataVizGraphType === "count_production") {
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
      } else if (dataVizGraphType === "count_waterlevels") {
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
              fill: true,
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
                borderColor: lineColors.red,
                borderWidth: 3,
                display: false,
                label: {
                  position: "90%",
                  enabled: true,
                  backgroundColor: lineColors.red,
                  borderColor: lineColors.red,
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "white",
                  content: () =>
                    "Austin: " + currentNdxGeologicFormations.top_austin,
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
                borderColor: lineColors.green,
                borderWidth: 3,
                display: false,
                label: {
                  position: "80%",
                  enabled: true,
                  backgroundColor: lineColors.green,
                  borderColor: lineColors.green,
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "white",
                  content: () =>
                    "Delrio: " + currentNdxGeologicFormations.top_delrio,
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
                borderColor: lineColors.orange,
                borderWidth: 3,
                display: false,
                label: {
                  position: "70%",
                  enabled: true,
                  backgroundColor: lineColors.orange,
                  borderColor: lineColors.orange,
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "white",
                  content: () =>
                    "Edwards: " + currentNdxGeologicFormations.top_edwards,
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
                borderColor: lineColors.blue,
                borderWidth: 3,
                display: false,
                label: {
                  position: "60%",
                  enabled: true,
                  backgroundColor: lineColors.blue,
                  borderColor: lineColors.blue,
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "white",
                  content: () =>
                    "Glen Rose: " + currentNdxGeologicFormations.top_glen_rose,
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
                borderColor: lineColors.purple,
                borderWidth: 3,
                display: false,
                label: {
                  position: "50%",
                  enabled: true,
                  backgroundColor: lineColors.purple,
                  borderColor: lineColors.purple,
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "white",
                  content: () =>
                    "Hensell: " + currentNdxGeologicFormations.top_hensell,
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
                  position: "240%",
                  enabled: true,
                  backgroundColor: lineColors.cyan,
                  borderColor: lineColors.cyan,
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "black",
                  content: () =>
                    "Hosston: " + currentNdxGeologicFormations.top_hosston,
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
                borderColor: lineColors.pink,
                borderWidth: 3,
                display: false,
                label: {
                  position: "30%",
                  enabled: true,
                  backgroundColor: lineColors.pink,
                  borderColor: lineColors.pink,
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "white",
                  content: () =>
                    "Pearsall: " + currentNdxGeologicFormations.top_pearsall,
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
                borderColor: lineColors.yellow,
                borderWidth: 3,
                display: false,
                label: {
                  position: "20%",
                  enabled: true,
                  backgroundColor: lineColors.yellow,
                  borderColor: lineColors.yellow,
                  borderRadius: 10,
                  borderWidth: 2,
                  color: "black",
                  content: () =>
                    "Walnut: " + currentNdxGeologicFormations.top_walnut,
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
                    "Top of Screen: " + currentTableLabel.screen_top_depth_ft,
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
                    currentTableLabel.screen_bottom_depth_ft,
                  rotation: "auto",
                },
              },
            }),
          },
        };

        setAnnotatedLines(annotations);
      } else if (dataVizGraphType === "count_wqdata") {
        const parameterFilteredData = currentSelectedTimeseriesData.filter(
          (item) => item.wq_parameter_ndx === selectedWQParameter
        );

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
    }
  }, [
    currentSelectedTimeseriesData,
    selectedWQParameter,
    dataVizGraphType,
    currentTableLabel,
    geologicFormations,
  ]);

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

  const waterQualityReport = {
    2: "E. coli?",
    1: "A family of bacteria common in soils, plants and animals. The presence/absence test only indicates if coliform bacteria are present. No distinction is made on the origin of the coliform bacteria. A positive result warrants further analysis, an inspection of the well integrity and well/water system disinfection. Coliform bacteria should not be present under the federal drinking water standard. Coliform Bacteria - A family of bacteria common in soils, plants and animals. The presence/absence test only indicates if coliform bacteria are present. No distinction is made on the origin of the coliform bacteria. A positive result warrants further analysis, an inspection of the well integrity and well/water system disinfection. Coliform bacteria should not be present under the federal drinking water standard.",
    6: "The pH of water is a measure of the concentration of hydrogen ions. pH is expressed on a scale from 1 to 14, with 1 being most acidic, 7 neutral and 14 being the most basic or alkaline. The pH of drinking water should be between 6.5 and 8.5 to meet the federal secondary drinking water standard.",
    3: "Conductivity measures the ability of water to conduct an electric current and is useful to quickly assess water quality. Conductivity increases with the number of dissolved ions in the water but is affected by temperature and the specific ions in solution. High conductivity or large changes may warrant further analysis. There is no EPA or TCEQ drinking water standard for conductivity.",
    4: "Total Dissolved Solids refers to dissolved minerals (ions) and is a good general indicator of water quality. The value reported for this parameter is calculated by the conductivity meter as a function of the conductivity value and may not account for all the factors affecting the Conductivity-TDS relationship. TDS values reported by CUWCD should be considered as “apparent”. The accuracy may range approximately +/- 25 percent from values reported by certified laboratories. The TCEQ secondary drinking water standard for TDS is 1000 mg/L. Water is considered fresh if TDS is 1000 mg/L or less.",
    5: "Salinity?",
    7: "Alkalinity does not refer to pH, but instead refers to the ability of water to resist change in pH and may be due to dissolved bicarbonates. Low water alkalinity may cause corrosion; high alkalinity may cause scale formation. There is no EPA or TCEQ drinking water standard for alkalinity.",
    8: '“Hard" water may be indicated by large amounts of soap required to form suds and scale deposits in pipes and water heaters. Hardness is caused by calcium, magnesium, manganese or iron in the form of bicarbonates, carbonates, sulfates or chlorides.',
    9: "Nitrate/Nitrite - Nitrate and Nitrite are of special concern to infants and can cause “blue baby” syndrome. The federal drinking water standard for nitrate is 10 mg/L. The federal drinking water standard for nitrite is 1 mg/L. Nitrate or nitrite may indicate an impact from sewage, fertilizer or animal waste.",
    10: "Nitrate/Nitrite - Nitrate and Nitrite are of special concern to infants and can cause “blue baby” syndrome. The federal drinking water standard for nitrate is 10 mg/L. The federal drinking water standard for nitrite is 1 mg/L. Nitrate or nitrite may indicate an impact from sewage, fertilizer or animal waste.",
    11: "Phosphates may indicate impact from laundering agents. Testing for phosphates provides a general indicator of water quality. There is no EPA or TCEQ drinking water standard for phosphate.",
    12: "Sulfate compounds are many of the dissolved salts found in groundwater. Sulfate can produce laxative effects, bad taste or smell. The TCEQ secondary drinking water standard for sulfate is 300 mg/L.",
    13: "Fluoride may occur naturally and is sometimes added to drinking water to promote strong teeth. Fluoride may stain children’s teeth. The federal drinking water standard for fluoride is 4.0 mg/L. Water Quality Assessment What are the parameters being assessed?",
  };

  const formatTableTitle = (location, graphType) => {
    if (!location) return null;
    if (graphType === "Well Production") {
      return (
        <>
          <Typography variant="h4" style={{ lineHeight: 1.3 }}>
            <strong>Reported Well Production for Well: </strong>
            {location.cuwcd_well_number ?? "NA"}
          </Typography>
        </>
      );
    } else if (graphType === "Water Levels") {
      return (
        <>
          <Typography variant="h4" style={{ lineHeight: 1.3 }}>
            <strong>Reported Water Levels for Well: </strong>
            {location.cuwcd_well_number ?? "NA"}
          </Typography>
        </>
      );
    } else if (graphType === "Water Quality") {
      return (
        <>
          <Typography variant="h4" style={{ lineHeight: 1.3 }}>
            <strong>
              Reported{" "}
              {
                wQparameterOptions.filter(
                  (item) => item.value === selectedWQParameter
                )[0].label
              }{" "}
              Measurements for Well:{" "}
            </strong>
            {location.cuwcd_well_number ?? "NA"}
          </Typography>
          <br />
          <Typography variant="subtitle1" style={{ lineHeight: 1.3 }}>
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

  useEffect(() => {
    if (dataVizWellNumber && currentSelectedTimeseriesData) {
      setCurrentTableLabel(
        wells.filter(
          (item) => item.properties.cuwcd_well_number === dataVizWellNumber
        )[0].properties
      );
    }
  }, [dataVizWellNumber, currentSelectedTimeseriesData, wells]);

  return (
    <OuterContainer
      bgcolor="#ffffff"
      boxShadow="0 0 0 2px rgba(0,0,0,.1)"
      borderRadius={4}
      open={open}
    >
      {/*<Box display="flex" alignItems="center">*/}
      {/*  <Box flexGrow={1}> </Box>*/}
      {/*  <Box>*/}
      {/*    <IconButton>*/}
      {/*      <Close />*/}
      {/*    </IconButton>*/}
      {/*  </Box>*/}
      {/*</Box>*/}

      <Viz>
        <Panel overflowY="scroll" overflowX="hidden">
          <CloseContainer>
            <IconButton size="small" onClick={onClose}>
              <Close />
            </IconButton>
          </CloseContainer>
          <>
            {Boolean(filteredMutatedGraphData) ? (
              <Grid container spacing={6}>
                <Grid item xs={12}>
                  <Paper ref={divSaveRef}>
                    <TitleContainer>
                      {formatTableTitle(
                        currentTableLabel,
                        graphLabels[dataVizGraphType]
                      )}
                    </TitleContainer>

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
                                dataVizGraphType === "count_waterlevels"
                                  ? "row"
                                  : "column",
                              justifyContent:
                                dataVizGraphType === "count_waterlevels"
                                  ? "start"
                                  : "center",
                              alignItems:
                                dataVizGraphType === "count_waterlevels"
                                  ? "center"
                                  : "start",
                            }}
                          >
                            {dataVizGraphType === "count_wqdata" &&
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
                                      setSelectedOption={setSelectedWQParameter}
                                      options={wQparameterOptions}
                                      label="Water Quality Parameters"
                                    />
                                  </ListItem>
                                </>
                              )}
                            {dataVizGraphType === "count_production" &&
                              isGraphRefCurrent && (
                                <>
                                  <Button
                                    size="small"
                                    style={{ width: "130px" }}
                                    variant="contained"
                                    color="primary"
                                    onClick={handleToggleProductionUnitsChange}
                                  >
                                    Switch Units
                                  </Button>
                                </>
                              )}
                            {dataVizGraphType === "count_waterlevels" &&
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
                              title={dataVizWellNumber}
                            />
                          </Grid>
                        </Grid>
                      </span>
                      <TimeseriesWrapper
                        style={
                          dataVizGraphType === "count_wqdata"
                            ? { height: "calc(100% - 118px)" }
                            : dataVizGraphType === "count_production"
                            ? { height: "calc(100% - 58px)" }
                            : null
                        }
                      >
                        <TimeseriesLineChart
                          data={filteredMutatedGraphData}
                          // error={error}
                          // isLoading={isLoading}
                          yLLabel={
                            dataVizGraphType === "count_waterlevels"
                              ? "Water Level (Feet Below Ground Level)"
                              : dataVizGraphType === "count_production"
                              ? productionUnitsLabels.yLLabel
                              : `${filteredMutatedGraphData?.parameter} (${filteredMutatedGraphData?.units})`
                          }
                          yRLLabel={
                            dataVizGraphType === "count_production" &&
                            productionUnitsLabels.yRLabel
                          }
                          reverseLegend={false}
                          yLReverse={dataVizGraphType === "count_waterlevels"}
                          ref={graphSaveRef}
                          filterValues={filterValues}
                          type={
                            dataVizGraphType === "count_production"
                              ? "bar"
                              : "scatter"
                          }
                          displayLegend={
                            dataVizGraphType === "count_production"
                          }
                          setIsGraphRefCurrent={setIsGraphRefCurrent}
                          stacked={true}
                          xLabelUnit={
                            dataVizGraphType === "count_production"
                              ? "month"
                              : "day"
                          }
                          maxTicksX={12}
                          maxTicksYL={6}
                          maxTicksYR={5}
                          align={
                            dataVizGraphType === "count_production"
                              ? "start"
                              : "center"
                          }
                          annotatedLines={annotatedLines}
                        />
                      </TimeseriesWrapper>
                    </TimeseriesContainer>
                  </Paper>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={6}>
                <Grid item xs={12}>
                  <Card>
                    <CardHeader title="Select a Point on the Map to View Graph" />
                    {dataVizGraphType === "count_wqdata" && wQparameterOptions && (
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
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="map"
                id="map"
              >
                <Typography variant="h4">Filters</Typography>
              </AccordionSummary>
              <AccordionDetails style={{ display: "block" }}>
                <Grid container spacing={6} alignItems="center">
                  <Grid item xs={12} sm={6} md={5}>
                    <DatePicker
                      label="Start Date"
                      name="startDate"
                      selectedDate={filterValues.startDate}
                      setSelectedDate={changeFilterValues}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={5}>
                    <DatePicker
                      label="End Date"
                      name="endDate"
                      selectedDate={filterValues.endDate}
                      setSelectedDate={changeFilterValues}
                    />
                  </Grid>

                  <Grid item xs={12} sm={12} md={2}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={6} md={12}>
                        <Tooltip title="Period of Record">
                          <Button
                            size="small"
                            style={{ width: "100%" }}
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                              changeFilterValues("startDate", null);
                              changeFilterValues("endDate", new Date());
                            }}
                          >
                            Record
                          </Button>
                        </Tooltip>
                      </Grid>
                      <Grid item xs={6} sm={6} md={12}>
                        <Tooltip title="Current Year" placement="bottom">
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
                            Year
                          </Button>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </>
        </Panel>
      </Viz>
    </OuterContainer>
  );
};

export default DataViz;
