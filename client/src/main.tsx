// client/src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./global.css";
import App from "./App.tsx";
import Home from "./pages/Home.tsx";
import OrgDashboard from "./pages/OrgDashboard.tsx";
import OrgRegistration from "./pages/OrgRegistration.tsx";
import UserSignup from "./pages/UserSignup.tsx";
import OrganizerDashboard from "./components/OrgDashboard/Dashboard.tsx";
import EventsList from "./components/OrgDashboard/EventsList.tsx";
import EventCreate from "./components/OrgDashboard/EventCreate.tsx";
import UserLogin from "./pages/UserLogin.tsx";
import OrgLogin from "./pages/OrgLogin.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

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
                path: "/login",
                element: <UserLogin />,
            },
            {
                path: "/organizers/registration",
                element: <OrgRegistration />,
            },
            {
                path: "/organizers/login",
                element: <OrgLogin />,
            },
            {
                path: "/organizers/dashboard",
                element: (
                    <ProtectedRoute>
                        <OrgDashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/organizers",
                element: (
                    <ProtectedRoute>
                        <OrganizerDashboard />
                    </ProtectedRoute>
                ),
                children: [
                    { index: true, element: <EventsList /> },
                    { path: "dashboard", element: <EventsList /> },
                    { path: "event/create", element: <EventCreate /> },
                    { path: "profile", element: <div>Profile Page</div> },
                    { path: "settings", element: <div>Settings Page</div> },
                ],
            },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
