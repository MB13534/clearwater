module.exports = (sequelize, DataTypes) => {
  const {INTEGER, TEXT, REAL, GEOMETRY} = DataTypes;
  const UiReportWqTimeseriesGraphMap = sequelize.define(
    'ui_report_wq_timeseriesgraph_map',
    {
      cuwcd_well_number: {
        type: TEXT,
      },
      size_rank: {
        type: INTEGER,
      },
      plot_color: {
        type: TEXT,
      },
      recordcount: {
        type: INTEGER,
      },
      aquifer_name: {
        type: TEXT,
      },
      well_name: {
        type: TEXT,
      },
      well_elevation: {
        type: REAL,
      },
      well_depth_ft: {
        type: REAL,
      },
      location_geometry: {
        type: GEOMETRY,
      },
      well_ndx: {
        type: INTEGER,
        primaryKey: true,
      },
    },
    {
      schema: 'client_clearwater',
      timestamps: false,
      paranoid: true,
      freezeTableName: true,
    }
  );

  return UiReportWqTimeseriesGraphMap;
};
