import sharp from "sharp";

async function resize(path: string, name: string) {
  console.log(`Resizing ${name}`);

  const resizes = [
    [180, 128],
  ];

  for (const [width, height] of resizes) {
    await sharp(path)
      .resize(width, height)
      .png()
      .toFile(`${name}_${width}x${height}.png`);
  }
}

await resize("./isologo.png", "isologo");
