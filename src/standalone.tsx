import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Page from "@/components/Page";
import Main from "@/pages/Main";
import "@/style/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <Page>
      <Main />
    </Page>
  </StrictMode>,
);