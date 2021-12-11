module.exports = (sequelize, DataTypes) => {
  const {INTEGER, TEXT, NUMBER, BIGINT} = DataTypes;
  const DmWellProductions = sequelize.define(
    'dm_well_productions',
    {
      well_ndx: {
        type: INTEGER,
        primaryKey: true,
      },
      cuwcd_well_number: {
        type: TEXT,
      },
      report_month: {
        type: INTEGER,
      },
      report_year: {
        type: INTEGER,
      },
      permit_ndx: {
        type: INTEGER,
      },
      production_gallons: {
        type: NUMBER,
      },
      production_notes: {
        type: TEXT,
      },
      ndx: {
        type: BIGINT,
      },
    },
    {
      defaultScope: {
        order: [
          ['report_year', 'desc'],
          ['report_month', 'desc'],
        ],
      },
      schema: 'client_clearwater',
      timestamps: false,
      paranoid: true,
      freezeTableName: true,
    }
  );

  return DmWellProductions;
};
