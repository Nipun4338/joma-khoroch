import { TextField, Typography, useMediaQuery } from "@mui/material";
import { useState } from "react";
import axios from "axios";

export default function Balance(props) {
  const balanceTextColor = ["red", "green"];
  const [balance, setBalance] = useState(props.balance);
  const [showInputBalance, setShowInputBalance] = useState(
    props.setshowInputBalance
  );
  const matches = useMediaQuery("(max-width:600px)");

  const handleBalanceClick = () => {
    matches ? setShowInputBalance(true) : null;
  };

  const balanceUpdate = async () => {
    let data = {
      balance: balance,
    };
    await axios
      .post("/api/updatebalance", data)
      .then(async (response) => {})
      .catch((e) => {});
  };

  const handleChange = (data) => {
    setBalance(data.target.value);
  };

  const onBlur = async () => {
    props.handleBlur();
    await balanceUpdate();
    setShowInputBalance(false);
    await props.reloadBalance(true);
  };

  const handleDoubleClick = () => {
    setShowInputBalance(true);
    props.handleDoubleClick();
  };

  return (
    <>
      {!showInputBalance ? (
        <div
          onDoubleClick={handleDoubleClick}
          onClick={handleBalanceClick}
          style={{ cursor: "cell" }}
        >
          {Number(props.balance) > 1000 ? (
            <Typography
              sx={{
                color: "success.main",
                fontWeight: 800,
                display: "flex",
                variant: "h4",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {Number(props.balance).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          ) : (
            <Typography
              sx={{
                color: "error.main",
                fontWeight: 800,
                display: "flex",
                variant: "h4",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {Number(props.balance).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          )}
        </div>
      ) : (
        <TextField
          type="number"
          label="Change Balance"
          onChange={handleChange}
          value={balance}
          onBlur={onBlur}
          variant="outlined"
          autoFocus
        />
      )}
    </>
  );
}
