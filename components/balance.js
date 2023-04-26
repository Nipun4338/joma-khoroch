import { TextField, useMediaQuery } from "@mui/material";
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
          {props.balance > 1000 ? (
            <div className="row">
              <h1 style={{ color: balanceTextColor[1] }}>{props.balance}</h1>
            </div>
          ) : (
            <div className="row">
              <h1 style={{ color: balanceTextColor[0] }}>{props.balance}</h1>
            </div>
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
