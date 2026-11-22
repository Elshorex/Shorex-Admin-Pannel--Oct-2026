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
import ExportButton from "../components/ExportButton";

import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import RewardsModal from "../components/modals/rewardModal";

export default function Rewards() {
  const { locale } = useLanguage();
  const intl = useIntl();
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "countryName",
        header: intl.formatMessage({ id: "rewards.country" }),
      },
      {
        accessorKey: "point",
        header: intl.formatMessage({ id: "rewards.points" }),
      },
      {
        accessorKey: "amount",
        header: intl.formatMessage({ id: "rewards.amount" }),
      },
      {
        accessorKey: "currency",
        header: intl.formatMessage({ id: "rewards.Currency" }),
      },
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
    `/reward-point?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `/reward-point?removeLanguage=true&all=true`
  );

  const getData = (url) => {
    getNewData(url);
    search.length === 0 && pageIndex === 0 && getDataExcelData();
  };

  const mapData = (data, locale) => {
    return data?.data?.data.map((item) => ({
      ...item,
      countryName: item.country.name[locale],
      countryId: item.country.id,
      currency: item.country.currency.name[locale],
      currencyId: item.country.currency.id,
    }));
  };

  useEffect(() => {
    setData([]);
    let url = `/reward-point?removeLanguage=true&page=${
      pageIndex + 1
    }&limit=${pageSize}`;
    search.length > 0 && (url += `&name=${search}`);
    getData(url);
  }, [pageIndex, search, pageSize]);

  useEffect(() => {
    if (fetchedData && fetchedData.data?.totalCount !== 0) {
      setTotalCount(fetchedData.data?.totalCount);
    }
  }, [fetchedData.data?.totalCount]);

  useEffect(() => {
    if (fetchedData && fetchedData.data?.data.length !== 0) {
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

  return (
    <Box
      sx={{
        width: "100%",
        p: "24px",
      }}
    >
      <RewardsModal
        open={openAddCountry}
        handleClose={handleCloseAddCountry}
        getData={getData}
        flag="add"
      />
      <RewardsModal
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
          <Typography variant="h2">
            <FormattedMessage id="rewards.rewards" />
          </Typography>
          <Button
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }} />}
            onClick={handleOpenAddCountry}
          >
            <Typography variant="h3">
              <FormattedMessage id="rewards.addReward" />
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
        {...{
          columns,
          pageIndex,
          setPageIndex,
          loading,
          totalCount,
          pageSize,
          setPageSize,
        }}
      />
    </Box>
  );
}
