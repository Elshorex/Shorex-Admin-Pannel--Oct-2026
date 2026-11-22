import { useContext } from 'react';
import { LanguageContext } from '../ProviderWrapper';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a Language provider');
  }
  return context;
};
