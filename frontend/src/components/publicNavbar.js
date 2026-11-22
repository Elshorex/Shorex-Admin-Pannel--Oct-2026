import { React, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Select,
  FormControl,
  Box,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { Link } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import { useLanguage } from "../hooks/useLanguage";
import { ARABIC_LANGUAGE, ENGLISH_LANGUAGE } from "./utils/Constant";

import LanguageIcon from "@mui/icons-material/Language";
import Logo from "../assets/svgs/Logo.png";

export default function PublicNavbar() {
  const { locale, setLocale } = useLanguage();

  const classes = useStyles();
  const theme = useTheme();

  const [step, setStep] = useState(locale);

  const handleChange = (event) => {
    setStep(event.target.value);
    if (event.target.value === "en") {
      setLocale(ENGLISH_LANGUAGE);
    } else if (event.target.value === "ar") {
      setLocale(ARABIC_LANGUAGE);
    } else if (event.target.value === "es") {
      setLocale("es");
    }
    // Add more conditions for other languages if needed
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          "& .MuiToolbar-root": {
            px: 2,
          },
        }}
      >
        <Toolbar
          sx={{
            bgcolor: "primary.main",
            display: "flex",
            justifyContent: "space-between",
            "& .MuiToolbar-root": {
              padding: "0px",
            },
          }}
          className={classes.toolbar}
        >
          <Toolbar
            sx={{
              height: "64px",
              "& .MuiToolbar-root": {
                padding: "0px",
              },
            }}
            className={classes.toolbar}
          >
            <Link to="/">
              <Typography
                variant="h1"
                sx={{
                  color: "white",
                  [theme.breakpoints.down("md")]: {
                    fontSize: 18,
                  },
                  [theme.breakpoints.down("sm")]: {
                    fontSize: 16,
                  },
                }}
              >
                <div
                  style={{
                    display: "flex",
                    color: "black",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <img alt="logo" src={Logo} width={176} height={32} />
                </div>
              </Typography>
            </Link>
          </Toolbar>
          <Toolbar
            sx={{
              "& .MuiToolbar-root": {
                padding: "0px",
              },
            }}
          >
            <Box>
              <FormControl
                sx={{
                  minWidth: 154,
                  height: 45,
                  margin: "0px 5px",
                  borderColor: "#B0D9C3",
                }}
              >
                <Select
                  value={step}
                  onChange={handleChange}
                  sx={{
                    color: "#049A77",
                    backgroundColor: "#ffffff",
                    p: 2,
                    border: "0.1px solid #B0D9C3",
                  }}
                >
                  <MenuItem value={"en"}>
                    <ListItemIcon
                      sx={{
                        color: "#049A77",
                        borderColor: step === "en" ? "#049A77" : "transparent",
                        marginTop: "5px",
                      }}
                    >
                      <LanguageIcon
                        sx={{
                          fontSize: 20,
                          margin: "0px 4px",
                          color: "#049A77",
                          "&:hover": {
                            color: "#e6e6e6",
                          },
                          [theme.breakpoints.down("md")]: {
                            fontSize: 16,
                          },
                          [theme.breakpoints.down("sm")]: {
                            fontSize: 14,
                          },
                        }}
                      />
                      English
                    </ListItemIcon>
                  </MenuItem>
                  <MenuItem value={"ar"}>
                    <ListItemIcon
                      sx={{
                        color: "#049A77",
                        borderColor: step === "ar" ? "#049A77" : "transparent",
                        marginTop: "5px",
                      }}
                    >
                      <LanguageIcon
                        sx={{
                          fontSize: 20,
                          margin: "0px 4px",
                          color: "#049A77",
                          "&:hover": {
                            color: "#e6e6e6",
                          },
                          [theme.breakpoints.down("md")]: {
                            fontSize: 16,
                          },
                          [theme.breakpoints.down("sm")]: {
                            fontSize: 14,
                          },
                        }}
                      />
                      العربية
                    </ListItemIcon>
                  </MenuItem>
                  <MenuItem value={"es"}>
                    <ListItemIcon
                      sx={{
                        color: "#049A77",
                        borderColor: step === "es" ? "#049A77" : "transparent",
                        marginTop: "5px",
                      }}
                    >
                      <LanguageIcon
                        sx={{
                          fontSize: 20,
                          margin: "0px 4px",
                          color: "#049A77",
                          "&:hover": {
                            color: "#e6e6e6",
                          },
                          [theme.breakpoints.down("md")]: {
                            fontSize: 16,
                          },
                          [theme.breakpoints.down("sm")]: {
                            fontSize: 14,
                          },
                        }}
                      />
                      Spanish
                    </ListItemIcon>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Toolbar>
        </Toolbar>
      </AppBar>
    </>
  );
}

const useStyles = styled((theme) => ({
  toolbar: {
    "& .MuiToolbar-gutters": {
      paddingLeft: "0px", // Adjust left padding
      paddingRight: "0px", // Adjust right padding
    },
    "& .MuiToolbar-root": {
      paddingLeft: "0px", // Adjust left padding
      paddingRight: "0px", // Adjust right padding
    },
  },
}));
