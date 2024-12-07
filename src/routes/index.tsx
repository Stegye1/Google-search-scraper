import { $, component$, useSignal } from '@builder.io/qwik';
import { ArrowDown } from '~/components/arrow-down';
import type { SearchResult } from './api/search';

export default component$(() => {
  const query = useSignal('');
  const downloadLink = useSignal('');
  const isLoading = useSignal(false); 

  // asynchronní funkce pro odeslání požadavku na API
  const fetchResults = $(async () => {
    isLoading.value = true;
    try {
    const response = await fetch('/api/search/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.value }),
    });   

    const data: SearchResult[] = await response.json();  
  
    // blob kontejner na uložení výsledků vyhledávání umožňuje vytvoření dočasné url
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadLink.value = URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching results:', error);
    alert('Došlo k chybě při načítání výsledků. Zkuste to prosím znovu.');
  }  finally {
    isLoading.value = false; 
  }
  });

  return (
    <div class="space-y-4 pt-20 text-center text-[rgb(249,223,220)]">
      <h1 class="text-3xl font-semibold text-[rgb(61,145,175)]">Google Search Scraper</h1>
      <div class="space-x-5">
      <input
        class="w-60 rounded bg-[rgb(249,223,220)] px-4 text-black"
        type="text"
        value={query.value}
        onInput$={(e) => {(query.value = (e.target as HTMLInputElement).value)}}
        onKeyDown$={(e) => {
          if ((e as KeyboardEvent).key === 'Enter') {
            fetchResults();
          }
        }}
        placeholder="Zadejte slovo pro vyhledání"
      />
      <button class="rounded border border-white px-4" onClick$={fetchResults}>Vyhledat</button>
      </div>
      {isLoading.value && (
         <div class="flex justify-center">
         <ArrowDown class=" animate-pulse text-[rgb(249,223,220)]" />
       </div>
      )}
      {downloadLink.value && !isLoading.value && (
        <div>
           <div class="flex justify-center"><ArrowDown class=" text-center text-[rgb(242,211,208)]"/></div>
        <a href={downloadLink.value} download="results.json">
         Stáhnout výsledky
        </a>
        </div>
      )}    
    </div>
  );
});

