import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails as MuiAccordionDetails,
  Box,
  Paper,
  Typography,
} from "@material-ui/core";
import LayersIcon from "@material-ui/icons/Layers";
import MapIcon from "@material-ui/icons/Map";
import SearchRadiusIcon from "@material-ui/icons/WifiTethering";
import ExpandMore from "@material-ui/icons/ExpandMore";
import styled from "styled-components/macro";
import LayersControl from "../layersControl";
import BasemapsControl from "../basemapsControl";
import SearchRadiusControl from "../searchRadiusControl";

const Container = styled(Paper)`
  background: none;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
  left: 49px;
  position: absolute;
  top: 10px;
  max-height: calc(100% - 32px);
  overflow-x: hidden;
  overflow-y: hidden;
  width: 300px;
  z-index: 3;
`;

const AccordionDetails = styled(MuiAccordionDetails)`
  background-color: #fafafa;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  max-height: 450px;
  height: auto;
  overflow-x: hidden;
  overflow-y: auto;
`;

const MainControl = ({
  activeBasemap,
  basemaps,
  bufferValues,
  layers,
  onBasemapChange,
  onBufferValuesChange,
  onClearBuffers,
  onLayerChange,
  onResetBuffers,
  onEnableSearchRadiusControl,
  value,
}) => {
  const [expandedItem, setExpandedItem] = useState("layers");

  const handleChange = (panel) => (event, isExpanded) => {
    setExpandedItem(isExpanded ? panel : false);

    if (panel === "search-radius") {
      onEnableSearchRadiusControl(isExpanded);
      if (!isExpanded) {
        onClearBuffers();
      }
    }
  };

  return (
    <Container>
      {value === "attributes_search" && (
        <Accordion
          expanded={expandedItem === "basemaps"}
          onChange={handleChange("basemaps")}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box alignItems="center" display="flex" gridColumnGap={8}>
              <MapIcon />
              <Typography variant="subtitle1">Basemaps</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <BasemapsControl
              items={basemaps}
              value={activeBasemap}
              onBasemapChange={onBasemapChange}
            />
          </AccordionDetails>
        </Accordion>
      )}

      <Accordion
        expanded={expandedItem === "layers"}
        onChange={handleChange("layers")}
      >
        <AccordionSummary
          aria-controls="layers-content"
          id="layers-header"
          expandIcon={<ExpandMore />}
        >
          <Box alignItems="center" display="flex" gridColumnGap={8}>
            <LayersIcon />
            <Typography variant="subtitle1">Layers</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <LayersControl items={layers} onLayerChange={onLayerChange} />
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expandedItem === "search-radius"}
        onChange={handleChange("search-radius")}
      >
        <AccordionSummary
          aria-controls="search-radius-content"
          id="search-radius-header"
          expandIcon={<ExpandMore />}
        >
          <Box alignItems="center" display="flex" gridColumnGap={8}>
            <SearchRadiusIcon />
            <Typography variant="subtitle1">Search Radius Control</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <SearchRadiusControl
            bufferValues={bufferValues}
            onBufferValuesChange={onBufferValuesChange}
            onClearBuffers={onClearBuffers}
            onResetBuffers={onResetBuffers}
          />
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

export default MainControl;
