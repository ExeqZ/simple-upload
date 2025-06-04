import express from 'express';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

router.post('/', upload.array('files'), async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded.' });
    }
    if (!storageAccountName || !containerName) {
        return res.status(500).json({ error: 'Storage configuration missing.' });
    }

    try {
        const credential = new DefaultAzureCredential();
        const blobServiceClient = new BlobServiceClient(
            `https://${storageAccountName}.blob.core.windows.net`,
            credential
        );
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const uploadPromises = files.map(async (file) => {
            const blobName = `${uuidv4()}-${file.originalname}`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.uploadData(file.buffer);
            return blobName;
        });

        const uploadedFiles = await Promise.all(uploadPromises);
        res.status(200).json({ uploadedFiles });
    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({ error: 'Error uploading files.' });
    }
});

export default router;