import React from "react";
import { Box, Typography, Tab, Button } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { TabPanel, TabList, TabContext } from "@mui/lab";
import { useNavigate } from "react-router-dom";

import InProgressRequests from "../components/requests/inProgress";
import HistoryRequests from "../components/requests/history";
import FutureRequests from "../components/requests/future";
import FailedRequests from "../components/requests/failed";

import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function RequestsManagement() {
  const [value, setValue] = React.useState("1");
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
          <FormattedMessage id="requestsManagement.requestsManagement" />
        </Typography>

        {/* <Button
          variant="contained"
          startIcon={<LocationOnIcon sx={{ ml: "16px" }} />}
          onClick={() => navigate("/createRoute")}
        >
          <Typography variant="h3">
          <FormattedMessage id="createRoute.createRoute" />
          </Typography>
        </Button> */}
      </Box>

      <Box sx={{ width: "100%", typography: "body1" }}>
        <TabContext value={value}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <TabList onChange={handleChange}>
              <Tab
                label={
                  <Typography variant="h3">
                    <FormattedMessage id="requestsManagement.inProgress" />
                  </Typography>
                }
                value="1"
              />
              <Tab
                label={
                  <Typography variant="h3">
                    <FormattedMessage id="requestsManagement.future" />
                  </Typography>
                }
                value="2"
              />
              <Tab
                label={
                  <Typography variant="h3">
                    <FormattedMessage id="requestsManagement.history" />
                  </Typography>
                }
                value="3"
              />
              <Tab
                label={
                  <Typography variant="h3">
                    <FormattedMessage id="requestsManagement.failed" />
                  </Typography>
                }
                value="4"
              />
            </TabList>
          </Box>
          <TabPanel value="1" sx={{ px: 0 }}>
            <InProgressRequests />
          </TabPanel>
          <TabPanel value="2" sx={{ px: 0 }}>
            <FutureRequests />
          </TabPanel>
          <TabPanel value="3" sx={{ px: 0 }}>
            <HistoryRequests />
          </TabPanel>
          <TabPanel value="4" sx={{ px: 0 }}>
            <FailedRequests />
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
}
