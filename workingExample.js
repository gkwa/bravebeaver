const result = getLinks({
  regexFilters: {
    link: {
      excludeContains: ["bunnies"],
      excludePatterns: ["twitter\\.com/\\w+$"],
    },
    name: {
      excludeExact: ["save your seat"],
      excludePatterns: [
        "free.*trial",
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
  trackExcluded: true,
})

// Display included links
console.log("\n✅ INCLUDED LINKS:")
console.table(result)

// Display exclusion statistics
if (result.stats) {
  console.log("\n📊 FILTERING STATISTICS:")
  console.log(`Total processed: ${result.stats.total}`)
  console.log(`Included: ${result.stats.included}`)
  console.log(`Excluded: ${result.stats.excluded}`)
  console.log("\nExclusion reasons:")
  Object.entries(result.stats.exclusionReasons).forEach(([reason, count]) => {
    console.log(`  ${reason}: ${count}`)
  })
}

// Display some excluded examples
if (result.excluded && result.excluded.length > 0) {
  console.log("\n❌ EXCLUDED LINKS (first 10):")
  console.table(result.excluded.slice(0, 10))
}

// Copy included links to clipboard
copyToClipboard(result, "json")

// You can also copy excluded links to see what was filtered out
// copyToClipboard(result.excluded, "json")
