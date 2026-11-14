// A paper's page (/25082343/) reads as its title (h1.heading-title), a head with its authors (the page links each to
// a search for their papers, which is a listing), then where it was published (the citation the page heads with:
// "Ann Transplant. 2014 Aug 1:19:373-81"), each part of its abstract, in English where the page gives several, and
// its keywords. It links with weight 1 to the paper's full text (its DOI and the free full text links), and to the
// articles the page lists as similar and as citing it, with weight 0.5. Its details are its journal, its PMID and its
// DOI. A search (/?term=…) is a listing of each paper it finds. PubMed may first check the browser with a page that
// solves a puzzle and reloads itself; a scrape that meets it fails, to be tried again later.
function parsePubMed(_profileId) {
  if (location.hostname !== 'pubmed.ncbi.nlm.nih.gov') {
    return null
  }
  if (document.querySelector('#cookie-required')) {
    return { content: [], failed: 'PubMed was checking the browser' }
  }
  if (document.querySelector('.search-results, .search-results-chunks')) {
    return listingOf(linkUrls('.search-results a.docsum-title')) ?? { listing: true }
  }
  const title = document.querySelector('h1.heading-title')?.innerText.trim()
  if (!title) {
    return null
  }
  const citation = document.querySelector('#full-view-heading .article-citation, #full-view-heading .cit')?.innerText.trim()
  const journal = document.querySelector('#full-view-journal-trigger')?.innerText.trim()
  const abstract = document.querySelector('#eng-abstract') || document.querySelector('.abstract-content')
  const keywords = document.querySelector('#keywords, .keywords-section')?.innerText.replace(/\s+/g, ' ').trim()
  const content = [
    ...(citation ? [[journal, citation].filter(Boolean).join('. ')] : []),
    ...(abstract ? textBlocks(abstract, { lists: true }) : []),
    ...(keywords ? [keywords] : []),
  ]
  const fullText = linkUrls('.full-text-links-list a[href], .identifier.doi a[href]')
  const related = linkUrls('#similar a.docsum-title, #citedby a.docsum-title')
  const doi = document.querySelector('.identifier.doi a')?.innerText.trim()
  return {
    ...withAuthors({ title, content }, linkedAuthors('.authors-list .full-name')),
    links: [
      ...authorLinks(linkedAuthors('.authors-list .full-name')),
      ...[...new Set(fullText)].map(url => ({ url, score: 1 })),
      ...[...new Set(related)].map(url => ({ url, score: 0.5 })),
    ],
    details: [
      ['journal', journal],
      ['pmid', location.pathname.split('/')[1]],
      ['doi', doi],
    ],
  }
}

// The parser a scrape calls.
registerParser(parsePubMed)
