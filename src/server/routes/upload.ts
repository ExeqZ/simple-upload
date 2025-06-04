import express from 'express';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

router.post('/upload', upload.array('files'), async (req, res) => {
    if (!req.files) {
        return res.status(400).send('No files uploaded.');
    }

    try {
        // Use Managed Identity (DefaultAzureCredential)
        const credential = new DefaultAzureCredential();
        const blobServiceClient = new BlobServiceClient(
            `https://${storageAccountName}.blob.core.windows.net`,
            credential
        );
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const uploadPromises = req.files.map(async (file) => {
            const blobName = `${uuidv4()}-${file.originalname}`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.uploadData(file.buffer);
            return blobName;
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        res.status(200).json({ uploadedFiles });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).send('Error uploading files.');
    }
});

export default router;