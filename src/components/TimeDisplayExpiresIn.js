import Countdown, { zeroPad } from "react-countdown";

const TimeDisplayExpiresIn = ({ expiresInTime, createdTime, expiryHandlerSelf, expiryHandlerOthers }) => {
  const renderer = ({ minutes, seconds, completed }) => {
    if (completed) {
      return <span>Time's up!</span>;
    } else {
      // Render a countdown
      return (
        <span style={{ backgroundColor: (minutes * 60 + seconds) * 1000 >= expiresInTime / 2 ? "yellow" : "orange" }}>
          {zeroPad(minutes)}:{zeroPad(seconds)} minutes
        </span>
      );
    }
  };

  const runTheseFunctions = () => {
    if (expiryHandlerSelf) {
      expiryHandlerSelf();
      return;
    }
    if (expiryHandlerOthers) {
      expiryHandlerOthers();
      return;
    }
  };

  return (
    <div>
      <span>
        Expires In: <Countdown date={createdTime + expiresInTime} renderer={renderer} onComplete={runTheseFunctions} />
      </span>
    </div>
  );
};

export default TimeDisplayExpiresIn;
