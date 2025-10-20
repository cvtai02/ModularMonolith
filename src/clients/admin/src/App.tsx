import './App.css';
import { createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import QueryClient from './components/containers/query-client';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';
import AppErrorBoundary from './components/containers/app-error-boundary';
const router = createBrowserRouter(createRoutesFromElements(AppRoutes));

function App() {
  return (
    <TooltipProvider>
      <QueryClientProvider client={QueryClient}>
        <AppErrorBoundary>
          <RouterProvider router={router} />
        </AppErrorBoundary>
        <Toaster />
      </QueryClientProvider>
    </TooltipProvider>
  );
}

export default App;