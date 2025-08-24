'use client';

import { useState } from 'react';

export default function DecryptionDashboard({ cases, onDecrypt }) {
  const [activeCase, setActiveCase] = useState(null);
  const [password, setPassword] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [decryptionProgress, setDecryptionProgress] = useState(0);

  const handleDecryptClick = async (caseItem) => {
    if (!password) {
      setMessage({ type: 'error', text: 'Please enter a password' });
      return;
    }

    setActiveCase(caseItem);
    setIsDecrypting(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await onDecrypt(caseItem, password);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Successfully decrypted and updated amount!' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to decrypt data' 
        });
      }
    } catch (error) {
      console.error('Error during decryption:', error);
      setMessage({ 
        type: 'error', 
        text: 'An error occurred during decryption' 
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'decrypted':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Decrypted</span>;
      case 'error':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Error</span>;
      default:
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Pending</span>;
    }
  };

  const handleDecryptAll = async () => {
    if (!password) {
      setMessage({ type: 'error', text: 'Please enter a password' });
      return;
    }

    setMessage({ type: '', text: '' });
    
    // Process all cases that aren't already decrypted
    const casesToProcess = cases.filter(caseItem => caseItem.status !== 'decrypted');
    
    if (casesToProcess.length === 0) {
      setMessage({ type: 'info', text: 'All cases are already decrypted' });
      return;
    }

    setIsDecrypting(true);
    
    try {
      let successCount = 0;
      const updatedCases = [...cases];
      
      for (const caseItem of casesToProcess) {
        try {
          const result = await onDecrypt(caseItem, password);
          if (result.success) {
            const caseIndex = updatedCases.findIndex(c => c.caseId === caseItem.caseId);
            if (caseIndex !== -1) {
              updatedCases[caseIndex] = { ...caseItem, status: 'decrypted', decryptedData: result.decryptedData };
              successCount++;
            }
          }
        } catch (error) {
          console.error(`Error decrypting case ${caseItem.caseId}:`, error);
        }
      }
      
      setCases(updatedCases);
      setMessage({ 
        type: 'success', 
        text: `Successfully decrypted ${successCount} of ${casesToProcess.length} cases` 
      });
    } catch (error) {
      console.error('Error during batch decryption:', error);
      setMessage({ 
        type: 'error', 
        text: 'An error occurred during batch decryption' 
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Password</h2>
          <button
            onClick={handleDecryptAll}
            disabled={isDecrypting || cases.every(c => c.status === 'decrypted')}
            className={`px-4 py-2 rounded-md font-medium text-sm ${
              isDecrypting || cases.every(c => c.status === 'decrypted')
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isDecrypting ? 'Decrypting...' : 'Decrypt All'}
          </button>
        </div>
        <div className="flex space-x-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter decryption password"
            className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={isDecrypting}
          />
        </div>
        {message.text && (
          <div className={`mt-2 p-2 rounded ${
            message.type === 'error' 
              ? 'bg-red-100 text-red-700' 
              : message.type === 'info'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
          }`}>
            {message.text}
            {isDecrypting && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{
                    width: `${(cases.filter(c => c.status === 'decrypted').length / cases.length) * 100}%`,
                    transition: 'width 0.3s ease-in-out'
                  }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Cases</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P-Index</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cases.map((caseItem) => (
                <tr key={caseItem.caseId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {caseItem.pindex}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {caseItem.caseId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(caseItem.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {caseItem.message}
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDecryptClick(caseItem)}
                      disabled={isDecrypting || caseItem.status === 'decrypted'}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        caseItem.status === 'decrypted'
                          ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      }`}
                    >
                      {isDecrypting && activeCase?.caseId === caseItem.caseId
                        ? 'Decrypting...'
                        : caseItem.status === 'decrypted'
                        ? 'Decrypted'
                        : 'Decrypt'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {cases.some(c => c.status === 'decrypted' && c.decryptedData) && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Decrypted Data</h2>
          <div className="space-y-4">
            {cases
              .filter(c => c.status === 'decrypted' && c.decryptedData)
              .map((caseItem) => (
                <div key={caseItem.caseId} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Case: {caseItem.caseId}</h3>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(caseItem.decryptedData, null, 2)}
                  </pre>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
