"use client";
import { useRouter } from "next/navigation";
import { fetchWithFallback } from "../utils/api";
import React, { useState } from "react";
import Loading from "@/components/Loading";
import toast, { Toaster } from "react-hot-toast";

// Icon helper for form fields
const Icon = ({ path, className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d={path} />
    </svg>
);

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const Signin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginData = await fetchWithFallback(`/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!loginData || loginData.code !== "LOGIN_SUCCESS") {
        const errorMessage = loginData?.code === "USER_NOT_FOUND" ? "User not found. Please check the email."
                           : loginData?.code === "INVALID_PASSWORD" ? "Incorrect password. Please try again."
                           : `Login failed: ${loginData?.message || "Unknown error"}`;
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      const userData = await fetchWithFallback(`/api/user`, {
        method: "GET",
        credentials: "include",
      });

      if (!userData || !userData.ID) {
        toast.error("Failed to retrieve user information");
        setLoading(false);
        return;
      }
      
      sessionStorage.setItem("userId", userData.ID);
      sessionStorage.setItem("username", userData.Name);
      sessionStorage.setItem("loggedinemail", userData.Email);
      sessionStorage.setItem("loggedinnumber", userData.Number);
      sessionStorage.setItem("isAdmin", userData.IsAdmin);
      sessionStorage.setItem("nofi", userData.NoOfFiles);
      sessionStorage.setItem("PPass", userData.PPass);
      
      toast.success("Login successful! Redirecting...");
      router.push("/home");

    } catch (error) {
      console.error("An error occurred:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loading />}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4 font-sans">
        <Toaster position="bottom-center" />
        
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden md:grid md:grid-cols-2">
            
            {/* Left Column: Branding and Visuals (Hidden on Mobile) */}
            <div className="hidden md:block relative p-12 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="absolute inset-0 bg-blue-800/20"></div>
                <div className="relative z-10">
                  <a href="https://vfinserv.in">
                    <img src="sourcecorp-card-logo(1).png" alt="SOURCECORP" className="h-16 rounded-full "/>
                  </a>
                    <h2 className="text-3xl font-bold mt-6">Welcome Back!</h2>
                    <p className="mt-2 text-blue-200">
                        Sign in to access your financial dashboard and streamline your workflow.
                    </p>
                </div>
            </div>

            {/* Right Column: Login Form */}
            <div className="p-8 md:p-12">
                <div className="md:hidden mb-6 text-center">
                    <img src="//img1.wsimg.com/isteam/ip/06a8fce5-3b35-48ef-9f0e-ab337ebd9cb8/blob-e8ec071.png/:/rs=h:87,cg:true,m/qt=q:95" alt="SOURCECORP" className="h-12 mx-auto"/>
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Sign In</h2>
                <p className="text-gray-500 mt-2">Please enter your credentials to proceed.</p>

                <form className="mt-8 space-y-6" onSubmit={Signin}>
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-1">
                            Email address
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Icon path="M22,6C22,4.89 21.1,4 20,4H4C2.89,4 2,4.89 2,6V18C2,19.1 2.9,20 4,20H20C21.1,20 22,19.1 22,18V6M20,6L12,11L4,6H20M20,18H4V8L12,13L20,8V18Z" className="w-5 h-5 text-gray-400" />
                            </span>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 w-full rounded-lg bg-gray-50 border-gray-300 p-3 text-gray-800 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-gray-600 mb-1"
                        >
                            Password
                        </label>
                        <div className="relative">
                           <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Icon path="M12,17C10.89,17 10,16.1 10,15C10,13.89 10.89,13 12,13C13.11,13 14,13.89 14,15C14,16.1 13.11,17 12,17M18,8H17V6C17,3.24 14.76,1 12,1C9.24,1 7,3.24 7,6V8H6C4.89,8 4,8.89 4,10V20C4,21.1 4.9,22 6,22H18C19.1,22 20,21.1 20,20V10C20,8.89 19.1,8 18,8M15,8H9V6C9,4.34 10.34,3 12,3C13.66,3 15,4.34 15,6V8Z" className="w-5 h-5 text-gray-400" />
                            </span>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 w-full rounded-lg bg-gray-50 border-gray-300 p-3 text-gray-800 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 outline-none transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="text-right">
                        <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-500">
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-orange-500/40 active:scale-95"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
      </div>
    </>
  );
}