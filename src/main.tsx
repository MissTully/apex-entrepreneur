import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ConfigError from "./components/ConfigError";
import { AuthProvider } from "./hooks/useAuth";
import { supabaseConfigError } from "./lib/supabase";
import "./index.css";

// A missing environment variable used to blank the page entirely. Boot far
// enough to say which one, rather than looking like an outage.
const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    {supabaseConfigError.length > 0 ? (
      <ConfigError missing={supabaseConfigError} />
    ) : (
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    )}
  </React.StrictMode>
);
