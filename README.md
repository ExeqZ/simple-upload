# Simple Upload

## Overview
**Simple Upload** is a modern, secure web application for uploading one or multiple files to an Azure Blob Storage container. The app features a clean, intuitive React interface and a Node.js/Express backend. It uses Azure Managed Identity for secure access—no secrets or SAS keys are stored in code or configuration.

## Features
- Upload single or multiple files (including large files)
- Modern, clear, and responsive UI
- Uses Azure Managed Identity for storage access
- Easy deployment to Azure using ARM templates (no Bicep required)

## Prerequisites
- Azure subscription
- Node.js and npm

## Quick Deploy

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FExeqZ%2Fsimple-upload%2Fmain%2Finfra%2Fazuredeploy.json)

> **Note:** The "Deploy to Azure" button uses an ARM template (`infra/azuredeploy.json`).  
> No Bicep files are needed or used.

## Manual Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ExeqZ/simple-upload.git
cd simple-upload
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
The backend uses Azure Managed Identity, so no secrets are required. If running locally, set these environment variables:

```
AZURE_STORAGE_ACCOUNT_NAME=<your_storage_account_name>
AZURE_STORAGE_CONTAINER_NAME=<your_container_name>
```

### 4. Run Locally
```bash
npm run dev
```
Visit `http://localhost:3000` to use the app.

## Azure Deployment

1. Click the **Deploy to Azure** button above.
2. Fill in the required parameters (resource group, region, app name, etc).
3. After deployment, navigate to the Web App URL output in the Azure Portal.

Alternatively, you can deploy manually using the Azure CLI:
```bash
az deployment group create \
  --resource-group <your-resource-group> \
  --template-file infra/azuredeploy.json \
  --parameters @infra/parameters.json
```

## Infrastructure

All infrastructure is defined in the ARM template at `infra/azuredeploy.json`.  
You do **not** need any Bicep files.  
Parameters for deployment can be set in `infra/parameters.json`.

## Security

- The Web App uses a system-assigned managed identity.
- The identity is granted "Storage Blob Data Contributor" on the storage account.
- No secrets or SAS keys are used or stored.

## Contributing

Pull requests and issues are welcome!

## License

GPL License

## Acknowledgments

- Azure SDK for JavaScript/TypeScript
- React
- Express