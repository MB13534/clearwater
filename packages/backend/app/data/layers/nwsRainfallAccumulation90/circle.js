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
      ['<', ['get', 'accumulated_90day'], 4.0],
      '#FE0000',
      ['<', ['get', 'accumulated_90day'], 4.8],
      '#FFFB00',
      ['<', ['get', 'accumulated_90day'], 5.6],
      '#009A00',
      ['<', ['get', 'accumulated_90day'], 6.4],
      '#009AFF',
      ['>=', ['get', 'accumulated_90day'], 6.4],
      '#0030FF',
      'white',
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
