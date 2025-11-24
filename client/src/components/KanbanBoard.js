import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton,
  Card,
  CardContent,
  CardActions,
  Collapse,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const KanbanBoard = () => {
  const [cards, setCards] = useState([]);
  const [columns, setColumns] = useState([
    { id: 'backlog', title: 'Backlog' },
    { id: 'next', title: 'Next' },
    { id: 'inProgress', title: 'In Progress' },
    { id: 'testing', title: 'Testing' },
    { id: 'validate', title: 'Validate' },
    { id: 'done', title: 'Done' }
  ]);
  const [open, setOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    status: 'backlog'
  });
  const [expandedCards, setExpandedCards] = useState({});

  // Fetch cards from API
  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/kanban', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCards(data.data);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const handleOpen = (card = null) => {
    if (card) {
      setEditingCard(card);
      setNewCard({
        title: card.title,
        description: card.description || '',
        status: card.status
      });
    } else {
      setEditingCard(null);
      setNewCard({
        title: '',
        description: '',
        status: 'backlog'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCard(null);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = editingCard ? 'PUT' : 'POST';
      const url = editingCard ? `/api/kanban/${editingCard.id}` : '/api/kanban';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCard)
      });
      
      if (response.ok) {
        handleClose();
        fetchCards(); // Refresh the cards
      }
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  const handleDelete = async (cardId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/kanban/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchCards(); // Refresh the cards
      }
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    
    // If dropped outside the list or in the same position
    if (!destination || 
        (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }
    
    // Find the card being moved
    const cardId = parseInt(draggableId);
    const card = cards.find(c => c.id === cardId);
    
    if (!card) return;
    
    // Update card status
    const newStatus = destination.droppableId;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/kanban/${cardId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...card,
          status: newStatus
        })
      });
      
      if (response.ok) {
        fetchCards(); // Refresh the cards
      }
    } catch (error) {
      console.error('Error updating card status:', error);
    }
  };

  const toggleExpand = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const getColumnCards = (columnId) => {
    return cards.filter(card => card.status === columnId);
  };

  const getStatusColor = (status) => {
    const colors = {
      backlog: '#9e9e9e',
      next: '#2196f3',
      inProgress: '#ff9800',
      testing: '#f44336',
      validate: '#9c27b0',
      done: '#4caf50'
    };
    return colors[status] || '#9e9e9e';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Kanban Board</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpen()}
        >
          Add Card
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
          {columns.map(column => (
            <Paper 
              key={column.id} 
              sx={{ 
                minWidth: 250, 
                p: 2, 
                backgroundColor: '#f5f5f5',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                {column.title}
              </Typography>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ 
                      minHeight: 100, 
                      flexGrow: 1 
                    }}
                  >
                    {getColumnCards(column.id).map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{ mb: 1 }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  {card.title}
                                </Typography>
                                <Chip 
                                  label={card.status} 
                                  size="small" 
                                  sx={{ 
                                    backgroundColor: getStatusColor(card.status),
                                    color: 'white',
                                    height: 20
                                  }} 
                                />
                              </Box>
                              
                              <Collapse in={expandedCards[card.id]} timeout="auto" unmountOnExit>
                                <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                                  {card.description}
                                </Typography>
                              </Collapse>
                            </CardContent>
                            
                            <CardActions sx={{ justifyContent: 'space-between', px: 1, py: 0.5 }}>
                              <IconButton size="small" onClick={() => toggleExpand(card.id)}>
                                {expandedCards[card.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </IconButton>
                              
                              <Box>
                                <IconButton size="small" onClick={() => handleOpen(card)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleDelete(card.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </CardActions>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Paper>
          ))}
        </Box>
      </DragDropContext>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCard ? 'Edit Card' : 'Add New Card'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newCard.title}
            onChange={(e) => setNewCard({...newCard, title: e.target.value})}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newCard.description}
            onChange={(e) => setNewCard({...newCard, description: e.target.value})}
            sx={{ mb: 2 }}
          />
          
          <TextField
            select
            label="Status"
            fullWidth
            value={newCard.status}
            onChange={(e) => setNewCard({...newCard, status: e.target.value})}
            SelectProps={{
              native: true,
            }}
          >
            {columns.map(column => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!newCard.title}>
            {editingCard ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KanbanBoard;