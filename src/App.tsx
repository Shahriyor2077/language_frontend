import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Register from "./pages/auth/teacher/GoogleCallback";
import Statistic from "./pages/admins/statistic/Statistic";
import adminRoute from "./router/admin-route";
import teacherRoute from "./router/teacher-route";
import Profile from "./pages/teachers/Profile";
import AdminLogin from "./pages/auth/admin/AdminLogin";
import GoogleCallback from "./pages/auth/teacher/GoogleCallback";
import Login from "./pages/auth/teacher/Login";
import PhoneVerification from "./pages/auth/teacher/PhoneVerify";
import ProtectedRoute from "./pages/auth/guard/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/login/teacher" element={<Login />} />
      <Route path="/login/admin" element={<AdminLogin />} />
      <Route path="/google-callback" element={<GoogleCallback />} />
      <Route path="/phone-verification" element={<PhoneVerification />} />
      <Route path="/register" element={<Register />} />

      <Route path="/app" element={<MainLayout />}>
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="admin">
            <Route index element={<Statistic />} />
            {adminRoute.map(({ page: Page, path }) => (
              <Route key={path} path={path} element={<Page />} />
            ))}
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
          <Route path="teacher">
            <Route index element={<Profile />} />
            {teacherRoute.map(({ page: Page, path }) => (
              <Route key={path} path={path} element={<Page />} />
            ))}
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
