import React, { useRef, useState } from "react";
import { useQuery } from "react-query";

import {
  Breadcrumbs as MuiBreadcrumbs,
  CardContent,
  Divider as MuiDivider,
  Paper,
  Grid as MuiGrid,
  Typography as MuiTypography,
  Box,
} from "@material-ui/core";

import styled from "styled-components/macro";

import Table from "../../../components/Table";
import { spacing } from "@material-ui/system";
import Panel from "../../../components/panels/Panel";
import Link from "@material-ui/core/Link";
import { NavLink } from "react-router-dom";

import { Helmet } from "react-helmet-async";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import moment from "moment";
import PrintRefButton from "../../../components/graphs/PrintRefButton";
import { makeStyles } from "@material-ui/core/styles";
import { dateFormatter } from "../../../utils";

const useStyles = makeStyles((theme) => ({
  marginBottom: {
    marginBottom: "7px",
  },
  signature: {
    border: 0,
    borderBottom: "2px solid #000",
    width: "450px",
  },
  smallLineHeight: {
    lineHeight: 1.4,
  },
  bigLineHeight: {
    lineHeight: 1.4,
  },
  boldBigLineHeight: {
    fontWeight: 900,
    lineHeight: 2,
  },
}));

const TableWrapper = styled.div`
  overflow-y: auto;
  max-width: calc(100vw - ${(props) => props.theme.spacing(12)}px);
  max-height: calc(100% - 48px);
`;

const Centered = styled.div`
  text-align: center;
`;

const Divider = styled(MuiDivider)(spacing);
const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);
const Typography = styled(MuiTypography)(spacing);
const Grid = styled(MuiGrid)(spacing);

