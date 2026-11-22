import { Button } from "@mui/material";
import { ExportAsExcel } from "react-export-table";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { FormattedMessage } from "react-intl";

export default function ExportButton(data, headers) {
  // console.log("🚀 ~ ExportButton ~ headers:", headers);
  // console.log("🚀 ~ ExportButton ~ data:", data);
  return (
    <ExportAsExcel data={data.data} headers={data.headers}>
      {(props) => (
        <Button
          variant="outlined"
          startIcon={<FileUploadIcon sx={{ ml: "16px" }} />}
          sx={{ height: "40px", padding: "0px 15px" }}
          {...props}
        >
          <FormattedMessage id="countries.export" />
        </Button>
      )}
    </ExportAsExcel>
  );
}
