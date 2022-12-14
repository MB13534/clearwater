import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useSelector } from "react-redux";

import { ThemeProvider as MuiThemeProvider } from "@material-ui/styles";
import styled, { ThemeProvider } from "styled-components/macro";
import { jssPreset, StylesProvider } from "@material-ui/core/styles";
import { create } from "jss";
import createTheme from "../../theme";

import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { STARTING_LOCATION } from "../../constants";
import * as MapboxDrawGeodesic from "mapbox-gl-draw-geodesic";
import { RulerControl } from "mapbox-gl-controls";
import ResetZoomControl from "./ResetZoomControl";
import DragCircleControl from "./DragCircleControl";
import {
  bellParcelsFill,
  bellParcelsLine,
  bellParcelsSymbol,
  DUMMY_BASEMAP_LAYERS,
  eagleView2022,
  handleCopyCoords,
  locationsLabelsLayer,
  locationsLayer,
  onPointClickSetCoordinateRefs,
  updateArea,
} from "../../utils/map";
import "mapbox-gl-controls/lib/controls.css";
import CoordinatesPopup from "./components/CoordinatesPopup";
import MeasurementsPopup from "./components/MeasurementsPopup";
import MainPopup from "./components/MainPopup";

import { useApp } from "../../AppProvider";
import debounce from "lodash.debounce";
import { isTouchScreenDevice } from "../../utils";
import Search from "./components/search";
import { coordinatesGeocoder } from "../../pages/publicMap/hooks/useMap/mapUtils";
import MeasurementsControl from "../../pages/publicMap/controls/MeasurementsControl";
import ParcelsControl from "./ParcelsControl";
import EagleViewControl from "./EagleViewControl";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const jss = create({
  ...jssPreset(),
  insertionPoint: document.getElementById("jss-insertion-point"),
});

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const DashboardMap = ({
  data,
  isLoading,
  error,
  setCurrentSelectedPoint,
  radioValue,
  map,
  setMap,
  currentlyPaintedPointRef,
  coordinatesContainerRef,
  longRef,
  latRef,
  eleRef,
  setRadioValue = null,
  defaultFilterValue,
}) => {
  const theme = useSelector((state) => state.themeReducer);
  const { currentUser } = useApp();

  const [mapIsLoaded, setMapIsLoaded] = useState(false);

  const [parcelsVisible, setParcelsVisible] = useState(false);
  const [eagleViewVisible, setEagleViewVisible] = useState(false);
  const [measurementsVisible, setMeasurementsVisible] = useState(false);
  const polygonRef = useRef(null);
  const radiusRef = useRef(null);
  const pointRef = useRef(null);
  const lineRef = useRef(null);
  const measurementsContainerRef = useRef(null);
  const mapContainerRef = useRef(null); // create a reference to the map container
  const popUpRef = useRef(
    new mapboxgl.Popup({ maxWidth: "310px", offset: 15, focusAfterOpen: false })
  );

  //adds control features as extended by MapboxDrawGeodesic (draw circle)
  let modes = MapboxDraw.modes;
  modes = MapboxDrawGeodesic.enable(modes);

  const [draw] = useState(
    new MapboxDraw({
      modes,
      controls: {
        polygon: true,
        point: true,
        trash: true,
        line_string: true,
      },
      displayControlsDefault: false,
      userProperties: true,
    })
  );

  useEffect(() => {
    measurementsVisible
      ? (measurementsContainerRef.current.style.display = "block")
      : (measurementsContainerRef.current.style.display = "none");
  }, [measurementsVisible]);

  //create map and apply all controls
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/" + DUMMY_BASEMAP_LAYERS[0].url,
      center: STARTING_LOCATION,
      zoom: 9,
    });

    //event listener to run function updateArea during each draw action to handle measurements popup
    const drawActions = ["draw.create", "draw.update", "draw.delete"];
    drawActions.forEach((item) => {
      map.on(item, (event) => {
        const geojson = event.features[0];
        const type = event.type;
        updateArea(
          geojson,
          type,
          polygonRef,
          radiusRef,
          pointRef,
          lineRef,
          measurementsContainerRef,
          draw,
          setMeasurementsVisible
        );
      });
    });

    //top left controls
    map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        localGeocoder: coordinatesGeocoder,
        zoom: 16,
        mapboxgl: mapboxgl,
        reverseGeocode: true,
        placeholder: "Address/Coords Search",
      }),
      "top-left"
    );
    map.addControl(new mapboxgl.NavigationControl(), "top-left");
    map.addControl(new mapboxgl.FullscreenControl(), "top-left");
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
    map.addControl(new ResetZoomControl(), "top-left");

    //top right controls
    //loop through each base layer and add a layer toggle for that layer
    // DUMMY_BASEMAP_LAYERS.forEach((layer) => {
    //   return map.addControl(
    //     new ToggleBasemapControl(layer.url, layer.icon),
    //     "top-right"
    //   );
    // });

    //bottom right controls
    //draw controls do not work correctly on touch screens
    !isTouchScreenDevice() &&
      map.addControl(draw, "bottom-right") &&
      !isTouchScreenDevice() &&
      map.addControl(new DragCircleControl(draw), "bottom-right");

    //bottom left controls
    map.addControl(
      new mapboxgl.ScaleControl({ unit: "imperial" }),
      "bottom-left"
    );
    map.addControl(
      new RulerControl({
        units: "feet",
        labelFormat: (n) => `${n.toFixed(2)} ft`,
      }),
      "bottom-left"
    );

    map.on("load", () => {
      setMapIsLoaded(true);
      setMap(map);
    });
  }, []); // eslint-disable-line

  //resizes map when mapContainerRef dimensions changes (sidebar toggle)
  useEffect(() => {
    if (map) {
      const resizer = new ResizeObserver(debounce(() => map.resize(), 100));
      resizer.observe(mapContainerRef.current);
      return () => {
        resizer.disconnect();
      };
    }
  }, [map]);

  //add source and layers
  //add event listeners
  useEffect(() => {
    if (mapIsLoaded && data?.length > 0 && typeof map != "undefined") {
      if (!map.getSource("locations")) {
        if (!map.getSource("eagleview-2022")) {
          map.addSource("eagleview-2022", {
            id: "eagleview-2022",
            type: "raster",
            tiles: [
              "https://svc.pictometry.com/Image/0E62A373-C685-DE24-B0F3-5457065B8906/tms/1.0.0/PICT-TXBELL21-FtF1JSWF8D/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
          });
          map.addLayer(eagleView2022, "gl-draw-polygon-fill-inactive.cold");
        }

        if (!map.getSource("bell-parcels")) {
          map.addSource("bell-parcels", {
            type: "vector",
            url: "mapbox://txclearwater.bell_cad_parcels",
          });

          map.addLayer(bellParcelsFill);
          map.addLayer(bellParcelsLine);
          map.addLayer(bellParcelsSymbol);
        }

        map.addSource("locations", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: data.map((location) => {
              return {
                type: "Feature",
                id: location.well_ndx,
                //no loop to create properties to customize the keys for a pretty popup
                properties: {
                  ...location,
                  ...{
                    is_well_owner: location?.authorized_users?.includes(
                      currentUser.sub
                    ),
                  },
                },
                geometry: {
                  type: location.location_geometry.type,
                  coordinates: location.location_geometry.coordinates,
                },
              };
            }),
          },
        });
        //add a layer showing the blue points, yellow/thick border when hovered.
        //if the user matches the id, the point is orange
        if (!map.getLayer("locations")) {
          map.addLayer(locationsLayer);

          //add labels for locations points
          map.addLayer(locationsLabelsLayer);
        }

        //makes currently selected point yellow
        //removes previously yellow colored point
        map.on("click", "locations", (e) => {
          if (e.features.length > 0) {
            if (currentlyPaintedPointRef.current) {
              map.setFeatureState(
                { source: "locations", id: currentlyPaintedPointRef.current },
                { clicked: false }
              );
            }
            currentlyPaintedPointRef.current = e.features[0].id;
            map.setFeatureState(
              { source: "locations", id: e.features[0].id },
              { clicked: true }
            );
          }
        });

        //set well number used to fetch data for graph
        //fly to point
        map.on("click", "locations", (e) => {
          setCurrentSelectedPoint(e.features[0].properties.cuwcd_well_number);
          map.flyTo({
            center: [
              e.features[0].properties.longitude_dd,
              e.features[0].properties.latitude_dd,
            ],
            zoom: 14,
            padding: { bottom: 250 },
          });
        });

        //sets ref.current.innerHTMLs for coordinates popup
        map.on("click", "locations", (e) =>
          onPointClickSetCoordinateRefs(
            coordinatesContainerRef,
            longRef,
            latRef,
            eleRef,
            e.features[0].properties.latitude_dd,
            e.features[0].properties.longitude_dd
          )
        );

        //handles main point click popup for LOCATIONS ONLY
        map.on("click", "locations", (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          // // Ensure that if the map is zoomed out such that multiple
          // // copies of the feature are visible, the popup appears
          // // over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          const excludedPopupFields = [
            "id",
            "has_production",
            "has_waterlevels",
            "has_wqdata",
            "well_ndx",
            "location_geometry",
            "authorized_users",
            "is_well_owner",
            "tableData",
            "is_permitted",
            "is_exempt",
            "is_monitoring",
            "well_type",
            "tableData",
          ];

          let feature = e.features[0];

          const popupNode = document.createElement("div");
          ReactDOM.render(
            //MJB adding style providers to the popup
            <StylesProvider jss={jss}>
              <MuiThemeProvider theme={createTheme(theme.currentTheme)}>
                <ThemeProvider theme={createTheme(theme.currentTheme)}>
                  <MainPopup
                    excludeFields={excludedPopupFields}
                    feature={feature}
                    currentUser={currentUser}
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

          map.on("closeAllPopups", () => {
            popUpRef.current.remove();
          });
        });

        //click event for popups other than LOCATIONS
        map.on("click", (e) => {
          const features = map.queryRenderedFeatures(e.point);
          const coordinates = [e.lngLat.lng, e.lngLat.lat];
          //MJB add check for popups so they only appear on our dynamic layers
          const popupLayerIds = [
            "bell-parcels-fill",
            "bell-parcels-line",
            "bell-parcels-symbol",
          ];

          if (
            features.length > 0 &&
            popupLayerIds.includes(features[0].layer.id)
          ) {
            const feature = features[0];

            // create popup node
            const popupNode = document.createElement("div");
            ReactDOM.render(
              //MJB adding style providers to the popup
              <StylesProvider jss={jss}>
                <MuiThemeProvider theme={createTheme(theme.currentTheme)}>
                  <ThemeProvider theme={createTheme(theme.currentTheme)}>
                    <MainPopup
                      excludeFields={[]}
                      feature={feature}
                      currentUser={currentUser}
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
          }
        });

        // //handles copying coordinates and measurements to the clipboard
        const copyableRefs = [
          longRef,
          latRef,
          eleRef,
          polygonRef,
          radiusRef,
          pointRef,
          lineRef,
        ];
        copyableRefs.forEach((ref) => {
          ref.current.addEventListener("click", (e) =>
            handleCopyCoords(e.target.textContent)
          );
        });

        // Change the cursor to a pointer when the mouse is over the places layer.
        map.on("mouseenter", "locations", () => {
          map.getCanvas().style.cursor = "pointer";

          map.on("mouseleave", "locations", () => {
            map.getCanvas().style.cursor = "";
          });
        });

        //changes the border of the hovered point to yellow and a thicker border
        let hoverID = null;
        map.on("mousemove", "locations", (e) => {
          if (e.features.length === 0) return;

          //removes hover-state border if the hovered hoverID changes
          if (hoverID) {
            map.setFeatureState(
              {
                source: "locations",
                id: hoverID,
              },
              {
                hover: false,
              }
            );
          }

          hoverID = e.features[0].id;

          //adds hover-state border
          map.setFeatureState(
            {
              source: "locations",
              id: hoverID,
            },
            {
              hover: true,
            }
          );
        });

        // When the mouse leaves the currently hovered item, change the border back to normal
        map.on("mouseleave", "locations", () => {
          if (hoverID) {
            map.setFeatureState(
              {
                source: "locations",
                id: hoverID,
              },
              {
                hover: false,
              }
            );
          }
          hoverID = null;
        });

        //all layers need to load, then filter out those that don't have production
        setRadioValue && setRadioValue(defaultFilterValue);
      }
    }
  }, [isLoading, mapIsLoaded, map, data]); // eslint-disable-line

  const bellParcelLayers = [
    "bell-parcels-fill",
    "bell-parcels-line",
    "bell-parcels-symbol",
  ];
  useEffect(() => {
    if (
      map !== undefined &&
      map.getLayer("bell-parcels-fill") &&
      map.getLayer("bell-parcels-line") &&
      map.getLayer("bell-parcels-symbol")
    ) {
      if (!parcelsVisible) {
        bellParcelLayers.forEach((layer) =>
          map.setLayoutProperty(layer, "visibility", "none")
        );
      } else {
        bellParcelLayers.forEach((layer) =>
          map.setLayoutProperty(layer, "visibility", "visible")
        );
      }
    }
  }, [parcelsVisible]); // eslint-disable-line

  useEffect(() => {
    if (map !== undefined && map.getLayer("eagleview-2022")) {
      if (!eagleViewVisible) {
        map.setLayoutProperty("eagleview-2022", "visibility", "none");
      } else {
        map.setLayoutProperty("eagleview-2022", "visibility", "visible");
      }
    }
  }, [eagleViewVisible]); // eslint-disable-line

  //filters the table based on the selected radioValues filters
  useEffect(() => {
    if (map !== undefined && map.getLayer("locations")) {
      if (["all", "search"].includes(radioValue)) {
        map.setFilter("locations", null);
        map.setFilter("locations-labels", null);
      } else {
        map.setFilter("locations", ["get", radioValue]);
        map.setFilter("locations-labels", ["get", radioValue]);
      }
    }
  }, [data]); // eslint-disable-line

  if (error) return "An error has occurred: " + error.message;

  const handleClearMeasurements = () => {
    draw.deleteAll();
    polygonRef.current.innerHTML = "";
    radiusRef.current.innerHTML = "";
    pointRef.current.innerHTML = "";
    lineRef.current.innerHTML = "";
    setMeasurementsVisible(false);
  };

  return (
    <>
      <MapContainer ref={mapContainerRef}>
        {radioValue === "search" && (
          <Search map={map} radioValue={radioValue} />
        )}
        <EagleViewControl
          open={eagleViewVisible}
          onToggle={() => setEagleViewVisible(!eagleViewVisible)}
        />

        <ParcelsControl
          open={parcelsVisible}
          onToggle={() => setParcelsVisible(!parcelsVisible)}
          top={49}
        />

        <CoordinatesPopup
          coordinatesContainerRef={coordinatesContainerRef}
          longRef={longRef}
          latRef={latRef}
          eleRef={eleRef}
          title="Most recently selected well:"
        />
        <MeasurementsPopup
          measurementsContainerRef={measurementsContainerRef}
          radiusRef={radiusRef}
          polygonRef={polygonRef}
          pointRef={pointRef}
          lineRef={lineRef}
          onHide={() => setMeasurementsVisible(false)}
          onClear={handleClearMeasurements}
        />
      </MapContainer>
      {!measurementsVisible && (
        <MeasurementsControl
          open={measurementsVisible}
          onToggle={() => setMeasurementsVisible(!measurementsVisible)}
        />
      )}
    </>
  );
};

export default DashboardMap;
