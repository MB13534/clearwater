module.exports = {
  id: 'water-service-areas-fill',
  name: 'Water Service Areas',
  type: 'fill',
  source: 'water-service-areas',
  'source-layer': 'CCN_WATER_GCS_PUC-7ukl7v',
  paint: {
    'fill-color': 'hsl(200, 93%, 58%)',
    'fill-opacity': 0.18,
  },
  layout: {
    visibility: 'none',
  },
  lreProperties: {
    layerGroup: 'water-service-areas',
    popup: {
      titleField: 'UTILITY',
    },
  },
};
