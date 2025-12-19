import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./global.css";
import App from "./App.tsx";
import Home from "./pages/Home.tsx";
import OrgDashboard from "./pages/OrgDashboard.tsx";
import OrgRegistration from "./pages/OrgRegistration.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/organizers/dashboard",
        element: <OrgDashboard />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
