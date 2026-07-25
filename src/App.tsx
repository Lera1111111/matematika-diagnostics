import { useEffect } from "react";
import HomePage from "../app/page";
import GradeSixPage from "../app/6/page";
import GradeSevenPage from "../app/7/page";
import GradeEightPage from "../app/8/page";
import GradeNinePage from "../app/9/page";
import OgePage from "../app/oge/page";
import AfterNinePage from "../app/after9/page";

const pageByRoute: Record<string, React.ComponentType> = {
  "/": HomePage,
   "/6": GradeSixPage,
  "/7": GradeSevenPage,
  "/8": GradeEightPage,
  "/9": GradeNinePage,
  "/oge": OgePage,
  "/after9": AfterNinePage,
};

const titleByRoute: Record<string, string> = {
  "/": "Математические диагностики",
  "/6": "Что повторить перед 6 классом?",
  "/7": "Что повторить перед 7 классом?",
  "/8": "Что повторить перед 8 классом?",
  "/9": "Что повторить перед 9 классом?",
  "/oge": "Входная диагностика для подготовки к ОГЭ",
  "/after9": "Что повторить после 9 класса?",
};

function normalizedBase() {
  const value = import.meta.env.BASE_URL || "/";
  return value.endsWith("/") ? value : `${value}/`;
}

function currentRoute() {
  const base = normalizedBase();
  let path = window.location.pathname;

  if (base !== "/" && path.startsWith(base)) {
    path = path.slice(base.length - 1);
  }

  path = path
    .replace(/\/index\.html$/i, "/")
    .replace(/\/+$/, "");

  return path || "/";
}

function independentUrl(route: string) {
  const base = normalizedBase();
  const relative = route.replace(/^\/+/, "");
  return new URL(`${base}${relative}`, window.location.origin).toString();
}

export default function App() {
  const route = currentRoute();
  const Page = pageByRoute[route] || HomePage;

  useEffect(() => {
    document.title = titleByRoute[route] || titleByRoute["/"];

    const handleInternalLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href?.startsWith("/") || href.startsWith("//")) return;

      event.preventDefault();
      window.location.assign(independentUrl(href));
    };

    document.addEventListener("click", handleInternalLink);
    return () => document.removeEventListener("click", handleInternalLink);
  }, [route]);

  return <Page />;
}
