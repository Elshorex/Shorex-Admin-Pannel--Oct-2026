import React, { useEffect } from "react";
import { FormControl, Box, Typography, TextField, Select, MenuItem, ListItemIcon } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useLocation } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";

import BasicModal from "./basicModal";
import { usePostData } from "../../hooks/usePostData";
import { usePutData } from "../../hooks/usePutData";
import Required from "../required";

import PublicIcon from "@mui/icons-material/Public";
import { removeEmptyParameters } from "../utils/Helper";
import { useFetchedData } from "../../hooks/useFetchedData";
import { useLanguage } from "../../hooks/useLanguage";

export default function AddNewRegion({
  open,
  handleClose,
  handleOpen,
  getData,
  flag,
  row = {},
}) {
  const location = useLocation();
  const cityId = location?.state?.cityId;
  const { locale } = useLanguage();

  const languages = [
    { symbol: "ar", language: "العربية" },
    { symbol: "en", language: "English" },
    { symbol: "es", language: "Spanish" },
  ];

  const {
    register,
    handleSubmit,
    formState,
    reset,
    // watch,
  } = useForm();

  const [fetchedCountry, loadingCountry, getDataCountry] = useFetchedData(
      "/country?removeLanguage=true"
    );

  const [resultAdd, loadingAdd, SetAddRequest] = usePostData(
    "region",
    {},
    null,
    "error"
  );

  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `region/${row?.row?.original?.id}`,
    {},
    null,
    "error"
  );

  const onSubmit = async (data) => {
    data = removeEmptyParameters(data);
    const body = { ...data};
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
  }, [resultAdd?.id, resultEdit?.id]);

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
              <FormattedMessage id="regions.addNewState" />
            </Typography>
          ) : (
            <Typography variant="h3">
              <FormattedMessage id="regions.editRegion" />
            </Typography>
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
                        <FormattedMessage id="regions.stateName" />
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
              mt: 3,
              p: 3,
              border: 1,
              borderColor: "#D7D7D7",
              borderRadius: "7px",
            }}
          >

            {/* Countries */}
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
              {Object.keys(row) && (
                <FormControl
                  sx={{
                    margin: "0px 5px",
                    borderColor: "#B0D9C3",
                  }}
                  fullWidth
                >
                  <Typography sx={{ mb: 1,display: "flex" }} variant="h3">
                    <FormattedMessage id="regions.countryName" />
                     <Required />
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
                    {...register("country", { required: true })}
                   
                    defaultValue={row?.row?.original?.country?.id}
                    // error={
                    //   formState.errors.defaultLanguage?.type === "required"
                    // }
                  >
                    {Object.keys(fetchedCountry).length !== 0 &&
                      fetchedCountry.data.data?.map((item) => (
                        <MenuItem value={item.id}>
                          <ListItemIcon
                            sx={{
                              color: "#049A77",
                              marginTop: "5px",
                            }}
                            key={item.id}
                          >
                            {/* {item.name} */}
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
              )}

           
            </Box>
          </Box>

          </Box>
          <LoadingButton
            loading={loadingAdd || loadingEdit}
            sx={{ my: 3, width: "100%", p: 1 }}
            variant="contained"
            type="submit"
            startIcon={<PublicIcon sx={{ mx: "4px" }} />}
          >
            {flag === "add" ? (
              <Typography variant="h3">
                <FormattedMessage id="regions.addNewState" />
              </Typography>
            ) : (
              <Typography variant="h3">
                <FormattedMessage id="regions.editState" />
              </Typography>
            )}
          </LoadingButton>
        </form>
      </BasicModal>
    </>
  );
}
