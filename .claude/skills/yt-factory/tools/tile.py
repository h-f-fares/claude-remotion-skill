"""tile.py - lay storyboard panels out on one sheet with big panel numbers (called by storyboard.mjs)."""
import json, sys
from PIL import Image, ImageDraw, ImageFont

spec = json.load(open(sys.argv[1]))
panels = spec["panels"]
W = 360  # panel width on the sheet
imgs = [Image.open(p["file"]).convert("RGB") for p in panels]
H = round(W * imgs[0].height / imgs[0].width)
cols = min(5, len(imgs)); rows = (len(imgs) + cols - 1) // cols
sheet = Image.new("RGB", (cols * W + (cols + 1) * 16, rows * (H + 16) + 16), (20, 20, 20))
font = ImageFont.load_default(size=56)
small = ImageFont.load_default(size=26)
for i, (p, im) in enumerate(zip(panels, imgs)):
    x = 16 + (i % cols) * (W + 16); y = 16 + (i // cols) * (H + 16)
    sheet.paste(im.resize((W, H)), (x, y))
    d = ImageDraw.Draw(sheet)
    d.rounded_rectangle((x + 10, y + 10, x + 110, y + 82), 14, fill=(0, 0, 0))
    d.text((x + 60, y + 46), p["label"], font=font, fill=(255, 255, 255), anchor="mm")
    d.text((x + W - 12, y + 30), p["t"] + "s", font=small, fill=(255, 255, 255), anchor="rm", stroke_width=3, stroke_fill=(0, 0, 0))
sheet.save(spec["out"])
print(f"storyboard: {len(panels)} panels -> {spec['out']}")
