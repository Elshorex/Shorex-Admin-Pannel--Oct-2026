import React, { useEffect } from "react";
import {
  FormControl,
  Box,
  Typography,
  MenuItem,
  ListItemIcon,
  Select,
  TextField,
  Button,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";

import { useLanguage } from "../../hooks/useLanguage";
import { usePutData } from "../../hooks/usePutData";
import BasicModal from "./basicModal";
import { useFetchedData } from "../../hooks/useFetchedData";
import { useAuthState } from "../../context";

import PublicIcon from "@mui/icons-material/Public";

export default function EditProfile({
  open,
  handleClose,
  handleOpen,
  getData,
  row,
}) {
  const { locale } = useLanguage();
  const { userData } = useAuthState();
  const userId = userData?.id;

  const { register, handleSubmit } = useForm();

  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `/user/updateInfo`,
    {},
    null,
    "error"
  );

  const [countriesData, loadingCountry, getDataCountry] = useFetchedData(
    `/country?removeLanguage=true&all=true`
  );

  const onSubmit = async (data) => {
    const body = {
      ...data,
      userId: userId,
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
        title={<FormattedMessage id="profile.profile" />}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <FormControl variant="standard" sx={{ width: "100%", mb: 3 }}>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="driver.email" />
              </Typography>
              <TextField {...register("email")} defaultValue={row?.email} />
            </FormControl>

            <FormControl variant="standard" sx={{ width: "100%", mb: 3 }}>
              <Typography sx={{ mb: 1, display: "flex" }} variant="h3">
                <FormattedMessage id="driver.mobileNumber" />
              </Typography>
              <TextField {...register("phone")} defaultValue={row?.phone} />
            </FormControl>

            <FormControl
              sx={{
                margin: "0px 5px",
                borderColor: "#B0D9C3",
                mt: 1,
                mb: 2,
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
                  border: "0.1px solid #B0D9C3",
                }}
                {...register("country")}
                defaultValue={row?.country?.id}
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
                <FormattedMessage id="warehouse.edit" />
              </Typography>
            </LoadingButton>
          </Box>
        </form>
      </BasicModal>
    </>
  );
}
