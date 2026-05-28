'use client';

import axios from 'axios';

import Link from 'next/link';

import Image from 'next/image';

import { useRouter } from 'next/navigation';

import { useState } from 'react';

import {
  useGoogleLogin,
  TokenResponse,
} from '@react-oauth/google';

import toast from 'react-hot-toast';

import { FcGoogle } from 'react-icons/fc';

const API =
  process.env
    .NEXT_PUBLIC_API_BASE;

export default function RegisterPage() {

  const router =
    useRouter();

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState('');

  // =========================
  // REGISTER
  // =========================

  const handleRegister =
    async (
      e: React.FormEvent
    ) => {

      e.preventDefault();

      setLoading(true);

      setMessage('');

      try {

        const response =
          await axios.post(
            `${API}/users/register`,
            {
              name,
              email,
              phone,
              password,
            }
          );

        if (
          response.data.token
        ) {

          localStorage.setItem(
            'CAMX_TOKEN',
            response.data.token
          );
        }

        if (
          response.data.user
        ) {

          localStorage.setItem(
            'CAMX_USER',
            JSON.stringify(
              response.data.user
            )
          );
        }

        window.dispatchEvent(
          new Event('storage')
        );

        toast.success(
          'Account created successfully!'
        );

        router.push('/');

      } catch (error) {

        console.error(error);

        if (
          axios.isAxiosError(error)
        ) {

          setMessage(
            error.response?.data?.message ||
            'Registration failed.'
          );

        } else {

          setMessage(
            'Something went wrong.'
          );
        }

      } finally {

        setLoading(false);
      }
    };

  // =========================
  // GOOGLE LOGIN
  // =========================

  const googleLogin =
    useGoogleLogin({

      onSuccess: async (
        response: TokenResponse
      ) => {

        try {

          setLoading(true);

          const res =
            await axios.post(
              `${API}/api/users/google-login`,
              {
                token:
                  response.access_token,
              }
            );

          if (
            res.data.token
          ) {

            localStorage.setItem(
              'CAMX_TOKEN',
              res.data.token
            );
          }

          if (
            res.data.user
          ) {

            localStorage.setItem(
              'CAMX_USER',
              JSON.stringify(
                res.data.user
              )
            );
          }

          window.dispatchEvent(
            new Event('storage')
          );

          toast.success(
            'Google Login Successful!'
          );

          router.push('/');

        } catch (err) {

          console.error(err);

          toast.error(
            'Google Login Failed'
          );

        } finally {

          setLoading(false);
        }
      },

      onError: () => {

        toast.error(
          'Google Login Failed'
        );
      },
    });

  // =========================
  // UI
  // =========================

  return (

    <main className="relative min-h-screen overflow-hidden">

      {/* LIGHT MODE IMAGE */}
      <Image
        src="/hero-light.png"
        alt="CAMX"
        fill
        priority
        quality={100}
        sizes="100vw"
        className="object-cover object-bottom dark:hidden"
      />

      {/* DARK MODE IMAGE */}
      <Image
        src="/hero-dark.png"
        alt="CAMX"
        fill
        priority
        quality={100}
        sizes="100vw"
        className="hidden dark:block object-cover object-bottom"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/65 z-0" />

      {/* MAIN */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">

        {/* LEFT SIDE */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 pt-28 lg:pt-10">

          {/* LOGO */}
          <div className="relative w-32 h-32 lg:w-48 lg:h-48 mb-5">

            <Image
              src="/logo.png"
              alt="CAMX Logo"
              fill
              priority
              className="object-contain"
            />
          </div>

          {/* TITLE */}
          <h1 className="text-3xl lg:text-5xl text-center font-black text-white mb-4 leading-tight">

            Join CAMX{' '}

            <span className="text-blue-500">
              Security
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="text-base lg:text-xl text-center text-gray-200 max-w-xl leading-relaxed">

            Create your secure account and manage your CCTV systems professionally across Sri Lanka.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-1/2 flex justify-center items-center p-5 lg:p-10 pb-16">

          {/* CARD */}
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl p-6 lg:p-8">

            {/* HEADING */}
            <h1 className="text-2xl lg:text-3xl text-center text-white font-black mb-2">

              Create Account
            </h1>

            <p className="text-sm text-center text-gray-300 mb-6">

              Join CAMX.lk for reliable security systems.
            </p>

            {/* FORM */}
            <form
              onSubmit={
                handleRegister
              }
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >

              {/* NAME */}
              <div>

                <label className="block text-xs font-bold uppercase tracking-wider text-gray-200 mb-2">

                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Sameera Perera"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  required
                  className="w-full h-12 rounded-2xl border border-white/20 bg-black/20 px-4 text-sm text-white placeholder:text-gray-300 outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* EMAIL */}
              <div>

                <label className="block text-xs font-bold uppercase tracking-wider text-gray-200 mb-2">

                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                  className="w-full h-12 rounded-2xl border border-white/20 bg-black/20 px-4 text-sm text-white placeholder:text-gray-300 outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* PHONE */}
              <div>

                <label className="block text-xs font-bold uppercase tracking-wider text-gray-200 mb-2">

                  Phone Number
                </label>

                <input
                  type="tel"
                  placeholder="0771234567"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  required
                  className="w-full h-12 rounded-2xl border border-white/20 bg-black/20 px-4 text-sm text-white placeholder:text-gray-300 outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* PASSWORD */}
              <div>

                <label className="block text-xs font-bold uppercase tracking-wider text-gray-200 mb-2">

                  Password
                </label>

                <input
                  type="password"
                  placeholder="Choose a strong password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                  className="w-full h-12 rounded-2xl border border-white/20 bg-black/20 px-4 text-sm text-white placeholder:text-gray-300 outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* ERROR MESSAGE */}
              {message && (

                <div className="md:col-span-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-300">

                  {message}
                </div>
              )}

              {/* REGISTER BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="md:col-span-2 w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 transition text-white text-sm font-bold disabled:opacity-50"
              >

                {loading
                  ? 'Creating Account...'
                  : 'Create Account'}
              </button>

              {/* GOOGLE SIGNUP */}
              <button
                type="button"
                onClick={() =>
                  googleLogin()
                }
                className="md:col-span-2 w-full h-12 rounded-2xl bg-white hover:bg-gray-100 transition text-black text-sm font-bold flex items-center justify-center gap-3"
              >

                <FcGoogle className="text-xl" />

                Continue with Google
              </button>
            </form>

            {/* LOGIN */}
            <p className="mt-6 text-center text-sm text-gray-300">

              Already have an account?

              <Link
                href="/login"
                className="ml-2 text-blue-500 font-bold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}