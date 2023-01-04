import { Navigate } from "react-router-dom";

const RedirectHome = ({ children }) => {
  const userAuth = localStorage.getItem("raceto100Auth");
  if (userAuth) {
    // user is not authenticated
    return <Navigate to="/profile" />;
  }
  return children;
};

export default RedirectHome;
