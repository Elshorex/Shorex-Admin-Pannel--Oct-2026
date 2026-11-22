import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  Box,
  Typography,
  MenuItem,
  Select,
  TextField,
  ListItemIcon,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { LoadingButton } from "@mui/lab";

import BasicModal from "./basicModal";
import Required from "../required";
import { removeEmptyParameters } from "../utils/Helper";
import { useLanguage } from "../../hooks/useLanguage";
import { useFetchedData } from "../../hooks/useFetchedData";
import { usePostData } from "../../hooks/usePostData";
import { usePutData } from "../../hooks/usePutData";

import PublicIcon from "@mui/icons-material/Public";

export default function AddNewArea({
  open,
  handleClose,
  getData,
  flag,
  row = {},
}) {
  const [countryId, setCountryId] = useState(null);
  const [regionId, setRegionId] = useState(null);
  const [cityId, setCityId] = useState(null);

  const { locale } = useLanguage();

  const languages = [
    { symbol: "ar", language: "العربية" },
    { symbol: "en", language: "English" },
    { symbol: "es", language: "Spanish" },
  ];

  const { register, handleSubmit, formState, reset } = useForm({
    mode: "onChange",
  });

  // 🌍 Fetch Countries
  const [fetchedCountry, loadingCountry, getDataCountry] = useFetchedData(
    "/country?removeLanguage=true"
  );

  // 🏛 Fetch States (Regions) by country
  const [fetchedState, loadingState, getDataState] = useFetchedData(
    `/region?country=${countryId ?? ""}&removeLanguage=true`
  );

  // 🏙 Fetch Cities by state
  const [fetchedCity, loadingCity, getDataCity] = useFetchedData(
    `/city?region=${regionId ?? ""}&removeLanguage=true`
  );

  const [resultAdd, loadingAdd, SetAddRequest] = usePostData(
    "area",
    {},
    null,
    "error"
  );

  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `area/${row?.row?.original?.id}`,
    {},
    null,
    "error"
  );

  const onSubmit = async (data) => {
    data = removeEmptyParameters(data);
    const body = {
      ...data,
      country: countryId,
      region: regionId,
      city: cityId,
      status: 1,
    };
    flag === "add" ? await SetAddRequest(body) : await SetEditRequest(body);
  };

  const onClose = () => {
    reset();
    handleClose();
  };

  // ✅ Refresh data on success
  useEffect(() => {
    if (resultAdd?.id || resultEdit?.id) {
      getData();
      handleClose();
      reset();
    }
  }, [resultAdd, resultEdit]);

  // ✅ Reset on edit mode
  useEffect(() => {
    reset();
  }, [row?.row?.id, row?.row?.original?.updatedAt]);

  // 🔁 Re-fetch states when country changes
  useEffect(() => {
    if (countryId) getDataState();
  }, [countryId]);

  // 🔁 Re-fetch cities when state changes
  useEffect(() => {
    if (regionId) getDataCity();
  }, [regionId]);

  return (
    <BasicModal
      open={open}
      handleClose={onClose}
      title={
        flag === "add" ? (
          <Typography variant="h3">
            <FormattedMessage id="areas.addNewArea" />
          </Typography>
        ) : (
          <Typography variant="h3">
            <FormattedMessage id="areas.editArea" />
          </Typography>
        )
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 🌍 Multilingual Area Names */}
        <Box
          sx={{
            border: 1,
            borderColor: "#D7D7D7",
            borderRadius: "7px",
            display: "flex",
            flexDirection: "column",
            p: 2,
          }}
        >
          <Typography sx={{ color: "info.main" }} variant="h3">
            <FormattedMessage id="areas.addAllLanguages" />
          </Typography>
          {languages?.map((item, idx) => (
            <Box
              key={item.symbol}
              sx={{ display: "flex", gap: "16px", mt: 2 }}
            >
              <FormControl variant="standard" sx={{ Width: "90%" }}>
                <Typography sx={{ mb: 1 }} variant="label">
                  <FormattedMessage id="areas.language" /> {idx + 1}
                </Typography>
                <TextField disabled defaultValue={item?.language} />
              </FormControl>
              <FormControl variant="standard">
                <Typography sx={{ mb: "6px", display: "flex" }} variant="h3">
                  <FormattedMessage id="areas.areaName" />
                  <Required />
                </Typography>
                <TextField
                  {...register(`name.${item.symbol}`, { required: true })}
                  defaultValue={
                    row?.row?.original?.name &&
                    row?.row?.original?.name[item.symbol]
                  }
                  error={
                    formState.errors.name?.[item.symbol]?.type === "required"
                  }
                  helperText={
                    formState.errors.name?.[item.symbol]?.type === "required" && (
                      <FormattedMessage id="error.requiredField" />
                    )
                  }
                />
              </FormControl>
            </Box>
          ))}
        </Box>

        {/* 🌍 Country / State / City Dropdowns */}
        <Box sx={{ mt: 3, p: 2, border: 1, borderColor: "#D7D7D7", borderRadius: "7px" }}>
          {/* Country */}
          <FormControl fullWidth sx={{ my: 1 }}>
            <Typography variant="h3" sx={{ mb: 1, display: "flex" }}>
              <FormattedMessage id="regions.countryName" />
              <Required />
            </Typography>
            <Select
              {...register("country", { required: true })}
              defaultValue={row?.row?.original?.country?.id ?? ""}
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                setCountryId(selectedId);
                setRegionId(null);
                setCityId(null);
              }}
            >
              {fetchedCountry?.data?.data?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name[locale]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* State */}
          <FormControl fullWidth sx={{ my: 1 }}>
            <Typography variant="h3" sx={{ mb: 1, display: "flex" }}>
              <FormattedMessage id="regions.stateName" />
              <Required />
            </Typography>
            <Select
              {...register("region", { required: true })}
              defaultValue={row?.row?.original?.region?.id ?? ""}
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                setRegionId(selectedId);
                setCityId(null);
              }}
            >
              {fetchedState?.data?.data?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name[locale]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* City */}
          <FormControl fullWidth sx={{ my: 1 }}>
            <Typography variant="h3" sx={{ mb: 1, display: "flex" }}>
              <FormattedMessage id="cities.cityName" />
              <Required />
            </Typography>
            <Select
              {...register("city", { required: true })}
              defaultValue={row?.row?.original?.city?.id ?? ""}
              onChange={(e) => setCityId(Number(e.target.value))}
            >
              {fetchedCity?.data?.data?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name[locale]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Submit */}
        <LoadingButton
          loading={loadingAdd || loadingEdit}
          sx={{ my: 3, width: "100%", p: 1 }}
          variant="contained"
          type="submit"
          startIcon={<PublicIcon sx={{ mx: "4px" }} />}
        >
          {flag === "add" ? (
            <Typography variant="h3">
              <FormattedMessage id="areas.addNewArea" />
            </Typography>
          ) : (
            <Typography variant="h3">
              <FormattedMessage id="areas.editArea" />
            </Typography>
          )}
        </LoadingButton>
      </form>
    </BasicModal>
  );
}
