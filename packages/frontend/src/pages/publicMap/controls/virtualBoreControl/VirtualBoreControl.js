import React from "react";
import { IconButton, Box, Tooltip } from "@material-ui/core";
import { Target as TargetIcon } from "react-feather";

const VirtualBoreControl = ({ open = false, onClose }) => {
  return (
    <Box
      bgcolor="#ffffff"
      boxShadow="0 0 0 2px rgba(0,0,0,.1)"
      borderRadius={4}
      position="absolute"
      zIndex={1}
      top={55}
      right={10}
      display="flex"
      flexDirection="column"
    >
      <Tooltip title="Virtual Bore" placement="left">
        <IconButton
          size="small"
          color={open ? "secondary" : "default"}
          onClick={onClose}
        >
          <TargetIcon style={{ height: "23px", width: "23px" }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default VirtualBoreControl;
