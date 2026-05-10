from PIL import Image

def remove_dark_background(input_path, output_path, threshold=40):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # Check if the pixel is dark enough to be the background
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            # Change all dark pixels to transparent
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Background removed for {input_path}")

try:
    remove_dark_background('assets/obstacle_wall.png', 'assets/obstacle_wall.png', threshold=45)
except Exception as e:
    print(f"Error: {e}")
