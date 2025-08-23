"use client";
import { useRouter } from "next/navigation";
import { fetchWithFallback } from "../utils/api";
import Link from "next/link";
import React, { useState } from "react";
import LoadingAnimation from "@/components/Loading";
import { toast } from "react-toastify";

export default function Reg() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setUsername] = useState('');
  const [number, setNumber] = useState('');
  const [salary, setSalary] = useState('');
  const [NoOfFiles, setNoOfFiles] = useState('0');
  const [is_admin, setIsAdmin] = useState("false");
  const [branch, setBranch] = useState(""); // New state for role selection

  const [role, setRole] = useState(""); // New state for role selection
  const [appointed_members,setappointed_members]=useState("");
  const router = useRouter();

  const signup = async () => {
    try {
      setLoading(true);
      
      const requestBody = {
        name,
        email,
        password,
        number,
        is_admin: is_admin === "true",
        no_of_files: NoOfFiles,
        branch,
        role,
        salary,
        appointed_members: ""
      };
  
      const response = await fetchWithFallback(`/api/register`, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      if (response) {
        console.log("User registered successfully");
        //router.push("/login");
        toast.success("User registered successfully");
      } else {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);
        toast.error(errorData.message || "Registration not successful");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
      {loading ? (
        <div className="relative">
          <LoadingAnimation />
        </div>
      ) : (
        <div className="max-h-screen flex flex-col justify-center items-center  px-2 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 md:p-8 border border-blue-100">
            <h2 className="text-center text-2xl md:text-3xl font-bold leading-9 tracking-tight text-blue-700 mb-6">Register your account</h2>
            <form className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm md:text-base font-semibold text-blue-700">Email address</label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border border-blue-300 py-2 px-3 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-gray-400 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm md:text-base font-semibold text-blue-700">Username</label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 p-2 text-black shadow-sm ring-1 ring-inset ring-black placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="name" className="block text-base font-bold leading-6 text-black">
                  Mobile Number
                </label>
                <div className="mt-2">
                  <input
                    id="number"
                    name="number"
                    type="number"
                    required
                    onChange={(e) => setNumber(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 p-2 text-black shadow-sm ring-1 ring-inset ring-black placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="branch" className="block text-base font-bold leading-6 text-black">
                  Select Branch
                </label>
                <div className="mt-2">
                  <select
                    id="branch"
                    name="branch"
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="block w-full rounded-md border-0 py-2 px-3 text-black bg-white shadow-sm ring-1 ring-inset ring-black focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                  >
                    <option value="" disabled>Select a Branch</option>
                    <option value="chennai"> Chennai </option>
                    <option value="vellore"> Vellore </option>
                    <option value="Kumbakonam"> Kumbakonam </option>
                    
                  </select>
                </div>
              </div>
              {/* Role Dropdown */}
              <div>
                <label htmlFor="role" className="block text-base font-bold leading-6 text-black">
                  Select Role
                </label>
                <div className="mt-2">
                  <select
                    id="role"
                    name="role"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full rounded-md border-0 py-2 px-3 text-black bg-white shadow-sm ring-1 ring-inset ring-black focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                  >
                    <option value="" disabled>Select a role</option>
                    <option value="super_admin">Super Admin </option>
                    <option value="managing_director">Managing Director </option>
                    <option value="director">Director </option>
                    <option value="operation_head">Operation Head</option>
                    <option value="backend_team">Backend Team</option>
                    <option value="management_team">Management Team</option>
                    <option value="assistant_management_team">Assistant Management Team</option>
                    <option value="branch_manager">Branch Manager</option>
                    <option value="team_leader">Team Leader</option>
                    <option value="executive">Employee</option>
                  </select>
                </div>
              </div>

                            <div>
                <label htmlFor="salary" className="block text-base font-bold leading-6 text-black">
                  Salary
                </label>
                <div className="mt-2">
                  <input
                    id="salary"
                    name="salary"
                    type="number"
                    required
                    onChange={(e) => setSalary(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 p-2 text-black shadow-sm ring-1 ring-inset ring-black placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

<div>
                <label htmlFor="password" className="block text-base font-bold leading-6 text-black">
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 p-2 text-black shadow-sm ring-1 ring-inset ring-black placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* Admin Checkbox */}
              <div className="flex items-center">
                <input
                  id="isAdmin"
                  type="checkbox"
                  checked={is_admin === "true"}
                  onChange={(e) => setIsAdmin(e.target.checked ? "true" : "false")}
                  className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-black"
                />
                <label htmlFor="isAdmin" className="ml-2 block text-sm text-black">
                  Request Admin Access
                </label>
              </div>
            </form>

            <br />
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-orange-400 shadow-2xl shadow-black px-3 py-1.5 text-sm font-semibold leading-6 text-black hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                onClick={signup}
              >
                Register
              </button>
            </div>

            <p className="mt-10 text-center text-sm text-black">
              Already have an account?{" "}
              <Link href="/signin" className="font-semibold leading-6 text-black hover:text-black">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}