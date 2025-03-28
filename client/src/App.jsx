import { useEffect, useState } from "react";
import Header from "./components/Header";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./components/Cart";
import Footer from "./components/Footer";

const App = () => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  const [restaurantId, setRestaurantId] = useState(null);
  const [tableNumber, setTableNumber] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [order, setOrder] = useState([]);
  const [confirmedOrders, setConfirmedOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [paidOrders, setPaidOrders] = useState([]);
  const [restaurantDetails, setRestaurantDetails] = useState(null);

  const [searchText, setSearchText] = useState();

  const location = useLocation();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const sessionId = getCookie("sessionId");

  const [isFirstUpdate, setIsFirstUpdate] = useState(true);

  async function fetchPaidOrders() {
    try {
      const eventSource = new EventSource(`${baseURL}/api/orders/${sessionId}`);

      eventSource.onmessage = (event) => {
        const orders = JSON.parse(event.data);
        console.log("Received updated orders:", orders);

        if (isFirstUpdate) {
          // Set the full orders list on the first response
          setPaidOrders(orders);
          setIsFirstUpdate(false); // Mark as not the first update
        } else {
          // Update only the status for subsequent updates
          setPaidOrders((prevOrders) => {
            return prevOrders.map((order) => {
              const updatedOrder = paidOrders.find((o) => o._id === order._id);
              return updatedOrder
                ? { ...order, status: updatedOrder.status }
                : order;
            });
          });
        }
      };

      eventSource.onerror = (error) => {
        console.error("Error in SSE connection:", error);
        eventSource.close(); // Close the connection on error
      };
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchPaidOrders();
  }, []);

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
    setShowOrders((prev) => (prev = !prev));
    if (showOrders === false) {
      fetchPaidOrders();
    }
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

  const handleCreateOrder = async (paymentId, confirmedOrders) => {
    try {
      // Prepare dishes data for the API request
      const dishes = confirmedOrders.map((order) => ({
        menuItem: order.dishid, // Use dish ID from confirmed orders
        quantity: order.quantity,
      }));

      const response = await fetch(`${baseURL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dishes,
          restaurantId,
          tableNo: tableNumber,
          sessionId,
          paymentId,
          status: "Completed",
        }),
      });

      await fetch(`${baseURL}/api/dish/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dishes,
        }),
      });

      const resPaidOrders = await fetch(`${baseURL}/api/orders/${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (resPaidOrders.ok) {
        const result = await resPaidOrders.json();
        setPaidOrders(result);
      }

      if (response.ok) {
        const result = await response.json();
        console.log("Order created successfully:", result);
        setConfirmedOrders([]);
      } else {
        throw new Error("Failed to place order.");
      }
    } catch (error) {
      console.error("Failed to create order:", error);
    }
  };

  const handlePaymentSuccess = (paymentId) => {
    // Add confirmed orders to the confirmedOrders state
    const newConfirmedOrders = order.map((item) => ({
      ...item,
      status: "Confirmed",
    })); // Add status directly
    setConfirmedOrders((prev) => [...prev, ...newConfirmedOrders]); // Update confirmed orders
    setOrder([]); // Clear the current order after confirmation
    toggleShowOrders(); // Show orders after placing them

    // Call create order with the new confirmed orders
    handleCreateOrder(paymentId, newConfirmedOrders);
  };

  console.log(order);
  console.log(confirmedOrders);
  console.log(paidOrders);
  console.log("SessionId: " + sessionId);
  console.log("searchText: " + searchText);

  return (
    <div>
      <Header
        setSearchText={setSearchText}
        restaurantDetails={restaurantDetails}
        setRestaurantDetails={setRestaurantDetails}
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
              searchText={searchText}
              bannerImages={bannerImages}
              restaurantId={restaurantId}
              tableNumber={tableNumber}
              setOrder={setOrder}
              order={order}
              toggleShowOrders={toggleShowOrders}
              showOrders={showOrders}
              setShowOrder={setShowOrders}
              confirmedOrders={confirmedOrders}
              paidOrders={paidOrders}
            />
          }
        />
      </Routes>
      <Footer restaurantDetails={restaurantDetails} />
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
