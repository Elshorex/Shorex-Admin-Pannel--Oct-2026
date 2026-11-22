import React, { useEffect } from "react";
import { Typography, FormControl, TextField, Button, Box } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useForm } from "react-hook-form";

import BasicModal from "./basicModal";
import { usePutData } from "../../hooks/usePutData";
import { useFetchedData } from "../../hooks/useFetchedData";
import { useLanguage } from "../../hooks/useLanguage";

export default function SpecialPoints({
  open,
  handleClose,
  title,
  row = {},
  getData,
}) {
  const { locale } = useLanguage();
  const intl = useIntl();

  const { register, handleSubmit, setValue } = useForm();
  const [resultEdit, loadingEdit, setEditRequest] = usePutData(
    "/customer/updateUser",
    {},
    intl.formatMessage({
      id: "rewardsManagement.specialPoints",
    }),
    "error"
  );

  const [allData, loadingExcelData, getProductsData] = useFetchedData(
    `/product?removeLanguage=true&all=true`
    // false
  );

  const onSubmit = (data) => {
    setEditRequest({ ...data, userId: row?.row?.original?.id });
  };

  // useEffect(() => {
  //   open && getProductsData();
  // }, [open]);

  useEffect(() => {
    if (resultEdit?.id) {
      getData();
      handleClose();
    }
  }, [resultEdit, getData]);

  useEffect(() => {
    if (allData?.data?.data) {
      allData.data.data.forEach((item, inx) => {
        setValue(`specialReward[${inx}].product`, item.id);
      });
    }
  }, [allData, locale, setValue]);

  return (
    <>
      <BasicModal
        open={open}
        handleClose={handleClose}
        title={<Typography variant="h2">{title}</Typography>}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {allData?.data?.data.map((item, inx) => (
            <Box
              sx={{
                p: 2,
                display: "flex",
                gap: 3,
              }}
              key={inx}
            >
              <FormControl variant="standard" sx={{ width: "100%" }} fullWidth>
                <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
                  <FormattedMessage id="warehouse.product" />
                </Typography>
                <TextField
                  value={item?.name[locale]}
                  onChange={(e) =>
                    setValue(`specialReward[${inx}].product`, e.target.value)
                  }
                  disabled
                />
              </FormControl>

              <FormControl variant="standard" fullWidth>
                <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
                  <FormattedMessage id="customer.points" />
                </Typography>
                <TextField value={item?.points} disabled />
              </FormControl>

              <FormControl variant="standard" sx={{ width: "100%" }} fullWidth>
                <Typography sx={{ mb: 1, display: "flex " }} variant="h3">
                  <FormattedMessage id="customer.specialPoints" />
                </Typography>
                <TextField
                  {...register(`specialReward[${inx}].reward`)}
                  defaultValue={
                    row?.row?.original?.specialReward[inx]?.reward || 0
                  }
                  onChange={(e) =>
                    setValue(`specialReward[${inx}].reward`, e.target.value)
                  }
                />
              </FormControl>
            </Box>
          ))}

          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <Button sx={{ m: 1, px: 2 }} variant="contained" type="submit">
              <Typography variant="h3">
                <FormattedMessage id="providers.apply" />
              </Typography>
            </Button>
            <Button
              sx={{ m: 1, px: 1 }}
              variant="outlined"
              onClick={handleClose}
            >
              <Typography variant="h3">
                <FormattedMessage id="warehouse.cancel" />
              </Typography>
            </Button>
          </Box>
        </form>
      </BasicModal>
    </>
  );
}
