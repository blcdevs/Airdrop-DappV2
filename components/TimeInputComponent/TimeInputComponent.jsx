import { useState, useEffect } from "react";

// Time Input Component
const TimeRangeSettings = ({
  contract,
  airdropInfo,
  showNotification,
  onTimeUpdate,
  styles
}) => {
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

      // Use updateAirdropTiming function from the contract
      const tx = await contract.updateAirdropTiming(startTimestamp, endTimestamp);
      await tx.wait();

      if (showNotification) {
        showNotification("Airdrop timing updated successfully!", "success");
      }

      // Call onTimeUpdate callback if provided
      if (onTimeUpdate) {
        onTimeUpdate();
      }
    } catch (error) {
      console.error("Error updating time range:", error);
      if (showNotification) {
        showNotification(error.message || "Failed to update timing", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize with airdropInfo or default time range
  useEffect(() => {
    if (airdropInfo?.startTime && airdropInfo?.endTime) {
      setTimeRange({
        startTime: unixToDatetimeLocal(airdropInfo.startTime / 1000),
        endTime: unixToDatetimeLocal(airdropInfo.endTime / 1000),
      });
    } else {
      setDefaultTimeRange();
    }
  }, [airdropInfo]);

  return (
    <div className={styles?.settingGroup} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #333', borderRadius: '8px' }}>
      <h3 style={{ color: '#fff', marginBottom: '15px' }}>Update Airdrop Timing</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div className={styles?.inputGroup} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ color: '#ccc', fontSize: '14px' }}>Start Time</label>
          <input
            type="datetime-local"
            value={timeRange.startTime}
            onChange={(e) => handleTimeChange("startTime", e.target.value)}
            min={unixToDatetimeLocal(Math.floor(Date.now() / 1000))}
            disabled={loading}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #555',
              backgroundColor: '#2a2a2a',
              color: '#fff'
            }}
          />
        </div>
        <div className={styles?.inputGroup} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ color: '#ccc', fontSize: '14px' }}>End Time</label>
          <input
            type="datetime-local"
            value={timeRange.endTime}
            onChange={(e) => handleTimeChange("endTime", e.target.value)}
            min={timeRange.startTime}
            disabled={loading}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #555',
              backgroundColor: '#2a2a2a',
              color: '#fff'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={setDefaultTimeRange}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #555',
              backgroundColor: '#444',
              color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            Set Default (1 Month)
          </button>
          <button
            onClick={updateAirDropTime}
            disabled={loading || !timeRange.startTime || !timeRange.endTime}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: loading || !timeRange.startTime || !timeRange.endTime ? '#666' : '#007bff',
              color: '#fff',
              cursor: loading || !timeRange.startTime || !timeRange.endTime ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? "Updating..." : "Update Airdrop Timing"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeRangeSettings;
