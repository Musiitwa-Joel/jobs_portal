const formatDateString = (timestamp: number): string => {
  if (!timestamp || isNaN(timestamp) || timestamp <= 0) {
    return "Invalid Date";
  }

  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);

  const [weekday, month, day, year, time] = formattedDate.split(" ");

  const ampm = date.getHours() >= 12 ? "PM" : "AM";

  return `${weekday}-${month}-${day}-${year} ${time} ${ampm}`
    .replace(/,/g, "")
    .toUpperCase();
};

export default formatDateString;
