/**
 * Traducción ES → EN vía MyMemory (gratis, sin API key).
 * Límite aprox. ~500 caracteres por petición; textos largos se trocean.
 */

const CHUNK_SIZE = 450;

type MyMemoryResponse = {
    responseStatus: number;
    responseDetails?: string;
    responseData?: { translatedText?: string };
};

async function translateChunk(text: string): Promise<string> {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|en`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('No se pudo conectar con el servicio de traducción.');
    }

    const data = (await res.json()) as MyMemoryResponse;
    if (data.responseStatus !== 200) {
        throw new Error(data.responseDetails ?? 'Traducción no disponible (límite diario o texto inválido).');
    }

    const translated = data.responseData?.translatedText?.trim();
    if (!translated) {
        throw new Error('El servicio no devolvió traducción.');
    }

    return translated;
}

function splitIntoChunks(text: string, maxLen: number): string[] {
    if (text.length <= maxLen) return [text];

    const chunks: string[] = [];
    let rest = text;

    while (rest.length > maxLen) {
        let cut = rest.lastIndexOf('\n', maxLen);
        if (cut < maxLen * 0.4) cut = rest.lastIndexOf('. ', maxLen);
        if (cut < maxLen * 0.4) cut = rest.lastIndexOf(' ', maxLen);
        if (cut < 1) cut = maxLen;

        chunks.push(rest.slice(0, cut).trim());
        rest = rest.slice(cut).trim();
    }

    if (rest) chunks.push(rest);
    return chunks.filter(Boolean);
}

export async function translateEsToEn(text: string): Promise<string> {
    const trimmed = text.trim();
    if (!trimmed) return '';

    const chunks = splitIntoChunks(trimmed, CHUNK_SIZE);
    const parts: string[] = [];

    for (const chunk of chunks) {
        parts.push(await translateChunk(chunk));
    }

    return parts.join(chunks.length > 1 && trimmed.includes('\n') ? '\n' : ' ');
}
