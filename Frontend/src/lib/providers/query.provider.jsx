import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { useState } from "react"

export default function QueryProvider({ children }) {

  const [queryClient] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          gcTime: 1000 * 60 * 30,
          retry: 2,
          retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
          refetchOnWindowFocus:
            import.meta.env.MODE === "production" ? false : "always",
          refetchOnReconnect: false,
          refetchOnMount: false,
        },
        mutations: {
          retry: 1,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}