module.exports = (sequelize, DataTypes) => {
  const {INTEGER, BOOLEAN} = DataTypes;
  const PermitsToWells = sequelize.define(
    'permits_to_wells',
    {
      permit_ndx: {
        type: INTEGER,
      },
      permit_year: {
        type: INTEGER,
      },
      well_ndx: {
        type: INTEGER,
      },
      removed: {
        type: BOOLEAN,
      },
      p2w_ndx: {
        type: INTEGER,
        autoIncrement: true,
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

  return PermitsToWells;
};
