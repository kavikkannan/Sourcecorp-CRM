"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/components/Loading";
import { fetchWithFallback } from "../utils/api";


export default function AddNewCase() {
  const [casename, setCaseName] = useState("New Case!!");
  const logemail = sessionStorage.getItem("loggedinemail");
  const lognumber = sessionStorage.getItem("loggedinnumber");
    const [loading, setLoading] = useState(false);
  
  const logname = sessionStorage.getItem("username");
  const [customer, setCustomer] = useState({
    name: "",
    contact: "",
    email: "",
    amount: "",
    type: "",
    countryCode: "+91",
    unknown1: "DSA",
  });
  const [agent, setAgent] = useState({
    name: `${logname}`,
    contact: `${lognumber}`,
    email: `${logemail}`,
  });
  const [files, setfiles] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [PPass, setPPass] = useState("");
  const [nooffiles, setNoOfFiles] = useState("");
  const [userid, setUserID] = useState("");
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const logemail = sessionStorage.getItem("loggedinemail");
    const lognumber = sessionStorage.getItem("loggedinnumber");
    const PPass = sessionStorage.getItem("PPass");
    const NoFF = sessionStorage.getItem("nofi");
    const id = sessionStorage.getItem("userId");
    setPPass(PPass);
    setNoOfFiles(NoFF);
    setUserID(id);
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

    if (!customer.name.trim()) errors.name = "Name is required.";
    if (!customer.contact.trim()) {
      errors.contact = "Contact is required.";
    } else if (!phoneRegex.test(customer.contact)) {
      errors.contact = "Enter valid mobile number (10–15 digits).";
    }

    if (!customer.email.trim()) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(customer.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (files.length === 0) errors.files = "At least 1 file is required.";

    if (!customer.amount.trim()) errors.amount = "Amount is required.";
    if (casename === "New Case!!" || !casename.trim())
      errors.caseName = "case name is required / new case name is required";
    if (!customer.type.trim()) errors.type = "Loan type is required.";
    if (!customer.countryCode) errors.countryCode = "Country code is required.";

    if (!agent.name.trim()) errors.agentName = "Agent name is required.";
    if (!agent.contact.trim()) {
      errors.agentContact = "Agent contact is required.";
    } else if (!phoneRegex.test(agent.contact)) {
      errors.agentContact = "Invalid agent contact number.";
    }

    if (!agent.email.trim()) {
      errors.agentEmail = "Agent email is required.";
    } else if (!emailRegex.test(agent.email)) {
      errors.agentEmail = "Invalid agent email address.";
    }

    setValidationErrors(errors);
    console.log(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted errors.");
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
      const result = await fetchWithFallback("/api/uploadDocs", {
        method: "POST",
        body: formData,
      });

      if (result) {
        console.log("Files uploaded successfully!");
      } else {
        console.log("Upload failed: No response from server");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleSync = async (e, CasePfile) => {
    if (e) e.preventDefault(); // Prevent form submission

    const crypto = require("crypto");

    const CHUNK_SIZE = 512; // Define chunk size for JSON
    const PPass = sessionStorage.getItem("PPass");
    const KFile = crypto.randomBytes(32).toString("hex");
    const numNodes = 4; // Number of nodes

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
    // Input JSON (Assuming userJson is a JSON object)
    const jsonData = JSON.stringify(entries, null, 2); // Convert JSON to string

    // Step 1: Fragment the JSON message
    const fragments = [];
    for (let i = 0; i < jsonData.length; i += CHUNK_SIZE) {
      fragments.push(jsonData.slice(i, i + CHUNK_SIZE));
    }

    // Step 2: Generate NodePattern
    const NodePattern = [];
    for (let i = 0; i < fragments.length; i++) {
      NodePattern.push((i % numNodes) + 1);
    }

    // Step 3: Encrypt KFile to generate PFile
    const { encryptedData: PFile, iv: PFileIV } = encryptData(
      KFile + "$$" + fragments.length + "@@" + numNodes,
      Buffer.from(PPass, "utf-8").subarray(0, 32)
    );
    /* const { encryptedData: PFile11, iv: PFileIV11 } = encryptPFile(
      KFile + "$$" + files.length ,
      Buffer.from(PPass, "utf-8").subarray(0, 32)
    ); */
    let NoOfFilesStored = 1;
    const { pi, noo } = genEIForPfile1(CasePfile, NoOfFilesStored);
    const eindex = pi;
    const pfile = PFile;
    const pfileiv = PFileIV;

    try {
      const response = await fetchWithFallback(
        `/api/logs/pfile/insert`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            eindex,
            pfile,
            pfileiv,
          }),
        }
      );

      if (response) {
        console.log("log file success");
      } else {
        console.error("Failed to store log file");
      }
    } catch (error) {
      console.error("Error storing PFile:", error);
    }

    // Convert PFile to a 32-byte buffer key
    const PFileKey = Buffer.from(
      crypto.createHash("sha256").update(PFile).digest("hex"),
      "hex"
    ).subarray(0, 32);

    // Step 4: Compute InitialIndex
    const InitialIndex = parseInt(PFile.substring(0, 6), 16) % 100;

    // Step 5: Generate EI (Encrypted Index Array)
    let EI = [];
    for (let n = InitialIndex; n < InitialIndex + fragments.length; n++) {
      let hash = crypto
        .createHash("sha256")
        .update(PFile + n)
        .digest("hex");
      EI.push(hash);
    }

    // Step 6: Encrypt fragments using PFileKey
    let EM = [];
    fragments.forEach((fragment) => {
      let { encryptedData, iv } = encryptData(fragment, PFileKey);
      EM.push({ encryptedData, iv });
    });

    for (let i = 0; i < fragments.length; i++) {
      let eindex = EI[i];
      let emessage = EM[i]["encryptedData"];
      let iv = EM[i]["iv"];

      try {
        const response = await fetchWithFallback(`/api/insert/k`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            eindex,
            emessage,
            iv,
          }),
        });

        if (response.ok) {
          console.log("Chunk stored successfully");
        } else {
          alert("Error storing chunk");
        }
      } catch (error) {
        console.error("Error storing encrypted JSON chunk:", error);
      }
    }
  };
  const genEIForPfile1 = (PPass, n) => {
    const crypto = require("crypto");
    PPass = PPass.toString("hex");
    let InitialIndex = Buffer.from(
      crypto.createHash("sha256").update(PPass).digest("hex"),
      "hex"
    ).subarray(0, 32);

    InitialIndex = parseInt(InitialIndex[0]) % 100;
    n += InitialIndex;
    let PI = crypto
      .createHash("sha256")
      .update(PPass + n)
      .digest("hex");
    let node = InitialIndex % 4;

    return {
      pi: PI,
      noo: node,
    };
  };

  const encryptData = (data) => {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, PPass).toString();
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

  const uploadResponse = async (file, casePIndex) => {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("case_pindex", casePIndex);

    try {
      const response = await fetch("https://vfinserv.in/upload", {
        method: "POST",
        body: pindex,
        email,
        fileName: file.name,
        fileUrl: `https://drive.google.com/file/d/${uploadResponse.data.id}/view`,
      });

      if (response.ok) {
        console.log("Upload successful");
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };
  function generateCaseId(userId, noOfFiles) {
    const now = new Date();
    const paddedUserId = String(userId).padStart(3, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2); // '25' from 2025
    const caseId = `${paddedUserId}${day}${month}${year}${noOfFiles}`;
    return caseId.toString();
  }
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

      // Insert user file
      const response = await fetchWithFallback(
        "/api/userFile/insert",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
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

      if (!response) throw new Error("Failed to store case data");

      // Upload files if any
      if (files && files.length > 0) {
        const files1 = files;
        const casePIndex = pindex;
        const casename1 = caseName;
        await uploadFiles(casePIndex, casename1, files1);
      }

      // Update number of files
      const updateResponse = await fetchWithFallback("/api/updateNofiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: parseInt(userid, 10),
          no_of_files: parseInt(nofff, 10),
        }),
      });

      if (!updateResponse) {
        throw new Error("Failed to update file count");
      }

      // Get updated user data
      const userData = await fetchWithFallback("/api/user", {
        method: "GET",
        credentials: "include",
      });

      if (userData) {
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
    } catch (error) {
      setLoading(false);
      console.error("Error in confirmSubmission:", error);
    }
  };

  // Retrieve data and decrypt

  const handleBack = () => {
    router.push("/home");
  };

  return (
    <>
      {loading ? (
        <div>
          <div className="relative ">
            <Loading />
          </div>
        </div>
      ) : (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center bg-gradient-to-br from-blue-200 to-black">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="bg-white w-full p-6 shadow-lg rounded-lg mb-6 border-4 border-orange-500 text-black flex items-center justify-between">
        {/* Logo and Back Button Section */}
        <div className="flex items-center gap-4">
          <button onClick={handleBack}>
            <div className="text-xl font-extrabold text-gray-800 flex justify-center items-center">
              <img
                src="//img1.wsimg.com/isteam/ip/06a8fce5-3b35-48ef-9f0e-ab337ebd9cb8/blob-e8ec071.png/:/rs=h:87,cg:true,m/qt=q:95"
                alt="SOURCECORP"
              />
            </div>
          </button>
        </div>

        {/* Main Title Section */}
        <div className="text-center flex-1">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            New Case Creation
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Fill in the required details to generate a new case file.
          </p>
        </div>

        {/* Optional Right Section: Could be user profile, actions, etc. */}
        <div className="hidden md:flex items-center gap-2">
          {/* Placeholder for future actions or user info */}
        </div>
      </div>

      <div className="bg-orange-200 p-4  shadow-md border-4 border-orange-500 rounded-lg flex flex-col w-[100vh] justify-between items-center  gap-6">
        <div>
          <div className="text-xl text-black ">
            <input
              type="text"
              value={casename}
              required
              onChange={(e) => setCaseName(e.target.value)}
              className="text-center border-b-2 border-l-2 border-r-2 bg-transparent border-orange-400 focus-within:border-blue-600 p-2 w-[150%] rounded-lg text-black"
              placeholder="Enter Case Name"
            />
            {validationErrors["caseName"] && (
              <p className="text-red-600 text-sm mt-1">
                {validationErrors["caseName"]}
              </p>
            )}
          </div>
        </div>
        <div className="flex w-full">
          <div className="text-black flex flex-col gap-5 w-[100%] p-2">
            <h3 className="font-extrabold">Customer Details</h3>

            {/* Text Inputs for name, email, amount */}
            {["name", "email", "amount"].map((field, index) => (
              <div key={index} className="w-[50%]">
                <input
                  type={field === "email" ? "email" : "text"}
                  placeholder={field.replace(/\b\w/g, (c) => c.toUpperCase())}
                  className="border-b-2 border-l-2 bg-transparent border-orange-400 focus:outline-none focus:border-blue-600 p-2 w-full rounded-lg"
                  value={customer[field]}
                  required
                  pattern={
                    field === "email"
                      ? "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
                      : undefined
                  }
                  onChange={(e) => {
                    setCustomer({ ...customer, [field]: e.target.value });
                    setValidationErrors((prev) => ({ ...prev, [field]: "" }));
                  }}
                />
                {validationErrors[field] && (
                  <p className="text-red-600 text-sm mt-1">
                    {validationErrors[field]}
                  </p>
                )}
              </div>
            ))}

            {/* Contact Field with Country Code Selector */}
            <div className="flex flex-col w-[50%]">
              <div className="flex space-x-2 items-center">
                <select
                  value={customer.countryCode || "+91"}
                  onChange={(e) =>
                    setCustomer({ ...customer, countryCode: e.target.value })
                  }
                  className="border-b-2 border-l-2 bg-transparent border-orange-400 focus:outline-none focus:border-blue-600 rounded-lg p-2 w-1/3"
                  required
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+971">🇦🇪 +971</option>
                  {/* Add more countries as needed */}
                </select>
                <input
                  type="tel"
                  placeholder="Contact"
                  className="border-b-2 border-l-2 bg-transparent border-orange-400 focus:outline-none focus:border-blue-600 p-2 w-2/3 rounded-lg"
                  value={customer.contact}
                  required
                  pattern="[0-9]{10,15}"
                  title="Please enter a valid contact number (10–15 digits)."
                  onChange={(e) => {
                    setCustomer({
                      ...customer,
                      contact: e.target.value.replace(/\D/g, ""),
                    });
                    setValidationErrors((prev) => ({ ...prev, contact: "" }));
                  }}
                />
              </div>
              {validationErrors.contact && (
                <p className="text-red-600 text-sm mt-1 ml-1">
                  {validationErrors.contact}
                </p>
              )}
            </div>

            {/* Loan Type Select */}
            <select
              className="border-b-2 border-l-2 bg-transparent border-orange-400 focus:outline-none focus:border-blue-600 rounded-lg w-[50%] p-2"
              value={customer.type}
              required
              onChange={(e) =>
                setCustomer({ ...customer, type: e.target.value })
              }
            >
              <option value="">Select Loan Type</option>
              <option value="Home Loan">Home Loan</option>
              <option value="Personal Loan">Personal Loan</option>
              <option value="Business Loan">Business Loan</option>
              <option value="Mortgage Loan">Mortgage Loan</option>
              <option value="Machinery Loan">Machinery Loan</option>
              <option value="Education Loan">Education Loan</option>
              <option value="Car Loan">Car Loan</option>
            </select>
          </div>
          <div className="text-black w-[100%] flex flex-col gap-5 p-2">
            <h3 className="font-semibold">Agent Details</h3>
            {["name", "contact", "email"].map((field, index) => (
              <input
                disabled
                key={index}
                type="text"
                placeholder={`Agent ${field.replace(/\b\w/g, (c) =>
                  c.toUpperCase()
                )}`}
                className="border-b-2 border-l-2 bg-transparent border-orange-400 rounded-lg w-[50%] focus:outline-none focus:border-blue-600 p-2"
                value={agent[field]}
                onChange={(e) =>
                  setAgent({ ...agent, [field]: e.target.value })
                }
              />
            ))}
            <div>
              <label>
                <input
                  type="radio"
                  name="unknown1"
                  value="DSA"
                  checked={customer.unknown1 === "DSA"}
                  onChange={() => setCustomer({ ...customer, unknown1: "DSA" })}
                />{" "}
                DSA
              </label>
              <label className="ml-4">
                <input
                  type="radio"
                  name="unknown1"
                  value="DST"
                  checked={customer.unknown1 === "DST"}
                  onChange={() => setCustomer({ ...customer, unknown1: "DST" })}
                />{" "}
                DST
              </label>
            </div>
          </div>
        </div>
      </div>
      <h1 className="w-full text-black flex justify-center items-center font-extrabold gap-3 p-10">
        <span className="h-[2px] w-[35%] bg-orange-400 shadow shadow-black"></span>{" "}
        Documentation{" "}
        <span className="h-[2px] w-[35%] bg-orange-400 shadow shadow-black"></span>
      </h1>

      <div className="bg-white p-4 w-[50rem] shadow-md rounded-lg flex justify-between items-center text-black border-2 border-black">
        <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600">
          Choose Files
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <span className="text-gray-700">
          {files.length > 0
            ? `${files.length} file(s) selected`
            : "No files chosen"}
        </span>

        <div className="overflow-y-auto min-h-10 min-w-60 max-h-32 border-2 border-black w-1/3 rounded-2xl shadow-black p-4">
          {files.length > 0 ? (
            files.map((doc, index) => (
              <div key={index} className="flex justify-between items-center">
                <p className="text-sm truncate">{doc.name}</p>
                <button
                  onClick={() => removeDocument(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✖
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center">No files chosen</p>
          )}
        </div>
        {validationErrors["files"] && (
          <p className="text-red-600 text-sm mt-1">
            {validationErrors["files"]}
          </p>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Create Case
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center text-black">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-lg font-bold mb-4">Confirm Case Creation</h2>
            <p>
              <strong>Case Name:</strong> {casename}
            </p>
            <p>
              <strong>Customer:</strong> {customer.name}, {customer.contact},{" "}
              {customer.email}
            </p>
            <p>
              <strong>Agent:</strong> {agent.name}, {agent.contact},{" "}
              {agent.email}
            </p>
            <p>
              <strong>Type:</strong> {customer.unknown1}
            </p>
            <p>
              <strong>files:</strong> {files.length} files uploaded
            </p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowPopup(false)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                Make Changes
              </button>
              <button
                onClick={confirmSubmission}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    )}
    </>
  );
}
