import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import store from './store/store.ts';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from "@react-oauth/google"
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import ForgotPassword from './pages/ForgotPassword.tsx';
import Profile from './pages/Profile.tsx';
import UserPage from './pages/UserPage.tsx';
import NotFoundPage from './pages/NotFound.tsx';


const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home title="Hub for Social Animals" />
      }, {
        path: "login",
        element: <Login title="User Login" />
      }, {
        path: "signup",
        element: <Signup title="User Signup" />
      }, {
        path: "forgot-password",
        element: <ForgotPassword title="Forgot Password" />
      }, {
        path: "profile",
        element: <Profile title="Edit Profile" />
      }, {
        path: "user/:username",
        element: <UserPage title="User Profile" />
      }, {
        path: "*",
        element: <NotFoundPage />
      }
    ]
  },

]);

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_ID}>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </GoogleOAuthProvider>
)

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("serviceWorker.js")
      .then(() => {
      })
      .catch((err) => {
        console.log("Service Worker registration failed:", err);
      });
  });
}

