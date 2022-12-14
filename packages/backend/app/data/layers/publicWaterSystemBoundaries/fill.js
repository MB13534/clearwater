module.exports = {
  id: 'public-water-system-boundaries-fill',
  name: 'Public Water System Boundaries',
  type: 'fill',
  source: 'public-water-system-boundaries',
  'source-layer': 'PublicWaterSystem_Boundaries-85nriy',
  paint: {
    'fill-color': 'hsl(240, 96%, 60%)',
    'fill-opacity': 0.1,
  },
  layout: {
    visibility: 'none',
  },
  lreProperties: {
    layerGroup: 'public-water-system-boundaries',
    popup: {
      titleField: 'pwsName',
    },
  },
};
