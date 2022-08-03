import React from "react";
import { useQuery } from "react-query";

import {
  Breadcrumbs as MuiBreadcrumbs,
  Divider as MuiDivider,
  Typography,
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

const TableWrapper = styled.div`
  overflow-y: auto;
  max-width: calc(100vw - ${(props) => props.theme.spacing(12)}px);
  max-height: calc(100% - 48px);
`;

const Divider = styled(MuiDivider)(spacing);
const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);

//388px
const WaterLevelsReport = () => {
  const { getAccessTokenSilently } = useAuth0();

  const { data, isFetching, error } = useQuery(
    ["ui-report-water-levels"],
    async () => {
      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };

        const { data } = await axios.get(
          `${process.env.REACT_APP_ENDPOINT}/api/ui-report-water-levels`,
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

  if (error) return "An error has occurred: " + error.message;

  const tabColumns = [
    {
      title: "CUWCD Well Number",
      field: "cuwcd_well_number",
    },
    {
      title: "State Well Number",
      field: "state_well_number",
    },
    {
      title: "Measurement Date",
      field: "measurement_date",
      type: "date",
    },
    {
      title: "Measurement Method",
      field: "measurement_method",
    },
    {
      title: "DTW ft",
      field: "dtw_ft",
    },
    {
      title: "Source Aquifer",
      field: "source_aquifer",
    },
    {
      title: "Collected By",
      field: "collected_by",
    },
  ];

  return (
    <>
      <Helmet title="Water Levels Report" />
      <Typography variant="h3" gutterBottom display="inline">
        Water Levels Report
      </Typography>

      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NavLink} exact to="/dashboard">
          Dashboard
        </Link>
        <Typography>Water Levels</Typography>
      </Breadcrumbs>

      <Divider my={6} />

      <Panel>
        <TableWrapper>
          <Table
            options={{ filtering: true }}
            label="Water Levels Report"
            isLoading={isFetching}
            columns={tabColumns}
            data={data}
            height="600px"
          />
        </TableWrapper>
      </Panel>
    </>
  );
};

export default WaterLevelsReport;
