'use client';

import React from 'react';

export default function OAuthTestPage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/api/auth/google/login'; 
    // change to your backend endpoint
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Google OAuth Test</h1>
      <button
        onClick={handleGoogleLogin}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
