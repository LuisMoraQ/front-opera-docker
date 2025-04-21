/// <reference lib="webworker" />
import * as LZString from 'lz-string';

addEventListener('message', ({ data }) => {
  const { action, text } = data;

  if (action === 'compress') {
    // Comprimir el texto usando LZString
    const compressedText = LZString.compressToUTF16(text);
    // Enviar de vuelta el resultado al hilo principal
    postMessage({ action: 'compressed', result: compressedText });
  } else if (action === 'decompress') {
    // Descomprimir el texto usando LZString
    const decompressedText = LZString.decompressFromUTF16(text);
    // Enviar de vuelta el resultado al hilo principal
    postMessage({ action: 'decompressed', result: decompressedText });
  }
});