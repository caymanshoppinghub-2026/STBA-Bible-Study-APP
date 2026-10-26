import zlib
import struct

def make_png(width, height, r, g, b, outfile):
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr_crc = struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data))
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + ihdr_crc
    
    # Raw scanlines: each line starts with filter byte 0x00 followed by RGB
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter type 0 (None)
        for x in range(width):
            # Circular badge with gold ring
            dx = x - width / 2
            dy = y - height / 2
            dist = (dx*dx + dy*dy)**0.5
            radius = width * 0.44
            
            # Gold ring
            if abs(dist - radius) < max(2, width * 0.02):
                # Gold
                raw_data.extend([0xF3, 0xCF, 0x65])
            elif dist < radius:
                # Deep navy blue gradient
                factor = 1.0 - (dist / radius) * 0.4
                raw_data.extend([
                    int(r * factor),
                    int(g * factor),
                    int(b * factor)
                ])
            else:
                # Outer deep navy background
                raw_data.extend([0x06, 0x16, 0x2C])
                
    compressed = zlib.compress(bytes(raw_data), 9)
    idat_crc = struct.pack('>I', zlib.crc32(b'IDAT' + compressed))
    png += struct.pack('>I', len(compressed)) + b'IDAT' + compressed + idat_crc
    
    # IEND chunk
    iend_crc = struct.pack('>I', zlib.crc32(b'IEND'))
    png += struct.pack('>I', 0) + b'IEND' + iend_crc
    
    with open(outfile, 'wb') as f:
        f.write(png)
    print(f"Generated {outfile}: {width}x{height}")

if __name__ == '__main__':
    # Generate PWA icons: 192x192, 512x512, 180x180
    make_png(192, 192, 13, 48, 96, 'public/pwa-192x192.png')
    make_png(512, 512, 13, 48, 96, 'public/pwa-512x512.png')
    make_png(512, 512, 13, 48, 96, 'public/pwa-maskable-512x512.png')
    make_png(180, 180, 13, 48, 96, 'public/apple-touch-icon.png')
