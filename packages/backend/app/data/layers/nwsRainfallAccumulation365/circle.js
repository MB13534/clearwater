module.exports = {
  id: 'NWS-rainfall-accumulation-365-circle',
  name: 'NWS Rainfall Accumulation for the Last 365 Days',
  type: 'circle',
  source: 'NWS-rainfall-accumulation',
  drawOrder: -100,
  legendOrder: 98,
  paint: {
    'circle-color': [
      'case',
      ['<', ['get', 'accumulated_365day'], 16.1],
      '#FE0000',
      ['<', ['get', 'accumulated_365day'], 19.4],
      '#FFFB00',
      ['<', ['get', 'accumulated_365day'], 22.7],
      '#009A00',
      ['<', ['get', 'accumulated_365day'], 26.0],
      '#009AFF',
      ['>=', ['get', 'accumulated_365day'], 26.0],
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
    layerGroup: 'NWS-rainfall-accumulation-365',
    popup: {
      // titleField: 'cuwcd_well_number',
      excludeFields: ['lat', 'lon', 'geometry', 'xymeters'],
    },
  },
};
