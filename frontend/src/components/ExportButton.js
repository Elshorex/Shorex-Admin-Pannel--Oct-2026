import { useState, useEffect } from "react";
import { Button, Typography } from "@mui/material";
import { ExportAsExcel } from "react-export-table";
import { FormattedMessage, useIntl } from "react-intl";

import FileUploadIcon from "@mui/icons-material/FileUpload";

export default function ExportButton({
  data,
  columns,
  noLastUselessColumns = 0,
  loadingExcelData = false,
}) {
  const [excelData, setExcelData] = useState([]);
  const intl = useIntl();

  function generateExcelData(data, columns) {
    const excelData = [];

    // Iterate through each row of data
    data?.length &&
      data?.forEach((row) => {
        const rowData = {};

        // Iterate through each column
        columns.forEach((column) => {
          const { accessorKey, header } = column;
          rowData[header] = row[accessorKey];
        });

        excelData.push(rowData);
      });

    return excelData;
  }

  const headers = columns
    .slice(0, -noLastUselessColumns)
    .map((item) => item.header);

  useEffect(() => {
    const excelData = generateExcelData(
      data,
      columns.slice(0, -noLastUselessColumns)
    );
    setExcelData(excelData);
  }, [data, columns, noLastUselessColumns]);

  return (
    <ExportAsExcel
      data={excelData}
      headers={headers}
      fileName={intl.formatMessage({
        id: "countries.report",
      })}
    >
      {(props) => (
        <Button
          disabled={loadingExcelData || excelData?.length === 0}
          variant="outlined"
          startIcon={<FileUploadIcon sx={{ mx: "4px" }} />}
          sx={{ height: "40px", padding: "0px 15px", textAlign:"center" }}
          {...props}
          // onClick={() => onClickExcel()}
        >
          <Typography variant="h3">
            <FormattedMessage id="countries.export" />
          </Typography>
        </Button>
      )}
    </ExportAsExcel>
  );
}
