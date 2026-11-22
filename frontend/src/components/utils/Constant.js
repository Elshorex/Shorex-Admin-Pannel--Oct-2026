import { FormattedMessage } from "react-intl";

export const ENGLISH_LANGUAGE = "en";
export const ARABIC_LANGUAGE = "ar";

export const getDefaultLanguage = () => {
  return navigator.language.split(/[-_]/)[0];
};

export const getDirection = (language) => {
  return language === "ar" ? "rtl" : "ltr";
};

export const week = [
  {
    value: 0,
    name: <FormattedMessage id="weekends.Sunday" />,
    symbol: "Sun.",
  },
  {
    value: 1,
    name: <FormattedMessage id="weekends.Monday" />,
    symbol: "Mon.",
  },
  {
    value: 2,
    name: <FormattedMessage id="weekends.Tuesday" />,
    symbol: "Tue.",
  },
  {
    value: 3,
    name: <FormattedMessage id="weekends.Wednesday" />,
    symbol: "Wed.",
  },
  {
    value: 4,
    name: <FormattedMessage id="weekends.Thursday" />,
    symbol: "Thu.",
  },
  {
    value: 5,
    name: <FormattedMessage id="weekends.Friday" />,
    symbol: "Fri.",
  },
  {
    value: 6,
    name: <FormattedMessage id="weekends.Saturday" />,
    symbol: "Sat.",
  },
];

export const holidaysTypes = [
  {
    value: 0,
    // name: <FormattedMessage id="weekends.Sunday" />,
    name: "Maintenance",
    symbol: "MAINTENANCE",
  },
  {
    value: 1,
    // name: <FormattedMessage id="weekends.Monday" />,
    name: "Public",
    symbol: "PUBLIC",
  },
];

export const providerStatus = [
  {
    value: 1,
    name: <FormattedMessage id="provider.active" />,
  },
  {
    value: 2,
    name: <FormattedMessage id="provider.nonActive" />,
  },
];

