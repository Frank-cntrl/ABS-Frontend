const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL = isLocal 
  ? "http://localhost:8080" 
  : "https://abs-backend-nine.vercel.app";

export const SOCKETS_URL = isLocal 
  ? "ws://localhost:8080" 
  : "wss://abs-backend-nine.vercel.app";

export const NODE_ENV = isLocal ? "development" : "production";