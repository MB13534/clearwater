module.exports = {
  id: 'search-circle-radius-fill-1',
  name: 'Search Circle Radius',
  type: 'fill',
  source: {
    type: 'geojson',
    data: {type: 'FeatureCollection', features: []},
  },
  drawOrder: -90,
  legendOrder: 98,
  paint: {
    'fill-color': '#EAB616',
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
