# azure-file-upload-app

## Overview
The Azure File Upload App is a modern web application that allows users to upload one or multiple files to an Azure Blob Storage container. The application features a user-friendly interface built with React and ensures secure file uploads without hardcoded secrets.

## Features
- Upload single or multiple files.
- Progress indication during file uploads.
- Secure handling of Azure credentials.
- Direct permission assignment to the web app for accessing Azure Blob Storage.

## Prerequisites
- An Azure account.
- Node.js and npm installed on your local machine.

## Setup Instructions

### Clone the Repository
```bash
git clone https://github.com/yourusername/azure-file-upload-app.git
cd azure-file-upload-app
```

### Install Dependencies
```bash
npm install
```

### Configure Azure Storage
1. Deploy the infrastructure using the provided Bicep template:
   - Navigate to the `infra` directory.
   - Use Azure CLI to deploy:
     ```bash
     az deployment group create --resource-group <your-resource-group> --template-file main.bicep --parameters @parameters.json
     ```
2. Note the connection string and container name for use in the application.

### Environment Variables
Create a `.env` file in the root of the project and add the following variables:
```
AZURE_STORAGE_CONNECTION_STRING=<your_connection_string>
AZURE_STORAGE_CONTAINER_NAME=<your_container_name>
```

### Running the Application
To start the server and client:
```bash
npm run dev
```
Visit `http://localhost:3000` in your browser to access the application.

## Deployment
To deploy the application to Azure, you can use the GitHub Actions workflow defined in `.github/workflows/deploy.yml`. Ensure that your Azure credentials are set in the repository secrets.

## Contributing
Feel free to submit issues or pull requests for improvements or bug fixes.

## License
This project is licensed under the MIT License.

## Acknowledgments
- Azure SDK for JavaScript
- React
- Express

## Deploy to Azure
[![Deploy to Azure](deploy-to-azure.svg)](https://azuredeploy.net/)