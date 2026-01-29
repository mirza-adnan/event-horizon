// client/src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./global.css";
import App from "./App.tsx";
import Home from "./pages/Home.tsx";
import Explore from "./pages/Explore.tsx";
// OrgDashboard and OrgRegistration were unused, removed to clean up lints
import UserSignup from "./pages/UserSignup.tsx";
import OrganizerDashboard from "./components/OrgDashboard/Dashboard.tsx";
import EventsList from "./components/OrgDashboard/EventsList.tsx";
import EventCreate from "./components/OrgDashboard/EventCreate.tsx";
import UserLogin from "./pages/UserLogin.tsx";
import Teams from "./pages/Teams.tsx";
import TeamRoom from "./pages/TeamRoom.tsx";
import EventDetails from "./pages/EventDetails.tsx";
import OrgLoginRedirect from "./pages/OrgLoginRedirect.tsx";
import OrgRegistrationRedirect from "./pages/OrgRegistrationRedirect.tsx";
import AdminDashboard from "./components/Admin/AdminDashboard.tsx";
import PendingOrganizers from "./components/Admin/PendingOrganizers.tsx";
import OrganizerDetails from "./components/Admin/OrganizerDetails.tsx";
import AdminCategories from "./components/Admin/AdminCategories.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminProtectedRoute from "./components/Admin/AdminProtectedRoute.tsx";
import AdminExternalEvents from "./components/Admin/AdminExternalEvents.tsx";
import OrgProtectedRoute from "./components/OrgDashboard/OrgProtectedRoute.tsx";
import EventManagement from "./pages/EventManagement.tsx";
import Notifications from "./pages/Notifications.tsx";

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
                path: "/explore",
                element: <Explore />,
            },
            {
                path: "/login",
                element: <UserLogin />,
            },
            {
                path: "/teams",
                element: <Teams />,
            },
            {
                path: "/teams/:teamId",
                element: <TeamRoom />,
            },
            {
                path: "/events/:id",
                element: <EventDetails />,
            },
            {
                path: "/notifications",
                element: <Notifications />,
            },
            {
                path: "/organizers/registration",
                element: <OrgRegistrationRedirect />,
            },
            {
                path: "/organizers/login",
                element: <OrgLoginRedirect />,
            },
            // Remove the /organizers/dashboard route
            {
                path: "/organizers",
                element: (
                    <OrgProtectedRoute>
                        <OrganizerDashboard />
                    </OrgProtectedRoute>
                ),
                children: [
                    { index: true, element: <EventsList /> },
                    { path: "dashboard", element: <EventsList /> },
                    { path: "event/create", element: <EventCreate /> },
                    { path: "event/edit/:id", element: <EventCreate /> },
                    { path: "profile", element: <div>Profile Page</div> },
                    { path: "settings", element: <div>Settings Page</div> },
                ],
            },
            {
                path: "/organizers/event/manage/:id",
                element: (
                    <OrgProtectedRoute>
                        <EventManagement />
                    </OrgProtectedRoute>
                ),
            },
            {
                path: "/admin/login",
                element: <AdminLogin />,
            },
            {
                path: "/admin",
                element: (
                    <AdminProtectedRoute>
                        <AdminDashboard />
                    </AdminProtectedRoute>
                ),
                children: [
                    { index: true, element: <PendingOrganizers /> },
                    { path: "dashboard", element: <PendingOrganizers /> },
                    { path: "pending", element: <PendingOrganizers /> },
                    { path: "pending/:id", element: <OrganizerDetails /> },
                    { path: "categories", element: <AdminCategories /> },
                    { path: "external-events", element: <AdminExternalEvents /> },
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
