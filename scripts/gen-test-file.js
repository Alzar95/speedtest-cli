// Генерирует test-10mb.bin случайными байтами — для локального замера скорости.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SIZE_MB = 10;
const out = path.join(__dirname, '..', 'test-10mb.bin');
const chunk = crypto.randomBytes(1024 * 1024); // 1 MiB

const fd = fs.openSync(out, 'w');
for (let i = 0; i < SIZE_MB; i++) fs.writeSync(fd, chunk);
fs.closeSync(fd);

console.log(`Created ${out} (${SIZE_MB} MiB)`);