import React from "react";
import { ThemeProvider } from "@mui/material";
import { ToastContainer } from "react-toastify";

import { LanguageWrapper } from "./ProviderWrapper";
import { Router } from "./routes/appRouter";
import theme from "./styles/theme";
import { AuthProvider } from "./context";

import "react-toastify/dist/ReactToastify.css";

export const App = () => {
  const locate = localStorage.getItem("language");

  return (
    <React.Fragment>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <LanguageWrapper>
            <Router />
          </LanguageWrapper>
        </ThemeProvider>
      </AuthProvider>
      <ToastContainer
        position={"top-right"}
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={locate === "ar"}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </React.Fragment>
  );
};
