import './App.css';
import { createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import QueryClient from './components/containers/query-client';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './components/containers/theme-provider';

const router = createBrowserRouter(createRoutesFromElements(AppRoutes));

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <QueryClientProvider client={QueryClient}>
          <RouterProvider router={router} />
          <Toaster />
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
