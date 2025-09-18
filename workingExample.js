const links = getLinks({
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
})

// Display options
console.table(links)
copyToClipboard(links, "json")
