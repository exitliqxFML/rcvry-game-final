import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import RunnerGame              from "./RunnerGame";
import WalletConnectionProvider from "./WalletConnectionProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WalletConnectionProvider>
      <RunnerGame />
    </WalletConnectionProvider>
  </React.StrictMode>
);
