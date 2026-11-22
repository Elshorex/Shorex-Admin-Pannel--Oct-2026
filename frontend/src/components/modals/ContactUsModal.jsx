import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  TextField,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";

import BasicModal from "./basicModal";
import Required from "../required";
import { removeEmptyParameters } from "../utils/Helper";
import { usePostData } from "../../hooks/usePostData";
import { usePutData } from "../../hooks/usePutData";

import PublicIcon from "@mui/icons-material/Public";
import { useFetchedData } from "../../hooks/useFetchedData";
import { useLanguage } from "../../hooks/useLanguage";

export default function ContactUsModal({
  open,
  handleClose,
  getData,
  row = {},
  isEdit,
  countries = [],
}) {
  const { register, handleSubmit, formState, reset, setValue, watch } = useForm({
    mode: "onChange",
  });

    const [countryId, setCountryId] = useState(row?.country?.id || null);
    const { locale } = useLanguage();
    const [fetchedCountry, loadingCountry, getDataCountry] = useFetchedData(
    "/country?removeLanguage=true"
    );

  const [resultAdd, loadingAdd, SetAddRequest] = usePostData(
    "contact-us",
    {},
    null,
    "error"
  );
console.log(row,'row')
console.log(row?.id,'rID')
  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `contact-us/${row?.id}`,
    {},
    null,
    "error"
  );

  const onSubmit = async (data) => {
    data = removeEmptyParameters(data);
    if (isEdit) {
      await SetEditRequest(data);
    } else {
      await SetAddRequest(data);
    }
  };

  const onClose = () => {
    reset();
    handleClose();
  };

  useEffect(() => {
    if (resultAdd?.id || resultEdit?.id) {
      getData && getData();
      handleClose();
      reset();
    }
  }, [resultAdd, resultEdit]);

  useEffect(() => {
    if (isEdit && row) {
        console.log(row,'row')
      reset({
        email: row.email ?? "",
        phoneNumber: row.phoneNumber ?? "",
        whatsapp: row.whatsapp ?? "",
        telegram: row.telegram ?? "",
        country: row.country?.id ?? ""
      });
    } else {
      reset();
    }
  }, [row?.id, row?.updatedAt]);

  useEffect(() => {
  getDataCountry();
}, []);

  const selectedCountry = watch("country");

  return (
    <BasicModal
      open={open}
      handleClose={onClose}
      title={
        <Typography variant="h3">
          {isEdit ? <FormattedMessage id="contactUs.editContact" /> : <FormattedMessage id="contactUs.addNew" />}
        </Typography>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            border: 1,
            borderColor: "#D7D7D7",
            borderRadius: "7px",
            p: 2,
          }}
        >
          <Grid container spacing={2}>
            {/* Email */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Typography variant="h3" sx={{ mb: 1, display: "flex" }}>
                  <FormattedMessage id="driver.email" /> <Required />
                </Typography>
                <TextField
                  {...register("email", {
                    required: true,
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email format",
                    },
                  })}
                  error={!!formState.errors.email}
                  helperText={
                    formState.errors.email?.type === "required" ? (
                      <FormattedMessage id="error.requiredField" />
                    ) : formState.errors.email?.message
                  }
                  fullWidth
                />
              </FormControl>
            </Grid>

            {/* Phone Number */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Typography variant="h3" sx={{ mb: 1, display: "flex" }}>
                  <FormattedMessage id="driver.mobileNumber" /> <Required />
                </Typography>
                <TextField
                  {...register("phoneNumber", {
                    required: true,
                    pattern: {
                      value: /^[0-9]{7,15}$/,
                      message: "Invalid phone number",
                    },
                  })}
                  error={!!formState.errors.phoneNumber}
                  helperText={
                    formState.errors.phoneNumber?.type === "required"
                      ? <FormattedMessage id="error.requiredField" />
                      : formState.errors.phoneNumber?.message
                  }
                  fullWidth
                />
              </FormControl>
            </Grid>

            {/* WhatsApp */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Typography variant="h3" sx={{ mb: 1 }}>
                  <FormattedMessage id="contactUs.whatsapp" />
                </Typography>
                <TextField
                  {...register("whatsapp", {
                    pattern: {
                      value: /^[0-9]{7,15}$/,
                      message: "Invalid WhatsApp number",
                    },
                  })}
                  error={!!formState.errors.whatsapp}
                  helperText={formState.errors.whatsapp?.message}
                  fullWidth
                />
              </FormControl>
            </Grid>

            {/* Telegram */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <Typography variant="h3" sx={{ mb: 1 }}>
                  <FormattedMessage id="contactUs.telegram" />
                </Typography>
                <TextField
                  {...register("telegram", {
                    pattern: {
                      value: /^[a-zA-Z0-9_]{5,32}$/,
                      message: "Invalid Telegram number",
                    },
                  })}
                  error={!!formState.errors.telegram}
                  helperText={formState.errors.telegram?.message}
                  fullWidth
                />
              </FormControl>
            </Grid>

            {/* Country */}
            <Grid item xs={12} sm={6}>
             <FormControl fullWidth error={!!formState.errors.country}>
                <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="regions.countryName" /> <Required />
                </Typography>
            <Select
                {...register("country", { required: true })}
                value={selectedCountry || ""}
                onChange={(e) => setValue("country", Number(e.target.value))}
                sx={{
                    color: "#049A77",
                    backgroundColor: "#ffffff",
                    p: 2,
                    border: "0.1px solid #B0D9C3",
                }}
                >
                {fetchedCountry?.data?.data?.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                    {item.name[locale]}
                    </MenuItem>
                ))}
                </Select>
                {formState.errors.country && (
                <FormHelperText>
                    <FormattedMessage id="error.requiredField" />
                </FormHelperText>
                )}
            </FormControl>
            </Grid>
          </Grid>
        </Box>

        <LoadingButton
          loading={loadingAdd || loadingEdit}
          sx={{ my: 3, width: "100%", p: 1 }}
          variant="contained"
          type="submit"
          startIcon={<PublicIcon sx={{ mx: "4px" }} />}
        >
          <Typography variant="h3">
            {isEdit ? <FormattedMessage id="contactUs.editContact" /> : <FormattedMessage id="contactUs.addNew" />}
          </Typography>
        </LoadingButton>
      </form>
    </BasicModal>
  );
}
