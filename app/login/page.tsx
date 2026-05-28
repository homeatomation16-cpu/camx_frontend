'use client';

import {
  useGoogleLogin,
  TokenResponse,
} from '@react-oauth/google';

import axios from 'axios';

import {
  useState,
} from 'react';

import toast from 'react-hot-toast';

import Link from 'next/link';

import Image from 'next/image';

import {
  useRouter,
} from 'next/navigation';

import jwt from 'jsonwebtoken';

import { FcGoogle } from 'react-icons/fc';

// ======================================
// API
// ======================================

const API =
  process.env
    .NEXT_PUBLIC_API_BASE;

// ======================================
// TYPES
// ======================================

type JWTPayload = {
  email: string;

  firstName: string;

  lastName: string;

  role: string;

  image?: string;
};

// ======================================
// COMPONENT
// ======================================

export default function LoginPage() {

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(false);

  const router = useRouter();

  // ======================================
  // SAVE USER
  // ======================================

  const decodeAndSaveUser = (
    token: string,
    fallbackRole: string
  ) => {

    localStorage.setItem(
      'CAMX_TOKEN',
      token
    );

    try {

      const decoded =
        jwt.decode(
          token
        ) as JWTPayload | null;

      if (decoded) {

        localStorage.setItem(
          'CAMX_USER',
          JSON.stringify({
            name:
              `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim() ||
              decoded.email,

            email:
              decoded.email,

            role:
              decoded.role ||
              fallbackRole,

            image:
              decoded.image,
          })
        );
      }

    } catch (e) {

      console.error(
        'JWT decode error:',
        e
      );

      localStorage.setItem(
        'CAMX_USER',
        JSON.stringify({
          role:
            fallbackRole,

          email,
        })
      );
    }

    window.dispatchEvent(
      new Event('storage')
    );
  };

  // ======================================
  // GOOGLE LOGIN
  // ======================================

  const googleLogin =
    useGoogleLogin({

      onSuccess: async (
        response: TokenResponse
      ) => {

        try {

          setIsLoading(true);

          const res =
            await axios.post(
              `${API}/api/users/google-login`,
              {
                token:
                  response.access_token,
              }
            );

          const userRole =
            res.data.role ||
            'user';

          decodeAndSaveUser(
            res.data.token,
            userRole
          );

          toast.success(
            'Login successful!'
          );

          if (
            userRole ===
            'admin'
          ) {

            router.push(
              '/admin'
            );

          } else {

            router.push('/');
          }

        } catch (err) {

          console.error(
            'Google Auth error:',
            err
          );

          toast.error(
            'Google Login Failed'
          );

        } finally {

          setIsLoading(false);
        }
      },

      onError: () => {

        toast.error(
          'Google Login Failed'
        );
      },

      onNonOAuthError: () => {

        toast.error(
          'Google Login Failed'
        );
      },
    });

  // ======================================
  // STANDARD LOGIN
  // ======================================

  async function login() {

    if (
      !email ||
      !password
    ) {

      toast.error(
        'Please fill in all fields'
      );

      return;
    }

    try {

      setIsLoading(true);

      const res =
        await axios.post(
          `${API}/api/users/login`,
          {
            email,
            password,
          }
        );

      const userRole =
        res.data.role ||
        'user';

      decodeAndSaveUser(
        res.data.token,
        userRole
      );

      toast.success(
        'Login successful!'
      );

      if (
        userRole ===
        'admin'
      ) {

        router.push(
          '/admin'
        );

      } else {

        router.push('/');
      }

    } catch (err) {

      console.error(
        'Login error:',
        err
      );

      toast.error(
        'Login failed!'
      );

    } finally {

      setIsLoading(false);
    }
  }

  // ======================================
  // ENTER KEY
  // ======================================

  const handleKeyPress = (
    e: React.KeyboardEvent
  ) => {

    if (
      e.key === 'Enter'
    ) {
      login();
    }
  };

  // ======================================
  // UI
  // ======================================

  return (

    <div className="w-full min-h-screen relative overflow-hidden">
{/* LIGHT MODE IMAGE */}
<Image
  src="/hero-light.png"
  alt="CAMX CCTV"
  fill
  priority
  quality={100}
  sizes="100vw"
  className="object-cover object-bottom dark:hidden"
/>

{/* DARK MODE IMAGE */}
<Image
  src="/hero-dark.png"
  alt="CAMX CCTV"
  fill
  priority
  quality={100}
  sizes="100vw"
  className="hidden dark:block object-cover object-bottom"
/>

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/65 z-0" />

      {/* CONTENT */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">

        {/* LEFT */}
        <div className="w-full lg:w-1/2 flex justify-center items-center flex-col p-8 pt-32 lg:pt-12">

          {/* LOGO */}
          <div className="relative w-36 h-36 lg:w-52 lg:h-52 mb-6">

            <Image
              src="/logo.png"
              alt="CAMX Logo"
              fill
              priority
              sizes="(max-width: 768px) 144px, 208px"
              className="object-contain"
              quality={100}
            />
          </div>

          {/* TITLE */}
          <h1 className="text-4xl lg:text-6xl font-black text-white text-center leading-tight mb-5">

            Smart CCTV{' '}

            <span className="text-blue-500">
              Security
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="text-gray-200 text-center text-lg lg:text-2xl max-w-xl leading-relaxed">

            Professional surveillance and enterprise security systems across Sri Lanka.
          </p>
        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-1/2 flex justify-center items-center lg:mt-32  p-5 lg:p-10 pb-16">

          <div className="w-full max-w-md rounded-3xl border  border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl p-7 lg:p-10">

            {/* HEADING */}
            <h1 className="text-3xl lg:text-4xl text-center text-white font-black mb-10">
              Login
            </h1>

            {/* EMAIL */}
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyPress
              }
              placeholder="Your email"
              className="w-full h-14 mb-5 rounded-2xl border border-white/20 bg-black/20 px-5 text-white placeholder:text-gray-300 outline-none focus:border-blue-500 transition"
            />

            {/* PASSWORD */}
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyPress
              }
              placeholder="Your password"
              className="w-full h-14 mb-4 rounded-2xl border border-white/20 bg-black/20 px-5 text-white placeholder:text-gray-300 outline-none focus:border-blue-500 transition"
            />

            {/* FORGOT PASSWORD */}
            <div className="w-full text-right mb-7">

              <Link
                href="/forgot-password"
                className="text-sm text-gray-300 hover:text-white transition"
              >
                Forgot password?
              </Link>
            </div>

            {/* LOGIN BUTTON */}
            <button
              onClick={login}
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 transition text-white text-lg font-bold mb-5 disabled:opacity-50"
            >
              Login
            </button>

            {/* GOOGLE LOGIN */}
            <button
              onClick={() =>
                googleLogin()
              }
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-white hover:bg-gray-100 transition text-black font-bold text-lg flex items-center justify-center gap-3 mb-7 disabled:opacity-50"
            >

              <FcGoogle className="text-2xl" />

              Login with Google
            </button>

            {/* REGISTER */}
            <p className="text-center text-gray-300">

              Don&apos;t have an account?

              <Link
                href="/register"
                className="ml-2 text-blue-500 font-bold hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* LOADER */}
      {isLoading && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">

          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}