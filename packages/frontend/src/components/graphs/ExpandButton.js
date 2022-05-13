import React from "react";

import { Tooltip as MuiTooltip } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/UnfoldMore";
import ExpandLessIcon from "@material-ui/icons/UnfoldLess";
import { spacing } from "@material-ui/system";

import styled from "styled-components/macro";

const Tooltip = styled(MuiTooltip)(spacing);

const ExpandButton = ({ handleExpand, expanded }) => {
  return (
    <Tooltip title={expanded ? "Collapse" : "Expand"} arrow ml={2}>
      <IconButton
        size="small"
        onClick={() => handleExpand()}
        color={expanded ? "secondary" : "default"}
        aria-label="expand"
        component="span"
      >
        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    </Tooltip>
  );
};
export default ExpandButton;
