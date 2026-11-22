import React, { useEffect , useState} from "react";
import { FormControl, Box, Typography, TextField, Button } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";

import { usePutData } from "../../hooks/usePutData";
import { contactUsItem } from "../../constants/constant";
import Required from "../required";
import BasicModal from "./basicModal";

import PublicIcon from "@mui/icons-material/Public";

export default function EditContactUs({
  open,
  handleClose,
  handleOpen,
  getData,
  row,
}) {
  const [imgLoading, setImgLoading] = useState();

  const { register, handleSubmit, reset, formState, setValue, watch } =
    useForm();

  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `/contact-us/${contactUsItem}`,
    {},
    null,
    "error"
  );

  const onSubmit = async (data) => {
    await SetEditRequest(data);
  };

  const onClose = () => {
    reset();
    handleClose();
  };

  useEffect(() => {
    if (resultEdit?.id) {
      getData();
      handleClose();
      reset();
    }
  }, [resultEdit]);

  useEffect(() => {
    reset();
  }, [ row?.updatedAt]);

  return (
    <>
      <BasicModal
        open={open}
        handleClose={onClose}
        title={<FormattedMessage id="contactUs.contactUs" />}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <FormControl variant="standard" sx={{ width: "100%", mb: 3 }}>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="driver.email" />
                <Required />
              </Typography>
              <TextField
                {...register("email", {
                  required: true,
                })}
                defaultValue={row?.email}
                error={formState.errors?.email?.type === "required"}
                helperText={
                  formState.errors?.email?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl>

            <FormControl variant="standard" sx={{ width: "100%", mb: 3 }}>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="contactUs.fax" />
              </Typography>
              <TextField {...register("fax")} defaultValue={row?.fax} />
            </FormControl>

            <FormControl variant="standard" sx={{ width: "100%", mb: 3 }}>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="driver.mobileNumber" />
                <Required />
              </Typography>
              <TextField
                {...register("phoneNumber", {
                  required: true,
                })}
                defaultValue={row?.phoneNumber}
                error={formState.errors?.phoneNumber?.type === "required"}
                helperText={
                  formState.errors?.phoneNumber?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl>

            <FormControl variant="standard" sx={{ width: "100%", mb: 3 }}>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="driver.landLineNumber" />
              </Typography>
              <TextField
                {...register("landlineNumber")}
                defaultValue={row?.landlineNumber}
              />
            </FormControl>
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
              disabled={imgLoading}
              sx={{ mx: 1, width: "100%", p: 1 }}
              variant="contained"
              startIcon={<PublicIcon sx={{ mx: "4px" }} />}
              onClick={handleOpen}
              type="submit"
            >
              <Typography variant="h3">
                <FormattedMessage id="warehouse.edit" />
              </Typography>
            </LoadingButton>
          </Box>
        </form>
      </BasicModal>
    </>
  );
}
