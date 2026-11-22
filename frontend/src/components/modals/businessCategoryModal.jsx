import React, { useEffect } from "react";
import {
  Button,
  FormControl,
  Box,
  Typography,
  styled,
  alpha,
  InputBase,
  TextField,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useForm } from "react-hook-form";

import { usePostData } from "../../hooks/usePostData";
import { usePutData } from "../../hooks/usePutData";
import BasicModal from "./basicModal";

import PublicIcon from "@mui/icons-material/Public";

export default function BusinessCategoryModal({
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

  const { register, handleSubmit, reset, formState } = useForm();

  const [resultAdd, loadingAdd, SetAddRequest] = usePostData(
    "category",
    {},
    null,
    "error"
  );

  const [resultEdit, loadingEdit, SetEditRequest] = usePutData(
    `category/${row?.row?.original?.id}`,
    {},
    null,
    "error"
  );

  const onSubmit = async (data) => {
    const body = {
      ...data,
    };
    flag === "add" ? await SetAddRequest(body) : await SetEditRequest(body);
  };

  const onCancel = () => {
    reset();
    handleClose();
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
  }, [row?.row?.id, row?.row?.original?.updatedAt]);

  return (
    <>
      <BasicModal
        open={open}
        handleClose={onCancel}
        title={
          flag === "add" ? (
            <Typography variant="h3">
              <FormattedMessage id="businessCategories.addNewCategory" />
            </Typography>
          ) : (
            <Typography variant="h3">
              <FormattedMessage id="businessCategories.editCategory" />
            </Typography>
          )
        }
      >
        <form onSubmit={handleSubmit(onSubmit)}>
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
                  <Box
                    sx={{
                      display: "flex",
                      gap: "16px",
                      mt: 2,
                    }}
                  >
                    <FormControl variant="standard" sx={{ Width: "90%" }}>
                      <Typography sx={{ mb: 1 }} variant="label">
                        <FormattedMessage id="countries.language" /> {idx + 1}
                      </Typography>
                      <TextField
                        disabled={true}
                        // fullWidth
                        name="entryLanguage"
                        placeholder="entryLanguage"
                        type="text"
                        id="entryLanguage"
                        defaultValue={item?.language}
                      />
                    </FormControl>
                    <FormControl variant="standard">
                      <Typography sx={{ mb: "6px" }} variant="h3">
                        <FormattedMessage id="businessCategories.categoryName" />
                      </Typography>
                      <TextField
                        {...register(`name.${languages[idx]?.symbol}`, {
                          required: true,
                        })}
                        
                        defaultValue={
                          row?.row?.original?.name &&
                          Object.values(row?.row?.original?.name) &&
                          Object.values(row?.row?.original?.name)[idx]
                        }
                        error={
                          formState.errors.name?.[languages[idx]?.symbol]
                            ?.type === "required"
                        }
                        helperText={
                          formState.errors.name?.[languages[idx]?.symbol]
                            ?.type === "required" && (
                            <FormattedMessage id="error.requiredField" />
                          )
                        }
                      />
                    </FormControl>
                  </Box>
                </>
              );
            })}
          </Box>

          <Button
            sx={{ m: 3, width: "90%", p: 1 }}
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }}/>}
            onClick={handleOpen}
            type="submit"
          >
            {flag === "add" ? (
              <Typography variant="h3">
                <FormattedMessage id="businessCategories.addNewCategory" />
              </Typography>
            ) : (
              <Typography variant="h3">
                <FormattedMessage id="businessCategories.editCategory" />
              </Typography>
            )}
          </Button>
        </form>
      </BasicModal>
    </>
  );
}
