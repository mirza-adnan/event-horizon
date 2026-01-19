import pytesseract as pyt
from PIL import Image

img = Image.open("F:\\WebDev\\event-horizon\\image-to-text-service\\example.png")

pyt.pytesseract.tesseract_cmd = "D:\\Tesseract-OCR\\tesseract.exe"

text = pyt.image_to_string(img)
print(text)
