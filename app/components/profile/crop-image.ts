import type { Area } from "react-easy-crop";
import { AVATAR_EXPORT_SIZE } from "~/validators/profile-validator";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Não foi possível ler a imagem. Tente outro arquivo."));
    image.src = src;
  });
}

/**
 * Recorta a área selecionada e exporta um quadrado webp pronto para upload.
 * Espelha o processamento do servidor (512px), então o arquivo final fica na
 * casa das dezenas de KB — bem abaixo do limite de 2 MB do backend.
 */
export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  size: number = AVATAR_EXPORT_SIZE,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Seu navegador não suporta edição de imagem.");
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size,
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.8),
  );
  if (!blob) {
    throw new Error("Não foi possível processar a imagem. Tente novamente.");
  }
  return blob;
}

/** Lê o arquivo original como data URL para alimentar o editor. */
export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error("Não foi possível ler o arquivo. Tente novamente."));
    reader.readAsDataURL(file);
  });
}
