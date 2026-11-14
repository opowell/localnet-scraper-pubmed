import { afterEach, describe, expect, it } from 'vitest'
import { parserLoader, resetPage, visit } from '#scraper-test'

// The parser, evaluated with the helpers it is injected with, as a scrape runs it.
const load = parserLoader(__dirname)

afterEach(resetPage)

describe('reference sites', () => {
  it('reads a PubMed paper as its citation, abstract and keywords, linking to its full text and related papers', () => {
    const { parsePubMed } = load('pubmed.js', ['parsePubMed'])
    visit('https://pubmed.ncbi.nlm.nih.gov/25082343/', `<div id="full-view-heading"><button id="full-view-journal-trigger">Ann Transplant</button>
      <span class="cit">2014 Aug 1:19:373-81.</span><h1 class="heading-title">C4d in rejection</h1>
      <div class="authors-list"><a class="full-name" href="/?term=Gierej+B">Beata Gierej</a></div>
      <span class="identifier doi"><a href="https://doi.org/10.1/x">10.1/x</a></span></div>
      <div id="eng-abstract"><p>Background: A.</p><p>Results: B.</p></div><p id="keywords">Keywords: liver.</p>
      <div id="similar"><a class="docsum-title" href="/1/">One</a></div>`)
    expect(parsePubMed()).toEqual({
      title: 'C4d in rejection',
      content: ['<post author="Beata Gierej" author-url="https://pubmed.ncbi.nlm.nih.gov/?term=Gierej+B">', 'Ann Transplant. 2014 Aug 1:19:373-81.', 'Background: A.', 'Results: B.', 'Keywords: liver.'],
      links: [
        { url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Gierej+B', score: 1 },
        { url: 'https://doi.org/10.1/x', score: 1 },
        { url: 'https://pubmed.ncbi.nlm.nih.gov/1/', score: 0.5 },
      ],
      details: [['journal', 'Ann Transplant'], ['pmid', '25082343'], ['doi', '10.1/x']],
    })
  })
})
