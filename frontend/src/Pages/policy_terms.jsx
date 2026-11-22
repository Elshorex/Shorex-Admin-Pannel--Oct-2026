import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { FormattedMessage } from "react-intl";
import { LoadingButton } from "@mui/lab";
import { useLocation } from "react-router-dom";

import { useFetchedData } from "../hooks/useFetchedData";
import { usePutData } from "../hooks/usePutData";
import RichTextEditor from "../components/editor";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function PrivacyPolicy() {
  const [editorContentEN, setEditorContentEN] = useState("");
  const [editorContentAR, setEditorContentAR] = useState("");
  const [editorContentES, setEditorContentES] = useState("");

  const [editorContentENLength, setEditorContentENLength] = useState(0);
  const [editorContentARLength, setEditorContentARLength] = useState(0);
  const [editorContentESLength, setEditorContentESLength] = useState(0);
  const [fetchedData, setFetchedData] = useState([]);
  const [languageState, setLanguageState] = useState("en");

  const [editMode, setEditMode] = useState(false);
  const location = useLocation();
  const isPolicyPage = location.pathname == "/policy";

  const [resultAdd, loadingAdd, SetAddPolicyRequest] = usePutData(
    `/privacy-conditions/${fetchedData?.id}?type=${
      isPolicyPage ? "PRIVACY_POLICY" : "TERMS_CONDITION"
    }`,
    {},
    null,
    "error"
  );

  const [fetchedAllData, loadingProducts, getDataProducts] = useFetchedData(
    `/privacy-conditions?removeLanguage=true&type=${
      isPolicyPage ? "PRIVACY_POLICY" : "TERMS_CONDITION"
    }`
  );

  useEffect(() => {
    setFetchedData([]);
    getDataProducts();
  }, [location.pathname]);

  useEffect(() => {
    setFetchedData(fetchedAllData?.data?.data[0]);
  }, [
    fetchedAllData && Object.keys(fetchedAllData)?.length,
    location.pathname,
    fetchedAllData?.data?.data[0]?.id,
  ]);

  const handleQuillTextChange = (content, delta, source, editor) => {
    if (source === "user" && content && delta) {
      if (languageState === "en") {
        setEditorContentEN(content);
        setEditorContentENLength(editor.getLength());
      } else if (languageState === "ar") {
        setEditorContentAR(content);
        setEditorContentARLength(editor.getLength());
      } else if (languageState === "es") {
        setEditorContentES(content);
        setEditorContentESLength(editor.getLength());
      }
    }
  };

  useEffect(() => {
    fetchedData?.description?.en &&
      setEditorContentEN(fetchedData?.description?.en);
    fetchedData?.description?.ar &&
      setEditorContentAR(fetchedData?.description?.ar);
    fetchedData?.description?.es &&
      setEditorContentES(fetchedData?.description?.es);
  }, [
    fetchedData && Object.keys(fetchedData)?.length,
    location.pathname,
    fetchedData?.data?.data[0]?.id,
  ]);

  const onSubmit = async (data) => {
    const body = {
      ...data,
      description: {
        ...(editorContentEN && { en: editorContentEN }),
        ...(editorContentAR && { ar: editorContentAR }),
        ...(editorContentES && { es: editorContentES }),
      },
      type: isPolicyPage ? "PRIVACY_POLICY" : "TERMS_CONDITION",
      status: 1,
    };
    await SetAddPolicyRequest(body);
    setEditMode(false);
    await getDataProducts();
  };

  return (
    <Box sx={{ m: 3 }}>
      {loadingProducts && <CircularProgress />}
      {!loadingProducts && (
        <>
          <Box
            sx={{
              width: "100%",
              pb: "24px",
            }}
          >
            {isPolicyPage ? (
              <Typography variant="h2">
                <FormattedMessage id="policy.policy" />
              </Typography>
            ) : (
              <Typography variant="h2">
                <FormattedMessage id="terms.terms" />
              </Typography>
            )}
          </Box>
          {fetchedData?.description?.en && (
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
                        onClick={() => onSubmit()}
                        disabled={editorContentENLength === 0}
                      >
                        <Typography variant="h3">
                          <FormattedMessage id="warehouse.create" />
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
                    <RichTextEditor
                      editorContent={editorContentEN}
                      handleQuillTextChange={handleQuillTextChange}
                    />
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{ __html: editorContentEN }}
                    />
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
          {fetchedData?.description?.ar && (
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
                        onClick={() => onSubmit()}
                        disabled={editorContentARLength === 0}
                      >
                        <Typography variant="h3">
                          <FormattedMessage id="warehouse.create" />
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
                    <RichTextEditor
                      editorContent={editorContentAR}
                      handleQuillTextChange={handleQuillTextChange}
                    />
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{ __html: editorContentAR }}
                    />
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
          {fetchedData?.description?.es && (
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
                        onClick={() => onSubmit()}
                        disabled={editorContentESLength === 0}
                      >
                        <Typography variant="h3">
                          <FormattedMessage id="warehouse.create" />
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
                    <RichTextEditor
                      editorContent={editorContentES}
                      handleQuillTextChange={handleQuillTextChange}
                    />
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{ __html: editorContentES }}
                    />
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
        </>
      )}
    </Box>
  );
}