const WaterQualityPDFReport = () => {
  const { getAccessTokenSilently } = useAuth0();
  const classes = useStyles();

  const divSaveRef = useRef(null);

  const [selectedRecord, setSelectedRecord] = useState(null);

  const { data, isFetching, error } = useQuery(
    ["ui-report-wq-pdf"],
    async () => {
      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };

        const { data } = await axios.get(
          `${process.env.REACT_APP_ENDPOINT}/api/ui-report-wq-pdf`,
          { headers }
        );
        const dateConvertedData = data.map((obj) => {
          return {
            ...obj,
            test_datetime: dateFormatter(
              obj.test_datetime,
              "MM/DD/YYYY, h:mm A"
            ),
          };
        });
        return dateConvertedData;
      } catch (err) {
        console.error(err);
      }
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  if (error) return "An error has occurred: " + error.message;

  const tabColumns = [
    {
      title: "Test Date/Time",
      field: "test_datetime",
      type: "datetime",
      filtering: false,
    },
    {
      title: "Fiscal Year",
      field: "fiscal_year",
    },
    {
      title: "Well Number",
      field: "cuwcd_well_number",
    },
    {
      title: "Well Name",
      field: "well_name",
    },
    {
      title: "Aquifer",
      field: "aquifer_name",
    },
    {
      title: "Owner",
      field: "owner_name",
      cellStyle: {
        width: 200,
        minWidth: 200,
      },
    },
    {
      title: "Coliform",
      field: "coliform",
      filtering: false,
    },
    {
      title: "E. Coli",
      field: "ecoli",
      filtering: false,
    },
    {
      title: "Conductivity, uS/cm",
      field: "conductivity",
      filtering: false,
    },
    {
      title: "TDS, mg/L",
      field: "tds",
      filtering: false,
    },
    {
      title: "Salinity, mg/L",
      field: "salinity",
      filtering: false,
    },
    {
      title: "pH",
      field: "ph",
      filtering: false,
    },
    {
      title: "Alkalinity, mg/L CaCO3",
      field: "alkalinity",
      filtering: false,
    },
    {
      title: "Hardness, mg/L CaCO3",
      field: "hardness",
      filtering: false,
    },
    {
      title: "Nitrite, mg/L N",
      field: "nitrite",
      filtering: false,
    },
    {
      title: "Nitrate, mg/L N",
      field: "nitrate",
      filtering: false,
    },
    {
      title: "Phosphate, mg/L",
      field: "phosphate",
      filtering: false,
    },
    {
      title: "Sulfate, mg/L",
      field: "sulfate",
      filtering: false,
    },
    {
      title: "Fluoride, mg/L",
      field: "fluoride",
      filtering: false,
    },
    {
      title: "Comments",
      field: "comments",
      filtering: false,
      cellStyle: {
        width: 300,
        minWidth: 300,
      },
    },
    {
      title: "Well Elev",
      field: "well_elev_ft",
      filtering: false,
    },
    {
      title: "Well Depth, ft",
      field: "well_depth_ft",
      filtering: false,
    },
    {
      title: "Collected By",
      field: "collected_by",
      filtering: false,
    },
    {
      title: "Tested By",
      field: "tested_by",
      filtering: false,
    },
    {
      title: "Owner Phone",
      field: "owner_phone_number",
      filtering: false,
    },
    {
      title: "Owner Address",
      field: "mailing_address",
      filtering: false,
      cellStyle: {
        width: 300,
        minWidth: 300,
      },
    },
    {
      title: "Owner Email",
      field: "owner_email",
      filtering: false,
      // cellStyle: {
      //   width: 300,
      //   minWidth: 300,
      // },
    },
  ];

  return (
    <>
      <Helmet title="Water Quality PDF Report" />
      <Typography variant="h3" gutterBottom display="inline">
        Water Quality PDF Report
      </Typography>

      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NavLink} exact to="/dashboard">
          Dashboard
        </Link>
        <Typography>Water Quality PDF Report</Typography>
      </Breadcrumbs>

      <Divider my={6} />

      <Panel>
        <TableWrapper>
          <Table
            label="Water Quality PDF Report"
            isLoading={isFetching}
            columns={tabColumns}
            data={data}
            height="600px"
            options={{ filtering: true, search: false }}
            actions={[
              (rowData) => ({
                icon: "picture_as_pdf",
                tooltip: `View PDF Report for ${rowData.cuwcd_well_number}`,
                disabled: !rowData.cuwcd_well_number,
                onClick: (event, rowData) => {
                  setSelectedRecord(rowData);
                },
              }),
            ]}
          />
        </TableWrapper>
      </Panel>
      <div style={{ marginBottom: "20px" }} />

      {selectedRecord && (
        <>
          <div
            ref={divSaveRef}
            style={{
              boxShadow: "0px 5px 15px 10px rgba(0, 0, 0, 0.35)",
            }}
          >
            <Paper style={{ pageBreakAfter: "always", position: "relative" }}>
              <PrintRefButton
                data-html2canvas-ignore
                ref={divSaveRef}
                title="PDF Print"
                style={{ position: "absolute", top: "5px", right: "5px" }}
              />
              <CardContent style={{ width: "100%", padding: "20px 50px" }}>
                <Centered>
                  <Grid
                    container
                    justify={"space-between"}
                    alignItems={"center"}
                  >
                    <Grid item xs={4} style={{ textAlign: "center" }}>
                      <img
                        src="/static/img/clearwater-logo-full.png"
                        width="250px"
                        alt={
                          "Clearwater Underground Water Conservation District"
                        }
                      />
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="h2" style={{ fontWeight: 400 }}>
                        Water Quality Assessment Results
                      </Typography>
                      <Typography variant="subtitle2" mb={1}>
                        Created: {moment().format("MMMM Do YYYY, h:mma")}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} style={{ textAlign: "right" }} />
                  </Grid>
                </Centered>
                <Typography variant="body2">
                  The Clearwater Underground Water Conservation District (CUWCD
                  or District) provides in-house screening for some of the most
                  common parameters for drinking water.{" "}
                  <strong>
                    Please note that the CUWCD LAB IS NOT A CERTIFIED
                    LABORATORY.
                  </strong>{" "}
                  This screening is offered as a convenience to registered well
                  owners in Bell County and is provided for informative purposes
                  only.
                  <u>
                    {" "}
                    The District disclaims any liability for this screening and
                    the accuracy of any analysis. The water quality analytical
                    results from different faucets, taken at different times or
                    analyzed by a certified laboratory may be different from
                    CUWCD analysis of water from the same well.
                  </u>{" "}
                  Please contact our office if you would like information
                  regarding laboratories that are certified for
                  chemical/microbiological testing of drinking water.
                </Typography>

                <Divider mt={1} mb={1} />

                <Grid container alignItems="center" mb={1}>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.smallLineHeight}
                    >
                      Name:
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.smallLineHeight}
                    >
                      {selectedRecord.owner_name}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.smallLineHeight}
                    >
                      Phone Number:
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      variant="body2"
                      className={classes.smallLineHeight}
                    >
                      {selectedRecord.owner_phone_number}
                    </Typography>
                  </Grid>

                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.smallLineHeight}
                    >
                      Mailing Address:
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.smallLineHeight}
                    >
                      {selectedRecord.mailing_address}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.smallLineHeight}
                    >
                      <u>Email: </u>
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      variant="body2"
                      className={classes.smallLineHeight}
                    >
                      {selectedRecord.owner_email}
                    </Typography>
                  </Grid>

                  <Grid item xs={3}>
                    <Typography
                      variant="body2"
                      className={classes.smallLineHeight}
                    >
                      CUWCD Well Number:
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      className={classes.smallLineHeight}
                    >
                      {selectedRecord.cuwcd_well_number}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.smallLineHeight}
                    >
                      <u>Aquifer: </u>
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      variant="body2"
                      className={classes.smallLineHeight}
                    >
                      {selectedRecord.aquifer_name}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid
                  container
                  alignItems="center"
                  style={{ border: "solid 2px black", paddingLeft: "8px" }}
                  className={classes.marginBottom}
                >
                  <Grid item xs={7}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      PARAMETER RESULTS
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      <u>Test Date: </u>
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      {selectedRecord.test_datetime}
                    </Typography>
                  </Grid>

                  <Grid item xs={3}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                      style={{ textAlign: "right" }}
                    >
                      <u>Coliform Bacteria </u>
                    </Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                      style={{ marginLeft: "30px" }}
                    >
                      {selectedRecord.coliform}
                    </Typography>
                  </Grid>

                  <Grid item xs={3}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                      style={{ textAlign: "right" }}
                    >
                      <u>Ecoli </u>
                    </Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                      style={{ marginLeft: "30px" }}
                    >
                      {selectedRecord.ecoli}
                    </Typography>
                  </Grid>

                  <Grid item xs={5} />
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                      style={{ marginLeft: "-30px" }}
                    >
                      Results
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                      style={{ marginLeft: "-30px" }}
                    >
                      Drinking Water Standard *
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      <u>Conductivity (µS/cm)</u>
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      {selectedRecord.conductivity}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      none
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      <u>**Total Dissolved Solids (mg/L)</u>
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      {selectedRecord.tds}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      1,000 mg/L (secondary)
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      <u>Salinity (mg/L)</u>
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      {selectedRecord.salinity}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      500 mg/L (secondary)
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      <u>pH</u>
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      {selectedRecord.ph}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      6.5 - 8.5 (secondary)
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      <u>Alkalinity (as CaCO3)</u>
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      {selectedRecord.alkalinity}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      none
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      <u>Hardness (as CaCO3)</u>
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      {selectedRecord.hardness}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      none
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      <u>Nitrite (as N)(mg/L)</u>
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      {selectedRecord.nitrite}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      1 mg/L (primary)
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      <u>Nitrate (as N)(mg/L)</u>
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      {selectedRecord.nitrate}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      10 mg/L (primary)
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      <u>Phosphate (mg/L)</u>
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      {selectedRecord.phosphate}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      none
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      <u>Sulfate (mg/L)</u>
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      {selectedRecord.sulfate}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      300 mg/L (secondary)
                    </Typography>
                  </Grid>

                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      <u>Fluoride (mg/L)</u>
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      {selectedRecord.fluoride}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography
                      variant="body2"
                      className={classes.boldBigLineHeight}
                    >
                      4.0 mg/L (primary)
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" mb={1}>
                      <u>Comments</u>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant="body2"
                      mb={1}
                      style={{ lineHeight: 1 }}
                    >
                      {selectedRecord.comments}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container mb={1}>
                  <Grid
                    item
                    xs={12}
                    className={`${classes.smallLineHeight} ${classes.marginBottom}`}
                  >
                    <Typography
                      display="inline"
                      variant="caption"
                      component="div"
                      className={`${classes.smallLineHeight} ${classes.marginBottom}`}
                    >
                      *{" "}
                      <em>
                        The concentrations of analytical parameters in
                        milligrams per liter (mg/L) refer to the Drinking Water
                        Standards for public water supply systems established by
                        the United States Environmental Protection Agency (EPA)
                        and Texas Commission on Environmental Quality (TCEQ).
                        Primary standards are the enforceable maximum allowable
                        concentration for each parameter to maintain health.
                        Secondary standards are non-enforceable guidelines for
                        the cosmetic or esthetic quality of drinking water.
                        These standards do not apply to private water wells but
                        are useful in assessing water quality. Details on EPA
                        and TCEQ drinking water standards are available at:{" "}
                      </em>
                      <Link
                        href="http://www.epa.gov/safewater/mcl.html#mcls"
                        target="_blank"
                      >
                        http://www.epa.gov/safewater/mcl.html#mcls
                      </Link>{" "}
                      &{" "}
                      <Link
                        href="http://www.tnrcc.state.tx.us/oprd/rules/pdflib/290_ind.pdf"
                        target="_blank"
                      >
                        http://www.tnrcc.state.tx.us/oprd/rules/pdflib/290_ind.pdf{" "}
                      </Link>
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    className={`${classes.smallLineHeight} ${classes.marginBottom}`}
                  >
                    <Typography
                      display="inline"
                      variant="caption"
                      component="div"
                      className={`${classes.smallLineHeight} ${classes.marginBottom}`}
                    >
                      ** The Total Dissolved Solids value reported is calculated
                      from the Conductivity measured in the analysis. This TDS
                      value should be considered as an “apparent” value and may
                      have limited accuracy when compared to values reported by
                      certified laboratories, accuracy range may be + or - 25
                      percent.
                    </Typography>
                  </Grid>
                </Grid>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  style={{ borderTop: "3px solid black" }}
                >
                  <Typography variant="body2">
                    <strong>P.O. Box 1989</strong>
                  </Typography>
                  <Typography variant="body2">
                    <strong>Belton TX 76513</strong>
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone: 254-933-0120 </strong>
                  </Typography>
                  <Typography variant="body2">
                    <strong>Fax: 254/933-8396</strong>
                  </Typography>
                  <Typography variant="body2">
                    <Link href="https://cuwcd.org/" target="_blank">
                      <strong>www.cuwcd.org</strong>
                    </Link>{" "}
                  </Typography>
                </Box>
              </CardContent>
            </Paper>
            <Paper>
              <CardContent style={{ width: "100%", padding: "25px 50px" }}>
                <Centered>
                  <Grid
                    mb={1}
                    container
                    justify={"space-between"}
                    alignItems={"center"}
                  >
                    <Grid item xs={4} style={{ textAlign: "center" }}>
                      <img
                        src="/static/img/clearwater-logo-full.png"
                        width="200px"
                        alt={
                          "Clearwater Underground Water Conservation District"
                        }
                      />
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="h2" style={{ fontWeight: 400 }}>
                        Water Quality Assessment
                      </Typography>
                      <Typography variant="h4" mb={1}>
                        <em>What are the parameters being assessed?</em>
                      </Typography>
                    </Grid>
                    <Grid item xs={3} style={{ textAlign: "right" }} />
                  </Grid>
                </Centered>
                <div>
                  <Typography
                    mb={2}
                    variant="body2"
                    className={classes.bigLineHeight}
                  >
                    The parameters available for analysis are described for
                    information purposes. District Staff will analysis all of
                    the following parameters. District provides ongoing
                    screening “free of charge” for all registered wells in the
                    District upon request.*
                  </Typography>
                  <Typography
                    mb={2}
                    variant="body2"
                    className={classes.bigLineHeight}
                  >
                    <strong>Coliform Bacteria - </strong> A family of bacteria
                    common in soils, plants and animals. The presence/absence
                    test only indicates if coliform bacteria are present. No
                    distinction is made on the origin of the coliform bacteria.
                    A positive result warrants further analysis, an inspection
                    of the well integrity and well/water system disinfection.
                    Coliform bacteria should not be present under the federal
                    drinking water standard.
                  </Typography>
                  <Typography
                    mb={2}
                    variant="body2"
                    className={classes.bigLineHeight}
                  >
                    <strong>Conductivity - </strong>Conductivity measures the
                    ability of water to conduct an electric current and is
                    useful to quickly assess water quality. Conductivity
                    increases with the number of dissolved ions in the water but
                    is affected by temperature and the specific ions in
                    solution. High conductivity or large changes may warrant
                    further analysis. There is no EPA or TCEQ drinking water
                    standard for conductivity.
                  </Typography>
                  <Typography
                    mb={2}
                    variant="body2"
                    className={classes.bigLineHeight}
                  >
                    <strong>Total Dissolved Solids (TDS) - </strong>Refers to
                    dissolved minerals (ions) and is a good general indicator of
                    water quality. The value reported for this parameter is
                    calculated by the conductivity meter as a function of the
                    conductivity value and may not account for all the factors
                    affecting the Conductivity-TDS relationship. TDS values
                    reported by CUWCD should be considered as “apparent”. The
                    accuracy may range approximately +/- 25 percent from values
                    reported by certified laboratories. The TCEQ secondary
                    drinking water standard for TDS is 1000 mg/L. Water is
                    considered fresh if TDS is 1000 mg/L or less
                  </Typography>
                  <Typography
                    mb={2}
                    variant="body2"
                    className={classes.bigLineHeight}
                  >
                    <strong>pH - </strong>The pH of water is a measure of the
                    concentration of hydrogen ions. pH is expressed on a scale
                    from 1 to 14, with 1 being most acidic, 7 neutral and 14
                    being the most basic or alkaline. The pH of drinking water
                    should be between 6.5 and 8.5 to meet the federal secondary
                    drinking water standard.
                  </Typography>
                  <Typography
                    mb={2}
                    variant="body2"
                    className={classes.bigLineHeight}
                  >
                    <strong>Alkalinity (as CaCO3) - </strong>Alkalinity does not
                    refer to pH, but instead refers to the ability of water to
                    resist change in pH and may be due to dissolved
                    bicarbonates. Low water alkalinity may cause corrosion; high
                    alkalinity may cause scale formation. There is no EPA or
                    TCEQ drinking water standard for alkalinity.
                  </Typography>
                  <Typography
                    mb={2}
                    variant="body2"
                    className={classes.bigLineHeight}
                  >
                    <strong>Hardness (as CaCO3) - </strong>“Hard" water may be
                    indicated by large amounts of soap required to form suds and
                    scale deposits in pipes and water heaters. Hardness is
                    caused by calcium, magnesium, manganese or iron in the form
                    of bicarbonates, carbonates, sulfates or chlorides
                  </Typography>
                  <Typography
                    mb={2}
                    variant="body2"
                    className={classes.bigLineHeight}
                  >
                    <strong>Nitrate/Nitrite - </strong>Nitrate and Nitrite are
                    of special concern to infants and can cause “blue baby”
                    syndrome. The federal drinking water standard for nitrate is
                    10 mg/L. The federal drinking water standard for nitrite is
                    1 mg/L. Nitrate or nitrite may indicate an impact from
                    sewage, fertilizer or animal waste.
                  </Typography>
                  <Typography
                    mb={2}
                    variant="body2"
                    className={classes.bigLineHeight}
                  >
                    <strong>Phosphate - </strong>Phosphates may indicate impact
                    from laundering agents. Testing for phosphates provides a
                    general indicator of water quality. There is no EPA or TCEQ
                    drinking water standard for phosphate.
                  </Typography>
                  <Typography
                    mb={2}
                    variant="body2"
                    className={classes.bigLineHeight}
                  >
                    <strong>Sulfate - </strong>Sulfate compounds are many of the
                    dissolved salts found in groundwater. Sulfate can produce
                    laxative effects, bad taste or smell. The TCEQ secondary
                    drinking water standard for sulfate is 300 mg/L.
                  </Typography>
                  <Typography
                    mb={2}
                    variant="body2"
                    className={classes.bigLineHeight}
                  >
                    <strong>Fluoride - </strong>Fluoride may occur naturally and
                    is sometimes added to drinking water to promote strong
                    teeth. Fluoride may stain children’s teeth. The federal
                    drinking water standard for fluoride is 4.0 mg/L.
                  </Typography>
                </div>

                <Grid container mb={3}>
                  <Grid
                    item
                    xs={12}
                    className={`${classes.smallLineHeight} ${classes.marginBottom}`}
                  >
                    <Typography
                      display="inline"
                      variant="caption"
                      component="div"
                      className={`${classes.smallLineHeight} ${classes.marginBottom}`}
                    >
                      <em>
                        <strong>*Note:</strong> The concentrations of analytical
                        parameters in milligrams per liter (mg/L) given below
                        refer to the Federal Drinking Water Standards for public
                        water supply systems established by the United States
                        Environmental Protection Agency (EPA). The EPA has
                        established primary and secondary standards for drinking
                        water. Primary standards are the enforceable maximum
                        allowable concentration for each parameter to maintain
                        health. Secondary standards are non -enforceable
                        guidelines for the cosmetic or esthetic quality of
                        drinking water. These standards do not apply to private
                        water wells but are useful in assessing water quality.
                        Details on EPA drinking water standards are available
                        at:{" "}
                        <Link
                          href="http://www.epa.gov/safewater/mcl.html#mcls"
                          target="_blank"
                        >
                          http://www.epa.gov/safewater/mcl.html#mcls
                        </Link>{" "}
                        The Texas Commission on Environmental Quality (TCEQ)
                        enforces drinking water standards in Texas and has
                        adopted secondary standards that in some cases may
                        differ from the EPA secondary standards.
                        <br />
                        Details are available at:{" "}
                        <Link
                          href="http://www.tnrcc.state.tx.us/oprd/rules/pdflib/290_ind.pdf"
                          target="_blank"
                        >
                          http://www.tnrcc.state.tx.us/oprd/rules/pdflib/290_ind.pdf
                        </Link>{" "}
                      </em>
                    </Typography>
                  </Grid>
                </Grid>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  style={{ borderTop: "3px solid black" }}
                >
                  <Typography variant="body2">
                    <strong>P.O. Box 1989</strong>
                  </Typography>
                  <Typography variant="body2">
                    <strong>Belton TX 76513</strong>
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone: 254-933-0120 </strong>
                  </Typography>
                  <Typography variant="body2">
                    <strong>Fax: 254/933-8396</strong>
                  </Typography>
                  <Typography variant="body2">
                    <Link href="https://cuwcd.org/" target="_blank">
                      <strong>www.cuwcd.org</strong>
                    </Link>{" "}
                  </Typography>
                </Box>
              </CardContent>
            </Paper>
          </div>
        </>
      )}
    </>
  );
};

export default WaterQualityPDFReport;
