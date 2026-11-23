"""Generate the storefront icon for dsh-douyin-window (GitHub-hosted raster)."""
from PIL import Image, ImageDraw, ImageFont

SIZE = 180
img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Dark Douyin tile with a cyan-to-pink diagonal wash.
for y in range(SIZE):
    t = y / (SIZE - 1)
    color = (
        round(24 + (10 - 24) * t),
        round(24 + (10 - 24) * t),
        round(30 + (16 - 30) * t),
        255,
    )
    draw.line([(0, y), (SIZE, y)], fill=color)

wash = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
wash_draw = ImageDraw.Draw(wash)
wash_draw.ellipse([-70, -90, 120, 90], fill=(37, 244, 238, 60))
wash_draw.ellipse([70, 90, 250, 280], fill=(254, 44, 85, 70))
img = Image.alpha_composite(img, wash)

# Rounded square mask.
mask = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=40, fill=255)
img.putalpha(mask)

# White 抖 glyph, optically centred.
font = ImageFont.truetype("C:/Windows/Fonts/msyhbd.ttc", 100)
draw = ImageDraw.Draw(img)
text = "抖"
left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
draw.text(
    ((SIZE - (right - left)) / 2 - left, (SIZE - (bottom - top)) / 2 - top - 2),
    text,
    font=font,
    fill=(255, 255, 255, 255),
)

img.save("assets/icon-180.png")
print("wrote assets/icon-180.png", img.size)
