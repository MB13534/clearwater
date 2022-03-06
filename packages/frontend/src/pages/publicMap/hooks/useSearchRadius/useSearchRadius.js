import { useState } from "react";
import * as turfHelpers from "@turf/helpers";
import buffer from "@turf/buffer";
import mask from "@turf/mask";

/**
 * The default values for the search radius control
 * The values are declared as an object vs an array
 * because it is easier and less expensive to update
 * the values by accessing an object key than looping
 * through and finding the specific object to update
 */
const INIT_SEARCH_RADIUS_BUFFERS = {
  "buffer-1": {
    color: "#bf810f",
    layerId: "search-radius-circle-1",
    value: 1,
    unit: "miles",
  },
  "buffer-2": {
    color: "#f27d65",
    layerId: "search-radius-circle-2",
    value: 2,
    unit: "miles",
  },
  "buffer-3": {
    color: "#f27d65",
    layerId: "search-radius-circle-3",
    value: 0,
    unit: "miles",
  },
  "buffer-4": {
    color: "#f27d65",
    layerId: "search-radius-circle-4",
    value: 0,
    unit: "miles",
  },
};

/**
 * Generates a GeoJSON circle feature based on the provided
 * coordinates, radius size, and units
 * @param {array} coords Lat/long array of the circle center
 * @param {number} radius Radius of the circle in the specified units
 * @param {string} units Radius units. Either miles or feet
 * @returns
 */
function createRadiusFeature(coords, radius, units) {
  const point = turfHelpers.point(coords);
  return buffer(point, radius, {
    units: units,
  });
}

/**
 * Generates a masked GeoJSON feature
 * For instance, if you had two concentric circles that completely overlap,
 * i.e. one large circle with a smaller one in the center,
 * the mask function could be used to remove the area of where the small
 * circle intersects the larger circle, resulting in a donut shape circle
 * This is useful for generating rings for the 2, 3, and 4 buffer rings
 * Using rings instead of circles allows us to avoid the less than desirable
 * opacity/styling effects of layering circles on top of each other
 * @param {object} polygonToSubtract The GeoJSON feature that should be "subtracted"
 * from the other feature. In the example described above, the "little" circle
 * @param {object} polygonToSubtractFrom The GeoJSON feature that will
 * be subtracted from. In the example described above, the "big" circle
 * @returns
 */
function createMask(polygonToSubtract, polygonToSubtractFrom) {
  return mask(polygonToSubtract, polygonToSubtractFrom);
}

/**
 * Converts the search radius buffer values object associated
 * with the form controls into an array of objects where each
 * object represents one of the buffer rings
 * @param {object} radiusBuffers Search radius buffer values
 * @returns
 */
function convertRadiusBuffersToArray(radiusBuffers) {
  return Object.values(radiusBuffers).map(({ color, layerId, value }) => ({
    color,
    layerId,
    value,
  }));
}

/**
 * Custom React hook used to manage all of the state
 * associated with the Search Radius control
 * @param {boolean} options.enabled Whether the control is enabled
 * i.e. currently being used/open
 */
const useSearchRadius = ({ enabled = false }) => {
  const [controlEnabled, setControlEnabled] = useState(enabled);
  const [controlUnits, setControlUnits] = useState("miles");
  const [searchRadiusBuffers, setSearchRadiusBuffers] = useState(
    INIT_SEARCH_RADIUS_BUFFERS
  );

  /**
   * Event handler dedicated to updating the search radius
   * buffer configurations whenever the form inputs in the
   * search radius control are changed by the user
   * @param {object} event Native JS event object
   */
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

  /**
   * Handler responsible for rendering circle feature for
   * each buffer that the user has provided a value for
   * The function adds the circles to the map as well as
   * updating the circle colors for all of the clearwater wells
   * intersected by the buffer circles
   * @param {array} options.coordinates Coordinates where the user clicked,
   * aka where the circles should be centered
   * @param {boolean} options.controlEnabled Boolean indicating whether the
   * search radius controls is enabled. If set to false, we exit the function
   * @param {object} options.map The Mapbox GL map instance that we
   * should add the layers too
   * @returns
   */
  const drawSearchRadiusBuffers = ({ coordinates, controlEnabled, map }) => {
    if (!map || !controlEnabled) return;

    /**
     * Convert the search radius buffers state value associated with
     * the form control into an array and filter it down to just
     * the buffers where the user has provided a value
     */
    const radiusBuffersArray = convertRadiusBuffersToArray(
      searchRadiusBuffers
    )?.filter(({ value }) => value > 0);

    /**
     * Loop through the populated buffers and generate the buffer circle
     * features and create the masks for rings 2, 3, and 4
     */
    const searchRadiusLayers = radiusBuffersArray.reduce(
      (acc, buffer, index) => {
        const searchRadius = createRadiusFeature(coordinates, buffer.value);
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

    /**
     * Set the data for the layer associated with each buffer circle
     * to the generated feature
     */
    searchRadiusLayers.forEach((layer) => {
      map.getSource(layer.layerId).setData(layer.data);
    });

    /**
     * Generate some data driven styles for the circle color
     * paint property for the clearwater wells layer
     * We distinctly color the wells that intersect the buffers
     * TODO make sure to handle dynamic well styles that are set in the UI
     */
    const circleColorExpression = searchRadiusLayers
      .map((layer) => {
        return [["==", ["within", layer?.data], true], layer?.color];
      })
      .flat();

    circleColorExpression.unshift("case");
    circleColorExpression.push("#1e8dd2");

    map.setPaintProperty(
      "clearwater-wells-circle",
      "circle-color",
      circleColorExpression
    );
  };

  /**
   * Handler responsible for clearing the radius buffer circles from the map
   * and resetting the clearwater wells styles
   * TODO make sure to handle dynamic well styles that are set in the UI
   * @param {object} options.map Mapbox GL map instance to update
   */
  const clearSearchRadiusBuffers = ({ map }) => {
    const radiusBuffersArray = convertRadiusBuffersToArray(searchRadiusBuffers);

    radiusBuffersArray.forEach((layer) => {
      map.getSource(layer.layerId).setData(null);
    });

    map.setPaintProperty("clearwater-wells-circle", "circle-color", "#1e8dd2");
  };

  return {
    controlEnabled,
    controlUnits,
    drawSearchRadiusBuffers,
    handleClearSearchRadiusBuffers: clearSearchRadiusBuffers,
    handleControlEnabled: setControlEnabled,
    handleControlUnitsChange: setControlUnits,
    handleSearchRadiusBuffersChange,
    searchRadiusBuffers,
  };
};

export default useSearchRadius;
