import { Navigate, Outlet } from "react-router-dom";
import Cookie from "js-cookie";

type Role = "admin" | "teacher";

interface Props {
  allowedRoles: Role[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const token = Cookie.get("token");
  const role = Cookie.get("role") as Role | null;

  if (!token) {
    return <Navigate to="/login/teacher" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login/teacher" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
