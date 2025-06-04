export interface FileUploadResponse {
    success: boolean;
    message: string;
    fileUrl?: string;
}

export interface FileUploadRequest {
    files: File[];
}

export interface UploadProgress {
    fileName: string;
    progress: number;
}