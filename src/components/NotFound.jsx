import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-16 h-16 text-red-600 mb-4"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.79 2h16.42a2 2 0 0 0 1.79-2L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>

      <h1 className="text-2xl font-bold text-center mb-1 text-gray-800">
        404! Not Found
      </h1>

      <h2 className="text-xl text-center mb-8 text-gray-600">
        Redirect to{" "}
        <Link to="/" className="text-blue-600 underline">
          Home
        </Link>
      </h2>
    </div>
  );
};

export default NotFound;
