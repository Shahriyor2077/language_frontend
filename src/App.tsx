import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Statistic from "./pages/admins/statistic/Statistic";
import adminRoute from "./router/admin-route";
import teacherRoute from "./router/teacher-route";

const App = () => {
  return (
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/app" element={<MainLayout />}>
        <Route path="admin">
          <Route index element={<Statistic />} />
          {adminRoute.map(({ page: Page, path }) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
        </Route>
        <Route path="teacher">
          <Route index element={<Statistic />} />
          {teacherRoute.map(({ page: Page, path }) => (
            <Route key={path} path={path} element={<Page />} />
          ))}
        </Route>
        </Route>
      </Routes>
  );
};

export default App;
