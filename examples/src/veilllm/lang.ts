export const LANG: "en" | "ar" = "ar";
export const t = <T,>(en: T, ar: T): T => (LANG === "ar" ? ar : en);
export const DIR = t("ltr", "rtl") as "ltr" | "rtl";
