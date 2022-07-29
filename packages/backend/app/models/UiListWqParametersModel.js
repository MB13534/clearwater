module.exports = (sequelize, DataTypes) => {
  const {INTEGER, TEXT} = DataTypes;
  const UiListWqParameters = sequelize.define(
    'ui_list_wq_parameters',
    {
      wq_parameter_ndx: {
        type: INTEGER,
        primaryKey: true,
      },
      wq_parameter_name: {
        type: TEXT,
      },
      unit_desc: {
        type: TEXT,
      },
      unit_ndx: {
        type: INTEGER,
      },
      display_order: {
        type: INTEGER,
      },
    },
    {
      schema: 'client_clearwater',
      timestamps: false,
      paranoid: true,
      freezeTableName: true,
    }
  );

  return UiListWqParameters;
};
