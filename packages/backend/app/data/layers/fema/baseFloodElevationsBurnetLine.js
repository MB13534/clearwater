module.exports = {
  id: 'fema-base-flood-elevation-burnet-line',
  name: 'FEMA Flood Elevations',
  drawOrder: 100,
  type: 'line',
  source: 'fema-base-flood-elevation-burnet',
  'source-layer': 'FEMA_Burnet_S_BFE-4ws3y2',
  paint: {
    'line-color': '#444',
    'line-width': 2,
  },
  layout: {
    visibility: 'none',
  },
  lreProperties: {
    layerGroup: 'fema',
  },
};
