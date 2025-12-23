import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./global.css";
import App from "./App.tsx";
import Home from "./pages/Home.tsx";
import OrgDashboard from "./pages/OrgDashboard.tsx";
import OrgRegistration from "./pages/OrgRegistration.tsx";
import UserSignup from "./pages/UserSignup.tsx";
import SignIn from "./pages/SignIn.tsx"

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
        path: "/signup",
        element: <UserSignup />,
      },
      {
        path: "/organizers/registration",
        element: <OrgRegistration />,
      },
      {
        path: "/organizers/dashboard",
        element: <OrgDashboard />,
      },
    {
        path: "/signin",
        element: <SignIn />
    }
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
