module.exports = {
  id: 'search-circle-radius-fill-1',
  name: 'Search Circle Radius',
  type: 'fill',
  source: {
    type: 'geojson',
    data: {type: 'FeatureCollection', features: []},
  },
  drawOrder: -90,
  legendOrder: 100,
  paint: {
    'fill-color': 'hsl(45.4,83.3%,50.1%)',
    'fill-opacity': 0.5,
  },
  layout: {
    visibility: 'visible',
  },
  lreProperties: {
    layerGroup: 'Search Radius Rings',
  },
};
