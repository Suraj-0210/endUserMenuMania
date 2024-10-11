import React, { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { FiCoffee, FiSun, FiMoon, FiDroplet } from "react-icons/fi"; // Icons for example
import { FaDrumstickBite } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import toastify styles
import Orders from "./Orders";

function HomePage({
  bannerImages,
  restaurantId,
  tableNumber,
  setOrder,
  order,
  toggleShowOrders,
  setShowOrders,
  showOrders,
  confirmedOrders,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const categories = ["Breakfast", "Lunch", "Dinner", "Biriyani"];
  const [allDishes, setAllDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to change the current index
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
  };

  // Change slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [bannerImages.length]);

  const categoryIcons = {
    Breakfast: FiCoffee,
    Lunch: FiSun,
    Dinner: FiMoon,
    Biriyani: FaDrumstickBite,
  };

  const fetchAllDishes = async () => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/dish/${restaurantId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await res.json();
      setAllDishes(data);
    } catch (err) {
      setError("Failed to fetch restaurant details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchAllDishes();
    }
  }, [restaurantId]);

  // Function to handle adding a dish to the cart
  const handleAddToCart = (dish) => {
    const dishAlreadyInCart = order.some((item) => item.dishname === dish.name);
    if (dishAlreadyInCart) {
      toast.warn(`${dish.name} is already in your cart!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } else {
      const updatedOrder = [
        ...order,
        {
          dishname: dish.name,
          image: dish.image,
          price: dish.price,
          quantity: 1,
        },
      ];
      setOrder(updatedOrder);
      toast.success(`${dish.name} added to your cart!`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <>
      {showOrders ? (
        <Orders confirmedOrders={confirmedOrders} />
      ) : (
        <div>
          {/* Banner Section */}
          <div className="relative w-full h-64 md:h-80">
            {bannerImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={image}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {bannerImages.map((_, index) => (
                <span
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                ></span>
              ))}
            </div>
          </div>

          {/* Categories Section */}
          <div className="py-8 bg-gray-50">
            <h2 className="text-center text-3xl font-bold mb-6 text-gray-800 tracking-wide">
              Explore Our Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-6">
              {categories.map((category) => {
                const Icon = categoryIcons[category] || FiDroplet; // Default Icon if none is specified
                return (
                  <div
                    key={category}
                    className="flex flex-col items-center group transition-transform duration-300 transform hover:scale-105"
                  >
                    <Button
                      color="light"
                      className="relative w-full h-36 rounded-lg bg-white shadow-md border border-gray-200 hover:bg-blue-100 transition duration-300 flex flex-col items-center justify-center"
                    >
                      {/* Animated Icon */}
                      <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition duration-300">
                        <Icon className="w-10 h-10 text-blue-600 group-hover:text-blue-800" />
                      </div>
                      {/* Category Name */}
                      <span className="text-lg font-medium text-gray-800 mt-3 group-hover:text-blue-800 transition duration-300">
                        {category}
                      </span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dishes Section */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 px-2">
            {!loading &&
              allDishes.map((dish, index) => (
                <div
                  key={index}
                  className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col"
                >
                  {/* Dish Image */}
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-24 object-cover sm:h-32 lg:h-48"
                  />
                  <div className="p-2 flex-grow">
                    {/* Dish Name */}
                    <h3 className="text-sm sm:text-md font-bold text-gray-800">
                      {dish.name}
                    </h3>
                    {/* Dish Description */}
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
                      {dish.text}
                    </p>
                    {/* Price */}
                    <p className="text-blue-600 font-bold mt-2 sm:mt-4 text-xs sm:text-sm">
                      ${dish.price}
                    </p>
                  </div>
                  {/* Add to Cart Button */}
                  <Button
                    className="m-2 text-xs sm:text-sm"
                    gradientMonochrome="blue"
                    onClick={() => handleAddToCart(dish)}
                  >
                    Add to Cart
                  </Button>
                </div>
              ))}
          </div>

          {/* Toast Container for notifications */}
          <ToastContainer />
        </div>
      )}
    </>
  );
}

export default HomePage;
