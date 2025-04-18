export type Language = 'ru' | 'en';

export type LanguageOption = {
  value: Language;
  label: string;
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
];
