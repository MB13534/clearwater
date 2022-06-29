module.exports = {
  id: 'NWS-rainfall-accumulation-30-circle',
  name: 'NWS Rainfall Accumulation for the Last 30 Days',
  type: 'circle',
  source: 'NWS-rainfall-accumulation',
  drawOrder: -100,
  legendOrder: 96,
  paint: {
    'circle-color': [
      'case',
      ['<', ['get', 'accumulated_30day'], 1.3],
      '#FE0000',
      ['<', ['get', 'accumulated_30day'], 1.6],
      '#FFFB00',
      ['<', ['get', 'accumulated_30day'], 1.9],
      '#009A00',
      ['<', ['get', 'accumulated_30day'], 2.1],
      '#009AFF',
      ['>=', ['get', 'accumulated_30day'], 2.1],
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
    layerGroup: 'NWS-rainfall-accumulation-30',
    popup: {
      // titleField: 'cuwcd_well_number',
      excludeFields: ['lat', 'lon', 'geometry', 'xymeters'],
    },
  },
};
