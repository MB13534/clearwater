module.exports = {
  id: 'search-radius-circle-1',
  name: 'Search Radius',
  type: 'fill',
  source: {
    type: 'geojson',
    data: {type: 'FeatureCollection', features: []},
  },
  drawOrder: -100,
  legendOrder: 100,
  paint: {
    'fill-color': '#F1CF65',
    'fill-opacity': 0.6,
  },
  layout: {
    visibility: 'visible',
  },
  // lreProperties: {},
};
