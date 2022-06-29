module.exports = {
  id: 'NWS-rainfall-accumulation-7-circle',
  name: 'NWS Rainfall Accumulation for the Last 7 Days',
  type: 'circle',
  source: 'NWS-rainfall-accumulation',
  drawOrder: -100,
  legendOrder: 95,
  paint: {
    'circle-color': [
      'case',
      ['<', ['get', 'accumulated_7day'], 0.28],
      '#FE0000',
      ['<', ['get', 'accumulated_7day'], 0.35],
      '#FFFB00',
      ['<', ['get', 'accumulated_7day'], 0.42],
      '#009A00',
      ['<', ['get', 'accumulated_7day'], 0.47],
      '#009AFF',
      ['>=', ['get', 'accumulated_7day'], 0.47],
      '#0030FF',
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
    layerGroup: 'NWS-rainfall-accumulation-7',
    popup: {
      // titleField: 'cuwcd_well_number',
      excludeFields: ['lat', 'lon', 'geometry', 'xymeters'],
    },
  },
};
