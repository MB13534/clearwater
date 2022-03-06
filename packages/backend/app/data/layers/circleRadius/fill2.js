module.exports = {
  id: 'search-radius-circle-2',
  name: 'Search Radius 2',
  type: 'fill',
  source: {
    type: 'geojson',
    data: {type: 'FeatureCollection', features: []},
  },
  drawOrder: -99,
  legendOrder: 100,
  paint: {
    'fill-color': '#f27d65',
    'fill-opacity': 0.6,
  },
  layout: {
    visibility: 'visible',
  },
  // lreProperties: {},
};
