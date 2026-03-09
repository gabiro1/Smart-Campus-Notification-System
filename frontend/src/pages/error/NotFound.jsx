import { Link } from "react-router-dom";

export default function NotFound() {
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
      <Link
        to="/"
        className="bg-blue-600 px-10 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20"
      >
        Return Home
      </Link>
    </div>
  );
}
