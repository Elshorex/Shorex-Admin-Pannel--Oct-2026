import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  Box,
  Typography,
  Select,
  MenuItem,
  ListItemIcon,
  TextField,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useForm } from "react-hook-form";

import { useLanguage } from "../../hooks/useLanguage";
import BasicModal from "../modals/basicModal";
import ResponsiveDateRangePickers from "../DatePicker/DatePicker";
import moment from "moment";

export default function PromotionsFilter({
  open,
  handleClose,
  setFilterData,
  filterData,
  countriesData = {},
}) {
  const { register, handleSubmit, setValue, getValues } = useForm();
  const { locale } = useLanguage();

  //so If the user reset the filter in parent, will effect in modal
  useEffect(() => {
    if (filterData?.ranges) {
      setValue(
        "fromDate",
        filterData?.ranges[0]?.fromDate ? filterData?.ranges[0]?.fromDate : ""
      );
      setValue(
        "toDate",
        filterData?.ranges[0]?.toDate ? filterData?.ranges[0]?.toDate : ""
      );
    }
    setValue("country", filterData?.country ? filterData?.country : "");
  }, [
    filterData?.ranges && filterData?.ranges[0]?.fromDate,
    filterData?.ranges && filterData?.ranges[0]?.toDate,
    filterData?.country,
  ]);

  const onSubmit = (data) => {
    setFilterData({
      fromDate: data?.ranges
        ? moment(data?.ranges[0]?.fromDate).format("YYYY-MM-DD")
        : null,
      toDate: data?.ranges
        ? moment(data?.ranges[0]?.toDate).format("YYYY-MM-DD")
        : null,
      country: data?.country,
    });
    handleClose();
  };

  const onCancel = () => {
    setValue("fromDate", "");
    setValue("toDate", "");
    setValue("country", "");
    setFilterData({ fromDate: "", toDate: "", country: "" });
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
              <FormControl
                sx={{
                  margin: "0px 5px",
                  borderColor: "#B0D9C3",
                  mt: 6,
                }}
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
                  {...register("country")}
                  defaultValue={getValues("country")}
                >
                  {(Object.keys(countriesData)?.length !== 0) !== 0 &&
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

              <FormControl variant="standard" fullWidth sx={{ mt: 15 }}>
                <Typography sx={{ mb: 2 }} variant="h3">
                  <FormattedMessage id="warehouse.date" />
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
