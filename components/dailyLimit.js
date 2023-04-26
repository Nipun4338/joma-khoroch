import { TextField, useMediaQuery } from "@mui/material";
import { useState } from "react";
import axios from "axios";

export default function DailyLimit(props) {
  const [dailyLimit, setDailyLimit] = useState(props.dailyLimit);
  const [showInputDailyLimit, setShowInputDailyLimit] = useState(
    props.setshowInputDailyLimit
  );
  const matches = useMediaQuery("(max-width:600px)");

  const handleDailyLimitClick = () => {
    matches ? setShowInputDailyLimit(true) : null;
  };

  const dailyLimitUpdate = async () => {
    let data = {
      dailyLimit: dailyLimit,
    };
    await axios
      .post("/api/updateDailyLimit", data)
      .then(async (response) => {})
      .catch((e) => {});
  };

  const handleChange = (data) => {
    setDailyLimit(data.target.value);
  };

  const onBlur = async () => {
    props.handleBlur();
    await dailyLimitUpdate();
    setShowInputDailyLimit(false);
    await props.reloadDailyLimit(true);
  };

  const handleDoubleClick = () => {
    setShowInputDailyLimit(true);
    props.handleDoubleClick();
  };

  return (
    <>
      {!showInputDailyLimit ? (
        <div
          onDoubleClick={handleDoubleClick}
          onClick={handleDailyLimitClick}
          style={{ cursor: "cell" }}
        >
          <div className="row">
            <h1 style={{ color: "green" }}>{props.dailyLimit}</h1>
          </div>
        </div>
      ) : (
        <TextField
          type="number"
          label="Change Daily Limit"
          onChange={handleChange}
          value={dailyLimit}
          onBlur={onBlur}
          variant="outlined"
          autoFocus
        />
      )}
    </>
  );
}
