import { useContext } from "react";
import { Navigate } from "react-router-dom";
import LocalStorageContext from "../store/localStorage-context";

const RedirectHome = ({ children }) => {
  const localStorageCtx = useContext(LocalStorageContext);
  const userAuth = localStorageCtx.getData("raceto100AppData", "auth");
  if (userAuth) {
    // user is not authenticated
    return <Navigate to="/profile" />;
  }
  return children;
};

export default RedirectHome;
