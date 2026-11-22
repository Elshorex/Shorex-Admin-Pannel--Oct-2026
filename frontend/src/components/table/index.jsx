import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Typography,
  Checkbox,
  IconButton,
} from "@mui/material";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FormattedMessage } from "react-intl";

import { ArrowUpward, ArrowDownward, UnfoldMore } from "@mui/icons-material"; // Import sorting icons
import { useLanguage } from "../../hooks/useLanguage";
import TablePaginationActions from "./actions";
import emptyStatus from "../../assets/svgs/emptyStatus.svg";
import PaginationDropdown from "./paginationDropdown";
import { useEffect } from "react";

function LocalTable({
  data,
  columns,
  handleRowClick,
  totalCount,
  pageIndex,
  setPageIndex,
  pageSize,
  setPageSize,
  onRowSelectionChange,
  enableSelection = false, // New prop to control row selection
  loading,
  selectedRows = [],
}) {
  const [rowSelection, setRowSelection] = React.useState(selectedRows); // State to manage row selection
  const [sorting, setSorting] = React.useState([]); // State to manage sorting
  // Table setup with sorting and optionally row selection enabled
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      rowSelection,
      sorting, // Integrate sorting state into the table
      pagination: { pageIndex, pageSize },
    },
    manualPagination: true, // Use external pagination
    onPaginationChange: (newPagination) => {
      setPageIndex(newPagination.pageIndex);
      setPageSize(newPagination.pageSize);
    },
    onRowSelectionChange: setRowSelection, // Update row selection state
    onSortingChange: setSorting, // Update sorting state
    enableRowSelection: enableSelection, // Enable row selection conditionally
    debugTable: true,
  });

  useEffect(() => {
    if (data?.length != 0 ) {
      const result = {};
      const selectedRowsData = data.forEach((rowId, index) => {
        if (Array.isArray(rowSelection)) {
          const dataIndex = rowSelection.findIndex(
            (item) => item === rowId?.id
          );
          result[index] = dataIndex !== -1 ? true : false; // Use the map index as the key
        }
      });
      setRowSelection(result);
    }
  }, [data?.length]);

  React.useEffect(() => {
    const selectedRowIds = Object.keys(rowSelection).filter(
      (key) => rowSelection[key]
    );
    const selectedRowsData = selectedRowIds.map(
      (rowId) => data[parseInt(rowId, pageSize)]
    );
    const selectedRowIdsArray = selectedRowsData?.map((row) => row?.id);
    data?.length != 0  &&  onRowSelectionChange?.(selectedRowIdsArray);
  }, [rowSelection, data?.length, data]);

  React.useEffect(() => {
    selectedRows?.length === 0 && setRowSelection([]);
  }, [selectedRows?.length, data]);

  const { locale } = useLanguage();
  const localeAr = locale === "ar";

  return (
    <Box>
      {data?.length > 0 && (
        <TableContainer component={Paper}>
          <Table aria-label="table with sorting and optional row selection">
            <TableHead sx={{ background: "#F2F3F2" }}>
              <TableRow>
                {enableSelection && (
                  <TableCell padding="checkbox">
                    {/* Select All Checkbox in Header */}
                    <Checkbox
                      indeterminate={table.getIsSomeRowsSelected()}
                      checked={table.getIsAllRowsSelected()}
                      onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                  </TableCell>
                )}
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <TableCell
                      key={header.id}
                      colSpan={header.colSpan}
                      sx={{
                        textAlign: localeAr ? "right" : "left",
                        whiteSpace: "nowrap", // Prevent text wrapping
                        overflow: "hidden", // Hide overflow text
                        textOverflow: "ellipsis", // Add ellipsis if the text is too long
                      }}
                    >
                      {/* Render column header with sorting */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          cursor: header.column.getCanSort()
                            ? "pointer"
                            : "default",
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder ? null : (
                          <Typography variant="h3" noWrap>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </Typography>
                        )}
                        {header.column.getCanSort() && (
                          <IconButton size="small">
                            {header.column.getIsSorted() === "asc" ? (
                              <ArrowUpward fontSize="inherit" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDownward fontSize="inherit" />
                            ) : (
                              <UnfoldMore fontSize="inherit" />
                            )}
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  ))
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {table.getRowModel().rows.map((row) => {
                const isSelected = row.getIsSelected();
                return (
                  <TableRow
                    key={row.id}
                    onClick={
                      handleRowClick
                        ? (e) => {
                            if (e.target.type !== "checkbox")
                              handleRowClick(row);
                          }
                        : null
                    }
                    sx={{
                      cursor: handleRowClick ? "pointer" : "default",
                      backgroundColor: isSelected ? "#D3F9D8" : "transparent",
                      "&:hover": {
                        background: "#E6F3EC",
                      },
                    }}
                  >
                    {enableSelection && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={row.getToggleSelectedHandler()}
                        />
                      </TableCell>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        sx={{ textAlign: localeAr ? "right" : "left" }}
                      >
                        <Typography variant="body1">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {!loading && data.length === 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <img alt="logo" src={emptyStatus} width={300} />
            <Typography sx={{ mb: 1, mx: 1 }} variant="h2">
              <FormattedMessage id="error.noData" />
            </Typography>
            {/* <Button
              type="submit"
              variant="contained"
              sx={{ mt: 3, width: "50%" }}
            >
              Reload
            </Button> */}
          </Box>
        </Box>
      )}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        {data?.length > 0 && (
          <PaginationDropdown
            pageSize={pageSize}
            setPageSize={setPageSize}
            setPageIndex={setPageIndex}
          />
        )}
        {totalCount > pageSize && (
          <TablePagination
            sx={{
              direction: "ltr",
              display: "flex",
              justifyContent: localeAr ? "flex-start" : "flex-end",
              "& .css-13jwc6y-MuiTablePagination-displayedRows": {
                display: "none",
              },
              "& .css-lzix6f-MuiButtonBase-root-MuiPaginationItem-root.Mui-selected":
                {
                  backgroundColor: "#646866",
                },
            }}
            rowsPerPageOptions={[{ label: pageSize, value: data.length }]}
            component="div"
            count={totalCount}
            rowsPerPage={pageSize}
            page={pageIndex}
            setPageIndex={setPageIndex}
            onPageChange={(page) => {
              setPageIndex(page);
            }}
            ActionsComponent={TablePaginationActions}
          />
        )}
      </Box>
    </Box>
  );
}

export default LocalTable;
