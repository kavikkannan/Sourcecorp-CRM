"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/Loading";
import { fetchWithFallback } from "../utils/api";

// A simple hook to check for screen size
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    // Set initial state based on server/client consistency
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    // Listen for changes
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);
  return matches;
};


// Reusable Agent Details Component
const AgentDetailsCard = ({ agent, className }) => (
  <div className={`bg-blue-100/50 p-6 rounded-2xl border border-blue-200 shadow-lg ${className}`}>
    <h2 className="text-xl font-bold text-gray-800 mb-4">Agent Information</h2>
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-500">Name</label>
        <p className="font-semibold text-gray-900">{agent.name || 'N/A'}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-500">Email</label>
        <p className="font-semibold text-gray-900">{agent.email || 'N/A'}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-500">Contact</label>
        <p className="font-semibold text-gray-900">{agent.contact || 'N/A'}</p>
      </div>
    </div>
  </div>
);


export default function AddNewCase() {
  const [casename, setCaseName] = useState("");
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    contact: "",
    email: "",
    amount: "",
    type: "",
    countryCode: "+91",
    unknown1: "DSA",
  });
  const [agent, setAgent] = useState({ name: '', contact: '', email: '' });
  const [files, setfiles] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [PPass, setPPass] = useState("");
  const [userid, setUserID] = useState("");
  const router = useRouter();
  const [validationErrors, setValidationErrors] = useState({});
  
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    const PPass = sessionStorage.getItem("PPass");
    const NoFF = sessionStorage.getItem("nofi");
    const id = sessionStorage.getItem("userId");
    const email = sessionStorage.getItem("loggedinemail");
    const number = sessionStorage.getItem("loggedinnumber");
    const name = sessionStorage.getItem("username");

    setPPass(PPass || '');
    setUserID(id || '');
    setAgent({ name: name || '', contact: number || '', email: email || '' });
  }, []);

  function handleFileUpload(event) {
    setfiles([...files, ...event.target.files]);
  }

  function removeDocument(index) {
    setfiles(files.filter((_, i) => i !== index));
  }

  const handleSubmit = () => {
    const errors = {};
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!casename.trim()) errors.caseName = "Case name is required.";
    if (!customer.name.trim()) errors.name = "Customer name is required.";
    if (!customer.contact.trim()) {
      errors.contact = "Contact number is required.";
    } else if (!phoneRegex.test(customer.contact)) {
      errors.contact = "Enter a valid mobile number (10–15 digits).";
    }
    if (!customer.email.trim()) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(customer.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!customer.amount.trim() || isNaN(customer.amount)) errors.amount = "A valid amount is required.";
    if (!customer.type.trim()) errors.type = "Loan type is required.";
    if (files.length === 0) errors.files = "At least one document is required.";

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors before submitting.", { theme: "colored" });
      return;
    }

    setShowPopup(true);
  };

  const getCurrentTimestamp = () => {
    return new Date().toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const uploadFiles = async (pindex, casename1, filess) => {
    const formData = new FormData();
    formData.append("pindex", pindex);
    formData.append("casename", casename1);
    for (let i = 0; i < filess.length; i++) {
      formData.append("files", filess[i]);
    }

    try {
      const response = await fetch("https://vfinserv.in/api/uploadDocs", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Files uploaded successfully!");
      } else {
        console.log(`Upload failed: ${result.message}`);
      }
    } catch (error) {
      console.log("Error uploading files");
    }
  };

  const handleSync = async (e, CasePfile) => {
    if (e) e.preventDefault();

    const crypto = require("crypto");

    const CHUNK_SIZE = 512;
    const PPass = sessionStorage.getItem("PPass");
    const KFile = crypto.randomBytes(32).toString("hex");
    const numNodes = 4;
    const logname = sessionStorage.getItem("username");

    function encryptData(data, key) {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
      const encrypted = Buffer.concat([
        cipher.update(data, "utf8"),
        cipher.final(),
      ]);
      return {
        encryptedData: encrypted.toString("hex"),
        iv: iv.toString("hex"),
      };
    }
    const entries = [
      {
        type: "note",
        message: "Case opened",
        user: logname,
        timestamp: getCurrentTimestamp(),
      },
    ];
    const jsonData = JSON.stringify(entries, null, 2);

    const fragments = [];
    for (let i = 0; i < jsonData.length; i += CHUNK_SIZE) {
      fragments.push(jsonData.slice(i, i + CHUNK_SIZE));
    }

    const { encryptedData: PFile, iv: PFileIV } = encryptData(
      KFile + "$$" + fragments.length + "@@" + numNodes,
      Buffer.from(PPass, "utf-8").subarray(0, 32)
    );

    let NoOfFilesStored = 1;
    const { pi } = genEIForPfile1(CasePfile, NoOfFilesStored);

    try {
      await fetchWithFallback(
        `/api/logs/pfile/insert`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ eindex: pi, pfile: PFile, pfileiv: PFileIV }),
        }
      );
    } catch (error) {
      console.error("Error storing PFile:", error);
    }

    const PFileKey = Buffer.from(crypto.createHash("sha256").update(PFile).digest("hex"), "hex").subarray(0, 32);
    const InitialIndex = parseInt(PFile.substring(0, 6), 16) % 100;

    let EI = [];
    for (let n = InitialIndex; n < InitialIndex + fragments.length; n++) {
      EI.push(crypto.createHash("sha256").update(PFile + n).digest("hex"));
    }

    let EM = fragments.map(fragment => encryptData(fragment, PFileKey));

    for (let i = 0; i < fragments.length; i++) {
      try {
        await fetchWithFallback(`/api/insert/k`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            eindex: EI[i],
            emessage: EM[i]["encryptedData"],
            iv: EM[i]["iv"],
          }),
        });
      } catch (error) {
        console.error("Error storing encrypted JSON chunk:", error);
      }
    }
  };

  const genEIForPfile1 = (PPass, n) => {
    const crypto = require("crypto");
    PPass = PPass.toString("hex");
    let InitialIndex = Buffer.from(crypto.createHash("sha256").update(PPass).digest("hex"), "hex").subarray(0, 32);
    InitialIndex = parseInt(InitialIndex[0]) % 100;
    n += InitialIndex;
    let PI = crypto.createHash("sha256").update(PPass + n).digest("hex");
    return { pi: PI };
  };

  const encryptDataForDB = (data) => {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, PPass).toString();
  };

  const encryptPFile = (data, key) => {
    try {
      const iv = crypto.createHash("sha256").update(data).digest().subarray(0, 16);
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

  function generateCaseId(userId, noOfFiles) {
    const now = new Date();
    const paddedUserId = String(userId).padStart(3, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);
    return `${paddedUserId}${day}${month}${year}${noOfFiles}`;
  }
  const encryptData = (data) => {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, PPass).toString();
  };
  const confirmSubmission = async () => {
    setLoading(true);
    const encryptedData = encryptData(customer);
    localStorage.setItem("customerData", encryptedData);
    const NoFF = sessionStorage.getItem("nofi");
    let number = parseInt(NoFF, 10); // Ensure it's a number
    number += 1;
    const nofff = number.toString();
    const crypto = require("crypto");

    const randomPart = crypto.randomBytes(32).toString("hex");
    const timestamp = Date.now().toString();
    const KFile = `${randomPart}${timestamp}`;

    const { encryptedData: PFile11, iv: PFileIV11 } = encryptPFile(
      KFile + "$$" + files.length,
      Buffer.from(PPass, "utf-8").subarray(0, 32)
    );
    handleSync(null, PFile11);
    const { encryptedData: pp, iv: PPpIV } = encryptPFile(
      PPass + "$$" + nofff,
      Buffer.from(PPass, "utf-8").subarray(0, 32)
    );
    const Index = parseInt(pp.substring(0, 6), 16) % 100;
    let PIndex = crypto
      .createHash("sha256")
      .update(pp + Index)
      .digest("hex");
    const formattedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const caseId = generateCaseId(userid, nofff);
    try {
      const pindex = PIndex;
      const Pfile = PFile11;
      const piv = PFileIV11;
      const caseName = casename;
      const status = "New Case";
      const agentId = userid;
      const coustomerDetails = encryptedData;
      const unknown1 = customer.unknown1;
      const caseDate = formattedDate;
      const response = await fetch(
        `https://vfinserv.in/api/userFile/insert`,
        {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({
            pindex,
            Pfile,
            piv,
            caseName,
            status,
            agentId,
            coustomerDetails,
            unknown1,
            caseDate,
            caseId,
          }),
        }
      );

      if (!response.ok) throw new Error(`Failed to store fragment `);
      if (response.ok) {
        const files1 = files;
        const casePIndex = pindex; // Replace with dynamic value
        const casename1 = caseName;
        uploadFiles(casePIndex, casename1, files1);
      }
    } catch (error) {
      console.error("Storage error:", error);
    }
    try {
      const id = parseInt(userid);
      const no_of_files = parseInt(nofff);
      const response = await fetch(`https://vfinserv.in/api/updateNofiles`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          no_of_files,
        }),
      });
      if (response.ok) {
        const userResponse = await fetch("https://vfinserv.in/api/user", {
          method: "GET",
          credentials: "include",
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          sessionStorage.setItem("userId", userData.ID);
          sessionStorage.setItem("username", userData.Name);
          sessionStorage.setItem("isAdmin", userData.IsAdmin);
          sessionStorage.setItem("nofi", userData.NoOfFiles);
          sessionStorage.setItem("PPass", userData.PPass);

          router.push("/home");
        } else {
          setLoading(false);
          console.error("Failed to retrieve user information");
        }
      } else if (!response.ok) {
        throw new Error(`Failed to store fragment `);
      }
    } catch (error) {
      setLoading(false);
      console.error("Storage error:", error);
    }
  };

  const handleBack = () => router.push("/home");
  
  return (
    <>
      {loading && <Loading />}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-orange-200 text-black p-4 md:p-8">
        <header className="bg-white/80 backdrop-blur-md shadow-lg p-4 flex justify-between items-center rounded-xl mb-8">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <img src="//img1.wsimg.com/isteam/ip/06a8fce5-3b35-48ef-9f0e-ab337ebd9cb8/blob-e8ec071.png/:/rs=h:87,cg:true,m/qt=q:95" alt="SOURCECORP" className="h-10" />
          </div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">Create a New Case</h1>
          <div className="w-16"></div> {/* Spacer */}
        </header>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8 max-w-7xl mx-auto">
          {/* Agent Details - Desktop Left Sidebar */}
          {isDesktop && (
            <aside className="lg:col-span-4 xl:col-span-3">
              <AgentDetailsCard agent={agent} className="sticky top-28"/>
            </aside>
          )}

          {/* Main Form */}
          <main className="lg:col-span-8 xl:col-span-9">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 space-y-8">
              
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Case Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Case Name Input */}
                    <div>
                        <label htmlFor="caseName" className="block text-sm font-medium text-gray-700 mb-1">Case Name</label>
                        <input
                            id="caseName"
                            value={casename}
                            onChange={e => setCaseName(e.target.value)}
                            placeholder="e.g., John Doe - Personal Loan"
                            required
                            className={`w-full p-2 border ${validationErrors.caseName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {validationErrors.caseName && <p className="text-red-600 text-xs mt-1">{validationErrors.caseName}</p>}
                    </div>

                    {/* Loan Amount Input */}
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (₹)</label>
                        <input
                            id="amount"
                            type="number"
                            value={customer.amount}
                            onChange={e => setCustomer({ ...customer, amount: e.target.value })}
                            placeholder="e.g., 500000"
                            required
                            className={`w-full p-2 border ${validationErrors.amount ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {validationErrors.amount && <p className="text-red-600 text-xs mt-1">{validationErrors.amount}</p>}
                    </div>
                    
                    {/* Loan Type Select */}
                    <div>
                      <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 mb-1">Loan Type</label>
                      <select id="loanType" value={customer.type} onChange={e => setCustomer({ ...customer, type: e.target.value })} required className={`w-full p-2 border ${validationErrors.type ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}>
                        <option value="">Select Loan Type</option>
                        <option value="Home Loan">Home Loan</option><option value="Personal Loan">Personal Loan</option><option value="Business Loan">Business Loan</option><option value="Mortgage Loan">Mortgage Loan</option><option value="Machinery Loan">Machinery Loan</option><option value="Education Loan">Education Loan</option><option value="Car Loan">Car Loan</option>
                      </select>
                      {validationErrors.type && <p className="text-red-600 text-xs mt-1">{validationErrors.type}</p>}
                    </div>
                    
                    {/* Source Type Radio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Source Type</label>
                      <div className="flex gap-4 p-2 bg-gray-100 rounded-md"><label className="flex items-center gap-2"><input type="radio" name="unknown1" value="DSA" checked={customer.unknown1 === "DSA"} onChange={() => setCustomer({ ...customer, unknown1: "DSA" })} className="form-radio text-blue-600"/> DSA</label><label className="flex items-center gap-2"><input type="radio" name="unknown1" value="DST" checked={customer.unknown1 === "DST"} onChange={() => setCustomer({ ...customer, unknown1: "DST" })} className="form-radio text-blue-600"/> DST</label></div>
                    </div>
                </div>
              </div>

              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">{isDesktop ? "Customer Details" : "Customer & Agent Details"}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Name Input */}
                    <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            id="customerName"
                            value={customer.name}
                            onChange={e => setCustomer({ ...customer, name: e.target.value })}
                            placeholder="John Doe"
                            required
                            className={`w-full p-2 border ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {validationErrors.name && <p className="text-red-600 text-xs mt-1">{validationErrors.name}</p>}
                    </div>

                    {/* Customer Email Input */}
                    <div>
                        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            id="customerEmail"
                            type="email"
                            value={customer.email}
                            onChange={e => setCustomer({ ...customer, email: e.target.value })}
                            placeholder="john.doe@example.com"
                            required
                            className={`w-full p-2 border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {validationErrors.email && <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>}
                    </div>

                    {/* Customer Contact Input */}
                    <div>
                      <label htmlFor="customerContact" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                      <div className="flex">
                          <select value={customer.countryCode} onChange={e => setCustomer({ ...customer, countryCode: e.target.value })} className="p-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 focus:outline-none">
                              <option value="+91">🇮🇳 +91</option><option value="+1">🇺🇸 +1</option>
                          </select>
                          <input id="customerContact" type="tel" value={customer.contact} onChange={e => setCustomer({ ...customer, contact: e.target.value.replace(/\D/g, "") })} placeholder="9876543210" required className={`w-full p-2 border ${validationErrors.contact ? 'border-red-500' : 'border-gray-300'} rounded-r-md shadow-sm focus:ring-blue-500 focus:border-blue-500`} />
                      </div>
                      {validationErrors.contact && <p className="text-red-600 text-xs mt-1">{validationErrors.contact}</p>}
                    </div>
                    
                </div>
                <br/>
                {!isDesktop && <AgentDetailsCard agent={agent} className="mb-6"/> }

              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Documentation</h2>
                <div className={`p-6 border-2 ${validationErrors.files ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-lg text-center`}>
                  <input type="file" multiple onChange={handleFileUpload} id="fileUpload" className="hidden"/>
                  <label htmlFor="fileUpload" className="cursor-pointer text-blue-600 font-semibold">Drag & drop files here, or click to browse</label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF, etc.</p>
                  {validationErrors.files && <p className="text-red-600 text-sm mt-2">{validationErrors.files}</p>}
                </div>
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (<div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md text-sm"><span>{file.name}</span><button onClick={() => removeDocument(index)} className="text-red-500 hover:text-red-700 font-bold">&times;</button></div>))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={handleSubmit} className="bg-orange-500 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:bg-green-600 transition-all transform hover:scale-105">Create Case</button>
              </div>
            </div>
          </main>
        </div>

        {showPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Confirm Case Details</h2>
              <div className="space-y-2 text-gray-600">
                <p><strong>Case Name:</strong> {casename}</p><p><strong>Customer:</strong> {customer.name}</p><p><strong>Contact:</strong> {customer.contact}</p><p><strong>Amount:</strong> ₹{parseFloat(customer.amount).toLocaleString('en-IN')}</p><p><strong>Loan Type:</strong> {customer.type}</p><p><strong>Documents:</strong> {files.length} file(s) attached</p><p><strong>Agent:</strong> {agent.name}</p>
              </div>
              <div className="flex justify-between mt-6">
                <button onClick={() => setShowPopup(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">Make Changes</button>
                <button onClick={confirmSubmission} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">Confirm & Submit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}