module.exports = (sequelize, DataTypes) => {
  const {DOUBLE, TEXT, DATE, REAL} = DataTypes;
  const UiReportWqPdf = sequelize.define(
    'ui_report_wq_pdf',
    {
      fiscal_year: {
        type: DOUBLE,
      },
      test_datetime: {
        type: DATE,
      },
      owner_name: {
        type: TEXT,
      },
      owner_phone_number: {
        type: TEXT,
      },
      mailing_address: {
        type: TEXT,
      },
      owner_email: {
        type: TEXT,
      },
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
      coliform: {
        type: TEXT,
      },
      ecoli: {
        type: TEXT,
      },
      conductivity: {
        type: REAL,
      },
      tds: {
        type: REAL,
      },
      salinity: {
        type: REAL,
      },
      ph: {
        type: REAL,
      },
      alkalinity: {
        type: REAL,
      },
      hardness: {
        type: REAL,
      },
      nitrite: {
        type: REAL,
      },
      nitrate: {
        type: REAL,
      },
      phosphate: {
        type: REAL,
      },
      sulfate: {
        type: REAL,
      },
      fluoride: {
        type: REAL,
      },
      comments: {
        type: REAL,
      },
      well_elev_ft: {
        type: REAL,
      },
      well_depth_ft: {
        type: REAL,
      },
      collected_by: {
        type: TEXT,
      },
      tested_by: {
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

  return UiReportWqPdf;
};
