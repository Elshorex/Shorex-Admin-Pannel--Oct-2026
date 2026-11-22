import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  Box,
  Typography,
  TextField,
  MenuItem,
  ListItemIcon,
  Select,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useForm } from "react-hook-form";

import { usePostData } from "../../hooks/usePostData";
import { useFetchedData } from "../../hooks/useFetchedData";
import { useLanguage } from "../../hooks/useLanguage";
import { usePutData } from "../../hooks/usePutData";
import BasicModal from "./basicModal";

import PublicIcon from "@mui/icons-material/Public";

export default function RewardsModal({
  open,
  handleClose,
  handleOpen,
  getData,
  flag,
  row = {},
}) {
  const [countriesData, setCountriesData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  const { locale } = useLanguage();
  const intl = useIntl();
  const { register, handleSubmit, reset, formState, watch, setValue } = useForm(
    { mode: "onChange" }
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `/country?removeLanguage=true&all=true`
  );

  useEffect(() => {
    if (allData && allData.data?.data.length !== 0) {
      setCountriesData(allData?.data?.data);
    }
  }, [allData, locale]);

  const [resultAdd, loadingAdd, SetAddRequest] = usePostData(
    "reward-point",
    {},
    null,
    "error"
  );

  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `reward-point/${row?.row?.original?.id}`,
    {},
    null,
    "error"
  );

  useEffect(() => {
    if (selectedCountry) {
      const obj = countriesData.find((item) => item.id === selectedCountry);
      console.log(obj,'obj')
      setSelectedCurrency(obj?.currency?.name[locale]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (row?.row?.original?.country.id) {
      setSelectedCountry(row?.row?.original?.country.id);
      setValue("country", row?.row?.original?.country.id);
    }
  }, [row?.row?.original?.id]);

  const onSubmit = async (data) => {
    const body =
      data.country !== ""
        ? { ...data }
        : { point: data.point, amount: data.amount };

    flag === "add" ? await SetAddRequest(body) : await SetEditRequest(body);
  };

  const onCancel = () => {
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

  useEffect(() => {
    if (flag === "add") row = {};
  }, [flag]);

  return (
    <>
      <BasicModal
        open={open}
        handleClose={onCancel}
        title={
          flag === "add" ? (
            <Typography variant="h3">
              <FormattedMessage id="rewards.addReward" />
            </Typography>
          ) : (
            <Typography variant="h3">
              <FormattedMessage id="rewards.editReward" />
            </Typography>
          )
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
              }}
            >
              <FormControl
                sx={{
                  height: 45,
                  margin: "0px 5px",
                  borderColor: "#B0D9C3",
                  "& .css-1148jc4-MuiInputBase-root-MuiOutlinedInput-root-MuiSelect-root":
                    {
                      width: "100%",
                    },
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
                    border: "0.1px solid #B0D9C3",
                  }}
                {...register("country", { required: true })}
                defaultValue={row?.row?.original?.country?.id}
                onChange={(e) => {
                const selectedId = Number(e.target.value);
                setSelectedCountry(selectedId);
              }}
                >
                  {countriesData?.length !== 0 &&
                    countriesData?.map((item) => (
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
                {/* {formState.errors.currency?.type === "required" && (
                  <FormHelperText sx={{ color: "error.main" }}>
                                    <FormattedMessage id="error.requiredField" />

                  </FormHelperText>
                )} */}
              </FormControl>

              <FormControl
                sx={{
                  // minWidth: 140,
                  height: 45,
                  margin: "0px 5px",
                  borderColor: "#B0D9C3",
                }}
                fullWidth
              >
                <Typography sx={{ mb: 1 }} variant="h3">
                  <FormattedMessage id="rewards.Currency" />
                </Typography>
                <TextField
                  name="currency"
                  placeholder={intl.formatMessage({ id: "rewards.Currency" })}
                  type="text"
                  id="currency"
                  value={selectedCurrency}
                  disabled
                />
              </FormControl>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: "16px",
                mt: 5,
              }}
            >
              <FormControl variant="standard">
                <Typography sx={{ mb: 1, mx: 1 }} variant="h3">
                  <FormattedMessage id="rewards.points" />
                </Typography>
                <TextField
                  name="rewards"
                  type="text"
                  id="point"
                  {...register("point", {
                    required: {
                      value: true,
                      message: <FormattedMessage id="error.requiredField" />,
                    },
                    pattern: {
                      value: /^[0-9]+$/,
                      message: <FormattedMessage id="error.requiredNumbers" />,
                    },
                  })}
                  defaultValue={row?.row?.original?.point}
                  error={!!formState.errors.point}
                  helperText={formState.errors.point?.message}
                />
              </FormControl>
              <FormControl variant="standard">
                <Typography sx={{ mb: 1 }} variant="h3">
                  <FormattedMessage id="rewards.amount" />
                </Typography>
                <TextField
                  {...register("amount", {
                    required: {
                      value: true,
                      message: <FormattedMessage id="error.requiredField" />,
                    },
                    pattern: {
                      value: /^[0-9]+$/,
                      message: <FormattedMessage id="error.requiredNumbers" />,
                    },
                  })}
                  defaultValue={row?.row?.original?.amount}
                  error={!!formState.errors.amount}
                  helperText={formState.errors.amount?.message}
                />
              </FormControl>
            </Box>
          </Box>

          <Button
            sx={{ m: 3, width: "90%", p: 1 }}
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }} />}
            onClick={handleOpen}
            type="submit"
          >
            {flag === "add" ? (
              <Typography variant="h3">
                <FormattedMessage id="rewards.addReward" />
              </Typography>
            ) : (
              <Typography variant="h3">
                <FormattedMessage id="rewards.editReward" />
              </Typography>
            )}
          </Button>
        </form>
      </BasicModal>
    </>
  );
}
