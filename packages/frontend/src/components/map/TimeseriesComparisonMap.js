import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import styled, { ThemeProvider } from "styled-components/macro";
import { useQuery } from "react-query";
import ResetZoomControl from "./ResetZoomControl";
import { STARTING_LOCATION } from "../../constants";
import ToggleBasemapControl from "./ToggleBasemapControl";
import debounce from "lodash.debounce";
import { lineColors } from "../../utils";
import ReactDOM from "react-dom";
import { jssPreset, StylesProvider } from "@material-ui/core/styles";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/styles";
import createTheme from "../../theme";
import Popup from "../../pages/publicMap/popup";
import { create } from "jss";
import { useSelector } from "react-redux";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const jss = create({
  ...jssPreset(),
  insertionPoint: document.getElementById("jss-insertion-point"),
});

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Root = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const TimeseriesComparisonMap = ({ selectedAquiferWells, selectedWells }) => {
  const { getAccessTokenSilently } = useAuth0();
  const theme = useSelector((state) => state.themeReducer);
  const [mapIsLoaded, setMapIsLoaded] = useState(false);
  const [map, setMap] = useState();

  const popUpRef = useRef(
    new mapboxgl.Popup({
      maxWidth: "400px",
      offset: 15,
      focusAfterOpen: false,
    })
  );
  const mapContainer = useRef(null); // create a reference to the map container

  const DUMMY_BASEMAP_LAYERS = [
    { url: "streets-v11", icon: "commute" },
    { url: "outdoors-v11", icon: "park" },
    { url: "satellite-streets-v11", icon: "satellite_alt" },
  ];

  const wellsLayer = {
    id: "wells",
    type: "circle",
    source: "wells",
    paint: {
      "circle-stroke-width": [
        "case",
        ["in", ["get", "index"], ["literal", selectedWells]],
        5,
        1,
      ],
      "circle-stroke-color": [
        "case",
        ["in", ["get", "index"], ["literal", selectedWells]],
        lineColors.red,
        "black",
      ],
      "circle-radius": [
        "case",
        ["==", ["get", "recordCount"], 1],
        5,
        ["==", ["get", "recordCount"], 2],
        7,
        9,
      ],

      "circle-color": [
        "case",
        ["==", ["get", "aquifer"], "Upper Trinity"],
        "#FF9896",
        ["==", ["get", "aquifer"], "Middle Trinity"],
        "#1F77B4",
        ["==", ["get", "aquifer"], "Lower Trinity"],
        "#FF7F0E",
        ["==", ["get", "aquifer"], "Edwards (BFZ)"],
        "#2CA02C",
        ["==", ["get", "aquifer"], "Edwards Equivalent"],
        "#98DF8A",
        ["==", ["get", "aquifer"], "Pecan"],
        "#AEC7E8",
        ["==", ["get", "aquifer"], "Alluvium"],
        "#FFBB78",
        ["==", ["get", "aquifer"], "Ozan"],
        "#D62728",
        ["==", ["get", "aquifer"], "Austin Chalk"],
        "#9467BD",
        ["==", ["get", "aquifer"], "Lake Waco"],
        "#C5B0D5",
        ["==", ["get", "aquifer"], "Kemp"],
        "#8C564B",
        ["==", ["get", "source_aquifer"], "Buda"],
        "#E377C2",
        // ["==", ["get", "source_aquifer"], "Undeclared"],
        // "#C49C94",
        "black",
      ],
    },
    lreProperties: {
      popup: {
        titleField: "cuwcdName",
        excludeFields: ["index"],
      },
    },
  };

  const aquiferFill = {
    id: "aquifer-boundaries-fill",
    name: "Aquifer Boundaries",
    type: "fill",
    source: "aquifer-boundaries",
    "source-layer": "Aquifers_major_dd-1n355v",
    paint: {
      "fill-opacity": 0.3,
      "fill-color": [
        "match",
        ["get", "AqName"],
        ["CARRIZO OUTCROP"],
        "#880000",
        ["CARRIZO DOWNDIP"],
        "#fd4343",
        ["SEYMOUR OUTCROP"],
        "#D1681D",
        ["TRINITY OUTCROP"],
        "#008000",
        ["TRINITY DOWNDIP"],
        "#7fff3f",
        ["OGALLALA OUTCROP"],
        "#80B0DE",
        ["PECOS VALLEY OUTCROP"],
        "#FEC22C",
        ["HUECO_BOLSON OUTCROP"],
        "#FF00FF",
        ["EDWARDS-TRINITY OUTCROP"],
        "#6ebb89",
        ["EDWARDS-TRINITY DOWNDIP"],
        "#b8ffcc",
        ["EDWARDS OUTCROP"],
        "#000b7e",
        ["EDWARDS DOWNDIP"],
        "#3c86ff",
        ["GULF_COAST OUTCROP"],
        "#FFFF00",
        "rgba(0,0,0,0)",
      ],
    },
    layout: {
      visibility: "none",
    },
    lreProperties: {
      layerGroup: "aquifer-boundaries",
    },
    drawOrder: 99,
  };

  const aquiferLine = {
    id: "aquifer-boundaries-line",
    name: "Aquifer Boundaries",
    type: "line",
    source: "aquifer-boundaries",
    "source-layer": "Aquifers_major_dd-1n355v",
    paint: {
      "line-color": [
        "match",
        ["get", "AqName"],
        ["CARRIZO OUTCROP"],
        "#880000",
        ["CARRIZO DOWNDIP"],
        "#fd4343",
        ["SEYMOUR OUTCROP"],
        "#D1681D",
        ["TRINITY OUTCROP"],
        "#008000",
        ["TRINITY DOWNDIP"],
        "#7fff3f",
        ["OGALLALA OUTCROP"],
        "#80B0DE",
        ["PECOS VALLEY OUTCROP"],
        "#FEC22C",
        ["HUECO_BOLSON OUTCROP"],
        "#FF00FF",
        ["EDWARDS-TRINITY OUTCROP"],
        "#6ebb89",
        ["EDWARDS-TRINITY DOWNDIP"],
        "#b8ffcc",
        ["EDWARDS OUTCROP"],
        "#000b7e",
        ["EDWARDS DOWNDIP"],
        "#3c86ff",
        ["GULF_COAST OUTCROP"],
        "#FFFF00",
        "rgba(0,0,0,0)",
      ],
      "line-width": 4,
    },
    layout: {
      visibility: "none",
    },
    lreProperties: {
      layerGroup: "aquifer-boundaries",
    },
    drawOrder: 99,
  };

  const { data, isLoading, error } = useQuery(
    ["ui-report-wq-timeseriesgraph-map"],
    async () => {
      try {
        const token = await getAccessTokenSilently();
        const headers = { Authorization: `Bearer ${token}` };

        const { data } = await axios.get(
          `${process.env.REACT_APP_ENDPOINT}/api/ui-report-wq-timeseriesgraph-map`,
          { headers }
        );

        return data.filter((location) => location.location_geometry);
      } catch (err) {
        console.error(err);
      }
    },
    { keepPreviousData: true, refetchOnWindowFocus: false }
  );

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/" + DUMMY_BASEMAP_LAYERS[0].url,
      center: STARTING_LOCATION,
      zoom: 8.7,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-left");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true,
      }),
      "top-left"
    );
    map.addControl(new mapboxgl.FullscreenControl());
    // Add locate control to the map.
    map.addControl(new ResetZoomControl(), "top-left");

    DUMMY_BASEMAP_LAYERS.forEach((layer) => {
      return map.addControl(new ToggleBasemapControl(layer.url, layer.icon));
    });

    map.on("load", () => {
      setMapIsLoaded(true);
      setMap(map);
    });
  }, []); // eslint-disable-line

  //resizes map when mapContainerRef dimensions changes (sidebar toggle)
  useEffect(() => {
    if (map) {
      const resizer = new ResizeObserver(debounce(() => map.resize(), 100));
      resizer.observe(mapContainer.current);
      return () => {
        resizer.disconnect();
      };
    }
  }, [map]);

  useEffect(() => {
    if (mapIsLoaded && data?.length > 0 && typeof map != "undefined") {
      if (!map.getSource("wells")) {
        map.addSource("aquifer-boundaries", {
          type: "vector",
          url: "mapbox://txclearwater.1zpxkpma",
        });

        map.addLayer(aquiferFill);
        map.addLayer(aquiferLine);

        map.addSource("wells", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: data.map((well) => {
              return {
                id: well.cuwcd_well_number,
                type: "Feature",
                properties: {
                  cuwcdName: well.cuwcd_well_number,
                  name: well.well_name,
                  aquifer: well.aquifer_name,
                  wellElev: well.well_elevation,
                  wellDepthFt: well.well_depth_ft,
                  recordCount: well.recordcount,
                  index: well.cuwcd_well_number,
                },
                geometry: {
                  type: well.location_geometry.type,
                  coordinates: well.location_geometry.coordinates,
                },
              };
            }),
          },
        });
        // Add a layer showing the places.
        map.addLayer(wellsLayer);

        map.on("click", "aquifer-boundaries-fill", (e) => {
          const feature = map
            .queryRenderedFeatures(e.point)
            .filter((feature) => feature?.properties?.AqName)[0];

          const description = feature.properties.AqName;

          const aquiferPopup = new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(description)
            .addTo(map);

          map.on("closeAllPopups", () => {
            aquiferPopup.remove();
          });
        });

        map.on("click", "wells", (e) => {
          map.fire("closeAllPopups");

          const features = map.queryRenderedFeatures(e.point);
          const myFeatures = features.filter(
            (feature) => feature.source === "wells"
          );
          const coordinates = [e.lngLat.lng, e.lngLat.lat];

          const popupNode = document.createElement("div");
          ReactDOM.render(
            //MJB adding style providers to the popup
            <StylesProvider jss={jss}>
              <MuiThemeProvider theme={createTheme(theme.currentTheme)}>
                <ThemeProvider theme={createTheme(theme.currentTheme)}>
                  <Popup
                    layers={[wellsLayer]}
                    features={myFeatures}
                    height="100%"
                    width="252px"
                    size="small"
                  />
                </ThemeProvider>
              </MuiThemeProvider>
            </StylesProvider>,
            popupNode
          );
          popUpRef.current
            .setLngLat(coordinates)
            .setDOMContent(popupNode)
            .addTo(map);
        });

        // Change the cursor to a pointer when the mouse is over the places layer.
        map.on("mouseenter", "wells", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        // Change it back to a pointer when it leaves.
        map.on("mouseleave", "wells", () => {
          map.getCanvas().style.cursor = "";
        });
      }
    }
  }, [isLoading, mapIsLoaded, map, data]); //eslint-disable-line

  //filters the table based on the selected radioValues filters
  useEffect(() => {
    if (map !== undefined && map.getLayer("wells")) {
      map.setFilter("wells", [
        "in",
        ["get", "index"],
        ["literal", selectedAquiferWells],
      ]);
    }
  }, [selectedAquiferWells]); // eslint-disable-line

  useEffect(() => {
    if (map !== undefined && map.getLayer("wells")) {
      map.setPaintProperty("wells", "circle-stroke-width", [
        "case",
        ["in", ["get", "index"], ["literal", selectedWells]],
        5,
        1,
      ]);
      map.setPaintProperty("wells", "circle-stroke-color", [
        "case",
        ["in", ["get", "index"], ["literal", selectedWells]],
        lineColors.red,
        "black",
      ]);
    }
  }, [selectedWells]); //eslint-disable-line

  if (error) return "An error has occurred: " + error.message;

  return (
    <Root>
      <MapContainer ref={mapContainer} />
    </Root>
  );
};

export default TimeseriesComparisonMap;
