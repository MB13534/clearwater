import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Button } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  controlBtn: {
    marginRight: theme.spacing(1),
  },
}));

const AssociationControls = ({
  handleSave,
  handleSelectAll,
  handleSelectNone,
}) => {
  const classes = useStyles();
  return (
    <Box marginBottom={2}>
      <Button
        className={classes.controlBtn}
        variant="contained"
        color="primary"
        onClick={handleSave}
      >
        Save
      </Button>
      <Button
        className={classes.controlBtn}
        variant="outlined"
        onClick={handleSelectAll}
      >
        Select All
      </Button>
      <Button
        className={classes.controlBtn}
        variant="outlined"
        onClick={handleSelectNone}
      >
        Select None
      </Button>
    </Box>
  );
};

AssociationControls.propTypes = {
  handleSave: PropTypes.func.isRequired,
  handleSelectAll: PropTypes.func.isRequired,
  handleSelectNone: PropTypes.func.isRequired,
};

export default AssociationControls;
