module.exports = {
  id: 'bell-parcels-fill',
  name: 'Bell CAD Parcels',
  type: 'fill',
  source: 'bell-parcels',
  'source-layer': 'parcels',
  paint: {
    'fill-color': [
      'case',
      ['boolean', ['feature-state', 'clickToHighlight'], false],
      'yellow',
      '#E02A77',
    ],
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'clickToHighlight'], false],
      0.3,
      0,
    ],
  },
  layout: {
    visibility: 'none',
  },
  lreProperties: {
    layerGroup: 'bell-parcels',
    popup: {
      titleField: 'PROP_ID',
    },
  },
};
