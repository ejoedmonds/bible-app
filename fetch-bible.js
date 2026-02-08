/**
 * Sacred Scripture — Bible Data Fetcher
 * 
 * Downloads the complete ASV (American Standard Version) Bible text
 * from bible-api.com and saves it as a compact JSON file for bundling.
 * 
 * Usage: node scripts/fetch-bible.js
 * 
 * The ASV (1901) is in the public domain and free to distribute.
 * bible-api.com provides it free with CORS support.
 * 
 * Rate limit: 15 requests per 30 seconds — the script handles this.
 */

import fs from 'fs';
import path from 'path';

const BIBLE_API = 'https://bible-api.com/data';
const TRANSLATION = 'asv';
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'asv.json');

const BOOKS = [
  { id: 'GEN', name: 'Genesis', chapters: 50 },
  { id: 'EXO', name: 'Exodus', chapters: 40 },
  { id: 'LEV', name: 'Leviticus', chapters: 27 },
  { id: 'NUM', name: 'Numbers', chapters: 36 },
  { id: 'DEU', name: 'Deuteronomy', chapters: 34 },
  { id: 'JOS', name: 'Joshua', chapters: 24 },
  { id: 'JDG', name: 'Judges', chapters: 21 },
  { id: 'RUT', name: 'Ruth', chapters: 4 },
  { id: '1SA', name: '1 Samuel', chapters: 31 },
  { id: '2SA', name: '2 Samuel', chapters: 24 },
  { id: '1KI', name: '1 Kings', chapters: 22 },
  { id: '2KI', name: '2 Kings', chapters: 25 },
  { id: '1CH', name: '1 Chronicles', chapters: 29 },
  { id: '2CH', name: '2 Chronicles', chapters: 36 },
  { id: 'EZR', name: 'Ezra', chapters: 10 },
  { id: 'NEH', name: 'Nehemiah', chapters: 13 },
  { id: 'EST', name: 'Esther', chapters: 10 },
  { id: 'JOB', name: 'Job', chapters: 42 },
  { id: 'PSA', name: 'Psalms', chapters: 150 },
  { id: 'PRO', name: 'Proverbs', chapters: 31 },
  { id: 'ECC', name: 'Ecclesiastes', chapters: 12 },
  { id: 'SNG', name: 'Song of Solomon', chapters: 8 },
  { id: 'ISA', name: 'Isaiah', chapters: 66 },
  { id: 'JER', name: 'Jeremiah', chapters: 52 },
  { id: 'LAM', name: 'Lamentations', chapters: 5 },
  { id: 'EZK', name: 'Ezekiel', chapters: 48 },
  { id: 'DAN', name: 'Daniel', chapters: 12 },
  { id: 'HOS', name: 'Hosea', chapters: 14 },
  { id: 'JOL', name: 'Joel', chapters: 3 },
  { id: 'AMO', name: 'Amos', chapters: 9 },
  { id: 'OBA', name: 'Obadiah', chapters: 1 },
  { id: 'JON', name: 'Jonah', chapters: 4 },
  { id: 'MIC', name: 'Micah', chapters: 7 },
  { id: 'NAM', name: 'Nahum', chapters: 3 },
  { id: 'HAB', name: 'Habakkuk', chapters: 3 },
  { id: 'ZEP', name: 'Zephaniah', chapters: 3 },
  { id: 'HAG', name: 'Haggai', chapters: 2 },
  { id: 'ZEC', name: 'Zechariah', chapters: 14 },
  { id: 'MAL', name: 'Malachi', chapters: 4 },
  { id: 'MAT', name: 'Matthew', chapters: 28 },
  { id: 'MRK', name: 'Mark', chapters: 16 },
  { id: 'LUK', name: 'Luke', chapters: 24 },
  { id: 'JHN', name: 'John', chapters: 21 },
  { id: 'ACT', name: 'Acts', chapters: 28 },
  { id: 'ROM', name: 'Romans', chapters: 16 },
  { id: '1CO', name: '1 Corinthians', chapters: 16 },
  { id: '2CO', name: '2 Corinthians', chapters: 13 },
  { id: 'GAL', name: 'Galatians', chapters: 6 },
  { id: 'EPH', name: 'Ephesians', chapters: 6 },
  { id: 'PHP', name: 'Philippians', chapters: 4 },
  { id: 'COL', name: 'Colossians', chapters: 4 },
  { id: '1TH', name: '1 Thessalonians', chapters: 5 },
  { id: '2TH', name: '2 Thessalonians', chapters: 3 },
  { id: '1TI', name: '1 Timothy', chapters: 6 },
  { id: '2TI', name: '2 Timothy', chapters: 4 },
  { id: 'TIT', name: 'Titus', chapters: 3 },
  { id: 'PHM', name: 'Philemon', chapters: 1 },
  { id: 'HEB', name: 'Hebrews', chapters: 13 },
  { id: 'JAS', name: 'James', chapters: 5 },
  { id: '1PE', name: '1 Peter', chapters: 5 },
  { id: '2PE', name: '2 Peter', chapters: 3 },
  { id: '1JN', name: '1 John', chapters: 5 },
  { id: '2JN', name: '2 John', chapters: 1 },
  { id: '3JN', name: '3 John', chapters: 1 },
  { id: 'JUD', name: 'Jude', chapters: 1 },
  { id: 'REV', name: 'Revelation', chapters: 22 },
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchChapter(bookId, chapter) {
  const url = `${BIBLE_API}/${TRANSLATION}/${bookId}/${chapter}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const data = await res.json();
  return data;
}

async function main() {
  console.log('📖 Sacred Scripture — ASV Bible Fetcher');
  console.log('========================================\n');

  const bible = {};
  const totalChapters = BOOKS.reduce((sum, b) => sum + b.chapters, 0);
  let fetched = 0;
  let requestCount = 0;

  for (const book of BOOKS) {
    bible[book.name] = {};
    console.log(`📗 ${book.name} (${book.chapters} chapters)`);

    for (let ch = 1; ch <= book.chapters; ch++) {
      try {
        // Rate limiting: pause every 12 requests
        if (requestCount > 0 && requestCount % 12 === 0) {
          console.log('   ⏳ Rate limit pause (30s)...');
          await sleep(30000);
        }

        const data = await fetchChapter(book.id, ch);
        const verses = {};

        if (data.verses) {
          for (const v of data.verses) {
            verses[v.verse] = v.text.trim();
          }
        }

        bible[book.name][ch] = verses;
        fetched++;
        requestCount++;

        const pct = ((fetched / totalChapters) * 100).toFixed(1);
        process.stdout.write(`   Ch ${ch}/${book.chapters} ✓ (${pct}% total)\r`);

        // Small delay between requests
        await sleep(500);
      } catch (err) {
        console.error(`\n   ❌ Error fetching ${book.name} ${ch}: ${err.message}`);
        // Retry after longer pause
        await sleep(10000);
        try {
          const data = await fetchChapter(book.id, ch);
          const verses = {};
          if (data.verses) {
            for (const v of data.verses) {
              verses[v.verse] = v.text.trim();
            }
          }
          bible[book.name][ch] = verses;
          fetched++;
          requestCount++;
        } catch (err2) {
          console.error(`   ❌ Retry failed: ${err2.message}`);
          bible[book.name][ch] = { 1: '[Error fetching this chapter. Please re-run the script.]' };
          fetched++;
        }
      }
    }
    console.log(); // newline after book
  }

  // Save to file
  console.log(`\n💾 Saving to ${OUTPUT_FILE}...`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(bible));

  const fileSizeKB = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(0);
  console.log(`✅ Done! ${fetched}/${totalChapters} chapters saved (${fileSizeKB} KB)`);
  console.log('\nThe ASV Bible data is now bundled with your app.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
