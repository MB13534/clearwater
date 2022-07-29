module.exports = (sequelize, DataTypes) => {
  const {TIME, TEXT, DATE, REAL, INTEGER} = DataTypes;
  const UiReportWqTimeseriesgraphData = sequelize.define(
    'ui_report_wq_timeseriesgraph_data',
    {
      cuwcd_well_number: {
        type: TEXT,
      },
      test_date: {
        type: DATE,
      },
      test_time: {
        type: TIME,
      },
      wq_parameter_name: {
        type: TEXT,
      },
      wq_result_value: {
        type: REAL,
      },
      unit_desc: {
        type: TEXT,
      },
      collected_by: {
        type: TEXT,
      },
      tested_by: {
        type: TEXT,
      },
      well_ndx: {
        type: INTEGER,
        primaryKey: true,
      },
      wq_parameter_ndx: {
        type: INTEGER,
      },
      wq_sample_notes: {
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

  return UiReportWqTimeseriesgraphData;
};
