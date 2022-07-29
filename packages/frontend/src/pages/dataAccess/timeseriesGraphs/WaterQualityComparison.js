import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { DatePicker, MultiSelect, Select } from "@lrewater/lre-react";
import {
  dateFormatter,
  extractDate,
  groupByValue,
  lineColors,
} from "../../../utils";
import Button from "@material-ui/core/Button";
import styled from "styled-components/macro";
import {
  Accordion,
  AccordionDetails,
  Breadcrumbs as MuiBreadcrumbs,
  Divider as MuiDivider,
  Grid as MuiGrid,
  lighten,
  Link,
  TextField,
  Typography as MuiTypography,
} from "@material-ui/core";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Panel from "../../../components/panels/Panel";
import SaveGraphButton from "../../../components/graphs/SaveGraphButton";
import { spacing } from "@material-ui/system";
import { Alert, Autocomplete } from "@material-ui/lab";
import TimeseriesComparisonMap from "../../../components/map/TimeseriesComparisonMap";
import Table from "../../../components/Table";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import TimeseriesLineChartCompare from "../../../components/graphs/TimeseriesLineChartCompare";
import moment from "moment";

const Grid = styled(MuiGrid)(spacing);
const Typography = styled(MuiTypography)(spacing);
const Divider = styled(MuiDivider)(spacing);
const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);

const TableWrapper = styled.div`
  overflow-y: auto;
  max-width: calc(100vw - ${(props) => props.theme.spacing(12)}px);
  height: calc(100%);
  width: 100%;
`;

const TimeseriesContainer = styled.div`
  height: 600px;
  // overflow-y: auto;
  width: 100%;
`;

const SubmitGrid = styled(Grid)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-right: 4px;
  margin-left: 4px;
  margin-top: 10px;
  width: 100%;
`;

const MapContainer = styled.div`
  height: 406px;
  width: 100%;
