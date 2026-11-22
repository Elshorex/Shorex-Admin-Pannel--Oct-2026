import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
  Switch,
  IconButton,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";

import { useFetchedData } from "../hooks/useFetchedData";
import { useLanguage } from "../hooks/useLanguage";

import ebcoLogo from "../assets/svgs/ebco.svg?react";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import EmailIcon from "@mui/icons-material/Email";
import { formatNumberWithCommas } from "../components/utils/Helper";

export default function ViewRequestDetails() {
  const location = useLocation();
  const { locale } = useLanguage();
  const navigate = useNavigate();

  const requestId = location?.state?.requestId;

  const [row, setRow] = useState();

  const [fetchedRequestData, loadingRequestData, getRequestData] =
    useFetchedData(`/request/${requestId}?removeLanguage=true`);

  useEffect(() => {
    requestId && getRequestData();
  }, [requestId]);

  useEffect(() => {
    setRow(fetchedRequestData?.data);
  }, [Object.keys(fetchedRequestData).length]);

  const handleEmailClick = (email) => {
    window.location.href = "mailto:" + email;
  };

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex" }}>
          <ArrowBackIosIcon
            onClick={() => navigate(-1)}
            fontSize="24px"
            sx={{ mt: "4px", mx: 1, scale: locale == "ar" && "-1" }}
          />
          <Typography variant="h2">
            <FormattedMessage id="requestsManagement.requestDetails" />
          </Typography>
        </Box>
        {loadingRequestData && <CircularProgress />}
        {row && Object.keys(row)?.length && (
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
                }}
              >
                <CardHeader
                  avatar={<img src={ebcoLogo} width={80} height={50} />}
                  title={
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ mx: 1 }}>
                        <Typography
                          variant="h2"
                          color="text.secondary"
                          // sx={{ mx: 1 }}
                        >
                          {row?.customer?.bussinessName}
                        </Typography>
                        <Typography
                          variant="h3"
                          color="text.secondary"
                          // sx={{ mx: 1 }}
                        >
                          {row?.customer?.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h4"
                        color="text.secondary"
                        sx={{ display: "flex", mx: 1 }}
                      >
                        {/* <DescriptionIcon
                          sx={{ color: "#049A77", mx: 1, cursor: "pointer" }}
                          onClick={() => setOpenViewImage(true)}
                        /> */}
                        <IconButton
                          onClick={() => handleEmailClick(row?.customer?.email)}
                        >
                          <EmailIcon
                            sx={{ color: "#049A77", mx: 1, cursor: "pointer" }}
                          />
                        </IconButton>
                      </Typography>
                    </Box>
                  }
                />
              </Card>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                my: 3,
              }}
            >
              <Card
                sx={{
                  minWidth: "220px",
                  height: "90px",
                  "& .css-46bh2p-MuiCardContent-root": {
                    padding: "8px",
                  },
                }}
              >
                <CardHeader
                  avatar={
                    <CardGiftcardIcon
                      fontSize="24px"
                      sx={{ color: "#049A77" }}
                    />
                  }
                  title={
                    <Typography variant="h4" color="text.secondary">
                      <FormattedMessage id="customer.gainedPoints" />
                    </Typography>
                  }
                />
                <CardContent>
                  <Typography variant="h2" sx={{ color: "#049A77" }}>
                    {formatNumberWithCommas(row?.gainedPoints || 0)}
                  </Typography>
                </CardContent>
              </Card>
              <Card
                sx={{
                  minWidth: "220px",
                  height: "90px",
                  "& .css-46bh2p-MuiCardContent-root": {
                    padding: "8px",
                  },
                }}
              >
                <CardHeader
                  avatar={
                    <CardGiftcardIcon
                      fontSize="24px"
                      sx={{ color: "#049A77" }}
                    />
                  }
                  title={
                    <Typography variant="h4" color="text.secondary">
                      <FormattedMessage id="customer.gainedRewards" />
                    </Typography>
                  }
                /> 
                <CardContent> 
                  <Typography variant="h2" sx={{ color: "#049A77" }}>
                    {formatNumberWithCommas(row?.gainedReward.toFixed(2) || 0 )}
                  </Typography>
                </CardContent>
              </Card>
              <Card
                sx={{
                  minWidth: "220px",
                  height: "90px",
                  "& .css-46bh2p-MuiCardContent-root": {
                    padding: "8px",
                  },
                }}
              >
                <CardHeader
                  avatar={
                    <CardGiftcardIcon
                      fontSize="24px"
                      sx={{ color: "#049A77" }}
                    />
                  }
                  title={
                    <Typography variant="h4" color="text.secondary">
                      <FormattedMessage id="customer.rewardType" />
                    </Typography>
                  }
                />
                <CardContent>
                  <Typography variant="h2" sx={{ color: "#049A77" }}>
                    {formatNumberWithCommas(row?.rewardType?.join(',')|| 0)}
                  </Typography>
                </CardContent>
              </Card>
              <Card
                sx={{
                  minWidth: "220px",
                  height: "90px",
                  "& .css-46bh2p-MuiCardContent-root": {
                    padding: "8px",
                  },
                }}
              >
                <CardHeader
                  avatar={
                    <CardGiftcardIcon
                      fontSize="24px"
                      sx={{ color: "#049A77" }}
                    />
                  }
                  title={
                    <Box>
                      <Typography
                        variant="h4"
                        color="text.secondary"
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <FormattedMessage id="customer.cash" />
                        {/* <Switch
                          sx={{ mt: "-6px" }}
                          checked={row?.customer?.cashAmount}
                          inputProps={{ "aria-label": "controlled" }}
                          size="small"
                          disabled
                        /> */}
                      </Typography>
                    </Box>
                  }
                />
                <CardContent>
                  <Typography variant="h2" sx={{ color: "#049A77" }}>
                    {row?.customer?.depositDescription}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
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
              <FormattedMessage id="requestsManagement.requestInfo" />
            </Typography>

            <Box
              sx={{
                display: "flex",
                mb: 3,
              }}
            >
              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="requestsManagement.requestId" />
                </Typography>
                <Typography variant="h2">{row?.requestId}</Typography>
              </Box>
              

              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="sideNavbar.products" />
                </Typography>
                <Typography variant="h2">
                  {row?.product?.name[locale]}
                </Typography>
              </Box>

              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="requestsManagement.quantity" />
                </Typography>
                <Typography variant="h2">{row?.quantity}</Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                mb: 3,
                flexBasis: "calc(33.333% - 10.67px)",
                // gap: "50px",
              }}
            >
              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="requestsManagement.location" />
                </Typography>
                <Typography variant="h2">
                  {row?.customer?.location}
                </Typography>
              </Box>

              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="countries.countryName" />
                </Typography>
                <Typography variant="h2">
                  {row?.country?.name[locale]}
                </Typography>
              </Box>

               <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="requestsManagement.region" />
                </Typography>
                <Typography variant="h2">
                  {row?.region?.name[locale]}
                </Typography>
              </Box>

             
            </Box>

            <Box
              sx={{
                display: "flex",
                mb: 3,
              }}
            >

               <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="requestsManagement.city" />
                </Typography>
                <Typography variant="h2">{row?.city?.name[locale]}</Typography>
              </Box>

                <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="requestsManagement.areas" />
                </Typography>
                <Typography variant="h2">{row?.areas[0]?.name[locale]}</Typography>
              </Box>

              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="requestsManagement.pickUpDate" />
                </Typography>
                <Typography variant="h2">
                  {moment(row?.pickupDate).format("Do MMM YY")}
                </Typography>
              </Box>

             

            </Box>

            <Box
              sx={{
                display: "flex",
                mb: 3,
                flexBasis: "calc(33.333% - 10.67px)",
                // gap: "50px",
              }}
            >
              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="driver.driverName" />
                </Typography>
                <Typography variant="h2">{row?.driver?.name}</Typography>
              </Box>
              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="requestsManagement.storeKeeper" />
                </Typography>
                <Typography variant="h2">
                  {row?.storeKeeper?.name}
                </Typography>
              </Box>

              
            
               <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
              <Typography variant="h3" color="#646866">
                <FormattedMessage id="requestsManagement.customer" />
              </Typography>
              <Typography variant="h2">
                {row?.customer?.name}
              </Typography>
            </Box>
              {/* <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="driver.vehicle" />
                </Typography>
                <Typography variant="h2">{row?.vehicle?.name}</Typography>
              </Box> */}
            </Box>

            <Box sx={{
                display: "flex",
                mb: 3,
                flexBasis: "calc(33.333% - 10.67px)",
                // gap: "50px",
              }}>

                <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="requestsManagement.requestDate" />
                </Typography>
                <Typography variant="h2">
                  {moment(row?.createdAt).format("Do MMM YY")}
                </Typography>
              </Box>

              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
              <Typography variant="h3" color="#646866">
                <FormattedMessage id="requestsManagement.customerNotes" />
              </Typography>
              <Typography variant="h2">
                {row?.note ? row?.note : "___"}
              </Typography>
              </Box>

               <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="requestsManagement.pickUpTime" />
                </Typography>
                <Typography variant="h2">
                  {moment(row?.pickupDate).format("h:mm a")}
                </Typography>
              </Box>

            </Box>

            <Box sx={{
                display: "flex",
                mb: 3,
                flexBasis: "calc(33.333% - 10.67px)",
                // gap: "50px",
              }}>
            <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
              <Typography variant="h3" color="#646866">
                <FormattedMessage id="requestsManagement.driverNotes" />
              </Typography>
              <Typography variant="h2">
                {row?.driverNote ? row?.driverNote : "___"}
              </Typography>
            </Box>
             <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="stock.status" />
                </Typography>
                <Typography variant="h2">{row?.status}</Typography>
              </Box>
                
              {
                row?.rewardType.includes('PRODUCTS') &&  <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="requestsManagement.rewardProducts" />
                </Typography>
                <Typography variant="h2">{row?.rewardedProducts?.map(rp => rp?.product?.name[locale])}</Typography>
              </Box>
              }
            

           

            </Box>

             <Box sx={{
                display: "flex",
                mb: 3,
                flexBasis: "calc(33.333% - 10.67px)",
                // gap: "50px",
              }}>
                    
                    <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                      <Typography variant="h3" color="#646866">
                        <FormattedMessage id="requestsManagement.createdBy" />
                      </Typography>
                      <Typography variant="h2">{row?.createdBy?.name}</Typography>
                    </Box>

                    <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                        <Typography variant="h3" color="#646866">
                          <FormattedMessage id="stock.reason" />
                        </Typography>
                        <Typography variant="h2">{row?.notes}</Typography>
                      </Box>
                       <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                        <Typography variant="h3" color="#646866">
                          <FormattedMessage id="stock.quality" />
                        </Typography>
                        <Typography variant="h2">{row?.quality}%</Typography>
                      </Box>
              </Box>
          </Box>
        )}
      </Box>
    </>
  );
}
