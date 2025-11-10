import React, { useState, useEffect } from 'react';
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
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { kanbanAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const KanbanBoard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [columns, setColumns] = useState({
    backlog: { id: 'backlog', title: 'Backlog', items: [] },
    next: { id: 'next', title: 'Next', items: [] },
    inProgress: { id: 'inProgress', title: 'In Progress', items: [] },
    testing: { id: 'testing', title: 'Testing', items: [] },
    validate: { id: 'validate', title: 'Validate', items: [] },
    done: { id: 'done', title: 'Done', items: [] }
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    column: 'backlog'
  });
  const [loading, setLoading] = useState(false);

  // Fetch Kanban board items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await kanbanAPI.getAllItems();
      setItems(response.data);
      organizeItemsByColumn(response.data);
    } catch (error) {
      console.error('Error fetching Kanban items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Organize items by column
  const organizeItemsByColumn = (itemsData) => {
    const organized = {
      backlog: { id: 'backlog', title: 'Backlog', items: [] },
      next: { id: 'next', title: 'Next', items: [] },
      inProgress: { id: 'inProgress', title: 'In Progress', items: [] },
      testing: { id: 'testing', title: 'Testing', items: [] },
      validate: { id: 'validate', title: 'Validate', items: [] },
      done: { id: 'done', title: 'Done', items: [] }
    };

    itemsData.forEach(item => {
      if (organized[item.column]) {
        organized[item.column].items.push(item);
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
      // Update item column and position
      const updatedItem = await kanbanAPI.updateItem(item.id, {
        ...item,
        column: destination.droppableId,
        position: destination.index
      });

      // Update local state
      const newItems = items.map(i => 
        i.id === item.id ? { ...i, column: destination.droppableId } : i
      );
      setItems(newItems);
      organizeItemsByColumn(newItems);
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
        const response = await kanbanAPI.updateItem(editingItem.id, formData);
        const updatedItems = items.map(item => 
          item.id === editingItem.id ? response.data : item
        );
        setItems(updatedItems);
        organizeItemsByColumn(updatedItems);
      } else {
        // Create new item
        const response = await kanbanAPI.createItem(formData);
        const newItems = [...items, response.data];
        setItems(newItems);
        organizeItemsByColumn(newItems);
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
      column: item.column
    });
    setOpenDialog(true);
  };

  // Handle delete
  const handleDelete = async (itemId) => {
    try {
      await kanbanAPI.deleteItem(itemId);
      const newItems = items.filter(item => item.id !== itemId);
      setItems(newItems);
      organizeItemsByColumn(newItems);
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
      column: 'backlog'
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

  // Effect to fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, [user]);

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

      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={3}>
          {Object.values(columns).map(column => (
            <Grid item xs={12} sm={6} md={2.4} key={column.id}>
              <Paper elevation={3} sx={{ p: 2, minHeight: 500 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {column.title}
                  </Typography>
                  <Chip label={column.items.length} color="primary" size="small" />
                </Box>
                
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{ minHeight: 400 }}
                    >
                      {column.items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{ mb: 2, boxShadow: 3 }}
                            >
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
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
                                {item.description && (
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {item.description}
                                  </Typography>
                                )}
                                <Tooltip title={`Created by: ${user?.username || 'You'}`}>
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                  </Typography>
                                </Tooltip>
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Kanban Item' : 'Add New Kanban Item'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              margin="normal"
              multiline
              rows={4}
            />
            <TextField
              select
              fullWidth
              label="Column"
              name="column"
              value={formData.column}
              onChange={handleFormChange}
              margin="normal"
              SelectProps={{
                native: true,
              }}
            >
              <option value="backlog">Backlog</option>
              <option value="next">Next</option>
              <option value="inProgress">In Progress</option>
              <option value="testing">Testing</option>
              <option value="validate">Validate</option>
              <option value="done">Done</option>
            </TextField>
          </Box>
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