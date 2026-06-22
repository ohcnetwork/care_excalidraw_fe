import { useTranslation as useI18nNextTranslation } from "react-i18next";

/**
 * A wrapper around react-i18next's `useTranlsation` hook with care_excalidraw
 * namespace pre-configured.
 */
export const useTranslation = () => {
  return useI18nNextTranslation("care_excalidraw");
};
