import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../state/auth.slice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';
  const isTeamLead = user?.role === 'teamLead';
  const isTeamMember = user?.role === 'teamMember';

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isTeamLead,
    isTeamMember,
    logout: handleLogout,
  };
};

export default useAuth;
