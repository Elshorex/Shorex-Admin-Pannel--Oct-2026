import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  CircularProgress,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";

import { useFetchedData } from "../hooks/useFetchedData";
import { formatNumberWithCommas } from "../components/utils/Helper";
import DashboardChart from "../components/DashboardChart";
import LoopingChart from "../components/loopChart";
import BarChart from "../components/barChart";
import RequestsManagement from "./RewardsManagement";
import DashboardFilter from "../components/Filters/dashboardFilter";

import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";

export default function Dashboard() {
  const intl = useIntl();
  const [duration, setDuration] = useState(12);
  const [provider_x_AxisArray, setXAxis] = useState([]);
  const [provider_y_AxisArray, setYAxis] = useState([]);

  const [fetchedCardsData, loadingCardsData, getCardsData] = useFetchedData(
    `/dashboard/count?duration=${duration}`
  );

  const [fetchedRequestData, loadingRequestData, getRequestData] =
    useFetchedData(`/dashboard/request-status-graph?duration=${duration}`);

  const [fetchedCustomerData, loadingCustomerData, getCustomerData] =
    useFetchedData(`/dashboard/customer-graph?duration=${duration}`);

  const [fetchedProviderData, loadingProviderData, getProviderData] =
    useFetchedData(`/dashboard/provider-requests-graph?duration=${duration}`);

  const [
    fetchedClaimRewardsData,
    loadingClaimRewardsData,
    getClaimRewardsData,
  ] = useFetchedData(`dashboard/claim-reward-graph?duration=${duration}`);

  useEffect(() => {
    const { data } = fetchedProviderData || {};
    
    if (data?.providersGraph?.length) {
      const yAxisValues = data.providersGraph.map((item) => item.count ?? 0);
      const xAxisValues = data.providersGraph.map((item) => item.provider?.name ?? "Shorex");
      
      setYAxis(yAxisValues);
      setXAxis(xAxisValues);
    }
  }, [fetchedProviderData?.data?.providersGraph?.length]);

  useEffect(() => {
    getCustomerData();
    getCardsData();
    getRequestData();
    getProviderData();
    getClaimRewardsData();
  }, [duration]);

  const loading =
    loadingCardsData ||
    loadingRequestData ||
    loadingCustomerData ||
    loadingClaimRewardsData;

  return (
    <Box sx={{ m: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          pb: "24px",
        }}
      >
        <Typography variant="h2">
          <FormattedMessage id="dashboard.statistics" />
        </Typography>
        {loading && <CircularProgress />}

        <DashboardFilter setDuration={setDuration} duration={duration} />
      </Box>

      {/* Cards Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          height: "100px",
          width: "100%",
          mb: 3,
          mx: "auto",
        }}
      >
        <Card
          sx={{
            width: "48%",
            height: "100%",
          }}
        >
          <CardHeader
            avatar={
              <CardGiftcardIcon fontSize="24px" sx={{ color: "#049A77" }} />
            }
            title={
              <Typography variant="h4" color="text.secondary">
                <FormattedMessage id="dashboard.customerAvailableRewards" />
              </Typography>
            }
          />
          <CardContent>
            <Typography variant="h2" sx={{ color: "#049A77" }}>
              {formatNumberWithCommas(fetchedCardsData?.data?.availableRewards || 0)}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            width: "48%",
            height: "100%",
          }}
        >
          <CardHeader
            avatar={
              <CardGiftcardIcon fontSize="24px" sx={{ color: "#049A77" }} />
            }
            title={
              <Typography variant="h4" color="text.secondary">
                <FormattedMessage id="dashboard.totalDonatedRewards" />
              </Typography>
            }
          />
          <CardContent>
            <Typography variant="h2" sx={{ color: "#049A77" }}>
              {formatNumberWithCommas(fetchedCardsData?.data?.donationAmount || 0)}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* First Row of Charts */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          height: "250px",
          width: "100%",
          mb: 3,
        }}
      >
        <Box sx={{ width: "48%", height: "100%" }}>
          <BarChart
            title={intl.formatMessage({ id: "dashboard.claimedRewards" })}
            x_AxisArray={fetchedClaimRewardsData?.data?.x_AxisArray}
            y_AxisArray={fetchedClaimRewardsData?.data?.y_AxisArray}
          />
        </Box>
        <Box sx={{ width: "48%", height: "100%" }}>
          <DashboardChart fetchedRequestData={fetchedRequestData} />
        </Box>
      </Box>

      {/* Second Row of Charts */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          height: "250px",
          width: "100%",
        }}
      >
        <Box sx={{ width: "48%", height: "100%" }}>
          <LoopingChart
            x_AxisArray={fetchedCustomerData?.data?.x_AxisArray}
            y_AxisArray={fetchedCustomerData?.data?.y_AxisArray}
          />
        </Box>
        <Box sx={{ width: "48%", height: "100%" }}>
          <BarChart
            title={intl.formatMessage({ id: "dashboard.requestsProvider" })}
            x_AxisArray={provider_x_AxisArray}
            y_AxisArray={provider_y_AxisArray}
          />
        </Box>
      </Box>

      {/* Table Row */}
      <Box
        sx={{
          height: "470px",
          width: "100%",
          mb: 3,
          overflow: "hidden",
        }}
      >
        <RequestsManagement />
      </Box>
    </Box>
  );
}
