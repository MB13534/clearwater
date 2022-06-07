module.exports = (sequelize, DataTypes) => {
  const {INTEGER, BOOLEAN, DATE, TEXT} = DataTypes;
  const WellsToAttachments = sequelize.define(
    'wells_to_attachments',
    {
      created_timestamp: {
        type: DATE,
      },
      created_by: {
        type: TEXT,
      },
      att_ndx: {
        type: INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      well_ndx: {
        type: INTEGER,
      },
      attachment_desc: {
        type: TEXT,
      },
      attachment_filepath: {
        type: TEXT,
      },
      attachment_notes: {
        type: TEXT,
      },
      removed: {
        type: BOOLEAN,
      },
    },
    {
      schema: 'client_clearwater',
      timestamps: false,
      paranoid: true,
      freezeTableName: true,
    }
  );

  return WellsToAttachments;
};
