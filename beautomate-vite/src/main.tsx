import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import AppLayout from './AppLayout.tsx'; // Importado
import Home from './pages/Home.tsx'
import LoginPage from './pages/LoginPage.tsx';
import NewClientPage from './pages/clients/NewClientPage.tsx';
import ClientDetailPage from './pages/clients/ClientDetailPage.tsx';
import IntegrationLayout from './pages/clients/IntegrationLayout.tsx';
import SettingsPage from './pages/clients/SettingsPage.tsx';
import MappingPage from './pages/clients/MappingPage.tsx';
import NewIntegrationPage from './pages/clients/NewIntegrationPage.tsx';
import './index.css'

const router = createBrowserRouter([
  // Las rutas que no usan el layout principal van aquí
  {
    path: "/login",
    element: <LoginPage />,
  },
  // Todas las rutas que usan el AppShell van anidadas aquí
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true, // Esto hace que Home sea la página por defecto para "/"
        element: <Home />,
      },
      {
        path: "clients/new",
        element: <NewClientPage />,
      },
      {
        path: "clients/:clientId",
        element: <ClientDetailPage />,
      },
      {
        path: "clients/:clientId/integrations/new",
        element: <NewIntegrationPage />,
      },
      {
        path: "clients/:clientId/integrations/:integrationId",
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
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
