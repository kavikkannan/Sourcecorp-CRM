"use client";
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import Loading from "@/components/Loading";
import MiniLoadingAnimation from "./MiniLoading";
import { fetchWithFallback } from "../utils/api";
import { motion } from "framer-motion";
import BirthdayGreetingOverlay from "./BirthdayGreetingOverlay";
const CakeButton = ({ onClick }) => {
  const firecrackerCount = 12;
  const radius = 60;

  return (
      <motion.button
          onClick={onClick}
          className="fixed bottom-5 left-5 w-20 h-20 rounded-full bg-pink-500/80 backdrop-blur-sm flex items-center justify-center text-4xl z-50 shadow-lg"
          whileHover={{ scale: 1.1, boxShadow: "0 0 30px #d4af37" }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300 }}
      >
          {Array.from({ length: firecrackerCount }).map((_, i) => {
              const angle = (i / firecrackerCount) * 360;
              const x = radius * Math.cos((angle * Math.PI) / 180);
              const y = radius * Math.sin((angle * Math.PI) / 180);

              return (
                  <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                      style={{ top: '50%', left: '50%', translateX: '-50%', translateY: '-50%' }}
                      animate={{ x: [0, x], y: [0, y], opacity: [1, 0], scale: [1, 0.5] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1, ease: "easeOut" }}
                  />
              );
          })}
          🎂
      </motion.button>
  );
};

