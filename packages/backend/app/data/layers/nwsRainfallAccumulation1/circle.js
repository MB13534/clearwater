module.exports = {
  id: 'NWS-rainfall-accumulation-1-circle',
  name: 'NWS Rainfall Accumulation for the Last 1 Day',
  type: 'circle',
  source: 'NWS-rainfall-accumulation',
  drawOrder: -100,
  legendOrder: 94,
  paint: {
    'circle-color': [
      'case',
      ['<', ['get', 'accumulated_1day'], 0.01],
      '#FE0000',
      ['<', ['get', 'accumulated_1day'], 0.03],
      '#FFFB00',
      ['<', ['get', 'accumulated_1day'], 0.07],
      '#009A00',
      ['<', ['get', 'accumulated_1day'], 0.1],
      '#009AFF',
      ['>=', ['get', 'accumulated_1day'], 0.1],
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
    layerGroup: 'NWS-rainfall-accumulation-1',
    popup: {
      // titleField: 'cuwcd_well_number',
      excludeFields: ['lat', 'lon', 'geometry', 'xymeters'],
    },
  },
};
