import { TextField, useMediaQuery } from "@mui/material";
import { useState } from "react";
import axios from "axios";

export default function MonthlyExpenseTarget(props) {
  const [monthlyExpenseTarget, setMonthlyExpenseTarget] = useState(
    props.monthlyExpenseTarget
  );
  const [showInputMonthlyExpenseTarget, setShowInputMonthlyExpenseTarget] =
    useState(props.setshowInputMonthlyExpenseTarget);
  const matches = useMediaQuery("(max-width:600px)");

  const handleMonthlyExpenseTargetClick = () => {
    matches ? setShowInputMonthlyExpenseTarget(true) : null;
  };

  const monthlyExpenseTargetUpdate = async () => {
    let data = {
      monthlyExpenseTarget: monthlyExpenseTarget,
    };
    await axios
      .post("/api/updateMonthlyExpenseTarget", data)
      .then(async (response) => {})
      .catch((e) => {});
  };

  const handleChange = (data) => {
    setMonthlyExpenseTarget(data.target.value);
  };

  const onBlur = async () => {
    props.handleBlur();
    await monthlyExpenseTargetUpdate();
    setShowInputMonthlyExpenseTarget(false);
    await props.reloadMonthlyExpenseTarget(true);
  };

  const handleDoubleClick = () => {
    setShowInputMonthlyExpenseTarget(true);
    props.handleDoubleClick();
  };

  return (
    <>
      {!showInputMonthlyExpenseTarget ? (
        <div
          onDoubleClick={handleDoubleClick}
          onClick={handleMonthlyExpenseTargetClick}
          style={{ cursor: "cell" }}
        >
          <div className="row">
            <h1 style={{ color: "green" }}>{props.monthlyExpenseTarget}</h1>
          </div>
        </div>
      ) : (
        <TextField
          type="number"
          label="Change Daily Limit"
          onChange={handleChange}
          value={monthlyExpenseTarget}
          onBlur={onBlur}
          variant="outlined"
          autoFocus
        />
      )}
    </>
  );
}