export default function HomePage() {
  const [username, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState("All");
  const [nooffiles, setNoOfFiles] = useState("");
  const [PPass, setPPass] = useState("");
  const [userid, setUserID] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
  const [teamCaseAmount, setTeamCaseAmount] = useState([]);
  const [showBirthdayGreeting, setShowBirthdayGreeting] = useState(false)
  const [viewCompleted, setViewCompleted] = useState(false); // false = Ongoing
  const filteredNotifications = notifications.filter(
    (note) => note.ReadStatus === viewCompleted
  );
  const [selectedMonthYear, setSelectedMonthYear] = useState("All");
  const roles = ["All", ...new Set(appointedUsers.map((user) => user.Role))];

  const filteredUsers = appointedUsers.filter(
    (user) =>
      (selectedRole === "All" || user.Role === selectedRole) &&
      (selectedUser === "all" || user.ID === selectedUser) &&
      ((user.Name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        user.Email?.toLowerCase()?.includes(searchTerm.toLowerCase())) ?? false)
  );
  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    if (!storedUsername) {
      router.push("/login"); // Redirect to login page
    } else {
      setUser(storedUsername);
      const adminStatus = sessionStorage.getItem("isAdmin") === "true";
      setIsAdmin(adminStatus);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchCases();
    fetchTeamCaseAmounts();
  }, []);

  const fetchTeamCaseAmounts = async () => {
    try {
      const response = await fetchWithFallback(`/api/fetch_amount`);
      
      if (response && Array.isArray(response)) {
        // Set the array of case amounts if you need to use individual amounts
        setTeamCaseAmount(response);
        
        // Calculate total amount if needed
        const total = response.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        
        // If you want to store the total in state
        // setTotalAmount(total);
      } else if (response && response.error) {
        console.error("Error from server:", response.error);
      } else {
        console.log("No case amounts found");
        setTeamCaseAmount([]);
      }
    } catch (error) {
      console.error("Error fetching team case amounts:", error);
      setTeamCaseAmount([]);
    }
  };

  const handleNotifyRefresh = () => {
    fetchNotifications();
  };
  const fetchNotifications = async () => {
    const useri = sessionStorage.getItem("userId");
    try {
      const data = await fetchWithFallback(`/api/fetch/notify/${useri}`);

      if (!data) {
        console.log("No notifications found.");
        setNotifications([]);
        return;
      }

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
      const data = await fetch(`https://vfinserv.in/api/userFile/fetch/${NData.PIndex}` , {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data1 = await data.json();
      if (data1) {
        sessionStorage.setItem("selectedCase", JSON.stringify(data1));
      }
      
      try {
        const userData = await fetchWithFallback(`/api/user/${parseInt(NData.caseAgentId)}`);
        if (userData) {
          sessionStorage.setItem("CasePPass", userData.PPass);
        } else {
          setLoading(false);
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching case data:", error);
      setLoading(false);
    }

    router.push("/casepage");
  };

  const handelViewCase = async (selectedCase) => {
    setLoading(true);
    try {
      const data = await fetchWithFallback(`/api/user/${parseInt(selectedCase.AgentId)}`);
      if (data) {
        sessionStorage.setItem("CasePPass", data.PPass);
      } else {
        setLoading(false);
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
    sessionStorage.setItem("selectedCase", JSON.stringify(selectedCase));
    router.push("/casepage");
  };

  const handellogout = async () => {
    try {
      const response = await fetchWithFallback(`/api/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include"
      });

      if (response) {
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
      const userData = await fetchWithFallback("/api/user", {
        method: "GET",
        credentials: "include"
      });

      if (!userData) {
        console.log("No login found");
        return;
      }

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
          fetch(`https://vfinserv.in/api/userFile/fetch/${pindex}`)
        )
      );

      const data = await Promise.all(
        responses.map((res) => (res.ok ? res.json() : null))
      );

      const validCases = data.filter((item) => item !== null);

      if (validCases.length > 0) {
        setCases(validCases);
      } else {
        setCases([]);
      }
    } catch (error) {
      console.log("Error fetching cases:", error);
      setCases([]);
    }
  }

  const handleGetAppointedMembers = async () => {
    setMiniLoading(true);
    const userId = sessionStorage.getItem("userId");
    try {
      const data = await fetchWithFallback(`/api/appointedUser/${userId}`);
      if (!data || !data.hierarchy || data.hierarchy.trim() === "") {
        console.log("No appointed members found.");
        setMiniLoading(false);
        return;
      }

      setAPPSchedu(data.hierarchy);
      const userIds = [...new Set(data.hierarchy.split(",").map((id) => id.trim()).filter((id) => id))];
      if (userIds.length === 0) {
        console.log("No valid user IDs found.");
        setMiniLoading(false);
        return;
      }

      const userDetails = (await Promise.all(userIds.map(id => fetchWithFallback(`/api/user/${id}`)))).filter(Boolean);
      if (userDetails.length === 0) {
        console.log("No valid user details found.");
        setMiniLoading(false);
        return;
      }

      const appointedCasesData = await userIds.reduce(async (accPromise, id) => {
        const acc = await accPromise;
        const userCases = await fetchWithFallback(`/api/userFile/fetchbyid/${id}`);
        if (Array.isArray(userCases) && userCases.length > 0) acc[id] = userCases;
        return acc;
      }, Promise.resolve({}));

      setAppointedUsersCases(appointedCasesData);
      setAppointedUsers(userDetails);
    } catch (error) {
      console.error("Error in handleGetAppointedMembers:", error);
    } finally {
      setMiniLoading(false);
    }
  };

  const handelNewCase = () => {
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

  const handleIsYourCase = () => setIsYourCase(true);
  const handleIsTeamCase = () => setIsYourCase(false);

  const updateNotifyStatus = async (id, readStatus, mark) => {
    try {
      await fetchWithFallback(`/api/userFile/updateNotifyStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          readStatus: typeof readStatus === 'string' ? readStatus === 'true' : readStatus,
          mark: typeof mark === 'string' ? mark === 'true' : mark,
        }),
        credentials: "include"
      });
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to update notification:", error);
    }
  };
  const decryptData = (encryptedData) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, PPass);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  };

  const yourCasesSummary = useMemo(() => {
    const summary = { "New Case": 0, "Login Case": 0, "Underwriting Case": 0, "Approved Case": 0, "Disbursed Case": 0, "Rejected Case": 0 };
    cases.forEach(({ Status, CoustomerDetails }) => {
      if (CoustomerDetails && CoustomerDetails !== 'nil') {
        const customer = decryptData(CoustomerDetails);
        const amount = parseFloat(customer?.amount) || 0;
        if (summary.hasOwnProperty(Status)) {
          summary[Status] += (Status === "New Case" || Status === "Login Case") ? 1 : amount;
        }
      }
    });
    return summary;
  }, [cases, PPass]);

  const teamCasesSummary = useMemo(() => {
    const summary = { "New Case": 0, "Login Case": 0, "Underwriting Case": 0, "Approved Case": 0, "Disbursed Case": 0, "Rejected Case": 0 };
    
    // Create a map of caseId to amount from teamCaseAmount array
    const amountMap = new Map();
    if (Array.isArray(teamCaseAmount)) {
      teamCaseAmount.forEach(({ caseId, amount }) => {
        if (caseId) {
          amountMap.set(String(caseId), parseFloat(amount) || 0);
        }
      });
    }
    
    // Process appointed cases and accumulate amounts
    Object.values(appointedCases).flat().forEach(({ CaseId, Status }) => {
      if (summary.hasOwnProperty(Status)) {
        const amount = amountMap.get(String(CaseId)) || 0;
        // For New/Login cases, count as 1, for others add the amount
        summary[Status] += (Status === "New Case" || Status === "Login Case") ? 1 : amount;
      }
    });
    
    return summary;
  }, [appointedCases, teamCaseAmount]);

  const renderSummaryCards = (summaryData) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {Object.entries(summaryData).map(([status, total]) => (
        <div key={status} className="bg-white/70 backdrop-blur-sm border border-orange-200 rounded-xl p-4 text-center shadow-md transition-transform duration-300 hover:-translate-y-1">
          <h3 className="font-semibold text-gray-600 text-sm md:text-base">{status}</h3>
          <p className="text-orange-600 font-bold text-xl md:text-2xl">
            {status === "New Case" || status === "Login Case"
              ? `${total}`
              : `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          {(status === "New Case" || status === "Login Case") && <span className="text-xs text-gray-500">Case{total !== 1 ? "s" : ""}</span>}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {loading ? (
        <div className="relative"><Loading /></div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-orange-100 text-gray-800 font-sans">
          <header className="bg-white/80 backdrop-blur-md shadow-lg p-4 flex justify-between items-center px-6 md:px-10 border-b-4 border-orange-500 sticky top-0 z-20">
            <div className="text-xl font-extrabold flex items-center">
              <img src="//img1.wsimg.com/isteam/ip/06a8fce5-3b35-48ef-9f0e-ab337ebd9cb8/blob-e8ec071.png/:/rs=h:87,cg:true,m/qt=q:95" alt="SOURCECORP" className="h-12" />
            </div>
            <div className="hidden md:flex flex-col items-center">
              <h1 className="text-3xl font-semibold text-orange-600">CRM</h1>
              <div className="text-sm text-gray-600">Logged in as: <span className="font-bold">{username}</span></div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              {username ? (
                <>
                  <button onClick={() => setShowNotifications(!showNotifications)} className="relative bg-blue-500 text-white px-3 py-2 rounded-full shadow-md transition-transform duration-300 hover:scale-105 focus:ring-2 focus:ring-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {MarkCount > 0 && (<span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">{MarkCount}</span>)}
                  </button>
                  {isAdmin && (<button onClick={() => router.push("/adminpanel")} className="hidden md:inline-block bg-purple-500 text-white px-4 py-2 rounded-full shadow-md transition-transform duration-300 hover:scale-105 focus:ring-2 focus:ring-purple-400">Admin Panel</button>)}
                  <button onClick={handellogout} className="bg-red-500 text-white px-4 py-2 rounded-full shadow-md transition-transform duration-300 hover:scale-105 focus:ring-2 focus:ring-red-400">Logout</button>
                </>
              ) : (
                <button onClick={() => router.push("/login")} className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-md transition-transform duration-300 hover:scale-105 focus:ring-2 focus:ring-blue-400">Login</button>
              )}
            </div>
          </header>

          <main className="p-4 md:p-8">
           {/*  <CakeButton onClick={() => setShowBirthdayGreeting(!showBirthdayGreeting)} />
            <BirthdayGreetingOverlay isVisible1={showBirthdayGreeting} /> */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-lg p-4 mb-8 text-center">
              <h2 className="font-bold text-xl animate-pulse">Leaderboard Coming Soon!</h2>
            </div>

            {showNotifications && (
              <div className="fixed inset-0 bg-black/30 z-30" onClick={() => setShowNotifications(false)}>
                <div className="absolute right-0 top-0 h-full bg-white shadow-2xl rounded-l-lg p-4 w-full max-w-md md:max-w-lg border-l-4 border-orange-500 transform transition-transform" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-orange-600">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="p-2 rounded-full hover:bg-gray-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <p className="text-gray-500">Last refreshed: {lastRefreshed}</p>
                    <button onClick={handleNotifyRefresh} className="flex items-center gap-1 text-blue-600 hover:underline"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l16 16" /></svg>Refresh</button>
                  </div>
                  <div className="flex justify-center mb-4">
                    <button onClick={() => setViewCompleted(false)} className={`px-4 py-2 rounded-l-full ${!viewCompleted ? "bg-blue-600 text-white" : "bg-gray-300"}`}>Ongoing</button>
                    <button onClick={() => setViewCompleted(true)} className={`px-4 py-2 rounded-r-full ${viewCompleted ? "bg-blue-600 text-white" : "bg-gray-300"}`}>Completed</button>
                  </div>
                  <div className="max-h-[calc(100vh-12rem)] overflow-y-auto space-y-3 p-1">
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.map((note) => (
                        <div key={note.ID} className="bg-white p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                          <p className="text-sm font-semibold text-blue-700">From: {note.Tousername}</p>
                          <p className="text-sm text-gray-700 my-1">{note.Note}</p>
                          <div className="flex justify-between items-center mt-2">
                            <button onClick={() => handelNotifyViewCase(note)} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600">View Case</button>
                            <div className="flex gap-2">
                              <button onClick={() => updateNotifyStatus(note.ID, note.ReadStatus, !note.Mark)} className={`px-2 py-1 text-xs rounded-lg text-white ${!note.Mark ? "bg-yellow-500" : "bg-gray-400"}`}>{note.Mark ? "Unread" : "Read"}</button>
                              <button onClick={() => updateNotifyStatus(note.ID, !note.ReadStatus, note.Mark)} className={`px-2 py-1 text-xs rounded-lg text-white ${!note.ReadStatus ? "bg-red-500" : "bg-green-500"}`}>{note.ReadStatus ? "Ongoing" : "Completed"}</button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-10">No notifications to display.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-4 md:p-6">
              <div className="flex justify-center mb-6">
                <div className="relative flex p-1 bg-gray-200 rounded-full">
                  <button onClick={handleIsYourCase} className={`relative z-10 px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold transition-colors ${isyourcase ? 'text-white' : 'text-gray-600'}`}>Your Cases</button>
                  <button onClick={handleIsTeamCase} className={`relative z-10 px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-semibold transition-colors ${!isyourcase ? 'text-white' : 'text-gray-600'}`}>Team Cases</button>
                  <span className={`absolute top-1 bottom-1 left-1 w-1/2 bg-orange-500 rounded-full transition-transform duration-300 ease-in-out ${isyourcase ? 'translate-x-0' : 'translate-x-full'}`}></span>
                </div>
              </div>

              {/* Conditionally render summary cards */}
              {isyourcase ? renderSummaryCards(yourCasesSummary) : renderSummaryCards(teamCasesSummary)}

              <div className={`${isyourcase ? "block" : "hidden"}`}>
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <button onClick={handelNewCase} className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-green-500 hover:text-black transition-colors shadow-md w-full md:w-auto">+ Add New Case</button>
                  <select value={selectedMonthYear} onChange={(e) => setSelectedMonthYear(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-300 w-full md:w-auto">
                    <option value="All">All Months</option>
                    {[...new Set(cases.filter(c => c.CaseDate).map(c => new Date(c.CaseDate).toISOString().substring(0, 7)))]
                      .sort((a, b) => new Date(b) - new Date(a))
                      .map(monthYear => (<option key={monthYear} value={monthYear}>{new Date(monthYear + "-02").toLocaleString("default", { month: "long", year: "numeric" })}</option>))}
                  </select>
                </div>
                <div className="mb-6 flex flex-wrap gap-2">
                  {["All", "New Case", "Login Case", "Underwriting Case", "Approved Case", "Disbursed Case", "Rejected Case"].map(status => (
                    <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${filter === status ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}>{status}</button>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600"><th className="p-3 rounded-l-lg">Case Name</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3 rounded-r-lg">Action</th></tr></thead>
                    <tbody>
                      {filteredCases.length > 0 ? (
                        filteredCases.map((c, index) => (
                          <tr key={c.ID || index} className="border-b hover:bg-gray-50">
                            <td className="p-3">{c.Name}</td>
                            <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${c.Status === 'Approved Case' || c.Status === 'Disbursed Case' ? 'bg-green-100 text-green-800' : c.Status === 'Rejected Case' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{c.Status}</span></td>
                            <td className="p-3">{new Date(c.CaseDate).toLocaleDateString()}</td>
                            <td className="p-3">{c.Name === "nil" ? (<button onClick={handelNewCase} className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-500">Add New Case</button>) : (<button onClick={() => handelViewCase(c)} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600">View Case</button>)}</td>
                          </tr>
                        ))
                      ) : (<tr><td colSpan="4" className="text-center p-8 text-gray-500">No cases found.</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`${!isyourcase ? "block" : "hidden"}`}>
                <h2 className="text-center text-xl font-semibold text-gray-700 mb-4">User Case Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input type="text" placeholder="Search by name or email" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border p-2 rounded-md focus:ring-2 focus:ring-blue-400" />
                  <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="border p-2 rounded-md focus:ring-2 focus:ring-blue-400">
                    <option value="all">All Users</option>
                    {appointedUsers.map((user) => (<option key={user.ID} value={user.ID}>{user.Name}</option>))}
                  </select>
                  <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="border p-2 rounded-md focus:ring-2 focus:ring-blue-400">
                    {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <div className="overflow-x-auto">
                  {miniLoading ? (<div className="flex justify-center py-8"><MiniLoadingAnimation /></div>) : (
                    <div className="space-y-4">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <div key={`user-${user.ID}`} className="bg-gray-50 rounded-lg shadow-sm border">
                            <div className="grid grid-cols-3 p-3 font-semibold bg-blue-100 rounded-t-lg"><div>{user.Name}</div><div>{user.Email}</div><div>{user.Role}</div></div>
                            <div className="p-3">
                              {appointedCases[user.ID]?.length > 0 ? (
                                <ul className="space-y-2">
                                  {appointedCases[user.ID].map((c, index) => (
                                    <li key={c.ID || `case-${index}`} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                                      <div><p className="font-semibold">{c.Name}</p><span className={`px-2 py-1 text-xs rounded-full ${c.Status === 'Approved Case' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{c.Status}</span></div>
                                      <button onClick={() => handelViewCase(c)} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600">View</button>
                                    </li>
                                  ))}
                                </ul>
                              ) : (<p className="text-gray-500 text-center p-4">No cases assigned.</p>)}
                            </div>
                          </div>
                        ))
                      ) : (<p className="text-center text-gray-500 p-8">No users found.</p>)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
}
