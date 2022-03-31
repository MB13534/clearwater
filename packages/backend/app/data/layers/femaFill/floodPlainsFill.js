// const {lineColors} = require('lre-up-frontend/src/utils');
module.exports = {
  id: 'fema-flood-plains-fill',
  name: 'FEMA Flood Zones',
  type: 'fill',
  drawOrder: 101,
  source: 'fema-flood-plains',
  'source-layer': 'FEMA_Combined_S_FLD_HAZ_AR_re-a2ttzg',
  paint: {
    'fill-color': [
      'match',
      ['get', 'Zone'],
      ['0.2 PCT ANNUAL CHANCE FLOOD HAZARD'],
      'hsl(262,72%,61%)',
      ['FLOODWAY'],
      'hsl(230,100%,19%)',
      'rgba(0,0,0,0)',
    ],
    'fill-opacity': 0.38,
  },
  layout: {
    visibility: 'none',
  },
  lreProperties: {
    layerGroup: 'fema-fill',
  },
};
