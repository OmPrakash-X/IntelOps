import { RouterProvider } from "react-router";
import { router } from "./app.router";
import { Toaster } from "sonner";


export default function App() {
  return (
      <main className="min-h-screen">
        <RouterProvider router={router} />
        <Toaster />
      </main>
  )
}
