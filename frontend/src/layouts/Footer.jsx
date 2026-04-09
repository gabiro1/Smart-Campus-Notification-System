import { Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-20 pb-10 px-20 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            {/* <div className="w-6 h-6 bg-blue-600 rounded-md" /> */}
            <span className="text-lg text-foreground font-bold">UniNotify AI</span>
          </div>
          <p className="text-muted-foreground max-w-sm mb-6">
            Revolutionizing campus communication through targeted AI
            notifications at the University of Rwanda.
          </p>
          <div className="flex gap-4">
            <Github
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              size={20}
            />
            <Twitter
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              size={20}
            />
            <Linkedin
              className="text-muted-foreground hover:text-foreground cursor-pointer"
              size={20}
            />
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-foreground">Platform</h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="hover:text-foreground cursor-pointer">Student App</li>
            <li className=" hover:text-foreground cursor-pointer">
              Admin Dashboard
            </li>
            <li className=" hover:text-foreground cursor-pointer">AI Engine</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-foreground">Support</h4>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="hover:text-foreground cursor-pointer">About Us</li>
            <li className="hover:text-foreground cursor-pointer">Help Center</li>
            <li className="hover:text-foreground  cursor-pointer">Privacy Policy</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-border text-center text-xs text-muted-foreground">
        © 2026 UniNotify AI. Developed by Gabiro Jovial Fleuron. Final Year
        Project.
      </div>
    </footer>
  );
}
