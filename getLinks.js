// Default sources for link extraction
const defaultSources = {
  // DOM source - gets links from current page
  dom: {
    getLinks: () => Array.from(document.querySelectorAll("a[href]")),
    getBaseUrl: () => window.location.href,
    getName: "DOM",
  },

  // Custom HTML source - parse HTML string
  html: (htmlString, baseUrl = window.location.href) => ({
    getLinks: () => {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlString, "text/html")
      return Array.from(doc.querySelectorAll("a[href]"))
    },
    getBaseUrl: () => baseUrl,
    getName: "HTML String",
  }),

  // iframe source - get links from iframe
  iframe: (iframeElement) => ({
    getLinks: () => {
      try {
        return Array.from(iframeElement.contentDocument.querySelectorAll("a[href]"))
      } catch (e) {
        console.warn("Cannot access iframe content (cross-origin?):", e)
        return []
      }
    },
    getBaseUrl: () => iframeElement.src || window.location.href,
    getName: `Iframe: ${iframeElement.src}`,
  }),

  // JSON source - process array of link objects
  json: (linkArray, baseUrl = window.location.href) => ({
    getLinks: () =>
      linkArray.map((item) => ({
        textContent: item.name || item.text || "",
        getAttribute: (attr) => (attr === "href" ? item.link || item.href || item.url : null),
      })),
    getBaseUrl: () => baseUrl,
    getName: "JSON Array",
  }),
}

// Functional regex filter creators
const createRegexFilter = (field, pattern, flags = "i", mode = "include") => {
  const regex = new RegExp(pattern, flags)
  return (item) => {
    const matches = regex.test(item[field])
    return mode === "include" ? matches : !matches
  }
}

// Helper functions to convert user-friendly arrays to regex patterns
const arrayToExactPattern = (items) =>
  `^(${items.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})$`
const arrayToStartsWithPattern = (items) =>
  `^(${items.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`
const arrayToEndsWithPattern = (items) =>
  `(${items.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})$`
const arrayToContainsPattern = (items) =>
  `(${items.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`
const arrayToPatternsRegex = (items) => `(${items.join("|")})`

