import { useContext } from 'react';
import { AuthContext } from '../ProviderWrapper';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a Auth provider');
  }
  return context;
};
