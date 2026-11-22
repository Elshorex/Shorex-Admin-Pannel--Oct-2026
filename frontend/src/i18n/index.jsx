import en from "./locales/en.json";
import ar from "./locales/ar.json";
import es from "./locales/es.json";

function flattenMessages(nestedMessages, prefix = "") {
  return Object.keys(nestedMessages).reduce((messages, key) => {
    const value = nestedMessages[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      messages[prefixedKey] = value;
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey));
    }

    return messages;
  }, {});
}

export const translations = {
  en: flattenMessages(en),
  ar: flattenMessages(ar),
  es: flattenMessages(es),
};
