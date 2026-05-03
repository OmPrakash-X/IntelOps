import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/apps/index.css'
import App from '@/apps/App'
import QueryProvider from './lib/providers/query.provider'
import { ThemeProvider } from './components/theme-provider'
import { Provider } from 'react-redux'
import { store } from './apps/app.store'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <QueryProvider>
          <App />
        </QueryProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
