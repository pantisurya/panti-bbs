// Polyfill global for react-image-lightbox compatibility
// @ts-ignore
if (typeof window !== "undefined" && typeof window.global === "undefined") {
  // @ts-ignore
  window.global = window;
}
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
