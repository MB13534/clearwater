import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import styled from "styled-components/macro";
import { STARTING_LOCATION } from "../../constants";
import {
  Accordion,
  AccordionDetails,
  Tooltip,
  Typography,
} from "@material-ui/core";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Container = styled.div`
  height: 275px;
  width: 100%;
`;

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Coordinates = styled.pre`
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  position: absolute;
  bottom: 30px;
  left: 10px;
  padding: 5px 10px;
  margin: 0;
  font-size: 11px;
  line-height: 18px;
  border-radius: 3px;
  z-index: 1000;
  display: none;
`;

const Instructions = styled.div`
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  position: absolute;
  text-align: center;
  left: 50%;
  margin-right: -50%;
  margin-top: 10px;
  transform: translate(-50%, 0);
  padding: 5px 10px;
  font-size: 11px;
  line-height: 18px;
  border-radius: 3px;
  z-index: 1000;
  display: block;
`;

const Coord = styled.span`
  cursor: copy;
`;

const Map = ({ config }) => {
  const [map, setMap] = useState();
  const [mapIsLoaded, setMapIsLoaded] = useState(false);
  const coordinatesRef = useRef(null);
  const instructionsRef = useRef(null);
  const longRef = useRef(null);
  const latRef = useRef(null);
  const eleRef = useRef(null);
  const mapContainerRef = useRef(null); // create a reference to the map container

  async function getElevation(transferElevation = true) {
    // Construct the API request.

    const query = await fetch(
      `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${longRef.current.innerHTML},${latRef.current.innerHTML}.json?layers=contour&limit=50&access_token=${mapboxgl.accessToken}`,
      { method: "GET" }
    );
    if (query.status !== 200) return;
    const data = await query.json();

    const allFeatures = data.features;

    const elevations = allFeatures.map((feature) => feature.properties.ele);

    eleRef.current.innerHTML = Math.max(...elevations) * 3.28084;
    if (transferElevation) {
      config.setFieldValue("elevation_ftabmsl", eleRef.current.innerHTML);
    }
  }

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v11",
      center:
        config.data.longitude_dd === "" || config.data.latitude_dd === ""
          ? STARTING_LOCATION
          : [config.data.longitude_dd, config.data.latitude_dd],
      zoom: 9,
    });

    map.on("render", () => {
      map.resize();
    });
    map.on("load", () => {
      setMapIsLoaded(true);
      map.resize();
      setMap(map);
    });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (mapIsLoaded && typeof map != "undefined") {
      const marker = new mapboxgl.Marker({
        draggable: true,
      })
        .setLngLat(
          config.data.longitude_dd === "" || config.data.latitude_dd === ""
            ? STARTING_LOCATION
            : [config.data.longitude_dd, config.data.latitude_dd]
        )
        .addTo(map);

      if (config.data.longitude_dd && config.data.latitude_dd) {
        const lngLat = marker.getLngLat();
        coordinatesRef.current.style.display = "block";
        instructionsRef.current.innerHTML =
          "Drag and place marker to update coordinates and elevation fields";

        longRef.current.innerHTML = lngLat.lng;
        latRef.current.innerHTML = lngLat.lat;
        getElevation(!config.data.elevation_ftabmsl);
      }

      const onDragEnd = () => {
        const lngLat = marker.getLngLat();
        coordinatesRef.current.style.display = "block";
        instructionsRef.current.innerHTML =
          "Click resulting coordinate or elevation to copy individual result to clipboard";

        longRef.current.innerHTML = lngLat.lng;
        config.setFieldValue("longitude_dd", lngLat.lng);
        latRef.current.innerHTML = lngLat.lat;
        config.setFieldValue("latitude_dd", lngLat.lat);
        getElevation();
      };
      const handleCopyCoords = (value) => {
        const dummy = document.createElement("input");
        document.body.appendChild(dummy);
        dummy.value = value;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
      };

      longRef.current.addEventListener("click", (e) =>
        handleCopyCoords(e.target.innerHTML)
      );
      latRef.current.addEventListener("click", (e) =>
        handleCopyCoords(e.target.innerHTML)
      );
      eleRef.current.addEventListener("click", (e) =>
        handleCopyCoords(e.target.innerHTML)
      );

      marker.on("dragend", onDragEnd);
    }
  }, [mapIsLoaded, map]); //eslint-disable-line

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="map"
          id="map"
          style={{ padding: "0" }}
        >
          <Typography variant="h4" ml={2}>
            Map
          </Typography>
        </AccordionSummary>
        <AccordionDetails style={{ padding: "0" }}>
          <Container>
            <MapContainer ref={mapContainerRef}>
              <Coordinates ref={coordinatesRef}>
                Longitude:{" "}
                <Tooltip title="Copy Longitude to Clipboard">
                  <Coord ref={longRef} />
                </Tooltip>
                <br />
                Latitude:{" "}
                <Tooltip
                  title="Copy Latitude to Clipboard"
                  // placement="bottom-start"
                >
                  <Coord ref={latRef} />
                </Tooltip>
                <br />
                Elevation:{" "}
                <Tooltip
                  title="Copy Elevation to Clipboard"
                  placement="bottom-start"
                >
                  <Coord ref={eleRef} />
                </Tooltip>{" "}
                (ft)
              </Coordinates>
              <Instructions ref={instructionsRef}>
                Drag and place marker to generate coordinates and elevation
                fields
              </Instructions>
            </MapContainer>
          </Container>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default Map;
