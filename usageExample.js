// Complete workflow example using all our functions

// Step 1: Load the functions (paste getLinks.js, copyToClipboard.js, metadata.js first)

// Step 2: Get filtered links with comprehensive filtering
const links = getLinks({
  regexFilters: {
    link: {
      excludeContains: ["bunnies"],
      excludePatterns: ["twitter\\.com/\\w+$"],
    },
    name: {
      excludePatterns: [
        "^view online$",
        "^unsubscribe$",
        "\\[email.*protected\\]",
        "^https://links\\.tldrnewsletter\\.com/VAH0UC",
        "^https://refer\\.tldr\\.tech/",
        "register today",
        "apply here",
        "sponsor",
        "sign up",
        "advertise",
        "manage.*subscription",
        "track.*referrals",
        "Get the analyst reports\\.",
        "join.*webinar",
      ],
    },
  },
  regexMatchMode: "all",
})

// Step 3: Display results in table format
console.table(links)

// Step 4: Show comprehensive metadata report
displayMetadata(links)

// Step 5: Copy results to clipboard as JSON
copyToClipboard(links, "json")

// Alternative usage examples:

// Just get basic metadata without full display
const meta = getLinksMetadata(links)
console.log(`Found ${meta.totalLinks} links from ${meta.uniqueDomains} domains`)

// Customized metadata display
displayMetadata(links, {
  showSources: true,
  showDomains: true,
  showFileTypes: false,
  topN: 5,
})

// Copy different formats
copyToClipboard(links, "csv") // Copy as CSV
copyToClipboard(links, "urls") // Copy just URLs
copyToClipboard(links, "table") // Display table in console

// Quick one-liner for simple extraction and copy
copyToClipboard(getLinks(), "json")
