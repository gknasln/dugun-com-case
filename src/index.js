import React from 'react';
import { createRoot } from "react-dom/client";
import { RouterProvider } from 'react-router-dom';

import routes from './router';
import './App.scss';
import './index.css';

createRoot(document.getElementById("root")).render(
  <RouterProvider 
    router={routes}
  />
);