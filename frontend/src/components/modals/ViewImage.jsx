import React from "react";
import {
  Typography,
  FormControl,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";

import BasicModal from "./basicModal";
import { baseURL } from "../../constants/api";

export default function ViewImage({
  open,
  handleClose,
  row = {},
  title,
  subTitle,
  image,
}) {
  const intl = useIntl();
  return (
    <>
      <BasicModal
        open={open}
        handleClose={handleClose}
        title={<Typography variant="h2">{title}</Typography>}
      >
        <FormControl variant="standard" sx={{ width: "100%", mb: 2 }} fullWidth>
          <TextField disabled={true} value={subTitle} />
        </FormControl>
        { image ? (
          // <img
          //   src={baseURL + image}
          //   width={"100%"}
          //   height={250}
          //   style={{ objectFit: "cover" }}
          // />
          <img
            src={image}
            width={"100%"}
            height={250}
            style={{ objectFit: "cover" }}
          />
        ) : (
          // <CircularProgress />
          <Typography variant="h4"> No Image Available</Typography>
        )}
        <Button
          variant="contained"
          sx={{ width: "100%", mt: 2 }}
          onClick={handleClose}
        >
          <Typography variant="h3">
            <FormattedMessage id="driver.back" />
          </Typography>
        </Button>
      </BasicModal>
    </>
  );
}
