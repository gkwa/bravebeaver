# getLinks.js - Link Extraction and Filtering Library

A JavaScript library for extracting and filtering links from web pages with dependency injection for multiple sources and advanced regex filtering capabilities.

## Quick Start

```javascript
// 1. Basic extraction (gets all links from current page)
const links = getLinks()

// 2. Copy to clipboard
copyToClipboard(links, "json")

// 3. Show metadata
displayMetadata(links)
```

## Main Functions

| Function                           | Description                             |
| ---------------------------------- | --------------------------------------- |
| `getLinks(options)`                | Main extraction function with filtering |
| `getLinksSimple()`                 | Basic extraction without source info    |
| `copyToClipboard(data, format)`    | Copy results in various formats         |
| `getLinksMetadata(links, options)` | Generate metadata about results         |
| `displayMetadata(links, options)`  | Display formatted metadata report       |

## getLinks() Options

| Option            | Type    | Default                | Description                            |
| ----------------- | ------- | ---------------------- | -------------------------------------- |
| `sources`         | Array   | `[defaultSources.dom]` | Data sources to extract from           |
| `selector`        | String  | `'a[href]'`            | CSS selector for links                 |
| `excludeExternal` | Boolean | `false`                | Exclude external links                 |
| `excludeAnchors`  | Boolean | `true`                 | Exclude anchor links (#)               |
| `excludeMailto`   | Boolean | `true`                 | Exclude mailto: links                  |
| `excludeTel`      | Boolean | `true`                 | Exclude tel: links                     |
| `minTextLength`   | Number  | `1`                    | Minimum link text length               |
| `deduplicate`     | Boolean | `true`                 | Remove duplicate links                 |
| `regexFilters`    | Object  | `null`                 | Advanced regex filtering               |
| `regexMatchMode`  | String  | `'all'`                | How to combine filters: 'all' or 'any' |

## Data Sources

| Source                                | Description      | Usage                                                                                |
| ------------------------------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `defaultSources.dom`                  | Current page DOM | `sources: [defaultSources.dom]`                                                      |
| `defaultSources.html(html, baseUrl)`  | HTML string      | `sources: [defaultSources.html('<a href="/test">Test</a>', 'https://example.com/')]` |
| `defaultSources.iframe(element)`      | Iframe content   | `sources: [defaultSources.iframe(document.querySelector('iframe'))]`                 |
| `defaultSources.json(array, baseUrl)` | JSON array       | `sources: [defaultSources.json([{name: 'Home', link: '/'}], 'https://site.com/')]`   |

## Regex Filter Options

| Filter Type         | Description                  | Example                                        |
| ------------------- | ---------------------------- | ---------------------------------------------- |
| `includeExact`      | Exact string match (include) | `includeExact: ['Home', 'About']`              |
| `excludeExact`      | Exact string match (exclude) | `excludeExact: ['view online', 'unsubscribe']` |
| `includeStartsWith` | String starts with (include) | `includeStartsWith: ['https://api.']`          |
| `excludeStartsWith` | String starts with (exclude) | `excludeStartsWith: ['https://ads.']`          |
| `includeEndsWith`   | String ends with (include)   | `includeEndsWith: ['.pdf', '.doc']`            |
| `excludeEndsWith`   | String ends with (exclude)   | `excludeEndsWith: ['.tmp', '.log']`            |
| `includeContains`   | String contains (include)    | `includeContains: ['documentation', 'guide']`  |
| `excludeContains`   | String contains (exclude)    | `excludeContains: ['sponsor', 'advertise']`    |
| `includePatterns`   | Custom regex (include)       | `includePatterns: ['api.*v[0-9]+']`            |
| `excludePatterns`   | Custom regex (exclude)       | `excludePatterns: ['\\[email.*protected\\]']`  |

## Copy Formats

| Format    | Description   | Example                           |
| --------- | ------------- | --------------------------------- |
| `'json'`  | Pretty JSON   | `copyToClipboard(links, 'json')`  |
| `'csv'`   | CSV format    | `copyToClipboard(links, 'csv')`   |
| `'urls'`  | URLs only     | `copyToClipboard(links, 'urls')`  |
| `'table'` | Console table | `copyToClipboard(links, 'table')` |

## Metadata Options

| Option          | Type    | Default | Description                 |
| --------------- | ------- | ------- | --------------------------- |
| `showSources`   | Boolean | `true`  | Show source breakdown       |
| `showDomains`   | Boolean | `true`  | Show domain statistics      |
| `showFileTypes` | Boolean | `true`  | Show file type breakdown    |
| `showLinkTypes` | Boolean | `true`  | Show link type analysis     |
| `topN`          | Number  | `10`    | Number of top items to show |

## Examples

### Basic Usage

```javascript
// Get all links from current page
const links = getLinks()

// Get links with basic filtering
const filtered = getLinks({
  excludeExternal: true,
  minTextLength: 3,
})
```

### Multiple Sources

```javascript
const links = getLinks({
  sources: [
    defaultSources.dom,
    defaultSources.html('<a href="/test">Test</a>', "https://example.com/"),
    defaultSources.iframe(document.querySelector("iframe")),
  ],
})
```

### User-Friendly Filtering

```javascript
const links = getLinks({
  regexFilters: {
    name: {
      includeContains: ["documentation", "guide", "tutorial"],
      excludeContains: ["sponsor", "advertise"],
      excludeExact: ["view online", "unsubscribe"],
    },
    link: {
      includeEndsWith: [".pdf", ".doc"],
      excludeStartsWith: ["https://ads."],
    },
  },
})
```

### Advanced Pattern Filtering

```javascript
const links = getLinks({
  regexFilters: {
    name: {
      excludePatterns: [
        "^view online$", // Exact match
        "^https://refer\\.", // Starts with
        "register today", // Contains
        "\\[email.*protected\\]", // Email protection
        "manage.*subscription", // Pattern match
      ],
    },
    link: {
      excludePatterns: ["twitter\\.com/\\w+$"], // Twitter profiles
    },
  },
  regexMatchMode: "all",
})
```

### Complex Newsletter Filtering

```javascript
const newsletterLinks = getLinks({
  regexFilters: {
    link: {
      excludePatterns: ["twitter\\.com/\\w+$"],
    },
    name: {
      excludeExact: ["view online", "unsubscribe"],
      excludeStartsWith: ["https://refer.tldr.tech/"],
      excludeContains: ["register today", "apply here", "sponsor", "sign up", "advertise"],
      excludePatterns: [
        "\\[email.*protected\\]",
        "manage.*subscription",
        "track.*referrals",
        "join.*webinar",
      ],
    },
  },
  regexMatchMode: "all",
})
```

### Working with Results

```javascript
// Get filtered links
const links = getLinks({...});

// Show table in console
console.table(links);

// Display comprehensive metadata
displayMetadata(links);

// Copy as different formats
copyToClipboard(links, 'json');     // JSON format
copyToClipboard(links, 'csv');      // CSV format
copyToClipboard(links, 'urls');     // Just URLs

// Get metadata programmatically
const meta = getLinksMetadata(links);
console.log(`Found ${meta.totalLinks} links from ${meta.uniqueDomains} domains`);
```

### Custom Sources

```javascript
// Custom source example
const customLinks = getLinks({
  sources: [
    {
      getLinks: () => document.querySelectorAll(".my-custom-links"),
      getBaseUrl: () => "https://custom-base.com/",
      getName: "Custom Link Selector",
    },
  ],
})
```

## Return Format

Each link object contains:

```javascript
{
  name: "Link text or URL",
  link: "https://absolute-url.com/path",
  source: "DOM" // or source name
}
```
