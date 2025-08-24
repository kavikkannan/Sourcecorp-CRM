'use client';

import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import DecryptionDashboard from '@/components/DecryptionDashboard';

export default function DecryptPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEncryptedData = async () => {
      try {
        const response = await fetch('https://vfinserv.in/case/encrypted-data');
        const data = await response.json();
        
        if (data.status === 'success') {
          setCases(data.data);
        } else {
          setError('Failed to fetch encrypted data');
        }
      } catch (err) {
        console.error('Error fetching encrypted data:', err);
        setError('Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchEncryptedData();
  }, []);

  const handleDecrypt = async (caseData, password) => {
    try {
      const bytes = CryptoJS.AES.decrypt(caseData.encryptedData, password);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Invalid password or corrupted data');
      }

      const decryptedData = JSON.parse(decrypted);
      
      // Update the amount in the backend
      const updateResponse = await fetch('https://vfinserv.in/case/amount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pindex: caseData.pindex,
          caseId: caseData.caseId,
          amount: decryptedData.amount
        }),
      });

      const result = await updateResponse.json();
      
      if (result.success) {
        // Update UI to show success
        setCases(prevCases => 
          prevCases.map(c => 
            c.caseId === caseData.caseId 
              ? { ...c, status: 'decrypted', decryptedData }
              : c
          )
        );
        return { success: true };
      } else {
        throw new Error(result.error || 'Failed to update amount');
      }
    } catch (err) {
      console.error('Decryption error:', err);
      return { 
        success: false, 
        error: err.message || 'Failed to decrypt data' 
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Case Decryption Dashboard</h1>
      <DecryptionDashboard 
        cases={cases} 
        onDecrypt={handleDecrypt} 
      />
    </div>
  );
}
