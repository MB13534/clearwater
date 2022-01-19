module.exports = {
  id: 'bell-parcels-fill',
  name: 'Bell CAD Parcels',
  type: 'fill',
  source: 'bell-parcels',
  'source-layer': 'parcels',
  paint: {
    'fill-color': '#333',
    'fill-opacity': 0,
  },
  layout: {
    visibility: 'none',
  },
  lreProperties: {
    layerGroup: 'bell-parcels',
  },
};