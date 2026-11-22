import React, { useRef, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useIntl } from "react-intl";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LoopingChart = ({x_AxisArray , y_AxisArray }) => {
  const chartRef = useRef(null);
  const intl = useIntl();

  // Sample data: temperatures over a week
  const data = {
    labels: x_AxisArray ,
    datasets: [
      {
        label: intl.formatMessage({ id: "dashboard.totalCustomers" }),
        data: y_AxisArray ,
        fill: false,
        borderColor: "#049A77",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1, // Curved line
      },
    ],
  };

  // Chart options with looping animation
  const options = {
    animation: {
      loop: false, // Enables looping animation
    },
    plugins: {
      title: {
        display: true,
        text:  intl.formatMessage({ id: "dashboard.totalCustomers" }),
      },
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Start Y-axis at 0
        title: {
          display: true,
          // text: "Temperature (°C)", // Label for Y-axis
        },
      },
      // x: {
      //   title: {
      //     display: true,
      //     text:  intl.formatMessage({ id: "dashboard.monthsYear" }),
      //   },
      // },
    },
  };

  // Ensure chart updates and animation continues to loop
  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      chart.update();
    }
  }, []);

  return (
    <div>
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
};

export default LoopingChart;
