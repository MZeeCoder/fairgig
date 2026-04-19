"use client";

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: '#1e293b', // slate-800
          color: '#f8fafc',      // slate-50
          fontSize: '14px',
          fontWeight: '500',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        },
        // Specific styles for Success toasts
        success: {
          style: {
            background: '#0f766e', // teal-700
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#0f766e',
          },
        },
        // Specific styles for Error toasts
        error: {
          style: {
            background: '#b91c1c', // red-700
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#b91c1c',
          },
        },
      }}
    />
  );
}
