import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home from './pages/Home.tsx'
import LoginPage from './pages/LoginPage.tsx';
import NewClientPage from './pages/clients/NewClientPage.tsx';
import ClientDetailPage from './pages/clients/ClientDetailPage.tsx';
import IntegrationLayout from './pages/clients/IntegrationLayout.tsx';
import SettingsPage from './pages/clients/SettingsPage.tsx';
import MappingPage from './pages/clients/MappingPage.tsx';
import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/clients/new",
    element: <NewClientPage />,
  },
  {
    path: "/clients/:clientId",
    element: <ClientDetailPage />,
  },
  {
    path: "/clients/:clientId/integrations/:integrationId",
    element: <IntegrationLayout />,
    children: [
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "mapping",
        element: <MappingPage />,
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
