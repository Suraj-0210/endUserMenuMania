import { useEffect, useState } from "react";
import Header from "./components/Header";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./components/Cart";
import Orders from "./pages/Orders";

const App = () => {
  const [restaurantId, setRestaurantId] = useState(null);
  const [tableNumber, setTableNumber] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [order, setOrder] = useState([]);
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);

  const location = useLocation();

  useEffect(() => {
    // Extract restaurantId and table from the URL
    const pathParts = location.pathname.split("/");
    const id = pathParts[1]; // Assuming restaurant ID is the second part of the URL
    const queryParams = new URLSearchParams(location.search);
    const table = queryParams.get("table");

    setRestaurantId(id);
    setTableNumber(table);
  }, [location]);

  const bannerImages = [
    "https://cdn.pixabay.com/photo/2017/01/26/02/06/platter-2009590_1280.jpg",
    "https://cdn.pixabay.com/photo/2015/09/14/11/43/restaurant-939435_640.jpg",
    "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
  ];

  const toggleShowCart = () => {
    setShowCart((prev) => !prev);
  };
  const toggleShowOrders = () => {
    setShowOrders((prev) => !prev);
  };

  // Function to remove a dish from the cart
  const handleRemoveDish = (itemToRemove) => {
    // Filter out the item to be removed from order as well
    const updatedOrder = order.filter(
      (orderItem) => orderItem.dishname !== itemToRemove.dishname // Match based on dish name
    );

    // Update order state
    setOrder(updatedOrder);
  };

  const handlePaymentSuccess = (paymentId) => {
    // Assuming you have a function to handle payment success
    // Add confirmed orders to the confirmedOrders state
    setConfirmedOrders((prev) => [
      ...prev,
      ...order.map((item) => ({ ...item, paymentId })), // Add payment ID if needed
    ]);
    setOrder([]); // Clear the current order after confirmation
    toggleShowOrders();
  };

  console.log(order);

  return (
    <div>
      <Header
        restaurantId={restaurantId}
        toggleShowCart={toggleShowCart}
        order={order}
        toggleShowOrders={toggleShowOrders}
        setShowOrders={setShowOrders}
        tableNumber={tableNumber}
      />
      <Cart
        toggleShowCart={toggleShowCart}
        showCart={showCart}
        handleRemoveDish={handleRemoveDish}
        setOrder={setOrder}
        order={order}
        handlePaymentSuccess={handlePaymentSuccess}
      />
      <Routes>
        <Route
          path="/:restaurantId"
          element={
            <Home
              bannerImages={bannerImages}
              restaurantId={restaurantId}
              tableNumber={tableNumber}
              setOrder={setOrder}
              order={order}
              toggleShowOrders={toggleShowOrders}
              showOrders={showOrders}
              setShowOrder={setShowOrders}
              confirmedOrders={confirmedOrders}
            />
          }
        />
      </Routes>
    </div>
  );
};

// Wrap the App component with Router
const WrappedApp = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default WrappedApp;