`;

const WaterQualityComparison = () => {
  const { getAccessTokenSilently } = useAuth0();
  const saveRef = useRef(null);

  const [filterValues, setFilterValues] = useState({
    aquifers: [],
    parameter: 2,
    wells: [],
    startDate: extractDate("10/1/2000"),
    endDate: extractDate(new Date()),
  });

  const [selectedWells, setSelectedWells] = useState([]);

  const { data: Aquifers } = useQuery(
    ["ui-list-aquifers-forwq"],
    async () => {
      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };

        const { data } = await axios.get(
          `${process.env.REACT_APP_ENDPOINT}/api/ui-list-aquifers-forwq`,
          { headers }
        );

        setFilterValues((prevState) => {
          let newValues = { ...prevState };
          const selectAllAquifers = data.map((aquifer) => aquifer.aquifer_ndx);
          newValues["aquifers"] = selectAllAquifers;
          return newValues;
        });

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

  const { data: Parameters } = useQuery(
    ["ui-list-wq-parameters"],
    async () => {
      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };

        const { data } = await axios.get(
          `${process.env.REACT_APP_ENDPOINT}/api/ui-list-wq-parameters`,
          { headers }
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

  const { data: Wells } = useQuery(
    ["ui-list-wells-to-aquifers-forwq"],
    async () => {
      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };

        const { data } = await axios.get(
          `${process.env.REACT_APP_ENDPOINT}/api/ui-list-wells-to-aquifers-forwq`,
          { headers }
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

  const filterWellsByParameter = (wells, parameter) => {
    return wells.filter((well) =>
      well.wq_parameter_ndx_array.includes(parameter)
    );
  };

  const filterWellsByAquifers = (wells, aquifers) => {
    return wells.filter((well) => aquifers.includes(well.aquifer_ndx));
  };

  const handleFilter = (event) => {
    const { name, value } = event.target;
    setFilterValues((prevState) => {
      let newValues = { ...prevState };

      if (name === "parameter") {
        setSelectedWells([]);
      }

      if (name === "aquifers") {
        setSelectedWells([]);
      }

      newValues[name] = value;

      return newValues;
    });
  };

  const { data, error, isFetching, refetch } = useQuery(
    ["ui-report-wq-timeseriesgraph-data"],
    async () => {
      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };

        const { data } = await axios.get(
          `${
            process.env.REACT_APP_ENDPOINT
          }/api/ui-report-wq-timeseriesgraph-data/${
            filterValues.parameter
          }/${selectedWells.map((well) => well.cuwcd_well_number)}/${
            filterValues.startDate
          }/${filterValues.endDate}`,
          { headers }
        );
        const groupedData = groupByValue(data, "cuwcd_well_number");

        return groupedData;
      } catch (err) {
        console.error(err);
      }
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );

  const [graphData, setGraphData] = useState({});
  useEffect(() => {
    if (data) {
      let count = -1;
      const graphData = {
        yLLabel: data?.length
          ? `${data[0][0]?.wq_parameter_name} (${data[0][0]?.unit_desc})`
          : null,
        datasets: [
          ...data.map((well) => {
            count++;
            return {
              data: well.map((item) => {
                return {
                  x: item.test_date,
                  y: item.wq_result_value,
                };
              }),
              yAxisID: "yL",
              units: well[0].unit_desc,
              pointStyle: "circle",
              borderWidth: 2,
              pointRadius: 7,
              pointHoverRadius: 9,
              label: well[0].cuwcd_well_number,
              borderColor: Object.values(lineColors)[count],
              backgroundColor: lighten(Object.values(lineColors)[count], 0.5),
            };
          }),
        ],
      };
      setGraphData(graphData);
    }
  }, [data]);

  const tableColumns = [
    { title: "Parameter Name", field: "wq_parameter_name" },
    { title: "Well Name", field: "cuwcd_well_number" },
    {
      title: "Result",
      field: "wq_result_value",
    },
    { title: "Units", field: "unit_desc" },
    {
      title: "Date",
      field: "test_date",
      render: (rowData) => {
        return dateFormatter(rowData.test_date, "MM/DD/YYYY");
      },
    },
    {
      title: "Time",
      field: "test_time",
      render: (rowData) => {
        return moment(rowData.test_time, "HH:mm").format("hh:mm A");
      },
    },
    { title: "Collected By", field: "collected_by" },
    { title: "Tested By", field: "tested_by" },
    {
      title: "Notes",
      field: "wq_sample_notes",
      cellStyle: {
        width: 500,
        minWidth: 500,
      },
    },
  ];

  return (
    <>
      <Helmet title="Time Series Comparisons" />
      <Typography variant="h3" gutterBottom display="inline">
        Time Series Comparisons
      </Typography>

      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NavLink} exact to="/dashboard">
          Dashboard
        </Link>
        <Typography>Time Series Comparisons</Typography>
      </Breadcrumbs>

      <Divider my={6} />

      <Grid container spacing={6}>
        {Wells && Aquifers && (
          <Grid item xs={12}>
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
                  <TimeseriesComparisonMap
                    selectedAquiferWells={filterWellsByAquifers(
                      Wells,
                      filterValues.aquifers
                    ).map((well) => well.cuwcd_well_number)}
                    selectedWells={selectedWells.map(
                      (well) => well.cuwcd_well_number
                    )}
                  />
                </MapContainer>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}

        {Parameters && Wells && Aquifers && (
          <>
            <Grid item xs={12}>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="time-series"
                  id="time-series"
                >
                  <Typography variant="h4" ml={2}>
                    Filter Controls
                  </Typography>
                </AccordionSummary>
                <Panel>
                  <AccordionDetails>
                    <Grid container>
                      <Grid item xs={12}>
                        <MultiSelect
                          name="aquifers"
                          label="Aquifers"
                          variant="outlined"
                          valueField="aquifer_ndx"
                          displayField="aquifer_name"
                          outlineColor="primary"
                          labelColor="primary"
                          margin="normal"
                          data={Aquifers}
                          value={filterValues.aquifers}
                          onChange={handleFilter}
                          width="calc(100% - 162px - 162px - 188px)"
                        />
                        <Select
                          name="parameter"
                          label="Parameter"
                          variant="outlined"
                          valueField="wq_parameter_ndx"
                          displayField="wq_parameter_name"
                          outlineColor="primary"
                          labelColor="primary"
                          margin="normal"
                          data={Parameters}
                          value={filterValues.parameter}
                          onChange={handleFilter}
                          width={180}
                        />
                        <DatePicker
                          name="startDate"
                          label="Start Date"
                          variant="outlined"
                          outlineColor="primary"
                          labelColor="primary"
                          value={filterValues.startDate}
                          onChange={handleFilter}
                          width={150}
                        />
                        <DatePicker
                          name="endDate"
                          label="End Date"
                          variant="outlined"
                          outlineColor="primary"
                          labelColor="primary"
                          value={filterValues.endDate}
                          onChange={handleFilter}
                          width={150}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Autocomplete
                          multiple
                          disableCloseOnSelect
                          style={{
                            display: "inline-flex",
                            margin: "10px 0 10px 4px",
                            width: "calc(100% - 8px)",
                          }}
                          options={filterWellsByParameter(
                            filterWellsByAquifers(Wells, filterValues.aquifers),
                            filterValues.parameter
                          )}
                          getOptionLabel={(option) =>
                            option.cuwcd_well_number + " / " + option?.well_name
                          }
                          id="wells"
                          name="wells"
                          value={selectedWells}
                          getOptionDisabled={() => selectedWells.length > 21}
                          onChange={(event, newValue) => {
                            setSelectedWells(newValue);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              color="primary"
                              label="Wells"
                              variant="standard"
                            />
                          )}
                        />
                      </Grid>
                      <SubmitGrid item container>
                        <Grid item style={{ width: "calc(100% - 162px)" }}>
                          {selectedWells?.length > 21 && (
                            <Alert severity="warning">
                              Maximum wells selected
                            </Alert>
                          )}
                          {!data?.length && (
                            <Alert severity="info">
                              Select your inputs and click the red 'Submit'
                              button to load an interactive time series plot for
                              parameter comparison across multiple locations.
                            </Alert>
                          )}

                          {data?.length === 0 && (
                            <Alert severity="warning">No data available</Alert>
                          )}
                        </Grid>
                        <Grid item>
                          {data?.length > 0 && (
                            <SaveGraphButton
                              ref={saveRef}
                              title="Timeseries Comparison Graph"
                            />
                          )}
                          <Button
                            onClick={() => refetch()}
                            type="submit"
                            color="secondary"
                            variant="contained"
                            size="large"
                            style={{ marginLeft: "10px" }}
                            disabled={!selectedWells.length}
                          >
                            Submit
                          </Button>
                        </Grid>
                      </SubmitGrid>
                    </Grid>
                  </AccordionDetails>
                </Panel>
              </Accordion>
            </Grid>
          </>
        )}
      </Grid>

      {Parameters && Wells && Aquifers && (
        <>
          {data && (
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="time-series"
                    id="time-series"
                  >
                    <Typography variant="h4" ml={2}>
                      Graph
                    </Typography>
                  </AccordionSummary>
                  <Panel>
                    <AccordionDetails>
                      <TimeseriesContainer>
                        <TableWrapper>
                          <TimeseriesLineChartCompare
                            data={graphData}
                            error={error}
                            isLoading={isFetching}
                            filterValues={filterValues}
                            locationsOptions={Wells}
                            yLLabel={graphData?.yLLabel}
                            xLabelUnit="week"
                            ref={saveRef}
                            tooltipFormat="MM-DD-YYYY"
                          />
                        </TableWrapper>
                      </TimeseriesContainer>
                    </AccordionDetails>
                  </Panel>
                </Accordion>
              </Grid>
            </Grid>
          )}

          {data && (
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="table-content"
                    id="table-header"
                  >
                    <Typography variant="h4" ml={2}>
                      Table
                    </Typography>
                  </AccordionSummary>
                  <Panel>
                    <AccordionDetails>
                      <TableWrapper>
                        <Table
                          // isLoading={isLoading}
                          label="Daily Groundwater Elevation Timeseries Table"
                          columns={tableColumns}
                          data={[...[].concat.apply([], data)]}
                          height="590px"
                        />
                      </TableWrapper>
                    </AccordionDetails>
                  </Panel>
                </Accordion>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </>
  );
};

export default WaterQualityComparison;
