import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.role;
    
    if (role) {
      const timer = setTimeout(() => {
        navigate(`/${role}`, { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role;

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-9xl font-black text-white/5 absolute -z-10">404</h1>
      <h2 className="text-4xl font-bold text-white mb-4 italic">
        Signal Lost.
      </h2>
      <p className="text-neutral-500 mb-8 max-w-sm">
        The page you are looking for has been moved or doesn't exist in our AI
        database.( Ibyo bintu byihorere ntayo wari wakoraa )
      </p>
      <div className="flex gap-4">
        <Link
          to={role ? `/${role}` : "/login"}
          className="bg-blue-600 px-10 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20"
        >
          Return to Dashboard
        </Link>
        {!role && (
          <Link
            to="/login"
            className="bg-white/10 border border-white/20 px-10 py-4 rounded-2xl font-bold hover:bg-white/20 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
      <p className="text-neutral-600 text-sm mt-4">
        Redirecting to your dashboard in 3 seconds...
      </p>
    </div>
  );
}
