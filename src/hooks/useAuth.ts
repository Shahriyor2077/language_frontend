import { jwtDecode } from "jwt-decode";
import Cookie from "js-cookie";

interface DecodedToken {
  id: string;
  role: string;
  is_active: boolean;
}

export const useAuth = () => {
  const token = Cookie.get("token");
  const role = Cookie.get("role");

  if (!token) {
    return { user: null, role: null, isAuthenticated: false };
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      user: decoded,
      role,
      isAuthenticated: true,
    };
  } catch (error) {
    return { user: null, role: null, isAuthenticated: false };
  }
};