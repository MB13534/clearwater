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
const AllWellsReport = () => {
  const { getAccessTokenSilently } = useAuth0();

  const { data, isFetching, error } = useQuery(
    ["ui-report-all-wells-for-download"],
    async () => {
      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };

        const { data } = await axios.get(
          `${process.env.REACT_APP_ENDPOINT}/api/ui-report-all-wells-for-download`,
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
      title: "Well Name",
      field: "well_name",
    },
    {
      title: "Is Exempt?",
      field: "exempt",
      type: "boolean",
    },
    {
      title: "Primary Use",
      field: "primary_use",
    },
    {
      title: "Secondary Use",
      field: "secondary_use",
    },
    {
      title: "Longitude",
      field: "longitude_dd",
    },
    {
      title: "Latitude",
      field: "latitude_dd",
    },
    {
      title: "Well Status",
      field: "well_status_desc",
    },
    {
      title: "Aquifer",
      field: "aquifer_name",
    },
    {
      title: "Aquifer Group",
      field: "aquifer_group",
    },
    {
      title: "Elevation (ft msl)",
      field: "elevation_ftabmsl",
    },
    {
      title: "Well Depth (ft)",
      field: "well_depth_ft",
    },
    {
      title: "Screen Top Depth (ft)",
      field: "screen_top_depth_ft",
    },
    {
      title: "Screen Bottom Depth (ft)",
      field: "screen_bottom_depth_ft",
    },
    {
      title: "Driller",
      field: "driller",
    },
    {
      title: "Date Drilled",
      field: "date_drilled",
      type: "date",
    },
    {
      title: "Drillers Log?",
      field: "drillers_log",
      type: "boolean",
    },
    {
      title: "Organization",
      field: "organization",
    },
    {
      title: "Last Name",
      field: "lastname",
    },
    {
      title: "First Name",
      field: "firstname",
    },
    {
      title: "Notes",
      field: "notes",
      cellStyle: {
        width: 300,
        minWidth: 300,
      },
    },
  ];

  return (
    <>
      <Helmet title="All Wells Report" />
      <Typography variant="h3" gutterBottom display="inline">
        All Wells Report
      </Typography>

      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NavLink} exact to="/dashboard">
          Dashboard
        </Link>
        <Typography>All Wells</Typography>
      </Breadcrumbs>

      <Divider my={6} />

      <Panel>
        <TableWrapper>
          <Table
            options={{ filtering: true }}
            label="All Wells Report"
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

export default AllWellsReport;
