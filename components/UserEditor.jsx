"use client";

import { useEffect, useState } from "react";
import { fetchWithFallback } from "../utils/api";
import Toastify from "toastify-js";

export default function UserEditor() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // null -> create mode
  const [form, setForm] = useState({
    Name: "",
    Email: "",
    Role: "executive",
    Password: "",
    ConfirmPassword: "",
    AuthMode: "old-password", // or "admin-key"
    OldPassword: "",
    AdminKey: ""
  });

  // fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await fetchWithFallback(`/api/all-users`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!data) throw new Error("Failed to fetch users");
      setUsers(data);
    } catch (e) {
      Toastify({ text: e.message, backgroundColor: "#E53E3E" }).showToast();
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setForm({
      Name: "",
      Email: "",
      Role: "executive",
      Password: "",
      ConfirmPassword: "",
      AuthMode: "old-password",
      OldPassword: "",
      AdminKey: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.Password && form.Password !== form.ConfirmPassword) {
      Toastify({ text: "Passwords do not match", backgroundColor: "#E53E3E" }).showToast();
      return;
    }

    try {
      const url = editingUser ? `https://vfinserv.in/api/users/${editingUser.ID}` : `https://vfinserv.in/api/users`;
      const method = editingUser ? "PUT" : "POST";

      const body = {
        Name: form.Name,
        Email: form.Email,
        Role: form.Role,
        Password: form.Password || undefined,
        AuthMode: form.AuthMode,
        OldPassword: form.AuthMode === "old-password" ? form.OldPassword : undefined,
        AdminKey: form.AuthMode === "admin-key" ? form.AdminKey : undefined
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials:"include"
      });
      if (!res.ok) throw new Error("Save failed");
      Toastify({ text: "Saved!", backgroundColor: "#38A169" }).showToast();
      resetForm();
      fetchUsers();
    } catch (e) {
      Toastify({ text: e.message, backgroundColor: "#E53E3E" }).showToast();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      const res = await fetch(`https://vfinserv.in/api/users/${id}`, { method: "DELETE",credentials:"include" });
      if (!res.ok) throw new Error("Delete failed");
      Toastify({ text: "Deleted", backgroundColor: "#38A169" }).showToast();
      fetchUsers();
    } catch (e) {
      Toastify({ text: e.message, backgroundColor: "#E53E3E" }).showToast();
    }
  };

  const populateEdit = (user) => {
    setEditingUser(user);
    setForm(prev => ({
      ...prev,  // Keep any existing form state
      Name: user.Name || "",
      Email: user.Email || "",
      Role: user.Role || "executive",
      Password: "",
      ConfirmPassword: "",
      AuthMode: "admin-key",
      OldPassword: "",
      AdminKey: ""
    }));
  };

  return (
    <div className="p-2 sm:p-4 md:p-8 max-w-4xl mx-auto text-black">
      {/* User List */}
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-700">Users</h2>
      <div className="w-full overflow-x-auto mb-8">
        <table className="w-full min-w-[500px] bg-white rounded-xl shadow border border-blue-100">
          <thead className="bg-blue-50 text-blue-900">
            <tr>
              <th className="py-2 px-3 text-left font-semibold">Name</th>
              <th className="py-2 px-3 text-left font-semibold">Email</th>
              <th className="py-2 px-3 text-left font-semibold">Role</th>
              <th className="py-2 px-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.ID} className="border-b last:border-none">
                <td className="py-2 px-3 text-sm">{u.Name}</td>
                <td className="py-2 px-3 text-sm">{u.Email}</td>
                <td className="py-2 px-3 text-xs uppercase tracking-wide text-blue-700">{u.Role}</td>
                <td className="py-2 px-3 space-x-2 text-center">
                  <button onClick={() => populateEdit(u)} className="text-blue-600 hover:bg-blue-100 hover:text-blue-800 px-2 py-1 rounded text-xs font-semibold transition">Edit</button>
                  <button onClick={() => handleDelete(u.ID)} className="text-orange-600 hover:bg-orange-100 hover:text-orange-800 px-2 py-1 rounded text-xs font-semibold transition">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form */}
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-blue-700">{editingUser ? "Edit User" : "Add New User"}</h2>
      <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 rounded-xl shadow grid gap-4 border border-blue-100">
        <div>
          <label className="block text-sm font-medium text-blue-700">Name</label>
          <input className="w-full border border-blue-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" value={form.Name} onChange={e => setForm({ ...form, Name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-700">Email</label>
          <input type="email" className="w-full border border-blue-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-700">Role</label>
          <select className="w-full border border-orange-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.Role} onChange={e => setForm({ ...form, Role: e.target.value })}>
            {["super_admin","operation_head","backend_team","management_team","branch_manager","team_leader","executive"].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Password */}
        <details className="col-span-2">
          <summary className="cursor-pointer font-medium select-none text-blue-700">Password Options</summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-sm font-medium text-blue-700">New Password</label>
              <input type="password" className="w-full border border-blue-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" value={form.Password} onChange={e => setForm({ ...form, Password: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700">Confirm Password</label>
              <input type="password" className="w-full border border-blue-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400" value={form.ConfirmPassword} onChange={e => setForm({ ...form, ConfirmPassword: e.target.value })} />
            </div>
            {/* Auth Mode */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1 text-blue-700">Authentication Mode</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-1">
                  <input type="radio" name="authMode" checked={form.AuthMode === "old-password"} onChange={() => setForm({ ...form, AuthMode: "old-password" })} />
                  <span className="text-sm">Old Password</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input type="radio" name="authMode" checked={form.AuthMode === "admin-key"} onChange={() => setForm({ ...form, AuthMode: "admin-key" })} />
                  <span className="text-sm">Admin Key</span>
                </label>
              </div>
            </div>
            {form.AuthMode === "old-password" ? (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Old Password</label>
                <input type="password" className="w-full border p-2 rounded" value={form.OldPassword} onChange={e => setForm({ ...form, OldPassword: e.target.value })} />
              </div>
            ) : (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium">Admin Key</label>
                <input type="password" className="w-full border p-2 rounded" value={form.AdminKey} onChange={e => setForm({ ...form, AdminKey: e.target.value })} />
              </div>
            )}
          </div>
        </details>

        <div className="flex space-x-4 col-span-2 justify-end">
          {editingUser && <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={resetForm}>Cancel</button>}
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{editingUser ? "Update" : "Create"}</button>
        </div>
      </form>
    </div>
  );
}
