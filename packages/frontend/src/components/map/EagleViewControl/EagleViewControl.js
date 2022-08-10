import React from "react";
import { IconButton, Box, Tooltip } from "@material-ui/core";

const EagleViewControl = ({ open = false, onToggle, top = 10, right = 10 }) => {
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
      <Tooltip title={open ? "Outdoors Basemap" : "Eagle View Imagery"}>
        <IconButton
          size="small"
          color={open ? "secondary" : "default"}
          onClick={onToggle}
        >
          <div className="material-icons">
            <span>satellite_alt</span>
          </div>
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default EagleViewControl;
