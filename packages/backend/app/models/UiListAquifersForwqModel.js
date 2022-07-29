module.exports = (sequelize, DataTypes) => {
  const {INTEGER, TEXT, ARRAY} = DataTypes;
  const UiListAquifersForwq = sequelize.define(
    'ui_list_aquifers_forwq',
    {
      aquifer_ndx: {
        type: INTEGER,
        primaryKey: true,
      },
      aquifer_name: {
        type: TEXT,
      },
      aquifer_group: {
        type: TEXT,
      },
      well_ndx_array: {
        type: ARRAY(INTEGER),
      },
    },
    {
      schema: 'client_clearwater',
      timestamps: false,
      paranoid: true,
      freezeTableName: true,
    }
  );

  return UiListAquifersForwq;
};
