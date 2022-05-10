// const {lineColors} = require('lre-up-frontend/src/utils');
module.exports = {
  id: 'fema-flood-plains-fill',
  name: 'FEMA Flood Zones',
  type: 'fill',
  drawOrder: 101,
  source: 'fema-flood-plains',
  'source-layer': 'FEMA_Combined_S_FLD_HAZ_AR-1h32ux',
  paint: {
    'fill-color': [
      'match',
      ['get', 'Zone'],
      ['A - Areas with a 1% annual chance of flooding'],
      '#7FD4F2',
      ['AE - The base floodplain where base flood elevations are provided'],
      '#B9D8FF',
      ['AE - Regulatory Floodway'],
      '#7FB7FF',
      ['AO - River or stream flood hazard areas'],
      '#71C5E4',
      ['X - 0.2% Annual Chance Flood Hazard'],
      '#FFD47F',
      '#C0C0C0',
    ],
    'fill-outline-color': [
      'match',
      ['get', 'Zone'],
      ['A - Areas with a 1% annual chance of flooding'],
      '#3F7DB3',
      ['AE - The base floodplain where base flood elevations are provided'],
      '#5C7FB9',
      ['AE - Regulatory Floodway'],
      '#3F6EB9',
      ['AO - River or stream flood hazard areas'],
      '#3F90B3',
      ['X - 0.2% Annual Chance Flood Hazard'],
      '#B9903F',
      '#ADADAD',
    ],
    'fill-opacity': 1,
  },
  layout: {
    visibility: 'none',
  },
  lreProperties: {
    layerGroup: 'fema-fill',
  },
};
