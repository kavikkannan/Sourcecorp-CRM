
"use client";
import { mode } from "crypto-js";
import React, { useState, useEffect } from "react";

const GUserPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [userText, setUserText] = useState("");
  const [storedData, setStoredData] = useState(null);
  const [decryptedMessage, setDecryptedMessage] = useState("");

  useEffect(() => {
    const savedData = sessionStorage.getItem("encryptedData");
    if (savedData) {
      setStoredData(JSON.parse(savedData));
    }
  }, []);

const genEIForPfile = (PPass,n) => {
  const crypto = require("crypto");
  PPass=PPass.toString("hex");
  let InitialIndex = Buffer.from(
    crypto.createHash("sha256").update(PPass).digest("hex"),
    "hex"
  ).subarray(0, 32);

  InitialIndex= parseInt(InitialIndex[0]) % 100;
    n+=InitialIndex;
    let PI = crypto
      .createHash("sha256")
      .update(PPass + n)
      .digest("hex");
    let node=InitialIndex%4;
    
  return {
    pi:PI,
    noo:node
  };
}

  const handleEncrypt = async (e) => {
    e.preventDefault(); // Prevent form submission

    const crypto = require("crypto");

    const CHUNK_SIZE = 5; // Define chunk size
    const PPass = password.padEnd(32, "0");
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

    // Input text
    const data = userText;

    // Step 1: Fragment the message
    const fragments = [];
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      fragments.push(data.slice(i, i + CHUNK_SIZE));
    }

    // Step 2: Generate NodePattern
    const NodePattern = [];
    for (let i = 0; i < fragments.length; i++) {
      NodePattern.push((i % numNodes) + 1);
    }

    // Step 3: Encrypt KFile to generate PFile
    const { encryptedData: PFile, iv: PFileIV } = encryptData(
      KFile + "$$" + fragments.length + "@@" + numNodes,
      PPass.padEnd(32, "0")
    );
   let NoOfFilesStored = 1
    const {pi,noo} =genEIForPfile(PPass,NoOfFilesStored);
    const eindex = pi;
    const pfile = PFile;
    const pfileiv= PFileIV;
    try {
      const response = await fetch(
        `http://localhost:${9000 + noo}/api/pfile/insert`,
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eindex, 
            pfile, 
            pfileiv
          }),
        }
      );
      if (response.ok) {
        alert("appended PFile successfully");
      } else {
        alert(" not successful");
      }
    } catch (error) {
      console.error("Error fetching encrypted message:", error);
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
        const response = await fetch(
          `http://localhost:${9000 + NodePattern[i]}/api/insert`,
          {
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
          }
        );
        if (response.ok) {
          console.log("appended successfully");
        } else {
          alert(" not successful");
        }
      } catch (error) {
        console.error("Error fetching encrypted message:", error);
      }
    }
    setIsFormOpen(false); // Close form
  };

  const handleDecrypt = async () => {
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
    const PPass = password.padEnd(32, "0");

    let NoOfFilesStored = 1
    const {pi,noo} =genEIForPfile(PPass,NoOfFilesStored);
    let PFile = "";
    let PFileIV ="";
    try {
      const response = await fetch(
        `http://localhost:${9000 + noo}/api/pfile/fetch/${pi}`
      );
      if (response.ok) {
        const data = await response.json();

        // Store the encrypted data and IV in the EM array
         PFile = data.PFile;
         PFileIV = data.PFileIv;
      
      } else {
        console.error("Failed to fetch message, status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching encrypted message:", error);
    }
    
    const decryptedPFileData = decryptData(
      PFile.toString("hex"),
      PPass,
      PFileIV.toString("hex")
    );
    const PFileKey = Buffer.from(
      crypto.createHash("sha256").update(PFile).digest("hex"),
      "hex"
    ).slice(0, 32);
    const [decryptedKFile, rest] = decryptedPFileData.split("$$");
    const [fragLength, nodeCount] = rest.split("@@");

    // Step 4: Compute InitialIndex
    const InitialIndex = parseInt(PFile.substring(0, 6), 16) % 100;
    const NodePattern = [];
    for (let i = 0; i < fragLength; i++) {
      NodePattern.push((i % nodeCount) + 1);
    }
    
    // Step 5: Generate EI (Encrypted Index Array)
    let EI = [];
    for (let n = InitialIndex; n < InitialIndex + fragLength; n++) {
      let hash = crypto
        .createHash("sha256")
        .update(PFile + n)
        .digest("hex");
      EI.push(hash);
    }
    // Store encrypted data and iv in EM
    let EM = [];
    for (let i = 0; i < fragLength; i++) {
      try {
        const response = await fetch(
          `http://vfinserv:${9000 + NodePattern[i]}/api/fetch/${EI[i]}`
        );
        if (response.ok) {
          const data = await response.json();

          // Store the encrypted data and IV in the EM array
          EM.push({
            encryptedData: data.EMessage,
            iv: data.IV,
          });
        } else {
          console.error("Failed to fetch message, status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching encrypted message:", error);
      }
    }

    // Decrypt fragments once all data is collected
    let decryptedMsg = "";
    EM.forEach(({ encryptedData, iv }) => {

      decryptedMsg += decryptData(encryptedData, PFileKey, iv);
    });

    setDecryptedMessage(decryptedMsg);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-black">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-700">Secured Storage</h1>
        <p className="text-gray-500 mt-2">
          Encrypt and store your messages securely.
        </p>
        <button
          className="mt-5 px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition duration-300"
          onClick={() => setIsFormOpen(true)}
        >
          Get Started
        </button>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96">
            <h2 className="text-xl font-semibold text-gray-700">
              Enter Details
            </h2>
            <input
              type="password"
              className="mt-3 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="text"
              className="mt-3 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Text"
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
            />
            <div className="flex justify-end mt-5">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg mr-3 hover:bg-gray-400 transition"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                onClick={handleEncrypt}
              >
                Encrypt
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md mt-6 bg-white p-6 rounded-xl shadow-md text-center">
        <h3 className="text-lg font-semibold text-gray-700">Encrypted File</h3>
        <input
          type="password"
          className="mt-3 p-3 border rounded-lg w-full focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Password"
        />
        <button
          className="mt-4 px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
          onClick={handleDecrypt}
        >
          Decrypt
        </button>
        {decryptedMessage && (
          <p className="mt-4 text-gray-700">{decryptedMessage}</p>
        )}
      </div>
    </div>
  );
};

export default GUserPage;
