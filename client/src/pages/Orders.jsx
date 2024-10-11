import React from "react";

const Orders = ({ confirmedOrders }) => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Confirmed Orders
      </h2>
      {confirmedOrders.length === 0 ? (
        <div className="text-center text-gray-500 text-lg py-10">
          <p>No confirmed orders yet.</p>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {confirmedOrders.map((order, index) => (
            <div
              key={index}
              className="flex items-center bg-white shadow-md rounded-lg p-4 transition duration-300 hover:shadow-lg"
            >
              {/* Image as a small logo */}
              <img
                src={order.image}
                alt={order.dishname}
                className="w-16 h-16 object-cover rounded-md mr-4"
              />
              {/* Order details */}
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-700">
                  {order.dishname}
                </h3>
                <p className="text-gray-600">
                  Quantity: <span className="font-bold">{order.quantity}</span>
                </p>
                <p className="text-gray-600">
                  Price:{" "}
                  <span className="font-bold">
                    ₹{(order.price * order.quantity).toFixed(2)}
                  </span>
                </p>
                <p className="text-gray-600">
                  Status:{" "}
                  <span className="font-semibold text-green-600">
                    Confirmed
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
