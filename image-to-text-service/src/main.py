import os
from flask import Flask, request, jsonify
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import io
from dotenv import load_dotenv
import sys
import threading

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
MODEL_NAME = os.getenv('MODEL_NAME', 'Salesforce/blip-image-captioning-base')
PORT = int(os.getenv('PORT', 5001))

# Global variables for model and processor
processor = None
model = None

def load_model():
    """Load the BLIP model and processor"""
    global processor, model
    print(f"Starting to load model: {MODEL_NAME}", flush=True)
    sys.stdout.flush()

    try:
        print("Loading processor...", flush=True)
        processor = BlipProcessor.from_pretrained(MODEL_NAME)
        print("Processor loaded successfully!", flush=True)

        print("Loading model (this may take a while on first run)...", flush=True)
        model = BlipForConditionalGeneration.from_pretrained(MODEL_NAME)
        print("Model loaded successfully!", flush=True)
        sys.stdout.flush()
    except Exception as e:
        print(f"ERROR loading model: {e}", flush=True)
        sys.stdout.flush()
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_status = 'loaded' if model is not None else 'loading'
    return jsonify({
        'status': 'healthy',
        'model':  MODEL_NAME,
        'model_status': model_status,
        'service': 'image-to-text'
    }), 200

@app.route('/caption', methods=['POST'])
def generate_caption():
    """Generate caption from uploaded image"""
    try:
        # Check if model is loaded
        if model is None or processor is None:
            return jsonify({'error': 'Model is still loading, please try again later'}), 503

        # Check if image is in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        file = request.files['image']

        # Read and process image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')

        # Generate caption
        inputs = processor(image, return_tensors="pt")
        outputs = model.generate(**inputs, max_length=50)
        caption = processor.decode(outputs[0], skip_special_tokens=True)

        return jsonify({
            'caption': caption,
            'model': MODEL_NAME
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/caption-url', methods=['POST'])
def generate_caption_from_url():
    """Generate caption from image URL"""
    try:
        # Check if model is loaded
        if model is None or processor is None:
            return jsonify({'error': 'Model is still loading, please try again later'}), 503

        data = request.get_json()

        if 'url' not in data:
            return jsonify({'error': 'No URL provided'}), 400

        import requests
        response = requests.get(data['url'])
        image = Image.open(io.BytesIO(response.content)).convert('RGB')

        # Generate caption
        inputs = processor(image, return_tensors="pt")
        outputs = model.generate(**inputs, max_length=50)
        caption = processor.decode(outputs[0], skip_special_tokens=True)

        return jsonify({
            'caption': caption,
            'model': MODEL_NAME,
            'source_url': data['url']
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 50, flush=True)
    print("IMAGE-TO-TEXT SERVICE STARTING", flush=True)
    print("=" * 50, flush=True)
    sys.stdout.flush()

    # Start model loading in background thread
    model_thread = threading.Thread(target=load_model, daemon=True)
    model_thread.start()

    print("=" * 50, flush=True)
    print(f"Starting Flask server on 0.0.0.0:{PORT}", flush=True)
    print("Model will load in background...", flush=True)
    print("=" * 50, flush=True)
    sys.stdout.flush()

    # Run Flask app
    app.run(host='0.0.0.0', port=PORT, debug=False)

