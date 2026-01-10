import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import NavbarLayout from "./NavbarLayout";
import Header from "@/components/header/Header";

const MainLayout = () => {
  return (
    <SidebarProvider>
      <NavbarLayout role={"teacher"} />
      <Header/>
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
