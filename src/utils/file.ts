import fs from 'fs';



export function fileToBase64(filePath: string): string {
  const imageBuffer = fs.readFileSync(filePath);
  return imageBuffer.toString("base64");
}