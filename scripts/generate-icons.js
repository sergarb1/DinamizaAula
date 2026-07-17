import sharp from 'sharp'
import { resolve } from 'path'
import { readFileSync } from 'fs'

const sizes = [48, 72, 96, 128, 144, 152, 192, 384, 512]
const publicDir = resolve('public')

async function generate() {
  const svgContent = readFileSync(resolve(publicDir, 'favicon.svg'), 'utf-8')
  const svgBuffer = Buffer.from(svgContent)

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(resolve(publicDir, `icon-${size}.png`))
    console.log(`Created icon-${size}.png`)
  }

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(resolve(publicDir, 'apple-touch-icon.png'))
  console.log('Created apple-touch-icon.png')
}

generate().catch(console.error)
