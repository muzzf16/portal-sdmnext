// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from './locales/en/translation.json';
import idTranslations from './locales/id/translation.json';

// Configuration
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      id: {
        translation: idTranslations
      }
    },
    lng: 'id', // Default language
    fallbackLng: 'id',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;