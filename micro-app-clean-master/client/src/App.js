import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/front/Home";
import NotFound from "./pages/front/NotFound";
import SignUp from "./pages/front/SignUp";
import SignIn from "./pages/front/SignIn";
import Dashboard from "./pages/admin/Dashboard";
import SingleTicket from "./pages/front/SingleTicket";
import CreateOrder from "./pages/front/CreateOrder";
import CreateTicket from "./pages/admin/CreateTicket";
import ProtectedRoute from "./components/ProtectedRoute";
import ShowOrder from "./pages/front/ShowOrder";
import PaymentSuccess from "./pages/front/PaymentSuccess";
import PaymentCancel from "./pages/front/PaymentCancel";
import Profile from "./pages/front/Profile";
import AdminStats from "./pages/admin/AdminStats";
import TicketModeration from "./pages/admin/TicketModeration";
import MyTickets from "./pages/front/MyTickets";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminEntryScan from "./pages/admin/AdminEntryScan";

const App = () => {
  return (
    <>
      <ToastContainer position="bottom-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/ticket/:id" element={<SingleTicket />} />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mes-commandes"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create/order/:orderId"
            element={
              <ProtectedRoute>
                <CreateOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <ShowOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create/ticket"
            element={
              <ProtectedRoute>
                <CreateTicket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stats"
            element={
              <ProtectedRoute adminOnly>
                <AdminStats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute adminOnly>
                <TicketModeration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-orders"
            element={
              <ProtectedRoute adminOnly>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-payments"
            element={
              <ProtectedRoute adminOnly>
                <AdminPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/entry-scan"
            element={
              <ProtectedRoute adminOnly>
                <AdminEntryScan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/success"
            element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/cancel"
            element={
              <ProtectedRoute>
                <PaymentCancel />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
