import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Chip, 
  IconButton,
  LinearProgress,
  Alert
} from '@mui/material';
import { 
  Search as SearchIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
// import { fileAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { auditLog } from '../services/auditLogger';

const Files = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [usedStorage, setUsedStorage] = useState(0);
  const [storageQuota, setStorageQuota] = useState(0);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchStorageInfo = useCallback(async () => {
    try {
      // In a real implementation, this would come from the backend
      // For now, we'll use the user's storage quota from the auth context
      setUsedStorage(user?.usedStorage || 0);
      setStorageQuota(user?.storageQuota || 500);
    } catch (error) {
      console.error('Error fetching storage info:', error);
    }
  }, [user?.usedStorage, user?.storageQuota]);

  // Fetch user storage info and files on component mount
  useEffect(() => {
    fetchStorageInfo();
    fetchFiles();
  }, [fetchStorageInfo]);

  const fetchFiles = async () => {
    // setLoading(true);
    try {
      // In a real implementation, this would fetch actual files from the backend
      // For now, we'll use mock data
      const mockFiles = [
        { id: 1, name: 'task_report_september.pdf', type: 'pdf', size: '2.4 MB', uploaded: '2025-09-28', owner: 'John Doe' },
        { id: 2, name: 'meeting_notes.docx', type: 'doc', size: '0.8 MB', uploaded: '2025-09-29', owner: 'Jane Smith' },
        { id: 3, name: 'project_plan.xlsx', type: 'xls', size: '1.2 MB', uploaded: '2025-09-30', owner: 'Bob Johnson' },
        { id: 4, name: 'screenshot.png', type: 'img', size: '0.5 MB', uploaded: '2025-10-01', owner: 'Alice Brown' },
      ];
      setFiles(mockFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to fetch files');
    } finally {
      // setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file size would exceed quota
      const fileSizeMB = file.size / (1024 * 1024);
      const newUsedStorage = usedStorage + fileSizeMB;
      
      if (newUsedStorage > storageQuota) {
        setError('File upload would exceed your storage quota!');
        setTimeout(() => setError(''), 5000);
        return;
      }
      
      // In a real implementation, this would upload the file to the backend
      // For now, we'll simulate the upload
      simulateUploadProgress();
      setUsedStorage(newUsedStorage);
      
      // Log audit entry
      auditLog.fileUploaded(file.name, user?.username || 'unknown', `${fileSizeMB.toFixed(2)} MB`);
      
      setSuccess('File uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDownload = (fileId) => {
    // Implement file download logic
    auditLog.fileDownloaded(`file_${fileId}`, user?.username || 'unknown');
  };

  const handleDelete = (fileId) => {
    // Implement file deletion logic
    auditLog.fileDeleted(`file_${fileId}`, user?.username || 'unknown');
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'folder':
        return <FolderIcon />;
      case 'pdf':
        return <FileIcon sx={{ color: 'red' }} />;
      case 'doc':
        return <FileIcon sx={{ color: 'blue' }} />;
      case 'xls':
        return <FileIcon sx={{ color: 'green' }} />;
      case 'img':
        return <FileIcon sx={{ color: 'orange' }} />;
      default:
        return <FileIcon />;
    }
  };

  const getFileTypeLabel = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return 'PDF';
      case 'doc':
        return 'Document';
      case 'xls':
        return 'Spreadsheet';
      case 'img':
        return 'Image';
      default:
        return 'File';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        File Management
      </Typography>
      
      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {/* Storage Summary */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6">
              Storage Usage
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(usedStorage / storageQuota) * 100} 
              sx={{ my: 1 }}
            />
            <Typography variant="body2">
              {usedStorage.toFixed(1)} MB of {storageQuota} MB used ({((usedStorage / storageQuota) * 100).toFixed(1)}%)
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <input
                accept="*/*"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadIcon />}
                >
                  Upload File
                </Button>
              </label>
            </Box>
          </Grid>
        </Grid>
        
        {uploadProgress > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Uploading file...
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}
      </Paper>
      
      {/* File Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search Files"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outlined" sx={{ mr: 1 }}>
                Filter
              </Button>
              <Button variant="outlined">
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* File List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Uploaded</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getFileIcon(file.type)}
                    <Typography sx={{ ml: 1 }}>{file.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getFileTypeLabel(file.type)} 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{file.size}</TableCell>
                <TableCell>{file.uploaded}</TableCell>
                <TableCell>{file.owner}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleDownload(file.id)}>
                    <DownloadIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(file.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Files;