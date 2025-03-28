import { useEffect, useState } from "react";
import { Button, Modal } from "flowbite-react";
import { FiTrash2 } from "react-icons/fi";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai"; // Import icons for plus and minus

const Cart = ({
  toggleShowCart,
  showCart,
  handleRemoveDish,
  order,
  setOrder,
  handlePaymentSuccess,
}) => {
  const [payAfterService, setPayAfterService] = useState(false); // Track checkbox state

  // Calculate total price
  const totalPrice = order.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Handle quantity change
  const handleQuantityChange = (item, action) => {
    const updatedOrder = order.map((orderItem) => {
      if (orderItem.dishname === item.dishname) {
        const newQuantity =
          action === "add"
            ? orderItem.quantity + 1
            : Math.max(1, orderItem.quantity - 1);
        return { ...orderItem, quantity: newQuantity };
      }
      return orderItem;
    });
    setOrder(updatedOrder);
  };

  // Function to handle payment
  const handlePayment = async () => {
    if (payAfterService) {
      alert("You've selected to pay after service.");
      handlePaymentSuccess("Pay_After_Service");
      return;
    }

    const response = await fetch(
      "https://endusermenumania.onrender.com/create-order",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice * 100 }), // Amount in paise
      }
    );

    const data = await response.json();

    if (data.id) {
      const options = {
        key: "rzp_test_hlOwDlGGp9emrY", // Your Razorpay Key ID
        amount: data.amount,
        currency: data.currency,
        name: "MenuMania",
        description: "Test Transaction",
        order_id: data.id,
        handler: function (response) {
          handlePaymentSuccess(response.razorpay_payment_id);
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#F37254",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } else {
      alert("Failed to create order. Please try again.");
    }
  };

  return (
    <div className="relative">
      {showCart && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30"
          onClick={() => toggleShowCart()}
        ></div>
      )}

      {/* Cart Modal */}
      <Modal
        show={showCart}
        onClose={() => toggleShowCart()}
        size="lg"
        className="min-h-[calc(100vh-30px)] max-w-[95%] md:max-w-[60%] mx-auto rounded-2xl z-40 relative"
        dismissible
      >
        <Modal.Header className="bg-gray-100 py-4 px-4 relative">
          <p className="text-2xl md:text-3xl font-bold text-gray-700 relative">
            Your Cart
          </p>
        </Modal.Header>

        <Modal.Body className="bg-gray-50 rounded-2xl shadow-lg">
          {order.length === 0 ? (
            <div className="text-center text-gray-500 text-lg py-10">
              Your cart is empty!
            </div>
          ) : (
            <div className="flex flex-col space-y-6 max-h-[300px] overflow-y-auto px-4">
              {order.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white rounded-lg shadow-md p-4 md:p-6 transition duration-300 gap-3 hover:shadow-lg"
                >
                  <div className="flex-col md:flex md:flex-row justify-start gap-2 items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.dishname}
                      className="w-14 h-14 md:w-16 md:h-16 m-3 object-cover rounded-md"
                    />
                    <div>
                      <h3 className="text-md md:text-lg font-semibold text-gray-700">
                        {item.dishname}
                      </h3>
                      <p className="text-sm md:text-base text-gray-500">
                        ₹{item.price} x {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item, "subtract")}
                        className={`p-2 rounded-full border border-gray-300 ${
                          item.quantity <= 1
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={item.quantity <= 1}
                      >
                        <AiOutlineMinus />
                      </button>
                      <span className="text-lg font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item, "add")}
                        className="p-2 rounded-full border border-gray-300"
                        disabled={item.quantity >= item.stock}
                      >
                        <AiOutlinePlus />
                      </button>
                    </div>

                    {/* Conditional layout for Trash Button */}
                    <button
                      className="text-red-500 hover:text-red-700 transition duration-200 flex items-center justify-center w-10 h-10 mt-2 md:mt-0 md:ml-4"
                      onClick={() => handleRemoveDish(item)}
                    >
                      <FiTrash2 size={22} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Total Price Section with Pay After Service Checkbox */}
              <div className="flex justify-between items-center border-t border-gray-200 p-4 mt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="payAfterService"
                    checked={payAfterService}
                    onChange={() => setPayAfterService(!payAfterService)}
                    className="cursor-pointer form-checkbox h-5 w-5 text-green-500 rounded"
                  />
                  <label
                    htmlFor="payAfterService"
                    className="text-gray-700 font-medium cursor-pointer"
                  >
                    Pay After Service
                  </label>
                </div>
                <p className="font-semibold text-lg md:text-xl text-gray-700">
                  Total: ₹{totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="bg-gray-100 flex justify-between items-center py-4 px-4 rounded-b-2xl sticky bottom-0">
          <Button
            gradientMonochrome="green"
            onClick={handlePayment}
            disabled={order.length === 0}
            className="py-2 px-4 text-sm md:text-base"
          >
            Order Now
          </Button>
          <Button
            color="gray"
            onClick={() => toggleShowCart()}
            className="py-2 px-4 text-sm md:text-base"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Cart;
