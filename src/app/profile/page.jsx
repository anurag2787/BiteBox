"use client";

import React from "react";
import Image from "next/image";
import { useDarkMode } from "../DarkModeContext";
import { UserAuth } from "../context/AuthContext";

function ProfilePage() {
  const { darkMode } = useDarkMode();
  const { user,  logOut } = UserAuth(); 

  const handleSignOut = async () => {
    try {
        await logOut();
        setIsOpen(false);
    } catch (error) {
        console.error("Error signing out: ", error);
    }
};

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-500">Loading user details...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-black text-white" : "bg-white text-gray-800"
      } transition-colors duration-300 flex items-center justify-center px-4 py-8`}
    >
      <div
        className={`w-full max-w-md ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } shadow-xl rounded-2xl overflow-hidden border`}
      >
        <div className="bg-black h-24 relative">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-lg">
              <Image
                src={user.photoURL || "/default-avatar.png"}
                alt="Profile Picture"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="pt-20 text-center">
          <h1
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {user.displayName || "User Profile"}
          </h1>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mt-2`}>
            {user.email}
          </p>

          <div className="mt-8 px-6">
            <div
              className={`${
                darkMode ? "bg-gray-700" : "bg-gray-50"
              } rounded-lg p-4 space-y-4`}
            >
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase">
                  User Details
                </h3>
                {[
                  { label: "Display Name", value: user.displayName || "Not Set" },
                  { label: "Email", value: user.email },
                  {
                    label: "Account Created",
                    value: user.metadata?.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString()
                      : "Unknown",
                  },
                ].map((detail, index) => (
                  <div
                    key={index}
                    className={`mt-2 flex justify-between items-center py-2 ${
                      index < 2 ? "border-b" : ""
                    } ${darkMode ? "border-gray-600" : "border-gray-200"}`}
                  >
                    <span
                      className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {detail.label}
                    </span>
                    <span
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 px-6 pb-8">
            <button
              onClick={handleSignOut}
              className={`w-full py-3 rounded-lg transition-colors duration-300 ${
                darkMode
                  ? "bg-yellow-500 hover:bg-red-800 text-white"
                  : "bg-blue-500 hover:bg-red-600 text-white"
              }`}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
