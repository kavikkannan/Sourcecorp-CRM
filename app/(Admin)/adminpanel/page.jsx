"use client";
import React, { useState, useEffect } from "react";
import UserManagement from "@/components/UserManagement";
import UserEditor from "@/components/UserEditor";
import CaseManager from "@/components/CaseManager";
import RegisterationPage from "@/components/registeration";
import DecryptionDashboard from "@/components/DecryptionDashboard";
import CryptoJS from 'crypto-js';

const DecryptSection = () => {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [excludedCaseIdsInput, setExcludedCaseIdsInput] = useState('');

  // Predefined array of case IDs to exclude
  const excludedCaseIds = [
    '0071608253',
    '0070808251',
    '0071108252',
    '0072108255',
    '0072008254',
    // Add more case IDs to exclude as needed
  ];

  const fetchUserPassword = async (userId) => {
    try {
      const response = await fetch(`https://vfinserv.in/api/user/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user ${userId}`);
      }
      const userData = await response.json();
      return userData.PPass; // Return the password
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  };

  const decryptData = (encryptedData, PPass) => {

    
    if (!encryptedData || !PPass) {
      console.error("Missing encrypted data or password");
      return { amount: 0 };
    }

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, PPass);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        console.error("Decryption resulted in empty string");
        return { amount: 0 };
      }

      try {
        const parsed = JSON.parse(decryptedText);
        return parsed.amount !== undefined ? parsed : { amount: 0 };
      } catch (e) {
        console.error("Failed to parse decrypted data as JSON, trying to parse as number");
        const amount = parseFloat(decryptedText);
        return { amount: isNaN(amount) ? 0 : amount };
      }
    } catch (error) {
      console.error("Decryption failed:", error);
      return { amount: 0 };
    }
  };

  const fetchAndProcessCases = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('https://vfinserv.in/api/process_amounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }
      
      const data = await response.json();
      if (data.status === 'success') {
        // Parse the comma-separated list of case IDs to exclude
        const excludedIds = excludedCaseIdsInput
          .split(',')
          .map(id => id.trim())
          .filter(id => id);

        // Filter out excluded case IDs before processing
        const filteredCases = data.data.filter(
          caseItem => !excludedIds.includes(caseItem.caseId) && !excludedCaseIds.includes(caseItem.caseId)
        );

        const casesWithPasswords = await Promise.all(
          filteredCases.map(async (caseItem) => {
            const password = await fetchUserPassword(caseItem.agentId);
            const d = decryptData(caseItem.encryptedData, password);
            return {
              ...caseItem,
              status: 'pending',
              password,
              decryptedData: d.amount
            };
          })
        );
        
        setCases(casesWithPasswords);
      } else {
        throw new Error(data.message || 'Failed to load cases');
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndProcessCases();
  }, []);

  const updateCaseAmounts = async (cases) => {
    try {
      const updates = cases.map(caseItem => ({
        PIndex: caseItem.pindex,
        CaseID: caseItem.caseId,
        Amount: parseFloat(caseItem.decryptedData) || 0
      }));

      // Filter out cases without decrypted data
      const validUpdates = updates.filter(item => item.Amount > 0);

      if (validUpdates.length === 0) {
        console.log('No valid cases to update');
        return { success: false, message: 'No valid cases to update' };
      }

      // Send each update to the API
      const results = await Promise.all(
        validUpdates.map(update =>
          fetch('https://vfinserv.in/api/amount', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(update)
          })
          .then(response => response.json())
          .then(data => ({
            caseId: update.CaseID,
            success: data.success,
            message: data.message || 'Updated successfully'
          }))
          .catch(error => ({
            caseId: update.CaseID,
            success: false,
            message: error.message
          }))
        )
      );

      // Update the UI with the results
      setCases(prevCases => 
        prevCases.map(c => {
          const result = results.find(r => r.caseId === c.caseId);
          if (!result) return c;
          
          return {
            ...c,
            status: result.success ? 'completed' : 'error',
            updateStatus: result
          };
        })
      );

      return {
        success: results.every(r => r.success),
        results
      };
    } catch (error) {
      console.error('Error updating case amounts:', error);
      return {
        success: false,
        message: error.message || 'Failed to update case amounts'
      };
    }
  };

  // Call this function after fetchAndProcessCases completes
  useEffect(() => {
    if (cases.length > 0 && cases.every(c => c.status === 'pending' && c.decryptedData)) {
      updateCaseAmounts(cases);
    }
  }, [cases]);

  const handleDecrypt = async (caseItem) => {
    try {
      if (!caseItem.password) {
        throw new Error('No password available for this case');
      }
      console.log("handle decrypt me enteringgggg")
      // Decrypt the data using the stored password
      const decryptedData = decryptData(caseItem.encryptedData, caseItem.password);
      
      // Update the case with decrypted data
      setCases(prevCases => 
        prevCases.map(c => 
          c.caseId === caseItem.caseId 
            ? { 
                ...c, 
                status: 'decrypted', 
                decryptedData,
                decryptedAt: new Date().toISOString()
              }
            : c
        )
      );
      
      console.log('Decrypted data for case', caseItem.caseId, ':', decryptedData);
      return { success: true, decryptedData };
      
    } catch (error) {
      console.error('Decryption error for case', caseItem.caseId, ':', error);
      
      // Update the case with error status
      setCases(prevCases => 
        prevCases.map(c => 
          c.caseId === caseItem.caseId 
            ? { 
                ...c, 
                status: 'error', 
                error: error.message 
              }
            : c
        )
      );
      
      return { 
        success: false, 
        error: error.message || 'Failed to decrypt case' 
      };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Exclude Case IDs (comma-separated):
          <input
            type="text"
            value={excludedCaseIdsInput}
            onChange={(e) => setExcludedCaseIdsInput(e.target.value)}
            placeholder="e.g., 12345, 67890"
            style={{ marginLeft: '0.5rem', padding: '0.5rem' }}
          />
        </label>
        <button 
          onClick={fetchAndProcessCases}
          disabled={isLoading}
          style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
        >
          {isLoading ? 'Processing...' : 'Refresh Cases'}
        </button>
      </div>
      <DecryptionDashboard 
        cases={cases}
        onDecrypt={(caseItem) => handleDecrypt(caseItem)}
      />
    </div>
  );
};



