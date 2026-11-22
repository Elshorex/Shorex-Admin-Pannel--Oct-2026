import React, { useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { LoadingButton } from "@mui/lab";

import { usePutData } from "../../hooks/usePutData";

import PublicIcon from "@mui/icons-material/Public";
import BasicModal from "./basicModal";

export default function ApproveClaim({ open, handleClose, getData, row }) {
  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `/claim-request/accept/${row?.row?.original?.id}`,
    {},
    null,
    "error"
  );

  const onApprove = async () => {
    SetEditRequest("approve");
  };

  const onClose = () => {
    handleClose();
  };

  useEffect(() => {
    if (resultEdit?.id) {
      getData();
      handleClose();
    }
  }, [resultEdit]);

  return (
    <>
      <BasicModal
        open={open}
        handleClose={onClose}
        title={<FormattedMessage id="rewardsManagement.approveClaim" />}
      >
        <Box
          sx={{
            display: "flex",
            width: "550px",
            justifyContent: "space-between",
            mb: 3,
            gap: 2,
          }}
        >
          <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
            <Typography variant="h3" color="#646866">
              <FormattedMessage id="rewardsManagement.customerId" />
            </Typography>
            <Typography variant="h2">
              {row?.row?.original?.customer?.id}
            </Typography>
          </Box>

          <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
            <Typography variant="h3" color="#646866">
              <FormattedMessage id="stock.businessName" />
            </Typography>
            <Typography variant="h2">
              {row?.row?.original?.businessName}
            </Typography>
          </Box>

          <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
            <Typography variant="h3" color="#646866">
              <FormattedMessage id="customer.customerName" />
            </Typography>
            <Typography variant="h2">
              {row.row?.original?.customer?.name}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            width: "550px",
            justifyContent: "space-between",
            mb: 3,
            gap: 2,
          }}
        >
          <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
            <Typography variant="h3" color="#646866">
              <FormattedMessage id="driver.licenseNumber" />
            </Typography>
            <Typography variant="h2">
              {row.row?.original?.customer?.licenceNumber}
            </Typography>
          </Box>
          <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
            <Typography variant="h3" color="#646866">
              <FormattedMessage id="customer.bankName" />
            </Typography>
            <Typography variant="h2">
              {row?.row?.original?.customer?.bankName}
            </Typography>
          </Box>

          <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
            <Typography variant="h3" color="#646866">
              <FormattedMessage id="customer.iban" />
            </Typography>
            <Typography variant="h2">{row?.row?.original?.iban}</Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            width: "550px",
            justifyContent: "space-between",
            mb: 3,
            gap: 2,
          }}
        >
          <Box sx={{ flexBasis: "calc(33.333% - 10.67px)" }}>
            <Typography variant="h3" color="#646866">
              <FormattedMessage id="customer.accountHolderName" />
            </Typography>
            <Typography variant="h2">
              {row?.row?.original?.customer?.accountHolderName}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flex: "col" }}>
          <Button
            sx={{ mx: 1, width: "100%", p: 1 }}
            variant="outlined"
            onClick={handleClose}
          >
            <Typography variant="h3">
              <FormattedMessage id="warehouse.cancel" />
            </Typography>
          </Button>
          <LoadingButton
            loading={loadingEdit}
            sx={{ mx: 1, width: "100%", p: 1 }}
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }} />}
            onClick={onApprove}
          >
            <Typography variant="h3">
              <FormattedMessage id="rewardsManagement.approve" />
            </Typography>
          </LoadingButton>
        </Box>
      </BasicModal>
    </>
  );
}
