# Simple Upload

## Overview
**Simple Upload** is a secure web application for uploading one or multiple files to an Azure Blob Storage container.  
It features a Python Flask backend and a modern, drag-and-drop web UI (React via CDN).  
The backend uses Azure Managed Identity for secure access—no secrets or SAS keys are stored in code or configuration.

## Features
- Upload single or multiple files (including multi-TB files, chunked upload)
- Drag-and-drop or click-to-select files
- Modern, responsive UI with theme switcher (Gray, Mint, Lavender, Sand, High Contrast)
- Upload progress and retry on network errors/timeouts
- Uses Azure Managed Identity for storage access
- Easy deployment to Azure using ARM templates

## Prerequisites
- Azure subscription
- Python 3.11+ and pip

## Quick Deploy

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FExeqZ%2Fsimple-upload%2Fmain%2Finfra%2Fazuredeploy.json)

> The "Deploy to Azure" button uses an ARM template (`infra/azuredeploy.json`).  
> After deployment, assign the "Storage Blob Data Contributor" role to the Web App's managed identity on the Storage Account.

## Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ExeqZ/simple-upload.git
cd simple-upload
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
Set these environment variables:
```
AZURE_STORAGE_ACCOUNT_NAME=<your_storage_account_name>
AZURE_STORAGE_CONTAINER_NAME=<your_container_name>
PORT=3000
```

### 4. Run the Application
```bash
python app.py
```
Visit `http://localhost:3000` to use the app.

## Web Interface

- The web UI is accessible at `/` and supports drag-and-drop or click-to-select file uploads.
- You can switch between modern, discreet color themes (Gray, Mint, Lavender, Sand, High Contrast) using the cogwheel in the top right.
- The selected theme is saved in a cookie and persists across sessions.
- A modern Unsplash image is used as a header for visual appeal.

## Azure Deployment

- The ARM template provisions a Linux App Service with Python 3.11.
- The startup command is set automatically:  
  `gunicorn -w 4 -b 0.0.0.0:8000 app:app`
- Deploy using the Azure Portal or CLI as before.
- After deployment, assign the "Storage Blob Data Contributor" role to the Web App's managed identity on the Storage Account.

## Uploading Files via Script

You can upload files to the service using a script in any language that supports HTTP POST with multipart/form-data.

### Bash (using `curl`)

```bash
curl -F "files=@/path/to/yourfile.txt" https://<your-app-service-url>/api/upload
```

For multiple files:

```bash
curl -F "files=@/path/to/file1.txt" -F "files=@/path/to/file2.jpg" https://<your-app-service-url>/api/upload
```

### PowerShell

```powershell
Invoke-RestMethod -Uri "https://<your-app-service-url>/api/upload" `
  -Method Post `
  -Form @{ files = Get-Item "C:\path\to\yourfile.txt" }
```

For multiple files:

```powershell
Invoke-RestMethod -Uri "https://<your-app-service-url>/api/upload" `
  -Method Post `
  -Form @{
      files = Get-Item "C:\path\to\file1.txt"
      files = Get-Item "C:\path\to\file2.jpg"
  }
```

### Python

```python
import requests

url = "https://<your-app-service-url>/api/upload"
files = {'files': open('yourfile.txt', 'rb')}
response = requests.post(url, files=files)
print(response.json())
```

For multiple files:

```python
import requests

url = "https://<your-app-service-url>/api/upload"
files = [
    ('files', open('file1.txt', 'rb')),
    ('files', open('file2.jpg', 'rb'))
]
response = requests.post(url, files=files)
print(response.json())
```

### Notes

- Replace `<your-app-service-url>` with your deployed app's URL (e.g., `simple-upload-web-ne-01.azurewebsites.net`).
- The API endpoint is `/api/upload`.
- The form field name must be `files` for each file.

## Security

- The Web App uses a system-assigned managed identity.
- The identity is granted "Storage Blob Data Contributor" on the storage account.
- No secrets or SAS keys are used or stored.

## License

GPL License

## Acknowledgments

- Azure SDK for Python
- Flask
- React (via CDN)
- Unsplash (header image)