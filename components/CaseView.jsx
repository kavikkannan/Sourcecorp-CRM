"use client";

import { useState, useEffect } from "react";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import { useRouter } from "next/navigation";
import { fetchWithFallback } from "../utils/api";

export default function ViewCase() {
  const [casename, setCaseName] = useState("loading...");

  const [activeTab, setActiveTab] = useState("notes");
  const [entries, setEntries] = useState([]);
  const [input, setInput] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedToName, setAssignedToName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [username, setUserName] = useState("");
  const [userid, setUserID] = useState("");
  const [retrievedFile, setRetrievedFile] = useState(null);
  const [caseData, setCaseData] = useState([]);
  const [lastSync, setLastSync] = useState("");
  const [customerDetails, setCustomerDetails] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(caseData.Status);
  const [schedu, setSchedu] = useState("");
  const [alteredCase, setalteredCase] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCustomerOpen, setIsCustomerOpen] = useState(true);
  const [isFilesOpen, setIsFilesOpen] = useState(true);

  const statuses = [
    "select status",
    "Login Case",
    "Underwriting Case",
    "Approved Case",
    "Disbursed Case",
    "Rejected Case",
  ]; // Example statuses

  const router = useRouter();
  useEffect(() => {
    const storedCase = sessionStorage.getItem("selectedCase");
    const useri = sessionStorage.getItem("userId");
    const alter = sessionStorage.getItem("alteredSt");
    if (alter) {
      setalteredCase(alter);
    }
    setUserID(useri);

    if (storedCase) {
      try {
        const parsedCase = JSON.parse(storedCase);
        setCaseData(parsedCase); // ✅ Updates state first
      } catch (error) {
        console.error("Error parsing stored case:", error);
      }
    }
  }, []);

  // ✅ New effect to run handleDecrypt only after caseData is set
  useEffect(() => {
    if (caseData) {
      handleSch();
      handleDecrypt();
    }
  }, [caseData]); // ✅ Runs whenever caseData updates

  useEffect(() => {
    if (users) {
    }
  }, [users]); // ✅ Runs whenever caseData updates

  useEffect(() => {
    setLastSync(getCurrentTimestamp());
  }, []);
  const handleSch = async () => {
    const userId = sessionStorage.getItem("userId");
    try {
      // Fetch schedule data
      const data = await fetchWithFallback(`/api/schedule/${userId}`);
      setSchedu(data.hierarchy); // Update schedule state
      const data1 = data.hierarchy;

      // Extract unique user IDs from comma-separated string
      const userIds = [
        ...new Set(
          data1
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id)
        ),
      ];

      // Fetch details for each unique user ID
      const userDetails = await Promise.all(
        userIds.map(async (id) => {
          try {
            return await fetchWithFallback(`/api/user/${id}`);
          } catch (error) {
            console.error(`Failed to fetch user details for ID: ${id}:`, error);
            return null;
          }
        })
      );

      // Remove null/empty values before setting state
      setUsers(userDetails.filter((user) => user));
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
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

  const decryptData = (encryptedData) => {
    try {
      const PPass = sessionStorage.getItem("CasePPass");
      const bytes = CryptoJS.AES.decrypt(encryptedData, PPass);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedText); // Convert back to JSON object
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  };
  const handleSchedule = async (
    fromUser,
    toUser,
    tousername,
    note,
    casePfile
  ) => {
    try {
      const mark = false;
      const readStatus = false;

      try {
        await fetchWithFallback(`/api/insert/notify`, {
          method: "POST",
          body: JSON.stringify({
            fromUser,
            toUser,
            tousername,
            note,
            casePfile,
            mark: mark === "true",
            readStatus: readStatus === "true",
          })
        });
        console.log("Chunk stored successfully");
      } catch (error) {
        console.error("Error storing chunk:", error);
        alert("Error storing chunk");
      }
    } catch (error) {
      console.error("Error storing encrypted JSON chunk:", error);
    }
  };
  const handleAdd1 = () => {
    if (!input.trim()) return;
    const name = sessionStorage.getItem("username");
    const userid = sessionStorage.getItem("userId");
    setUserName(name);
    setUserID(userid);
    if (activeTab === "tasks" && assignedTo) {
      handleSchedule(userid, assignedTo, input, caseData.PIndex);
    }

    const newEntry =
      activeTab === "notes"
        ? {
            type: "note",
            message: input,
            user: name,
            timestamp: getCurrentTimestamp(),
          }
        : {
            type: "task",
            scheduleTo: assignedTo || "Unassigned",
            message: input,
            user: name, // Now showing who scheduled it
            timestamp: getCurrentTimestamp(),
          };

    setEntries([newEntry, ...entries]);
    setInput("");
    setAssignedTo("");
    setShowDropdown(false);
  };

  useEffect(() => {
    if (entries.length > 0) {
      handleSync(null);
    }
  }, [entries]); // Runs every time 'entries' updates

  const handleAdd = () => {
    if (!input.trim()) return;
    const name = sessionStorage.getItem("username");
    const userid = sessionStorage.getItem("userId");
    setUserName(name);
    setUserID(userid);

    if (activeTab === "tasks" && assignedTo) {
      handleSchedule(userid, assignedTo, name, input, caseData.PIndex);
    }

    const newEntry =
      activeTab === "notes"
        ? {
            type: "note",
            message: input,
            user: name,
            timestamp: getCurrentTimestamp(),
          }
        : {
            type: "task",
            scheduleTo: assignedToName || "Unassigned",
            message: input,
            user: name, // Now showing who scheduled it
            timestamp: getCurrentTimestamp(),
          };

    setEntries([newEntry, ...entries]); // Once 'entries' updates, useEffect will trigger handleSync

    setInput("");
    setAssignedTo("");
    setShowDropdown(false);
  };

  const getCurrentTimestampd = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  const genEIForPfile = (PPass, n) => {
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
  const decryptData2 = (encrypted, key, iv) => {
    try {
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        key,
        Buffer.from(iv, "hex")
      );
      return Buffer.concat([
        decipher.update(Buffer.from(encrypted, "hex")),
        decipher.final(),
      ]);
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  };
  async function getCaseFiles(pindex) {
    try {
      const response = await fetch(
        `https://vfinserv.in/api/get-docs/${pindex}`
      );

      if (!response.ok) {
        throw new Error(`Error fetching files: ${response.statusText}`);
      }

      const data = await response.json();
      return data; // Returns array of files
    } catch (error) {
      console.error("Error fetching case files:", error);
      throw error;
    }
  }
  const handleRetrieveAndDecrypt = async () => {
    setLoading(true);
    try {
      const data = await getCaseFiles(caseData.PIndex);
      setRetrievedFile(data);
    } catch (error) {
      alert("Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };
  function downloadFile(fileName, base64Content) {
    // Decode Base64 string
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Create Blob and Download
    const blob = new Blob([byteArray]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

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
  const handleSync = async (e) => {
    if (e) e.preventDefault(); // Prevent form submission

    const name = sessionStorage.getItem("username");
    setUserName(name);
    const crypto = require("crypto");

    const CHUNK_SIZE = 512; // Define chunk size for JSON
    const PPass = sessionStorage.getItem("CasePPass");
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
      KFile + "$$" + documents.length ,
      Buffer.from(PPass, "utf-8").subarray(0, 32)
    ); */
    let NoOfFilesStored = 1;
    const { pi, noo } = genEIForPfile(caseData.PFile, NoOfFilesStored);
    const eindex = pi;
    const pfile = PFile;
    const pfileiv = PFileIV;

    try {
      const response = await fetch(
        `https://vfinserv.in/api/logs/pfile/insert`,
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eindex,
            pfile,
            pfileiv,
          }),
        }
      );

      if (response.ok) {
      } else {
        alert("Not successful");
      }
    } catch (error) {
      console.error("Error storing PFile:", error);
    }

    sessionStorage.setItem(`pf`, PFile);
    sessionStorage.setItem("pfiv", PFileIV);

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
        const response = await fetch(`https://vfinserv.in/api/insert/k`, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
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
    setLastSync(getCurrentTimestampd());
  };

  const handelUpdateStatus = async () => {
    try {
      const pindex = caseData.PIndex;
      const status = selectedStatus;
      console.log("updation started");

      const response = await fetch(
        `https://vfinserv.in/api/userFile/updateStatus`,
        {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pindex,
            status,
          }),
        }
      );
      setalteredCase(selectedStatus);
      sessionStorage.setItem("alteredSt", selectedStatus);
      console.log("updation ended");
      const data = await response.json();
      console.log(data.message);
      if (!response.ok) throw new Error(`Failed to store fragment `);
      else {
        setShowStatusDropdown(false);
      }
    } catch (error) {
      console.error("Error parsing decrypted JSON:", error);
    }
  };

  const handleDecrypt = async () => {
    const name = sessionStorage.getItem("username");
    setUserName(name);
    const crypto = require("crypto");

    function decryptData(encrypted, key, iv) {
      const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        key,
        Buffer.from(iv, "hex")
      );
      return Buffer.concat([
        decipher.update(Buffer.from(encrypted, "hex")),
        decipher.final(),
      ]).toString();
    }
    if (!caseData || !caseData.PFile) {
      return;
    }
    const PPass = sessionStorage.getItem("CasePPass");

    let NoOfFilesStored = 1;

    const { pi, noo } = genEIForPfile(caseData.PFile, NoOfFilesStored);
    let PFile = "";
    let PFileIV = "";
    try {
      const response = await fetch(
        `https://vfinserv.in/api/logs/pfile/fetch/${pi}`
      );
      if (response.ok) {
        const data = await response.json();
        PFile = data.PFile;
        PFileIV = data.PFileIv;
      } else {
        console.error("Failed to fetch PFile, status:", response.status);
        return;
      }
    } catch (error) {
      console.error("Error fetching PFile:", error);
      return;
    }

    // Decrypt PFile to retrieve metadata
    const decryptedPFileData = decryptData(
      PFile,
      Buffer.from(PPass, "utf-8").subarray(0, 32),
      PFileIV
    );
    const PFileKey = Buffer.from(
      crypto.createHash("sha256").update(PFile).digest("hex"),
      "hex"
    ).slice(0, 32);
    const [decryptedKFile, rest] = decryptedPFileData.split("$$");
    const [fragLength, nodeCount] = rest.split("@@");

    // Compute InitialIndex
    const InitialIndex = parseInt(PFile.substring(0, 6), 16) % 100;
    /*     const NodePattern = [];
    for (let i = 0; i < fragLength; i++) {
      NodePattern.push((i % nodeCount) + 1);
    } */

    // Generate Encrypted Index (EI)
    let EI = [];
    for (let n = InitialIndex; n < InitialIndex + fragLength; n++) {
      let hash = crypto
        .createHash("sha256")
        .update(PFile + n)
        .digest("hex");
      EI.push(hash);
    }

    // Fetch and decrypt fragments
    let decryptedMsg = "";
    for (let i = 0; i < fragLength; i++) {
      try {
        const response = await fetch(
          `https://vfinserv.in/api/fetch/k/${EI[i]}`
        );
        if (response.ok) {
          const data = await response.json();
          decryptedMsg += decryptData(data.EMessage, PFileKey, data.IV);
        } else {
          console.error("Failed to fetch fragment, status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching fragment:", error);
      }
    }

    // Parse decrypted JSON data
    try {
      const jsonData = JSON.parse(decryptedMsg);
      setEntries(jsonData);
    } catch (error) {
      console.error("Error parsing decrypted JSON:", error);
    }
  };
  const handleBack = () => {
    sessionStorage.removeItem("CasePPass");
    sessionStorage.removeItem("selectedCase");
    sessionStorage.removeItem("pf");
    sessionStorage.removeItem("pfiv");
    if (sessionStorage.getItem("alteredSt")) {
      sessionStorage.removeItem("alteredSt");
    }

    router.push("/home");
  };
  const [files, setfiles] = useState([]);
  function handleFileUpload(event) {
    setfiles([...files, ...event.target.files]);
  }

  function removeDocument(index) {
    setfiles(files.filter((_, i) => i !== index));
  }
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleSelectFile = (fileName) => {
    setSelectedFiles((prev) =>
      prev.includes(fileName)
        ? prev.filter((name) => name !== fileName)
        : [...prev, fileName]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === retrievedFile.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(retrievedFile.map((file) => file.file_name));
    }
  };

  const handleDownloadSelected = () => {
    retrievedFile.forEach((file) => {
      if (selectedFiles.includes(file.file_name)) {
        downloadFile(file.file_name, file.file_content);
      }
    });
  };

  const handleNewFileUpload = () => {
    if (!files || files.length === 0) return;

    const filess = files;
    const pindex = caseData.PIndex;
    const casename1 = caseData.Name;

    uploadFiles(pindex, casename1, filess);
    setfiles([]); // Clear files after upload
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
        handleRetrieveAndDecrypt();

        console.log("Files uploaded successfully!");
      } else {
        console.log(`Upload failed: ${result.message}`);
      }
    } catch (error) {
      console.log("Error uploading files");
    }
  };

  return (
    <div>
      {caseData ? (
        <div className="bg-white flex  items-center shadow-md text-black border-b-4 border-orange-500 p-6  text-center w-full">
          <button onClick={handleBack}>
            <div className="text-xl font-extrabold text-gray-800 flex justify-center items-center">
              <img
                src="//img1.wsimg.com/isteam/ip/06a8fce5-3b35-48ef-9f0e-ab337ebd9cb8/blob-e8ec071.png/:/rs=h:87,cg:true,m/qt=q:95"
                alt="SOURCECORP"
              />
            </div>
          </button>
          <div className="w-full flex justify-center items-center">
            <h1 className="text-2xl text-center font-bold text-gray-900">
              {caseData.Name}
            </h1>
          </div>
        </div>
      ) : (
        <div className="bg-white flex justify-between items-center shadow-md rounded-lg p-6 mb-6 text-center w-full">
          <button onClick={handleBack}>
            <div className="text-xl font-extrabold text-gray-800 flex justify-center items-center">
              <img
                src="//img1.wsimg.com/isteam/ip/06a8fce5-3b35-48ef-9f0e-ab337ebd9cb8/blob-e8ec071.png/:/rs=h:87,cg:true,m/qt=q:95"
                alt="SOURCECORP"
              />
            </div>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{caseData.Name}</h1>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-200 to-black  p-6 text-black">
        {caseData ? (
          <div>
            <div className="flex flex-col items-center justify-center py-5">
              <h1 className=" font-extrabold text-xl  text-gray-900">LOGS</h1>
              <div className="flex  items-center justify-center w-full gap-1 flex-col ">
                {/* <button onClick={handleSync} className="bg-blue-500 text-white p-2 rounded-lg shadow-md hover:bg-blue-600">
                  Sync
                </button> */}
                <button
                  onClick={handleDecrypt}
                  className="bg-orange-400 font-bold text-blue-900 p-2 rounded-lg shadow-md hover:bg-orange-600"
                >
                  Refresh
                </button>
                <p className="text-base text-orange-200  mt-2">
                  Last synced: {lastSync}
                </p>
              </div>
            </div>

            <div className="flex flex-row  justify-around  items-center h-[70vh] ">
              {/* Customer Details Section */}
              <div className="w-[35%] flex flex-col items-center space-y-6">
                {/* Customer Details */}
                <div className="bg-orange-100 border border-orange-400 shadow-lg p-6 rounded-xl w-full max-w-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-orange-700">
                      Customer Details
                    </h2>
                    <button
                      onClick={() => handleFetchCustomerDetails()}
                      className="text-orange-600 hover:text-orange-800 transition"
                      title="Toggle Customer Details"
                    >
                      {customerDetails ? "" : "fetch"}
                    </button>
                  </div>

                  {customerDetails && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm text-gray-700">
                      <div>
                        <span className="font-semibold text-gray-900">
                          Name:
                        </span>
                        <p>{customerDetails.name}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">
                          Contact:
                        </span>
                        <p>{customerDetails.contact}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">
                          Email:
                        </span>
                        <p>{customerDetails.email}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">
                          Loan Amount:
                        </span>
                        <p>{customerDetails.amount}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">
                          Loan Type:
                        </span>
                        <p>{customerDetails.type}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">
                          Case Type:
                        </span>
                        <p>{customerDetails.unknown1}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Retrieved Files */}
                <div className="bg-orange-100 border border-orange-400 shadow-lg p-6 rounded-xl w-full max-w-2xl space-y-6">
                  {/* Retrieved Files Section */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-orange-700">
                        Retrieved Files
                      </h2>
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-700 flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={
                              retrievedFile?.length > 0 &&
                              selectedFiles.length === retrievedFile.length
                            }
                            onChange={handleSelectAll}
                          />
                          Select All
                        </label>
                        <button
                          onClick={handleDownloadSelected}
                          disabled={selectedFiles.length === 0}
                          className={`px-3 py-1 rounded-md text-white text-sm ${
                            selectedFiles.length === 0
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          Download Selected
                        </button>
                        <button
                          onClick={handleRetrieveAndDecrypt}
                          className="text-orange-600 hover:text-orange-800 transition text-sm"
                          title="Fetch Files"
                        >
                          {retrievedFile ? "Refresh" : "Fetch"}
                        </button>
                      </div>
                    </div>

                    {retrievedFile && (
                      <div className="overflow-y-auto max-h-48 pr-2 space-y-2">
                        {retrievedFile.map((file, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm bg-white rounded-md px-3 py-2 shadow-sm"
                          >
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="checkbox"
                                checked={selectedFiles.includes(file.file_name)}
                                onChange={() =>
                                  handleSelectFile(file.file_name)
                                }
                              />
                              <span className="truncate max-w-[70%] text-gray-800">
                                {file.file_name}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                downloadFile(file.file_name, file.file_content)
                              }
                              className="text-blue-600 hover:text-blue-800 font-semibold"
                            >
                              ⬇ Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upload Section (Visible only after files are retrieved) */}
                  {retrievedFile && (
                    <div className="pt-6 border-t border-orange-300">
                      {/* Heading */}
                      <h1 className="w-full text-black flex justify-center items-center font-extrabold gap-3 pb-6">
                        <span className="h-[2px] w-[35%] bg-orange-400 shadow shadow-black"></span>
                        Documentation
                        <span className="h-[2px] w-[35%] bg-orange-400 shadow shadow-black"></span>
                      </h1>

                      {/* Upload Form */}
                      <div className="bg-white p-4 w-full shadow-md rounded-lg flex flex-col gap-4 text-black border border-black">
                        <div className="flex justify-between items-center">
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
                        </div>

                        <div className="overflow-y-auto min-h-10 max-h-32 border border-black rounded-2xl shadow p-4">
                          {files.length > 0 ? (
                            files.map((doc, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center text-sm"
                              >
                                <p className="truncate w-4/5">{doc.name}</p>
                                <button
                                  onClick={() => removeDocument(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✖
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 text-sm text-center">
                              No files chosen
                            </p>
                          )}
                        </div>
                        <div>
                          <button
                            onClick={handleNewFileUpload}
                            className="flex w-full justify-center items-center cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 "
                          >
                            add files
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex  justify-center items-center w-[25%] flex-col gap-1 ">
                <h2 className="text-lg font-bold text-9-700">
                  Current Status:{" "}
                  {alteredCase !== "" ? alteredCase : caseData.Status}
                </h2>

                <button
                  onClick={() => setShowStatusDropdown(true)}
                  className="bg-orange-400 font-bold text-blue-900 hover:bg-orange-500 px-4 py-2 mt-2 rounded-lg"
                >
                  Modify Status
                </button>
                {showStatusDropdown && (
                  <div className="mt-2 bg-white p-4 shadow-md rounded-lg">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="p-2 border rounded-lg"
                    >
                      {statuses.map((status, index) => (
                        <option key={index} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handelUpdateStatus}
                      className="bg-blue-500 text-white px-4 py-2 ml-2 rounded-lg hover:bg-blue-600"
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-orange-200 border-4 border-orange-500 shadow-lg rounded-lg p-6  w-[42rem]  h-[60vh]">
                <div className="flex justify-center space-x-4 mb-4">
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === "notes"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                    onClick={() => setActiveTab("notes")}
                  >
                    Notes
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      activeTab === "tasks"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                    onClick={() => setActiveTab("tasks")}
                  >
                    Task
                  </button>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder={
                      activeTab === "notes" ? "Enter note..." : "Enter task..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none p-2"
                  />
                  {activeTab === "notes" && (
                    <div className="relative mt-2">
                      <button
                        onClick={handleAdd}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-blue-600 w-full"
                      >
                        Add
                      </button>
                    </div>
                  )}
                  {activeTab === "tasks" && (
                    <div className="relative mt-2">
                      <button
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg"
                        onClick={() => setShowDropdown(!showDropdown)}
                      >
                        {assignedToName || "Schedule To"}
                      </button>
                      {showDropdown && (
  <div className="absolute z-10 bg-white shadow-md rounded-lg mt-2 w-full max-h-48 overflow-y-auto">
    {users.length > 0 ? (
      users.map((user) => (
        <div
          key={user.ID}
          className="p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            setAssignedTo(`${user.ID}`);
            setAssignedToName(user.Name);
            setShowDropdown(false);
          }}
        >
          {user.Name} : {user.Role}
        </div>
      ))
    ) : (
      <div className="p-2  text-center">loading....</div>
    )}
  </div>
)}

                    </div>
                  )}
                  {activeTab === "tasks" && !assignedToName && (
                    <div className="relative mt-2">
                      <button className="bg-red-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-blue-600 w-full">
                        Please choose the agent to be notified !!
                      </button>
                    </div>
                  )}
                  {activeTab === "tasks" && assignedToName && (
                    <div className="relative mt-2">
                      <button
                        onClick={handleAdd}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-blue-600 w-full"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
                {entries.length > 0 ? (
                  <div className="border-2 border-orange-500 shadow-2xl shadow-black rounded-lg p-4 max-h-[35vh] overflow-y-auto space-y-3">
                    {entries.map((entry, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg shadow ${
                          entry.type === "note" ? "bg-blue-100" : "bg-green-100"
                        }`}
                      >
                        <h4 className="font-semibold text-blue-500">
                          {entry.user === username ? "You" : entry.user}
                        </h4>
                        {entry.type === "task" ? (
                          <p className="text-gray-800">
                            Schedule To: {entry.scheduleTo}
                            <br /> {entry.message}
                          </p>
                        ) : (
                          <p className="text-gray-800">{entry.message}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {entry.timestamp}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-orange-500 shadow-2xl shadow-black rounded-lg p-4 max-h-[35vh] overflow-y-auto space-y-3">
                    <div className={`p-3 rounded-lg shadow `}>
                      Loading..... <br /> Please wait
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p>Loading case details...</p>
        )}
      </div>
    </div>
  );
}
