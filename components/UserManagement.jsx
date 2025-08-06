"use client";

import { useState, useEffect } from "react";
import { fetchWithFallback } from "../utils/api";

export default function UserManagement() {
  const [role, setRole] = useState(""); // Selected role filter
  const [users, setUsers] = useState([]); // Users with selected role
  const [allUsers, setAllUsers] = useState([]); // All appointable users
  const [selectedMembers, setSelectedMembers] = useState({}); // Track selected member for each user

  // Fetch users based on role
  useEffect(() => {
    const fetchUsers = async () => {
      if (role) {
        try {
          const data = await fetchWithFallback(`/api/users/${role}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
          });
          if (data) {
            const formattedUsers = data.map(user => ({
              ...user,
              AppointedMembers: user.AppointedMembers ? user.AppointedMembers.split(",") : [],
            }));

            setUsers(formattedUsers);
          } else {
            console.error("Failed to fetch users");
          }
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
    };

    fetchUsers();
  }, [role]);

  // Fetch all users for appointment dropdown
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const data = await fetchWithFallback(`/api/all-users`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });
        if (data) {
          setAllUsers(data);
        } else {
          console.error("Failed to fetch all users");
        }
      } catch (error) {
        console.error("Error fetching all users:", error);
      }
    };

    fetchAllUsers();
  }, []);

  const allUsersMap = Object.fromEntries(allUsers.map(user => [String(user.ID), user]));

  // Appoint a new member to the user
  const handleAppoint = async (UserID, AppointedUserID) => {
    if (!AppointedUserID) return;

    try {
      const user = users.find(u => u.ID === UserID);
      if (!user) return;

      const existingMembers = user.AppointedMembers.length > 0 ? user.AppointedMembers.join(",") : "";
      const updatedMembers = existingMembers ? `${existingMembers},${AppointedUserID}` : AppointedUserID;

      const response = await fetchWithFallback(`/api/appoint`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          UserID: String(UserID), 
          AppointedMembers: updatedMembers 
        }),
      });

      if (response) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.ID === UserID
              ? { ...user, AppointedMembers: [...user.AppointedMembers, AppointedUserID] }
              : user
          )
        );
        // Reset the selected member for this user
        setSelectedMembers(prev => ({
          ...prev,
          [UserID]: ""
        }));
      } else {
        console.error("Failed to appoint member");
      }
    } catch (error) {
      console.error("Error appointing member:", error);
    }
  };

// Remove an already–appointed member
const handleRemoveAppointed = async (UserID, memberID) => {
  try {
    const response = await fetchWithFallback(`/api/removeAppointedMember`, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      credentials:"include",
      body: JSON.stringify({
        UserID: String(UserID),
        MemberID: String(memberID)
      })
    });

    if (response.ok) {
      // Update the local state to reflect the removal
      setUsers(prev => prev.map(u => 
        u.ID === UserID 
          ? { 
              ...u, 
              AppointedMembers: u.AppointedMembers.filter(id => id !== memberID) 
            } 
          : u
      ));
    } else {
      const errorData = await response.json();
      console.error("Failed to remove appointed member:", errorData.message);
      // Optionally, show an error message to the user
    }
  } catch (err) {
    console.error("Error removing appointed member:", err);
    // Optionally, show an error message to the user
  }
};
  return (
    <div className="max-h-screen p-4 md:p-8 ">
      {/* Role Filter Dropdown */}
      <div className="bg-white p-4 md:p-6 shadow rounded-xl mb-8 max-w-lg mx-auto text-gray-900 border border-blue-100">
        <label className="block text-base md:text-lg font-semibold mb-2 text-blue-800">Filter by Role:</label>
        <select
          className="p-3 border border-blue-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Role</option>
          {["super_admin","operation_head", "backend_team", "management_team", "branch_manager", "team_leader", "executive"].map(
            (r) => (
              <option key={r} value={r}>
                {r.toUpperCase()}
              </option>
            )
          )}
        </select>
      </div>

      {/* Display Users */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.ID} className="bg-white p-5 border border-blue-100 rounded-xl shadow hover:shadow-lg transition-shadow text-gray-900 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg md:text-xl font-semibold text-blue-700">{user.Name}</h2>
              <span className="text-xs md:text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium uppercase tracking-wide">{user.Role}</span>
            </div>

            {/* Appoint Members */}
            <div className="mt-2">
              <label className="block text-xs md:text-sm font-medium text-blue-700 mb-1">Appoint Members:</label>
              <select
                className="p-2 border border-orange-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                value={selectedMembers[user.ID] || ""}
                onChange={(e) => {
                  setSelectedMembers(prev => ({
                    ...prev,
                    [user.ID]: e.target.value
                  }));
                  handleAppoint(user.ID, e.target.value);
                }}
              >
                <option value="">Select Member</option>
                {allUsers
                  .filter(u => u.Role !== user.Role && !user.AppointedMembers.includes(String(u.ID)))
                  .map(member => (
                    <option key={`user-${user.ID}-member-${member.ID}`} value={member.ID}>
                      {member.Name} ({member.Role})
                    </option>
                  ))}
              </select>
            </div>

            {/* Appointed Members */}
            {user.AppointedMembers.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Appointed Members:</h3>
                <div className="bg-gray-100 p-3 rounded-md">
                  {user.AppointedMembers.map((ID, index) => {
                    const member = allUsersMap[ID];
                    return member ? (
                      <div key={`appointed-${user.ID}-${index}`} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded-md mb-1">
                        <span className="text-sm text-gray-700 flex-1">
                          {member.Name} ({member.Role})
                        </span>
                        <button
                          onClick={() => handleRemoveAppointed(user.ID, ID)}
                          className="ml-2 text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
