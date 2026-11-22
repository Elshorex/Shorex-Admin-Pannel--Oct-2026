import { useState } from "react";
import DatePicker from "react-multi-date-picker";
import { useLanguage } from "../../hooks/useLanguage";

import "./DatePicker.css";

export default function ResponsiveDateRangePickers({
  setValue,
  row,
  blockPastDates = false,
  position
}) {
  const [dates, setDates] = useState(
    row?.row?.original?.ranges[0] || row?.fromDate
      ? [
          row?.row?.original?.ranges[0]?.fromDate || row?.fromDate,
          row?.row?.original?.ranges[0]?.toDate || row?.toDate,
        ]
      : []
  );
  const { locale } = useLanguage();
  const today = new Date();

  return (
    <DatePicker
      style={{
        height: "40px",
        width: "95%",
        borderRadius: "10px",
        color: "#049A77",
        // display: "flex",
        zIndex: 2147483647, // Max possible z-index value
        position: "relative", // Ensure z-index works
        top: -1,
      }}
      value={dates}
      format={locale === "en" ? "MM/DD/YYYY" : "YYYY/MM/DD"}
      onChange={(dateObjects) => {
        if (Array.isArray(dateObjects) && dateObjects.length > 0) {
          const fromDate = new Date(dateObjects[0]); // Convert to JavaScript Date
          const toDate = new Date(dateObjects[1]); // Convert to JavaScript Date

          const durationInDays =
            Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

          setDates(dateObjects);

          setValue("ranges", [
            {
              fromDate: fromDate,
              toDate: toDate,
              duration: durationInDays,
            },
          ]);

          setValue("holidayYear", dateObjects[0]?.year);
        }
      }}
      range
      dateSeparator=" - "
      rangeHover
      calendarPosition={position}
     minDate={blockPastDates ? today : undefined} // Conditionally block past dates
    />
  );
}
