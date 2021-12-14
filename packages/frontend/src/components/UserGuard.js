import React from "react";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loader from "./Loader";
import Unauthorized from "./Unauthorized";

// For routes that can only be accessed by admin users
const UserGuard = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();

  const roles = user[`${process.env.REACT_APP_AUDIENCE}/roles`];
  let isUser = false;
  if (roles && roles.filter((x) => x === "Well Owner").length > 0) {
    isUser = true;
  }

  if (!isAuthenticated || !isUser) {
    return <Unauthorized />;
  }

  return children;
};

export default withAuthenticationRequired(UserGuard, {
  onRedirecting: () => <Loader />,
});
