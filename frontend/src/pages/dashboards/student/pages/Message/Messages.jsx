import { MessageSquare } from "lucide-react";

const MessagesTab = () => (
  // flex, justify-center, and items-center handle the perfect vertical & horizontal centering. 
  // h-full and min-h-[400px] ensure the div takes up enough space to center within.
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full p-5 text-center">
    <MessageSquare size={48} className="text-neutral-600 mb-4" />
    <h2 className="text-[22px] font-extrabold text-slate-100">
      Messages
    </h2>
    <p className="text-gray-500 mt-2">
      Your conversations will appear here.
    </p>
  </div>
);

export default MessagesTab;