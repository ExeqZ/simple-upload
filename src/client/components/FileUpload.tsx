import React, { useState } from 'react';

const FileUpload: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(Array.from(event.target.files));
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/upload', true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    setUploadProgress((event.loaded / event.total) * 100);
                }
            };

            xhr.onload = () => {
                setIsUploading(false);
                setFiles([]);
                setUploadProgress(0);
                if (xhr.status === 200) {
                    alert('Files uploaded successfully!');
                } else {
                    alert('Error uploading files');
                }
            };

            xhr.onerror = () => {
                setIsUploading(false);
                alert('Error uploading files');
            };

            xhr.send(formData);
        } catch (error) {
            setIsUploading(false);
            alert('Error uploading files');
        }
    };

    return (
        <div style={{
            maxWidth: 400,
            margin: '2rem auto',
            padding: '2rem',
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            background: '#fff',
            fontFamily: 'Segoe UI, Arial, sans-serif'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Simple Upload</h2>
            <input
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ marginBottom: 16, width: '100%' }}
            />
            <button
                onClick={handleUpload}
                disabled={isUploading || files.length === 0}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0078d4',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 16,
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    marginBottom: 16
                }}
            >
                {isUploading ? 'Uploading...' : 'Upload Files'}
            </button>
            {uploadProgress > 0 && (
                <progress value={uploadProgress} max="100" style={{ width: '100%' }} />
            )}
            {files.length > 0 && (
                <ul style={{ marginTop: 16, paddingLeft: 20 }}>
                    {files.map((file, idx) => (
                        <li key={idx}>{file.name}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FileUpload;