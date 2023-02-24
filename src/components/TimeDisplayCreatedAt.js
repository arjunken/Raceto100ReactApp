import { formatDistance } from "date-fns";
import { useEffect, useState } from "react";

const TimeDisplayCreatedAt = ({ createdTime }) => {
  const [timeDisplay, setTimeDisplay] = useState(formatDistance(createdTime, Date.now(), { addSuffix: true }));

  useEffect(() => {
    setInterval(() => {
      setTimeDisplay(formatDistance(createdTime, Date.now(), { addSuffix: true }));
    }, 10000);

    return () => {
      setTimeDisplay(null);
    };
  }, [createdTime]);

  return (
    <div>
      <span>Created: {timeDisplay}</span>
    </div>
  );
};

export default TimeDisplayCreatedAt;
