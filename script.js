function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  const data = sheet.getDataRange().getValues();
  data.shift(); // Remove headers
  
  const products = data.map(row => {
    // Split comma-separated URLs into an array and clean up spaces
    const imageList = String(row[3])
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    return {
      name: row[0],
      description: row[1],
      rate: row[2],
      images: imageList, // Sends array of images
      category: row[4] || "General",
      isOffer: String(row[5]).toUpperCase() === "TRUE" || String(row[5]).toUpperCase() === "YES"
    };
  });
  
  return ContentService.createTextOutput(JSON.stringify(products))
    .setMimeType(ContentService.MimeType.JSON);
}