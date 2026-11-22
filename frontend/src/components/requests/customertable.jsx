import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import moment from "moment";

import BasicModal from "../modals/basicModal";
import MainTable from "../../components/table";
import { useFetchedData } from "../../hooks/useFetchedData";
import { useLanguage } from "../../hooks/useLanguage";

import SearchIcon from "@mui/icons-material/Search";

export default function CustomerTable({
  open,
  handleClose,
  setCustomerSelectedData,
  customerSelectedData,
  dataUrl,
  row = {},
}) {
  const intl = useIntl();
  const storedPageSize = parseInt(sessionStorage.getItem("pageSize"), 10) || 10;

  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(1);
  const [search, setSearch] = useState("");
  const [typeUrl, setTypeUrl] = useState(dataUrl);
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(storedPageSize);

  const { locale } = useLanguage();

  const onCancel = () => {
    handleClose();
  };
console.log(typeUrl,"typeUrl")
  const [fetchedCustomerData, loading, getCustomerData] = useFetchedData(
    `/${typeUrl}?removeLanguage=true&page=${pageIndex + 1}&limit=${pageSize}`,
    !!typeUrl
  );

  const columns = React.useMemo(
    () =>
      [
        {
          accessorKey: "name",
          header: intl.formatMessage({ id: "warehouse.name" }),
        },
        typeUrl &&
          typeUrl == "customer" && {
            accessorKey: "bussinessName",
            header: intl.formatMessage({ id: "stock.businessName" }),
          },
        typeUrl &&
          typeUrl != "customer" && {
            accessorKey: "email",
            header: intl.formatMessage({ id: "warehouse.email" }),
          },
        typeUrl &&
          typeUrl == "customer" && {
            accessorKey: "city",
            header: intl.formatMessage({ id: "customer.city" }),
          },
        typeUrl &&
          typeUrl == "customer" && {
            accessorKey: "region",
            header: intl.formatMessage({ id: "customer.region" }),
          },
        {
          header: intl.formatMessage({ id: "driver.status" }),
          accessorKey: "statusName",
          cell: (row) => {
            return (
              <>
                <Typography
                  color={
                    row?.row?.original?.status?.id == 1 ? "#049A77" : "error"
                  }
                >
                  {row?.row?.original?.statusName}
                </Typography>
              </>
            );
          },
        },
      ].filter(Boolean),
    [
      typeUrl,
      dataUrl,
      fetchedCustomerData.data?.data,
      fetchedCustomerData.data?.data?.length,
    ]
  );
  useEffect(() => {
    setSearch("");
  }, [open]);

  useEffect(() => {
    dataUrl && setData([]);
    setTypeUrl(dataUrl);
  }, [dataUrl, row?.id]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      setData([]); // Reset the data before fetching

      let url = `${typeUrl}?removeLanguage=true&page=${
        pageIndex + 1
      }&limit=${pageSize}`;
      if (search?.length > 0) {
        url += `&name=${search}`;
      }

      if (typeUrl) {
        try {
          await getCustomerData(url); // Await the API call
        } catch (error) {
          console.error("Error fetching customer data:", error);
        }
      }
    };

    fetchCustomerData(); // Call the async function
  }, [pageIndex, search, typeUrl, pageSize, dataUrl, row?.id]);

  const mapData = (data) => {
    return (
      data?.data?.data?.map((item) => ({
        ...item,
        statusName: item?.status?.name,
        businessCategory: item?.category?.name,
        joiningDate: moment(item?.joinDate).format("Do MMM YY"),
        city: item?.region?.city?.name || "",
        region: item?.region?.name || "",
      })) || []
    ); // Return an empty array if data is undefined
  };

  useEffect(() => {
    if (fetchedCustomerData && fetchedCustomerData.data?.data?.length !== 0) {
      const newData = mapData(fetchedCustomerData, locale);
      console.log("🚀 ~ useEffect ~ newData:", newData)
      setData(newData);
    }
  }, [
    fetchedCustomerData.data?.data,
    fetchedCustomerData.data?.data?.length,
    locale,
    typeUrl,
    row?.id,
  ]);

  useEffect(() => {
    if (fetchedCustomerData && fetchedCustomerData.data?.totalCount !== 0) {
      setTotalCount(fetchedCustomerData.data?.totalCount);
    }
  }, [fetchedCustomerData.data?.totalCount]);

  return (
    <>
      <BasicModal
        width="90%"
        left="10%"
        right="10%"
        open={open}
        handleClose={onCancel}
        title={
          <Typography variant="h3">
            <FormattedMessage id="createRoute.select" />
          </Typography>
        }
      >
        <FormControl variant="standard" sx={{ mb: 2 }}>
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

        {!loading && (
          <Box sx={{ overflowX: "hidden" }}>
            <MainTable
              // sx={{ width: "800px" }}
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
              onRowSelectionChange={setCustomerSelectedData} // Handle row selection
              selectedRows={customerSelectedData}
              enableSelection={true}
            />
          </Box>
        )}
        <Button
          sx={{ m: 3, px: 2, py: 1 }}
          variant="contained"
          onClick={onCancel}
        >
          <Typography variant="h3">
            <FormattedMessage id="providers.reset" />
          </Typography>
        </Button>

        <Button
          sx={{ m: 3, px: 2, py: 1 }}
          variant="contained"
          onClick={handleClose}
        >
          <Typography variant="h3">
            <FormattedMessage id="createRoute.select" />
          </Typography>
        </Button>
      </BasicModal>
    </>
  );
}
