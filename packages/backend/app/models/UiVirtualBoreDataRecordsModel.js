module.exports = (sequelize, DataTypes) => {
  const {INTEGER, TEXT, REAL, DOUBLE} = DataTypes;
  const UiVirtualBoreDataRecords = sequelize.define(
    'ui_virtual_bore_data_records',
    {
      vb_grid_ndx: {
        type: INTEGER,
        primaryKey: true,
      },
      surface_elev: {
        type: REAL,
      },
      top_elev: {
        type: REAL,
      },
      bottom_elev: {
        type: REAL,
      },
      depth_to_formation: {
        type: REAL,
      },
      formation_thickness: {
        type: REAL,
      },
      geologic_unit: {
        type: TEXT,
      },
      min_y_lon: {
        type: DOUBLE,
      },
      max_y_lon: {
        type: DOUBLE,
      },
      min_x_lat: {
        type: DOUBLE,
      },
      max_x_lat: {
        type: DOUBLE,
      },
    },
    {
      defaultScope: {
        order: [['top_elev', 'desc']],
      },
      schema: 'client_clearwater',
      timestamps: false,
      paranoid: true,
      freezeTableName: true,
    }
  );

  return UiVirtualBoreDataRecords;
};
