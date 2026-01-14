import { Navigate, Outlet } from "react-router-dom";
import Cookie from "js-cookie";

type Role = "admin" | "superadmin" | "teacher";
type AllowedRole = "admin" | "teacher";

interface Props {
  allowedRoles: AllowedRole[];
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
  const normalizedRole: AllowedRole = role === "superadmin" ? "admin" : role as AllowedRole;

  if (!allowedRoles.includes(normalizedRole)) {
    return <Navigate to="/login/teacher" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
