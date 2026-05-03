import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Outlet } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { buggerRoutes } from "@/config/dashboard-routes";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function BuggerLayout() {
    return (
        <TooltipProvider delayDuration={150}>
            <SidebarProvider>
                <AppSidebar
                    title="Bugger Panel"
                    subtitle="Bugger dashboard"
                    menuItems={buggerRoutes}
                />
                <SidebarInset className="flex-1">
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <h1 className="text-lg font-semibold">Bugger Dashboard</h1>
                    </header>

                    <main className="flex-1 p-6 overflow-auto">
                        <Outlet />
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}