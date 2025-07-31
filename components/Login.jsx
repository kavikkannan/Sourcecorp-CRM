"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Loading from "@/components/Loading";
import toast, { Toaster } from "react-hot-toast";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const Signin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginResponse = await fetch(`http://localhost:9999/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
        credentials: "include",
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        switch (loginData.code) {
          case "USER_NOT_FOUND":
            toast.error("User not found. Please check the email.");
            break;
          case "INVALID_PASSWORD":
            toast.error("Incorrect password. Please try again.");
            break;
          default:
            toast.error("Login failed: " + loginData.message);
        }
        setLoading(false);
        return;
      }

      if (loginData.code === "LOGIN_SUCCESS") {
        const userResponse = await fetch("http://localhost:9999/api/user", {
          method: "GET",
          credentials: "include",
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          sessionStorage.setItem("userId", userData.ID);
          sessionStorage.setItem("username", userData.Name);
          sessionStorage.setItem("loggedinemail", userData.Email);
          sessionStorage.setItem("loggedinnumber", userData.Number);
          sessionStorage.setItem("isAdmin", userData.IsAdmin);
          sessionStorage.setItem("nofi", userData.NoOfFiles);
          sessionStorage.setItem("PPass", userData.PPass);
          toast.success("Login successful! Redirecting...");
          router.push("/home"); // redirect, so no need to setLoading(false)
        } else {
          toast.error("Failed to retrieve user information");
          setLoading(false);
        }
      } else {
        toast.error("Login failed: " + loginData.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      toast.error("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <div>
          <div className="relative ">
            <Loading />
          </div>
          <div>
            <header className="bg-white shadow-lg p-4 flex justify-between items-center px-8 md:px-12 border-b-4 border-orange-500">
              <div className="text-xl font-extrabold text-gray-800 flex justify-center items-center">
                <img
                  src="//img1.wsimg.com/isteam/ip/06a8fce5-3b35-48ef-9f0e-ab337ebd9cb8/blob-e8ec071.png/:/rs=h:87,cg:true,m/qt=q:95"
                  alt="SOURCECORP"
                />
              </div>
              <div>
                <h1 className="text-3xl flex flex-col justify-center items-end gap-2 font-semibold text-orange-600">
                  SOURCECORP
                </h1>
                <h1 className="text-sm text-orange-600">
                  {" "}
                  - solution private limited
                </h1>
              </div>
              <h1 className="text-3xl flex flex-col justify-center items-center gap-2 font-semibold text-orange-600">
                CRM
              </h1>
            </header>

            <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-black relative">
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-blue-200/60 blur-3xl opacity-50"></div>
              <Toaster position="bottom-center" />

              <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg p-8 rounded-3xl w-full max-w-md">
                <h2 className="text-center text-3xl font-bold text-orange-500 drop-shadow-lg">
                  Sign in to Your Account
                </h2>

                <form className="mt-6 space-y-6" onSubmit={Signin}>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm text-orange-400 font-bold"
                    >
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-black shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-bold text-orange-400"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-black shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-400 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-400 hover:bg-orange-500 text-black font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-orange-500/50 active:scale-95"
                  >
                    Sign In
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <header className="bg-white shadow-lg p-4 flex justify-between items-center px-8 md:px-12 border-b-4 border-orange-500">
            <div className="text-xl font-extrabold text-gray-800 flex justify-center items-center">
              <img
                src="//img1.wsimg.com/isteam/ip/06a8fce5-3b35-48ef-9f0e-ab337ebd9cb8/blob-e8ec071.png/:/rs=h:87,cg:true,m/qt=q:95"
                alt="SOURCECORP"
              />
            </div>
            <div>
              <h1 className="text-3xl flex flex-col justify-center items-end gap-2 font-semibold text-orange-600">
                SOURCECORP
              </h1>
              <h1 className="text-sm text-orange-600">
                {" "}
                - solution private limited
              </h1>
            </div>
            <h1 className="text-3xl flex flex-col justify-center items-center gap-2 font-semibold text-orange-600">
              CRM
            </h1>
          </header>

          <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-200 to-black relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-blue-200/60 blur-3xl opacity-50"></div>
            <Toaster position="bottom-center" />

            <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg p-8 rounded-3xl w-full max-w-md">
              <h2 className="text-center text-3xl font-bold text-orange-500 drop-shadow-lg">
                Sign in to Your Account
              </h2>

              <form className="mt-6 space-y-6" onSubmit={Signin}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm text-orange-400 font-bold"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-black shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold text-orange-400"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-black shadow-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-400 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-400 hover:bg-orange-500 text-black font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-orange-500/50 active:scale-95"
                >
                  Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
