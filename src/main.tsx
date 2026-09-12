import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import katex from "katex";
import "katex/dist/katex.min.css";
import App from "./App";
import "../app/globals.css";

// Make KaTeX available synchronously to every diagnostic before React renders.
// Keeping it in the application bundle prevents blank formulas when a CDN is
// unavailable or blocked on a student's device.
window.katex = katex as NonNullable<typeof window.katex>;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
