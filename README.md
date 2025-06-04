# Simple Upload

## Overview
**Simple Upload** is a modern, secure web application for uploading one or multiple files to an Azure Blob Storage container. The app features a clean, intuitive React interface and a Python Flask backend. It uses Azure Managed Identity for secure access—no secrets or SAS keys are stored in code or configuration.

## Features
- Upload single or multiple files (including large files)
- Modern, clear, and responsive UI
- Uses Azure Managed Identity for storage access
- Easy deployment to Azure using ARM templates

## Prerequisites
- Azure subscription
- Python 3.11+ and pip
- Node.js and npm (for the React client)

## Quick Deploy

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FExeqZ%2Fsimple-upload%2Fmain%2Finfra%2Fazuredeploy.json)

> The "Deploy to Azure" button uses an ARM template (`infra/azuredeploy.json`).

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

### 3. Install Client Dependencies
```bash
cd src/client
npm install
npm run build
cd ../..
```

### 4. Configure Environment
Set these environment variables:
```
AZURE_STORAGE_ACCOUNT_NAME=<your_storage_account_name>
AZURE_STORAGE_CONTAINER_NAME=<your_container_name>
PORT=3000
```

### 5. Run the Application
```bash
python src/server/app.py
```
Visit `http://localhost:3000` to use the app.

## Azure Deployment

- The ARM template provisions a Linux App Service with Python 3.11.
- Deploy using the Azure Portal or CLI as before.
- After deployment, assign the "Storage Blob Data Contributor" role to the Web App's managed identity on the Storage Account.

## Security

- The Web App uses a system-assigned managed identity.
- The identity is granted "Storage Blob Data Contributor" on the storage account.
- No secrets or SAS keys are used or stored.

## License

GPL License

## Acknowledgments

- Azure SDK for Python
- Flask
- React