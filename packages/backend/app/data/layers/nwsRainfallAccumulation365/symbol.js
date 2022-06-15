module.exports = {
  id: 'NWS-rainfall-accumulation-365-symbol',
  name: 'NWS Rainfall Accumulation for the Last 365 Days Labels',
  type: 'symbol',
  source: 'NWS-rainfall-accumulation',
  drawOrder: -100,
  legendOrder: 98,
  layout: {
    'text-field': ['get', 'accumulated_365day'],
    'text-size': 14,
    'text-offset': [0, -1.2],
    'text-font': ['literal', ['Roboto Black', 'Arial Unicode MS Bold']],
    visibility: 'none',
  },
  paint: {
    'text-color': 'rgb(49,49,49)',
    'text-halo-color': 'rgba(255,255,255,1)',
    'text-halo-width': 3,
  },
  lreProperties: {
    layerGroup: 'NWS-rainfall-accumulation-365',
    popup: {
      // excludePopup: true,
    },
  },
};
