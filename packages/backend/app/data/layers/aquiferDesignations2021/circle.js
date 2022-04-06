module.exports = {
  id: 'aquifer-designations-2021-circle',
  name: '🔒 CUWCD Aquifer Designations 2021',
  type: 'circle',
  source: 'aquifer-designations-2021',
  'source-layer': 'CUWCD_AquiferDesignation2021_-5ws4s1',
  drawOrder: -101,
  // legendOrder: 101,
  paint: {
    'circle-color': '#3cb44b',
    'circle-radius': 4,
    'circle-stroke-width': 1,
    'circle-stroke-color': 'black',
  },
  layout: {
    visibility: 'none',
  },
  lreProperties: {
    permissions: {
      roles: ['Administrator', 'Developer'],
    },
  },
};
