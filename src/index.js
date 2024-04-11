import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Helmet } from "react-helmet";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <Helmet>
      <script src="https://telegram.org/js/telegram-web-app.js"></script>
    </Helmet>
    <App />
  </>
);
