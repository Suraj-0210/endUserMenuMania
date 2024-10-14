import { useEffect, useState } from "react";
import { Button, TextInput } from "flowbite-react";
import { AiOutlineSearch } from "react-icons/ai"; // Search Icon
import { FiShoppingCart } from "react-icons/fi"; // Cart Icon
import { Link } from "react-router-dom"; // Import Link

function Header({
  setSearchText,
  restaurantDetails,
  setRestaurantDetails,
  restaurantId,
  toggleShowCart,
  order,
  toggleShowOrders,
  tableNumber,
  setShowOrders,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRestaurantDetails = async () => {
    try {
      const res = await fetch(
        `https://endusermenumania.onrender.com/api/restaurant/${restaurantId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await res.json();
      if (data.sessionId) {
        console.log("Session ID:", data.sessionId);
        // Store sessionId in a cookie
        document.cookie = `sessionId=${data.sessionId}; path=/;`;
      }
      setRestaurantDetails(data);
    } catch (err) {
      setError("Failed to fetch restaurant details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSearchTextHandler = (e) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantDetails();
    }
  }, [restaurantId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <header className="p-4 bg-white shadow-lg">
      <div className="flex items-center justify-between flex-wrap">
        {/* Logo Section */}
        <div className="flex items-center">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-gray-300 shadow-md">
            <img
              src={restaurantDetails.logo}
              alt="Logo"
              className="w-full h-full object-cover"
              onClick={() => setShowOrders(false)}
            />
          </div>
          <span className="ml-2 text-xl font-semibold text-gray-800 hidden md:block">
            {restaurantDetails.restaurantname}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs mx-4 mt-2 flex-grow">
          <TextInput
            type="text"
            placeholder="Search for dishes and drinks"
            className="rounded-full px-4 py-2 text-sm border border-gray-300 shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rightIcon={AiOutlineSearch}
            onChange={onSearchTextHandler}
          />
          <Button
            className="absolute right-0 top-0 h-full rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center px-4"
            aria-label="Search"
          >
            <AiOutlineSearch className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-4 mt-2">
          {/* Show Orders Button */}
          <Button
            className="bg-green-600 hover:bg-green-700 text-white rounded-md py-2 px-4 transition duration-200 shadow-lg"
            onClick={toggleShowOrders}
          >
            Show Orders
          </Button>

          {/* Cart Button */}
          <Button
            className="relative flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
            onClick={toggleShowCart}
          >
            <FiShoppingCart className="w-6 h-6" />
            {/* Cart item count badge */}
            {order.length > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-600 rounded-full shadow-md">
                {order.length}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Header;
