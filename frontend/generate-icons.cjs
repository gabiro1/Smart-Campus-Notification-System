const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type);
  const crcData = Buffer.concat([t, data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc32(crcData));
  return Buffer.concat([len, t, data, c]);
}

function createIcon(size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = [];
  const cx = size / 2, cy = size / 2, r = Math.min(cx, cy) * 0.75;
  const letterR = r * 0.40;

  for (let y = 0; y < size; y++) {
    raw.push(0);
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy, dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const edge = r * (0.85 + 0.15 * Math.sin(angle * 4));
      const isCircle = dist <= edge;
      const fade = Math.max(0, Math.min(1, (edge - dist) / (size * 0.02)));

      if (isCircle) {
        // Gradient background
        const grad = 0.7 + 0.3 * (1 - dist / r);
        const nx = dx / r, ny = dy / r;
        const light = Math.max(0, 0.5 + 0.5 * (-nx * 0.4 - ny * 0.6));
        let rCol = Math.floor((40 + 60 * light * grad));
        let gCol = Math.floor((100 + 100 * light * grad));
        let bCol = Math.floor((200 + 55 * light * grad));

        // Draw "U" letter in center
        const ldx = x - cx, ldy = y - cy;
        const lDist = Math.sqrt(ldx * ldx + ldy * ldy);
        const lAngle = Math.atan2(ldy, ldx);
        const leftArm = ldx < -letterR * 0.15 && ldy > -letterR * 0.7 && ldy < letterR * 0.7;
        const rightArm = ldx > letterR * 0.15 && ldy > -letterR * 0.7 && ldy < letterR * 0.7;
        const bottomCurve = lDist <= letterR * 0.5 && lDist >= letterR * 0.25 && ldy > 0 && Math.abs(ldx / letterR) < 0.6;
        const isU = leftArm || rightArm || bottomCurve;

        if (isU && lDist < letterR * 0.9) {
          rCol = 255; gCol = 255; bCol = 255;
        }

        raw.push(0xFF);
        raw.push(rCol);
        raw.push(gCol);
        raw.push(bCol);
        raw.push(Math.floor(255 * fade));
      } else {
        raw.push(0);
        raw.push(0);
        raw.push(0);
        raw.push(0);
      }
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(raw));
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), createIcon(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), createIcon(512));
fs.writeFileSync(path.join(iconsDir, 'icon-1024x1024.png'), createIcon(1024));

console.log('Created icon-192x192.png, icon-512x512.png, icon-1024x1024.png in public/icons/');
