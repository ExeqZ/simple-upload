import React from 'react';
import FileUpload from './components/FileUpload';

const App: React.FC = () => {
    return (
        <div>
            <h1>File Upload to Azure Blob Storage</h1>
            <FileUpload />
        </div>
    );
};

export default App;