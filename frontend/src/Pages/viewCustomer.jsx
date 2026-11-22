import React, { useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
  Switch,
  Button,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { useFetchedData } from "../hooks/useFetchedData";
import ebcoLogo from "../assets/svgs/ebco.svg?react";
import EmailIcon from "@mui/icons-material/Email";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import moment from "moment";
import ViewImage from "../components/modals/ViewImage";
import { formatNumberWithCommas, getClaimPoints, getDonationPoints } from "../components/utils/Helper";

export default function ViewCustomerDetails() {
  const location = useLocation();
  const intl = useIntl();
  const customerId = location?.state?.customerId;
  const { locale } = useLanguage();
  const navigate = useNavigate();

  const [row, setRow] = useState();
  const [openViewImage, setOpenViewImage] = useState(false);

  const [fetchedCustomerData, loadingCustomerData, getCustomerData] =
    useFetchedData(`/customer/userInfo?removeLanguage=true&userId=${customerId}`,false);

  const [fetchedClaimRequest, loadingClaimRequestData, getClaimRequestData] =
    useFetchedData(`/claim-request?removeLanguage=true&customer=${customerId}&all=true`,false);

  useEffect(() => {
    customerId && getCustomerData();
    customerId && getClaimRequestData();
  }, [customerId]);

  useEffect(() => {
    setRow(fetchedCustomerData?.data?.user);
  }, [Object.keys(fetchedCustomerData).length]);


  let {donationAmount,claimAmount } =  getClaimPoints(fetchedClaimRequest?.data?.data)
  return (
    <>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex" }}>
          <Button onClick={() => navigate(-1)}>
            <ArrowBackIosIcon
              fontSize="24px"
              sx={{ mt: "4px", mx: 1, scale: locale == "ar" && "-1" }}
            />
          </Button>
          <Typography variant="h2">
            <FormattedMessage id="customer.customerDetails" />
          </Typography>
        </Box>
        {loadingCustomerData && <CircularProgress />}
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
                    <Box sx={{ display: "flex", flexDirection: "row" }}>
                      <Box sx={{ mx: 1 }}>
                        <Typography
                          variant="h2"
                          color="text.secondary"
                          // sx={{ mx: 1 }}
                        >
                          {fetchedCustomerData?.data?.user?.bussinessName}
                        </Typography>
                        <Typography
                          variant="h3"
                          color="text.secondary"
                          // sx={{ mx: 1 }}
                        >
                          {fetchedCustomerData?.data?.user?.name}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h4"
                        color="text.secondary"
                        sx={{ display: "flex", mx: 1 }}
                      >
                        <DescriptionIcon
                          sx={{ color: "#049A77", mx: 1, cursor: "pointer" }}
                          onClick={() => setOpenViewImage(true)}
                        />
                        <EmailIcon
                          sx={{ color: "#049A77", mx: 1, cursor: "pointer" }}
                        />
                        <EditIcon
                          sx={{ color: "#049A77", mx: 1, cursor: "pointer" }}
                          onClick={() => {
                            navigate("/editCustomer", {
                              state: { customerId: customerId },
                            });
                          }}
                        />
                      </Typography>
                    </Box>
                  }
                />
              </Card>
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "space-around", my: 3 }}
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
                      <FormattedMessage id="customer.points" />
                    </Typography>
                  }
                />
                <CardContent>
                  <Typography variant="h2" sx={{ color: "#049A77" }}>
                    {formatNumberWithCommas(
                      // fetchedCustomerData?.data?.statistics
                      //   ?.totalAvailableReward || 0
                        row?.points - row?.pendingPoints || 0
                    )}
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
                    {formatNumberWithCommas(
                      row?.wallet - row?.pendingWallet || 0
                    )}
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
                      <FormattedMessage id="customer.redeemAmount" />
                    </Typography>
                  }
                />
                <CardContent>
                  <Typography variant="h2" sx={{ color: "#049A77" }}>
                    {/* {formatNumberWithCommas(
                      fetchedCustomerData?.data?.statistics?.rewardHistory || 0
                    )} */}
                    {claimAmount || 0}
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
                      <FormattedMessage id="customer.donatatinAmount" />
                    </Typography>
                  }
                />
                <CardContent>
                  <Typography variant="h2" sx={{ color: "#049A77" }}>
                    {donationAmount || 0}
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
              <FormattedMessage id="customer.customerInfo" />
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 3,
                gap: 2,
              }}
            >
              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="driver.email" />
                </Typography>
                <Typography variant="h2">{row?.email}</Typography>
              </Box>

              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="sideNavbar.businessCategories" />
                </Typography>
                <Typography variant="h2">
                  {row?.category?.name[locale]}
                </Typography>
              </Box>

              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="driver.licenseNumber" />
                </Typography>
                <Typography variant="h2">{row.licenceNumber}</Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="warehouse.joiningDate" />
                </Typography>
                <Typography variant="h2">
                  {moment(row?.createdAt).format("YYYY-MM-DD")}
                </Typography>
              </Box>
              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="driver.mobileNumber" />
                </Typography>
                <Typography variant="h2">{row?.phone}</Typography>
              </Box>

              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="driver.landLineNumber" />
                </Typography>
                <Typography variant="h2">{row?.landlineNumber}</Typography>
              </Box>
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
              <FormattedMessage id="customer.addressInfo" />
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="customer.countryName" />
                </Typography>
                <Typography variant="h2">
                  {row?.country?.name[locale]}
                </Typography>
              </Box>

              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="customer.city" />
                </Typography>
                <Typography variant="h2">
                  {row?.city[0]?.name[locale]}
                </Typography>
              </Box>

              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="customer.region" />
                </Typography>
                <Typography variant="h2">
                  {row?.region[0]?.name[locale]}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 3,
                gap: 2,
              }}
            >
              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="customer.areaName" />
                </Typography>
                <Typography variant="h2">{row?.areas[0]?.name[locale]}</Typography>
              </Box>

              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="customer.addressInfo" />
                </Typography>
                <Typography variant="h2">{row.location}</Typography>
              </Box>

              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="customer.notes" />
                </Typography>
                <Typography variant="h2">{row.notes}</Typography>
              </Box>
            </Box>
            <Typography
              variant="h3"
              color="#049A77"
              sx={{
                backgroundColor: "#F2F3F2",
                px: "4px",
                py: 1,
                mb: "4px",
                borderRadius: 1,
              }}
            >
              <FormattedMessage id="customer.bankingInfo" />
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 3,
                gap: 2,
              }}
            >
              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="customer.bankName" />
                </Typography>
                <Typography variant="h2">{row.bankName}</Typography>
              </Box>

              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="customer.iban" />
                </Typography>
                <Typography variant="h2">{row.iban}</Typography>
              </Box>

              <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="customer.accountHolderName" />
                </Typography>
                <Typography variant="h2">{row.accountHolderName}</Typography>
              </Box>
            </Box>

              {/* Preview Image */}
                <Typography variant="h3" color="#646866">
                  <FormattedMessage id="customer.license" />
                </Typography>
          {row.licenceImage ? (
            <img
              src={row.licenceImage}
              alt="License_Image"
              style={{ 
                marginTop: "8px",
                width: "120px",
                height: "120px",
                objectFit: "cover",
                cursor: "pointer",
                borderRadius: "8px",
                border: "1px solid #ccc"
              }}
               onClick={() => setOpenViewImage(true)}
            />
          ): "No License Image"}
          </Box>
        )}
      </Box>


      {/* {previewImage && (
          <div
            onClick={handleClosePreview}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              cursor: "zoom-out",
            }}
          >
            <img
              src={previewImage}
              alt="Preview"
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                borderRadius: "10px",
              }}
            />
          </div>
        )} */}

      <ViewImage
        open={openViewImage}
        title={intl.formatMessage({
          id: "driver.license",
        })}
        subTitle={
          intl.formatMessage({
            id: "stock.customerName",
          }) +
          " : " +
          row?.name
        }
        handleClose={() => setOpenViewImage(false)}
        row={row}
        image={row?.licenceImage}
      />
    </>
  );
}
