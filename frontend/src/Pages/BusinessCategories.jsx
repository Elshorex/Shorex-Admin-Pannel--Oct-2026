import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";

import { useLanguage } from "../hooks/useLanguage";
import { useFetchedData } from "../hooks/useFetchedData";
import MainTable from "../components/table";
import BusinessCategoryModal from "../components/modals/businessCategoryModal";
import ExportButton from "../components/ExportButton";

import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";

export default function BusinessCategories() {
  const { locale } = useLanguage();
  const intl = useIntl();
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const [data, setData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [openEditCategory, setOpenEditCategory] = useState(false);
  const [rowData, setRowData] = useState({});
  const [search, setSearch] = useState("");

  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(1);
  const [pageSize, setPageSize] = useState(storedPageSize);

  const handleOpenAddCategory = () => setOpenAddCategory(true);
  const handleCloseAddCategory = () => setOpenAddCategory(false);
  const handleOpenEditCategory = () => setOpenEditCategory(true);
  const handleCloseEditCategory = () => setOpenEditCategory(false);

  const [fetchedData, loading, getNewData] = useFetchedData(
    `/category?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `/category?removeLanguage=true&all=true`
  );

  const getData = (url) => {
    getNewData(url);
    search.length === 0 && pageIndex === 0 && getDataExcelData();
  };

  const mapData = (data, locale) => {
    return data?.data?.data.map((item) => ({
      ...item,
      categoryName: item.name[locale],
    }));
  };

  useEffect(() => {
    search.length > 0
      ? getData(
          `/category?name=${search}&removeLanguage=true&page=${
            pageIndex + 1
          }&limit=${pageSize}`
        )
      : getData(`/category?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`);
  }, [pageIndex, search, pageSize]);

  useEffect(() => {
    if (fetchedData && fetchedData.data?.totalCount !== 0) {
      setTotalCount(fetchedData.data?.totalCount);
    }
  }, [fetchedData.data?.totalCount]);

  useEffect(() => {
    if (fetchedData && fetchedData?.data?.data.length !== 0) {
      const newData = mapData(fetchedData, locale);
      setData(newData);
    }
  }, [fetchedData,fetchedData.data?.data?.length ,pageSize, locale]);

  useEffect(() => {
    if (allData && allData?.data?.data.length !== 0) {
      const newData = mapData(allData, locale);
      setExcelData(newData);
    }
  }, [allData, locale]);
  const columns = React.useMemo(
    () => [
      {
        accessorKey: "categoryName",
        header: intl.formatMessage({
          id: "businessCategories.categoryName",
        }),
      },
      {
        cell: (row) => {
          return (
            <>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditCategory();
                  // console.log(row, 'ROW');
                  setRowData(row);
                }}
              >
                <EditIcon
                  sx={{
                    fontSize: 20,
                  }}
                />
              </Button>
            </>
          );
        },
        id: "action",
      },
    ],
    []
  );

  return (
    <Box
      sx={{
        width: "100%",
        p: "24px",
      }}
    >
      <BusinessCategoryModal
        open={openEditCategory}
        handleClose={handleCloseEditCategory}
        getData={getData}
        flag="edit"
        row={rowData}
      />
      <BusinessCategoryModal
        open={openAddCategory}
        handleClose={handleCloseAddCategory}
        getData={getData}
        flag="add"
      />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            pb: "24px",
          }}
        >
          <Typography variant="h2">
            <FormattedMessage id="businessCategories.businessCategories" />
          </Typography>
          <Button
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }} />}
            onClick={handleOpenAddCategory}
          >
            <Typography variant="h3">
              <FormattedMessage id="businessCategories.addNewCategory" />
            </Typography>
          </Button>
        </Box>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", pb: "32px" }}
        >
          <FormControl variant="standard">
            <OutlinedInput
              id="input-with-icon-adornment"
              placeholder={intl.formatMessage({ id: "countries.search" })}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(0);
              }}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
            />
          </FormControl>
          {loading && <CircularProgress />}

          <ExportButton
            loadingExcelData={loadingExcelData}
            data={excelData ? excelData : []}
            columns={columns ? columns : []}
            noLastUselessColumns={1}
          />
        </Box>
      </Box>

      <MainTable
        data={data ? data : []}
        totalCount={totalCount}
        {...{ columns, pageIndex, setPageIndex, pageSize, setPageSize }}
      />
    </Box>
  );
}
