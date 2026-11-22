import React, { useEffect } from "react";
import {
  Button,
  FormControl,
  Box,
  Typography,
  styled,
  MenuItem,
  ListItemIcon,
  Select,
  TextField,
  Divider,
  Grid,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";

import { usePostData } from "../../hooks/usePostData";
import { useFetchedData } from "../../hooks/useFetchedData";
import { useLanguage } from "../../hooks/useLanguage";
import { usePutData } from "../../hooks/usePutData";
import BasicModal from "./basicModal";

import PublicIcon from "@mui/icons-material/Public";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import UploadFlag from "../UploadFlag";
import { useState } from "react";
import { LoadingButton } from "@mui/lab";
import Required from "../required";

export default function Add_EditProduct({
  open,
  handleClose,
  handleOpen,
  getData,
  flag,
  page,
  row = {},
  countriesData = {},
}) {
  const languages = [
    { symbol: "ar", language: "العربية" },
    { symbol: "en", language: "English" },
    { symbol: "es", language: "Spanish" },
  ];

  const [imgLoading, setImgLoading] = useState();
  const { register, handleSubmit, reset, formState, setValue, watch } = useForm();

  const [resultAdd, loadingAdd, SetAddRequest] = usePostData(
    page === 'products' ? "product" : "reward-products",
    {},
    null,
    "error"
  );

  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    page === 'products' ? `product/${row?.row?.original?.id}` : `reward-products/${row?.row?.original?.id}`,
    {},
    null,
    "error"
  );

  const onSubmit = async (data) => {
    const body = {
      ...data,
      status: 1,
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
            <Typography variant="h3">
              <FormattedMessage id="rewardProducts.addProduct" />
            </Typography>
          ) : (
            <Typography variant="h3">
              <FormattedMessage id="rewardProducts.editProduct" />
            </Typography>
          )
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              border: 1,
              borderColor: "#D7D7D7",
              borderRadius: "7px",
              p: 2,
              mb: 2,
            }}
          >
            <Typography sx={{ color: "info.main", mb: 1 }} variant="h3">
              <FormattedMessage id="countries.addAllLanguages" />
            </Typography>
          {languages?.map((item, idx) => {
              return (
                <Box key={idx} sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    {/* Language field */}
                    <Grid item xs={6}>
                      <TextField
                        disabled
                        fullWidth
                        label={`Language ${idx + 1}`}
                        value={item?.language}
                        variant="outlined"
                      />
                    </Grid>

                    {/* Product Name */}
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Product Name"
                        {...register(`name.${languages[idx]?.symbol}`, {
                          required: true,
                        })}
                        defaultValue={
                          row?.row?.original?.name?.[languages[idx]?.symbol] || ""
                        }
                        error={
                          formState.errors.name?.[languages[idx]?.symbol]?.type ===
                          "required"
                        }
                        helperText={
                          formState.errors.name?.[languages[idx]?.symbol]?.type ===
                            "required" && (
                            <FormattedMessage id="error.requiredField" />
                          )
                        }
                      />
                    </Grid>
                  </Grid>
                  {/* QUANTITY */}
                  {/* <FormControl variant="standard"> <Typography sx={{ mb: "6px" }} variant="h3"> <FormattedMessage id="products.quantityQuestion" /> </Typography> <TextField {...register( quantityQuestion.${languages[idx]?.symbol}, { required: true, } )} defaultValue={ row?.row?.original?.quantityQuestion && Object.values(row?.row?.original?.quantityQuestion) && Object.values(row?.row?.original?.quantityQuestion)[ idx ] } error={ formState.errors.quantityQuestion?.[ languages[idx]?.symbol ]?.type === "required" } helperText={ formState.errors.quantityQuestion?.[ languages[idx]?.symbol ]?.type === "required" && ( <FormattedMessage id="error.requiredField" /> ) } /> </FormControl> */}
                </Box>
              );
            })}

          </Box>

          <Box
            sx={{
              p: 3,
              border: 1,
              borderColor: "#D7D7D7",
              borderRadius: "7px",
            }}
          >
            <FormControl variant="standard" sx={{ width: "100%", mb: 2 }}>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="regions.countryName" />
                <Required />
              </Typography>
              <Select
                {...register("country", {
                  required: true,
                })}
                defaultValue={row?.row?.original?.country?.id || ""}
                error={formState.errors.country?.type === "required"}
              >
                {Object.keys(countriesData).length !== 0 &&
                  countriesData?.data?.data?.map((country) => (
                    <MenuItem key={country.id} value={country.id}>
                      <ListItemIcon>{country.name?.en}</ListItemIcon>
                    </MenuItem>
                  ))}
              </Select>
              {formState.errors.country?.type === "required" && (
                <Typography sx={{ color: "error.main", fontSize: "12px" }}>
                  <FormattedMessage id="error.requiredField" />
                </Typography>
              )}
            </FormControl>

            <FormControl variant="standard" sx={{ width: "100%" }}>
              <Typography sx={{ mb: 1 }} variant="h3">
                <FormattedMessage id="products.points" />
              </Typography>
              <TextField
                {...register("points", {
                  required: true,
                })}
                defaultValue={row?.row?.original?.points}
                error={formState.errors.points?.type === "required"}
                helperText={
                  formState.errors.points?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl>

            {/* IMAGE FIELD */}

            {/* <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <FormattedMessage id="products.image" />
              <UploadFlag {...{ imgLoading, setImgLoading, setValue }} />
            </Box> */}
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
                <FormattedMessage id={page === 'products' ? "products.addProduct" : "rewardProducts.addProduct"} />
              </Typography>
            ) : (
              <Typography variant="h3">
                <FormattedMessage id={page === 'products' ? "products.editProduct" : "rewardProducts.editProduct"} />
              </Typography>
            )}
          </LoadingButton>
        </form>
      </BasicModal>
    </>
  );
}
