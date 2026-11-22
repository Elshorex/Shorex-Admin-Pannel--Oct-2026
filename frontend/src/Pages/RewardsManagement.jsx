import React from "react";
import { Box, Typography, Tab, Button } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { TabPanel, TabList, TabContext } from "@mui/lab";

import ClaimRewards from "../components/rewards/claimRewards";
import DailyGainedPointsRewards from "../components/rewards/DailyGainedPoints";
import { useLocation, useNavigate } from "react-router-dom";

export default function RequestsManagement() {
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
            <FormattedMessage id="rewardsManagement.claimRewards" />
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
        <TabContext value={value} sx={{}}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab
                label={
                  <Typography variant="h3">
                    <FormattedMessage id="rewardsManagement.claimRewards" />
                  </Typography>
                }
                value="1"
              />
              <Tab
                label={
                  <Typography variant="h3">
                    <FormattedMessage id="rewardsManagement.dailyGainedPoints" />
                  </Typography>
                }
                value="2"
              />
            </TabList>
            {!isNotDashboard && (
              <Button
                sx={{ height: "30px", width: "150px", mx: "30px" }}
                variant="contained"
                onClick={() => navigate("/rewardsManagement")}
              >
                <Typography variant="h3">
                  <FormattedMessage id="dashboard.viewDetails" />
                </Typography>
              </Button>
            )}
          </Box>
          <TabPanel value="1" sx={{ px: 0 }}>
            <ClaimRewards />
          </TabPanel>
          <TabPanel value="2" sx={{ px: 0 }}>
            <DailyGainedPointsRewards />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
}
