"""Generate local PWA icons from the original RuotaGyn mark (requires Pillow)."""

from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1] / "public" / "icons"


def icon(size, maskable=False):
    scale = 3
    image = Image.new("RGB", (size * scale, size * scale), "#425c51")
    draw = ImageDraw.Draw(image)
    unit = size * scale / 512

    def box(values):
        return tuple(round(value * unit) for value in values)

    def line(points, color, width):
        draw.line(box(points), fill=color, width=round(width * unit))

    draw.ellipse(box((104, 104, 408, 408)), outline="#d7dfcd", width=round(32 * unit))
    draw.arc(box((104, 104, 408, 408)), 270, 360, fill="#e9c5b4", width=round(32 * unit))
    draw.ellipse(box((158, 158, 354, 354)), outline="#a9b5a3", width=round(3 * unit))
    line((256, 256, 322, 166), "#faf8ef", 14)
    draw.ellipse(box((234, 234, 278, 278)), fill="#faf8ef")
    draw.ellipse(box((244, 92, 268, 116)), fill="#faf8ef")
    filename = f"maskable-{size}.png" if maskable else f"icon-{size}.png"
    image.resize((size, size), Image.Resampling.LANCZOS).save(ROOT / filename)


if __name__ == "__main__":
    ROOT.mkdir(parents=True, exist_ok=True)
    icon(192)
    icon(512)
    icon(512, maskable=True)
