import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useIntl } from "react-intl";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardChart({ fetchedRequestData }) {
  const intl = useIntl();

  let data = [
    {
      label: intl.formatMessage({ id: "requestsManagement.future" }),
      value: fetchedRequestData?.data?.requestStatusGraph["future"],
      color: "#0F6BD2",
      cutout: "50%",
    },
    {
      label: intl.formatMessage({ id: "requestsManagement.history" }),
      value: fetchedRequestData?.data?.requestStatusGraph["history"],
      color: "#646866",
      cutout: "50%",
    },
    {
      label: intl.formatMessage({ id: "requestsManagement.inProgress" }),
      value: fetchedRequestData?.data?.requestStatusGraph["inprogress"],
      color: "#00B828",
      cutout: "50%",
    },
    {
      label: intl.formatMessage({ id: "requestsManagement.failed" }),
      value: fetchedRequestData?.data?.requestStatusGraph["failed"],
      color: "#F81313",
      cutout: "50%",
    },
  ];

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows custom width and height
    cutout: data.map((item) => item.cutout),
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: intl.formatMessage({ id: "dashboard.Requests/Status" }),
      },
    },
  };

  const finalData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        data: data.map((item) => Math.round(item.value)),
        backgroundColor: data.map((item) => item.color),
        borderColor: data.map((item) => item.color),
        borderWidth: 1,
        dataVisibility: new Array(data.length).fill(true),
      },
    ],
  };

  return (
    <div style={{ width: "100%", height: "200px" }}>
      <Doughnut data={finalData} options={options} />
    </div>
  );
}
