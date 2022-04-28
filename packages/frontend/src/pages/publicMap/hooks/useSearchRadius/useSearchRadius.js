import { useEffect, useState } from "react";
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
  buffer1: {
    color: "#bf810f",
    layerIdPrefix: "search-circle-radius",
    bufferAmount: 0.25,
    units: "miles",
  },
  buffer2: {
    color: "#f27d65",
    layerIdPrefix: "search-circle-radius",
    bufferAmount: 0.5,
    units: "miles",
  },
  buffer3: {
    color: "#f27d65",
    layerIdPrefix: "search-circle-radius",
    bufferAmount: 0,
    units: "miles",
  },
  buffer4: {
    color: "#f27d65",
    layerIdPrefix: "search-circle-radius",
    bufferAmount: 0,
    units: "miles",
  },
};

const EMPTY_GEOJSON = {
  type: "FeatureCollection",
  features: [],
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
  return Object.values(radiusBuffers).map(
    ({ color, layerIdPrefix, bufferAmount, units }) => ({
      color,
      layerIdPrefix,
      bufferAmount,
      units,
    })
  );
}

let cumulativeBuffers = {};

/**
 * Custom React hook used to manage all of the state
 * associated with the Search Radius control
 * @param {boolean} options.enabled Whether the control is enabled
 * i.e. currently being used/open
 * These references were helpful when building this out
 * https://labs.mapbox.com/education/proximity-analysis/selecting-within-a-distance/
 * http://turfjs.org/docs/#buffer
 * https://github.com/mapbox/mapbox-gl-js/blob/v1.9.0/CHANGELOG.md
 */
