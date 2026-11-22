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

export default function ProviderFilter({
  open,
  handleClose,
  setFilterData,
  filterData,
  countriesData = {},
  fetchedStatus = {},
}) {
  const { register, handleSubmit, setValue, getValues } = useForm();
  const { locale } = useLanguage();

  //so If the user reset the filter in parent, will effect in modal
  useEffect(() => {
    setValue("country", filterData?.country ? filterData?.country : "");
    setValue("status", filterData?.status ? filterData?.status : "");
  }, [filterData?.status, filterData?.country]);

  const onSubmit = (data) => {
    setFilterData({
      country: data?.country,
      status: data?.status,
    });
    handleClose();
  };

  const onCancel = () => {
    setValue("country", "");
    setValue("status", "");
    setFilterData({ country: "", status: "" });
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
                  mt: 1,
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

              <FormControl
                sx={{
                  margin: "0px 5px",
                  borderColor: "#B0D9C3",
                  mt: 1,
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
