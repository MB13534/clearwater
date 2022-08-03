module.exports = (sequelize, DataTypes) => {
  const {TEXT, DATE} = DataTypes;
  const UiReportWaterLevels = sequelize.define(
    'ui_report_water_levels',
    {
      cuwcd_well_number: {
        type: TEXT,
        primaryKey: true,
      },
      state_well_number: {
        type: TEXT,
      },
      measurement_date: {
        type: DATE,
      },
      measurement_method: {
        type: TEXT,
      },
      dtw_ft: {
        type: TEXT,
      },
      source_aquifer: {
        type: TEXT,
      },
      collected_by: {
        type: TEXT,
      },
    },
    {
      schema: 'client_clearwater',
      timestamps: false,
      paranoid: true,
      freezeTableName: true,
    }
  );

  return UiReportWaterLevels;
};
