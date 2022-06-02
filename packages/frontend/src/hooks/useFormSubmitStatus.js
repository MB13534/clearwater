import { useState } from "react";

const useFormSubmitStatus = () => {
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);

  /**
   * This function is used to set the appropriate form state
   * @param {*} state current state of form
   * @param {*} error if submit was successful/unsuccessful
   */
  const setWaitingState = (state, error) => {
    if (state === "in progress") {
      setFormSubmitting(true);
      setSnackbarError(false);
      setSnackbarOpen(false);
    } else if (state === "complete" && error === "no error") {
      setFormSubmitting(false);
      setSnackbarError(false);
      setSnackbarOpen(true);
    } else if (state === "complete" && error === "error") {
      setFormSubmitting(false);
      setSnackbarError(true);
      setSnackbarOpen(true);
    } else {
      setFormSubmitting(false);
      setSnackbarError(false);
      setSnackbarOpen(false);
    }
  };

  /**
   * This function is used to update the snackbar state that
   * lets the application know whether a snackbar should be displayed
   */
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return {
    setWaitingState,
    formSubmitting,
    snackbarOpen,
    snackbarError,
    handleSnackbarClose,
  };
};

export default useFormSubmitStatus;
