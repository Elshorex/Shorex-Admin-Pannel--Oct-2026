import React, { useEffect, useState } from "react";
import {
  FormControl,
  Box,
  Typography,
  styled,
  MenuItem,
  ListItemIcon,
  Select,
  TextField,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";

import { usePostData } from "../../hooks/usePostData";
import { useFetchedData } from "../../hooks/useFetchedData";
import { useLanguage } from "../../hooks/useLanguage";
import { usePutData } from "../../hooks/usePutData";
import BasicModal from "./basicModal";
import UploadFlag from "../UploadFlag";
import Required from "../required";

import { LoadingButton } from "@mui/lab";
import PublicIcon from "@mui/icons-material/Public";

export default function AddNewCountry({
  open,
  handleClose,
  handleOpen,
  getData,
  flag,
  row = {},
}) {
  const { locale } = useLanguage();
  const languages = [
    { symbol: "ar", language: "العربية" },
    { symbol: "en", language: "English" },
    { symbol: "es", language: "Spanish" },
  ];

  const [imgLoading, setImgLoading] = useState();
  const { register, handleSubmit, reset, formState, setValue } = useForm();

  const [fetchedLanguages, loadingLanguages, getDataLanguages] = useFetchedData(
    "/language?removeLanguage=true"
  );

  const [fetchedCurrency, loadingCurrency, getDataCurrency] = useFetchedData(
    "/currency?removeLanguage=true"
  );

  const [resultAdd, loadingAdd, SetAddRequest] = usePostData(
    "country",
    {},
    null,
    "error"
  );

  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `country/${row?.row?.original?.id}`,
    {},
    null,
    "error"
  );
  
  const onSubmit = async (data) => {
    console.log(data,'data')
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
            <FormattedMessage id="countries.addNewCountry" />
          ) : (
            <FormattedMessage id="countries.editCountry" />
          )
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
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
              <FormattedMessage id="countries.addAllLanguages" />
            </Typography>
            {languages?.map((item, idx) => {
              return (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      gap: "16px",
                      mt: 2,
                    }}
                  >
                    <FormControl variant="standard" sx={{ Width: "90%" }}>
                      <Typography sx={{ mb: 1 }} variant="label">
                        <FormattedMessage id="countries.language" /> {idx + 1}
                      </Typography>
                      <TextField
                        disabled={true}
                        name="entryLanguage"
                        placeholder="entryLanguage"
                        type="text"
                        id="entryLanguage"
                        defaultValue={item?.language}
                      />
                    </FormControl>
                    <FormControl variant="standard">
                      <Typography
                        sx={{ mb: "6px", display: "flex" }}
                        variant="h3"
                      >
                        <FormattedMessage id="countries.countryName" />
                        <Required />
                      </Typography>
                      <TextField
                        {...register(`name.${languages[idx]?.symbol}`, {
                          required: true,
                        })}
                        defaultValue={
                          row?.row?.original?.name?.[languages[idx]?.symbol] || ""
                        }
                        error={
                          formState.errors.name?.[languages[idx]?.symbol]
                            ?.type === "required"
                        }
                        helperText={
                          formState.errors.name?.[languages[idx]?.symbol]
                            ?.type === "required" && (
                            <FormattedMessage id="error.requiredField" />
                          )
                        }
                      />
                    </FormControl>
                  </Box>
                </>
              );
            })}
          </Box>

          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: "#D7D7D7",
              borderRadius: "7px",
              mt: "24px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
              }}
            >
              {/* {Object.keys(row) && ( */}
                <FormControl
                  sx={{
                    margin: "0px 5px",
                    borderColor: "#B0D9C3",
                  }}
                  fullWidth
                >
                  <Typography sx={{ mb: 1 }} variant="h3">
                    <FormattedMessage id="countries.defaultLanguage" />
                  </Typography>
                  <Select
                    sx={{
                      color: "#049A77",
                      backgroundColor: "#ffffff",
                      p: 2,
                      border: "0.1px solid #B0D9C3",
                      // minWidth: 200,
                    }}
                    // {...register("defaultLanguage", {
                    //   required: true,
                    // })}
                    {...register("defaultLanguage")}
         
                    defaultValue={row?.row?.original?.defaultLanguageId}
                    // error={
                    //   formState.errors.defaultLanguage?.type === "required"
                    // }
                  >
                    {console.log(fetchedLanguages, 'fetchedLanguages')}
                    {Object.keys(fetchedLanguages).length !== 0 &&
                      fetchedLanguages.data.data?.map((item) => (
                        <MenuItem value={item.id}>
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
                  {/* {formState.errors?.defaultLanguage?.type === "required" && (
                    <FormHelperText sx={{ color: "error.main" }}>
                                      <FormattedMessage id="error.requiredField" />

                    </FormHelperText>
                  )} */}
                </FormControl>
              {/* )} */}

              <FormControl
                sx={{
                  height: 45,
                  margin: "0px 5px",
                  borderColor: "#B0D9C3",
                }}
                fullWidth
              >
                <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                  <FormattedMessage id="countries.currencyName" />
                  <Required />
                </Typography>
                <Select
                  sx={{
                    color: "#049A77",
                    backgroundColor: "#ffffff",
                    p: 2,
                    border: "0.1px solid #B0D9C3",
                    // width: "130%",
                  }}
                  // {...register("currency", {
                  //   required: true,
                  // })}
                  {...register("currency")}
                  defaultValue={row?.row?.original?.currencyId}
                  // error={formState.errors.currency?.type === "required"}
                >
                  {Object.keys(fetchedCurrency).length !== 0 &&
                    fetchedCurrency.data.data?.map((item) => (
                      <MenuItem value={item.id}>
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
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
              }}
            >
              <FormControl variant="standard" sx={{ width: "100%", mt: 2 }}>
                <Typography sx={{ mb: 1 }} variant="h3">
                  <FormattedMessage id="countries.telephonePrefix" />
                </Typography>
                <TextField
                  {...register("countryCode", {
                    required: true,
                  })}
                  defaultValue={row?.row?.original?.countryCode}
                  error={formState.errors?.countryCode?.type === "required"}
                  helperText={
                    formState.errors?.countryCode?.type === "required" && (
                      <FormattedMessage id="error.requiredField" />
                    )
                  }
                />
              </FormControl>
            </Box>

            {/* <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Box>
                <FormattedMessage id="products.image" />
              </Box>
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
                <FormattedMessage id="countries.addNewCountry" />
              </Typography>
            ) : (
              <Typography variant="h3">
                <FormattedMessage id="countries.editCountry" />
              </Typography>
            )}
          </LoadingButton>
        </form>
      </BasicModal>
    </>
  );
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});
