module.exports = (sequelize, DataTypes) => {
  const {TEXT, BOOLEAN} = DataTypes;
  const UiReportOwnersSearchModel = sequelize.define(
    'ui_report_owners_search',
    {
      cuwcd_well_number: {
        type: TEXT,
        primaryKey: true,
      },
      well_name: {
        type: TEXT,
      },
      aquifer_name: {
        type: TEXT,
      },
      well_use: {
        type: TEXT,
      },
      lastname: {
        type: TEXT,
      },
      firstname: {
        type: TEXT,
      },
      organization: {
        type: TEXT,
      },
      address: {
        type: TEXT,
      },
      city: {
        type: TEXT,
      },
      state: {
        type: TEXT,
      },
      zip: {
        type: TEXT,
      },
      email: {
        type: TEXT,
      },
      phone: {
        type: TEXT,
      },
      is_permitted: {
        type: BOOLEAN,
      },
      permit_number: {
        type: TEXT,
      },
      permit_holder_name: {
        type: TEXT,
      },
      agg_system_name: {
        type: TEXT,
      },
      general_notes: {
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

  return UiReportOwnersSearchModel;
};
