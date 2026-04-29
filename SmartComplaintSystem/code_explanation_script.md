# Frontend Code Walkthrough & Explanation Script

*(Use this script to explain the actual code and how the frontend is wired together during your presentation)*

---

## 1. The Entry Point and Routing (`App.jsx`)
**"Let's start by looking at `App.jsx`, which acts as the main brain of our frontend routing and layout.**

In this file, we use `react-router-dom` to manage navigation without reloading the page. Notice how we wrap the entire application in a `<Router>` and use the `<Routes>` component to define our paths. 

One interesting part of our routing is how we handle the different login types. Instead of four different login pages, we have:
```jsx
<Route path="/login/citizen" element={<Login expectedRole="citizen" />} />
<Route path="/login/worker" element={<Login expectedRole="worker" />} />
```
We reuse a single `Login.jsx` component and pass a prop (`expectedRole`) to it. This keeps our code DRY (Don't Repeat Yourself) and makes maintaining the login logic much easier."

---

## 2. Global State Management (`AuthContext.jsx`)
**"To manage whether a user is logged in across the entire app, we created an `AuthContext`.** 

Instead of passing user data down through every single component (prop-drilling), the `AuthContext` provides a global state. 

If we look at `AuthContext.jsx`, inside the `useEffect` hook, you'll see what happens when the app first loads:
```jsx
const fetchUser = async () => {
  const token = localStorage.getItem('token');
  if (token) {
     // Verify token with backend
     const res = await axios.get(`${API_BASE}/api/auth/me`, { ... });
     setUser({ ...res.data, token });
  }
};
```
It checks if there is a JWT token in `localStorage`. If there is, it makes an API call to `/api/auth/me` to fetch the user's data and automatically logs them in. It also exposes `login` and `logout` functions that any component can call to easily update the user's state globally."

---

## 3. Security & Access Control (`ProtectedRoute.jsx`)
**"Because we have different dashboards for Citizens, Officers, and Admins, we need to ensure people can't just type `/dashboard` in the URL and access things they shouldn't. This is where `ProtectedRoute.jsx` comes in.**

```jsx
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};
```
This is a wrapper component. It checks the `AuthContext`. If the user is NOT logged in, it intercepts the request and instantly redirects them to `/login` using the `<Navigate>` component. If they are authenticated, it renders the `children`—which in our case, is the Dashboard Router."

---

## 4. Dynamic Dashboards (`DashboardRouter` inside `App.jsx`)
**"Once a user successfully passes the `ProtectedRoute`, how do we know which dashboard to show them?** 

Back in `App.jsx`, we have a clever little component called `DashboardRouter`:
```jsx
function DashboardRouter() {
  const { user } = useContext(AuthContext);
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'officer') return <OfficerDashboard />;
  if (user?.role === 'worker') return <WorkerDashboard />;
  return <CitizenDashboard />;
}
```
It reads the user's role from the global context and instantly returns the correct Dashboard component. This ensures complete separation of concerns—the Citizen Dashboard code is entirely separated from the Admin Dashboard code, making it highly secure and easy to update in the future."

---

## 5. API Configuration (`api.js`)
**"Finally, let's look at how we talk to the backend in `api.js`.**

```jsx
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export default API_BASE;
```
Instead of hardcoding `http://localhost:5000` in every single Axios request, we centralized the API base URL. We use `import.meta.env.VITE_API_URL`. This is a Vite-specific feature that allows us to read environment variables. This means when we deploy to production, we only have to change one environment variable, and the entire app will instantly point to the live server instead of localhost."

---

**"And that wraps up the core architecture of our React frontend. Are there any specific components or files you would like me to dive deeper into?"**
