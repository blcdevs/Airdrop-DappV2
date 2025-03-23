import React, { useState, useEffect } from "react";

// Time Input Component
const TimeRangeSettings = () => {
  const [timeRange, setTimeRange] = useState({
    startTime: "",
    endTime: "",
  });
  const [loading, setLoading] = useState(false);

  // Convert Unix timestamp to datetime-local format
  const unixToDatetimeLocal = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toISOString().slice(0, 16);
  };

  // Convert datetime-local to Unix timestamp
  const datetimeLocalToUnix = (datetime) => {
    return Math.floor(new Date(datetime).getTime() / 1000);
  };

  // Handle input changes
  const handleTimeChange = (field, value) => {
    setTimeRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Set default time range (1 month)
  const setDefaultTimeRange = () => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const oneMonthInSeconds = 30 * 24 * 60 * 60;

    setTimeRange({
      startTime: unixToDatetimeLocal(currentTimestamp),
      endTime: unixToDatetimeLocal(currentTimestamp + oneMonthInSeconds),
    });
  };

  // Update time range in contract
  const updateAirDropTime = async () => {
    try {
      setLoading(true);

      const startTimestamp = datetimeLocalToUnix(timeRange.startTime);
      const endTimestamp = datetimeLocalToUnix(timeRange.endTime);

      // Validations
      if (startTimestamp >= endTimestamp) {
        throw new Error("End time must be after start time");
      }

      if (startTimestamp < Math.floor(Date.now() / 1000)) {
        throw new Error("Start time cannot be in the past");
      }

      const tx = await contract.setTimeRange(startTimestamp, endTimestamp);
      await tx.wait();

      showNotification("Time range updated successfully!", "success");
    } catch (error) {
      console.error("Error updating time range:", error);
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Initialize with default time range
  useEffect(() => {
    setDefaultTimeRange();
  }, []);

  return (
    <div className={styles.settingGroup}>
      <h3>Update Time Range</h3>
      <div className={styles.timeInputs}>
        <div className={styles.inputGroup}>
          <label>Start Time</label>
          <input
            type="datetime-local"
            value={timeRange.startTime}
            onChange={(e) => handleTimeChange("startTime", e.target.value)}
            min={unixToDatetimeLocal(Math.floor(Date.now() / 1000))}
            disabled={loading}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>End Time</label>
          <input
            type="datetime-local"
            value={timeRange.endTime}
            onChange={(e) => handleTimeChange("endTime", e.target.value)}
            min={timeRange.startTime}
            disabled={loading}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button
            onClick={setDefaultTimeRange}
            className={styles.secondaryButton}
            disabled={loading}
          >
            Set Default (1 Month)
          </button>
          <button
            onClick={updateAirDropTime}
            className={styles.primaryButton}
            disabled={loading || !timeRange.startTime || !timeRange.endTime}
          >
            {loading ? "Updating..." : "Update Time Range"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeRangeSettings;
