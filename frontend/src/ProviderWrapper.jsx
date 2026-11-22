import { createContext,  useState } from 'react';
import moment from 'moment';

import { IntlProvider } from 'react-intl';
import { translations } from './i18n';

import 'moment/locale/ar';
import 'moment/locale/es';

export const LanguageContext = createContext();
export const ThemeContext = createContext();
export const AuthContext = createContext();

export const LanguageWrapper = ({ children }) => {
  const getLanguageFromLocalStorage = () => {
    const language = localStorage.getItem('language') || '';
    if (language) {
      return language;
    } else {
      setLanguageInLocalStorage('en');
      return 'en';
    }
  };

  const setLanguageInLocalStorage = (language) => {
    localStorage.setItem('language', language);
  };

  const [locale, setLocale] = useState(getLanguageFromLocalStorage());
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  
  moment.locale(locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = direction;

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale: (language) => {
          setLocale(language);
          setLanguageInLocalStorage(language);
        },
      }}
    >
      <IntlProvider locale={locale} key={locale} messages={translations[locale]}>
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
};

// export const AuthWrapper = ({ children }) => {
//   const defaultUserInfo = {
//     sub: '',
//     email_verified: false,
//     name: '',
//     preferred_username: '',
//     given_name: '',
//     email: '',
//     phone: '',
//     role: '',
//   };
//   const getUserInfoFromLocalStorage = () => {
//     const userInfoString = localStorage.getItem('userInfo');
//     if (userInfoString) {
//       return JSON.parse(userInfoString);
//     } else {
//       return defaultUserInfo;
//     }
//   };
//   const [userInfo, setUserInfo] = useState(getUserInfoFromLocalStorage());

//   return <AuthContext.Provider value={{ userInfo, setUserInfo }}>{children}</AuthContext.Provider>;
// };
