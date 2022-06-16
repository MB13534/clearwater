module.exports = {
  id: 'NWS-rainfall-accumulation-30-symbol',
  name: 'NWS Rainfall Accumulation for the Last 30 Days Labels',
  type: 'symbol',
  source: 'NWS-rainfall-accumulation',
  drawOrder: -100,
  legendOrder: 96,
  layout: {
    'text-field': ['get', 'accumulated_30day'],
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
    layerGroup: 'NWS-rainfall-accumulation-30',
    labelGroup: 'NWS-rainfall-accumulation-30-symbol',
    popup: {
      // excludePopup: true,
    },
  },
};
