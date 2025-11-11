// Add comment to trigger new build
// ESLint fix for useEffect dependency
import React, { useState, useEffect } from 'react';

const Chat = ({ user }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Reconnect to the chat service when user changes
  }, [user]); // Only reconnect when user changes
};

export default Chat;
