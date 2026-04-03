import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// i18n must init after React is available
import("./i18n").then(() => {
  // Dynamic import App after i18n is ready
  import("./App.tsx").then(({ default: App }) => {
    createRoot(document.getElementById("root")!).render(
      <App />
    );
  });
});
