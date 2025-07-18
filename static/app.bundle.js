// Ensure React and ReactDOM are available globally
if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
  throw new Error('React and ReactDOM must be loaded before this script.');
}
const { useState, useRef, useEffect } = React;

// Theme definitions
const THEMES = [
  { value: '', label: 'Gray', aria: 'Gray' },
  { value: 'theme-mint', label: 'Mint', aria: 'Mint' },
  { value: 'theme-lavender', label: 'Lavender', aria: 'Lavender' },
  { value: 'theme-sand', label: 'Sand', aria: 'Sand' },
  { value: 'theme-contrast', label: 'Contrast', aria: 'Contrast' }
];

function chunkFile(file, chunkSize) {
  const chunks = [];
  let offset = 0;
  while (offset < file.size) {
    const end = Math.min(offset + chunkSize, file.size);
    chunks.push(file.slice(offset, end));
    offset = end;
  }
  return chunks;
}

function setThemeClass(theme) {
  document.body.classList.remove(...THEMES.map(t => t.value).filter(Boolean));
  if (theme) document.body.classList.add(theme);
}

function getSavedTheme() {
  const match = document.cookie.match(/(^| )simpleupload_theme=([^;]+)/);
  return match ? decodeURIComponent(match[2]) : '';
}

function saveTheme(theme) {
  document.cookie = `simpleupload_theme=${encodeURIComponent(theme)};path=/;max-age=31536000`;
}

