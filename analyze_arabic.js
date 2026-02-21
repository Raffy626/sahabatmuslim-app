async function analyze() {
  try {
    const res = await fetch('https://equran.id/api/v2/surat/1');
    const json = await res.json();
    const text = json.data.ayat[1].teksArab; // Ayah 2
    
    console.log('Original Text:', text);
    console.log('Unicode sequence:');
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const code = text.charCodeAt(i).toString(16).padStart(4, '0');
        console.log(`${char} (U+${code})`);
    }
  } catch (e) {
    console.error(e);
  }
}

analyze();
