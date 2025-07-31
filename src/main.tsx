import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Remove the direct render to use BrowserRouter from App.tsx
createRoot(document.getElementById("root")!).render(<App />);