import React from "react";
import {
  Breadcrumbs as MuiBreadcrumbs,
  Divider as MuiDivider,
  Typography as MuiTypography,
} from "@material-ui/core";
import { Helmet } from "react-helmet-async";
import Link from "@material-ui/core/Link";
import { NavLink } from "react-router-dom";
import styled from "styled-components/macro";
import { spacing } from "@material-ui/system";
import Panel from "../../../components/panels/Panel";
import PermitsToWellsAssoc from "./PermitsToWellsAssoc";

const Divider = styled(MuiDivider)(spacing);

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);

const Typography = styled(MuiTypography)(spacing);

const PermitsToWells = () => {
  return (
    <React.Fragment>
      <Helmet title="Permits to Wells Associations" />
      <Typography variant="h3" gutterBottom display="inline">
        Permits to Wells Associations
      </Typography>

      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NavLink} exact to="/dashboard">
          Dashboard
        </Link>
        <Typography>Permits to Wells</Typography>
      </Breadcrumbs>

      <Divider my={6} />

      <Panel title="Permits to Wells">
        <PermitsToWellsAssoc />
      </Panel>
    </React.Fragment>
  );
};

export default PermitsToWells;
