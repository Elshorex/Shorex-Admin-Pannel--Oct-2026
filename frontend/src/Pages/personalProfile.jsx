import React, { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import moment from "moment";
import { FormattedMessage, useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";

import { useFetchedData } from "../hooks/useFetchedData";
import { useLanguage } from "../hooks/useLanguage";

export default function PersonalProfile() {
  const location = useLocation();
  const customerId = location?.state?.customerId;
  const { locale } = useLanguage();

  const [row, setRow] = useState();

  const [fetchedCustomerData, loadingCustomerData, getCustomerData] =
    useFetchedData(
      `/customer/userInfo?removeLanguage=true&userId=${customerId}`,
      false
    );

  useEffect(() => {
    customerId && getCustomerData();
  }, [customerId]);

  useEffect(() => {
    setRow(fetchedCustomerData?.data?.user);
  }, [Object.keys(fetchedCustomerData).length]);
  return (
    <>
      <Typography
        variant="h3"
        color="#049A77"
        sx={{
          backgroundColor: "#F2F3F2",
          px: "4px",
          py: 1,
          borderRadius: 1,
          mb: "4px",
        }}
      >
        <FormattedMessage id="customer.customerInfo" />
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <div>
          <Typography variant="h3" color="#646866">
            <FormattedMessage id="driver.email" />
          </Typography>
          <Typography variant="h2">{row?.email}</Typography>
        </div>

        <div>
          <Typography variant="h3" color="#646866">
            <FormattedMessage id="sideNavbar.businessCategories" />
          </Typography>
          <Typography variant="h2">{row?.category?.name[locale]}</Typography>
        </div>

        <div>
          <Typography variant="h3" color="#646866">
            <FormattedMessage id="driver.licenseNumber" />
          </Typography>
          <Typography variant="h2">{row.licenceNumber}</Typography>
        </div>

        <div>
          <Typography variant="h3" color="#646866">
            <FormattedMessage id="warehouse.joiningDate" />
          </Typography>
          <Typography variant="h2">
            {moment(row?.joinDate).format("YYYY-MM-DD")}
          </Typography>
        </div>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          width: "44%",
        }}
      >
        <div>
          <Typography variant="h3" color="#646866">
            <FormattedMessage id="driver.mobileNumber" />
          </Typography>
          <Typography variant="h2">{row?.phone}</Typography>
        </div>

        <div>
          <Typography variant="h3" color="#646866">
            <FormattedMessage id="driver.landLineNumber" />
          </Typography>
          <Typography variant="h2">{row?.landlineNumber}</Typography>
        </div>
      </Box>
    </>
  );
}
