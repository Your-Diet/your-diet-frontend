import React, { useState, useEffect, useCallback } from 'react';
import { Box, Alert, IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SSEClient } from '../../services/sse';

type NotificationPayload = {
  name: string;
  description: string;
  [key: string]: any;
};

interface InAppNotificationProps {
  autoCloseDelay?: number;
}

export const InAppNotification: React.FC<InAppNotificationProps> = ({ autoCloseDelay = 3000 }) => {
  const [notification, setNotification] = useState<NotificationPayload | null>(null);

  const handleSSEEvent = useCallback((event: { payload: NotificationPayload }) => {
    setNotification(event.payload);
    const timer = setTimeout(() => setNotification(null), autoCloseDelay);
    return () => clearTimeout(timer);
  }, [autoCloseDelay]);

  useEffect(() => {
    const sseClient = SSEClient.getInstance();
    
    if (sseClient) {
      sseClient.on('in_app_notification', handleSSEEvent);
    }

    return () => {
      if (sseClient) {
        sseClient.disconnect();
      }
    };
  }, [handleSSEEvent]);

  const handleClose = () => {
    setNotification(null);
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
      <Slide direction="right" in={!!notification}>
        <Alert
          severity="info"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
              sx={{ ml: 1 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          <strong>{notification?.name}</strong>
          <br />
          {notification?.description}
        </Alert>
      </Slide>
    </Box>
  );
};

export default InAppNotification;
