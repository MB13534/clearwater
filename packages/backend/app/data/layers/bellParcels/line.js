module.exports = {
  id: 'bell-parcels-line',
  name: 'Bell CAD Parcels',
  type: 'line',
  source: 'bell-parcels',
  'source-layer': 'parcels',
  paint: {
    'line-color': [
      'case',
      ['boolean', ['feature-state', 'clickToHighlight'], false],
      'yellow',
      '#E02A77',
    ],
    'line-width': [
      'case',
      ['boolean', ['feature-state', 'clickToHighlight'], false],
      6,
      2,
    ],
  },
  layout: {
    visibility: 'none',
  },
  lreProperties: {
    layerGroup: 'bell-parcels',
  },
};
