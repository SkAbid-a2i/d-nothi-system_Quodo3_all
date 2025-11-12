import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAuth } from '../contexts/AuthContext';
import { kanbanAPI } from '../services/api';
import notificationService from '../services/notificationService';

// Column definitions
const COLUMN_DEFINITIONS = [
  { id: 'Backlog', title: 'Backlog' },
  { id: 'Next', title: 'Next' },
  { id: 'InProgress', title: 'In Progress' },
  { id: 'Testing', title: 'Testing' },
  { id: 'Validate', title: 'Validate' },
  { id: 'Done', title: 'Done' }
];

const KanbanBoard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Backlog'
  });
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  // Initialize columns
  useEffect(() => {
    const initialColumns = {};
    COLUMN_DEFINITIONS.forEach(column => {
      initialColumns[column.id] = { ...column, items: [] };
    });
    setColumns(initialColumns);
  }, []);

  // Fetch Kanban board items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await kanbanAPI.getAllKanbanItems();
      if (response.data) {
        setItems(response.data);
        organizeItemsByColumn(response.data);
      }
    } catch (error) {
      console.error('Error fetching Kanban items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Organize items by column
  const organizeItemsByColumn = (itemsData) => {
    const organized = {};
    COLUMN_DEFINITIONS.forEach(column => {
      organized[column.id] = { ...column, items: [] };
    });

    itemsData.forEach(item => {
      const status = item.status || 'Backlog';
      if (organized[status]) {
        organized[status].items.push(item);
      }
    });

    setColumns(organized);
  };

  // Handle drag end
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If dropped outside the list
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the item
    const item = items.find(i => i.id.toString() === draggableId);
    if (!item) return;

    try {
      // Update item status
      const updatedItemData = {
        ...item,
        status: destination.droppableId
      };

      const response = await kanbanAPI.updateKanbanItem(item.id, updatedItemData);
      
      if (response.data) {
        // Update local state
        const newItems = items.map(i => 
          i.id === item.id ? response.data : i
        );
        setItems(newItems);
        organizeItemsByColumn(newItems);
        
        // Notify about the update
        notificationService.notifyKanbanItemUpdated(response.data);
      }
    } catch (error) {
      console.error('Error updating Kanban item:', error);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        // Update existing item
        const response = await kanbanAPI.updateKanbanItem(editingItem.id, formData);
        if (response.data) {
          const updatedItems = items.map(item => 
            item.id === editingItem.id ? response.data : item
          );
          setItems(updatedItems);
          organizeItemsByColumn(updatedItems);
          
          // Notify about the update
          notificationService.notifyKanbanItemUpdated(response.data);
        }
      } else {
        // Create new item
        const response = await kanbanAPI.createKanbanItem(formData);
        if (response.data) {
          const newItems = [...items, response.data];
          setItems(newItems);
          organizeItemsByColumn(newItems);
          
          // Notify about the creation
          notificationService.notifyKanbanItemCreated(response.data);
        }
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving Kanban item:', error);
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      status: item.status || 'Backlog'
    });
    setOpenDialog(true);
  };

  // Handle delete
  const handleDelete = async (itemId) => {
    try {
      const response = await kanbanAPI.deleteKanbanItem(itemId);
      if (response) {
        const newItems = items.filter(item => item.id !== itemId);
        setItems(newItems);
        organizeItemsByColumn(newItems);
        
        // Notify about the deletion
        notificationService.notifyKanbanItemDeleted({ id: itemId });
      }
    } catch (error) {
      console.error('Error deleting Kanban item:', error);
    }
  };

  // Handle open dialog
  const handleOpenDialog = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      status: 'Backlog'
    });
    setOpenDialog(true);
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle item expansion
  const toggleExpand = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Effect to fetch items on component mount
  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user, fetchItems]);

  // Listen for kanban notifications
  useEffect(() => {
    const handleKanbanItemCreated = () => {
      fetchItems();
    };

    const handleKanbanItemUpdated = () => {
      fetchItems();
    };

    const handleKanbanItemDeleted = () => {
      fetchItems();
    };

    // Subscribe to kanban notifications
    notificationService.onKanbanItemCreated(handleKanbanItemCreated);
    notificationService.onKanbanItemUpdated(handleKanbanItemUpdated);
    notificationService.onKanbanItemDeleted(handleKanbanItemDeleted);

    // Cleanup on unmount
    return () => {
      notificationService.off('kanbanItemCreated', handleKanbanItemCreated);
      notificationService.off('kanbanItemUpdated', handleKanbanItemUpdated);
      notificationService.off('kanbanItemDeleted', handleKanbanItemDeleted);
    };
  }, [fetchItems]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Kanban Board
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Item
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Grid container spacing={3}>
            {Object.values(columns).map(column => (
              <Grid item xs={12} sm={6} md={2} key={column.id}>
                <Paper elevation={3} sx={{ p: 2, minHeight: 500 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {column.title}
                    </Typography>
                    <Chip label={column.items.length} color="primary" size="small" />
                  </Box>
                  
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                          minHeight: 400,
                          backgroundColor: snapshot.isDraggingOver ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                          borderRadius: 1,
                          p: 1
                        }}
                      >
                        {column.items.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  mb: 2,
                                  backgroundColor: snapshot.isDragging ? 'rgba(102, 126, 234, 0.2)' : 'background.paper',
                                  border: snapshot.isDragging ? '1px solid #667eea' : 'none'
                                }}
                              >
                                <CardContent>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                                      {item.title}
                                    </Typography>
                                    <Box>
                                      <IconButton size="small" onClick={() => handleEdit(item)}>
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton size="small" onClick={() => handleDelete(item.id)}>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                  
                                  {expandedItems[item.id] ? (
                                    <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                                      {item.description || 'No description'}
                                    </Typography>
                                  ) : (
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        mb: 1, 
                                        whiteSpace: 'pre-wrap',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                      }}
                                    >
                                      {item.description || 'No description'}
                                    </Typography>
                                  )}
                                  
                                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <IconButton size="small" onClick={() => toggleExpand(item.id)}>
                                      {expandedItems[item.id] ? 
                                        <ExpandLessIcon fontSize="small" /> : 
                                        <ExpandMoreIcon fontSize="small" />
                                      }
                                    </IconButton>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      {item.creator?.fullName || item.creator?.username || 'Unknown'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {new Date(item.createdAt).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DragDropContext>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Kanban Item' : 'Add New Kanban Item'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={handleFormChange}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleFormChange}
          />
          <TextField
            select
            margin="dense"
            name="status"
            label="Status"
            fullWidth
            variant="outlined"
            value={formData.status}
            onChange={handleFormChange}
            SelectProps={{
              native: true,
            }}
          >
            {COLUMN_DEFINITIONS.map(column => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KanbanBoard;