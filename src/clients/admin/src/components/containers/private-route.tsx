import { Navigate, Outlet } from 'react-router-dom';
import { useIdentityStore } from '@/stores/identity';
import Unauthorize from '@/pages/common/403';
import { ROUTES } from '@/configs/routes';
import { useEffect, useRef } from 'react';
import { SpinnerPage } from '../ui/spinner-page';

interface PrivateRouteProps {
  requiredRoles?: string[];
}
export const PrivateRoute = ({ requiredRoles = [] }: PrivateRouteProps) => {
  const { isAuthenticated, role, isHydrated } = useIdentityStore();
  const hasCheckedAuth = useRef(false);

  const isAuth = isAuthenticated();

  useEffect(() => {
    if (isHydrated && !isAuth && !hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      isAuthenticated(true);
    }
  }, [isHydrated, isAuth, isAuthenticated]);

  // Wait for sessionStorage to rehydrate before making auth decisions
  if (!isHydrated) return <SpinnerPage />

  if (!isAuth) {
    return <Navigate to={ROUTES.signin} replace />;
  }

  if (requiredRoles.length > 0 && role) {
    if (!requiredRoles.includes(role)) {
      return <Unauthorize />;
    }
  }

  return <Outlet />;
};