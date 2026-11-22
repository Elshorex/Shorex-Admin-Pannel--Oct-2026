import React from "react";
import { Box, Typography, Tab, Button } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { TabPanel, TabList, TabContext } from "@mui/lab";

import DeliveredToClient from "../components/returnables/DeliveredToClient";
import ReceivedByShorex from "../components/returnables/ReceivedByShorex";
import { useLocation, useNavigate } from "react-router-dom";

export default function ReturnablesManagement() {
  const [value, setValue] = React.useState("1");
  const location = useLocation()?.pathname;
  const isNotDashboard = location != "/dashboard" && location != "/";
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{
        width: "100%",
        p: "24px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          pb: "24px",
        }}
      >
        <Typography variant="h2">
          {isNotDashboard ? (
            <FormattedMessage id="returnablesManagement.title" defaultMessage="Returnables Management" />
          ) : (
            <FormattedMessage id="dashboard.quickAccess" />
          )}
        </Typography>
      </Box>
      <Box
        sx={{
          width: "100%",
          typography: "body1",
        }}
      >
        <TabContext value={value}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <TabList onChange={handleChange} aria-label="returnables tabs">
              <Tab
                label={
                  <Typography variant="h3">
                    <FormattedMessage id="returnablesManagement.deliveredToClient" defaultMessage="DELIVERED TO CLIENT" />
                  </Typography>
                }
                value="1"
              />
              <Tab
                label={
                  <Typography variant="h3">
                    <FormattedMessage id="returnablesManagement.receivedByShorex" defaultMessage="RECEIVED BY SHOREX" />
                  </Typography>
                }
                value="2"
              />
            </TabList>
            {!isNotDashboard && (
              <Button
                sx={{ height: "30px", width: "180px", mx: "30px" }}
                variant="contained"
                onClick={() => navigate("/returnablesManagement")}
              >
                <Typography variant="h3">
                  <FormattedMessage id="dashboard.viewDetails" />
                </Typography>
              </Button>
            )}
          </Box>

          {/* ✅ Tab 1 — Delivered to Client */}
          <TabPanel value="1" sx={{ px: 0 }}>
            <DeliveredToClient />
          </TabPanel>

          {/* ✅ Tab 2 — Received by Shorex */}
          <TabPanel value="2" sx={{ px: 0 }}>
            <ReceivedByShorex />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
}
