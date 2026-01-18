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
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery
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

const KanbanBoard = () => {
  const { token } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [cards, setCards] = useState([]);
  const [columns, setColumns] = useState([
    { id: 'backlog', title: 'Backlog', color: '#9e9e9e' },
    { id: 'next', title: 'Next', color: '#2196f3' },
    { id: 'inProgress', title: 'In Progress', color: '#ff9800' },
    { id: 'testing', title: 'Testing', color: '#f44336' },
    { id: 'validate', title: 'Validate', color: '#9c27b0' },
    { id: 'done', title: 'Done', color: '#4caf50' }
  ]);
  const [open, setOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    status: 'backlog'
  });
  const [expandedCards, setExpandedCards] = useState({});
  const [viewingCard, setViewingCard] = useState(null);

  // Fetch cards from API
  useEffect(() => {
    fetchCards();
  }, []);

  const getApiUrl = (endpoint) => {
    // Remove duplicate /api prefix if it exists
    const baseUrl = process.env.REACT_APP_API_URL || '';
    if (baseUrl.endsWith('/api') && endpoint.startsWith('/api/')) {
      return `${baseUrl}${endpoint.substring(4)}`; // Remove '/api' from endpoint
    }
    return `${baseUrl}${endpoint}`;
  };

  const fetchCards = async () => {
    try {
      const authToken = token;
      const response = await fetch(getApiUrl('/api/kanban'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setCards(data.data || []);
        } else {
          console.error('Expected JSON response but got:', contentType);
          throw new Error('Invalid response format');
        }
      } else {
        console.error('Failed to fetch cards:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
      const authToken = token;
      const method = editingCard ? 'PUT' : 'POST';
      const url = editingCard 
        ? getApiUrl(`/api/kanban/${editingCard.id}`) 
        : getApiUrl('/api/kanban');
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCard)
      });
      
      if (response.ok) {
        handleClose();
        fetchCards(); // Refresh the cards
      } else {
        console.error('Failed to save card:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  const handleDelete = async (cardId) => {
    try {
      const authToken = token;
      const response = await fetch(getApiUrl(`/api/kanban/${cardId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchCards(); // Refresh the cards
      } else {
        console.error('Failed to delete card:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
      const authToken = token;
      const response = await fetch(getApiUrl(`/api/kanban/${cardId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...card,
          status: newStatus
        })
      });
      
      if (response.ok) {
        fetchCards(); // Refresh the cards
      } else {
        console.error('Failed to update card status:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
    const column = columns.find(col => col.id === status);
    return column ? column.color : '#9e9e9e';
  };

  // Generate a color based on the card title for visual distinction
  const getCardColor = (title) => {
    if (!title) return '#e0e0e0';
    
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 85%)`;
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 'bold' }}>
          Kanban Board
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpen()}
          sx={{
            borderRadius: 2,
            boxShadow: 3,
            '&:hover': {
              boxShadow: 5
            }
          }}
        >
          Add Card
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          overflowX: 'auto',
          pb: 2,
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {columns.map(column => (
            <Paper 
              key={column.id} 
              sx={{ 
                minWidth: isMobile ? '100%' : 280, 
                p: 2, 
                backgroundColor: theme.palette.mode === 'dark' ? '#2d3748' : '#f7fafc',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 10px 25px rgba(0, 0, 0, 0.5)' 
                  : '0 10px 25px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2,
                pb: 1,
                borderBottom: `2px solid ${column.color}`
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: column.color }}>
                  {column.title}
                </Typography>
                <Chip 
                  label={getColumnCards(column.id).length} 
                  size="small" 
                  sx={{ 
                    backgroundColor: column.color,
                    color: 'white',
                    fontWeight: 'bold'
                  }} 
                />
              </Box>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ 
                      minHeight: 100, 
                      flexGrow: 1,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 2,
                      p: 1
                    }}
                  >
                    {getColumnCards(column.id).map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{ 
                              mb: 2,
                              backgroundColor: getCardColor(card.title),
                              borderRadius: 2,
                              boxShadow: theme.palette.mode === 'dark' 
                                ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                                : '0 4px 12px rgba(0, 0, 0, 0.1)',
                              border: `1px solid ${getStatusColor(card.status)}`,
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                              cursor: 'pointer',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.palette.mode === 'dark' 
                                  ? '0 6px 16px rgba(0, 0, 0, 0.4)' 
                                  : '0 6px 16px rgba(0, 0, 0, 0.15)'
                              }
                            }}
                            onClick={() => setViewingCard(card)}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Tooltip title={card.title} arrow>
                                  <Typography 
                                    variant="subtitle1" 
                                    sx={{ 
                                      fontWeight: 'bold', 
                                      mb: 1,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical'
                                    }}
                                  >
                                    {card.title}
                                  </Typography>
                                </Tooltip>
                                <Chip 
                                  label={card.status} 
                                  size="small" 
                                  sx={{ 
                                    backgroundColor: getStatusColor(card.status),
                                    color: 'white',
                                    height: 20,
                                    fontWeight: 'bold'
                                  }} 
                                />
                              </Box>
                              
                              {card.description && (
                                <>
                                  <Collapse in={expandedCards[card.id]} timeout="auto" unmountOnExit>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        mt: 1, 
                                        whiteSpace: 'pre-line',
                                        color: theme.palette.text.secondary
                                      }}
                                    >
                                      {card.description}
                                    </Typography>
                                  </Collapse>
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent card click from triggering
                                      toggleExpand(card.id);
                                    }}
                                    sx={{ mt: 1 }}
                                  >
                                    {expandedCards[card.id] ? 
                                      <ExpandLessIcon fontSize="small" /> : 
                                      <ExpandMoreIcon fontSize="small" />
                                    }
                                  </IconButton>
                                </>
                              )}
                            </CardContent>
                            
                            <CardActions sx={{ justifyContent: 'space-between', px: 1, py: 0.5 }}>
                              <Box>
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click from triggering
                                    handleOpen(card);
                                  }}
                                  sx={{ 
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                      backgroundColor: theme.palette.action.hover
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click from triggering
                                    handleDelete(card.id);
                                  }}
                                  sx={{ 
                                    color: theme.palette.error.main,
                                    '&:hover': {
                                      backgroundColor: theme.palette.action.hover
                                    }
                                  }}
                                >
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

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 20px 40px rgba(0, 0, 0, 0.5)' 
              : '0 20px 40px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 'bold' }}>
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
            required
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
            sx={{ mb: 1 }}
          >
            {columns.map(column => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              borderRadius: 2,
              color: theme.palette.text.primary
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!newCard.title.trim()}
            sx={{
              borderRadius: 2,
              boxShadow: 3,
              '&:hover': {
                boxShadow: 5
              },
              '&.Mui-disabled': {
                backgroundColor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled
              }
            }}
          >
            {editingCard ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* View Card Details Dialog */}
      <Dialog 
        open={Boolean(viewingCard)} 
        onClose={() => setViewingCard(null)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 20px 40px rgba(0, 0, 0, 0.5)' 
              : '0 20px 40px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        {viewingCard && (
          <>
            <DialogTitle sx={{ pb: 1, fontWeight: 'bold', fontSize: '1.5rem' }}>
              {viewingCard.title}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
                <strong>Status:</strong> 
                <Chip 
                  label={viewingCard.status} 
                  size="small" 
                  sx={{ 
                    backgroundColor: getStatusColor(viewingCard.status),
                    color: 'white',
                    ml: 1,
                    height: 24,
                    fontWeight: 'bold'
                  }} 
                />
              </Typography>
              
              {viewingCard.description && (
                <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
                  <strong>Description:</strong>
                  <div style={{ whiteSpace: 'pre-line', marginTop: '8px' }}>
                    {viewingCard.description}
                  </div>
                </Typography>
              )}
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                <strong>Created:</strong> {new Date(viewingCard.createdAt || Date.now()).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Updated:</strong> {new Date(viewingCard.updatedAt || Date.now()).toLocaleString()}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button 
                onClick={() => setViewingCard(null)}
                sx={{ 
                  borderRadius: 2,
                  color: theme.palette.text.primary
                }}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  handleOpen(viewingCard);
                  setViewingCard(null);
                }}
                variant="contained" 
                startIcon={<EditIcon />}
                sx={{
                  borderRadius: 2,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 5
                  }
                }}
              >
                Edit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default KanbanBoard;