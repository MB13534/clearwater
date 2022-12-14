module.exports = {
  id: 'fema-base-flood-elevation-milam-symbol',
  name: 'FEMA Flood Elevations',
  drawOrder: 100,
  type: 'symbol',
  source: 'fema-base-flood-elevation-milam',
  'source-layer': 'FEMA_Milam_S_BFE-2wkgfk',
  paint: {
    'text-color': 'rgb(49,49,49)',
    'text-halo-color': 'rgba(255,255,255,1)',
    'text-halo-width': 6,
  },
  layout: {
    'symbol-placement': 'line',
    'text-field': ['concat', ['to-string', ['get', 'ELEV']], ' ft'],
    'text-size': 14,
    'text-font': ['literal', ['Roboto Black', 'Arial Unicode MS Bold']],
    visibility: 'none',
  },
  lreProperties: {
    layerGroup: 'fema',
  },
};
