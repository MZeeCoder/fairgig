export const exportAuditCSV = (filteredHistory) => {
  // 1. Define the exact columns you requested
  const headers = [
    "_id", 
    "worker_id", 
    "platform", 
    "city",
    "date", 
    "hours_worked", 
    "gross_earned", 
    "deduction", 
    "net_received", 
    "screenshot_url", 
    "status"
  ];
  
  // 2. Map the filtered data into CSV rows
  const csvRows = filteredHistory.map(log => {
    return [
      `"${log._id}"`,
      `"${log.worker_id}"`,
      `"${log.platform}"`,
      `"${log.city || 'unspecified'}"`,
      `"${log.date}"`,
      log.hours_worked,
      log.gross_earned,
      log.deduction,
      log.net_received,
      `"${log.screenshot_url}"`, // Wrapped in quotes to protect special characters in the URL
      `"${log.status}"`
    ].join(","); 
  });

  // 3. Combine headers and rows
  const csvContent = [headers.join(","), ...csvRows].join("\n");

  // 4. Create and download the Blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  
  const dateString = new Date().toISOString().split('T')[0];
  link.setAttribute("download", `FairGig_Raw_Audit_Data_${dateString}.csv`);
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
