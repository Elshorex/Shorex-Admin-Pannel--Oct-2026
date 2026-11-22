import { React, useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Select,
  FormControl,
  Box,
  MenuItem,
  ListItemIcon,
  InputLabel,
  Input,
  InputAdornment,
  autocompleteClasses,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";
import { useLanguage } from "../hooks/useLanguage";
import { ARABIC_LANGUAGE, ENGLISH_LANGUAGE } from "./utils/Constant";
import SideNavbar from "./SideNavbar";

import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import LanguageIcon from "@mui/icons-material/Language";
import Logo from "../assets/svgs/Logo.png";
import { logout, useAuthDispatch, useAuthState } from "../context";

export default function Navbar({ collapsed, setCollapsed }) {
  const { locale, setLocale } = useLanguage();
  const getEmail = localStorage.getItem("emailData");
  const getPassword = localStorage.getItem("passwordData");
  const dispatch = useAuthDispatch(); // read dispatch method from context
  const navigate = useNavigate();
  const user = useAuthState();

  const handleLogout = () => {
    logout(dispatch); //call the logout action
    navigate("/login"); //navigate to logout page on logout
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (!getEmail && !getPassword) {
      setIsLoggedIn(false);
    } else {
      setIsLoggedIn(true);
    }
  }, [getEmail, getPassword]);

  const [step, setStep] = useState(locale);
  const [openPersonIcon, setOpenPersonIcon] = useState(false);

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
            padding: "0px",
          },
        }}
        style={{
          boxShadow:
            "0px 2px 4px -2px rgba(24, 39, 75, 0.12), 0px 4px 4px -2px rgba(24, 39, 75, 0.08)",
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
          className="main-toolbar" // Change this line
        >
          <Toolbar
            sx={{
              height: "64px",
              "& .MuiToolbar-root": {
                padding: "0px",
              },
            }}
            className="sub-toolbar" // Change this line
          >
            <Link>
              <IconButton
                title="Notifications"
                sx={{ color: "#ffffff", p: "0px" }}
                onClick={() => setCollapsed(!collapsed)}
              >
                <MenuIcon
                  sx={{
                    backgroundColor: "#FFFFFF", // White background
                    color: "primary.main", // Icon color
                    borderRadius: "50%",
                    p: "12px",
                    border: "1px solid #049A77",
                    mx: 3,
                    fontSize: 20,
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
              </IconButton>
            </Link>
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

            <Link to="/Notifications">
              <IconButton title="Notifications" sx={{ color: "#ffffff" }}>
                <NotificationsIcon
                  sx={{
                    backgroundColor: "#FFFFFF", // White background
                    color: "primary.main", // Icon color
                    borderRadius: "50%",
                    padding: "12px",
                    border: "1px solid #049A77",
                    fontSize: 22,
                    "&:hover": {
                      color: "#e6e6e6",
                    },
                    [theme.breakpoints.down("md")]: {
                      fontSize: 18,
                    },
                    [theme.breakpoints.down("sm")]: {
                      fontSize: 14,
                    },
                  }}
                />
              </IconButton>
            </Link>

            {/* <Link to="/user"> */}

            <Box sx={{ minWidth: 50, marginLeft: 3, marginRight: 3 }}>
              <FormControl>
                {/* <InputLabel id="demo-simple-select-label">Age</InputLabel> */}
                <Select
                  open={openPersonIcon}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={0}
                  onClick={() => {
                    setOpenPersonIcon(!openPersonIcon);
                  }}
                  // label="Age"
                  // onChange={handleChange}
                  IconComponent={PersonIcon} // Use PersonIcon directly as the icon
                  sx={{
                    "& .MuiSelect-icon": {
                      backgroundColor: "#FFFFFF", // White background
                      color: "primary.main", // Icon color
                      borderRadius: "50%",
                      padding: "12px",
                      border: "1px solid #049A77",
                      // margin: "0px 12px",
                      "&:hover": {
                        color: "#e6e6e6",
                      },
                      transform: "none",
                      top: "-3px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none", // Remove the border outline
                    },
                    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                      border: "none", // Remove border when focused
                    },
                    "& .MuiSelect-iconOpen": {
                      top: "-3px",
                      transform: "none", // Prevent the icon from rotating 180 degrees
                    },
                    "& .css-hfutr2-MuiSvgIcon-root-MuiSelect-icon": {
                      top: "-3px",
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      navigate("/profile");
                      setOpenPersonIcon(false);
                    }}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleLogout();
                    }}
                  >
                    Logout
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Toolbar>
        </Toolbar>
      </AppBar>

      <SideNavbar collapsed={collapsed} />
    </>
  );
}
