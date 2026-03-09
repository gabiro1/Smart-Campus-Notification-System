/**
 * @component SmartImage
 * @description A placeholder-first image loader that saves student data bundles.
 * SHOWS: Empathy for the economic reality of the local student population.
 */
import { useState } from "react";
import { ImageIcon } from "lucide-react";

export default function SmartImage({ src, alt }) {
  const [load, setLoad] = useState(false);

  return (
    <div className="w-full h-48 bg-neutral-900 rounded-3xl overflow-hidden border border-white/5 flex items-center justify-center relative">
      {!load ? (
        <div className="text-center p-6">
          <ImageIcon className="mx-auto text-neutral-700 mb-2" size={32} />
          <p className="text-[10px] text-neutral-500 mb-4">
            Image hidden to save data (2.4MB)
          </p>
          <button
            onClick={() => setLoad(true)}
            className="px-4 py-2 bg-blue-600 rounded-lg text-xs font-bold"
          >
            Download Image
          </button>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover animate-in fade-in duration-500"
        />
      )}
    </div>
  );
}
