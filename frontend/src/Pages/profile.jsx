import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardHeader,
  CircularProgress,
  Button,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";

import { useFetchedData } from "../hooks/useFetchedData";
import { useLanguage } from "../hooks/useLanguage";
import EditProfile from "../components/modals/editProfile";

import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import { useAuthState } from "../context";

export default function ViewProfile() {
  const [row, setRow] = useState();
  const { userData } = useAuthState();
  const userId = userData?.id;
  const [openEditContact, setOpenEditContact] = useState(false);
  const navigate = useNavigate();

  const [fetchedCustomerData, loadingCustomerData, getCustomerData] =
    useFetchedData(`userInfo?userId=${userData?.id}`);

  useEffect(() => {
    userId && getCustomerData();
  }, [userId]);

  useEffect(() => {
    setRow(fetchedCustomerData?.data?.user);
  }, [Object.keys(fetchedCustomerData).length]);

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex" }}>
          <Typography variant="h2">
            <FormattedMessage id="profile.profile" />
          </Typography>
        </Box>
        {loadingCustomerData && <CircularProgress />}

        <Box
          sx={{
            border: 1,
            p: 2,
            mt: 2,
            borderRadius: 1,
            borderColor: "#646866",
            borderStyle: "dashed",
          }}
        >
          <Box>
            <Card
              sx={{
                minWidth: "320px",
                maxWidth: "450px",
                height: "90px",
                mb: 3,
              }}
            >
              <CardHeader
                avatar={<PersonIcon fontSize="large" />}
                title={
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="h2" color="text.secondary">
                        {fetchedCustomerData?.data?.user?.name}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h4"
                      color="text.secondary"
                      sx={{ display: "flex", mx: 1 }}
                    >
                      <EditIcon
                        sx={{ color: "#049A77", mx: 3, cursor: "pointer" }}
                        onClick={() => {
                          setOpenEditContact(true);
                        }}
                      />
                    </Typography>
                  </Box>
                }
              />
            </Card>
          </Box>
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
              <Typography variant="h2">
                {fetchedCustomerData?.data?.user?.email}
              </Typography>
            </div>

            <div>
              <Typography variant="h3" color="#646866">
                <FormattedMessage id="driver.mobileNumber" />
              </Typography>
              <Typography variant="h2">
                {fetchedCustomerData?.data?.user?.phone}
              </Typography>
            </div>

            <div>
              <Typography variant="h3" color="#646866">
                <FormattedMessage id="customer.countryName" />
              </Typography>
              <Typography variant="h2">
                {fetchedCustomerData?.data?.user?.country?.name}
              </Typography>
            </div>

            <div />
          </Box>

          <Button
            sx={{ mb: 2 }}
            variant="outlined"
            onClick={() => {
              navigate("/changePassword");
            }}
          >
            <Typography variant="h3">
              <FormattedMessage id="profile.changePassword" />
            </Typography>
          </Button>
        </Box>
      </Box>

      <EditProfile
        open={openEditContact}
        handleClose={() => {
          setOpenEditContact(false);
        }}
        handleOpen={() => {
          setOpenEditContact(true);
        }}
        getData={getCustomerData}
        row={fetchedCustomerData?.data?.user}
      />
    </>
  );
}
