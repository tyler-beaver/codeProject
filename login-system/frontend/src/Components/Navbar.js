import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ token, setToken }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/");
    setMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setMenuOpen(false);
  };

  // Responsive menu links
  const navLinks = (
    <>
      {!token && (
        <Link
          to="/"
          className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 rounded transition"
          onClick={() => setMenuOpen(false)}
        >
          Home
        </Link>
      )}
      {token && (
        <Link
          to="/dashboard"
          className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 rounded transition"
          onClick={() => setMenuOpen(false)}
        >
          Dashboard
        </Link>
      )}
      {!token && (
        <>
          <Link
            to="/login"
            className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 rounded transition"
            onClick={() => setMenuOpen(false)}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg shadow transition"
            onClick={() => setMenuOpen(false)}
          >
            Sign Up
          </Link>
        </>
      )}
      {token && (
        <>
          <span
            className="inline-flex items-center justify-center ml-2 mr-1 w-9 h-9 rounded-full bg-blue-100 shadow cursor-pointer"
            title="Profile"
            onClick={handleProfileClick}
            tabIndex={0}
            role="button"
            aria-label="Profile"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#2563eb" />
              <circle cx="16" cy="13" r="6" fill="#fff" />
              <ellipse cx="16" cy="24" rx="8" ry="5" fill="#fff" />
            </svg>
          </span>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg shadow transition ml-2"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </>
      )}
    </>
  );

  return (
    <nav className="bg-white border-b border-slate-200 h-16 flex items-center sticky top-0 z-50 shadow-sm rounded-b-xl backdrop-blur">
      <div className="flex justify-between items-center w-full max-w-[1200px] mx-auto px-4 md:px-10">
        <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-gray-900 py-2">
          <span className="text-3xl">🎯</span>
          <span className="tracking-wide">JobTracker</span>
        </Link>
        {/* Desktop links */}
        <div className="hidden md:flex gap-4 items-center">
          {navLinks}
        </div>
        {/* Hamburger menu button */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded bg-blue-100 hover:bg-blue-200 transition"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Open menu"
        >
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg flex flex-col items-center py-4 gap-2 z-40">
          {navLinks}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
