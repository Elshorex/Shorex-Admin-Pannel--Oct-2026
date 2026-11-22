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
import { week } from "../utils/Constant";
import BasicModal from "../modals/basicModal";

export default function WeekendFilter({
  open,
  handleClose,
  countries = [],
  setFilterData,
  filterData,
}) {
  const { locale } = useLanguage();
  const { register, handleSubmit, setValue, getValues } = useForm();


  //so If the user reset the filter in parent, will effect in modal
  useEffect(() => {
    setValue("id", filterData?.id ? filterData?.id : "");
    setValue("weekend", filterData?.weekend ? filterData?.weekend : "");
  }, [filterData?.id, filterData?.weekend]);

  const onSubmit = (data) => {
    setFilterData(data);
    handleClose();
  };

  const onCancel = () => {
    setValue("id", "");
    setValue("weekend", "");
    setFilterData({ id: "", weekend: "" });
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
                mt: 2,
              }}
            >
              <FormControl
                sx={{
                  margin: "0px 5px",
                  borderColor: "#B0D9C3",
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
                  {...register("id")}
                  defaultValue={getValues("id")}
                >
                  {countries?.length !== 0 &&
                    countries?.map((item) => (
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
                }}
              >
                <Typography sx={{ mb: 1 }} variant="h3">
                  <FormattedMessage id="weekends.days" />
                </Typography>
                <Select
                  sx={{
                    color: "#049A77",
                    backgroundColor: "#ffffff",
                    border: "0.1px solid #B0D9C3",
                    width: "100%",
                  }}
                  {...register("weekend")}
                  defaultValue={getValues("weekend")}
                >
                  {week?.length !== 0 &&
                    week?.map((item) => (
                      <MenuItem value={item.value} key={item.value}>
                        <ListItemIcon
                          sx={{
                            color: "#049A77",
                            marginTop: "5px",
                          }}
                          key={item.value}
                        >
                          {item.name}
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