const createRegexFilters = (regexConfig) => {
  if (!regexConfig) return []

  return Object.entries(regexConfig)
    .flatMap(([field, config]) => {
      if (typeof config === "string") {
        return [createRegexFilter(field, config)]
      }

      const filters = []

      // Handle new user-friendly array formats
      if (config.includeExact) {
        const pattern = arrayToExactPattern(
          Array.isArray(config.includeExact) ? config.includeExact : [config.includeExact],
        )
        filters.push(createRegexFilter(field, pattern, config.flags, "include"))
      }
      if (config.excludeExact) {
        const pattern = arrayToExactPattern(
          Array.isArray(config.excludeExact) ? config.excludeExact : [config.excludeExact],
        )
        filters.push(createRegexFilter(field, pattern, config.flags, "exclude"))
      }

      if (config.includeStartsWith) {
        const pattern = arrayToStartsWithPattern(
          Array.isArray(config.includeStartsWith)
            ? config.includeStartsWith
            : [config.includeStartsWith],
        )
        filters.push(createRegexFilter(field, pattern, config.flags, "include"))
      }
      if (config.excludeStartsWith) {
        const pattern = arrayToStartsWithPattern(
          Array.isArray(config.excludeStartsWith)
            ? config.excludeStartsWith
            : [config.excludeStartsWith],
        )
        filters.push(createRegexFilter(field, pattern, config.flags, "exclude"))
      }

      if (config.includeEndsWith) {
        const pattern = arrayToEndsWithPattern(
          Array.isArray(config.includeEndsWith) ? config.includeEndsWith : [config.includeEndsWith],
        )
        filters.push(createRegexFilter(field, pattern, config.flags, "include"))
      }
      if (config.excludeEndsWith) {
        const pattern = arrayToEndsWithPattern(
          Array.isArray(config.excludeEndsWith) ? config.excludeEndsWith : [config.excludeEndsWith],
        )
        filters.push(createRegexFilter(field, pattern, config.flags, "exclude"))
      }

      if (config.includeContains) {
        const pattern = arrayToContainsPattern(
          Array.isArray(config.includeContains) ? config.includeContains : [config.includeContains],
        )
        filters.push(createRegexFilter(field, pattern, config.flags, "include"))
      }
      if (config.excludeContains) {
        const pattern = arrayToContainsPattern(
          Array.isArray(config.excludeContains) ? config.excludeContains : [config.excludeContains],
        )
        filters.push(createRegexFilter(field, pattern, config.flags, "exclude"))
      }

      if (config.includePatterns) {
        const pattern = arrayToPatternsRegex(
          Array.isArray(config.includePatterns) ? config.includePatterns : [config.includePatterns],
        )
        filters.push(createRegexFilter(field, pattern, config.flags, "include"))
      }
      if (config.excludePatterns) {
        const pattern = arrayToPatternsRegex(
          Array.isArray(config.excludePatterns) ? config.excludePatterns : [config.excludePatterns],
        )
        filters.push(createRegexFilter(field, pattern, config.flags, "exclude"))
      }

      // Handle legacy include/exclude arrays and patterns
      if (config.include) {
        const patterns = Array.isArray(config.include) ? config.include : [config.include]
        patterns.forEach((pattern) => {
          const patternStr = typeof pattern === "string" ? pattern : pattern.pattern
          const flags = typeof pattern === "object" ? pattern.flags : config.flags
          filters.push(createRegexFilter(field, patternStr, flags, "include"))
        })
      }

      if (config.exclude) {
        const patterns = Array.isArray(config.exclude) ? config.exclude : [config.exclude]
        patterns.forEach((pattern) => {
          const patternStr = typeof pattern === "string" ? pattern : pattern.pattern
          const flags = typeof pattern === "object" ? pattern.flags : config.flags
          filters.push(createRegexFilter(field, patternStr, flags, "exclude"))
        })
      }

      // Handle legacy pattern format
      if (config.pattern) {
        filters.push(
          createRegexFilter(field, config.pattern, config.flags, config.mode || "include"),
        )
      }

      return filters
    })
    .filter(Boolean)
}

const applyFilters = (items, filters, matchMode = "all") => {
  if (!filters || filters.length === 0) return { included: items, excluded: [] }

  const included = []
  const excluded = []

  items.forEach((item) => {
    const matches = filters.map((filter) => filter(item))
    const shouldInclude = matchMode === "all" ? matches.every(Boolean) : matches.some(Boolean)

    if (shouldInclude) {
      included.push(item)
    } else {
      excluded.push({
        ...item,
        excludedBy: "regex filters",
      })
    }
  })

  return { included, excluded }
}

