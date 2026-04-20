import { Navigate } from "react-router-dom";

function PrivateRoute({ children, redirectTo }) {
  const session = JSON.parse(localStorage.getItem("session"));

  if (!session || !session.access_token) {
    return <Navigate to={redirectTo} />;
  }

  return children;
}

export default PrivateRoute;