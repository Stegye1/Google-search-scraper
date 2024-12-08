import { type RequestHandler } from '@builder.io/qwik-city';
import puppeteer from 'puppeteer';

// typ pro strukturu výsledků vyhledávání
export type SearchResult = {
  title: string;
  link: string;
  snippet: string;
};

// handler HTTP požadavku typu POST, který
// 1. Přijme dotaz (`query`) od klienta.
// 2. Použije Puppeteer ke spuštění prohlížeče a načtení stránky s výsledky Google vyhledávání.
// 3. Provede scraping výsledků a extrahuje titulek, odkaz a úryvek.
// 4. Vrátí výsledky klientovi.
export const onPost: RequestHandler = async ({ request, json }) => {
  // Z těla požadavku POST se extrahuje hodnota `query`
    const { query } = await request.json();
    
    // puppeteer spustí na pozadí instanci prohlížeče a otevře novou stránku
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

     // nastavení uživatelského agenta pro simulaci běžného prohlížeče (Chrome), aby puppeteer nebyl identifikován
     // jako automatizovaný nástroj, což by mohlo vést k blokaci přístupu nebo nestandardním výsledkům
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    // načtení stránky výsledků Google vyhledávání pro zadaný dotaz `query`.
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);

    // scraping výsledků
    const results: SearchResult[] = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('div.g'))
        .map((el) => ({
          title: el.querySelector('h3')?.textContent || '',
          link: el.querySelector('a')?.href || '',
          snippet: el.querySelector('.VwiC3b')?.textContent || '',
        }))
        .filter((result) => result.title);
    }); 

    // uzavření Puppeteeru
    await browser.close();

    // vrácení odpovědi ve formátu json
    json(200, results);
  
};