function getLinks(options = {}) {
  const {
    sources = [defaultSources.dom],
    selector = "a[href]",
    excludeExternal = false,
    excludeAnchors = true,
    excludeMailto = true,
    excludeTel = true,
    minTextLength = 1,
    deduplicate = true,
    regexFilters = null,
    regexMatchMode = "all",
    trackExcluded = true,
  } = options

  const allLinks = []
  const allExcluded = []

  // Process each source
  sources.forEach((source) => {
    try {
      const links = source.getLinks()
      const baseUrl = source.getBaseUrl()
      const sourceName = source.getName || "Unknown Source"

      console.log(`Processing ${links.length} links from: ${sourceName}`)

      const { processedLinks, excludedLinks } = links.reduce(
        (acc, link) => {
          const name = (link.textContent || "").trim() || link.getAttribute("href") || ""
          const href = link.getAttribute("href")

          // Skip if no href
          if (!href) {
            if (trackExcluded) {
              acc.excludedLinks.push({
                name: name,
                link: href || "no-href",
                source: sourceName,
                excludedBy: "no href attribute",
              })
            }
            return acc
          }

          // Apply basic filters and track exclusions
          if (excludeAnchors && href.startsWith("#")) {
            if (trackExcluded) {
              acc.excludedLinks.push({
                name: name,
                link: href,
                source: sourceName,
                excludedBy: "anchor link",
              })
            }
            return acc
          }

          if (excludeMailto && href.startsWith("mailto:")) {
            if (trackExcluded) {
              acc.excludedLinks.push({
                name: name,
                link: href,
                source: sourceName,
                excludedBy: "mailto link",
              })
            }
            return acc
          }

          if (excludeTel && href.startsWith("tel:")) {
            if (trackExcluded) {
              acc.excludedLinks.push({
                name: name,
                link: href,
                source: sourceName,
                excludedBy: "tel link",
              })
            }
            return acc
          }

          if (name.length < minTextLength) {
            if (trackExcluded) {
              acc.excludedLinks.push({
                name: name,
                link: href,
                source: sourceName,
                excludedBy: `text too short (${name.length} < ${minTextLength})`,
              })
            }
            return acc
          }

          // Convert to absolute URL
          let absoluteUrl
          try {
            absoluteUrl = new URL(href, baseUrl).href
          } catch (e) {
            console.warn(`Invalid URL: ${href}`, e)
            if (trackExcluded) {
              acc.excludedLinks.push({
                name: name,
                link: href,
                source: sourceName,
                excludedBy: "invalid URL",
              })
            }
            return acc
          }

          // Filter external links if requested
          if (excludeExternal && !absoluteUrl.startsWith(new URL(baseUrl).origin)) {
            if (trackExcluded) {
              acc.excludedLinks.push({
                name: name,
                link: absoluteUrl,
                source: sourceName,
                excludedBy: "external link",
              })
            }
            return acc
          }

          acc.processedLinks.push({
            name: name,
            link: absoluteUrl,
            source: sourceName,
          })

          return acc
        },
        { processedLinks: [], excludedLinks: [] },
      )

      allLinks.push(...processedLinks)
      if (trackExcluded) {
        allExcluded.push(...excludedLinks)
      }
    } catch (error) {
      console.error(`Error processing source:`, error)
    }
  })

  // Apply regex filters functionally
  const regexFilterFunctions = createRegexFilters(regexFilters)
  const { included: filteredLinks, excluded: regexExcluded } = applyFilters(
    allLinks,
    regexFilterFunctions,
    regexMatchMode,
  )

  if (trackExcluded) {
    allExcluded.push(...regexExcluded)
  }

  // Remove duplicates if requested and track what gets deduplicated
  let finalLinks = filteredLinks
  if (deduplicate) {
    const seen = new Set()
    const duplicates = []
    const unique = []

    filteredLinks.forEach((item) => {
      const key = `${item.name}|${item.link}`
      if (seen.has(key)) {
        if (trackExcluded) {
          duplicates.push({
            ...item,
            excludedBy: "duplicate",
          })
        }
      } else {
        seen.add(key)
        unique.push(item)
      }
    })

    finalLinks = unique
    if (trackExcluded) {
      allExcluded.push(...duplicates)
    }
  }

  // Return results with tracking info
  const result = finalLinks
  if (trackExcluded) {
    result.excluded = allExcluded
    result.stats = {
      total:
        allLinks.length +
        allExcluded.filter(
          (ex) => ex.excludedBy !== "duplicate" && ex.excludedBy !== "regex filters",
        ).length,
      included: finalLinks.length,
      excluded: allExcluded.length,
      exclusionReasons: allExcluded.reduce((acc, item) => {
        acc[item.excludedBy] = (acc[item.excludedBy] || 0) + 1
        return acc
      }, {}),
    }
  }

  return result
}

// Convenience function for basic DOM extraction (backward compatibility)
function getLinksSimple() {
  return getLinks().map(({ name, link }) => ({ name, link }))
}
