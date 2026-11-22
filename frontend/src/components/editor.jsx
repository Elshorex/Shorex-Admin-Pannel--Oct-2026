import React from "react";
import ReactQuill from "react-quill";
import { useIntl } from "react-intl";
import { Tooltip } from "@mui/material";

import "react-quill/dist/quill.snow.css";
import "../styles/editor.css";

const CustomToolbar = () => {
  const intl = useIntl();

  return (
    <div id="toolbar">
      <Tooltip title={intl.formatMessage({ id: "RTE.toolbar.header" })}>
        <select
          className="ql-header"
          defaultValue=""
          onChange={(e) => e.persist()}
        >
          <option value="1">Header 1</option>
          <option value="2">Header 2</option>
          <option value="3">Header 3</option>
          <option value="4">Header 4</option>
          <option value="5">Header 5</option>
          <option value="6">Header 6</option>
          <option value="">Normal</option>
        </select>
      </Tooltip>
      <Tooltip title={intl.formatMessage({ id: "RTE.toolbar.bold" })}>
        <button className="ql-bold"></button>
      </Tooltip>
      <Tooltip title={intl.formatMessage({ id: "RTE.toolbar.italic" })}>
        <button className="ql-italic"></button>
      </Tooltip>
      <Tooltip title={intl.formatMessage({ id: "RTE.toolbar.underline" })}>
        <button className="ql-underline"></button>
      </Tooltip>
      <Tooltip title={intl.formatMessage({ id: "RTE.toolbar.strike" })}>
        <button className="ql-strike"></button>
      </Tooltip>
      <Tooltip title={intl.formatMessage({ id: "RTE.toolbar.decreaseIndent" })}>
        <button className="ql-indent" value="-1"></button>
      </Tooltip>
      <Tooltip title={intl.formatMessage({ id: "RTE.toolbar.increaseIndent" })}>
        <button className="ql-indent" value="+1"></button>
      </Tooltip>
      <Tooltip title={intl.formatMessage({ id: "RTE.toolbar.orderedList" })}>
        <button className="ql-list" value="ordered"></button>
      </Tooltip>
      <Tooltip title={intl.formatMessage({ id: "RTE.toolbar.bulletList" })}>
        <button className="ql-list" value="bullet"></button>
      </Tooltip>
      <Tooltip title={intl.formatMessage({ id: "RTE.toolbar.rightToLeft" })}>
        <button className="ql-direction" value="rtl"></button>
      </Tooltip>
      <Tooltip title={intl.formatMessage({ id: "RTE.toolbar.link" })}>
        <button className="ql-link"></button>
      </Tooltip>
      <Tooltip title={intl.formatMessage({ id: "RTE.toolbar.image" })}>
        <button className="ql-image"></button>
      </Tooltip>
      <Tooltip title={intl.formatMessage({ id: "RTE.toolbar.video" })}>
        <button className="ql-video"></button>
      </Tooltip>
    </div>
  );
};

const modules = {
  toolbar: {
    container: "#toolbar",
  },
  clipboard: {
    matchVisual: false,
  },
};

const RichTextEditor = ({ editorContent, handleQuillTextChange }) => {
  const intl = useIntl();

  return (
    <>
      <CustomToolbar />
      <span className="editor__container">
        <ReactQuill
          onChange={handleQuillTextChange}
          value={editorContent}
          modules={modules}
          bounds={".app"}
          placeholder={intl.formatMessage({
            id: "RTE.toolbar.rte-placeholder",
          })}
          theme="snow"
        />
      </span>
    </>
  );
};

export default RichTextEditor;
