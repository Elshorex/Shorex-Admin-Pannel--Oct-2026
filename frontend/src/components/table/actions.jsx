import React from "react";
import Box from "@mui/material/Box";
import { Pagination } from "@mui/material";

const TablePaginationActions = (props) => {
  const { count, page, rowsPerPage, onPageChange, setPageIndex } = props;
  
  const handleBackButtonClick = () => {
    onPageChange(page - 1);
    setPageIndex(page - 1);
  };

  const handleNextButtonClick = () => {
    onPageChange(page + 1);
    setPageIndex(page + 1);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          mx: 5,
          direction:"ltr",
          ".MuiPagination-ul": {
            flexWrap: "nowrap",
          },
        }}
      >
        <Pagination
          count={Math.ceil(count / rowsPerPage)}
          page={page + 1}
          onChange={(event, value) => onPageChange(value - 1)}
          hidePrevButton
          hideNextButton
          color="primary"
        />
      </Box>
    </>
  );
};

export default TablePaginationActions;
