import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  Box,
  Typography,
  Select,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";

import { useLanguage } from "../../hooks/useLanguage";
import BasicModal from "../modals/basicModal";
import ResponsiveDateRangePickers from "../DatePicker/DatePicker";
import moment from "moment";
import { adminOptionsFilter } from "../../constants/constant";
import { useAuthState } from "../../context";

export default function WarehouseFilter({
  open,
  handleClose,
  setFilterData,
  filterData,
  fetchedProducts = {},
  fetchedStatus = {},
  providersData = {},
}) {
  const { register, handleSubmit, setValue, getValues, formState } = useForm();
  const { locale } = useLanguage();
  const user = useAuthState();
  const providerType = user?.userData?.type === "PROVIDER";

  const [certainProvider, setCertainProvider] = useState(false);

  //so If the user reset the filter in parent, will effect in modal
  useEffect(() => {
    const { ranges, product, status, adminFilter, certainProvider } =
      filterData || {};
    if (ranges) {
      setValue("fromDate", ranges[0]?.fromDate || "");
      setValue("toDate", ranges[0]?.toDate || "");
    }
    setValue("product", product || "");
    setValue("status", status || "");
    setValue("adminFilter", adminFilter || "");
    setValue("certainProvider", certainProvider || "");
  }, [
    filterData?.ranges && filterData.ranges[0]?.fromDate,
    filterData?.ranges && filterData.ranges[0]?.toDate,
    filterData?.status,
    filterData?.product,
    filterData?.adminFilter,
    filterData?.certainProvider,
  ]);

  const onSubmit = (data) => {
    const { ranges, product, status, adminFilter, certainProvider } =
      data || {};
    const fromDate = ranges
      ? moment(ranges[0]?.fromDate).format("YYYY-MM-DD")
      : null;
    const toDate = ranges
      ? moment(ranges[0]?.toDate).format("YYYY-MM-DD")
      : null;

    setFilterData({
      fromDate,
      toDate,
      product,
      status,
      adminFilter,
      certainProvider,
    });
    handleClose();
  };

  const onCancel = () => {
    const fields = [
      "fromDate",
      "toDate",
      "product",
      "status",
      "adminFilter",
      "certainProvider",
    ];
    fields.forEach((field) => setValue(field, ""));
    setFilterData({
      fromDate: "",
      toDate: "",
      product: "",
      status: "",
      adminFilter: "",
      certainProvider: "",
    });

    handleClose();
  };

  useEffect(() => {
    filterData?.adminFilter == "certainProvider" && setCertainProvider(true);
  }, [filterData?.adminFilter]);

  return (
    <>
      <BasicModal
        open={open}
        handleClose={onCancel}
        title={
          <Typography variant="h3">
            <FormattedMessage id="weekends.filter" />
          </Typography>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {!providerType && (
                <FormControl
                  sx={{
                    margin: "0px 5px",
                    borderColor: "#B0D9C3",
                    mt: 3,
                  }}
                >
                  <Typography sx={{ mb: 1 }} variant="h3">
                    <FormattedMessage id="sideNavbar.dataType" />
                  </Typography>
                  <Select
                    sx={{
                      color: "#049A77",
                      backgroundColor: "#ffffff",
                      p: 2,
                      border: "0.1px solid #B0D9C3",
                    }}
                    {...register("adminFilter")}
                    defaultValue={getValues("adminFilter")}
                    onChange={(e) =>
                      e.target.value == "certainProvider"
                        ? setCertainProvider(true)
                        : setCertainProvider(false)
                    }
                  >
                    {adminOptionsFilter.map((item) => (
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
              )}
              {certainProvider && (
                <FormControl
                  sx={{
                    margin: "0px 5px",
                    borderColor: "#B0D9C3",
                    mt: 3,
                  }}
                >
                  <Typography sx={{ mb: 1 }} variant="h3">
                    <FormattedMessage id="warehouse.provider" />
                  </Typography>
                  <Select
                    sx={{
                      color: "#049A77",
                      backgroundColor: "#ffffff",
                      p: 2,
                      border: "0.1px solid #B0D9C3",
                    }}
                    {...register("certainProvider", {
                      required: true,
                    })}
                    defaultValue={getValues("certainProvider")}
                    error={
                      formState.errors?.certainProvider?.type === "required"
                    }
                    helperText={
                      formState.errors?.certainProvider?.type ===
                        "required" && (
                        <FormattedMessage id="error.requiredField" />
                      )
                    }
                  >
                    {(Object.keys(providersData)?.length !== 0) !== 0 &&
                      providersData?.data?.data?.map((item) => (
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
              )}

              <FormControl
                sx={{
                  margin: "0px 5px",
                  borderColor: "#B0D9C3",
                  mt: 3,
                }}
              >
                <Typography sx={{ mb: 1 }} variant="h3">
                  <FormattedMessage id="warehouse.product" />
                </Typography>
                <Select
                  sx={{
                    color: "#049A77",
                    backgroundColor: "#ffffff",
                    p: 2,
                    border: "0.1px solid #B0D9C3",
                  }}
                  {...register("product")}
                  defaultValue={getValues("product")}
                >
                  {(Object.keys(fetchedProducts)?.length !== 0) !== 0 &&
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

              <FormControl
                sx={{
                  margin: "0px 5px",
                  borderColor: "#B0D9C3",
                  mt: 3,
                }}
              >
                <Typography sx={{ mb: 1 }} variant="h3">
                  <FormattedMessage id="providers.Status" />
                </Typography>
                <Select
                  sx={{
                    color: "#049A77",
                    backgroundColor: "#ffffff",
                    p: 2,
                    border: "0.1px solid #B0D9C3",
                  }}
                  {...register("status")}
                  defaultValue={getValues("status")}
                >
                  {Object.keys(fetchedStatus)?.length !== 0 &&
                    fetchedStatus?.data?.data?.map((item) => (
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

              <FormControl variant="standard" fullWidth sx={{ my: 3 }}>
                <Typography sx={{ mb: 2 }} variant="h3">
                  <FormattedMessage id="warehouse.joiningDate" />
                </Typography>
                <ResponsiveDateRangePickers setValue={setValue} />
              </FormControl>
            </Box>
          </Box>

          <Button
            sx={{ m: 3, px: 2, py: 1 }}
            variant="contained"
            onClick={onCancel}
          >
            <Typography variant="h3">
              <FormattedMessage id="providers.reset" />
            </Typography>
          </Button>

          <Button sx={{ m: 3, px: 2, py: 1 }} variant="contained" type="submit">
            <Typography variant="h3">
              <FormattedMessage id="weekends.filter" />
            </Typography>
          </Button>
        </form>
      </BasicModal>
    </>
  );
}
