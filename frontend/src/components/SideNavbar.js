import React, { useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { FormattedMessage } from "react-intl";
import { useNavigate, useLocation } from "react-router";
import { Typography, Tooltip } from "@mui/material";

import { useFetchedData } from "../hooks/useFetchedData";
import { useAuthState } from "../context";
import Required from "./required";

import NotificationsIcon from "@mui/icons-material/Notifications";
import WindowIcon from "@mui/icons-material/Window";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import SettingsIcon from "@mui/icons-material/Settings";
import LanguageIcon from "@mui/icons-material/Language";
import GroupIcon from "@mui/icons-material/Group";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import DescriptionIcon from "@mui/icons-material/Description";
import WeekendIcon from "@mui/icons-material/Weekend";
import PublicIcon from "@mui/icons-material/Public";
import AutorenewIcon from "@mui/icons-material/Autorenew";

export default function SideNavbar({ collapsed }) {
  const [activeMenuItem, setActiveMenuItem] = useState("");
  const navigate = useNavigate();
  const pathname = useLocation()?.pathname;
  const { userData } = useAuthState();
  const providerType = userData?.type === "PROVIDER";

  useEffect(() => {
    if (pathname === "/" || pathname === "/dashboard") {
      setActiveMenuItem("dashboard");
    }
  }, [pathname]);

  const handleMenuItemClick = (id, path) => {
    setActiveMenuItem(id);
    navigate(path);
  };

  const [fetchedRequestsCount] = useFetchedData(
    "/request/inprogress/count",
    !!userData
  );
  const [fetchedRewardsCount] = useFetchedData(
    "/claim-request/count",
    !!userData
  );

  const renderMenuItem = (icon, labelId, id, path, showRequired) => (
    <Tooltip
      title={
        <Typography variant="body2">
          <FormattedMessage id={labelId} />
        </Typography>
      }
      placement="right"
      arrow
    >
      <MenuItem
        icon={icon}
        active={activeMenuItem === id}
        onClick={() => handleMenuItemClick(id, path)}
        style={{
          backgroundColor: activeMenuItem === id ? "#049A77" : "inherit",
          color: activeMenuItem === id ? "#FFFFFF" : "inherit",
        }}
      >
        <Typography sx={{ display: "flex" }} variant="h3">
          <FormattedMessage id={labelId} />
          {showRequired && <Required />}
        </Typography>
      </MenuItem>
    </Tooltip>
  );

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        minHeight: "400px",
        marginTop: "64px",
        color: "#646866",
      }}
    >
      <Sidebar collapsed={collapsed} collapsedWidth="70px">
        <Menu closeOnClick style={{ marginTop: "24px" }}>
          {renderMenuItem(
            <WindowIcon />,
            "sideNavbar.home",
            "dashboard",
            "/dashboard"
          )}
          {renderMenuItem(
            <CurrencyExchangeIcon />,
            "requestsManagement.requestsManagement",
            "requestsManagement",
            "/requestsManagement",
            fetchedRequestsCount?.data?.count > 0
          )}
          {renderMenuItem(
            <MilitaryTechIcon />,
            "rewardsManagement.claimRewards",
            "rewardsManagement",
            "/rewardsManagement",
            fetchedRewardsCount?.data?.count > 0
          )}
           {renderMenuItem(
            <AutorenewIcon />,
            "rewardsManagement.returnables",
            "returnables",
            "/returnables",
          )}

          <SubMenu
            label={
              <Typography variant="h3">
                <FormattedMessage id="sideNavbar.operations" />
              </Typography>
            }
            icon={<NotificationsIcon />}
          >
            {renderMenuItem(
              <Inventory2Icon />,
              "customer.customer",
              "customer",
              "/customer"
            )}
            {renderMenuItem(
              <DirectionsCarIcon />,
              "driver.drivers",
              "driver",
              "/driver"
            )}
            {renderMenuItem(
              <DirectionsCarIcon />,
              "vehicle.vehicles",
              "vehicle",
              "/vehicle"
            )}
            {renderMenuItem(
              <WarehouseIcon />,
              "warehouse.warehouses",
              "warehouse",
              "/warehouse"
            )}
            {/* {renderMenuItem(
              <Inventory2Icon />,
              "stock.stock",
              "stock",
              "/stock"
            )} */}
          </SubMenu>

          {!providerType && (
            <SubMenu
              label={
                <Typography variant="h3">
                  <FormattedMessage id="sideNavbar.generalSettings" />
                </Typography>
              }
              icon={<SettingsIcon />}
            >
              {renderMenuItem(
                <DescriptionIcon />,
                "contactUs.contactUs",
                "contactUs",
                "/contactUs"
              )}
              {renderMenuItem(
                <NotificationsIcon />,
                "notifications.notifications",
                "notifications",
                "/notifications"
              )}
              {renderMenuItem(
                <DescriptionIcon />,
                "policy.policy",
                "policy",
                "/policy"
              )}
              {renderMenuItem(
                <DescriptionIcon />,
                "terms.terms",
                "terms",
                "/terms"
              )}
              {renderMenuItem(
                <EmojiEventsIcon />,
                "promotion.promotions",
                "promotions",
                "/promotions"
              )}
              {/* {renderMenuItem(
                <DescriptionIcon />,
                "requestsManagement.recycleSteps",
                "recycleSteps",
                "/recycleSteps"
              )} */}
              {renderMenuItem(
                <LanguageIcon />,
                "sideNavbar.countries",
                "countries",
                "/countries"
              )}
              {renderMenuItem(
              <PublicIcon />,
              "sideNavbar.states",
              "states",
              "/regions"
            )}
            {renderMenuItem(
              <PublicIcon />,
              "sideNavbar.cities",
              "cities",
              "/cities"
            )}
            {renderMenuItem(
              <PublicIcon />,
              "sideNavbar.areas",
              "areas",
              "/areas"
            )}
              {/* {renderMenuItem(
                <GroupIcon />,
                "sideNavbar.providers",
                "providers",
                "/providers"
              )} */}
              {renderMenuItem(
                <MilitaryTechIcon />,
                "rewardsManagement.rewardsManagementPoints",
                "rewards",
                "/rewards"
              )}
              {renderMenuItem(
                <Inventory2Icon />,
                "sideNavbar.products",
                "products",
                "/products"
              )}
                {renderMenuItem(
                <Inventory2Icon />,
                "sideNavbar.rewardProducts",
                "rewardProducts",
                "/rewardProducts"
              )}

              {renderMenuItem(
                <WeekendIcon />,
                "sideNavbar.weekends",
                "weekends",
                "/weekends"
              )}

              {renderMenuItem(
                <PublicIcon />,
                "holidays.holidays",
                "holidays",
                "/holidays"
              )}

              {renderMenuItem(
                <WindowIcon />,
                "sideNavbar.businessCategories",
                "businessCategories",
                "/businessCategories"
              )}
            </SubMenu>
          )}
        </Menu>
      </Sidebar>
    </div>
  );
}
