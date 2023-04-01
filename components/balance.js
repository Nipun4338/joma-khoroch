export default function Balance(props) {
  const balanceTextColor = ["red", "green"];

  return (
    <>
      {props.balance > 1000 ? (
        <div className="row">
          <h1 style={{ color: balanceTextColor[1] }}>{props.balance}</h1>
        </div>
      ) : (
        <div className="row">
          <h1 style={{ color: balanceTextColor[0] }}>{props.balance}</h1>
        </div>
      )}
    </>
  );
}
