module.exports = {
  id: 'search-circle-radius-line-4',
  name: 'Search Circle Radius',
  type: 'line',
  source: {
    type: 'geojson',
    data: {type: 'FeatureCollection', features: []},
  },
  drawOrder: -100,
  legendOrder: 100,
  paint: {
    'line-color': '#ff9900',
    'line-dasharray': [2, 1],
    'line-width': 2,
  },
  layout: {
    visibility: 'visible',
  },
  lreProperties: {
    layerGroup: 'Search Radius Rings',
    popup: {
      excludePopup: true,
    },
  },
};
