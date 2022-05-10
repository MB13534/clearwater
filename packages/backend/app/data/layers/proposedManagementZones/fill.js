module.exports = {
  id: 'proposed-management-zones-fill',
  name: '🔒 Proposed Management Zones',
  type: 'fill',
  source: 'proposed-management-zones',
  'source-layer': 'Proposed_Management_Zones-bd97ag',
  paint: {
    'fill-color': 'hsl(60,20%,18%)',
    'fill-opacity': 0,
  },
  layout: {
    visibility: 'none',
  },
  lreProperties: {
    popup: {
      titleField: 'Name',
    },
    layerGroup: 'proposed-management-zones',
    permissions: {
      roles: ['Administrator', 'Developer'],
    },
  },
};
