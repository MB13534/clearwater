module.exports = {
  id: 'major-aquifers-line',
  name: 'Major Aquifers',
  type: 'line',
  source: 'major-aquifers',
  'source-layer': 'Aquifers_major_dd-1n355v',
  paint: {
    'line-color': [
      'match',
      ['get', 'AqName'],
      ['CARRIZO OUTCROP'],
      '#880000',
      ['CARRIZO DOWNDIP'],
      '#fd4343',
      ['SEYMOUR OUTCROP'],
      '#D1681D',
      ['TRINITY OUTCROP'],
      '#008000',
      ['TRINITY DOWNDIP'],
      '#7fff3f',
      ['OGALLALA OUTCROP'],
      '#80B0DE',
      ['PECOS VALLEY OUTCROP'],
      '#FEC22C',
      ['HUECO_BOLSON OUTCROP'],
      '#FF00FF',
      ['EDWARDS-TRINITY OUTCROP'],
      '#6ebb89',
      ['EDWARDS-TRINITY DOWNDIP'],
      '#b8ffcc',
      ['EDWARDS OUTCROP'],
      '#000b7e',
      ['EDWARDS DOWNDIP'],
      '#3c86ff',
      ['GULF_COAST OUTCROP'],
      '#FFFF00',
      'rgba(0,0,0,0)',
    ],
    'line-width': 4,
  },
  layout: {
    visibility: 'none',
  },
  lreProperties: {
    layerGroup: 'major-aquifers',
  },
};