const COMPONENTS = {
  usermanagement: <UserManagement />,
  usereditor: <UserEditor />,
  casemanager: <CaseManager />,
  registeration: <RegisterationPage />,
  decrypt: <DecryptSection />,
};

export default function AdminPanel() {
  const [selected, setSelected] = useState("usermanagement");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Icon SVGs
  const icons = {
    usermanagement: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-2a4 4 0 100-8 4 4 0 000 8zm6 4v2m-6-2v2" /></svg>
    ),
    usereditor: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z" /></svg>
    ),
    casemanager: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2M9 17H7a4 4 0 01-4-4v-2a4 4 0 014-4h2a4 4 0 014 4v2m0 0v2" /></svg>
    ),
    registeration: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
    ),
    decrypt: (
      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Header (always visible) */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white shadow-sm flex items-center justify-between px-6 py-4 border-b border-gray-200 md:hidden">
        <div className="flex items-center gap-2">
          <a href="/home" className="text-gray-800 font-bold text-xl tracking-tight">SourceCorp CRM</a>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-full w-64 bg-white text-gray-800 flex-shrink-0 flex flex-col shadow-lg md:shadow-none border-r border-gray-200 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:h-screen`}
      >
        {/* Sidebar Header (Mobile) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 md:hidden">
          <span className="font-bold text-lg text-gray-800">Menu</span>
          <button
            className="text-gray-700 text-2xl focus:outline-none"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            &times;
          </button>
        </div>

        {/* Sidebar Header (Desktop) */}
        <div className="hidden md:flex items-center justify-center px-6 py-4 border-b border-gray-200">
          <a href="/home" className="text-gray-800 font-bold text-xl tracking-tight">SourceCorp CRM</a>
        </div>

        <nav className="mt-6 flex flex-col gap-2 px-4">
          <button
            className={`flex items-center text-left px-4 py-3 rounded-md font-medium transition-colors duration-200 ${selected === "usermanagement" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"}`}
            onClick={() => { setSelected("usermanagement"); setSidebarOpen(false); }}
          >
            {icons.usermanagement} User Management
          </button>
          <button
            className={`flex items-center text-left px-4 py-3 rounded-md font-medium transition-colors duration-200 ${selected === "usereditor" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"}`}
            onClick={() => { setSelected("usereditor"); setSidebarOpen(false); }}
          >
            {icons.usereditor} User Editor
          </button>
          <button
            className={`flex items-center text-left px-4 py-3 rounded-md font-medium transition-colors duration-200 ${selected === "casemanager" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"}`}
            onClick={() => { setSelected("casemanager"); setSidebarOpen(false); }}
          >
            {icons.casemanager} Case Manager
          </button>
          <button
            className={`flex items-center text-left px-4 py-3 rounded-md font-medium transition-colors duration-200 ${selected === "registeration" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"}`}
            onClick={() => { setSelected("registeration"); setSidebarOpen(false); }}
          >
            {icons.registeration} Registeration
          </button>
          <button
            className={`flex items-center text-left px-4 py-3 rounded-md font-medium transition-colors duration-200 ${selected === "decrypt" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"}`}
            onClick={() => { setSelected("decrypt"); setSidebarOpen(false); }}
          >
            {icons.decrypt} Data Decryption
          </button>
        </nav>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 bg-gradient-to-br from-blue-200 via-white to-orange-200 p-6 md:p-8 overflow-y-auto min-w-0 md:ml-0 pt-20 md:pt-8">
        {COMPONENTS[selected]}
      </main>
    </div>
  );
}