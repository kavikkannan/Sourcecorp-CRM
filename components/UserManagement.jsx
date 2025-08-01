"use client";

import { useState, useEffect } from "react";

export default function UserManagement() {
  const [role, setRole] = useState(""); // Selected role filter
  const [users, setUsers] = useState([]); // Users with selected role
  const [allUsers, setAllUsers] = useState([]); // All appointable users

  // Fetch users based on role
  useEffect(() => {
    const fetchUsers = async () => {
      if (role) {
        try {
          const response = await fetch(`https://sourcecorp.in/api/users/${role}`);

          if (response.ok) {
            const data = await response.json();
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
        const response = await fetch("https://sourcecorp.in/api/all-users");

        if (response.ok) {
          const data = await response.json();
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

  const handleAppoint = async (UserID, AppointedUserID) => {
    if (!AppointedUserID) return;

    try {
      const user = users.find(u => u.ID === UserID);
      if (!user) return;

      const existingMembers = user.AppointedMembers.length > 0 ? user.AppointedMembers.join(",") : "";
      const updatedMembers = existingMembers ? `${existingMembers},${AppointedUserID}` : AppointedUserID;

      const response = await fetch("https://sourcecorp.in/api/appoint", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          UserID: String(UserID), 
          AppointedMembers: updatedMembers 
        }),
      });

      if (response.ok) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.ID === UserID
              ? { ...user, AppointedMembers: [...user.AppointedMembers, AppointedUserID] }
              : user
          )
        );
      } else {
        console.error("Failed to appoint member");
      }
    } catch (error) {
      console.error("Error appointing member:", error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-orange-700 to-purple-900 text-white">
      {/* Role Filter Dropdown */}
      <div className="bg-white p-6 shadow-md rounded-lg mb-6 max-w-lg mx-auto text-gray-900">
        <label className="block text-lg font-semibold mb-2">Filter by Role:</label>
        <select
          className="p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
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
          <div key={user.ID} className="bg-white p-6 border rounded-lg shadow-lg hover:shadow-xl transition-shadow text-gray-900">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">{user.Name}</h2>
              <span className="text-sm px-3 py-1 bg-blue-200 text-blue-700 rounded-full">{user.Role}</span>
            </div>

            {/* Appoint Members */}
            <div className="mt-3">
              <label className="block text-sm font-medium">Appoint Members:</label>
              <select
                className="p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                onChange={(e) => handleAppoint(user.ID, e.target.value)}
              >
                <option value="">Select Member</option>
                {allUsers
                  .filter(u => u.Role !== user.Role)
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
                      <p key={`appointed-${user.ID}-${index}`} className="text-sm text-gray-700">
                        {member.Name} ({member.Role})
                      </p>
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