const useSearchRadius = ({ enabled = false }) => {
  const [controlEnabled, setControlEnabled] = useState(enabled);
  const [coordinates, setCoordinates] = useState(null);
  const [map, setMap] = useState(null);
  const [searchRadiusBuffers, setSearchRadiusBuffers] = useState(
    INIT_SEARCH_RADIUS_BUFFERS
  );

  /**
   * Event handler dedicated to updating the search radius
   * buffer configurations whenever the form inputs in the
   * search radius control are changed by the user
   * @param {object} event Native JS event object
   */
  const handleSearchRadiusBuffersChange = (event, bufferName) => {
    const { name, value } = event?.target;
    setSearchRadiusBuffers((prevState) => ({
      ...prevState,
      [bufferName]: {
        ...prevState[bufferName],
        [name]: value,
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
  const drawSearchRadiusBuffers = ({ coordinates, map }) => {
    if (!map || !controlEnabled) return;

    // clearSearchRadiusBuffers({ map });

    /**
     * Convert the search radius buffers state value associated with
     * the form control into an array and filter it down to just
     * the buffers where the user has provided a value
     */
    const radiusBuffersArray = convertRadiusBuffersToArray(
      searchRadiusBuffers
    )?.filter(({ bufferAmount }) => +bufferAmount > 0);

    /**
     * Loop through the populated buffers and generate the buffer circle
     * features and create the masks for rings 2, 3, and 4
     */
    const searchRadiusLayers = radiusBuffersArray.reduce(
      (acc, buffer, index) => {
        let bufferAmount = +buffer.bufferAmount;
        /**
         * The buffer rings are set up to be additive so we need to
         * make sure we reflect that in the math
         */

        //MJB removed to make each circle from the center, rather than additive
        // if (index > 0) {
        //   bufferAmount = +acc[index - 1].bufferAmount + bufferAmount;
        // }
        const searchRadius = createRadiusFeature(
          coordinates,
          bufferAmount,
          buffer.units
        );
        if (index === 0) {
          acc.push({
            color: buffer.color,
            layerIdPrefix: buffer.layerIdPrefix,
            data: searchRadius,
            bufferAmount,
          });
          return acc;
        }
        const maskedSearchRadius = createMask(
          acc[index - 1].data,
          searchRadius
        );
        acc.push({
          color: buffer.color,
          layerIdPrefix: buffer.layerIdPrefix,
          data: maskedSearchRadius,
          bufferAmount,
        });
        return acc;
      },
      []
    );

    /**
     * TODO make sure to grab the existing layers in addition to the new
     * ones that just got added and loop through and add them to map
     * Set the data for the layer associated with each buffer circle
     * to the generated feature
     */
    searchRadiusLayers.forEach((layer, index) => {
      if (!cumulativeBuffers[`${layer.layerIdPrefix}-line-${index + 1}`]) {
        cumulativeBuffers[`${layer.layerIdPrefix}-line-${index + 1}`] = [
          layer.data,
        ];
      } else {
        cumulativeBuffers[`${layer.layerIdPrefix}-line-${index + 1}`].push(
          layer.data
        );
      }

      if (!cumulativeBuffers[`${layer.layerIdPrefix}-fill-${1}`]) {
        cumulativeBuffers[`${layer.layerIdPrefix}-fill-${1}`] = [layer.data];
      } else {
        cumulativeBuffers[`${layer.layerIdPrefix}-fill-${1}`].push(layer.data);
      }

      map.getSource(`${layer.layerIdPrefix}-line-${index + 1}`).setData({
        type: "FeatureCollection",
        features: cumulativeBuffers[`${layer.layerIdPrefix}-line-${index + 1}`],
      });
      //mjb change index from 0 to -1 to and length from 1 to 0 to make a single circle have a border
      // if (index > 0 && searchRadiusLayers?.length > 1) {
      //   map.getSource(`${layer.layerIdPrefix}-line-${index + 1}`).setData({
      //     type: "FeatureCollection",
      //     features:
      //       cumulativeBuffers[`${layer.layerIdPrefix}-line-${index + 1}`],
      //   });
      // }
    });

    map.getSource("search-circle-radius-fill-1").setData({
      type: "FeatureCollection",
      features: cumulativeBuffers["search-circle-radius-fill-1"],
    });

    /**
     * TODO determine if client wants this
     * Generate some data driven styles for the circle color
     * paint property for the clearwater wells layer
     * We distinctly color the wells that intersect the buffers
     * TODO make sure to handle dynamic well styles that are set in the UI
     * and use those as fallback value
     * instead of color to keep it simple
     */
    // const circleColorExpression = searchRadiusLayers
    //   .map((layer) => {
    //     return [["==", ["within", layer?.data], true], layer?.color];
    //   })
    //   .flat();

    // circleColorExpression.unshift("case");
    // circleColorExpression.push("#1e8dd2");

    // map.setPaintProperty(
    //   "clearwater-wells-circle",
    //   "circle-color",
    //   circleColorExpression
    // );
  };

  const addBuffersToMap = ({ coordinates, map }) => {
    setCoordinates(coordinates);
    setMap(map);
  };

  useEffect(() => {
    drawSearchRadiusBuffers({
      map,
      coordinates,
    });
  }, [coordinates, map]); //eslint-disable-line

  /**
   * Handler responsible for clearing the radius buffer circles from the map
   * and resetting the clearwater wells styles
   * TODO make sure to handle dynamic well styles that are set in the UI
   * TODO potentially just change opacity for non-intersected features
   * instead of color to keep it simple
   * @param {object} options.map Mapbox GL map instance to update
   */
  const clearSearchRadiusBuffers = () => {
    //MJB ADDED THIS CHECK
    if (!map || !controlEnabled) return;

    const radiusBuffersArray = convertRadiusBuffersToArray(searchRadiusBuffers);
    cumulativeBuffers = {};

    radiusBuffersArray.forEach((layer, index) => {
      map
        .getSource(`${layer.layerIdPrefix}-fill-${index + 1}`)
        .setData(EMPTY_GEOJSON);
      map
        .getSource(`${layer.layerIdPrefix}-line-${index + 1}`)
        .setData(EMPTY_GEOJSON);
    });
  };

  /**
   * Handler for resetting the radius buffers form back to the initial state
   */
  const resetSearchRadiusBuffers = () => {
    setSearchRadiusBuffers(INIT_SEARCH_RADIUS_BUFFERS);
  };

  return {
    addBuffersToMap,
    controlEnabled,
    drawSearchRadiusBuffers,
    handleClearSearchRadiusBuffers: clearSearchRadiusBuffers,
    handleControlEnabled: setControlEnabled,
    handleSearchRadiusBuffersChange,
    resetSearchRadiusBuffers,
    searchRadiusBuffers,
  };
};

export default useSearchRadius;
