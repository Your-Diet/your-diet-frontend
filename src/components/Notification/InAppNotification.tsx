import React, { useState, useEffect } from 'react';
import { Box, Alert, IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SSEClient } from '../../utils/sse';

export const InAppNotification: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sseClient = SSEClient.getInstance();    
    
    if (sseClient) {
      sseClient.on('in_app_notification', (event) => {
        const { payload } = event;
        setTitle(payload.name);
        setDescription(payload.description);
        setOpen(true);
        // Fecha a notificação após 3 segundos
        setTimeout(() => {
          setOpen(false);
        }, 3000);
      });
    }

    return () => {
      if (sseClient) {
        sseClient.disconnect();
      }
    };
  }, []);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 1000,
        width: '300px',
      }}
    >
      <Slide direction="right" in={open}>
        <Alert
          severity="info"
          action={
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ ml: 1 }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{
            borderRadius: 2,
            boxShadow: 2,
            backgroundColor: 'background.paper',
            color: 'text.primary',
          }}
        >
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{title}</div>
            <div>{description}</div>
          </div>
        </Alert>
      </Slide>
    </Box>
  );
};
