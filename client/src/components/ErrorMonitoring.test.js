import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorMonitoring from './ErrorMonitoring';

// Mock the AuthContext
const mockUser = { id: 1, name: 'Test User', role: 'SystemAdmin' };
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser })
}));

// Mock the API
jest.mock('../services/api', () => ({
  logAPI: {
    getLogs: jest.fn().mockResolvedValue({ data: { logs: [] } }),
    analyzeLogs: jest.fn().mockResolvedValue({ data: {} })
  }
}));

describe('ErrorMonitoring', () => {
  test('renders Error Monitoring heading', () => {
    render(<ErrorMonitoring />);
    expect(screen.getByText('Error Monitoring')).toBeInTheDocument();
  });

  test('renders Logs tab by default', () => {
    render(<ErrorMonitoring />);
    expect(screen.getByText('System Logs')).toBeInTheDocument();
  });

  test('has Page column in the logs table', () => {
    render(<ErrorMonitoring />);
    expect(screen.getByText('Page')).toBeInTheDocument();
  });
});