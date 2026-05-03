import AuthInitializer from "@/lib/authInitializer";
import AuthRedirectHandler from "@/lib/authredirect";
import { Outlet } from "react-router";

export default function RootLayout() {
  return (
    <>
      <AuthInitializer />
      <AuthRedirectHandler />
      <Outlet />
    </>
  );
}