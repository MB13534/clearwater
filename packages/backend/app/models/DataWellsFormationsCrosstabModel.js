module.exports = (sequelize, DataTypes) => {
  const {INTEGER, REAL} = DataTypes;
  const DataWellsFormationsCrosstab = sequelize.define(
    'data_wells_formations_crosstab',
    {
      well_ndx: {
        type: INTEGER,
        primaryKey: true,
      },
      top_hosston: {
        type: REAL,
      },
      top_pearsall: {
        type: REAL,
      },
      top_hensell: {
        type: REAL,
      },
      top_glen_rose: {
        type: REAL,
      },
      top_walnut: {
        type: REAL,
      },
      top_edwards: {
        type: REAL,
      },
      top_delrio: {
        type: REAL,
      },
      top_austin: {
        type: REAL,
      },
    },
    {
      schema: 'client_clearwater',
      timestamps: false,
      paranoid: true,
      freezeTableName: true,
    }
  );

  return DataWellsFormationsCrosstab;
};
