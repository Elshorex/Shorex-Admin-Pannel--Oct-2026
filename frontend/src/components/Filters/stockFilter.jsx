import React, { useEffect } from "react";
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
import { useAuthState } from "../../context";
import { adminOptionsFilter, stockOptions } from "../../constants/constant";
import { useState } from "react";

export default function StockFilter({
  open,
  handleClose,
  setFilterData,
  filterData,
  fetchedProducts = {},
  providersData = {},
  warehouseData,
}) {
  const { register, handleSubmit, setValue, getValues, formState } = useForm();
  const { locale } = useLanguage();
  const user = useAuthState();
  const providerType = user?.userData?.type === "PROVIDER";
  const [certainProvider, setCertainProvider] = useState(false);

  //so If the user reset the filter in parent, will effect in modal
  useEffect(() => {
    const { product, stock, warehouse, certainProvider, adminFilter } =
      filterData || {};
    setValue("product", product || "");
    setValue("stock", stock || "");
    setValue("warehouse", warehouse || "");
    setValue("adminFilter", adminFilter || "");
    setValue("certainProvider", certainProvider || "");
  }, [
    filterData?.stock,
    filterData?.product,
    filterData?.warehouse,
    filterData?.adminFilter,
    filterData?.certainProvider,
  ]);

  const onSubmit = (data) => {
    const { product, stock, warehouse, adminFilter, certainProvider } =
      data || {};

    setFilterData({
      product,
      stock,
      warehouse,
      adminFilter,
      certainProvider,
    });
    handleClose();
  };

  useEffect(() => {
    filterData?.adminFilter == "certainProvider" && setCertainProvider(true);
  }, [filterData?.adminFilter]);

  const onCancel = () => {
    const fields = ["product", "stock", "warehouse"];
    fields.forEach((field) => setValue(field, ""));
    setFilterData({
      product: "",
      warehouse: "",
      stock: "",
      adminFilter: "",
      certainProvider: "",
    });

    handleClose();
  };

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
                  <FormattedMessage id="stock.warehouse" />
                </Typography>
                <Select
                  sx={{
                    color: "#049A77",
                    backgroundColor: "#ffffff",
                    p: 2,
                    border: "0.1px solid #B0D9C3",
                  }}
                  {...register("warehouse")}
                  defaultValue={getValues("warehouse")}
                >
                  {Object.keys(warehouseData)?.length !== 0 &&
                    warehouseData?.data?.data?.map((item) => (
                      <MenuItem value={item?.id} key={item.id}>
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

              <FormControl
                sx={{
                  margin: "0px 5px",
                  borderColor: "#B0D9C3",
                  mt: 3,
                }}
              >
                <Typography sx={{ mb: 1 }} variant="h3">
                  <FormattedMessage id="stock.product" />
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

              <FormControl
                sx={{
                  margin: "0px 5px",
                  borderColor: "#B0D9C3",
                  mt: 3,
                }}
              >
                <Typography sx={{ mb: 1 }} variant="h3">
                  <FormattedMessage id="stock.availableStock" />
                </Typography>
                <Select
                  sx={{
                    color: "#049A77",
                    backgroundColor: "#ffffff",
                    p: 2,
                    border: "0.1px solid #B0D9C3",
                  }}
                  {...register("stock")}
                  defaultValue={getValues("stock")}
                >
                  {stockOptions?.map((item) => (
                    <MenuItem value={item.id} key={item.id}>
                      <ListItemIcon
                        sx={{
                          color: "#049A77",
                          marginTop: "5px",
                        }}
                        key={item.id}
                      >
                        {item.label}
                      </ListItemIcon>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Button
            sx={{ m: 3, px: 2, py: 1 }}
            variant="contained"
            onClick={onCancel}
          >
            <Typography variant="h3">
              <FormattedMessage id="stock.reset" />
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
