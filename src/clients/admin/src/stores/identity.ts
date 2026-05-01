import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import { identityFetchClient } from '@/api/api-client';
import type { LoginResponse as AuthTokenInfo, UserInfo as UserProfile, LoginRequest as LoginForm } from '@shared/api/types/identity';

// ---- Types ----------------------------------------------------------------

interface IdentityState extends AuthTokenInfo, UserProfile {
  isLoading:       boolean;
  isHydrated:      boolean;
  expiresTime:  number;
  login:           (input: LoginForm) => Promise<void>;
  logout:          () => void;
  isAuthenticated: (needToast?: boolean) => boolean;
}

// ---- Store ----------------------------------------------------------------

export const useIdentityStore = create<IdentityState>()(
  persist(
    (set, get) => ({
      accessToken:  '',
      refreshToken: '',
      expiresIn:    0,
      expiresTime: 0,
      email: '',
      role: '' ,
      name: '',
      isLoading:    false,
      isHydrated:   false,

      login: async (input: LoginForm) => {
        set({ isLoading: true });
        try {
          const tokenInfo = (await identityFetchClient.POST('/login', {
            body: input,
          })).data;
          set({ ...tokenInfo, expiresTime: (tokenInfo!.expiresIn as number * 1000) + Date.now(),  isLoading: false });

          const userInfo = (await identityFetchClient.GET('/me')).data;
          set({...userInfo});
        } catch (error) {
          // rollback
          sessionStorage.removeItem('identity-storage');
          set({ 
            isLoading: false,
            accessToken: '',
            refreshToken: '',
          });
          throw error;
        }
      },

      logout: () => {
        sessionStorage.removeItem('identity-storage');
        set({
          accessToken:  '',
          refreshToken: '',
          expiresIn:    0,
          expiresTime: 0,
          tokenType:    '',
          email: '',
        });
        // call logout api and set loading state.
      },

      isAuthenticated: (needToast = false) => {
        const { accessToken, expiresTime } = get();

        if (!accessToken || !expiresTime) return false;

        const isExpired = expiresTime  < Date.now();
        if (isExpired) {
          if (needToast) toast.info('Session expired. Please log in again.');
          return false;
        }

        return true;
      },
    }),
    {
      name: 'identity-storage',
      // sessionStorage reduces XSS exposure vs localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
        expiresTime:  state.expiresTime,
        tokenType:    state.tokenType,
        email: state.email,
      }),
      onRehydrateStorage: (state) => {
        state.isHydrated = true; // mutate directly — no store reference needed
      },
    }
  )
);