import shutil
import os
from PIL import Image, ImageOps, ImageFilter

brain_dir = r'C:\Users\gowth\.gemini\antigravity\brain\4d33d6c3-709d-46d8-86ab-63f2bdda52fb'
dest_dir = r'C:\Users\gowth\OneDrive\Documents\GitHub\perfume\public\images\custom_thenee'
os.makedirs(dest_dir, exist_ok=True)

# 1. Map generated images
image_mapping = {
    'herbal-tea-product.jpg': 'herbal_tea_product_1794453540227.jpg',
    'bliss-tea-product.jpg': 'bliss_tea_product_1794453559715.jpg',
    'moringa-powder-product.jpg': 'moringa_powder_product_1794453577342.jpg',
    'food-podis-product.jpg': 'food_podis_product_1794453599481.jpg',
    'herbal-tea-scene.jpg': 'herbal_tea_scene_1794453620606.jpg',
    'bliss-tea-scene.jpg': 'bliss_tea_scene_1794453645413.jpg',
    'moringa-scene.jpg': 'moringa_scene_1794453668832.jpg',
    'podis-scene.jpg': 'podis_scene_1794453694880.jpg',
}

for dest_name, src_name in image_mapping.items():
    src_p = os.path.join(brain_dir, src_name)
    dest_p = os.path.join(dest_dir, dest_name)
    shutil.copyfile(src_p, dest_p)
    print(f"Copied {dest_name}")

# 2. Let's create beautiful transparent / rounded cutout PNGs for the Hero flying bottle animation
# For an e-commerce hero bottle, we want a clean portrait-oriented product cutout with a transparent background or soft rounded badge
def make_hero_cutout(img_path, out_png_path, bg_color_check='white'):
    im = Image.open(img_path).convert("RGBA")
    w, h = im.size
    print(f"Processing cutout for {os.path.basename(img_path)}: {w}x{h}")

    # Create a soft vignette/mask so the central product glows smoothly on any background
    # We can create a mask with rounded-pill/oval shape with feathered edges
    mask = Image.new('L', (w, h), 0)
    from PIL import ImageDraw
    draw = ImageDraw.Draw(mask)
    # Centered oval/pill
    pad_x = int(w * 0.08)
    pad_y = int(h * 0.04)
    draw.ellipse([pad_x, pad_y, w - pad_x, h - pad_y], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=int(w * 0.06)))
    
    im.putalpha(mask)
    im.save(out_png_path, "PNG")
    print(f"Saved hero cutout: {out_png_path}")

make_hero_cutout(os.path.join(dest_dir, 'herbal-tea-product.jpg'), os.path.join(dest_dir, 'herbal-tea-bottle.png'))
make_hero_cutout(os.path.join(dest_dir, 'bliss-tea-product.jpg'), os.path.join(dest_dir, 'bliss-tea-bottle.png'))
make_hero_cutout(os.path.join(dest_dir, 'moringa-powder-product.jpg'), os.path.join(dest_dir, 'moringa-powder-bottle.png'))
make_hero_cutout(os.path.join(dest_dir, 'food-podis-product.jpg'), os.path.join(dest_dir, 'food-podis-bottle.png'))

# 3. Crop 4 distinct individual podi images from food_podis_product.jpg (w x h)
podis_img = Image.open(os.path.join(dest_dir, 'food-podis-product.jpg'))
pw, ph = podis_img.size
print(f"Podis product image size: {pw}x{ph}")

# Crop 4 columns from the lineup:
# Column 1: Garlic Podi (Poondu)
# Column 2: Curry Leaves Podi (Karuveppilai)
# Column 3: Moringa Leaves Podi (Murungakeerai)
# Column 4: Sesame Podi (Ellu)
podi_slices = [
    ('garlic-podi.jpg', 0.0, 0.32),
    ('curry-leaves-podi.jpg', 0.24, 0.54),
    ('moringa-podi.jpg', 0.46, 0.76),
    ('sesame-podi.jpg', 0.68, 1.0),
]

for name, x0, x1 in podi_slices:
    crop_box = (int(pw * x0), int(ph * 0.05), int(pw * x1), int(ph * 0.95))
    cropped = podis_img.crop(crop_box)
    cropped.save(os.path.join(dest_dir, name))
    print(f"Cropped {name}: {cropped.size}")

print("All custom assets generated and saved cleanly!")
