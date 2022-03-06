import { useState } from "react";
import * as turfHelpers from "@turf/helpers";
import buffer from "@turf/buffer";
import mask from "@turf/mask";

const INIT_SEARCH_RADIUS_BUFFERS = {
  "buffer-1": {
    color: "#bf810f",
    layerId: "search-radius-circle-1",
    value: 5000,
    unit: "meters",
  },
  "buffer-2": {
    color: "#f27d65",
    layerId: "search-radius-circle-2",
    value: 8000,
    unit: "meters",
  },
  "buffer-3": {
    color: "#f27d65",
    layerId: "search-radius-circle-3",
    value: 0,
    unit: "meters",
  },
  "buffer-4": {
    color: "#f27d65",
    layerId: "search-radius-circle-4",
    value: 0,
    unit: "meters",
  },
};

function createRadius(coords, radius, units) {
  const point = turfHelpers.point(coords);
  const buffered = buffer(point, radius, {
    units: "units",
  });
  return buffered;
}

function createMask(polygon1, polygon2) {
  return mask(polygon1, polygon2);
}

const useSearchRadius = ({ enabled = false }) => {
  const [controlEnabled, setControlEnabled] = useState(enabled);
  const [controlUnits, setControlUnits] = useState("meters");
  const [searchRadiusBuffers, setSearchRadiusBuffers] = useState(
    INIT_SEARCH_RADIUS_BUFFERS
  );

  const handleSearchRadiusBuffersChange = (event) => {
    const { name, value } = event?.target;
    setSearchRadiusBuffers((prevState) => ({
      ...prevState,
      [name]: {
        ...prevState[name],
        value: value,
      },
    }));
  };

  const drawSearchRadiusBuffers = ({ coordinates, controlEnabled, map }) => {
    if (!map || !controlEnabled) return;

    const validBuffersArray = Object.values(searchRadiusBuffers)
      .map(({ color, layerId, value }) => ({
        color,
        layerId,
        value,
      }))
      .filter(({ value }) => value > 0);

    const searchRadiusLayers = validBuffersArray.reduce(
      (acc, buffer, index) => {
        const searchRadius = createRadius(coordinates, buffer.value);
        if (index === 0) {
          acc.push({
            color: buffer.color,
            layerId: buffer.layerId,
            data: searchRadius,
          });
          return acc;
        }
        const maskedSearchRadius = createMask(
          acc[index - 1].data,
          searchRadius
        );
        acc.push({
          color: buffer.color,
          layerId: buffer.layerId,
          data: maskedSearchRadius,
        });
        return acc;
      },
      []
    );

    searchRadiusLayers.forEach((layer) => {
      map.getSource(layer.layerId).setData(layer.data);
    });

    const filterExpression = searchRadiusLayers
      .map((layer) => {
        return [["==", ["within", layer?.data], true], layer?.color];
      })
      .flat();

    filterExpression.unshift("case");
    filterExpression.push("#1e8dd2");

    map.setPaintProperty(
      "clearwater-wells-circle",
      "circle-color",
      filterExpression
    );
  };

  // TODO
  const clearSearchRadiusBuffers = ({ map }) => {};

  return {
    controlEnabled,
    controlUnits,
    drawSearchRadiusBuffers,
    searchRadiusBuffers,
    handleControlEnabled: setControlEnabled,
    handleControlUnitsChange: setControlUnits,
    handleSearchRadiusBuffersChange,
    handleClearSearchRadiusBuffers: clearSearchRadiusBuffers,
  };
};

export default useSearchRadius;
