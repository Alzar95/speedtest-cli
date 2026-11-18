// Замер скорости скачивания: 10 последовательных полных GET-запросов.
// Скорость: Mbps (мегабит/с) и MB/s (мегабайт/с). Объём: MiB.

const url = process.argv[2];
if (!url) {
    console.error('Usage: node speedtest.js <url>');
    process.exit(1);
}

const REQUESTS = 10;
const TIMEOUT_MS = 60_000;

async function measureOnce(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const start = process.hrtime.bigint();
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // Читаем тело целиком - это гарантирует полный ответ.
        const body = await res.arrayBuffer();
        const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
        return { elapsedMs, bytes: body.byteLength };
    } finally {
        clearTimeout(timer);
    }
}

(async () => {
    let totalBytes = 0;
    let totalMs = 0;
    let okCount = 0;

    for (let i = 1; i <= REQUESTS; i++) {
        try {
            const { elapsedMs, bytes } = await measureOnce(url);
            totalBytes += bytes;
            totalMs += elapsedMs;
            okCount++;
            console.log(
                `#${i}: ${elapsedMs.toFixed(0)} ms, ${(bytes / 1024 / 1024).toFixed(2)} MiB`
            );
        } catch (e) {
            console.error(`#${i}: failed — ${e.message}`);
        }
    }

    if (okCount === 0) {
        console.error('No successful requests, cannot compute speed.');
        process.exit(1);
    }

    const avgMs = totalMs / okCount;
    const totalSeconds = totalMs / 1000;
    const mbps = (totalBytes * 8) / totalSeconds / 1e6; // мегабит/с
    const mbPerSec = totalBytes / totalSeconds / 1e6;  // мегабайт/с (десятичных)

    console.log('\n--- Result ---');
    console.log(`Successful requests : ${okCount}/${REQUESTS}`);
    console.log(`Average time       : ${avgMs.toFixed(0)} ms`);
    console.log(`Total downloaded   : ${(totalBytes / 1024 / 1024).toFixed(2)} MiB`);
    console.log(`Download speed     : ${mbps.toFixed(2)} Mbps (${mbPerSec.toFixed(2)} MB/s)`);
})();