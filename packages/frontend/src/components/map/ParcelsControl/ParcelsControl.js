import React from "react";
import { IconButton, Box, Tooltip } from "@material-ui/core";
import BoundariesIcon from "@material-ui/icons/CropFree";

const ParcelsControl = ({ open = false, onToggle, top = 88, right = 10 }) => {
  return (
    <Box
      bgcolor="#ffffff"
      boxShadow="0 0 0 2px rgba(0,0,0,.1)"
      borderRadius={4}
      position="absolute"
      zIndex={1}
      top={top}
      right={right}
      display="flex"
      flexDirection="column"
    >
      <Tooltip title="Bell CAD Parcels">
        <IconButton
          size="small"
          color={open ? "secondary" : "default"}
          onClick={onToggle}
        >
          <BoundariesIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ParcelsControl;
