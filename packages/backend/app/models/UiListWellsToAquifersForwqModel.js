module.exports = (sequelize, DataTypes) => {
  const {INTEGER, TEXT, ARRAY} = DataTypes;
  const UiListWellsToAquifersForwq = sequelize.define(
    'ui_list_wells_to_aquifers_forwq',
    {
      well_ndx: {
        type: INTEGER,
        primaryKey: true,
      },
      cuwcd_well_number: {
        type: TEXT,
      },
      aquifer_ndx: {
        type: INTEGER,
      },
      aquifer_name: {
        type: TEXT,
      },
      aquifer_group: {
        type: TEXT,
      },
      wq_parameter_ndx_array: {
        type: ARRAY(INTEGER),
      },
      well_name: {
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

  return UiListWellsToAquifersForwq;
};
