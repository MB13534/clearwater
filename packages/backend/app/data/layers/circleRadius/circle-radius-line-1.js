module.exports = {
  id: 'search-circle-radius-line-1',
  name: 'Search Circle Radius',
  type: 'line',
  source: {
    type: 'geojson',
    data: {type: 'FeatureCollection', features: []},
  },
  drawOrder: -92,
  legendOrder: 100,
  paint: {
    'line-color': 'hsl(45.4,83.3%,47.1%)',
    'line-dasharray': [2, 1],
    'line-width': 2,
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
