// src/components/app-sidebar.jsx
import { NavLink } from "react-router";
import { Settings } from "lucide-react";

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

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSelector } from "react-redux";

export function AppSidebar({ title, subtitle, menuItems }) {

  const { user } = useSelector((state) => state.auth)
  const { isMobile } = useSidebar()

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
                      end={item.href === "/admin/dashboard" || item.href === "/team/dashboard"}
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

      <SidebarFooter className="border-t p-3 group-data-[collapsible=icon]:p-1">
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start gap-2 rounded-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-4">
            <Settings className="h-4 w-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Settings</span>
          </Button>

          <div className="rounded-sm border bg-background p-3 group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-full">
            <Avatar className="h-10 w-10 shrink-0 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
              <AvatarFallback className="text-xs">{user?.username?.slice(0, 2)?.toUpperCase() || "AD"}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium">{user?.username || "User Name"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || "user@email.com"}
              </p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}