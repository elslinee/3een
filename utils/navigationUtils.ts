import { router } from "expo-router";

export const navigateToPage = (
  route:
    | "/quran"
    | "/about"
    | "/tasbeeh"
    | "/changelog"
    | "/azkar"
    | "/qibla"
    | "/select-location"
    | "/hadith"
) => {
  router.push(route);
};

export const goBack = () => {
  if (router.canGoBack()) {
    router.back();
  }
};

export const replacePage = (
  route: "/quran" | "/about" | "/tasbeeh" | "/changelog" | "/azkar" | "/qibla"
) => {
  router.replace(route);
};
