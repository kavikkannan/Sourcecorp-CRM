"use client";
import React, { useState } from "react";
import UserManagement from "@/components/UserManagement";
import UserEditor from "@/components/UserEditor";
import CaseManager from "@/components/CaseManager";
import RegisterationPage from "@/components/registeration";

const COMPONENTS = {
  usermanagement: <UserManagement />,
  usereditor: <UserEditor />,
  casemanager: <CaseManager />,
  registeration: <RegisterationPage />,
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
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Header (always visible) */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white shadow-sm flex items-center justify-between px-6 py-4 border-b border-gray-200 md:hidden">
        <div className="flex items-center gap-2">
          <span className="text-gray-800 font-bold text-xl tracking-tight">SourceCorp CRM</span>
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
          <span className="text-gray-800 font-bold text-xl tracking-tight">SourceCorp CRM</span>
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