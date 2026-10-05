import { createRoot } from 'react-dom/client';
import App from './App';
import { setupAjax } from './jquery/ajaxSetup';
import './styles/fonts.css';
import './styles/main.css';

// Configure jQuery AJAX once, before any component makes a request
setupAjax();

createRoot(document.getElementById('root')).render(<App />);
