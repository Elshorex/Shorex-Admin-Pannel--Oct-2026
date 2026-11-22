import React, { useState, useEffect } from "react";
import {
  FormControl,
  Box,
  Typography,
  MenuItem,
  ListItemIcon,
  Select,
  TextField,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import moment from "moment";

import ResponsiveDateRangePickers from "../DatePicker/DatePicker";
import { usePostData } from "../../hooks/usePostData";
import { useLanguage } from "../../hooks/useLanguage";
import { usePutData } from "../../hooks/usePutData";
import BasicModal from "./basicModal";
import Required from "../required";
import UploadFlag from "../UploadFlag";

import PublicIcon from "@mui/icons-material/Public";
import { isValidDate } from "../utils/Helper";

export default function AddEditPromotions({
  open,
  handleClose,
  handleOpen,
  getData,
  flag,
  row = {},
  countriesData = {},
}) {
  const rowData = {
    ...row,
    toDate: row?.promotionFromDate,
    fromDate: row?.promotionToDate,
    image: row?.media,
  };

  const { locale } = useLanguage();
  const [imgLoading, setImgLoading] = useState();
  const [targetedCountry, setTargetedCountry] = useState(row?.country || {});

  const { register, handleSubmit, reset, formState, setValue, watch } =
    useForm();

  const [resultAdd, loadingAdd, SetAddRequest] = usePostData(
    "/promotion",
    {},
    null,
    "error"
  );

  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `promotion/${rowData?.id}`,
    {},
    null,
    "error"
  );

  useEffect(() => {
    setTargetedCountry(row?.country);
  }, [Object.keys(row)?.length && row?.id]);

  useEffect(() => {
    if (watch("country")) {
      const item = countriesData?.data?.data.find(
        (item) => item.id === watch("country")
      );
      setTargetedCountry(item);
    }
  }, [watch("country"), rowData?.country?.id]);

  const onSubmit = async (data) => {
    const bodyAdd = flag === "add" && {
      name: data?.name,
      country: data?.country,
      description: data?.description,
      media: data?.image,
      status: 1,
      // mediaType: "IMAGE",
      mediaType: data.mediaType,
      ...(isValidDate(data?.ranges?.[0]?.fromDate) && {
        promotionFromDate: moment(data?.ranges?.[0]?.fromDate).format("YYYY-MM-DD"),
      }),
      ...(isValidDate(data?.ranges?.[0]?.toDate) && {
        promotionToDate: moment(data?.ranges?.[0]?.toDate).format("YYYY-MM-DD"),
      }),
     
    };
    const bodyEdit = flag === "edit" && {
      name: data?.name,
      description: data?.description,
      media: data?.image,
      status: 1,
      // mediaType: "IMAGE",
      mediaType: data.mediaType,
      promotionFromDate: isValidDate(data?.ranges?.[0]?.fromDate)
        ? moment(data?.ranges?.[0]?.fromDate).format("YYYY-MM-DD")
        : "",
      promotionToDate: isValidDate(data?.ranges?.[0]?.toDate)
        ? moment(data?.ranges?.[0]?.toDate).format("YYYY-MM-DD")
        : "",
    };

    flag === "add"
      ? await SetAddRequest(bodyAdd)
      : await SetEditRequest(bodyEdit);
    onClose();
  };

  const onClose = () => {
    reset();
    handleClose();
    setTargetedCountry("");
  };

  useEffect(() => {
    if (resultAdd?.id || resultEdit?.promotion?.id) {
      getData();
      handleClose();
      reset();
      setTargetedCountry("");
    }
  }, [resultAdd?.id, resultEdit?.promotion?.id]);

  useEffect(() => {
    reset();
  }, [rowData?.rowData?.id, rowData?.rowData?.original?.updatedAt]);

  return (
    <>
      <BasicModal
        open={open}
        handleClose={onClose}
        title={
          flag === "add" ? (
            <FormattedMessage id="promotion.addNewPromotion" />
          ) : (
            <FormattedMessage id="promotion.editNewPromotion" />
          )
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl
            sx={{
              mt: 2,
              borderColor: "#B0D9C3",
            }}
            fullWidth
          >
            <Typography sx={{ mb: 1 }} variant="h3">
              <FormattedMessage id="rewards.country" />
            </Typography>
            <Select
              sx={{
                color: "#049A77",
                backgroundColor: "#ffffff",
                p: 2,
                border: "1px solid #B0D9C3",
              }}
              {...register("country")}
              defaultValue={rowData?.country?.id}
              disabled={flag === "edit"}
            >
              {Object.keys(countriesData)?.length !== 0 &&
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
          <Typography sx={{ mb: 1, mt: 1, display: "flex" }} variant="h3">
            <FormattedMessage id="countries.language" /> :{" "}
            {targetedCountry &&
              Object.keys(targetedCountry)?.length &&
              targetedCountry?.defaultLanguage?.name[locale]}
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 4,
            }}
          >
            <FormControl variant="standard" sx={{ width: "100%" }}>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="promotion.title" />
                <Required />
              </Typography>
              <TextField
                {...register("name", {
                  required: true,
                })}
                defaultValue={rowData?.name}
                error={formState.errors?.name?.type === "required"}
                helperText={
                  formState.errors?.name?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl>

            <FormControl variant="standard" sx={{ width: "100%" }}>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="promotion.description" />
                <Required />
              </Typography>
              <TextField
                {...register("description", {
                  required: true,
                })}
                defaultValue={rowData?.description}
                error={formState.errors?.description?.type === "required"}
                helperText={
                  formState.errors?.description?.type === "required" && (
                    <FormattedMessage id="error.requiredField" />
                  )
                }
              />
            </FormControl>
          </Box>

          <Box sx={{ mt: 4, display: "flex", width: "100%" }}>
            <FormControl variant="standard" fullWidth>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="warehouse.date" />
                {/* <Required /> */}
              </Typography>
              <ResponsiveDateRangePickers setValue={setValue} row={rowData} />
            </FormControl>
          </Box>

          <Box
            sx={{
              mb: 1,
              mt: 4,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ display: "flex" }} variant="h3">
              <FormattedMessage id="promotion.image" />
              <Required />
            </Typography>
            <UploadFlag
              {...{ imgLoading, setImgLoading, setValue }}
              currentImg={row?.media}
            />
          </Box>

          <LoadingButton
            loading={loadingEdit || loadingAdd}
            disabled={imgLoading}
            sx={{ m: 3, width: "90%", p: 1 }}
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }} />}
            onClick={handleClose}
            type="submit"
          >
            {flag === "add" ? (
              <Typography variant="h3">
                <FormattedMessage id="warehouse.create" />
              </Typography>
            ) : (
              <Typography variant="h3">
                <FormattedMessage id="warehouse.edit" />
              </Typography>
            )}
          </LoadingButton>
        </form>
      </BasicModal>
    </>
  );
}
