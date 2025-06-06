import os
from flask import Flask, request, jsonify, render_template
from azure.identity import DefaultAzureCredential
from azure.storage.blob import BlobServiceClient
from uuid import uuid4

app = Flask(__name__, template_folder="templates", static_folder="static")

AZURE_STORAGE_ACCOUNT_NAME = os.environ.get('AZURE_STORAGE_ACCOUNT_NAME')
AZURE_STORAGE_CONTAINER_NAME = os.environ.get('AZURE_STORAGE_CONTAINER_NAME')

def get_blob_service_client():
    credential = DefaultAzureCredential()
    blob_service_client = BlobServiceClient(
        f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net",
        credential=credential
    )
    return blob_service_client

@app.route('/api/upload', methods=['POST'])
def upload():
    if 'files' not in request.files:
        return jsonify({'error': 'No files uploaded.'}), 400

    files = request.files.getlist('files')
    if not files:
        return jsonify({'error': 'No files uploaded.'}), 400

    try:
        blob_service_client = get_blob_service_client()
        container_client = blob_service_client.get_container_client(AZURE_STORAGE_CONTAINER_NAME)
        uploaded_files = []
        for file in files:
            blob_name = f"{uuid4()}-{file.filename}"
            blob_client = container_client.get_blob_client(blob_name)
            blob_client.upload_blob(file, overwrite=True)
            uploaded_files.append(blob_name)
        return jsonify({'uploadedFiles': uploaded_files}), 200
    except Exception as e:
        print(f"Error uploading files: {e}")
        return jsonify({'error': 'Error uploading files.'}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port)
