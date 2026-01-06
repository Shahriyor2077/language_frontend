import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Statistic from "./pages/admins/statistic/Statistic";
import adminRoute from "./router/admin-route";
import teacherRoute from "./router/teacher-route";
import Profile from "./pages/teachers/Profile";
import AdminLogin from "./pages/auth/admin/AdminLogin";

const App = () => {
  return (
    <Routes>
      <Route path="/login/teacher" element={<Login />} />
      <Route path="/login/admin" element={<AdminLogin />} />

      <Route path="/register" element={<Register />} />
      <Route path="/app" element={<MainLayout />}>
        <Route path="admin">
          <Route index element={<Statistic />} />
          {adminRoute.map(({ page: Page, path }) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
        </Route>
        <Route path="teacher">
          <Route index element={<Profile />} />
          {teacherRoute.map(({ page: Page, path }) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