function FileUpload() {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({});
  const [status, setStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [theme, setTheme] = useState(getSavedTheme());
  const [showSettings, setShowSettings] = useState(false);
  const abortControllers = useRef({});
  const fileInputRef = useRef();
  const settingsRef = useRef();

  // Trap focus in modal
  useEffect(() => {
    if (!showSettings) return;
    function trapFocus(e) {
      if (e.key === "Tab") {
        const modal = settingsRef.current;
        if (!modal) return;
        const focusable = modal.querySelectorAll('button, [tabindex="0"], [tabindex="1"]');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
      if (e.key === "Escape") setShowSettings(false);
    }
    document.addEventListener("keydown", trapFocus);
    return () => document.removeEventListener("keydown", trapFocus);
  }, [showSettings]);

  useEffect(() => {
    setThemeClass(theme);
    saveTheme(theme);
  }, [theme]);

  // Close modal on outside click
  useEffect(() => {
    function handleClick(e) {
      if (showSettings && settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    }
    if (showSettings) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSettings]);

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    setProgress({});
    setStatus('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
      setProgress({});
      setStatus('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  // Chunked upload for large files (up to multi-TB)
  const uploadFile = async (file, idx) => {
    const CHUNK_SIZE = 100 * 1024 * 1024; // 100MB per chunk
    const chunks = chunkFile(file, CHUNK_SIZE);
    let uploaded = 0;
    let fileProgress = 0;
    let success = true;
    let errorMsg = '';

    for (let i = 0; i < chunks.length; i++) {
      const formData = new FormData();
      formData.append('files', chunks[i], file.name);

      const controller = new AbortController();
      abortControllers.current[file.name] = controller;

      try {
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/upload', true);
          xhr.timeout = 10 * 60 * 1000; // 10 minutes per chunk

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              fileProgress = ((uploaded + event.loaded) / file.size) * 100;
              setProgress(prev => ({ ...prev, [file.name]: Math.min(fileProgress, 100) }));
            }
          };

          xhr.onload = () => {
            if (xhr.status === 200) {
              uploaded += chunks[i].size;
              setProgress(prev => ({ ...prev, [file.name]: Math.min((uploaded / file.size) * 100, 100) }));
              resolve();
            } else {
              errorMsg = `Upload failed: ${xhr.statusText}`;
              reject(new Error(errorMsg));
            }
          };

          xhr.ontimeout = () => {
            errorMsg = 'Upload timed out. Retrying...';
            reject(new Error(errorMsg));
          };

          xhr.onerror = () => {
            errorMsg = 'Network error. Retrying...';
            reject(new Error(errorMsg));
          };

          xhr.onabort = () => {
            errorMsg = 'Upload aborted by user.';
            reject(new Error(errorMsg));
          };

          xhr.send(formData);
        });
      } catch (err) {
        // Retry logic: up to 3 times per chunk
        let retries = 2;
        while (retries > 0) {
          try {
            await new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.open('POST', '/api/upload', true);
              xhr.timeout = 10 * 60 * 1000;
              xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                  fileProgress = ((uploaded + event.loaded) / file.size) * 100;
                  setProgress(prev => ({ ...prev, [file.name]: Math.min(fileProgress, 100) }));
                }
              };
              xhr.onload = () => {
                if (xhr.status === 200) {
                  uploaded += chunks[i].size;
                  setProgress(prev => ({ ...prev, [file.name]: Math.min((uploaded / file.size) * 100, 100) }));
                  resolve();
                } else {
                  reject(new Error(`Upload failed: ${xhr.statusText}`));
                }
              };
              xhr.ontimeout = () => reject(new Error('Upload timed out.'));
              xhr.onerror = () => reject(new Error('Network error.'));
              xhr.onabort = () => reject(new Error('Upload aborted by user.'));
              xhr.send(formData);
            });
            errorMsg = '';
            break;
          } catch (retryErr) {
            retries--;
            errorMsg = retryErr.message;
            if (retries === 0) {
              success = false;
              break;
            }
          }
        }
        if (!success) break;
      }
    }
    return { success, errorMsg };
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    setStatus('');
    setProgress({});

    let allSuccess = true;
    let errorMessages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(prev => ({ ...prev, [file.name]: 0 }));
      const { success, errorMsg } = await uploadFile(file, i);
      if (!success) {
        allSuccess = false;
        errorMessages.push(`${file.name}: ${errorMsg}`);
      }
    }

    setIsUploading(false);
    if (allSuccess) {
      setStatus('All files uploaded successfully!');
      setFiles([]);
    } else {
      setStatus('Some files failed to upload:\n' + errorMessages.join('\n'));
    }
  };

  const handleAbort = () => {
    Object.values(abortControllers.current).forEach(controller => {
      if (controller && controller.abort) controller.abort();
    });
    setIsUploading(false);
    setStatus('Upload aborted by user.');
  };

  const handleZoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    React.createElement(React.Fragment, null,
      // Move header image and cogwheel inside the container
      React.createElement('img', {
        src: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
        alt: '',
        className: 'header-img',
        draggable: false,
        'aria-hidden': true,
        loading: 'lazy'
      }),
      React.createElement('button', {
        className: 'settings-cog',
        type: 'button',
        tabIndex: 0,
        onClick: () => setShowSettings(v => !v),
        'aria-label': 'Open settings'
      },
        React.createElement('svg', {
          width: 24, height: 24, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24', 'aria-hidden': true
        },
          React.createElement('circle', { cx: 12, cy: 12, r: 3 }),
          React.createElement('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15 8.6c.26.26.61.39.96.33.35-.06.7-.19.96-.33z' })
        )
      ),
      showSettings && React.createElement(React.Fragment, null,
        React.createElement('div', {
          className: 'settings-modal-backdrop',
          onClick: () => setShowSettings(false),
          tabIndex: -1,
          'aria-hidden': true
        }),
        React.createElement('div', {
          className: 'settings-modal',
          id: 'settings-modal',
          tabIndex: -1,
          role: 'dialog',
          'aria-modal': true,
          'aria-label': 'Settings',
          ref: settingsRef
        },
          React.createElement('button', {
            className: 'close-btn',
            type: 'button',
            onClick: () => setShowSettings(false),
            'aria-label': 'Close settings'
          }, '×'),
          React.createElement('h4', null, 'Theme'),
          React.createElement('div', { className: 'theme-select', role: 'radiogroup', 'aria-label': 'Theme selection' },
            THEMES.map(t =>
              React.createElement('span', {
                key: t.value,
                className: 'theme-swatch' + (theme === t.value ? ' selected' : ''),
                tabIndex: 0,
                role: 'radio',
                'aria-checked': theme === t.value,
                'aria-label': t.aria,
                style: { outline: theme === t.value ? '2px solid var(--accent)' : 'none' },
                onClick: () => setTheme(t.value),
                onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') setTheme(t.value); }
              })
            )
          )
        )
      ),
      React.createElement('div', {
        className: 'dropzone' + (dragActive ? ' dragover' : ''),
        onClick: handleZoneClick,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
        onDragEnd: handleDragLeave,
        onDrop: handleDrop,
        tabIndex: 0,
        role: 'button',
        'aria-label': 'Drag and drop files here or click to select files'
      },
        React.createElement('input', {
          type: 'file',
          multiple: true,
          ref: fileInputRef,
          onChange: handleFileChange,
          tabIndex: -1,
          style: { display: 'none' }
        }),
        React.createElement('span', { className: 'dropzone-label' }, 'Drag & drop files here or click to select')
      ),
      React.createElement('button', {
        onClick: handleUpload,
        disabled: isUploading || files.length === 0
      }, isUploading ? 'Uploading...' : 'Upload Files'),
      isUploading && React.createElement('button', {
        onClick: handleAbort,
        style: { background: '#d32f2f', marginBottom: 0 }
      }, 'Abort Upload'),
      files.length > 0 && React.createElement('ul', { className: 'file-list' },
        files.map(file =>
          React.createElement('li', { key: file.name },
            file.name,
            React.createElement('div', { className: 'progress-bar' },
              React.createElement('div', {
                className: 'progress-bar-inner',
                style: { width: `${progress[file.name] || 0}%` }
              })
            ),
            React.createElement('span', null, `${(progress[file.name] || 0).toFixed(1)}%`)
          )
        )
      ),
      status && React.createElement('div', {
        className: 'status ' + (status.includes('success') ? 'success' : 'error'),
        role: 'alert'
      }, status)
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(FileUpload));
