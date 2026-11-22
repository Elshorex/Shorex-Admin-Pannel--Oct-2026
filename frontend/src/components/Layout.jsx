import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import SideNavbar from "./SideNavbar";
import Navbar from "./Navbar";
export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const drawerWidth = collapsed ? 130 : 310;
  const [availWidth, setAvailWidth] = useState(null);

  useEffect(() => {
    setAvailWidth(window.screen.availWidth);
    const updateAvailWidth = () => {
      setAvailWidth(window.screen.availWidth);
    };

    window.addEventListener("resize", updateAvailWidth);
    return () => {
      window.removeEventListener("resize", updateAvailWidth);
    };
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Box
        component="main"
        sx={{
          marginTop: "64px",
          width: `${window.screen.availWidth - drawerWidth}px`,
        }}
        // sx={{
        //   backgroundColor: "white",
        //   display: "flex",
        //   flexDirection: "column",
        //   overflow: "scroll",
        //   p: 3,
        //   width: {
        //     sm: `calc(100% - ${drawerWidth}px)`,
        //     // sm: "100%",
        //     xs: "100%",
        //   },
        //   // height: "100%",
        //   width: "100%",
        //   marginTop: "64px",
        // }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
