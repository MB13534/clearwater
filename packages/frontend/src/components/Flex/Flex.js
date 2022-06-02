import React from "react";
import PropTypes from "prop-types";
import { Box } from "@material-ui/core";

/**
 * Component used to display elements in a row using flexbox.
 * The content can be justified and aligned
 * using component props. Any valid css flexbox value
 * works with this component.
 */
const Flex = ({
  children,
  alignItems = "center",
  justifyContent = "start",
  flexWrap = "nowrap",
  ...other
}) => {
  return (
    <Box
      display="flex"
      justifyContent={justifyContent}
      alignItems={alignItems}
      flexWrap={flexWrap}
      {...other}
    >
      {children}
    </Box>
  );
};

Flex.propTypes = {
  /**
   * Any valid flexbox justify-content value
   */
  justifyContent: PropTypes.oneOf([
    "start",
    "end",
    "center",
    "space-between",
    "space-around",
    "space-evenly",
  ]),
  /**
   * Any valid flexbox align-items value
   */
  alignItems: PropTypes.oneOf(["start", "end", "center", "stretch"]),
  flexWrap: PropTypes.oneOf(["nowrap", "wrap", "wrap-reverse"]),
};

export default Flex;
