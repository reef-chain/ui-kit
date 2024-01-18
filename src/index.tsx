import React from 'react';
import { createRoot } from 'react-dom/client';
import Example from "./example"

createRoot(document.getElementById('root')).render(<React.StrictMode><Example/></React.StrictMode>);
