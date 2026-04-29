import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// default behaveior for all queries and mutations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 3600000,
      throwOnError(error) {
        if (error instanceof Error) {
          toast.error('Query error:' + error.message);
        }
        return false;
      },
    },
  },
});

export default queryClient;