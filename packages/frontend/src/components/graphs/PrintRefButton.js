import React, { forwardRef } from "react";

import { withTheme } from "styled-components/macro";
import { Tooltip as MuiTooltip } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import PrintIcon from "@material-ui/icons/Print";
import { spacing } from "@material-ui/system";

import styled from "styled-components/macro";

import { useReactToPrint } from "react-to-print";

const Tooltip = styled(MuiTooltip)(spacing);

const PrintRefButton = forwardRef(({ theme, title }, ref) => {
  const handlePrintMapClick = useReactToPrint({
    content: () => ref.current,
  });
  return (
    <Tooltip title="Print PDF" arrow ml={2}>
      <IconButton
        onClick={() => handlePrintMapClick()}
        style={{
          color:
            theme.palette.type === "dark"
              ? "rgba(255, 255, 255, 0.5)"
              : "rgb(117, 117, 117)",
        }}
        aria-label="print graph"
        component="span"
      >
        <PrintIcon />
      </IconButton>
    </Tooltip>
  );
});
export default withTheme(PrintRefButton);
