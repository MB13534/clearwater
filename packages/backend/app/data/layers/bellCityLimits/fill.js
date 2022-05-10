module.exports = {
  id: 'bell-city-limits-fill',
  name: 'Bell CAD City Limits',
  type: 'fill',
  source: 'bell-city-limits',
  'source-layer': 'Bell_CAD_City_Limits-141v43',
  paint: {
    'fill-color': 'hsl(264,100%,65%)',
    'fill-opacity': 0.32,
  },
  layout: {
    visibility: 'none',
  },
  lreProperties: {
    layerGroup: 'bell-city-limits',
    popup: {
      titleField: 'NAME',
    },
  },
};
