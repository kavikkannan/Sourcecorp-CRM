"use client";

import { useEffect, useState } from "react";
import Toastify from "toastify-js";
import { fetchWithFallback } from "../utils/api";

export default function CaseManager() {
  const [cases, setCases] = useState(null); // Initialize as null
  const [filter, setFilter] = useState({ id: "", name: "", status: "" });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch cases when filter changes
  useEffect(() => {
    fetchCases();
    
  }, [filter]);

  const fetchCases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter.id) params.append("id", filter.id);
      if (filter.name) params.append("name", filter.name);
      if (filter.status) params.append("status", filter.status);

      const data = await fetchWithFallback(`/api/cases?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!data) throw new Error("Failed to load cases");
      setCases(Array.isArray(data) ? data : []);
      setSelectedIds(new Set()); // reset selection
    } catch (e) {
      console.error("Error fetching cases:", e);
      setError(e.message);
      Toastify({ text: e.message, backgroundColor: "#E53E3E" }).showToast();
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === cases.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cases.map(c => c.ID)));
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if(selectedIds.size === 1){
      try {
        const data = await fetchWithFallback(`/api/cases/${Array.from(selectedIds)[0]}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" }
        });
        if (!data) throw new Error("Delete failed");
        Toastify({ text: "Deleted", backgroundColor: "#38A169" }).showToast();
        fetchCases();
      } catch (e) {
        Toastify({ text: e.message, backgroundColor: "#E53E3E" }).showToast();
      }
      if (!confirm("Delete selected case?")) return;
    }
    else{
      
      try {
        const data = await fetchWithFallback(`/api/cases/bulk`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: Array.from(selectedIds) })
        });
        if (!data) throw new Error("Delete failed");
        Toastify({ text: "Deleted", backgroundColor: "#38A169" }).showToast();
        fetchCases();
      } catch (e) {
        Toastify({ text: e.message, backgroundColor: "#E53E3E" }).showToast();
      }
    }
    
  };

  const downloadReport = async (format) => {
    if (selectedIds.size === 0) return;
    try {
      const ids = Array.from(selectedIds).join(",");
      const link = document.createElement("a");
      link.href = `/api/cases/report?ids=${ids}&format=${format}`;
      link.target = "_blank";
      link.click();
    } catch (e) {
      Toastify({ text: e.message, backgroundColor: "#E53E3E" }).showToast();
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle no cases state
  if (!cases || cases.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto ">
        <div className="flex justify-between  items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Case Manager</h1>
          <div className="text-sm text-gray-500">0 cases found</div>
        </div>
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2 text-sm font-medium text-gray-500">No cases found</p>
          <p className="text-xs mt-1 text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>
        </div>
      </div>
    );
  }

  // Main component return
  return (
    <div className="p-2 sm:p-4 md:p-8 max-w-7xl bg-white mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
        <h1 className="text-xl md:text-3xl font-bold text-blue-700">Case Manager</h1>
        <div className="text-xs md:text-sm text-blue-600">
          {cases.length} {cases.length === 1 ? 'case' : 'cases'} found
        </div>
      </div>

      {/* Filters */}
      <div className="bg-blue-50 p-4 md:p-5 rounded-xl shadow-sm border border-blue-100 grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div>
          <label className="block text-xs md:text-sm font-medium text-blue-700 mb-1">Case ID</label>
          <input 
            placeholder="Enter case ID" 
            className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors" 
            value={filter.id} 
            onChange={e => setFilter({ ...filter, id: e.target.value })} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Case Name</label>
          <input 
            placeholder="Search by name" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
            value={filter.name} 
            onChange={e => setFilter({ ...filter, name: e.target.value })} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white" 
            value={filter.status} 
            onChange={e => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">All Status</option>
            {['open', 'in_progress', 'closed'].map(status => (
              <option key={status} value={status}>
                {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button 
          onClick={selectAll} 
          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {selectedIds.size === cases.length ? 'Deselect All' : 'Select All'}
        </button>
        <button 
          onClick={deleteSelected} 
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={selectedIds.size === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Selected
        </button>
        <div className="h-6 w-px bg-gray-200 mx-1"></div>
        <button 
          onClick={() => downloadReport('csv')} 
          className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={selectedIds.size === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export as CSV
        </button>
        <button 
          onClick={() => downloadReport('pdf')} 
          className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={selectedIds.size === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Export as PDF
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-indigo-50">
            <tr>
              <th className="py-3 px-4 w-12">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  checked={selectedIds.size === cases.length && cases.length > 0} 
                  onChange={selectAll} 
                />
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">ID</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">Name</th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-indigo-900 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {cases.map(c => (
              <tr 
                key={c.id} 
                className={`hover:bg-indigo-50 transition-colors ${selectedIds.has(c.id) ? 'bg-indigo-50' : ''}`}
              >
                <td className="py-3 px-4 text-center">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={selectedIds.has(c.id)} 
                    onChange={() => toggleSelect(c.id)} 
                  />
                </td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">{c.caseid}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{c.name}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    c.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                    c.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {c.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </td>
              </tr>
            ))}
            {cases.length === 0 && (
              <tr>
                <td colSpan="4" className="py-12 text-center">
                  <div className="text-gray-400">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2 text-sm font-medium text-gray-500">No cases found</p>
                    <p className="text-xs mt-1 text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
