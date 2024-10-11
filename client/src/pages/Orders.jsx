import jsPDF from "jspdf";

const Orders = ({ paidOrders }) => {
  // Function to generate the bill in PDF format
  const generateBill = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Order ID: ${order._id}`, 10, 10);

    doc.setFontSize(16);
    let y = 30;
    order.dishes.forEach((dish) => {
      doc.text(
        `${dish.menuItem.name} - ₹${dish.menuItem.price.toFixed(2)} x ${
          dish.quantity
        }`,
        10,
        y
      );
      y += 10;
    });

    const totalPrice = order.dishes
      .reduce((total, dish) => total + dish.menuItem.price * dish.quantity, 0)
      .toFixed(2);

    doc.text(`Total Price: ₹${totalPrice}`, 10, y + 10);
    doc.save(`Order_${order._id}_Bill.pdf`);
  };

  return (
    <div className="p-8 bg-gradient-to-r from-blue-50 to-gray-50 min-h-screen">
      <h2 className="text-4xl font-extrabold mb-10 text-gray-900 text-center">
        Paid Orders
      </h2>
      {paidOrders.length === 0 ? (
        <div className="text-center text-gray-600 text-lg py-20">
          <p>No paid orders available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {paidOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="p-6">
                {/* Order ID */}
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Order ID: <span className="text-indigo-500">{order._id}</span>
                </h3>

                {/* Dishes List */}
                <div className="space-y-6">
                  {order.dishes.map((dish, index) => (
                    <div key={index} className="flex items-start">
                      {/* Dish Image */}
                      <img
                        src={dish.menuItem.image}
                        alt={dish.menuItem.name}
                        className="w-16 h-16 object-cover rounded-md shadow-sm mr-4"
                      />
                      {/* Dish Details */}
                      <div>
                        <p className="text-lg font-semibold text-gray-700">
                          {dish.menuItem.name}
                        </p>
                        <p className="text-gray-500">
                          Quantity:{" "}
                          <span className="font-medium">{dish.quantity}</span>
                        </p>
                        <p className="text-gray-500">
                          Price: ₹
                          <span className="font-medium">
                            {(dish.menuItem.price * dish.quantity).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Status */}
                <p className="mt-6 text-gray-700">
                  Status:{" "}
                  <span
                    className={`font-bold ${
                      order.status === "Completed"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {order.status}
                  </span>
                </p>

                {/* Payment ID */}
                <p className="text-sm text-gray-400 mt-1">
                  Payment ID:{" "}
                  <span className="text-gray-600">{order.paymentId}</span>
                </p>

                {/* Generate Bill Button */}
                <button
                  className="mt-6 bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600 transition"
                  onClick={() => generateBill(order)}
                >
                  Generate Bill
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
