module.exports = (sequelize, DataTypes) => {
  const {DOUBLE, TEXT, DATE, BOOLEAN, REAL} = DataTypes;
  const UiReportAllWellsForDownload = sequelize.define(
    'ui_report_all_wells_for_download',
    {
      cuwcd_well_number: {
        type: TEXT,
        primaryKey: true,
      },
      exempt: {
        type: BOOLEAN,
      },
      state_well_number: {
        type: TEXT,
      },
      well_name: {
        type: TEXT,
      },
      primary_use: {
        type: TEXT,
      },
      secondary_use: {
        type: TEXT,
      },
      longitude_dd: {
        type: DOUBLE,
      },
      latitude_dd: {
        type: DOUBLE,
      },
      well_status_desc: {
        type: TEXT,
      },
      aquifer_name: {
        type: TEXT,
      },
      aquifer_group: {
        type: TEXT,
      },
      elevation_ftabmsl: {
        type: REAL,
      },
      well_depth_ft: {
        type: REAL,
      },
      screen_top_depth_ft: {
        type: REAL,
      },
      screen_bottom_depth_ft: {
        type: REAL,
      },
      driller: {
        type: TEXT,
      },
      date_drilled: {
        type: DATE,
      },
      drillers_log: {
        type: BOOLEAN,
      },
      organization: {
        type: TEXT,
      },
      lastname: {
        type: TEXT,
      },
      firstname: {
        type: TEXT,
      },
      notes: {
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

  return UiReportAllWellsForDownload;
};
