"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import Loading from "@/components/Loading";
import MiniLoadingAnimation from "./MiniLoading";

export default function HomePage() {
  const [username, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState("All");
  const [nooffiles, setNoOfFiles] = useState("");
  const [PPass, setPPass] = useState("");
  const [userid, setUserID] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [schedu, setAPPSchedu] = useState("");
  const [appointedUsers, setAppointedUsers] = useState([]);
  const [appointedCases, setAppointedUsersCases] = useState([]);
  const [isyourcase, setIsYourCase] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedUser, setSelectedUser] = useState("all");
  const [MarkCount, setMarkCount] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [miniLoading, setMiniLoading] = useState(false);

  const [viewCompleted, setViewCompleted] = useState(false); // false = Ongoing
  const filteredNotifications = notifications.filter(
    (note) => note.ReadStatus === viewCompleted
  );
  const [selectedMonthYear, setSelectedMonthYear] = useState("All");
  const roles = ["All", ...new Set(appointedUsers.map((user) => user.Role))];

  const filteredUsers = appointedUsers.filter(
    (user) =>
      (selectedRole === "All" || user.Role === selectedRole) &&
      (selectedUser === "all" || user.Name === selectedUser) &&
      (user.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.Email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    if (!storedUsername) {
      router.push("/login"); // Redirect to login page
    } else {
      setUser(storedUsername);
    }
  }, []);

  useEffect(() => {
    if (appointedUsers) {
    }
  }, [appointedUsers]);

  useEffect(() => {
    fetchNotifications();
    fetchCases();
  }, []);

  const handleNotifyRefresh = () => {
    fetchNotifications();
  };
  const fetchNotifications = async () => {
    const useri = sessionStorage.getItem("userId");
    try {
      const response = await fetch(
        `https://sourcecorp.in/api/fetch/notify/${useri}`
      );

      if (response.status === 404) {
        console.log("No notifications found.");
        setNotifications([]);
        return;
      }

      if (!response.ok) {
        console.log("Error fetching notifications:", error);
      }

      const data = await response.json();

      const Marked = data.filter(
        (note) => note.Mark === "false" || note.Mark === false
      ).length;
      const read = data.filter(
        (note) => note.ReadStatus === "false" || note.ReadStatus === false
      ).length;

      setMarkCount(Marked);
      setReadCount(read);
      setNotifications(data);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (error) {
      console.log("Error fetching notifications:", error);
    }
  };
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000); // Refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  const handelNotifyViewCase = async (NData) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:9999/api/userFile/fetch/${NData.PIndex}`
      );
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem("selectedCase", JSON.stringify(data));
      } else {
        console.error("Failed to fetch fragment, status:", response.status);
      }
      try {
        const response = await fetch(
          `http://localhost:9999/api/user/${parseInt(NData.FromUser)}`
        );
        if (response.ok) {
          const data = await response.json();
          const casePPass = data.PPass;

          sessionStorage.setItem("CasePPass", casePPass);
        } else {
          setLoading(false);
          console.error("Failed to fetch fragment, status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching fragment:", error);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching fragment:", error);
      setLoading(false);
    }

    router.push("/casepage");
  };

  const handelViewCase = async (selectedCase) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:9999/api/user/${parseInt(selectedCase.AgentId)}`
      );
      if (response.ok) {
        const data = await response.json();
        const casePPass = data.PPass;

        sessionStorage.setItem("CasePPass", casePPass);
      } else {
        setLoading(false);
        console.error("Failed to fetch fragment, status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching fragment:", error);
    }
    sessionStorage.setItem("selectedCase", JSON.stringify(selectedCase));
    router.push("/casepage");
  };

  const handellogout = async () => {
    try {
      const response = await fetch(`https://sourcecorp.in/api/logout`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        sessionStorage.removeItem("PPass");
        sessionStorage.removeItem("isAdmin");
        sessionStorage.removeItem("loggedinemail");
        sessionStorage.removeItem("loggedinnumber");
        sessionStorage.removeItem("nofi");
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("username");
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  const encryptPFile = (data, key) => {
    try {
      const iv = crypto
        .createHash("sha256")
        .update(data)
        .digest()
        .subarray(0, 16);
      const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
      const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
      return {
        encryptedData: encrypted.toString("hex"),
        iv: iv.toString("hex"),
      };
    } catch (error) {
      console.error("Encryption error:", error);
      return null;
    }
  };
  async function fetchCases() {
    handleGetAppointedMembers();

    try {
      const userResponse = await fetch("https://sourcecorp.in/api/user", {
        method: "GET",
        credentials: "include",
      });

      if (!userResponse.ok) {
        console.log("No login found");
        return;
      }

      const userData = await userResponse.json();
      const { Name, PPass: Pass, NoOfFiles: NoFF, ID: id } = userData;

      setPPass(Pass);
      setNoOfFiles(NoFF);
      setUserID(id);
      setUser(Name);

      await new Promise((resolve) => setTimeout(resolve, 0));

      const currentPPass = Pass;
      let pi = [];

      for (let i = 1; i <= NoFF; i++) {
        const { encryptedData: pp } = encryptPFile(
          currentPPass + "$$" + i,
          Buffer.from(currentPPass, "utf-8").subarray(0, 32)
        );

        if (!pp || pp.length < 6) {
          console.error("Encryption failed or invalid data:", pp);
          continue;
        }

        const Index = parseInt(pp.substring(0, 6), 16) % 100;
        const PIndex = crypto
          .createHash("sha256")
          .update(pp + Index)
          .digest("hex");
        pi.push(PIndex);
      }

      const responses = await Promise.all(
        pi.map((pindex) =>
          fetch(`https://sourcecorp.in/api/userFile/fetch/${pindex}`)
        )
      );

      const data = await Promise.all(
        responses.map((res) => (res.ok ? res.json() : null))
      );

      const validCases = data.filter((item) => item !== null);

      if (validCases.length > 0) {
        setCases(validCases);
      } else {
        // Set fallback case with "nil" values
        setCases([
          {
            AgentId: "nil",
            CaseDate: "nil",
            CaseId: "nil",
            CoustomerDetails: "nil",
            Name: "nil",
            PFile: "nil",
            PIV: "nil",
            PIndex: "nil",
            Status: "nil",
            Unknown1: "nil",
          },
        ]);
      }
    } catch (error) {
      console.log("Error fetching cases:", error);
      // Optional: fallback in case of complete failure
      setCases([
        {
          AgentId: "nil",
          CaseDate: "nil",
          CaseId: "nil",
          CoustomerDetails: "nil",
          Name: "nil",
          PFile: "nil",
          PIV: "nil",
          PIndex: "nil",
          Status: "nil",
          Unknown1: "nil",
        },
      ]);
    }
  }

  const handleGetAppointedMembers = async () => {
    setMiniLoading(true);
    const userId = sessionStorage.getItem("userId");
    try {
      // Fetch appointed members
      const response = await fetch(
        `https://sourcecorp.in/api/appointedUser/${userId}`
      );

      if (!response.ok) {
        console.log("Failed to fetch schedule:", response.status);
        return;
      }

      const data = await response.json();

      if (!data.hierarchy || data.hierarchy.trim() === "") {
        console.log("No appointed members found.");
        return;
      }

      setAPPSchedu(data.hierarchy);

      // Extract unique user IDs from comma-separated string
      const userIds = [
        ...new Set(
          data.hierarchy
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id) // Remove empty values
        ),
      ];

      if (userIds.length === 0) {
        console.log("No valid user IDs found.");
        return;
      }

      // Fetch details for each unique user ID
      const userDetails = await Promise.all(
        userIds.map(async (id) => {
          const userRes = await fetch(`https://sourcecorp.in/api/user/${id}`);
          if (userRes.ok) {
            return await userRes.json();
          }
          console.error(`Failed to fetch user details for ID: ${id}`);
          return null;
        })
      );

      // Filter out null values
      const validUserDetails = userDetails.filter((user) => user);
      if (validUserDetails.length === 0) {
        console.log("No valid user details found.");
        return;
      }

      // Fetch cases for each valid user ID and store them under their respective IDs
      const appointedCases = await userIds.reduce(async (accPromise, id) => {
        const acc = await accPromise;
        const userRes = await fetch(
          `https://sourcecorp.in/api/userFile/fetchbyid/${id}`
        );

        if (userRes.ok) {
          const userCases = await userRes.json();
          if (Array.isArray(userCases) && userCases.length > 0) {
            acc[id] = userCases;
          }
        } else {
          console.error(`Failed to fetch cases for user ID: ${id}`);
        }

        return acc;
      }, Promise.resolve({}));

      // Set state only if there are valid users and cases
      setAppointedUsersCases(appointedCases);
      setAppointedUsers(validUserDetails);
      setMiniLoading(false);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const handelNewCase = () => {
    console.log(true);
    router.push("/newcasepage");
  };
  const filteredCases = cases.filter((c) => {
    const statusMatch = filter === "All" || c.Status === filter;
    const caseDate = new Date(c.CaseDate);
    const caseMonthYear = `${caseDate.getFullYear()}-${String(
      caseDate.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthMatch =
      selectedMonthYear === "All" || caseMonthYear === selectedMonthYear;
    return statusMatch && monthMatch;
  });

  const handleIsYourCase = () => {
    setIsYourCase(true);
  };
  const handleIsTeamCase = () => {
    setIsYourCase(false);
  };

  const updateNotifyStatus = async (id, readStatus, mark) => {
    try {
      const response = await fetch(
        `https://sourcecorp.in/api/userFile/updateNotifyStatus`,
        {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            readStatus:
              typeof readStatus === "string"
                ? readStatus === "true"
                : readStatus,
            mark: typeof mark === "string" ? mark === "true" : mark,
          }),
        }
      );
      if (response.ok) {
        fetchNotifications();
      }
      const result = await response.json();

      console.log("Update result:", result);

      // Optionally re-fetch notifications here
      // await fetchNotifications();
    } catch (error) {
      console.error("Failed to update notification:", error);
    }
  };
  const decryptData = (encryptedData) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, PPass);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedText); // Convert back to JSON object
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  };
  const handleFetchCustomerDetails = () => {
    if (caseData.CoustomerDetails) {
      const decryptedCustomerData = decryptData(caseData.CoustomerDetails);
      if (decryptedCustomerData) {
        setCustomerDetails(decryptedCustomerData);
      } else {
        alert("Failed to decrypt customer details.");
      }
    } else {
      alert("No customer details found.");
    }
  };

  const Summary = {
    "New Case": 0,
    "Login Case": 0,
    "Underwriting Case": 0,
    "Approved Case": 0,
    "Disbursed Case": 0,
    "Rejected Case": 0,
  };

  cases.forEach(({ CaseId, Status, CoustomerDetails }) => {
    console.log(CoustomerDetails);
    if(CoustomerDetails && CoustomerDetails != 'nil'){
      console.log("coustomer details found")
      const customer = decryptData(CoustomerDetails);
      const amount = parseFloat(customer.amount) || 0;
  
      if (Summary.hasOwnProperty(Status)) {
        if (Status === "New Case" || Status === "Login Case") {
    Summary[Status] += 1;
  } else {
    Summary[Status] += amount;
  }
      }
    }
    else{
      console.log("no coustomer details found")
    }
    
  });
  return (
    <>
      {loading ? (
        <div>
          <div className="relative ">
            <Loading />
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 to-black text-black font-sans">
          {/* Header */}
          <header className="bg-white shadow-lg p-4 flex justify-between items-center px-8 md:px-12 border-b-4 border-orange-500">
            <div className="text-xl font-extrabold text-gray-800 flex justify-center items-center">
              <img
                src="//img1.wsimg.com/isteam/ip/06a8fce5-3b35-48ef-9f0e-ab337ebd9cb8/blob-e8ec071.png/:/rs=h:87,cg:true,m/qt=q:95"
                alt="SOURCECORP"
              />
            </div>

            <h1 className="text-3xl flex items-center gap-12  font-semibold text-orange-600">
              

              {/* Coming Soon Leaderboard Section */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-lg px-5 py-3 max-w-sm select-none flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {/* You can replace the SVG with any icon you like */}
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-3 0-5 1.5-5 4.5S9 17 12 17s5-1.5 5-4.5S15 8 12 8z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 12v.01"
                    ></path>
                  </svg>
                  <span className="font-bold text-lg animate-pulse text-black">
                    Leaderboard Coming Soon
                  </span>
                </div>
              </div>
              {/* CRM and logged in info */}
              <div className="flex flex-col justify-center items-center gap-2">
                CRM
                <div className="flex gap-2 justify-center items-center text-xl text-gray-700">
                  <span>Logged in as:</span>
                  <span className="font-bold">{username}</span>
                </div>
              </div>
            </h1>

            <div className="flex items-center space-x-6">
              {username ? (
                <div className="flex justify-center items-center gap-3">
                  <div className="flex justify-around w-full gap-2">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-5 py-2 rounded-full shadow-md transition duration-300 hover:from-yellow-600 hover:to-orange-600 focus:ring-2 focus:ring-orange-400"
                    >
                      Notification | {MarkCount} unread | {readCount} ongoing
                    </button>

                    <button
                      onClick={handellogout}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-full shadow-md transition duration-300 hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-400"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full shadow-md transition duration-300 hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-400"
                >
                  Login
                </button>
              )}
            </div>
          </header>

          {/* Main Content */}
          <div className="flex flex-col relative h-screen justify-center items-center">
            {showNotifications && (
              <div className="absolute z-10 right-5 top-1 h-[55vh]  bg-white shadow-lg rounded-lg p-4 w-[45rem] border-2 border-orange-400">
                <div className="flex justify-between items-center gap-3 h-12">
                  <h3 className="text-lg font-semibold text-orange-600 mb-2">
                    Notifications
                  </h3>
                  <button
                    className="w-20 rounded-full bg-orange-500 text-white font-medium hover:bg-green-600"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    Close
                  </button>
                </div>
                <div className="flex items-center gap-3 h-12">
                  <p className="text-sm text-gray-500">
                    Last refreshed: {lastRefreshed}
                  </p>
                  <button
                    className="w-20 rounded-full bg-orange-500 text-white font-medium hover:bg-green-600"
                    onClick={handleNotifyRefresh}
                  >
                    Refresh
                  </button>
                </div>
                <div className="flex justify-center mb-4">
                  <button
                    onClick={() => setViewCompleted(false)}
                    className={`px-4 py-2 rounded-l-full ${
                      !viewCompleted
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    Ongoing
                  </button>
                  <button
                    onClick={() => setViewCompleted(true)}
                    className={`px-4 py-2 rounded-r-full ${
                      viewCompleted
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    Completed
                  </button>
                </div>

                <div className="max-h-[39vh] overflow-y-auto border-2 rounded-2xl bg-gray-50">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((note) => (
                      <div
                        key={note.ID}
                        className="p-2 border-b flex justify-between bg-white shadow-sm rounded-md mb-2"
                      >
                        <div className="w-[80%]">
                          <p className="text-sm font-semibold text-blue-600">
                            From: {note.Tousername}
                          </p>
                          <p className="text-sm text-gray-700 break-words whitespace-normal">
                            {note.Note}
                          </p>
                          <button
                            onClick={() => handelNotifyViewCase(note)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 mt-2"
                          >
                            View Case
                          </button>
                        </div>

                        <div className="flex flex-col justify-center items-center">
                          <h1 className="font-bold">Mark as</h1>

                          {/* Read / Unread Toggle */}
                          <button
                            onClick={() =>
                              updateNotifyStatus(
                                note.ID,
                                note.ReadStatus,
                                !note.Mark
                              )
                            }
                            className={`px-3 py-1 rounded-lg mt-2 text-white ${
                              !note.Mark
                                ? "bg-yellow-500 hover:bg-yellow-600"
                                : "bg-gray-500 hover:bg-gray-600"
                            }`}
                          >
                            {note.Mark ? "Unread" : "Read"}
                          </button>

                          {/* Completed / Ongoing Toggle */}
                          <button
                            onClick={() =>
                              updateNotifyStatus(
                                note.ID,
                                !note.ReadStatus,
                                note.Mark
                              )
                            }
                            className={`px-3 py-1 rounded-lg mt-2 text-white ${
                              !note.ReadStatus
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-green-500 hover:bg-green-600"
                            }`}
                          >
                            {note.ReadStatus ? "Ongoing" : "Completed"}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500">
                      No notifications to display.
                    </p>
                  )}
                </div>
              </div>
            )}

      {/* Case Summary White Container */}
      <div className="bg-white p-4 rounded-2xl shadow-md mb-6 w-full grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
  {Object.entries(Summary).map(([status, total]) => (
    <div
      key={status}
      className="border rounded-xl p-4 text-center flex flex-col items-center justify-center"
    >
      <span className="font-semibold">{status}</span>
      <span className="text-orange-600 font-bold text-lg">
        {status === "New Case" || status === "Login Case"
          ? `${total} Case${total !== 1 ? "s" : ""}`
          : `₹${total.toFixed(2)}`}
      </span>
    </div>
  ))}
</div>

            <div className="-translate-y-5  border-2 h-12 rounded-2xl w-[20vh] flex justify-between items-center">
              <button
                onClick={handleIsYourCase}
                className={` ${
                  isyourcase
                    ? "bg-orange-100 shadow-2xl shadow-orange-500 font-bold"
                    : ""
                } h-full w-full rounded-tl-2xl rounded-bl-2xl `}
              >
                Your Case
              </button>
              <span className="h-[1px] w-8 -rotate-90 bg-black"></span>
              <button
                onClick={handleIsTeamCase}
                className={`${
                  isyourcase
                    ? " "
                    : "bg-orange-100 shadow-2xl shadow-orange-500 font-bold"
                } h-full w-full rounded-tr-2xl rounded-br-2xl`}
              >
                Team Case
              </button>
            </div>

            <div className="h-[70vh] w-[80%]  rounded-2xl shadow-2xl shadow-black overflow-y-auto border-2 border-orange-500">
              <div
                className={`${
                  isyourcase ? "container" : "hidden"
                }  mx-auto p-6`}
              >
                {/* Add New Case Button and Month-Year Filter */}
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handelNewCase}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-green-500 hover:text-black"
                  >
                    Add New Case
                  </button>

                  {/* Month-Year Filter Dropdown */}
                  <select
                    value={selectedMonthYear}
                    onChange={(e) => setSelectedMonthYear(e.target.value)}
                    className="ml-4 px-4 py-2 rounded-lg border border-gray-300"
                  >
                    <option value="All">All Months</option>
                    {Array.from(
                      new Set(
                        cases.map((c) => {
                          const date = new Date(c.CaseDate); // convert string to Date
                          return `${date.getFullYear()}-${String(
                            date.getMonth() + 1
                          ).padStart(2, "0")}`;
                        })
                      )
                    ).map((monthYear) => (
                      <option key={monthYear} value={monthYear}>
                        {new Date(monthYear + "-01").toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="mb-6 flex space-x-4">
                  {[
                    "All",
                    "New Case",
                    "Login Case",
                    "Underwriting Case",
                    "Approved Case",
                    "Disbursed Case",
                    "Rejected Case",
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-4 py-2 rounded-lg ${
                        filter === status
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300"
                      } hover:bg-blue-600`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Case List */}
                <div className="bg-white p-4 shadow-md rounded-lg">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-3 text-left">Case Name</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Date</th>

                        <th className="p-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.length > 0 ? (
                        filteredCases.map((c, index) => (
                          <tr key={c.ID || index} className="border-b">
                            <td className="p-3">{c.Name}</td>
                            <td className="p-3">{c.Status}</td>
                            <td className="p-3">{c.CaseDate}</td>
                            <td className="p-3">
                              {c.Name === "nil" ||
                              c.Status === "nil" ||
                              c.CaseDate === "nil" ? (
                                <button
                                  onClick={handelNewCase}
                                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-green-500 hover:text-black"
                                >
                                  Add New Case
                                </button>
                              ) : (
                                <button
                                  onClick={() => handelViewCase(c)}
                                  className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                                >
                                  View Case
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b">
                          <td className="p-3">loading</td>

                          <td className="p-3">loading</td>
                          <td className="p-3">loading</td>
                          <td className="p-3">loading</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                className={`${isyourcase ? "hidden" : "container"} mx-auto p-6`}
              >
                <h1 className="text-center text-2xl font-semibold text-gray-800 mb-6">
                  User Case Management
                </h1>

                {/* Search & Filters */}
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Search Input */}
                  <input
                    type="text"
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-blue-400"
                  />

                  {/* User Selection Dropdown */}
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="all">All Users</option>
                    {appointedUsers.map((user) => (
                      <option key={user.ID} value={user.Name}>
                        {user.Name}
                      </option>
                    ))}
                  </select>

                  {/* Role Selection Dropdown */}
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="border border-gray-300 p-2 rounded-md w-full focus:ring-2 focus:ring-blue-400"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* User List */}
                <div className="overflow-x-auto bg-white p-4 rounded shadow-md">
                  {miniLoading ? (
                    <div className="flex justify-center py-8">
                      <MiniLoadingAnimation />
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-blue-500 text-white">
                          <th className="p-3 text-left">User Name</th>
                          <th className="p-3 text-left">Email</th>
                          <th className="p-3 text-left">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <React.Fragment key={user.ID}>
                              {/* User Details Row */}
                              <tr className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition">
                                <td className="p-3">{user.Name}</td>
                                <td className="p-3">{user.Email}</td>
                                <td className="p-3">{user.Role}</td>
                              </tr>

                              {/* Cases Container Below User */}
                              <tr>
                                <td colSpan="3" className="p-3">
                                  <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
                                    {appointedCases[user.ID]?.length > 0 ? (
                                      <ul className="space-y-2">
                                        {appointedCases[user.ID].map(
                                          (c, index) => (
                                            <li
                                              key={c.ID || `case-${index}`}
                                              className="flex items-center justify-between bg-white p-3 rounded-md shadow-md"
                                            >
                                              <div className="flex items-center gap-4">
                                                <p className="font-semibold text-gray-800">
                                                  {c.Name}
                                                </p>
                                                <span className="text-gray-600 bg-gray-200 px-3 py-1 rounded-lg">
                                                  {c.Status}
                                                </span>
                                              </div>
                                              <button
                                                onClick={() =>
                                                  handelViewCase(c)
                                                }
                                                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition"
                                              >
                                                View Case
                                              </button>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    ) : (
                                      <p className="text-gray-500 text-center">
                                        No cases assigned
                                      </p>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            </React.Fragment>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="3"
                              className="p-3 text-center text-gray-500"
                            >
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
