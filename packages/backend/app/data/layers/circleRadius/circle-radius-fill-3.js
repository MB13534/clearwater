module.exports = {
  id: 'search-circle-radius-fill-3',
  name: 'Search Circle Radius',
  type: 'fill',
  source: {
    type: 'geojson',
    data: {type: 'FeatureCollection', features: []},
  },
  drawOrder: -91,
  legendOrder: 100,
  paint: {
    'fill-color': '#F2D373',
    'fill-opacity': 0.1,
  },
  layout: {
    visibility: 'visible',
  },
  lreProperties: {
    layerGroup: 'Search Radius Rings',
    popup: {
      blockPopup: true,
    },
  },
};
