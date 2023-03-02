import { useContext } from "react";
import { Navigate } from "react-router-dom";
import LocalStorageContext from "../store/localStorage-context";

const ProtectedRoute = ({ children }) => {
  const localStorageCtx = useContext(LocalStorageContext);
  const userAuth = localStorageCtx.getData("raceto100AppData", "auth");
  if (!userAuth) {
    // user is not authenticated
    return <Navigate to="/" />;
  }
  return children;
};

export default ProtectedRoute;
