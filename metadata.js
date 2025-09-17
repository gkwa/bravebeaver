function getLinksMetadata(links, options = {}) {
  const {
    showSources = true,
    showDomains = true,
    showFileTypes = true,
    showLinkTypes = true,
    topN = 10,
  } = options

  const metadata = {
    totalLinks: links.length,
    timestamp: new Date().toISOString(),
  }

  if (showSources && links.length > 0) {
    const sources = {}
    links.forEach((link) => {
      const source = link.source || "Unknown"
      sources[source] = (sources[source] || 0) + 1
    })
    metadata.sources = sources
  }

  if (showDomains && links.length > 0) {
    const domains = {}
    links.forEach((link) => {
      try {
        const domain = new URL(link.link).hostname
        domains[domain] = (domains[domain] || 0) + 1
      } catch (e) {
        domains["invalid-url"] = (domains["invalid-url"] || 0) + 1
      }
    })

    // Sort domains by count and take top N
    const sortedDomains = Object.entries(domains)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topN)

    metadata.topDomains = Object.fromEntries(sortedDomains)
    metadata.uniqueDomains = Object.keys(domains).length
  }

  if (showFileTypes && links.length > 0) {
    const fileTypes = {}
    links.forEach((link) => {
      try {
        const url = new URL(link.link)
        const pathname = url.pathname.toLowerCase()
        const extension = pathname.split(".").pop()

        // Common file extensions
        if (
          /^(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar|mp4|mp3|jpg|jpeg|png|gif|svg)$/.test(
            extension,
          )
        ) {
          fileTypes[extension] = (fileTypes[extension] || 0) + 1
        } else {
          fileTypes["webpage"] = (fileTypes["webpage"] || 0) + 1
        }
      } catch (e) {
        fileTypes["unknown"] = (fileTypes["unknown"] || 0) + 1
      }
    })
    metadata.fileTypes = fileTypes
  }

  if (showLinkTypes && links.length > 0) {
    const linkTypes = {
      external: 0,
      internal: 0,
      anchor: 0,
      mailto: 0,
      tel: 0,
      other: 0,
    }

    const currentDomain = window.location.hostname

    links.forEach((link) => {
      const url = link.link.toLowerCase()
      try {
        const linkDomain = new URL(link.link).hostname

        if (url.startsWith("mailto:")) {
          linkTypes.mailto++
        } else if (url.startsWith("tel:")) {
          linkTypes.tel++
        } else if (url.includes("#")) {
          linkTypes.anchor++
        } else if (linkDomain === currentDomain) {
          linkTypes.internal++
        } else {
          linkTypes.external++
        }
      } catch (e) {
        linkTypes.other++
      }
    })

    metadata.linkTypes = linkTypes
  }

  // Calculate some basic stats
  if (links.length > 0) {
    const nameLengths = links.map((link) => link.name.length)
    metadata.nameStats = {
      avgLength: Math.round(nameLengths.reduce((a, b) => a + b, 0) / nameLengths.length),
      minLength: Math.min(...nameLengths),
      maxLength: Math.max(...nameLengths),
    }

    // Find most common words in link names
    const words = links
      .map((link) => link.name.toLowerCase())
      .join(" ")
      .split(/\s+/)
      .filter((word) => word.length > 3) // Only words longer than 3 chars
      .filter(
        (word) =>
          !/^(the|and|for|are|but|not|you|all|can|had|her|was|one|our|out|day|get|has|him|his|how|man|new|now|old|see|two|way|who|boy|did|its|let|put|say|she|too|use)$/.test(
            word,
          ),
      ) // Filter common words

    const wordCounts = {}
    words.forEach((word) => {
      wordCounts[word] = (wordCounts[word] || 0) + 1
    })

    const topWords = Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    metadata.topWords = Object.fromEntries(topWords)
  }

  return metadata
}

function displayMetadata(links, options = {}) {
  const metadata = getLinksMetadata(links, options)

  console.log("\n📊 LINKS METADATA REPORT")
  console.log("========================")
  console.log(`Total Links Found: ${metadata.totalLinks}`)
  console.log(`Generated: ${metadata.timestamp}`)

  if (metadata.sources) {
    console.log("\n📍 Sources:")
    Object.entries(metadata.sources).forEach(([source, count]) => {
      console.log(`  ${source}: ${count}`)
    })
  }

  if (metadata.topDomains) {
    console.log("\n🌐 Top Domains:")
    Object.entries(metadata.topDomains).forEach(([domain, count]) => {
      console.log(`  ${domain}: ${count}`)
    })
    console.log(`\nUnique Domains: ${metadata.uniqueDomains}`)
  }

  if (metadata.fileTypes) {
    console.log("\n📄 File Types:")
    Object.entries(metadata.fileTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })
  }

  if (metadata.linkTypes) {
    console.log("\n🔗 Link Types:")
    Object.entries(metadata.linkTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })
  }

  if (metadata.nameStats) {
    console.log("\n📝 Name Statistics:")
    console.log(`  Average Length: ${metadata.nameStats.avgLength} chars`)
    console.log(`  Min Length: ${metadata.nameStats.minLength} chars`)
    console.log(`  Max Length: ${metadata.nameStats.maxLength} chars`)
  }

  if (metadata.topWords) {
    console.log("\n🔤 Most Common Words:")
    Object.entries(metadata.topWords).forEach(([word, count]) => {
      console.log(`  "${word}": ${count}`)
    })
  }

  return metadata
}
