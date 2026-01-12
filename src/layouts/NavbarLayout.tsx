import { ActiveLink } from "@/components/ui/active-link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { links } from "./layoutData";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import Cookie from "js-cookie";
import { toast } from "sonner";

type RoleType = "teacher" | "admin" | "superAdmin";

const NavbarLayout = ({ role }: { role: RoleType }) => {
  const navigate = useNavigate();
  const currentLinks = links[role] || links.teacher;

  const handleLogout = () => {
    Cookie.remove("token");
    Cookie.remove("role");
    toast.success("Tizimdan chiqdingiz", { position: "bottom-right" });
    if (role === "teacher") {
      navigate("/login/teacher");
    } else {
      navigate("/login/admin");
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <Link
          to={`/app/${role === "superAdmin" ? "admin" : role}`}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">LE</span>
          </div>
          <span className="font-semibold">Language ERP</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupContent className="p-2">
          <SidebarMenu>
            {currentLinks.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <ActiveLink href={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </ActiveLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() =>
              navigate(
                role === "teacher"
                  ? "/app/teacher/profile"
                  : "/app/admin/profile"
              )
            }
          >
            <User className="mr-2 h-4 w-4" />
            Profil
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Chiqish
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default NavbarLayout;
