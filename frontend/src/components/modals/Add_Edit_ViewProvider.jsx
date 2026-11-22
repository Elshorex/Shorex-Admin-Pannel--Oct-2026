import React, { useEffect, useState } from "react";
import {
  FormControl,
  Box,
  Typography,
  MenuItem,
  ListItemIcon,
  Select,
  TextField,
  FormHelperText,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";

import { usePostData } from "../../hooks/usePostData";
import { useFetchedData } from "../../hooks/useFetchedData";
import { useLanguage } from "../../hooks/useLanguage";
import { usePutData } from "../../hooks/usePutData";
import BasicModal from "./basicModal";
import ChipMenu from "../chipMeun";
import Required from "../required";

import PublicIcon from "@mui/icons-material/Public";

export default function AddNewProvider({
  open,
  handleClose,
  handleOpen,
  getData,
  flag,
  row = {},
}) {
  const { locale } = useLanguage();
  const [imgLoading, setImgLoading] = useState();

  const { register, handleSubmit, reset, formState, setValue, getValues } =
    useForm();

  // const [fetchedProducts, loadingProducts, getDataProducts] = useFetchedData(
  //   "/product?removeLanguage=true"
  // );

  const [fetchedCountry, loadingCountry, getDataCountry] = useFetchedData(
    "/country?removeLanguage=true"
  );

  const [resultAdd, loadingAdd, SetAddRequest] = usePostData(
    "/provider/addUser",
    {},
    null,
    "error"
  );

  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `/provider/updateUser`,
    {},
    null,
    "error"
  );
  const onSubmit = async (data) => {
    const body = {
      products: getValues("products"),
      ...data,
      status: row?.row?.original?.status?.id ? row?.row?.original?.status?.id : 1,
      role: 5,
    };
    flag === "add"
    ? await SetAddRequest(body)
    : await SetEditRequest({ ...body, userId: row?.row?.original?.id });
  };

  const onClose = () => {
    reset();
    handleClose();
  };

  useEffect(() => {
    if (resultAdd?.user?.id || resultEdit?.id) {
      getData();
      handleClose();
    }
  }, [resultAdd, resultEdit]);

  useEffect(() => {
    reset();
  }, [row?.row?.id, row?.row?.original?.updatedAt]);


  const disabledState = flag === "view";
  
  return (
    <>
      <BasicModal
        open={open}
        handleClose={onClose}
        title={
          (flag === "add" && <FormattedMessage id="providers.addProvider" />) ||
          (flag === "edit" && (
            <FormattedMessage id="providers.editProvider" />
          )) ||
          (flag === "view" && <FormattedMessage id="providers.viewDetails" />)
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
              {/* <FormControl
                variant="standard"
                sx={{ width: "100%", mt: 2 }}
                fullWidth
              >
                <Typography sx={{ mb: 1 }} variant="h3">
                  <FormattedMessage id="providers.productMS" />
                </Typography>
                <ChipMenu
                  disabled={flag === "view"}
                  options={
                    fetchedProducts
                      ? fetchedProducts?.data?.data?.map((item) => item.id)
                      : []
                  }
                  defaultChips={
                    row?.row?.original?.products
                      ? row?.row?.original?.products
                      : []
                  }
                  AllData={fetchedProducts ? fetchedProducts?.data?.data : []}
                  tooltip={"Add"}
                  onChipAdded={(option) => console.log("ADDED", option)}
                  onChipRemoved={(option) => console.log("REMOVED", option)}
                  onButtonShowHide={(isShown) => console.log("SHOWN", isShown)}
                  maxSelect={0}
                  alignLeft={false}
                  sort={0}
                  setValue={setValue}
                />
              </FormControl> */}

            <Box
              sx={{
                mt: "16px",
                display: "flex",
                gap: "16px",
                width: "100%",
              }}
            >
              <FormControl
                sx={{
                  width: "48%",
                  // minWidth: 100,
                  // margin: "0px 5px",
                  borderColor: "#B0D9C3",
                }}
              >
                <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                  <FormattedMessage id="providers.providerName" />
                  <Required />
                </Typography>
                <TextField
                  {...register("name", {
                    required: true,
                  })}
                  disabled={flag === "view"}
                  name="name"
                  type="text"
                  id="name"
                  defaultValue={row?.row?.original?.name}
                  error={formState.errors.name?.type === "required"}
                  helperText={
                    formState.errors.name?.type === "required" && (
                      <FormattedMessage id="error.requiredField" />
                    )
                  }
                />
              </FormControl>

              <FormControl
                sx={{
                  minWidth: "38%",
                  // height: 45,
                  borderColor: "#B0D9C3",
                }}
                // error={formState.errors.country?.type === "required"}
              >
                <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                  <FormattedMessage id="providers.country" />
                  <Required />
                </Typography>
                <Select
                  sx={{
                    color: "#049A77",
                    backgroundColor: "#ffffff",
                    p: 2,
                    border: "0.1px solid #B0D9C3",
                    width: "130%",
                  }}
                  {...register("country", {
                    required: true,
                  })}
                  defaultValue={row?.row?.original?.country.id}
                  disabled={flag === "view"}
                >
                  {Object.keys(fetchedCountry).length !== 0 &&
                    fetchedCountry.data.data?.map((item) => (
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
                {/* {formState.errors.country?.type === "required"&& (
                  <FormHelperText color="error">
                    <FormattedMessage id="error.requiredField" />
                  </FormHelperText>
                )} */}
              </FormControl>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: "16px",
                mt: 2,
              }}
            >
           
             <FormControl variant="standard" sx={{ Width: "90%" }}>
                <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                  <FormattedMessage id="providers.contactPerson" />
                  <Required />
                </Typography>
                <TextField
                  {...register("contactPersonName", {
                    required: true,
                  })}
                  name="contactPersonName"
                  type="text"
                  id="contactPersonName"
                  defaultValue={row?.row?.original?.contactPersonName}
                  disabled={flag === "view"}
                  error={
                    formState.errors.contactPersonName?.type === "required"
                  }
                  helperText={
                    formState.errors.contactPersonName?.type === "required" && (
                      <FormattedMessage id="error.requiredField" />
                    )
                  }
                />
              </FormControl>


               {/* Password */}
                <FormControl variant="standard" >
                  <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
                    <FormattedMessage id="driver.password" />
                    <Required />
                  </Typography>
                  <TextField
                    type="password"
                    disabled={disabledState}
                    {...register("password", {
                      required: true,
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters long",
                      },
                      pattern: {
                        value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
                        message: "Password must contain at least one letter and one number",
                      },
                    })}
                    onChange={(e) => setValue("password", e.target.value)}
                    error={!!formState.errors?.password}
                    helperText={
                      formState.errors?.password && (
                        <>
                          {formState.errors.password.type === "required" && (
                            <FormattedMessage id="error.requiredField" />
                          )}
                          {formState.errors.password.type === "minLength" && (
                            <Typography color="error" variant="body2">
                              Password must be at least 6 characters
                            </Typography>
                          )}
                          {formState.errors.password.type === "pattern" && (
                            <Typography color="error" variant="body2">
                              Must contain at least one letter and one number
                            </Typography>
                          )}
                        </>
                      )
                    }
                  />
                </FormControl>      
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: "16px",
                mt: 2,
              }}
            >
              <FormControl variant="standard" sx={{ Width: "90%" }}>
                <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                  <FormattedMessage id="providers.contactPersonLandline" />
                  <Required />
                </Typography>
                <TextField
                  {...register("contactPersonLandline", {
                    required: true,
                  })}
                  name="contactPersonLandline"
                  type="text"
                  id="contactPersonLandline"
                  // defaultValue={item?.language}
                  disabled={flag === "view"}
                  defaultValue={row?.row?.original?.contactPersonLandline}
                  error={
                    formState.errors.contactPersonLandline?.type === "required"
                  }
                  helperText={
                    formState.errors.contactPersonLandline?.type ===
                      "required" && (
                      <FormattedMessage id="error.requiredField" />
                    )
                  }
                />
              </FormControl>
              <FormControl variant="standard">
                <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                  <FormattedMessage id="providers.contactPersonEmail" />
                  <Required />
                </Typography>
                <TextField
                  {...register("email", {
                    required: true,
                  })}
                  defaultValue={row?.row?.original?.email}
                  error={formState.errors.email?.type === "required"}
                  helperText={
                    formState.errors.email?.type === "required" && (
                      <FormattedMessage id="error.requiredField" />
                    )
                  }
                  disabled={flag === "view"}
                />
              </FormControl>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: "16px",
                mt: 2,
              }}
            >
              <FormControl variant="standard" sx={{ Width: "90%" }}>
                <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                  <FormattedMessage id="providers.address" />
                  <Required />
                </Typography>
                <TextField
                  {...register("address", {
                    required: true,
                  })}
                  name="address"
                  type="text"
                  id="address"
                  defaultValue={row?.row?.original?.address}
                  error={formState.errors.address?.type === "required"}
                  helperText={
                    formState.errors.address?.type === "required" && (
                      <FormattedMessage id="error.requiredField" />
                    )
                  }
                  disabled={flag === "view"}
                />
              </FormControl>
              
           <FormControl variant="standard">
                <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                  <FormattedMessage id="providers.contactPersonMobile" />
                  <Required />
                </Typography>
                <TextField
                  {...register("phone", {
                    required: true,
                  })}
                  defaultValue={row?.row?.original?.phone}
                  disabled={flag === "view"}
                  error={formState.errors.phone?.type === "required"}
                  helperText={
                    formState.errors.phone?.type === "required" && (
                      <FormattedMessage id="error.requiredField" />
                    )
                  }
                />
              </FormControl>
            </Box>
              <Box
              sx={{
                display: "flex",
                gap: "16px",
                mt: 2,
              }}
            >
              

              

              <FormControl variant="standard">
                <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                  <FormattedMessage id="providers.registrationNumber" />
                  <Required />
                </Typography>
                <TextField
                  {...register("nif", {
                    required: true,
                  })}
                  defaultValue={row?.row?.original?.nif}
                  disabled={flag === "view"}
                  error={formState.errors.nif?.type === "required"}
                  helperText={
                    formState.errors.nif?.type === "required" && (
                      <FormattedMessage id="error.requiredField" />
                    )
                  }
                />
              </FormControl>
            </Box>
          </Box>

          {flag != "view" && (
            <LoadingButton
              loading={loadingEdit || loadingAdd}
              disabled={imgLoading}
              sx={{ m: 3, width: "90%", p: 1 }}
              variant="contained"
              startIcon={<PublicIcon sx={{ mx: "4px" }}/>}
              onClick={handleOpen}
              type="submit"
            >
              {flag === "add" ? (
                <Typography variant="h3">
                  <FormattedMessage id="countries.create" />
                </Typography>
              ) : (
                <Typography variant="h3">
                  <FormattedMessage id="providers.editProvider" />
                </Typography>
              )}
            </LoadingButton>
          )}
        </form>
      </BasicModal>
    </>
  );
}
