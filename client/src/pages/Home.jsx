import React, { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { FiCoffee, FiSun, FiMoon, FiDroplet } from "react-icons/fi";
import { CiViewList } from "react-icons/ci";
import { GiCakeSlice } from "react-icons/gi";
import { RiDrinks2Fill } from "react-icons/ri";
import { IoFastFoodOutline } from "react-icons/io5";
import { FaDrumstickBite } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Orders from "./Orders";

function HomePage({
  searchText,
  bannerImages,
  restaurantId,
  tableNumber,
  setOrder,
  order,
  toggleShowOrders,
  setShowOrders,
  showOrders,
  confirmedOrders,
  paidOrders,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const categories = [
    "All",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Biriyani",
    "Drinks",
    "Snacks",
    "Dessert",
  ];
  const [allDishes, setAllDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readMoreStates, setReadMoreStates] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const categoryIcons = {
    All: CiViewList,
    Breakfast: FiCoffee,
    Lunch: FiSun,
    Dinner: FiMoon,
    Biriyani: FaDrumstickBite,
    Drinks: RiDrinks2Fill,
    Snacks: IoFastFoodOutline,
    Dessert: GiCakeSlice,
  };

  const fetchAllDishes = async () => {
    try {
      const res = await fetch(
        `https://endusermenumania.onrender.com/api/dish/${restaurantId}`,
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
          dishid: dish._id,
          dishname: dish.name,
          image: dish.image,
          price: dish.price,
          quantity: 1,
          stock: dish.stock,
        },
      ];
      setOrder(updatedOrder);
      toast.success(`${dish.name} added to your cart!`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Function to toggle Read More/Less for a specific dish
  const toggleReadMore = (dishId) => {
    setReadMoreStates((prevStates) => ({
      ...prevStates,
      [dishId]: !prevStates[dishId], // Toggle the specific dish's readMore state
    }));
  };

  // Function to handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  // Filter dishes based on search text and selected category
  const filteredDishes = allDishes.filter((dish) => {
    const matchesSearch =
      !searchText || dish.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {showOrders ? (
        <Orders confirmedOrders={confirmedOrders} paidOrders={paidOrders} />
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
            <div className="flex overflow-x-auto space-x-4 px-6 scrollbar-hide">
              {categories.map((category) => {
                const Icon = categoryIcons[category] || FiDroplet;
                return (
                  <div
                    key={category}
                    className="flex-shrink-0 flex flex-col items-center group transition-transform duration-300 transform hover:scale-105"
                  >
                    <Button
                      color="light"
                      className="relative w-36 h-36 rounded-lg bg-white shadow-md border border-gray-200 hover:bg-blue-100 transition duration-300 flex flex-col items-center justify-center"
                      onClick={() => handleCategorySelect(category)} // Update selected category on click
                    >
                      <div className="p-auto">
                        <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition duration-300">
                          <Icon className="w-10 h-10 text-blue-600 group-hover:text-blue-800" />
                        </div>
                        <span className="text-lg font-medium text-gray-800 mt-3 group-hover:text-blue-800 transition duration-300">
                          {category}
                        </span>
                      </div>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dishes Section */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 px-2">
            {!loading &&
              filteredDishes.map((dish, index) => (
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
                      {readMoreStates[dish._id]
                        ? dish.description
                        : `${dish.description.substring(0, 100)}... `}
                      <span
                        className="text-teal-600 dark:text-teal-400 cursor-pointer"
                        onClick={() => toggleReadMore(dish._id)}
                      >
                        {readMoreStates[dish._id] ? "Read Less" : "Read More"}
                      </span>
                    </p>
                    <div className="flex flex-row justify-between">
                      {/* Price */}
                      <p className="text-blue-600 font-bold mt-2 sm:mt-4 text-xs sm:text-sm">
                        ₹{dish.price}
                      </p>
                      <span className="text-blue-600 font-bold mt-2 sm:mt-4 text-xs sm:text-sm">
                        Stock: {dish.stock}
                      </span>
                    </div>
                  </div>
                  {/* Add to Cart Button */}
                  <Button
                    className="m-2 text-xs sm:text-sm"
                    gradientMonochrome="blue"
                    disabled={dish.stock === 0}
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
