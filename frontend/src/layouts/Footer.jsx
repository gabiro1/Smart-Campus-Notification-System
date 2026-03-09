import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-white/5 pt-20 pb-10 px-20 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            {/* <div className="w-6 h-6 bg-blue-600 rounded-md" /> */}
            <span className="text-lg text-white font-bold">UniNotify AI</span>
          </div>
          <p className="text-neutral-500 max-w-sm mb-6">
            Revolutionizing campus communication through targeted AI
            notifications at the University of Rwanda.
          </p>
          <div className="flex gap-4">
            <Github
              className="text-neutral-600 hover:text-white cursor-pointer"
              size={20}
            />
            <Twitter
              className="text-neutral-600 hover:text-white cursor-pointer"
              size={20}
            />
            <Linkedin
              className="text-neutral-600 hover:text-white cursor-pointer"
              size={20}
            />
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-white">Platform</h4>
          <ul className="space-y-4 text-sm text-neutral-500">
            <li className="hover:text-white cursor-pointer">Student App</li>
            <li className=" hover:text-white cursor-pointer">
              Admin Dashboard
            </li>
            <li className=" hover:text-white cursor-pointer">AI Engine</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-white">Support</h4>
          <ul className="space-y-4 text-sm text-neutral-500">
            <li className="hover:text-white cursor-pointer">About Us</li>
            <li className="hover:text-white cursor-pointer">Help Center</li>
            <li className="hover:text-white  cursor-pointer">Privacy Policy</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-xs text-neutral-700">
        © 2026 UniNotify AI. Developed by Gabiro Jovial Fleuron. Final Year
        Project.
      </div>
    </footer>
  );
}
