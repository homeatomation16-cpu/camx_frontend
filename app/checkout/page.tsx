'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Link from 'next/link';
import Image from 'next/image';

import axios from 'axios';

import {
  CreditCard,
  Truck,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

const API =
  process.env.NEXT_PUBLIC_API_BASE;

type CartItem = {
  _id: string;
  productId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export default function CheckoutPage() {

  const router = useRouter();

  // =========================
  // STATES
  // =========================

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [orderProcessing, setOrderProcessing] =
    useState(false);

  const [orderSuccess, setOrderSuccess] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  // FORM STATES
  const [name, setName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [address, setAddress] =
    useState('');

  const [city, setCity] =
    useState('');

  const [district, setDistrict] =
    useState('Colombo');

  const [paymentMethod, setPaymentMethod] =
    useState<'COD' | 'BankTransfer'>(
      'COD'
    );

  // =========================
  // DISTRICTS
  // =========================

  const districts = [
    'Colombo',
    'Gampaha',
    'Kalutara',
    'Kandy',
    'Matale',
    'Nuwara Eliya',
    'Galle',
    'Matara',
    'Hambantota',
    'Jaffna',
    'Kilinochchi',
    'Mannar',
    'Vavuniya',
    'Mullaitivu',
    'Batticaloa',
    'Ampara',
    'Trincomalee',
    'Kurunegala',
    'Puttalam',
    'Anuradhapura',
    'Polonnaruwa',
    'Badulla',
    'Monaragala',
    'Ratnapura',
    'Kegalle',
  ];

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {

    queueMicrotask(() => {

      try {

        // CART
        const storedCart =
          localStorage.getItem(
            'CAMX_CART'
          );

        if (
          storedCart &&
          storedCart !== 'undefined'
        ) {

          const parsedCart =
            JSON.parse(storedCart);

          setCartItems(parsedCart);
        }

        // USER
        const storedUser =
          localStorage.getItem(
            'CAMX_USER'
          );

        if (
          storedUser &&
          storedUser !== 'undefined'
        ) {

          const user =
            JSON.parse(storedUser);

          setName(
            user?.name || ''
          );

          setEmail(
            user?.email || ''
          );

          setPhone(
            user?.phone || ''
          );
        }

      } catch (error) {

        console.error(
          'Checkout initialization error:',
          error
        );

      } finally {

        setLoading(false);

      }
    });

  }, []);

  // =========================
  // TOTALS
  // =========================

  const subtotal =
    cartItems.reduce(
      (acc, item) =>
        acc +
        item.price * item.quantity,
      0
    );

  const shipping =
    cartItems.length > 0
      ? 450
      : 0;

  const total =
    subtotal + shipping;

  // =========================
  // PLACE ORDER
  // =========================

  const handlePlaceOrder =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();

      if (
        cartItems.length === 0
      ) {
        return;
      }

      setOrderProcessing(true);

      setErrorMessage('');

      try {

        // =========================
        // PAYLOAD
        // =========================

        const orderPayload = {

          items:
            cartItems.map(
              (item) => ({

                productId:
                  item.productId ||
                  item._id,

                name:
                  item.name,

                quantity:
                  item.quantity,

                unitPrice:
                  item.price,
              })
            ),
        };

        // =========================
        // TOKEN
        // =========================

        const token =
          localStorage.getItem(
            'CAMX_TOKEN'
          );

        const headers =
          token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {};

        // DEBUG
        console.log(
          'API URL:',
          `${API}/api/orders/checkout`
        );

        console.log(
          'ORDER PAYLOAD:',
          orderPayload
        );

        // =========================
        // API REQUEST
        // =========================

        const response =
          await axios.post(

            `${API}/api/orders/checkout`,

            orderPayload,

            {
              headers,
            }
          );

        console.log(
          'ORDER SUCCESS:',
          response.data
        );

        // =========================
        // CLEAR CART
        // =========================

        localStorage.removeItem(
          'CAMX_CART'
        );

        window.dispatchEvent(
          new Event('storage')
        );

        // SUCCESS
        setOrderSuccess(true);

      } catch (error) {

        console.error(
          'Order submission error details:',
          error
        );

        if (
          axios.isAxiosError(
            error
          )
        ) {

          console.log(
            'AXIOS ERROR:',
            error.response?.data
          );

          setErrorMessage(

            error.response
              ?.data?.message ||

            'Failed to place order.'
          );

        } else {

          setErrorMessage(
            'Unexpected error occurred.'
          );
        }

      } finally {

        setOrderProcessing(false);

      }
    };

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <main
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-background
        "
      >
        <div
          className="
            w-12
            h-12
            rounded-full
            border-4
            border-secondary
            border-t-transparent
            animate-spin
          "
        />
      </main>
    );
  }

  // =========================
  // SUCCESS
  // =========================

  if (orderSuccess) {

    return (
      <main
        className="
          min-h-screen
          bg-background
          flex
          items-center
          justify-center
          px-6
        "
      >
        <div
          className="
            max-w-md
            w-full
            bg-white
            dark:bg-card
            border
            border-border
            rounded-3xl
            p-10
            text-center
            shadow-xl
          "
        >
          <div
            className="
              w-20
              h-20
              rounded-full
              bg-green-500/10
              flex
              items-center
              justify-center
              mx-auto
              mb-6
            "
          >
            <CheckCircle2
              size={42}
              className="
                text-green-500
              "
            />
          </div>

          <h1
            className="
              text-3xl
              font-black
              text-neutral-900
              dark:text-white
            "
          >
            Order Successful
          </h1>

          <p
            className="
              mt-4
              text-neutral-500
              dark:text-gray-400
            "
          >
            Your order has been placed
            successfully.
          </p>

          <button
            onClick={() =>
              router.push('/')
            }
            className="
              mt-8
              w-full
              h-12
              rounded-xl
              bg-secondary
              text-white
              font-bold
              hover:opacity-90
              transition
            "
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  // =========================
  // MAIN UI
  // =========================

  return (
    <main
      className="
        min-h-screen
        bg-neutral-50
        dark:bg-background
        text-neutral-900
        dark:text-white
        pt-28
        pb-24
        px-4
        sm:px-6
      "
    >
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">

          <Link
            href="/cart"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-neutral-500
              dark:text-gray-400
              hover:text-secondary
              transition
              mb-4
            "
          >
            <ArrowLeft size={16} />
            Back to Cart
          </Link>

          <h1
            className="
              text-4xl
              font-black
              tracking-tight
            "
          >
            Secure Checkout
          </h1>
        </div>

        {/* EMPTY */}
        {cartItems.length === 0 ? (

          <div
            className="
              bg-white
              dark:bg-card
              border
              border-border
              rounded-3xl
              p-10
              text-center
            "
          >
            <h2
              className="
                text-2xl
                font-bold
              "
            >
              Cart is Empty
            </h2>

            <Link
              href="/products"
              className="
                mt-6
                inline-flex
                px-6
                py-3
                rounded-xl
                bg-secondary
                text-white
                font-bold
              "
            >
              Browse Products
            </Link>
          </div>

        ) : (

          <form
            onSubmit={
              handlePlaceOrder
            }
            className="
              grid
              lg:grid-cols-5
              gap-8
            "
          >

            {/* LEFT */}
            <div
              className="
                lg:col-span-3
                space-y-6
              "
            >
              {/* SHIPPING */}
              <div
                className="
                  bg-white
                  dark:bg-card
                  border
                  border-border
                  rounded-3xl
                  p-8
                "
              >
                <h2
                  className="
                    text-2xl
                    font-black
                    flex
                    items-center
                    gap-3
                    mb-6
                  "
                >
                  <Truck
                    size={22}
                    className="
                      text-secondary
                    "
                  />

                  Shipping Details
                </h2>

                <div className="space-y-4">

                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      h-12
                      rounded-xl
                      border
                      border-border
                      bg-transparent
                      px-4
                      outline-none
                      focus:border-secondary
                    "
                  />

                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      h-12
                      rounded-xl
                      border
                      border-border
                      bg-transparent
                      px-4
                      outline-none
                      focus:border-secondary
                    "
                  />

                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      h-12
                      rounded-xl
                      border
                      border-border
                      bg-transparent
                      px-4
                      outline-none
                      focus:border-secondary
                    "
                  />

                  <input
                    type="text"
                    required
                    placeholder="Street Address"
                    value={address}
                    onChange={(e) =>
                      setAddress(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      h-12
                      rounded-xl
                      border
                      border-border
                      bg-transparent
                      px-4
                      outline-none
                      focus:border-secondary
                    "
                  />

                  <div className="grid sm:grid-cols-2 gap-4">

                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={city}
                      onChange={(e) =>
                        setCity(
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        h-12
                        rounded-xl
                        border
                        border-border
                        bg-transparent
                        px-4
                        outline-none
                        focus:border-secondary
                      "
                    />

                    <select
                      value={district}
                      onChange={(e) =>
                        setDistrict(
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        h-12
                        rounded-xl
                        border
                        border-border
                        bg-transparent
                        px-4
                        outline-none
                        focus:border-secondary
                      "
                    >
                      {districts.map(
                        (district) => (
                          <option
                            key={
                              district
                            }
                            value={
                              district
                            }
                          >
                            {district}
                          </option>
                        )
                      )}
                    </select>

                  </div>
                </div>
              </div>

              {/* PAYMENT */}
              <div
                className="
                  bg-white
                  dark:bg-card
                  border
                  border-border
                  rounded-3xl
                  p-8
                "
              >
                <h2
                  className="
                    text-2xl
                    font-black
                    flex
                    items-center
                    gap-3
                    mb-6
                  "
                >
                  <CreditCard
                    size={22}
                    className="
                      text-secondary
                    "
                  />

                  Payment Method
                </h2>

                <div className="space-y-4">

                  <label
                    className={`
                      flex
                      items-center
                      gap-4
                      p-5
                      rounded-2xl
                      border
                      cursor-pointer
                      transition
                      ${
                        paymentMethod ===
                        'COD'
                          ? 'border-secondary bg-secondary/5'
                          : 'border-border'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      checked={
                        paymentMethod ===
                        'COD'
                      }
                      onChange={() =>
                        setPaymentMethod(
                          'COD'
                        )
                      }
                    />

                    <span className="font-bold">
                      Cash On Delivery
                    </span>
                  </label>

                  <label
                    className={`
                      flex
                      items-center
                      gap-4
                      p-5
                      rounded-2xl
                      border
                      cursor-pointer
                      transition
                      ${
                        paymentMethod ===
                        'BankTransfer'
                          ? 'border-secondary bg-secondary/5'
                          : 'border-border'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      checked={
                        paymentMethod ===
                        'BankTransfer'
                      }
                      onChange={() =>
                        setPaymentMethod(
                          'BankTransfer'
                        )
                      }
                    />

                    <span className="font-bold">
                      Bank Transfer
                    </span>
                  </label>

                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div
              className="
                lg:col-span-2
              "
            >
              <div
                className="
                  sticky
                  top-28
                  bg-white
                  dark:bg-card
                  border
                  border-border
                  rounded-3xl
                  p-8
                "
              >
                <h2
                  className="
                    text-2xl
                    font-black
                    mb-6
                  "
                >
                  Order Summary
                </h2>

                <div className="space-y-5">

                  {cartItems.map(
                    (item) => (
                      <div
                        key={item._id}
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            gap-4
                          "
                        >
                          <div
                            className="
                              relative
                              w-16
                              h-16
                              rounded-2xl
                              overflow-hidden
                              bg-white
                              border
                              border-border
                              shrink-0
                            "
                          >
                            <Image
                              src={
                                item.image ||
                                '/placeholder.jpg'
                              }
                              alt={
                                item.name
                              }
                              fill
                              sizes="64px"
                              className="
                                object-contain
                              "
                            />
                          </div>

                          <div>
                            <p
                              className="
                                font-bold
                                line-clamp-1
                              "
                            >
                              {
                                item.name
                              }
                            </p>

                            <p
                              className="
                                text-sm
                                text-neutral-500
                              "
                            >
                              Qty:{' '}
                              {
                                item.quantity
                              }
                            </p>
                          </div>
                        </div>

                        <p
                          className="
                            font-black
                          "
                        >
                          LKR{' '}
                          {(
                            item.price *
                            item.quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                    )
                  )}

                </div>

                {/* TOTALS */}
                <div
                  className="
                    mt-8
                    pt-6
                    border-t
                    border-border
                    space-y-4
                  "
                >
                  <div
                    className="
                      flex
                      justify-between
                    "
                  >
                    <span>
                      Subtotal
                    </span>

                    <span>
                      LKR{' '}
                      {subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div
                    className="
                      flex
                      justify-between
                    "
                  >
                    <span>
                      Shipping
                    </span>

                    <span>
                      LKR{' '}
                      {shipping.toLocaleString()}
                    </span>
                  </div>

                  <div
                    className="
                      flex
                      justify-between
                      text-xl
                      font-black
                      pt-4
                      border-t
                      border-border
                    "
                  >
                    <span>
                      Total
                    </span>

                    <span className="text-secondary">
                      LKR{' '}
                      {total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* ERROR */}
                {errorMessage && (

                  <div
                    className="
                      mt-6
                      p-4
                      rounded-2xl
                      bg-red-500/10
                      border
                      border-red-500/20
                      text-red-500
                      text-sm
                      font-semibold
                    "
                  >
                    {errorMessage}
                  </div>

                )}

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={
                    orderProcessing
                  }
                  className="
                    mt-8
                    w-full
                    h-14
                    rounded-2xl
                    bg-secondary
                    text-white
                    font-black
                    hover:scale-[1.02]
                    transition-all
                    duration-300
                    disabled:opacity-50
                    disabled:hover:scale-100
                  "
                >
                  {orderProcessing
                    ? 'Processing Order...'
                    : `Place Order - LKR ${total.toLocaleString()}`}
                </button>

              </div>
            </div>

          </form>
        )}
      </div>
    </main>
  );
}