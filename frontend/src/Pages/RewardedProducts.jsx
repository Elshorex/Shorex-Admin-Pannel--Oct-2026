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
import { useDeleteData } from "../hooks/useDeleteData";
import { baseURL } from "../constants/api";
import MainTable from "../components/table";
import ExportButton from "../components/ExportButton";
import AddEditProduct from "../components/modals/Add_EditProduct";
import WarningMessage from "../components/modals/warning_message";

import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function RewardedProducts() {
  const { locale } = useLanguage();
  const intl = useIntl();
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "productName",
        header: intl.formatMessage({ id: "products.productName" }),
      },
      {
        accessorKey: "countryName",
        header: intl.formatMessage({ id: "products.countryName" }),
      },
      {
        accessorKey: "points",
        header: intl.formatMessage({ id: "products.points" }),
      },
     
      {
        cell: (row) => {
          return (
            <>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditProduct();
                  setRowData(row);
                }}
              >
                <EditIcon
                  sx={{
                    fontSize: 20,
                  }}
                />
              </Button>
              <Button
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setRowData(row);
                  setOpenWarningDeleteProduct(true);
                }}
              >
                <DeleteIcon
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

  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [openEditProduct, setOpenEditProduct] = useState(false);
  const [openWarningDeleteProduct, setOpenWarningDeleteProduct] = useState(false);

  const [deleteData, loadingDeleteProduct, deleteRow] = useDeleteData(
    `/reward-products/${rowData?.row?.original?.id}`
  );

  const [fetchedCountries, loadingCountries, getDataCountries] = useFetchedData(
      "/country?removeLanguage=true&all=true"
  );

  const handleOpenAddProduct = () => setOpenAddProduct(true);
  const handleCloseAddProduct = () => setOpenAddProduct(false);
  const handleOpenEditProduct = () => setOpenEditProduct(true);
  const handleCloseEditProduct = () => setOpenEditProduct(false);

  const [fetchedData, loading, getNewData] = useFetchedData(
    `/reward-products?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`
  );

  const [allData, loadingExcelData, getDataExcelData] = useFetchedData(
    `/reward-products?removeLanguage=true&all=true`
  );
  const getData = (url) => {
    getNewData(url);
    search.length === 0 && pageIndex === 0 && getDataExcelData();
  };

  useEffect(() => {
    const fetchData = async () => {
      if (Object.keys(deleteData).length > 0) {
        setOpenWarningDeleteProduct(false);
        await getData(`/reward-products?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`);
      }
    };

    fetchData();
  }, [Object.keys(deleteData).length]);

  const mapData = (data, locale) => {
    return data?.data?.data?.map((item) => ({
      ...item,
      productName: item?.name[locale],
      countryName : item?.country?.name[locale] || "N/A",
      // productQuantityQuestion: item?.quantityQuestion[locale],
    }));
  };

  useEffect(() => {
    setData([]);
    search.length > 0
      ? getData(
          `/reward-products?name=${search}&removeLanguage=true&page=${
            pageIndex + 1
          }&limit=${pageSize}`
        )
      : getData(`/reward-products?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`);
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
      <AddEditProduct
        open={openAddProduct}
        handleClose={handleCloseAddProduct}
        getData={getData}
        flag="add"
        page='reward-products'
        countriesData={fetchedCountries}
      />

      <AddEditProduct
        open={openEditProduct}
        handleClose={handleCloseEditProduct}
        getData={getData}
        flag="edit"
        page='reward-products'
        row={rowData}
        countriesData={fetchedCountries}
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
            <FormattedMessage id="rewardProducts.rewardProducts" />
          </Typography>
          <Button
            variant="contained"
            startIcon={<PublicIcon sx={{ mx: "4px" }} />}
            onClick={handleOpenAddProduct}
          >
            <Typography variant="h3">
              <FormattedMessage id="rewardProducts.addProduct" />
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
          {(loading || loadingDeleteProduct) && <CircularProgress />}

          <ExportButton
            loadingExcelData={loadingExcelData}
            data={excelData ? excelData : []}
            columns={columns ? columns : []}
            noLastUselessColumns={2}
          />
        </Box>
      </Box>

      <MainTable
        data={data ? data : []}
        totalCount={totalCount}
        {...{
          columns,
          pageIndex,
          setPageIndex,
          loading,
          pageSize,
          setPageSize,
        }}
      />

      <WarningMessage
        open={openWarningDeleteProduct}
        handleClose={() => setOpenWarningDeleteProduct(false)}
        message={intl.formatMessage({
          id: "products.warningDeleteProduct",
        })}
        buttonName={intl.formatMessage({
          id: "warehouse.delete",
        })}
        buttonFunction={deleteRow}
      />
    </Box>
  );
}

const styles = {
  img: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    margin: "0px 16px",
  },
};
