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
      ['<', ['get', 'accumulated_30day'], 1.4],
      'purple',
      ['<', ['get', 'accumulated_30day'], 1.6],
      'red',
      ['<', ['get', 'accumulated_30day'], 2],
      'orange',
      ['<', ['get', 'accumulated_30day'], 2.4],
      '#ffe119',
      ['<', ['get', 'accumulated_30day'], 2.8],
      'green',
      ['>=', ['get', 'accumulated_30day'], 2.8],
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
    layerGroup: 'NWS-rainfall-accumulation-30',
    popup: {
      // titleField: 'cuwcd_well_number',
      excludeFields: ['lat', 'lon', 'geometry', 'xymeters'],
    },
  },
};
