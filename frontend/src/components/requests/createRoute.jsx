import React, { useEffect, useState } from "react";
import {
  FormControl,
  Box,
  Typography,
  Button,
  CircularProgress,
  Select,
  ListItemIcon,
  MenuItem,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { usePostData } from "../../hooks/usePostData";
import { useFetchedData } from "../../hooks/useFetchedData";
import { useLanguage } from "../../hooks/useLanguage";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Required from "../required";
import SingleDatePicker from "../DatePicker/SingleDatePicker";
import CustomerTable from "./customertable";

export default function CreateRoute() {
  const { register, getValues, formState, watch, setValue, handleSubmit } =
    useForm();
  const navigate = useNavigate();
  const { locale } = useLanguage();
  const [openModal, setOpenModal] = useState(false);
  const [customerSelectedData, setCustomerSelectedData] = useState([]);

  const [fetchedDriverData, loadingDriverData, getDriverData] = useFetchedData(
    `/driver?removeLanguage=true&all=true`
  );

  const [fetchedvehicleData, loadingvehicleData, getvehicleData] =
    useFetchedData(
      `/vehicle?removeLanguage=true&driver=${watch("driver")}`,
      false
    );

  useEffect(() => {
    watch("driver") &&
      getvehicleData(`/vehicle?removeLanguage=true&driver=${watch("driver")}`);
  }, [watch("driver")]);

  const [resultAdd, loadingAdd, SetAdd] = usePostData(
    `/request/route`,
    {},
    null,
    "error"
  );

  const [fetchedProducts, loadingProducts, getDataProducts] = useFetchedData(
    "/product?removeLanguage=true"
  );

  const onSubmit = async (data) => {
    const body = {
      ...data,
      customers: customerSelectedData
        ? customerSelectedData.map((id) => ({ id }))
        : [],
    };
    SetAdd(body);
  };

  useEffect(() => {
    resultAdd?.result?.length && navigate("/requestsManagement");
  }, [resultAdd?.result?.length]);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex" }}>
        <Link to="/requestsManagement">
          <ArrowBackIosIcon
            fontSize="12px"
            sx={{ mt: "4px", mx: 1, scale: locale == "ar" && "-1" }}
          />
        </Link>
        <Typography variant="h2">
          <FormattedMessage id="createRoute.createRoute" />
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
          <Typography variant="h3">
            <FormattedMessage id="vehicle.driver" />
            {(loadingDriverData || loadingvehicleData) && <CircularProgress />}
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
                margin: "0px 5px",
                borderColor: "#B0D9C3",
                width: "30%",
              }}
              fullWidth
            >
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="driver.drivers" />
                <Required />
              </Typography>
              <Select
                sx={{
                  color: "#049A77",
                  backgroundColor: "#ffffff",
                  py: 2,
                  border: "0.1px solid #B0D9C3",
                }}
                {...register("driver")}
                defaultValue={getValues("driver")}
              >
                {Object.keys(fetchedDriverData)?.length !== 0 &&
                  fetchedDriverData?.data?.data?.map((item) => (
                    <MenuItem value={item.id} key={item.id}>
                      <ListItemIcon
                        sx={{
                          color: "#049A77",
                        }}
                        key={item.id}
                      >
                        {item.name}
                      </ListItemIcon>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <FormControl
              sx={{
                margin: "0px 5px",
                borderColor: "#B0D9C3",
                width: "30%",
              }}
              fullWidth
            >
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="driver.vehicle" />
                <Required />
              </Typography>
              <Select
                sx={{
                  color: "#049A77",
                  backgroundColor: "#ffffff",
                  p: 2,
                  border: "0.1px solid #B0D9C3",
                }}
                {...register("vehicle")}
                defaultValue={getValues("vehicle")}
              >
                {Object.keys(fetchedvehicleData)?.length !== 0 &&
                  fetchedvehicleData?.data?.data?.map((item) => (
                    <MenuItem value={item.id} key={item.id}>
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
          </Box>

          <Typography variant="h3" sx={{ my: 2 }}>
            <FormattedMessage id="createRoute.assignCustomer" />
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", width: "30%" }}>
            <FormControl
              sx={{ margin: "0px 5px", borderColor: "#B0D9C3" }}
              fullWidth
            >
              <Typography
                sx={{ mb: 1, display: "flex", width: "100%" }}
                variant="h3"
              >
                <FormattedMessage id="providers.productMS" />
                <Required />
              </Typography>
              <Select
                sx={{
                  color: "#049A77",
                  backgroundColor: "#ffffff",
                  p: 2,
                }}
                {...register("product")}
                defaultValue={getValues("product")}
              >
                {Object.keys(fetchedProducts)?.length !== 0 &&
                  fetchedProducts?.data?.data?.map((item) => (
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

          <Box sx={{ display: "flex", mt: 2 }}>
            <Typography sx={{ display: "flex" }} variant="h3">
              <FormattedMessage id="createRoute.customers" /> (
              {customerSelectedData?.length}) :
              <Required />
            </Typography>
            <Button
              variant="contained"
              onClick={() => setOpenModal(true)}
            >
              <Typography variant="h3">
                <FormattedMessage id="warehouse.edit" />
              </Typography>
            </Button>
          </Box>

          <Typography variant="h3" sx={{ mb: 2, mt: 3 }}>
            <FormattedMessage id="createRoute.routeDate" />
          </Typography>

          <Box sx={{ my: 2, width: "30%" }}>
            <FormControl variant="standard" fullWidth>
              <Typography sx={{ display: "flex" }} variant="h3">
                <FormattedMessage id="warehouse.joiningDate" />
                <Required />
              </Typography>
              <SingleDatePicker
                setValue={setValue}
                watch={watch}
                param="pickupDate"
                disablePastDates={true}
              />
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", flex: "col" }}>
            <Button
              sx={{ m: 1, px: 2 }}
              variant="contained"
              type="submit"
              disabled={customerSelectedData?.length == 0}
            >
              <Typography variant="h3">
                <FormattedMessage id="createRoute.createRoute" />
              </Typography>
            </Button>
            <Button
              sx={{ m: 1, px: 1 }}
              variant="outlined"
              onClick={() => navigate("/requestsManagement")}
            >
              <Typography variant="h3">
                <FormattedMessage id="warehouse.cancel" />
              </Typography>
            </Button>
          </Box>
        </form>
      </Box>

      <CustomerTable
        open={openModal}
        handleClose={() => {
          setOpenModal(false);
        }}
        // countries={excelData && excelData}
        setCustomerSelectedData={setCustomerSelectedData}
        customerSelectedData={customerSelectedData}
        dataUrl="customer"
      />
    </Box>
  );
}
