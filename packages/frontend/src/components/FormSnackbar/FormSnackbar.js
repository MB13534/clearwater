import React from "react";
import PropTypes from "prop-types";
import { Snackbar, SnackbarContent } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  snackbarSuccess: {
    backgroundColor: "#4074DC",
  },
  snackbarError: {
    backgroundColor: "#e94a4a",
  },
}));

const FormSnackbar = (props) => {
  const classes = useStyles();
  const {
    open,
    error,
    errorMessage = "There was an error saving the data.",
    successMessage = "Data successfully saved!",
    handleClose,
  } = props;

  return (
    <Snackbar
      open={open}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      autoHideDuration={6000}
      onClose={handleClose}
    >
      <SnackbarContent
        className={error ? classes.snackbarError : classes.snackbarSuccess}
        aria-describedby="client-snackbar"
        message={
          <span id="client-snackbar">
            {error ? errorMessage : successMessage}
          </span>
        }
      />
    </Snackbar>
  );
};

FormSnackbar.propTypes = {
  open: PropTypes.bool.isRequired,
  error: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  successMessage: PropTypes.string,
  handleClose: PropTypes.func.isRequired,
};

export default FormSnackbar;
