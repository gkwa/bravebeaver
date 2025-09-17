function copyToClipboard(data, format = "json") {
  let output

  switch (format) {
    case "json":
      output = JSON.stringify(data, null, 2)
      break
    case "csv":
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0])
        const csvRows = [
          headers.join(","),
          ...data.map((row) =>
            headers
              .map((header) => `"${(row[header] || "").toString().replace(/"/g, '""')}"`)
              .join(","),
          ),
        ]
        output = csvRows.join("\n")
      } else {
        output = ""
      }
      break
    case "table":
      console.table(data)
      output = "Data displayed in console table"
      break
    case "urls":
      if (Array.isArray(data)) {
        output = data.map((item) => item.link || item.url || item).join("\n")
      } else {
        output = data.toString()
      }
      break
    default:
      output = data.toString()
  }

  if (format !== "table") {
    copy(output)
    console.log(`Copied ${format.toUpperCase()} to clipboard (${output.length} characters)`)
  }

  return output
}
