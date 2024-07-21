import React, { useState } from 'react';
import api from '../api'; // Import the configured Axios instance
import { Container, TextField, Button, Typography, Box } from '@mui/material';

const ClientForm = ({ onClientCreated }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/client`, { name, email });
      onClientCreated(response.data);
    } catch (err) {
      setError('Failed to create client. Please try again.');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" padding={4}>
    <Container>
      <Typography variant="h4" gutterBottom>
        Create Client
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        {error && <Typography color="error">{error}</Typography>}
        <Button type="submit" variant="contained" color="primary">
          Create Client
        </Button>
      </form>
    </Container>
    </Box>
  );
};

export default ClientForm;
