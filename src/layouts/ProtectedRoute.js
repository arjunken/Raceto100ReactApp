import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const userAuth = localStorage.getItem("raceto100Auth");
  if (!userAuth) {
    // user is not authenticated
    return <Navigate to="/" />;
  }
  return children;
};

export default ProtectedRoute;
