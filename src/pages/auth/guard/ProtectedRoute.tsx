import { Navigate, Outlet } from "react-router-dom";
import Cookie from "js-cookie";

type Role = "admin" | "superadmin" | "teacher";

interface Props {
  allowedRoles: Role[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const token = Cookie.get("token");
  const role = Cookie.get("role") as Role | null;

  if (!token) {
    return <Navigate to="/login/teacher" replace />;
  }

  if (!role) {
    return <Navigate to="/login/teacher" replace />;
  }

  // admin va superadmin ikkalasi ham admin sahifalariga kira oladi
  const normalizedRole = role === "superadmin" ? "admin" : role;
  const normalizedAllowedRoles = allowedRoles.map(r => r === "superadmin" ? "admin" : r);

  if (!normalizedAllowedRoles.includes(normalizedRole as Role)) {
    return <Navigate to="/login/teacher" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
