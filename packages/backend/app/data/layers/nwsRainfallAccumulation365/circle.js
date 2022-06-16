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
      ['<', ['get', 'accumulated_365day'], 22],
      'purple',
      ['<', ['get', 'accumulated_365day'], 25],
      'red',
      ['<', ['get', 'accumulated_365day'], 28],
      'orange',
      ['<', ['get', 'accumulated_365day'], 31],
      '#ffe119',
      ['<', ['get', 'accumulated_365day'], 33],
      'green',
      ['>=', ['get', 'accumulated_365day'], 33],
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
    layerGroup: 'NWS-rainfall-accumulation-365',
    popup: {
      // titleField: 'cuwcd_well_number',
      excludeFields: ['lat', 'lon', 'geometry', 'xymeters'],
    },
  },
};
