import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
} from "chart.js";
import { Triangle } from "react-loader-spinner";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale
);

export default function MonthlyExpenseChart(props) {
  const [tempExpense, setTempExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dataChart, setDataChart] = useState(null);
  const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD hh:mm");
  const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD hh:mm");
  const currentDayFormat = dayjs().format("YYYY-MM-DD hh:mm");
  const currentMonth = dayjs().format("MMMM-YYYY");
  const maxDay = parseInt(dayjs().endOf("month").format("DD"));

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        type: "logarithmic",
        ticks: {
          callback: function (value, index, values) {
            //needed to change the scientific notation results from using logarithmic scale
            return Number(value?.toString()); //pass tick values as a string into Number function
          },
        },
      },
    },
  };

  let labels = [];
  let data = [];
  let data2 = [];

  function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }

  useEffect(() => {
    setLoading(true);
    let temp = 0;
    var map = {};
    var add = {};
    props.expenseList?.map((expense, i) => {
      if (
        dayjs(expense.created_date).format("YYYY-MM-DD hh:mm") >=
          startOfMonth &&
        dayjs(expense.created_date).format("YYYY-MM-DD hh:mm") <=
          currentDayFormat
      ) {
        labels.push(parseInt(dayjs(expense.created_date).format("DD")));
        if (expense.expense_type == "remove") {
          if (add[parseInt(dayjs(expense.created_date).format("DD"))] == null) {
            add[parseInt(dayjs(expense.created_date).format("DD"))] = 0;
          }
          if (map[parseInt(dayjs(expense.created_date).format("DD"))] != null) {
            map[parseInt(dayjs(expense.created_date).format("DD"))] -=
              expense.expense;
          } else {
            map[parseInt(dayjs(expense.created_date).format("DD"))] = 0;
            map[parseInt(dayjs(expense.created_date).format("DD"))] -=
              expense.expense;
          }
        } else {
          if (map[parseInt(dayjs(expense.created_date).format("DD"))] == null) {
            map[parseInt(dayjs(expense.created_date).format("DD"))] = 0;
          }
          if (add[parseInt(dayjs(expense.created_date).format("DD"))] != null) {
            add[parseInt(dayjs(expense.created_date).format("DD"))] +=
              expense.expense;
          } else {
            add[parseInt(dayjs(expense.created_date).format("DD"))] = 0;
            add[parseInt(dayjs(expense.created_date).format("DD"))] +=
              expense.expense;
          }
        }
      }
    });
    for (var key in map) {
      labels.push(parseInt(key));
      data.push(map[key]);
    }

    for (var key in add) {
      labels.push(parseInt(key));
      data2.push(add[key]);
    }

    labels = labels.filter(onlyUnique);
    labels = labels.sort(function (a, b) {
      return a - b;
    });

    setDataChart({
      labels: labels,
      datasets: [
        {
          label: currentMonth,
          data: data,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
        {
          label: "Earn",
          data: data2,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
      ],
    });
    setTempExpense(temp);
    setLoading(false);
  }, []);

  return (
    <>
      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <Triangle
            height="80"
            width="80"
            color="#4fa94d"
            ariaLabel="triangle-loading"
            wrapperStyle={{}}
            wrapperClassName=""
            visible={true}
          />
        </div>
      ) : (
        <>
          <Card
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "15px",
              backgroundColor: "#FFF",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flex: "1 0 auto" }}>
                <Typography
                  component="div"
                  variant="p"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="black"
                >
                  Monthly Expense Chart 📈
                </Typography>
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={1}
                >
                  <Line options={options} data={dataChart} />
                </Stack>
              </CardContent>
            </Box>
          </Card>
        </>
      )}
    </>
  );
}
