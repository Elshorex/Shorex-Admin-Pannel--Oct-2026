import React from "react";
import { Typography, Button, Box } from "@mui/material";

import BasicModal from "./basicModal";
import { FormattedMessage } from "react-intl";

export default function WarningMessage({
  open,
  handleClose,
  message,
  buttonName,
  buttonFunction,
}) {
  const buttonAction = () => {
    buttonFunction();
    handleClose();
  };

  return (
    <>
      <BasicModal
        open={open}
        handleClose={handleClose}
        title={<Typography variant="h2"></Typography>}
      >
        <Typography variant="h2">{message}</Typography>
        <Box sx={{ display: "flex", flex: "col" }}>
          <Button
            sx={{ m: 2, px: 2, width: "50%" }}
            variant="outlined"
            onClick={handleClose}
          >
            <Typography variant="h3">
              <FormattedMessage id="warehouse.cancel" />
            </Typography>
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ my: 2, px: 2, width: "50%" }}
            onClick={buttonAction}
          >
            <Typography variant="h3">{buttonName}</Typography>
          </Button>
        </Box>
      </BasicModal>
    </>
  );
}
