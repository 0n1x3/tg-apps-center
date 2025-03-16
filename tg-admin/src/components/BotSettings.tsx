import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Input, CircularProgress } from '@mui/material';
import axios from 'axios';

interface BotMessage {
  text: string;
  imageUrl: string;
  buttons: { text: string; url: string }[];
}

interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    message?: string;
  }

const BotSettings: React.FC = () => {
  const [message, setMessage] = useState<BotMessage>({
    text: '',
    imageUrl: '',
    buttons: []
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBotMessage();
  }, []);

  const fetchBotMessage = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse<BotMessage>>('/api/bot-message');
      if (response.data.success && response.data.data) {
        setMessage(response.data.data);
      } else {
        console.error('Failed to fetch bot message:', response.data.message);
      }
    } catch (err) {
      console.error('Error fetching bot message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMessage = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse<void>>('/api/bot-message', message);
      if (response.data.success) {
        console.log('Message saved successfully');
      } else {
        console.error('Failed to save message:', response.data.message);
      }
    } catch (err) {
      console.error('Error saving message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMessage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'bot');
      try {
        const response = await axios.post<{ url: string }>('/api/upload-image', formData);
        setMessage(prev => ({ ...prev, imageUrl: response.data.url }));
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };
  
  const sendMessageToBot = async () => {
    try {
      const { data } = await axios.post<ApiResponse<void>>('/api/send-telegram-message', { message });
      if (data.success) {
        console.log('Message sent to Telegram successfully');
      } else {
        console.error('Failed to send message to Telegram:', data.message);
      }
    } catch (err) {
      console.error('Error sending message to Telegram:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Bot Message Settings</Typography>
      <TextField
        fullWidth
        label="Message Text"
        name="text"
        value={message.text}
        onChange={handleChange}
        multiline
        rows={4}
        margin="normal"
      />
      <Input
        type="file"
        onChange={handleImageUpload}
        fullWidth
      />
      {message.imageUrl && (
        <img src={message.imageUrl} alt="Preview" style={{ maxWidth: '100%', marginTop: 10 }} />
      )}
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSaveMessage}
        disabled={isLoading}
        sx={{ mt: 2 }}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Save Message'}
      </Button>
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={sendMessageToBot}
        disabled={isLoading}
        sx={{ mt: 2, ml: 2 }}
      >
        Send to Telegram
      </Button>
    </Box>
  );
};

export default BotSettings;