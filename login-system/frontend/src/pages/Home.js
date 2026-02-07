
import React from "react";
import { useNavigate } from "react-router-dom";

function Home({ token }) {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (token) {
      navigate("/dashboard");
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirect_to");
    if (redirectTo && redirectTo.endsWith("/email-confirmed")) {
      navigate("/email-confirmed", { replace: true });
    }
  }, [token, navigate]);

  const handleGetStarted = () => {
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="w-full bg-white font-sans">
      <section className="flex flex-col md:flex-row items-center justify-between max-w-[1400px] mx-auto py-16 px-4 md:py-24 md:px-8 gap-8 md:gap-16">
        <div className="flex-1">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-5 leading-tight bg-gradient-to-r from-slate-900 to-blue-500 bg-clip-text text-transparent">
            Job Search, Simplified
          </h1>
          <p className="text-base md:text-lg text-slate-600 mb-8 leading-relaxed max-w-md font-normal">
            Track, organize, and win your next job. All your applications, notes, and reminders in one beautiful, easy-to-use dashboard.
          </p>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow transition mb-2"
            onClick={handleGetStarted}
          >
            {token ? "Go to Dashboard" : "Get Started Free"}
          </button>
        </div>
        {/* Features Section */}
        <div className="flex-1 flex flex-col gap-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-100 p-6 rounded-lg shadow flex flex-col items-center">
              <span className="text-3xl mb-2">📋</span>
              <h3 className="text-lg font-semibold mb-1">Application Tracker</h3>
              <p className="text-sm text-slate-600">Easily track all your job applications in one place.</p>
            </div>
            <div className="bg-slate-100 p-6 rounded-lg shadow flex flex-col items-center">
              <span className="text-3xl mb-2">📝</span>
              <h3 className="text-lg font-semibold mb-1">Notes & Reminders</h3>
              <p className="text-sm text-slate-600">Keep notes and set reminders for interviews and follow-ups.</p>
            </div>
            <div className="bg-slate-100 p-6 rounded-lg shadow flex flex-col items-center">
              <span className="text-3xl mb-2">📈</span>
              <h3 className="text-lg font-semibold mb-1">Progress Insights</h3>
              <p className="text-sm text-slate-600">Visualize your job search progress and stay motivated.</p>
            </div>
            <div className="bg-slate-100 p-6 rounded-lg shadow flex flex-col items-center">
              <span className="text-3xl mb-2">🔒</span>
              <h3 className="text-lg font-semibold mb-1">Secure & Private</h3>
              <p className="text-sm text-slate-600">Your data is safe, secure, and private.</p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="w-full bg-blue-50 py-12 px-4 md:px-8 flex flex-col items-center">
        <h2 className="text-2xl md:text-4xl font-bold text-blue-700 mb-4">Ready to get started?</h2>
        <p className="text-base md:text-lg text-blue-600 mb-6">Create your free account and start organizing your job search today.</p>
        <button
          className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg shadow transition"
          onClick={handleGetStarted}
        >
          {token ? "Go to Dashboard" : "Get Started Free"}
        </button>
      </section>
    </div>
  );
}

export default Home;
