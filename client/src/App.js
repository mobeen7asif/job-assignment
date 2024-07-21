import React, { useState, useEffect } from 'react';
import { Container, Button, CircularProgress, Typography, Box } from '@mui/material';
import ClientForm from './components/ClientForm';
import JobList from './components/JobList';
import api from './api'; // Import the configured Axios instance

const App = () => {
  const [client, setClient] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [ws, setWs] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const wsUrl = process.env.REACT_APP_WS_URL;

  // Effect to check if client exists
  useEffect(() => {
    console.log('here');
    const checkClient = async () => {
      try {
        const response = await api.get(`/client`);
        if (response.data.client) {
          setClient(response.data.client);
        }
      } catch (err) {
        console.error('Error fetching client:', err);
      } finally {
        setLoading(false);
      }
    };

    checkClient();
  }, []);

  useEffect(() => {
    if (client) {
      const fetchJobs = async () => {
        const response = await api.get(`/client/${client.id}/jobs`);
        setJobs(response.data);
      };

      fetchJobs();

      const connectWebSocket = () => {
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          console.log('WebSocket connection established');
        };

        socket.onmessage = (event) => {
          const updatedJob = JSON.parse(event.data);
          setJobs((prevJobs) => prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)));
        };

        socket.onclose = () => {
          console.log('WebSocket connection closed, retrying...');
          setTimeout(connectWebSocket, 1000);
        };

        socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          socket.close();
        };

        setWs(socket);
      };

      connectWebSocket();

      return () => {
        if (ws) {
          ws.close();
        }
      };
    }
  }, [client, apiUrl, wsUrl]);

  const createJob = async () => {
    setButtonLoading(true);
    try {
      await api.post(`/client/${client.id}/jobs`);
      const response = await api.get(`/client/${client.id}/jobs`);
      setJobs(response.data);
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setButtonLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!client) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <ClientForm onClientCreated={setClient} />
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" height="100vh" padding={4}>
      <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" gutterBottom>
          Hello, {client.name}!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={createJob}
          disabled={buttonLoading}
          sx={{ width: 'auto', maxWidth: 200, marginBottom: 2 }}
        >
          {buttonLoading ? <CircularProgress size={24} color="inherit" /> : 'Create Job'}
        </Button>
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          <JobList jobs={jobs} client={client} />
        </Box>
      </Container>
    </Box>
  );
};

export default App;
