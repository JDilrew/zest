function formatTime(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${Math.floor(ms / 1000)}s`;
  }
  if (ms < 3600000) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
  // For longer durations, show in hours and minutes
  const hours = Math.floor(ms / 3600000);
  const remainingMinutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${remainingMinutes}m`;
}

export { formatTime };
