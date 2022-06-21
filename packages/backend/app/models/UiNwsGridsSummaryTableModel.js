module.exports = (sequelize, DataTypes) => {
  const {TEXT, NUMBER, GEOMETRY, DATE, BOOLEAN} = DataTypes;
  const UiNwsGridsSummaryTable = sequelize.define(
    'ui_nws_grids_summary_table',
    {
      geometry: {
        type: GEOMETRY,
        primaryKey: true,
      },
      lon: {
        type: NUMBER,
      },
      lat: {
        type: NUMBER,
      },
      accumulated_365day: {
        type: NUMBER,
      },
      accumulated_90day: {
        type: NUMBER,
      },
      accumulated_30day: {
        type: NUMBER,
      },
      accumulated_7day: {
        type: NUMBER,
      },
      accumulated_1day: {
        type: NUMBER,
      },
      pct_of_norm_365day: {
        type: NUMBER,
      },
      pct_of_norm_90day: {
        type: NUMBER,
      },
      xymeters: {
        type: TEXT,
      },
      last_updated: {
        type: DATE,
      },
      in_edwards: {
        type: BOOLEAN,
      },
    },
    {
      schema: 'client_clearwater',
      timestamps: false,
      paranoid: true,
      freezeTableName: true,
    }
  );

  return UiNwsGridsSummaryTable;
};
