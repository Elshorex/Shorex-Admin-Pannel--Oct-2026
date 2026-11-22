import React, { useEffect } from "react";
import { FormControl, Box, Typography, TextField, Button } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";

import { useFetchedData } from "../../hooks/useFetchedData";
import { usePutData } from "../../hooks/usePutData";

import PublicIcon from "@mui/icons-material/Public";
import BasicModal from "./basicModal";

export default function ModifyPoints({
  open,
  handleClose,
  handleOpen,
  getData,
  row,
}) {
  const { register, handleSubmit, watch } = useForm();
  const intl = useIntl();
  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `request/${row?.row?.original?.id}`,
    {},
    intl.formatMessage({
      id: "rewardsManagement.specialPoints",
    }),
    "error"
  );

  const [fetchedCustomerData, loadingCustomerData, getCustomerData] =
    useFetchedData(
      `/request/product-reward/${row?.row?.original?.product?.id}?customerId=${row?.row?.original?.customer?.id}`,
      false
    );

  useEffect(() => {
    open && getCustomerData();
  }, [row?.row?.original?.id, open]);

  const onSubmit = async (data) => {
    const body = {
      ...data,
    };
    SetEditRequest(body);
  };

  const onClose = () => {
    handleClose();
  };

  useEffect(() => {
    if (resultEdit?.id) {
      getData();
      handleClose();
    }
  }, [resultEdit]);

  return (
    <>
      <BasicModal
        open={open}
        handleClose={onClose}
        title={<FormattedMessage id="rewardsManagement.modify" />}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ p: 5 }}>
            <FormControl variant="standard" sx={{ width: "100%", mb: 1 }}>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="stock.quantity" />
              </Typography>
              <TextField
                {...register("quantity")}
                defaultValue={row?.row?.original?.quantity}
              />
            </FormControl>
            <Typography sx={{ mb: 3, display: "flex" }} variant="h3">
              <FormattedMessage id="rewardsManagement.gainedPoints" />
              {fetchedCustomerData?.data?.reward &&
                watch("quantity") * (fetchedCustomerData?.data?.reward || 0)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flex: "col" }}>
            <Button
              sx={{ mx: 1, width: "100%", p: 1 }}
              variant="outlined"
              onClick={handleClose}
            >
              <Typography variant="h3">
                <FormattedMessage id="warehouse.cancel" />
              </Typography>
            </Button>
            <LoadingButton
              loading={loadingEdit}
              sx={{ mx: 1, width: "100%", p: 1 }}
              variant="contained"
              startIcon={<PublicIcon sx={{ mx: "4px" }} />}
              onClick={handleOpen}
              type="submit"
            >
              <Typography variant="h3">
                <FormattedMessage id="providers.apply" />
              </Typography>
            </LoadingButton>
          </Box>
        </form>
      </BasicModal>
    </>
  );
}
