import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet, useLocation } from "react-router-dom";
import NavbarLayout from "./NavbarLayout";
import Cookie from "js-cookie";

const MainLayout = () => {
  const location = useLocation();
  const cookieRole = Cookie.get("role");

  // Determine role based on URL path and cookie
  const isAdminPath = location.pathname.startsWith("/app/admin");
  let role: "teacher" | "admin" | "superAdmin" = "teacher";

  if (isAdminPath) {
    role = cookieRole === "superadmin" ? "superAdmin" : "admin";
  }

  return (
    <SidebarProvider>
      <NavbarLayout role={role} />
      <main className="grow">
        <div className="p-3">
          <SidebarTrigger className="cursor-pointer" />
        </div>
        <div className="px-7.5 py-3">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default MainLayout;
