// src/components/app-sidebar.jsx
import { NavLink, useNavigate } from "react-router";
import { Settings, LogOut, Moon, Sun } from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/features/auth/auth.slice";
import { useTheme } from "@/components/theme-provider";

export function AppSidebar({ title, subtitle, menuItems }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/account/login");
  };

  return (
    <Sidebar side="left" variant="sidebar" collapsible={isMobile ? "offcanvas" : "icon"}>
      <SidebarHeader className="border-b px-4 py-4 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary text-primary-foreground font-semibold shrink-0 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8">
            {title?.slice(0, 1) || "D"}
          </div>
          <div className="grid flex-1 text-left min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold truncate">{title}</span>
            <span className="text-xs text-muted-foreground truncate">{subtitle}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4 group-data-[collapsible=icon]:px-0">
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.href}
                      end={
                        item.href === "/admin/dashboard" ||
                        item.href === "/team/dashboard" ||
                        item.href === "/bugger/dashboard"
                      }
                      className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3 group-data-[collapsible=icon]:p-1 space-y-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-sm border bg-background text-muted-foreground hover:text-foreground text-xs font-medium transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2.5"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
          <span className="group-data-[collapsible=icon]:hidden">
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </button>

        {/* User card */}
        <div className="rounded-sm border bg-background p-3 flex items-center gap-3 group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs">
              {user?.username?.slice(0, 2)?.toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">{user?.username || "User"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email || ""}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-sm border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 text-xs font-semibold uppercase tracking-widest transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2.5"
          title="Sign out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}