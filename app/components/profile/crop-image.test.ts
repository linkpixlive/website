import { afterEach, describe, expect, it, vi } from "vitest";
import { AVATAR_EXPORT_SIZE } from "~/api/modules/profile";
import { getCroppedImage, readFileAsDataUrl } from "./crop-image";

/** jsdom não carrega recursos: `Image` real nunca dispara `onload`. */
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  width = 1000;
  height = 800;
  set src(_value: string) {
    queueMicrotask(() => this.onload?.());
  }
}

vi.stubGlobal("Image", FakeImage);

afterEach(() => {
  vi.restoreAllMocks();
});

function mockCanvas(toBlobResult: Blob | null) {
  const drawImage = vi.fn();
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    { drawImage } as unknown as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
    (callback: BlobCallback) => callback(toBlobResult),
  );
  return { drawImage };
}

describe("getCroppedImage", () => {
  it("exporta o quadrado 512px webp a partir da área selecionada", async () => {
    const { drawImage } = mockCanvas(
      new Blob(["fake-webp"], { type: "image/webp" }),
    );

    const blob = await getCroppedImage("data:image/png;base64,xxx", {
      x: 10,
      y: 20,
      width: 300,
      height: 300,
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(drawImage).toHaveBeenCalledTimes(1);
    const [, sx, sy, sw, sh, dx, dy, dw, dh] =
      drawImage.mock.calls[0] as unknown[];
    expect([sx, sy, sw, sh]).toEqual([10, 20, 300, 300]);
    expect([dx, dy, dw, dh]).toEqual([
      0,
      0,
      AVATAR_EXPORT_SIZE,
      AVATAR_EXPORT_SIZE,
    ]);
  });

  it("falha com mensagem amigável sem suporte a canvas", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    await expect(
      getCroppedImage("data:image/png;base64,xxx", {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      }),
    ).rejects.toThrow("não suporta");
  });

  it("falha com mensagem amigável quando o export retorna nulo", async () => {
    mockCanvas(null);

    await expect(
      getCroppedImage("data:image/png;base64,xxx", {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      }),
    ).rejects.toThrow("Não foi possível processar");
  });
});

describe("readFileAsDataUrl", () => {
  it("lê o arquivo como data URL", async () => {
    const file = new File(["hello"], "avatar.png", { type: "image/png" });
    const url = await readFileAsDataUrl(file);
    expect(url.startsWith("data:image/png;base64,")).toBe(true);
  });
});
