module.exports = {
  id: 'NWS-rainfall-accumulation-90-circle',
  name: 'NWS Rainfall Accumulation for the Last 90 Days',
  type: 'circle',
  source: 'NWS-rainfall-accumulation',
  drawOrder: -100,
  legendOrder: 97,
  paint: {
    'circle-color': [
      'case',
      ['<', ['get', 'accumulated_90day'], 6.6],
      'purple',
      ['<', ['get', 'accumulated_90day'], 7.7],
      'red',
      ['<', ['get', 'accumulated_90day'], 8.4],
      'orange',
      ['<', ['get', 'accumulated_90day'], 9],
      '#ffe119',
      ['<', ['get', 'accumulated_90day'], 9.7],
      'green',
      ['>=', ['get', 'accumulated_90day'], 9.7],
      'blue',
      'black',
    ],
    'circle-radius': 8,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff',
  },
  layout: {
    visibility: 'none',
  },
  lreProperties: {
    booleanToggle: [
      'in_edwards',
      {
        all: 'CUWCD Management Area',
        true: 'Edwards Aquifer',
        false: 'Trinity Aquifer',
      },
      'Major Aquifer Filter',
    ],
    layerGroup: 'NWS-rainfall-accumulation-90',
    popup: {
      // titleField: 'cuwcd_well_number',
      excludeFields: ['lat', 'lon', 'geometry', 'xymeters'],
    },
  },
};
