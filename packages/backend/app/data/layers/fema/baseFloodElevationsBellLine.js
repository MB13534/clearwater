module.exports = {
  id: 'fema-base-flood-elevation-bell-line',
  name: 'FEMA Flood Elevations',
  type: 'line',
  drawOrder: 100,
  source: 'fema-base-flood-elevation-bell',
  'source-layer': 'FEMA_Bell_S_BFE-3gheia',
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
