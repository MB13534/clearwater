module.exports = {
  id: 'fema-flood-plains-milam-fill',
  name: 'FEMA',
  type: 'fill',
  source: 'fema-flood-plains-milam',
  'source-layer': 'FEMA_Milam_S_FLD_HAZ_AR-ckbcnb',
  paint: {
    'fill-color': 'hsl(217, 80%, 70%)',
    'fill-opacity': 0.38,
  },
  layout: {
    visibility: 'none',
  },
  lreProperties: {
    layerGroup: 'fema',
  },
};
