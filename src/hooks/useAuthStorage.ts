import { useNavigate } from "react-router-dom";
import Cookie from "js-cookie";

export const useAuthStorage = () => {
  const navigate = useNavigate();
  const login = (token: string, role: string) => {
    Cookie.set("token", token);
    Cookie.set("role", role);
  };

  const logout = () => {
    Cookie.remove("token");
    Cookie.remove("role");
    Cookie.remove("teacherName");
    localStorage.clear(); // optional
    navigate("/login/teacher", { replace: true });
  };

  const getTeacherName = () => {
    return Cookie.get("teacherName");
  };

  return { login, logout, getTeacherName };
};
