import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormControl,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { FormattedMessage } from "react-intl";
import { LoadingButton } from "@mui/lab";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import { useFetchedData } from "../hooks/useFetchedData";
import { usePutData } from "../hooks/usePutData";
import { usePostData } from "../hooks/usePostData";
import RichTextEditor from "../components/editor";
import { useLanguage } from "../hooks/useLanguage";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Required from "../components/required";
import UploadFlag from "../components/UploadFlag";

export default function AddStepRecycle() {
  const { register, handleSubmit, setValue, getValues, formState, watch } =
    useForm();

  const navigate = useNavigate();
  const [editorContentEN, setEditorContentEN] = useState("");
  const [editorContentAR, setEditorContentAR] = useState("");
  const [editorContentES, setEditorContentES] = useState("");
  const [languageState, setLanguageState] = useState("en");

  const [editMode, setEditMode] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const location = useLocation();
  const recycleId = location?.state?.id || "";
  const { locale } = useLanguage();

  const [resultEdit, loadingEdit, SetEdit] = usePutData(
    `/recycle/${recycleId}`,
    {},
    null,
    "error"
  );

  const [resultAdd, loadingAdd, SetAdd] = usePostData(
    `/recycle`,
    {},
    null,
    "error"
  );

  const [fetchedData, loadingProducts, getDataProducts] = useFetchedData(
    `/recycle/${recycleId}?removeLanguage=true`,
    recycleId ? true : false
  );

  const handleQuillTextChange = (content, delta, source, editor) => {
    if (source === "user" && content && delta) {
      languageState == "en" && setEditorContentEN(content);
      languageState == "ar" && setEditorContentAR(content);
      languageState == "es" && setEditorContentES(content);
    }
  };

  useEffect(() => {
    fetchedData?.data?.description?.en &&
      setEditorContentEN(fetchedData?.data?.description?.en);
    fetchedData?.data?.description?.ar &&
      setEditorContentAR(fetchedData?.data?.description?.ar);
    fetchedData?.data?.description?.es &&
      setEditorContentES(fetchedData?.data?.description?.es);
  }, [fetchedData?.data && Object.keys(fetchedData?.data)?.length]);

  const onSubmit = async (data) => {
    const body = {
      ...data,
      description: {
        ...(editorContentEN && { en: editorContentEN }),
        ...(editorContentAR && { ar: editorContentAR }),
        ...(editorContentES && { es: editorContentES }),
      },
      status: 1,
    };
    recycleId ? await SetEdit(body) : await SetAdd(body);
    setEditMode(false);
    await getDataProducts();
  };

  useEffect(() => {
    if (resultAdd?.id || resultEdit?.id) {
      navigate("/recycleSteps");
    }
  }, [resultAdd, navigate, resultEdit]);

  return (
    <Box sx={{ m: 3 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            width: "100%",
            pb: "24px",
            display: "flex",
          }}
        >
          <Link to="/recycleSteps">
            <ArrowBackIosIcon
              fontSize="24px"
              sx={{ mt: "4px", mx: 1, scale: locale == "ar" && "-1" }}
            />
          </Link>
          <Typography variant="h2">
            <FormattedMessage id="requestsManagement.recycleSteps" />
          </Typography>
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
            <FormattedMessage id="products.image" />
            <Required />
          </Typography>
          <UploadFlag
            {...{ imgLoading, setImgLoading, setValue }}
            currentImg={fetchedData?.data?.image}
          />
        </Box>

        {
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography variant="h3">
                <FormattedMessage id="language.english" />
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {editMode && languageState == "en" ? (
                  <Box sx={{ display: "flex", flex: "col" }}>
                    <LoadingButton
                      loading={false}
                      sx={{ m: 1, px: 2 }}
                      variant="contained"
                      onClick={() => setEditMode(false)}
                      disabled={editorContentEN?.length === 0}
                      // type="submit"
                    >
                      <Typography variant="h3">
                        <FormattedMessage id="warehouse.save" />
                      </Typography>
                    </LoadingButton>
                    <Button
                      sx={{ m: 1, px: 1 }}
                      variant="outlined"
                      onClick={() => setEditMode(false)}
                    >
                      <Typography variant="h3">
                        <FormattedMessage id="warehouse.cancel" />
                      </Typography>
                    </Button>
                  </Box>
                ) : (
                  <Button
                    sx={{ mb: 2, width: "100px" }}
                    variant="outlined"
                    onClick={() => {
                      setLanguageState("en");
                      setEditMode(true);
                    }}
                  >
                    <Typography variant="h3">
                      <FormattedMessage id="providers.edit" />
                    </Typography>
                  </Button>
                )}

                {editMode && languageState == "en" ? (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <FormControl variant="standard" sx={{ width: "45%" }}>
                        <Typography
                          sx={{ mb: 1, display: "flex" }}
                          variant="h3"
                        >
                          <FormattedMessage id="promotion.description" />
                        </Typography>
                        <TextField
                          {...register("name.en", {
                            required: true,
                          })}
                          defaultValue={fetchedData?.data?.name?.en}
                          error={
                            formState.errors?.name?.en?.type === "required"
                          }
                          helperText={
                            formState.errors?.name?.en?.type === "required" && (
                              <FormattedMessage id="error.requiredField" />
                            )
                          }
                        />
                      </FormControl>
                    </Box>
                    <RichTextEditor
                      editorContent={editorContentEN}
                      handleQuillTextChange={handleQuillTextChange}
                    />
                  </>
                ) : (
                  <>
                    <Typography variant="h2">
                      ({watch("name.en") || fetchedData?.data?.name?.en})
                    </Typography>
                    <div
                      dangerouslySetInnerHTML={{ __html: editorContentEN }}
                    />
                  </>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        }

        {
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography variant="h3">
                <FormattedMessage id="language.arabic" />
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {editMode && languageState == "ar" ? (
                  <Box sx={{ display: "flex", flex: "col" }}>
                    <LoadingButton
                      loading={false}
                      sx={{ m: 1, px: 2 }}
                      variant="contained"
                      onClick={() => setEditMode(false)}
                      // type="submit"
                      // disabled
                    >
                      <Typography variant="h3">
                        <FormattedMessage id="warehouse.save" />
                      </Typography>
                    </LoadingButton>
                    <Button
                      sx={{ m: 1, px: 1 }}
                      variant="outlined"
                      onClick={() => setEditMode(false)}
                    >
                      <Typography variant="h3">
                        <FormattedMessage id="warehouse.cancel" />
                      </Typography>
                    </Button>
                  </Box>
                ) : (
                  <Button
                    sx={{ mb: 2, width: "100px" }}
                    variant="outlined"
                    onClick={() => {
                      setLanguageState("ar");
                      setEditMode(true);
                    }}
                  >
                    <Typography variant="h3">
                      <FormattedMessage id="providers.edit" />
                    </Typography>
                  </Button>
                )}

                {editMode && languageState == "ar" ? (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <FormControl variant="standard" sx={{ width: "45%" }}>
                        <Typography
                          sx={{ mb: 1, display: "flex" }}
                          variant="h3"
                        >
                          <FormattedMessage id="promotion.title" />
                        </Typography>
                        <TextField
                          {...register("name.ar", {
                            required: true,
                          })}
                          defaultValue={fetchedData?.data?.name?.ar}
                          error={
                            formState.errors?.name?.ar?.type === "required"
                          }
                          helperText={
                            formState.errors?.name?.ar?.type === "required" && (
                              <FormattedMessage id="error.requiredField" />
                            )
                          }
                        />
                      </FormControl>
                    </Box>
                    <RichTextEditor
                      editorContent={editorContentAR}
                      handleQuillTextChange={handleQuillTextChange}
                    />
                  </>
                ) : (
                  <>
                    <Typography variant="h2" sx={{ mb: 2 }}>
                      {/* <FormattedMessage id="promotion.title" /> ( */}(
                      {watch("name.ar") || fetchedData?.data?.name?.ar} )
                    </Typography>

                    <div
                      dangerouslySetInnerHTML={{ __html: editorContentAR }}
                    />
                  </>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        }
        {
          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Typography variant="h3">
                <FormattedMessage id="language.spanish" />
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {editMode && languageState == "es" ? (
                  <Box sx={{ display: "flex", flex: "col" }}>
                    <LoadingButton
                      loading={false}
                      sx={{ m: 1, px: 2 }}
                      variant="contained"
                      onClick={() => setEditMode(false)}
                      // type="submit"
                    >
                      <Typography variant="h3">
                        <FormattedMessage id="warehouse.save" />
                      </Typography>
                    </LoadingButton>
                    <Button
                      sx={{ m: 1, px: 1 }}
                      variant="outlined"
                      onClick={() => setEditMode(false)}
                    >
                      <Typography variant="h3">
                        <FormattedMessage id="warehouse.cancel" />
                      </Typography>
                    </Button>
                  </Box>
                ) : (
                  <Button
                    sx={{ mb: 2, width: "100px" }}
                    variant="outlined"
                    onClick={() => {
                      setLanguageState("es");
                      setEditMode(true);
                    }}
                  >
                    <Typography variant="h3">
                      <FormattedMessage id="providers.edit" />
                    </Typography>
                  </Button>
                )}

                {editMode && languageState == "es" ? (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <FormControl variant="standard" sx={{ width: "45%" }}>
                        <Typography
                          sx={{ mb: 1, display: "flex" }}
                          variant="h3"
                        >
                          <FormattedMessage id="promotion.title" />
                        </Typography>
                        <TextField
                          {...register("name.es", {
                            required: true,
                          })}
                          defaultValue={fetchedData?.data?.name?.es}
                          error={
                            formState.errors?.name?.es?.type === "required"
                          }
                          helperText={
                            formState.errors?.name?.es?.type === "required" && (
                              <FormattedMessage id="error.requiredField" />
                            )
                          }
                        />
                      </FormControl>
                    </Box>
                    <RichTextEditor
                      editorContent={editorContentES}
                      handleQuillTextChange={handleQuillTextChange}
                    />
                  </>
                ) : (
                  <>
                    {/* <FormattedMessage id="promotion.title" /> : */}
                    <Typography variant="h2">
                      ({watch("name.es") || fetchedData?.data?.name?.es})
                    </Typography>

                    <div
                      dangerouslySetInnerHTML={{ __html: editorContentES }}
                    />
                  </>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        }
        <Box sx={{ display: "flex", flex: "col" }}>
          <LoadingButton
            loading={false}
            sx={{ m: 1, px: 2 }}
            variant="contained"
            type="submit"
          >
            <Typography variant="h3">
              {recycleId ? (
                <FormattedMessage id="providers.edit" />
              ) : (
                <FormattedMessage id="warehouse.create" />
              )}
            </Typography>
          </LoadingButton>
          <Button
            sx={{ m: 1, px: 1 }}
            variant="outlined"
            onClick={() => navigate("/recycleSteps")}
          >
            <Typography variant="h3">
              <FormattedMessage id="warehouse.cancel" />
            </Typography>
          </Button>
        </Box>
      </form>
    </Box>
  );
}
