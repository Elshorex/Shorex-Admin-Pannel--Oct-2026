import React, { useEffect, useState } from "react";
import {
  FormControl,
  Box,
  Typography,
  MenuItem,
  ListItemIcon,
  Select,
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  Button,
  TextareaAutosize,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import PublicIcon from "@mui/icons-material/Public";

import { usePostData } from "../../hooks/usePostData";
import { usePutData } from "../../hooks/usePutData";
import BasicModal from "./basicModal";
import UploadFlag from "../UploadFlag";
import Required from "../required";
import moment from "moment";
import CustomerTable from "../requests/customertable";

export default function Add_edit_notification({
  open,
  handleClose,
  handleOpen,
  getData,
  flag,
  row = {},
}) {
  const languages = [
    { symbol: "ar", language: "العربية" },
    { symbol: "en", language: "English" },
    { symbol: "es", language: "Spanish" },
  ];

  const Groups = [
    { id: 0, name: "Clients", type: "CLIENT", value: "customer" },
    { id: 1, name: "Storekeepers", type: "STORE_KEEPER", value: "storekeeper" },
    { id: 2, name: "Drivers", type: "DRIVER", value: "driver" },
  ];

  const [imgLoading, setImgLoading] = useState();
  const { register, handleSubmit, reset, formState, setValue, watch } =
    useForm();
  const [userType, setUserType] = useState(Groups[watch("userType")]?.value);
  const [radioValue, setRadioValue] = React.useState(
    row?.notificationType || "GROUP"
  );
  const [openModal, setOpenModal] = useState(false);
  const [customerSelectedData, setCustomerSelectedData] = useState(
    row?.users ? row?.users : []
  );

  const [resultAdd, loadingAdd, SetAddRequest] = usePostData(
    "/notification",
    {},
    null,
    "error"
  );

  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `/notification/${row?.id}`,
    {},
    null,
    "error"
  );

  // useEffect(() => {
  //   row?.users
  //     ? setCustomerSelectedData(row?.users)
  //     : setCustomerSelectedData([]);
  // }, [open]);
  useEffect(() => {
  const users = row?.users?.filter(user => user !== null) || [];
  setCustomerSelectedData(users);
}, [open]);

  useEffect(() => {
    flag === "add" && setCustomerSelectedData([]);
  }, [watch("userType"), flag]);

  useEffect(() => {
    //set the data of row in editing
    setCustomerSelectedData(row?.users);
    setRadioValue(row?.notificationType);
  }, [row?.users, row?.notificationType]);

  // const onSubmit = async (data) => {
  //   const body = {
  //     ...data,
  //     notificationType: radioValue,
  //     ...(customerSelectedData?.length ? { users: customerSelectedData } : {}),
  //     ...(flag === "add"
  //       ? { sendDate: moment(new Date()).format("YYYY-MM-DD") }
  //       : {}),
  //     userType: Groups[watch("userType")]?.type,
  //   };
  //   flag === "add" ? await SetAddRequest(body) : await SetEditRequest(body);
  // };

  const onSubmit = async (data) => {
  // Filter out null values from customerSelectedData
  const filteredUsers = customerSelectedData?.filter(user => user !== null) || [];
  
  const body = {
    ...data,
    notificationType: radioValue,
    ...(filteredUsers?.length ? { users: filteredUsers } : {}),
    ...(flag === "add"
      ? { sendDate: moment(new Date()).format("YYYY-MM-DD") }
      : {}),
    userType: Groups[watch("userType")]?.type,
  };
  flag === "add" ? await SetAddRequest(body) : await SetEditRequest(body);
};

  const onClose = () => {
    reset();
    handleClose();
    setValue("userType", "");
  };

  useEffect(() => {
    if (resultAdd?.id || resultEdit?.id) {
      getData();
      handleClose();
      reset();
    }
  }, [resultAdd, resultEdit]);

  useEffect(() => {
    reset();
  }, [row?.row?.id, row?.updatedAt]);

  useEffect(() => {
    setUserType(Groups[Groups.find((group) => group.type === row?.userType)?.id]?.value);
  }, [row?.userType, watch("userType")]);

  const handleChangeRadio = (event) => {
    setRadioValue(event.target.value);
  };

  return (
    <>
      <BasicModal
        open={open}
        handleClose={onClose}
        title={
          flag === "add" ? (
            <FormattedMessage id="notifications.addNotification" />
          ) : (
            <FormattedMessage id="notifications.editNotification" />
          )
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              px: 2,
              py: 1,
              border: 1,
              borderColor: "#D7D7D7",
              borderRadius: "7px",
              my: "24px",
            }}
          >
            <FormControl>
              <RadioGroup
                sx={{ display: "flex", mb: 2 }}
                row
                value={radioValue}
                defaultValue={row?.notificationType}
                onChange={handleChangeRadio}
              >
                <FormControlLabel
                  value="GROUP"
                  control={<Radio />}
                  label={<FormattedMessage id="notifications.group" />}
                  disabled={flag !== "add"}
                />
                <FormControlLabel
                  value="SINGLE_USER"
                  control={<Radio />}
                  label={<FormattedMessage id="notifications.singleUser" />}
                  disabled={flag !== "add"}
                />
              </RadioGroup>
            </FormControl>

            <FormControl
              sx={{
                margin: "0px 5px",
                borderColor: "#B0D9C3",
              }}
              fullWidth
            >
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="notifications.selectGroup" />
                <Required />
              </Typography>
              <Select
                sx={{
                  color: "#049A77",
                  backgroundColor: "#ffffff",
                  p: 2,
                  border: "0.1px solid #B0D9C3",
                }}
                {...register("userType", {
                  required: true,
                })}
                defaultValue={Groups.find((group) => group.type === row?.userType)?.id}
                error={formState.errors.userType?.type === "required"}
                onChange={() => setCustomerSelectedData([])}
              >
                {Groups.map((item) => (
                  <MenuItem value={item.id}>
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
              {/* {formState.errors.userType?.type === "required" && (
                <FormHelperText sx={{ color: "error.main" }}>
                  <FormattedMessage id="error.requiredField" />
                </FormHelperText>
              )} */}
            </FormControl>
            {radioValue === "SINGLE_USER" && (
              <FormControl
                sx={{
                  margin: "8px 5px",
                  borderColor: "#B0D9C3",
                }}
                fullWidth
              >
                <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                  <FormattedMessage id="notifications.selectUser" /> (
                  {customerSelectedData?.length})
                  <Required />
                </Typography>
                <Button
                  sx={{}}
                  variant="contained"
                  onClick={() => {
                    // setUserType(
                    //   Groups[
                    //     Groups.find((group) => group.type === row?.userType)?.id
                    //   ]?.value
                    // );
                    // setOpenModal(true);
                    if (flag === "add") {
                      const g = Groups[watch("userType")];
                      setUserType(g?.value);
                    } else {
                      const g = Groups.find((group) => group.type === row?.userType);
                      setUserType(g?.value);
                    }
                    setOpenModal(true);
                    }}
                >
                  <Typography variant="h3">
                    <FormattedMessage id="notifications.selectUser" />{" "}
                    {/* {Groups[watch("userType")]?.name} */}
                  </Typography>
                </Button>
                <CustomerTable
                  open={openModal}
                  handleClose={() => setOpenModal(false)}
                  setCustomerSelectedData={setCustomerSelectedData}
                  customerSelectedData={customerSelectedData}
                  dataUrl={userType}
                  row = {row}
                />
              </FormControl>
            )}
          </Box>

          <Box
            sx={{
              border: 1,
              borderColor: "#D7D7D7",
              borderRadius: "7px",
              display: "flex",
              flexDirection: "column",
              p: 2,
            }}
          >
            <Typography sx={{ color: "info.main" }} variant="h3">
              <FormattedMessage id="countries.addAllLanguages" />
            </Typography>
            {languages?.map((item, idx) => {
              return (
                <>
                  <Typography sx={{ mb: 1, mt: 2 }} variant="label">
                    {item?.language}{" "}
                    <FormattedMessage id="countries.language" />
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: "16px",
                      flexDirection: "column",
                    }}
                  >
                    <FormControl variant="standard" sx={{ Width: "90%" }}>
                      <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                        <FormattedMessage id="notifications.notificationTitle" />
                        <Required />
                      </Typography>
                      <TextField
                        name="entryLanguage"
                        type="text"
                        {...register(`title.${languages[idx]?.symbol}`, {
                          required: true,
                        })}
                        defaultValue={
                          row?.title &&
                          Object.values(row?.title) &&
                          Object.values(row?.title)[idx]
                        }
                        error={
                          formState.errors.title?.[languages[idx]?.symbol]
                            ?.type === "required"
                        }
                        helperText={
                          formState.errors.title?.[languages[idx]?.symbol]
                            ?.type === "required" && (
                            <FormattedMessage id="error.requiredField" />
                          )
                        }
                      />
                    </FormControl>
                    <FormControl variant="standard">
                      <Typography
                        sx={{ mb: "6px", display: "flex" }}
                        variant="h3"
                      >
                        <FormattedMessage id="warehouse.notes" />
                        <Required />
                      </Typography>
                      <TextareaAutosize
                        style={{
                          borderRadius: "8px",
                          borderColor: "rgba(0, 0, 0, 0.38)",
                          padding: "12px 8px",
                          outlineColor: "#8ECCE1",
                          // color: disabledState ? "rgb(170, 170, 170)" : "inherit",
                        }}
                        {...register(`description.${languages[idx]?.symbol}`, {
                          required: true,
                        })}
                        defaultValue={
                          row?.description &&
                          Object.values(row?.description) &&
                          Object.values(row?.description)[idx]
                        }
                        error={
                          formState.errors.description?.[languages[idx]?.symbol]
                            ?.type === "required"
                        }
                        helperText={
                          formState.errors.description?.[languages[idx]?.symbol]
                            ?.type === "required" && (
                            <FormattedMessage id="error.requiredField" />
                          )
                        }
                        value={
                          watch(`description.${languages[idx]?.symbol}`) || ""
                        }
                        onChange={(e) =>
                          setValue(
                            `description.${languages[idx]?.symbol}`,
                            e.target.value
                          )
                        }
                        rows={4}
                      />
                    </FormControl>
                  </Box>
                </>
              );
            })}
          </Box>

          <Box
            sx={{
              px: 2,
              py: 1,
              border: 1,
              borderColor: "#D7D7D7",
              borderRadius: "7px",
              mt: "24px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography variant="h3">
                <FormattedMessage id="products.image" />
              </Typography>
              <UploadFlag
                {...{ imgLoading, setImgLoading, setValue }}
                currentImg={row?.image}
              />
            </Box>
          </Box>

          <LoadingButton
            loading={loadingEdit || loadingAdd}
            disabled={imgLoading}
            sx={{ m: 3, width: "90%", p: 1 }}
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }} />}
            onClick={handleOpen}
            type="submit"
          >
            {flag === "add" ? (
              <Typography variant="h3">
                <FormattedMessage id="notifications.addNotification" />
              </Typography>
            ) : (
              <Typography variant="h3">
                <FormattedMessage id="notifications.editNotification" />
              </Typography>
            )}
          </LoadingButton>
        </form>
      </BasicModal>
    </>
  );
}
