import { FormattedMessage } from "react-intl";

export const adminOptionsFilter = [
  { id: "myData", name: <FormattedMessage id="warehouse.myData" /> },
  { id: "allData", name: <FormattedMessage id="warehouse.allData" /> },
  { id: "certainProvider", name: <FormattedMessage id="warehouse.certainProvider" /> },
  { id: "allProviders", name: <FormattedMessage id="warehouse.allProviders" /> },
];

export const stockOptions = [
  { id: "all", label: "All" },
  { id: "hasStock", label: "Has Stock (+)" },
  { id: "emptyStock", label: "Empty (0)" },
];

export const assigningOptions = {
  driver: "Driver",
  vehicle: "Vehicle",
};


export const contactUsItem = 6;
export const privacy_id = 10;
export const terms_id= 11;