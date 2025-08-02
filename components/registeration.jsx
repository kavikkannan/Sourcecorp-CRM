"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import LoadingAnimation from "@/components/Loading";

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
        is_admin: is_admin === "true", // Convert string to boolean
        no_of_files: NoOfFiles,
        branch, // Convert string to number
        role,
        salary,
        appointed_members:"" // Ensure it's an array
      };
  
      const response = await fetch(`https://vfinserv.in/api/register`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      if (response.ok) {
        console.log("User registered successfully");
        router.push("/login");
      } else {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);
        alert(errorData.message || "Registration not successful");
      }
    } catch (error) {
      console.error("Error during registration:", error);
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
        <div className="absolute w-full bg-gradient-to-br from-blue-200 to-black flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="relative bottom-20 sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-black">
              Register your account
            </h2>
          </div>

          <div className="relative bottom-10 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-base font-bold leading-6 text-black">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 p-2 text-black shadow-sm ring-1 ring-inset ring-black placeholder:text-black focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-base font-bold leading-6 text-black">
                  Username
                </label>
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
                    <option value="operation_head">Operation Head</option>
                    <option value="backend_team">Backend Team</option>
                    <option value="management_team">Management Team</option>
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
