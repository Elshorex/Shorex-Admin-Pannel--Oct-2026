import React, { useEffect } from "react";
import {
  FormControl,
  Box,
  Typography,
  MenuItem,
  ListItemIcon,
  Select,
  TextField,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";

import { usePostData } from "../../hooks/usePostData";
import { useLanguage } from "../../hooks/useLanguage";
import { usePutData } from "../../hooks/usePutData";
import BasicModal from "./basicModal";

import PublicIcon from "@mui/icons-material/Public";
import { useState } from "react";
import { LoadingButton } from "@mui/lab";
import { holidaysTypes } from "../utils/Constant";
import ResponsiveDateRangePickers from "../DatePicker/DatePicker";
import Required from "../required";

export default function AddEditHoliday({
  open,
  handleClose,
  handleOpen,
  getData,
  flag,
  row = {},
  countriesData = {},
}) {
  const { locale } = useLanguage();

  const [imgLoading, setImgLoading] = useState();
  const [selectedCountry, setSelectedCountry] = useState(null);

  const { register, handleSubmit, reset, formState, setValue, watch } =
    useForm();

  const [resultAdd, loadingAdd, SetAddRequest] = usePostData(
    "holiday",
    {},
    null,
    "error"
  );

  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `holiday/${row?.row?.original?.id}`,
    {},
    null,
    "error"
  );

  const onSubmit = async (data) => {
    const body = {
      ...data,
    };
    flag === "add" ? await SetAddRequest(body) : await SetEditRequest(body);
  };

  const onClose = () => {
    reset();
    handleClose();
  };

  useEffect(() => {
    if (resultAdd?.id || resultEdit?.id) {
      getData();
      handleClose();
      reset();
    }
  }, [resultAdd, resultEdit]);

  useEffect(() => {
    reset();
  }, [row?.row?.id, row?.row?.original?.updatedAt]);

  return (
    <>
      <BasicModal
        open={open}
        handleClose={onClose}
        title={
          flag === "add" ? (
            <FormattedMessage id="holidays.addHoliday" />
          ) : (
            <FormattedMessage id="holidays.editHoliday" />
          )
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <FormControl
              sx={{
                margin: "0px 5px",
                borderColor: "#B0D9C3",
              }}
              fullWidth
            >
              <Typography sx={{ mb: 1 }} variant="h3">
                <FormattedMessage id="rewards.country" />
              </Typography>
              <Select
                sx={{
                  color: "#049A77",
                  backgroundColor: "#ffffff",
                  p: 2,
                  border: "1px solid #B0D9C3",
                }}
                {...register("country")}
                defaultValue={row?.row?.original?.country.id}
              >
                {Object.keys(countriesData)?.length !== 0 &&
                  countriesData?.data?.data?.map((item) => (
                    <MenuItem value={item.id} key={item.id}>
                      <ListItemIcon
                        sx={{
                          color: "#049A77",
                          marginTop: "5px",
                        }}
                        key={item.id}
                      >
                        {item.name[locale]}
                      </ListItemIcon>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 3,
              }}
            >
              <FormControl
                sx={{
                  minWidth: 200,
                  height: 45,
                  margin: "0px 5px",
                  borderColor: "#B0D9C3",
                }}
              >
                <Typography sx={{ mb: 1 }} variant="h3">
                  <FormattedMessage id="holidays.type" />
                </Typography>
                <Select
                  sx={{
                    color: "#049A77",
                    backgroundColor: "#ffffff",
                    p: 2,
                    border: "0.1px solid #B0D9C3",
                  }}
                  {...register("type")}
                  defaultValue={
                    row?.row?.original ? row?.row?.original?.type : "PUBLIC"
                  }
                >
                  {holidaysTypes.map((item) => (
                    <MenuItem value={item.symbol}>
                      <ListItemIcon
                        sx={{
                          color: "#049A77",
                          marginTop: "5px",
                        }}
                        key={item.id}
                      >
                        {item.name}
                      </ListItemIcon>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="standard" sx={{ width: "100%" }}>
                <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                  <FormattedMessage id="holidays.holidayName" />
                  <Required />
                </Typography>
                <TextField
                  {...register("holidayName", {
                    required: true,
                  })}
                  defaultValue={row?.row?.original?.holidayName}
                  error={formState.errors?.holidayName?.type === "required"}
                  helperText={
                    formState.errors?.holidayName?.type === "required" && (
                      <FormattedMessage id="error.requiredField" />
                    )
                  }
                />
              </FormControl>
            </Box>

            <Box sx={{ mt: 3, display: "flex", width: "100%" , gap:2 }}>
              <FormControl variant="standard" fullWidth>
                <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                  <FormattedMessage id="holidays.holidayDate" />
                  <Required />
                </Typography>
                <ResponsiveDateRangePickers setValue={setValue} row={row} position="right-right" />
              </FormControl>

              <FormControl variant="standard" fullWidth>
                <Typography sx={{ mb: 1 }} variant="h3">
                  <FormattedMessage id="holidays.duration" />
                </Typography>
                <TextField
                  {...register("duration")}
                  disabled
                  value={
                    watch("ranges") && !isNaN(watch("ranges")[0]?.duration)
                      ? watch("ranges")[0]?.duration
                      : row?.row?.original?.duration
                      ? row?.row?.original?.duration
                      : ""
                  }
                />
              </FormControl>
            </Box>
          </Box>

          <LoadingButton
            loading={loadingEdit || loadingAdd}
            disabled={imgLoading}
            sx={{ m: 3, width: "90%", p: 1 }}
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }} />}
            onClick={handleOpen}
            type="submit"
          >
            {flag === "add" ? (
              <Typography variant="h3">
                <FormattedMessage id="holidays.addHoliday" />
              </Typography>
            ) : (
              <Typography variant="h3">
                <FormattedMessage id="holidays.editHoliday" />
              </Typography>
            )}
          </LoadingButton>
        </form>
      </BasicModal>
    </>
  );
}
