"use client";

import { useState, useEffect } from "react";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import { useRouter } from "next/navigation";
import { fetchWithFallback } from "../utils/api";
import { toast } from "react-toastify";
import Loading from "@/components/Loading";

// Helper for Icons
const Icon = ({ path }) => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>;
const ChevronDownIcon = () => <Icon path="M7.41,8.59L12,13.17L16.59,8.59L18,10L12,16L6,10L7.41,8.59Z" />;
const FileIcon = () => <Icon path="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />;
const DownloadIcon = () => <Icon path="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />;

export default function ViewCase() {
  const [caseData, setCaseData] = useState(null);
  const [activeTab, setActiveTab] = useState("notes");
  const [entries, setEntries] = useState([]);
  const [input, setInput] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedToName, setAssignedToName] = useState("");
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [username, setUserName] = useState("");
  const [userid, setUserID] = useState("");
  const [retrievedFiles, setRetrievedFiles] = useState([]);
  const [lastSync, setLastSync] = useState("");
  const [customerDetails, setCustomerDetails] = useState(null);
  const [showStatusEditor, setShowStatusEditor] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCustomerOpen, setIsCustomerOpen] = useState(true);
  const [isFilesOpen, setIsFilesOpen] = useState(true);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [selectedFilesToDownload, setSelectedFilesToDownload] = useState([]);
  const [schedu, setSchedu] = useState("");
  const [files, setfiles] = useState([]);



  const statuses = ["Login Case", "Underwriting Case", "Approved Case", "Disbursed Case", "Rejected Case"];
  const router = useRouter();

  // Initial data loading from session storage
  useEffect(() => {
    const storedCase = sessionStorage.getItem("selectedCase");
    const useri = sessionStorage.getItem("userId");
    const name = sessionStorage.getItem("username");

    setUserID(useri);
    setUserName(name);

    if (storedCase) {
      try {
        const parsedCase = JSON.parse(storedCase);
        setCaseData(parsedCase);
        setSelectedStatus(parsedCase.Status);
      } catch (error) {
        console.error("Error parsing stored case:", error);
      }
    } else {
      router.push("/home"); // Redirect if no case data
    }
  }, [router]);

  // Fetches data once caseData is available
  useEffect(() => {
    if (caseData) {
      handleSch();
      handleDecryptLogs();
      handleFetchCustomerDetails();
      handleRetrieveAndDecryptFiles();
      setLastSync(getCurrentTimestamp());
    }
  }, [caseData]);
  
  // Re-syncs logs when entries are updated
  useEffect(() => {
    if (entries.length > 0) {
      handleSyncLogs();
    }
  }, [entries]);

  const handleSch = async () => {
    const userId = sessionStorage.getItem("userId");
    try {
      // Fetch schedule data
      const response = await fetch(
        `https://vfinserv.in/api/schedule/${userId}`
      );
      if (response.ok) {
        const data = await response.json(); // Await the JSON response
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
            const userRes = await fetch(`https://vfinserv.in/api/user/${id}`);
            if (userRes.ok) {
              return await userRes.json(); // Return user details
            }
            console.log(`Failed to fetch user details for ID: ${id}`);
            return null;
          })
        );

        // Remove null/empty values before setting state
        setUsers(userDetails.filter((user) => user));
      } else {
        console.error("Failed to fetch schedule:", response.status);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  };

  const getCurrentTimestamp = () => new Date().toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short", year: "numeric" });

  const decryptData = (encryptedData) => {
    try {
      const PPass = sessionStorage.getItem("CasePPass");
      const bytes = CryptoJS.AES.decrypt(encryptedData, PPass);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedText);
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  };

  const handleScheduleNotification = async (note) => {
    try {
      await fetchWithFallback(`/api/insert/notify`, {
        method: "POST",
        body: JSON.stringify({
          fromUser: userid,
          toUser: assignedTo,
          tousername: assignedToName,
          note,
          casePfile: caseData.PIndex,
          mark: false,
          readStatus: false,
        })
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleAddEntry = () => {
    if (!input.trim()) return;

    if (activeTab === "tasks") {
        if (!assignedTo) {
            toast.warn("Please assign the task to a user.");
            return;
        }
        handleScheduleNotification(input);
    }

    const newEntry = activeTab === "notes"
      ? { type: "note", message: input, user: username, timestamp: getCurrentTimestamp() }
      : { type: "task", scheduleTo: assignedToName, message: input, user: username, timestamp: getCurrentTimestamp() };

    setEntries([newEntry, ...entries]);
    setInput("");
    setAssignedTo("");
    setAssignedToName("");
    setShowAssigneeDropdown(false);
  };
  
  const genEIForPfile = (PPass, n) => {
    PPass = PPass.toString("hex");
    let InitialIndex = Buffer.from(crypto.createHash("sha256").update(PPass).digest("hex"),"hex").subarray(0, 32);
    InitialIndex = parseInt(InitialIndex[0]) % 100;
    n += InitialIndex;
    let PI = crypto.createHash("sha256").update(PPass + n).digest("hex");
    return { pi: PI };
  };
  
  const decryptData2 = (encrypted, key, iv) => {
    try {
      const decipher = crypto.createDecipheriv("aes-256-cbc",key,Buffer.from(iv, "hex"));
      return Buffer.concat([decipher.update(Buffer.from(encrypted, "hex")),decipher.final()]);
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  };

  const handleRetrieveAndDecryptFiles = async () => {
    if (!caseData?.PIndex) return;
    setLoading(true);
    try {
      const data = await fetchWithFallback(`/api/get-docs/${caseData.PIndex}`);
      setRetrievedFiles(data || []);
    } catch (error) {
      toast.error("Failed to fetch files.");
    } finally {
      setLoading(false);
    }
  };
  function handleFileUpload(event) {
    setfiles([...files, ...event.target.files]);
  }
  function downloadFile(fileName, base64Content) {
    const byteCharacters = atob(base64Content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleFetchCustomerDetails = () => {
    if (caseData?.CoustomerDetails) {
      const decryptedCustomerData = decryptData(caseData.CoustomerDetails);
      if (decryptedCustomerData) setCustomerDetails(decryptedCustomerData);
    }
  };
  
  const handleSyncLogs = async () => {
    const PPass = sessionStorage.getItem("CasePPass");
    if (!PPass || !caseData?.PFile) return;

    function encryptData(data, key) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
        const encrypted = Buffer.concat([cipher.update(data, "utf8"),cipher.final()]);
        return { encryptedData: encrypted.toString("hex"), iv: iv.toString("hex") };
    }

    const jsonData = JSON.stringify(entries, null, 2);
    const fragments = [];
    for (let i = 0; i < jsonData.length; i += 512) {
      fragments.push(jsonData.slice(i, i + 512));
    }

    const KFile = crypto.randomBytes(32).toString("hex");
    const { encryptedData: PFile, iv: PFileIV } = encryptData(KFile + "$$" + fragments.length + "@@4", Buffer.from(PPass, "utf-8").subarray(0, 32));
    const { pi } = genEIForPfile(caseData.PFile, 1);

    try {
      await fetchWithFallback(`/api/logs/pfile/insert`, {
        method: "POST", body: JSON.stringify({ eindex: pi, pfile: PFile, pfileiv: PFileIV })
      });
    } catch (error) { console.error("Error storing PFile:", error); }

    const PFileKey = Buffer.from(crypto.createHash("sha256").update(PFile).digest("hex"), "hex").subarray(0, 32);
    const InitialIndex = parseInt(PFile.substring(0, 6), 16) % 100;
    
    let EI = [];
    for (let n = InitialIndex; n < InitialIndex + fragments.length; n++) {
      EI.push(crypto.createHash("sha256").update(PFile + n).digest("hex"));
    }

    const EM = fragments.map(fragment => encryptData(fragment, PFileKey));

    for (let i = 0; i < EM.length; i++) {
        try {
            await fetchWithFallback(`/api/insert/k`, {
                method: "POST", body: JSON.stringify({ eindex: EI[i], emessage: EM[i].encryptedData, iv: EM[i].iv })
            });
        } catch (error) { console.error("Error storing fragment:", error); }
    }
    setLastSync(getCurrentTimestamp());
  };

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      await fetchWithFallback(`/api/userFile/updateStatus`, {
        method: "POST",
        body: JSON.stringify({ pindex: caseData.PIndex, status: selectedStatus }),
      });
      setCaseData(prev => ({ ...prev, Status: selectedStatus }));
      toast.success("Status updated successfully!");
      setShowStatusEditor(false);
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
        setLoading(false);
    }
  };

  const handleDecryptLogs = async () => {
    const PPass = sessionStorage.getItem("CasePPass");
    if (!caseData?.PFile || !PPass) return;

    function decryptData(encrypted, key, iv) {
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(iv, "hex"));
      return Buffer.concat([decipher.update(Buffer.from(encrypted, "hex")), decipher.final()]).toString();
    }
    
    const { pi } = genEIForPfile(caseData.PFile, 1);
    
    try {
        const pfileData = await fetchWithFallback(`/api/logs/pfile/fetch/${pi}`);
        if (!pfileData) { setEntries([]); return; }
        
        const { PFile, PFileIv } = pfileData;
        const decryptedPFileData = decryptData(PFile, Buffer.from(PPass, "utf-8").subarray(0, 32), PFileIv);
        const PFileKey = Buffer.from(crypto.createHash("sha256").update(PFile).digest("hex"), "hex").slice(0, 32);
        
        const [, rest] = decryptedPFileData.split("$$");
        const [fragLengthStr] = rest.split("@@");
        const fragLength = parseInt(fragLengthStr, 10);
        
        const InitialIndex = parseInt(PFile.substring(0, 6), 16) % 100;

        let EI = [];
        for (let n = InitialIndex; n < InitialIndex + fragLength; n++) {
            EI.push(crypto.createHash("sha256").update(PFile + n).digest("hex"));
        }

        const fragmentsData = await Promise.all(EI.map(eindex => fetchWithFallback(`/api/fetch/k/${eindex}`)));
        
        let decryptedMsg = "";
        fragmentsData.forEach(data => {
            if (data) decryptedMsg += decryptData(data.EMessage, PFileKey, data.IV);
        });

        setEntries(JSON.parse(decryptedMsg) || []);

    } catch (error) {
        console.error("Error during log decryption:", error);
        setEntries([]);
    }
  };
  
  const handleBack = () => {
    sessionStorage.removeItem("CasePPass");
    sessionStorage.removeItem("selectedCase");
    router.push("/home");
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
      setRetrievedFiles(data);
    } catch (error) {
      alert("Failed to fetch files");
    } finally {
      setLoading(false);
    }
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
    setShowAssigneeDropdown(false);
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

      const response = await fetch(`https://vfinserv.in/api/insert/notify`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fromUser,
          toUser,
          tousername,
          note,
          casePfile,
          mark: mark === "true",
          readStatus: readStatus === "true",
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
  };
  if (!caseData) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-orange-200 text-black p-4 md:p-6 font-sans">
      {loading && <Loading />}
      <header className="bg-white/80 backdrop-blur-md shadow-lg p-3 px-4 flex justify-between items-center rounded-xl mb-6 sticky top-4 z-20">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <Icon path="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
          </button>
          <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">{caseData.Name}</h1>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden md:inline">Last Sync: {lastSync}</span>
            <button onClick={handleDecryptLogs} className="p-2 rounded-full hover:bg-gray-200 transition-colors" title="Refresh Logs">
                <Icon path="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
            </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-11 gap-6">
        {/* Main Content: Activity Feed */}
        

        {/* Sidebar: Case Details */}
        <div className="lg:col-span-6 xl:col-span-3 space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-4">
                <h3 className="font-bold text-gray-800 mb-2">Case Status</h3>
                {!showStatusEditor ? (
                    <div className="flex justify-between items-center">
                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-orange-100 text-orange-800">{caseData.Status}</span>
                        <button onClick={() => setShowStatusEditor(true)} className="text-sm text-blue-600 hover:underline">Change</button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md">
                            <option value="" disabled>Select a status</option>
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <button onClick={handleUpdateStatus} className="flex-1 bg-blue-600 text-white text-sm py-1 rounded-md">Save</button>
                            <button onClick={() => setShowStatusEditor(false)} className="flex-1 bg-gray-200 text-sm py-1 rounded-md">Cancel</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Customer Details Accordion */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
                <button onClick={() => setIsCustomerOpen(!isCustomerOpen)} className="w-full flex justify-between items-center p-4 font-bold text-gray-800">
                    Customer Details <ChevronDownIcon />
                </button>
                {isCustomerOpen && customerDetails && (
                    <div className="p-4 border-t grid grid-cols-2 gap-4 text-sm">
                        <div><strong className="block text-gray-500">Name</strong>{customerDetails.name}</div>
                        <div><strong className="block text-gray-500">Contact</strong>{customerDetails.contact}</div>
                        <div className="col-span-2 break-words"><strong className="block text-gray-500">Email</strong>{customerDetails.email}</div>
                        <div><strong className="block text-gray-500">Loan Amount</strong>₹{customerDetails.amount}</div>
                        <div><strong className="block text-gray-500">Loan Type</strong>{customerDetails.type}</div>
                        <div><strong className="block text-gray-500">Source</strong>{customerDetails.unknown1}</div>
                    </div>
                )}
            </div>

            {/* Files Accordion */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg">
                <button onClick={() => setIsFilesOpen(!isFilesOpen)} className="w-full flex justify-between items-center p-4 font-bold text-gray-800">
                    Case Documents <ChevronDownIcon />
                </button>
                {isFilesOpen && (
                    <div className="p-4 border-t space-y-4">
                        {/* File List */}
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {retrievedFiles.length > 0 ? retrievedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-md">
                                    <div className="flex items-center gap-2 truncate">
                                        <input type="checkbox" onChange={() => setSelectedFilesToDownload(prev => prev.includes(file.file_name) ? prev.filter(f => f !== file.file_name) : [...prev, file.file_name])} />
                                        <FileIcon />
                                        <span className="truncate">{file.file_name}</span>
                                    </div>
                                    <button onClick={() => downloadFile(file.file_name, file.file_content)} className="p-1 hover:bg-gray-200 rounded-full"><DownloadIcon /></button>
                                </div>
                            )) : <p className="text-center text-gray-500 text-sm">No documents found.</p>}
                        </div>
                        {retrievedFiles.length > 0 && (
                            <button onClick={() => selectedFilesToDownload.forEach(name => downloadFile(name, retrievedFiles.find(f => f.file_name === name)?.file_content))} disabled={selectedFilesToDownload.length === 0} className="w-full text-sm py-1 bg-gray-200 rounded-md disabled:opacity-50">Download Selected</button>
                        )}

                        {/* File Upload */}
                        <div className="pt-4 border-t">
                            <label htmlFor="fileUpload" className="cursor-pointer p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-50">
                                <Icon path="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z" />
                                <span className="text-sm font-semibold text-blue-600">Click to upload or drag & drop</span>
                                <input id="fileUpload"  type="file"
                              multiple
                              onChange={handleFileUpload} className="hidden"/>
                            </label>
                            {files.length > 0 && (
                                <div className="mt-2 space-y-1 text-xs">
                                    {files.map(f => <p key={f.name} className="truncate">{f.name}</p>)}
                                    <button onClick={handleNewFileUpload} className="w-full bg-blue-500 text-white font-semibold py-1 mt-1 rounded-md">Upload {files.length} file(s)</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
        </div>
        {/* This is the main column for the activity feed.
    - On large screens (lg), it takes up 7/12 of the parent grid.
    - On smaller screens, it will stack to take the full width.
*/}
<div className="lg:col-span-7 xl:col-span-8">
    
    {/* This inner container holds all the content.
        - 'flex flex-col' arranges children (like the title and the list) vertically.
        - 'max-h-[88vh]' is crucial: it limits the card's height to 88% of the screen's height,
          preventing the main page from scrolling.
    */}
    
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 flex flex-col  max-h-[88vh]">
    <h2 className="text-xl font-bold text-gray-800 mb-4 flex-shrink-0">Activity Feed</h2>

    <div className="flex justify-center mb-4">
                    <div className="relative flex p-1 bg-gray-200 rounded-full">
                        <button onClick={() => setActiveTab('notes')} className="relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-colors">Notes</button>
                        <button onClick={() => setActiveTab('tasks')} className="relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-colors">Tasks</button>
                        <span className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-orange-500 rounded-full transition-transform duration-300 ease-in-out ${activeTab === 'notes' ? 'translate-x-1' : 'translate-x-[calc(100%+2px)]'}`}></span>
                    </div>
                </div>

                {/* Input Area */}
                <div className="space-y-3">
                    <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={activeTab === 'notes' ? "Add a note..." : "Describe the task..."} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"></textarea>
                </div>
        
        
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
                        onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                      >
                        {assignedToName || "Schedule To"}
                      </button>
                      {showAssigneeDropdown && (
                        <div className="absolute z-10 bg-white shadow-md rounded-lg mt-2 w-full max-h-48 overflow-y-auto">
                          {users.length > 0 ? (
                            users.map((user) => (
                              <div
                                key={user.ID}
                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setAssignedTo(`${user.ID}`);
                                  setAssignedToName(user.Name);
                                  setShowAssigneeDropdown(false);
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
        {/* This div is the scrollable list.
            - 'flex-1' makes it expand to fill all available vertical space.
            - 'overflow-y-auto' adds a vertical scrollbar only when needed.
            - 'pr-4' adds padding on the right to prevent the scrollbar from overlapping content.
        */}
        <br />
        <div className="flex-1 overflow-y-auto pr-4">
            <div className="relative pl-12 space-y-6 border-l-2  border-gray-200">
                {entries.length > 0 ? entries.map((entry, index) => {
                    const isYou = entry.user === username;

                    // Simple function to get initials from a name
                    const getInitials = (name) => {
                        if (!name) return '?';
                        const names = name.split(' ');
                        if (names.length > 1) {
                            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
                        }
                        return name.substring(0, 2).toUpperCase();
                    };

                    // Simple hashing to get a consistent color for a user
                    const nameToColor = (name) => {
                        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
                        if (!name) return 'bg-gray-500';
                        let hash = 0;
                        for (let i = 0; i < name.length; i++) {
                            hash = name.charCodeAt(i) + ((hash << 5) - hash);
                        }
                        return colors[Math.abs(hash % colors.length)];
                    };

                    return (
                        <div key={index} className="relative flex gap-4 items-start group">
                            {/* Timeline Dot and Avatar */}
                            <div className="absolute -left-[34px] top-1 flex items-center justify-center">
                                <span className="absolute w-4 h-4 bg-orange-400 rounded-full border-4 border-white"></span>
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm ${nameToColor(entry.user)}`}>
                                </div>
                            </div>

                            {/* Content Card */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 w-full transition-all duration-200 group-hover:shadow-md">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-800">{isYou ? "You" : entry.user}</span>
                                        <span className="text-xs text-gray-400">
                                            {entry.type === 'note' ? 'added a note' : 'created a task'}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">{entry.timestamp}</span>
                                </div>
                                
                                <div className="text-gray-700 break-words">
                                    {entry.message}
                                </div>

                                {entry.type === 'task' && (
                                    <div className="mt-2 pt-2 border-t border-dashed flex items-center gap-2 text-sm">
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                        <span className="text-gray-500">Assigned to:</span> 
                                        <strong className="text-green-700">{entry.scheduleTo}</strong>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center text-gray-500 py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No Activity</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding a new note or task.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
</div>
      </main>
    </div>
  );
}