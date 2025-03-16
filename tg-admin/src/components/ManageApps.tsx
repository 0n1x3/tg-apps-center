import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Select, MenuItem, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle, DialogContent, Grid, Input } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { SelectChangeEvent } from '@mui/material/Select';
import { styled } from '@mui/material/styles';

interface App {
  _id: string;
  name: string;
  type: 'app' | 'game';
  icon: string;
  link: string;
  launchCount: number;
  order: number;
}

interface UploadResponse {
    url: string;
  }

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiBackdrop-root': {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    '& .MuiDialog-paper': {
      boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
      zIndex: theme.zIndex.modal + 1,
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
      minWidth: '400px', // Увеличиваем минимальную ширину
      maxWidth: '600px', // Ограничиваем максимальную ширину
      animation: '$fadeIn 0.3s ease-out', // Добавляем анимацию
    },
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translateY(-20px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
  }));

const ManageApps: React.FC = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentApp, setCurrentApp] = useState<App | null>(null);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const response = await axios.get<App[]>('https://timecommunity.xyz/api/apps');
      // Сортируем приложения по полю order
      const sortedApps = response.data.sort((a, b) => a.order - b.order);
      setApps(sortedApps);
    } catch (error) {
      console.error('Error fetching apps:', error);
    }
  };

  const handleAddApp = () => {
    setCurrentApp(null);
    setIsAddDialogOpen(true);
  };

  const handleEditApp = (app: App) => {
    setCurrentApp(app);
    setIsEditDialogOpen(true);
  };

  const handleDeleteApp = async (appId: string) => {
    if (window.confirm('Are you sure you want to delete this app?')) {
      try {
        await axios.delete(`https://timecommunity.xyz/api/apps/${appId}`);
        fetchApps();
      } catch (error) {
        console.error('Error deleting app:', error);
      }
    }
  };

   const handleSaveApp = async (app: App, isNew: boolean) => {
    try {
      if (isNew) {
        await axios.post('https://timecommunity.xyz/api/apps', app);
      } else {
        await axios.put(`https://timecommunity.xyz/api/apps/${app._id}`, app);
      }
      await fetchApps(); // Обновляем список приложений после сохранения
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error saving app:', error);
    }
  };

  const AppForm: React.FC<{ app: App | null, onSave: (app: App) => void, onCancel: () => void }> = ({ app, onSave, onCancel }) => {
    const [formData, setFormData] = useState(app || { name: '', type: 'app', icon: '', link: '', order: 0 });
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
    useEffect(() => {
      if (app && app.icon) {
        setPreviewUrl(app.icon);
      }
    }, [app]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
        setPreviewUrl(URL.createObjectURL(e.target.files[0]));
      }
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (file) {
        const formData = new FormData();
        formData.append('icon', file);
  
        try {
          const response = await axios.post<UploadResponse>('https://timecommunity.xyz/api/upload', formData);
          setFormData(prev => ({ ...prev, icon: response.data.url }));
        } catch (error) {
          console.error('Error uploading file:', error);
          return;
        }
      }
  
      onSave(formData as App);
    };
  
    return (
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleChange} required />
          </Grid>
          <Grid item xs={12}>
            <Select
              fullWidth
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <MenuItem value="app">App</MenuItem>
              <MenuItem value="game">Game</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12}>
            <Input
              type="file"
              onChange={handleFileChange}
              inputProps={{ accept: 'image/*' }}
            />
            {previewUrl && (
              <Box mt={2}>
                <img src={previewUrl} alt="Icon preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
              </Box>
            )}
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Link" name="link" value={formData.link} onChange={handleChange} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Order" name="order" type="number" value={formData.order} onChange={handleChange} required />
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel} sx={{ mr: 1 }}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">Save</Button>
        </Box>
      </Box>
    );
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Manage Apps</Typography>
        <Button 
          startIcon={<AddIcon />} 
          variant="outlined" 
          onClick={handleAddApp}
          aria-label="Add new app"
        >
          Add App
        </Button>
      </Box>
      
      <List>
        {apps.map((app) => (
          <ListItem key={app._id} divider>
            <ListItemText 
              primary={app.name} 
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="textPrimary">
                    Type: {app.type}
                  </Typography>
                  <br />
                  <Typography component="span" variant="body2" color="textPrimary">
                    Launches: {app.launchCount}
                  </Typography>
                  <br />
                  <Typography component="span" variant="body2" color="textPrimary">
                    Order: {app.order}
                  </Typography>
                </React.Fragment>
              }
            />
            <ListItemSecondaryAction>
              <IconButton 
                edge="end" 
                onClick={() => handleEditApp(app)}
                aria-label={`Edit ${app.name}`}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                edge="end" 
                onClick={() => handleDeleteApp(app._id)}
                aria-label={`Delete ${app.name}`}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <StyledDialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogTitle>Add New App</DialogTitle>
        <DialogContent>
          <AppForm app={null} onSave={(app) => handleSaveApp(app, true)} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </StyledDialog>

      <StyledDialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
  <DialogTitle>Edit App</DialogTitle>
  <DialogContent>
    {currentApp && (
      <AppForm app={currentApp} onSave={(app) => handleSaveApp(app, false)} onCancel={() => setIsEditDialogOpen(false)} />
    )}
  </DialogContent>
</StyledDialog>
    </Box>
  );
};

export default ManageApps;