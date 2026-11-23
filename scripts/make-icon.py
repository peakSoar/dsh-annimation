"""Generate the storefront icon for dsh-hongguo-window (GitHub-hosted raster)."""
from PIL import Image, ImageDraw, ImageFont

SIZE = 180
img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Vertical brand gradient (红果 red-orange -> deep red), drawn as scanlines.
start = (255, 90, 60)
end = (255, 45, 85)
for y in range(SIZE):
    t = y / (SIZE - 1)
    color = tuple(round(start[i] + (end[i] - start[i]) * t) for i in range(3)) + (255,)
    draw.line([(0, y), (SIZE, y)], fill=color)

# Rounded square mask.
mask = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=40, fill=255)
img.putalpha(mask)

# Soft highlight in the upper-left corner.
glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
ImageDraw.Draw(glow).ellipse([-60, -80, 130, 90], fill=(255, 255, 255, 38))
img = Image.alpha_composite(img, Image.composite(glow, Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0)), mask))

# White 红 glyph, optically centred.
font = ImageFont.truetype("C:/Windows/Fonts/msyhbd.ttc", 104)
draw = ImageDraw.Draw(img)
text = "红"
left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
draw.text(
    ((SIZE - (right - left)) / 2 - left, (SIZE - (bottom - top)) / 2 - top - 2),
    text,
    font=font,
    fill=(255, 255, 255, 255),
)

img.save("assets/icon-180.png")
print("wrote assets/icon-180.png", img.size)
