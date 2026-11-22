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
import { useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";

import { useLanguage } from "../hooks/useLanguage";
import { useFetchedData } from "../hooks/useFetchedData";
import { baseURL } from "../constants/api";
import BasicBreadcrumbs from "../components/BasicBreadcrumbs";
import MainTable from "../components/table";
import AddNewCountry from "../components/modals/addNewCountryModal";
import ExportButton from "../components/ExportButton";

import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";

export default function Countries() {
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const intl = useIntl();
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "countryName",
        header: intl.formatMessage({ id: "countries.countryName" }),
      },
      {
        accessorKey: "currency",
        header: intl.formatMessage({ id: "countries.currencyName" }),
      },
      {
        accessorKey: "currencySymbol",
        header: intl.formatMessage({ id: "countries.currencySymbol" }),
      },
      {
        accessorKey: "countryCode",
        header: intl.formatMessage({ id: "countries.telephonePrefix" }),
      },
      {
        accessorKey: "defaultLanguage",
        header: intl.formatMessage({ id: "countries.defaultLanguage" }),
      },
      // {
      //   accessorKey: "flag",
      //   header: intl.formatMessage({ id: "countries.flag" }),
      //   cell: (row) => (
      //     <>
      //       {row.row.original?.image && (
      //         <img
      //           style={styles.flag_img}
      //           src={baseURL + row.row.original?.image}
      //           alt="flag"
      //         />
      //       )}
      //     </>
      //   ),
      // },
      {
        cell: (row) => {
          return (
            <>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditCountry();
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

  const [data, setData] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [rowData, setRowData] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(1);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(storedPageSize);

  const [openAddCountry, setOpenAddCountry] = useState(false);
  const [openEditCountry, setOpenEditCountry] = useState(false);

  const handleOpenAddCountry = () => setOpenAddCountry(true);
  const handleCloseAddCountry = () => setOpenAddCountry(false);
  const handleOpenEditCountry = () => setOpenEditCountry(true);
  const handleCloseEditCountry = () => setOpenEditCountry(false);

  const [fetchedData, loading, getNewData] = useFetchedData(
    `/country?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `/country?removeLanguage=true&all=true`
  );

  const getData = (url) => {
    getNewData(url);
    search.length === 0 && pageIndex === 0 && getDataExcelData();
  };

  const mapData = (data, locale) => {
    return data?.data?.data.map((item) => ({
      ...item,
      countryName: item.name[locale],
      currency: item.currency.name[locale],
      currencyId: item.currency.id,
      defaultLanguageId: item.defaultLanguage.id,
      currencySymbol: item.currency.symbol,
      defaultLanguage: item.defaultLanguage.name[locale],
    }));
  };

  const handleRowClick = (row) => {
    navigate(`/cities/${row.original.id}`, {
      state: { countryId: row.original.id },
    });
  };

  useEffect(() => {
    setData([]);
    search.length > 0
      ? getData(
          `/country?name=${search}&removeLanguage=true&page=${
            pageIndex + 1
          }&limit=${pageSize}`
        )
      : getData(
          `/country?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
        );
  }, [pageIndex, search, pageSize]);

  useEffect(() => {
    if (fetchedData && fetchedData.data?.totalCount !== 0) {
      setTotalCount(fetchedData.data?.totalCount);
    }
  }, [fetchedData.data?.totalCount]);

  useEffect(() => {
    if (fetchedData && fetchedData.data?.data.length !== 0) {
      const newData = mapData(fetchedData, locale);      setData(newData);
    }
  }, [fetchedData, fetchedData.data?.data?.length, pageSize, locale]);

  useEffect(() => {
    if (allData && allData?.data?.data.length !== 0) {
      const newData = mapData(allData, locale);
      setExcelData(newData);
    }
  }, [allData, locale]);

  return (
    <Box
      sx={{
        width: "100%",
        p: "24px",
      }}
    >
      <AddNewCountry
        open={openAddCountry}
        handleClose={handleCloseAddCountry}
        getData={getData}
        flag="add"
      />
      <AddNewCountry
        open={openEditCountry}
        handleClose={handleCloseEditCountry}
        getData={getData}
        flag="edit"
        row={rowData}
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
          <BasicBreadcrumbs />
          <Button
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }} />}
            onClick={handleOpenAddCountry}
          >
            <Typography variant="h3">
              <FormattedMessage id="countries.addNewCountry" />
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
            noLastUselessColumns={2}
            // getDataExcelData={() => getDataExcelData()}
          />
        </Box>
      </Box>

      <MainTable
        data={data ? data : []}
        totalCount={totalCount}
        {...{
          columns,
          handleRowClick,
          pageIndex,
          setPageIndex,
          loading,
          pageSize,
          setPageSize,
        }}
      />
    </Box>
  );
}

const styles = {
  flag_img: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    margin: "0px 16px",
  },
};
