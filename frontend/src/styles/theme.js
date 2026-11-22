import { createTheme } from "@mui/material/styles";

const locale = localStorage.getItem("language");

const isRTL = locale == "ar";

const theme = createTheme({
  direction: isRTL ? "rtl" : "ltr",
  palette: {
    primary: {
      main: "#049A77",
      light: "#E6F3EC",
    },
    Tone: {
      Light: "#F2F3F2",
      Mid: "#646866",
      Dark: "#3E4140",
    },
    error: {
      main: "#F81313",
      light: "#FCE8EC",
    },
    warning: {
      main: "#FFD53A",
      light: "#FFFBEB",
    },
    success: {
      main: "#39BF50",
      light: "#EBF9ED",
    },
    info: {
      main: "#0F6BD2",
      light: "#121212",
      // light:""
    },
    text: {
      primary: "rgba(18, 18, 18, 0.87)",
    },
    // action: {
    //   focus: {
    //     borderBlockColor: "#8ECCE1",
    //   },
    // },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: `var( --font-family)`,
    h1: {
      fontFamily: `var(--font-600)`,
      fontWeight: 600,
      fontSize: 24,
      lineHeight: "24px",
      letterSpacing: "0.24px",
    },
    h2: {
      fontFamily: `var(--font-600)`,
      fontWeight: 600,
      fontSize: 20,
      lineHeight: "24px",
      letterSpacing: "0.2px",
    },
    h3: {
      fontFamily: `var(--font-500)`,
      fontWeight: 500,
      fontSize: 16,
      lineHeight: "24px",
      letterSpacing: "0.16px",
    },
    body1: {
      fontFamily: `var(--font-400)`,
      fontWeight: 400,
      fontSize: 16,
      lineHeight: "20px",
      letterSpacing: "0.01em",
    },
    label: {
      fontFamily: `var(--font-400)`,
      fontWeight: 400,
      fontSize: 14,
      lineHeight: "20px",
      letterSpacing: "0.01em",
    },
    h4: {
      fontFamily: `var(--font-500)`,
      fontWeight: 500,
      fontSize: 12,
      lineHeight: "20px",
      letterSpacing: "0.01em",
    },
  },

  // shadows: {
  //   0: "none",
  //   1: "0px 2px 16px 0px rgba(18, 18, 18, 0.16)",
  //   2: "0px 2px 8px 0px rgba(18, 18, 18, 0.08)",
  //   8: "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
  //   20: "0px 8px 10px -5px rgba(0,0,0,0.2),0px 16px 24px 2px rgba(0,0,0,0.14),0px 6px 30px 5px rgba(0,0,0,0.12)",
  // },
  components: {
    MuiTable: {
      styleOverrides: {
        root: {
          borderCollapse: "separate",
          borderSpacing: 0,
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          flexWrap: "nowrap",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "#1570EF !important",
            borderRadius: "4px !important",
            color: "#FFF",
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          // padding: "16.5px 0px",

          "&:-webkit-autofill": {
            transition:
              "background-color 5000s ease-in-out 0s, color 5000s ease-in-out 0s",
            transitionDelay: " background-color 5000s, color 5000s ",
            // WebkitBoxShadow: "0 0 0 1000px white inset",
          },
        },
        root: {
          // direction: "rtl",
          "&.css-1csajbb-MuiInputBase-input-MuiOutlinedInput-input": {
            padding: 0,
          },
          "&:-webkit-autofill": {
            color: "red !important",
          },
          maxHeight: "2.7rem", /// max height
          "&:hover fieldset": {
            borderColor: "#8ECCE1 !important",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#8ECCE1 !important",
          },
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          "& .css-1d6wzja-MuiButton-startIcon": {
            margin: "0px",
            flexDirection: "column-reverse", // Placing the startIcon below the label
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          padding: "8px",
        },
      },
    },
    MuiTextareaAutosize: {
      styleOverrides: {
        root: {
          boxSizing: "border-box",
          width: "320px",
          fontWeight: 400,
          lineHeight: 1.5,
          padding: "8px 12px",
          borderRadius: "8px",
          color: "#303740",
          background: "#fff",
          border: "1px solid #C7D0DD",
          boxShadow: "0px 2px 2px #E5EAF2",
          "&:hover": {
            borderColor: "#8ECCE1 !important",
          },
          "&:focus": {
            borderColor: "#8ECCE1 !important",
            boxShadow: `0 0 0 3px #049A77`,
          },
          "&:disabled": {
            color: " #C7D0DD",
            border: "1px solid #fff",
          },
        },
      },
    },
  },
});

export default theme;
