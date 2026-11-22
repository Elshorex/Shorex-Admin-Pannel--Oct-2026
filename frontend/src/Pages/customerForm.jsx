import React, { useEffect, useState } from "react";
import {
  FormControl,
  Box,
  Typography,
  TextField,
  TextareaAutosize,
  Button,
  CircularProgress,
  Select,
  ListItemIcon,
  MenuItem,
  Switch,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useFetchedData } from "../hooks/useFetchedData";
import Required from "../components/required";
import UploadFlag from "../components/UploadFlag";
import SingleDatePicker from "../components/DatePicker/SingleDatePicker";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useLanguage } from "../hooks/useLanguage";
import { usePutData } from "../hooks/usePutData";
import {
  removeEmptyParameters,
  removeProperty,
} from "../components/utils/Helper";

export default function CustomerForm() {
  const { register, getValues, formState, watch, setValue, handleSubmit } =
    useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useLanguage();
  const customerId = location?.state?.customerId;
  const action = location?.state?.action;
  const [imgLoading, setImgLoading] = useState();
  const [row, setRow] = useState();
  const [availableRegions, setRegions] = useState();

  const [checked, setChecked] = React.useState(row?.hasDeposit);

  const handleChangeChecked = (event) => {
    setChecked(event.target.checked);
    setValue("hasDeposit", event.target.checked);
  };

  useEffect(() => {
    setChecked(row?.hasDeposit);
  }, [row?.hasDeposit]);

  const [fetchedCustomerData, loadingCustomerData, getCustomerData] =
    useFetchedData(
      `/customer/userInfo?removeLanguage=true&userId=${customerId}`,
      false
    );

  const [
    fetchedBusinessCategory,
    loadingBusinessCategory,
    getBusinessCategory,
  ] = useFetchedData(`/category?removeLanguage=true&all=true`);

  const [countriesData, loadingCountry, getDataCountry] = useFetchedData(
    `/country?removeLanguage=true&all=true`
  );

  const [cityData, loadingCityData, getCityData] = useFetchedData(
    `/city?removeLanguage=true&all=true`,
    false
  );
    const [areaData, loadingAreaData, getAreaData] = useFetchedData(
    `/areas?removeLanguage=true&all=true`,
    false
  );

  const [regionData, loadingRegionData, getRegionData] = useFetchedData(
    `/region?removeLanguage=true&all=true` , false  );

  const [resultEdit, loadingEdit, setEditRequest] = usePutData(
    "customer/updateUser",
    {},
    null,
null
  );

  useEffect(() => {
    setRegions(regionData);
  }, [Object.keys(regionData)?.length && regionData?.data?.data?.length]);

    useEffect(() => {
      if (watch("country")) {
        // setValue("region", "");
        // setValue("city", "");
        getRegionData(`region?removeLanguage=true&country=${watch("country")}`);
      }
    }, [watch("country")]);

    useEffect(() => {
      if (watch("region")) {
        // setValue("city", "");
        getCityData(`city?removeLanguage=true&region=${watch("region")}`);
      }
    }, [watch("region")]);

    useEffect(() => {
      if (watch("city")) {
        // setValue("city", "");
        getAreaData(`area?removeLanguage=true&city=${watch("city")}`);
      }
    }, [watch("city")]);


  useEffect(() => {
    customerId && getCustomerData();
  }, [customerId]);

  useEffect(() => {
    setRow(fetchedCustomerData?.data?.user);
  }, [Object.keys(fetchedCustomerData).length]);

  const onSubmit = async (data) => {
    data = removeProperty(data, "region");
    data = removeEmptyParameters(data);
    await setEditRequest(data);
  };

  useEffect(() => {
    resultEdit?.id && navigate("/customer");
  }, [resultEdit?.id]);

  useEffect(() => {
    console.log(row)
    if (row && Object.keys(row)?.length > 0) {
      setValue("userId", row.id || "");
      setValue("name", row.name || "");
      setValue("bussinessName", row.bussinessName || "");
      setValue("email", row.email || "");
      setValue("landlineNumber", row.landlineNumber || "");
      setValue("licenceNumber", row.licenceNumber || "");
      setValue("phone", row.phone || "");
      setValue("country", row?.country?.id || "");
      setValue("city", row?.city[0]?.id || "");
      setValue("areas", row?.areas[0]?.id || "");
      setValue("region", row?.region[0]?.id || "");
      setValue("buildingNumber", row.buildingNumber || "");
      setValue("category", row.category?.id || "");
      setValue("streetName", row.location || "");
      // setValue("postalCode", row.postalCode || "");
      setValue("bankName", row.bankName || "");
      setValue("iban", row.iban || "");
      setValue("licenceImage", row.licenceImage || "");
      setValue("accountHolderName", row.accountHolderName || "");
      setValue("notes", row.notes || "");
      setValue("depositDescription", row.depositDescription || "");
      setValue("hasDeposit", row.hasDeposit);
      setValue("joinDate", row.joinDate);
    }
  }, [row]);

  // const disabledState = action === "viewData";


  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex" }}>
        <Link to="/customer">
          <ArrowBackIosIcon
            fontSize="12px"
            sx={{ mt: "4px", mx: 1, scale: locale == "ar" && "-1" }}
          />
        </Link>
        <Typography variant="h2">
          <FormattedMessage id="customer.editCustomer" />
        </Typography>
      </Box>

      <Box
        sx={{
          border: 1,
          p: 2,
          mt: 2,
          borderRadius: 1,
          borderColor: "#646866",
          borderStyle: "dashed",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Typography variant="h3" sx={{ mb: 1 }} color="#049A77">
            <FormattedMessage id="customer.customerInfo" />
            {loadingCustomerData && <CircularProgress />}
          </Typography>
          <Box
            sx={{
              p: 2,
              display: "flex",
              gap: 3,
            }}
          >
            <FormControl variant="standard" sx={{ width: "100%" }} fullWidth>
              <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
                <FormattedMessage id="stock.businessName" />
                <Required />
              </Typography>
              <TextField
                {...register("bussinessName", {
                  required: true,
                })}
                value={watch("bussinessName") || ""}
                onChange={(e) => setValue("bussinessName", e.target.value)}
                error={formState.errors?.bussinessName?.type === "required"}
                helperText={
                  formState.errors?.bussinessName?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl>

            <FormControl variant="standard" fullWidth>
              <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
                <FormattedMessage id="driver.email" />
                <Required />
              </Typography>
              <TextField
                {...register("email", {
                  required: true,
                })}
                value={watch("email") || ""}
                onChange={(e) => setValue("email", e.target.value)}
                error={formState.errors?.email?.type === "required"}
                helperText={
                  formState.errors?.email?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl>

            <FormControl variant="standard" sx={{ width: "100%" }} fullWidth>
              <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
                <FormattedMessage id="stock.customerName" />
                <Required />
              </Typography>
              <TextField
                {...register("name", {
                  required: true,
                })}
                value={watch("name") || ""}
                onChange={(e) => setValue("name", e.target.value)}
                error={formState.errors?.name?.type === "required"}
                helperText={
                  formState.errors?.name?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl>
          </Box>

          <Box
            sx={{
              p: 2,
              display: "flex",
              gap: 3,
            }}
          >
            <FormControl
              sx={{
                borderColor: "#B0D9C3",
                minWidth: "32.5%",
              }}
              // fullWidth
            >
              <Typography sx={{ mb: 1 }} variant="h3">
                <FormattedMessage id="sideNavbar.businessCategories" />
              </Typography>
              <Select
                sx={{
                  color: "#049A77",
                  backgroundColor: "#ffffff",
                  p: 2,
                  border: "1px solid #B0D9C3",
                }}
                {...register("category")}
                value={watch("category") || ""}
              >
                {Object.keys(fetchedBusinessCategory)?.length !== 0 &&
                  fetchedBusinessCategory?.data?.data?.map((item) => {
                    return (
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
                    );
                  })}
              </Select>
            </FormControl>

            <FormControl 
            variant="standard"
            sx={{
                // margin: "0px 5px",
                // borderColor: "#B0D9C3",
                minWidth: "32.5%",
              }}
            //  fullWidth
             >
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="driver.licenseNumber" />
                <Required />
              </Typography>
              <TextField
                {...register("licenceNumber", {
                  required: true,
                })}
                value={watch("licenceNumber") || ""}
                onChange={(e) => setValue("licenceNumber", e.target.value)}
                error={formState.errors?.licenceNumber?.type === "required"}
                helperText={
                  formState.errors?.licenceNumber?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl>

            <FormControl variant="standard" fullWidth  sx={{ width: "32.5%" }}>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="driver.landLineNumber" />
                <Required />
              </Typography>
              <TextField
                {...register("landlineNumber", {
                  required: true,
                })}
                value={watch("landlineNumber") || ""}
                onChange={(e) => setValue("landlineNumber", e.target.value)}
                error={formState.errors?.landlineNumber?.type === "required"}
                helperText={
                  formState.errors?.landlineNumber?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl>

            {/* <FormControl variant="standard" fullWidth>
              <Typography sx={{ display: "flex" }} variant="h3">
                <FormattedMessage id="warehouse.joiningDate" />
                <Required />
              </Typography>
              <SingleDatePicker
                setValue={setValue}
                watch={watch}
                param="joinDate"
              />
            </FormControl> */}
          </Box>
          <Box
            sx={{
              p: 2,
              display: "flex",
              gap: 3,
            }}
          >
                 <FormControl variant="standard" fullWidth  sx={{ width: "32.5%" }}>
                      <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
                        <FormattedMessage id="driver.password" />
                        <Required />
                      </Typography>
                      <TextField
                        type="password"
                        // disabled={disabledState}
                        {...register("password", {
                          required: false, // Only required in create mode
                          minLength: watch("password") 
                            ? { value: 6, message: "Password must be at least 6 characters long" }
                            : undefined,
                          pattern: watch("password") 
                            ? {
                                value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
                                message: "Password must contain at least one letter and one number",
                              }
                            : undefined,
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
            {/* <FormControl variant="standard" fullWidth>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="driver.landLineNumber" />
                <Required />
              </Typography>
              <TextField
                {...register("landlineNumber", {
                  required: true,
                })}
                value={watch("landlineNumber") || ""}
                onChange={(e) => setValue("landlineNumber", e.target.value)}
                error={formState.errors?.landlineNumber?.type === "required"}
                helperText={
                  formState.errors?.landlineNumber?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl> */}

            <FormControl variant="standard" sx={{ width: "32.5%" }} fullWidth>
              <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
                <FormattedMessage id="driver.mobileNumber" />
                <Required />
              </Typography>
              <TextField
                {...register("phone", {
                  required: true,
                })}
                value={watch("phone") || ""}
                onChange={(e) => setValue("phone", e.target.value)}
                error={formState.errors?.phone?.type === "required"}
                helperText={
                  formState.errors?.phone?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl>

            {/* <FormControl variant="standard" fullWidth>
              <Typography
                sx={{
                  // mb: 1,
                  display: "flex",
                  justifyContent: "space-between",
                }}
                variant="h3"
              >
                <Box sx={{ display: "flex" }}>
                  <FormattedMessage id="customer.custody" />
                  <Required />
                </Box>
                <Switch
                  sx={{ mt: "-6px" }}
                  checked={checked}
                  onChange={handleChangeChecked}
                  inputProps={{ "aria-label": "controlled" }}
                />
              </Typography>
              <TextField
                {...register("depositDescription")}
                value={watch("depositDescription") || ""}
                onChange={(e) => setValue("depositDescription", e.target.value)}
                disabled={!checked}
              />
            </FormControl> */}
          </Box>

          <Typography variant="h3" sx={{ mb: 1 }} color="#049A77">
            <FormattedMessage id="customer.addressInfo" />
          </Typography>
          <Box
            sx={{
              p: 2,
              display: "flex",
              gap: 3,
            }}
          >
            <FormControl
              sx={{
                // minWidth: "31%",
                borderColor: "#B0D9C3",
              }}
            //  variant="standard" 
             fullWidth
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
                }}
                {...register("country", {
                  required: true,
                })}
                value={watch("country") || ""}
                disabled = {action === 'edit' ? true : false}
              >
                {Object.keys(countriesData).length !== 0 &&
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

            <FormControl
              sx={{
                  // minWidth: "31%",
                  // height: 45,
                borderColor: "#B0D9C3",
              }}
               fullWidth
              // error={formState.errors.country?.type === "required"}
            >
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="customer.region" />
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
                {...register("region", {
                  required: true,
                })}
                value={watch("region") || ""}
              >
                {Object.keys(regionData).length !== 0 &&
                  regionData?.data?.data?.map((item) => (
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

            <FormControl
              sx={{
                // minWidth: "31%",
                // height: 45,
                borderColor: "#B0D9C3",
              }}
               fullWidth
              // error={formState.errors.country?.type === "required"}
            >
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="customer.city" />
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
                {...register("city", {
                  required: true,
                })}
                value={watch("city") || ""}
              >
                {Object.keys(cityData).length !== 0 &&
                  cityData?.data?.data?.map((item) => (
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

     
           
          </Box>

          <Box
            sx={{
              p: 2,
              display: "flex",
              gap: 3,
            }}
          >

            <FormControl
              sx={{ borderColor: "#B0D9C3"}}
               fullWidth
               style={{width:'32.5%'}}
            >
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="customer.areaName" />
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
                {...register("areas", {
                  required: true,
                })}
                value={watch("areas") || ""}
              >
                {Object.keys(areaData).length !== 0 &&
                  areaData?.data?.data?.map((item) => (
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

            <FormControl variant="standard" fullWidth style={{width:'32.5%'}}>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="customer.streetName" />
                <Required />
              </Typography>
              <TextField
                {...register("streetName", {
                  required: true,
                })}
                value={watch("streetName") || ""}
                onChange={(e) => setValue("streetName", e.target.value)}
                error={formState.errors?.streetName?.type === "required"}
                helperText={
                  formState.errors?.streetName?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl>

            {/* <FormControl variant="standard" fullWidth style={{width:'32.5%'}}>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="customer.buildingNumber" />
                <Required />
              </Typography>
              <TextField
                {...register("buildingNumber", {
                  required: true,
                })}
                value={watch("buildingNumber") || ""}
                onChange={(e) => setValue("buildingNumber", e.target.value)}
                error={formState.errors?.buildingNumber?.type === "required"}
                helperText={
                  formState.errors?.buildingNumber?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl> */}

            {/* <FormControl variant="standard" fullWidth>
              <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
                <FormattedMessage id="customer.postalCode" />
                <Required />
              </Typography>
              <TextField
                {...register("postalCode", {
                  required: true,
                })}
                value={watch("postalCode") || ""}
                onChange={(e) => setValue("postalCode", e.target.value)}
                error={formState.errors?.postalCode?.type === "required"}
                helperText={
                  formState.errors?.postalCode?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl> */}
          </Box>

          <Typography variant="h3" sx={{ mb: 1 }} color="#049A77">
            <FormattedMessage id="customer.bankingInfo" />
          </Typography>

          <Box
            sx={{
              p: 2,
              display: "flex",
              gap: 3,
            }}
          >
            <FormControl variant="standard" sx={{ width: "100%" }} fullWidth>
              <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
                <FormattedMessage id="customer.bankName" />
                {/* <Required /> */}
              </Typography>
              <TextField
                {...register("bankName")}
                value={watch("bankName") || ""}
                onChange={(e) => setValue("bankName", e.target.value)}
                error={formState.errors?.bankName?.type === "required"}
                helperText={
                  formState.errors?.bankName?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl>

            <FormControl variant="standard" fullWidth>
              <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
                <FormattedMessage id="customer.iban" />
                {/* <Required /> */}
              </Typography>
              <TextField
                {...register("iban")}
                value={watch("iban") || ""}
                onChange={(e) => setValue("iban", e.target.value)}
                error={formState.errors?.iban?.type === "required"}
                helperText={
                  formState.errors?.iban?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl>

            <FormControl variant="standard" fullWidth>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="customer.accountHolderName" />
                {/* <Required /> */}
              </Typography>
              <TextField
                {...register("accountHolderName")}
                value={watch("accountHolderName") || ""}
                onChange={(e) => setValue("accountHolderName", e.target.value)}
                error={formState.errors?.accountHolderName?.type === "required"}
                helperText={
                  formState.errors?.accountHolderName?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl>
          </Box>

          <Box
            sx={{
              p: 2,
              display: "flex",
              // gap: 3,
            }}
          >
            {/* licenceImage */}
            <FormControl variant="standard" fullWidth>
              <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
                <FormattedMessage id="customer.license" />
                {/* <Required /> */}
              </Typography>
              <UploadFlag
                {...{ imgLoading, setImgLoading, setValue }}
                param="licenceImage"
                currentImg={getValues("licenceImage")}
              />
            </FormControl>

            <FormControl variant="standard" fullWidth></FormControl>
            <FormControl variant="standard" fullWidth></FormControl>
          </Box>

          {/** Notes Section **/}
          <Box sx={{ p: 2 }}>
            <FormControl variant="standard" fullWidth>
              <Typography sx={{ mb: 1 }} variant="h3">
                <FormattedMessage id="driver.notes" />
              </Typography>
              <TextareaAutosize
                style={{
                  borderRadius: "8px",
                  borderColor: "rgba(0, 0, 0, 0.38)",
                  padding: "12px 8px",
                  outlineColor: "#8ECCE1",
                  // color: disabledState ? "rgb(170, 170, 170)" : "inherit",
                }}
                {...register("notes")}
                value={watch("notes") || ""}
                onChange={(e) => setValue("notes", e.target.value)}
                rows={4}
              />
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", flex: "col" }}>
            <Button sx={{ m: 1, px: 2 }} variant="contained" type="submit">
              <Typography variant="h3">
                <FormattedMessage id="warehouse.edit" />
              </Typography>
            </Button>
            <Button
              sx={{ m: 1, px: 1 }}
              variant="outlined"
              onClick={() => navigate("/customer")}
            >
              <Typography variant="h3">
                <FormattedMessage id="warehouse.cancel" />
              </Typography>
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}
