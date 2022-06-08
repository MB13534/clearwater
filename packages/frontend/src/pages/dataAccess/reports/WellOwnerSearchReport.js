import React, { useState } from "react";
import { useQuery } from "react-query";

import {
  Breadcrumbs as MuiBreadcrumbs,
  Divider as MuiDivider,
  FormControlLabel,
  Paper,
  Switch,
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

const FilterOptions = styled(Paper)`
  margin-bottom: 16px;
  padding: 16px;
`;

//388px
const WellOwnerSearchReport = () => {
  const { getAccessTokenSilently } = useAuth0();

  const [showPermitted, setShowPermitted] = useState(false);

  const { data, isFetching, error } = useQuery(
    ["ui-report-owners-search"],
    async () => {
      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };

        const { data } = await axios.get(
          `${process.env.REACT_APP_ENDPOINT}/api/ui-report-owners-search`,
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
      title: "Well",
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
      title: "Well Use",
      field: "well_use",
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
      title: "Organization",
      field: "organization",
    },
    {
      title: "Address",
      field: "address",
    },
    {
      title: "City",
      field: "city",
    },
    {
      title: "State",
      field: "state",
    },
    {
      title: "Zip",
      field: "zip",
    },
    {
      title: "Email",
      field: "email",
    },
    {
      title: "Phone",
      field: "phone",
    },
    {
      title: "Permit",
      field: "permit_number",
    },
    {
      title: "Permit Holder",
      field: "permit_holder_name",
    },
    {
      title: "Agg System",
      field: "agg_system_name",
    },
  ];

  const filterData = (data) => {
    if (!showPermitted) {
      return data;
    }
    return data.filter((item) => item.is_permitted);
  };

  return (
    <>
      <Helmet title="Well Owner Search Report" />
      <Typography variant="h3" gutterBottom display="inline">
        Well Owner Search Report
      </Typography>

      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NavLink} exact to="/dashboard">
          Dashboard
        </Link>
        <Typography>Well Owner Search</Typography>
      </Breadcrumbs>

      <Divider my={6} />

      <FilterOptions>
        <Typography variant="h6" gutterBottom>
          Filter Options
        </Typography>
        <FormControlLabel
          value="end"
          control={
            <Switch
              checked={showPermitted}
              onChange={() => setShowPermitted(!showPermitted)}
              color="primary"
              name="checkedB"
              inputProps={{ "aria-label": "primary checkbox" }}
            />
          }
          label={
            showPermitted ? (
              <>
                Toggle to view <em>all</em> wells
              </>
            ) : (
              <>
                Toggle to view only <em>permitted</em> wells
              </>
            )
          }
          labelPlacement="end"
        />
      </FilterOptions>

      <Panel>
        <TableWrapper>
          <Table
            label="Well Owner Search Report"
            isLoading={isFetching}
            columns={tabColumns}
            data={filterData(data)}
            height="600px"
          />
        </TableWrapper>
      </Panel>
    </>
  );
};

export default WellOwnerSearchReport;
