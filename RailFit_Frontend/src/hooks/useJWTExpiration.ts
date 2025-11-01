import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { isTokenValid } from '@/utils/jwt';

/**
 * Hook to handle JWT expiration and automatic logout
 * Can be used in any component that needs JWT protection
 */
export const useJWTExpiration = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check token validity on component mount
    if (isAuthenticated) {
      const token = localStorage.getItem('jwt_token');
      if (!token || !isTokenValid(token)) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
    }

    // Listen for JWT expiration events from the API layer
    const handleJWTExpired = () => {
      if (isAuthenticated) {
        logout();
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('jwt_expired', handleJWTExpired);

    return () => {
      window.removeEventListener('jwt_expired', handleJWTExpired);
    };
  }, [isAuthenticated, logout, navigate]);

  // Return token validation function for manual checks
  const checkTokenValidity = (): boolean => {
    const token = localStorage.getItem('jwt_token');
    return token ? isTokenValid(token) : false;
  };

  return {
    isTokenValid: checkTokenValidity,
    forceLogout: () => {
      logout();
      navigate('/login', { replace: true });
    }
  };
};

export default useJWTExpiration;