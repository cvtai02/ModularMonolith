import { QueryClient } from '@tanstack/react-query';

// default behaveior for all queries and mutations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 3600000,
      throwOnError: true,
    },
  },
});

export default queryClient;