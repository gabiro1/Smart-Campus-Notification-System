import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Search,
  User as UserIcon,
  Paperclip,
  FileText,
  X,
  BarChart2,
  Download,
  Image as ImageIcon,
  CheckCheck,
  Clock,
  Plus,
  ShieldCheck,
  MoreVertical,
  ChevronLeft,
} from "lucide-react";
import messageService from "../../services/messageService";
import { toast } from "react-hot-toast";

const MessagesTab = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // --- POLL STATE ---
  const [showPollMenu, setShowPollMenu] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await messageService.getContacts();
        setContacts(data);
      } catch (err) {
        toast.error("Failed to sync contacts");
      }
    };
    fetchContacts();
  }, []);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setLoading(true);
    try {
      const data = await messageService.getMessages(user._id);
      setMessages(data);
    } catch (err) {
      toast.error("Error loading history");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelection = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024)
      return toast.error("File exceeds 10MB limit");

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    if (selectedUser) setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleVote = async (messageId, optionIndex) => {
    try {
      const updatedMessage = await messageService.voteOnPoll(
        messageId,
        optionIndex,
      );
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? updatedMessage : msg)),
      );
    } catch (error) {
      toast.error("Failed to register vote");
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!selectedUser || (!newMessage.trim() && !selectedFile)) return;

    setSending(true);
    try {
      const payload = {
        receiverId: selectedUser._id,
        content: newMessage,
        file: selectedFile,
        messageType: selectedFile
          ? selectedFile.type.startsWith("image/")
            ? "image"
            : "document"
          : "text",
      };

      const result = await messageService.sendMessage(payload);
      setMessages((prev) => [...prev, result]);

      setNewMessage("");
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      toast.error("Message not delivered");
    } finally {
      setSending(false);
    }
  };

  const handleLaunchPoll = async () => {
    if (!pollQuestion.trim() || pollOptions.some((opt) => !opt.trim())) {
      return toast.error("Please fill the poll question and all options");
    }

    setSending(true);
    try {
      const payload = {
        receiverId: selectedUser._id,
        messageType: "poll",
        poll: {
          question: pollQuestion,
          options: pollOptions.map((text) => ({ text, voters: [] })),
        },
      };

      const result = await messageService.sendMessage(payload);
      setMessages((prev) => [...prev, result]);

      setShowPollMenu(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
    } catch (err) {
      toast.error("Failed to launch poll");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-full w-full p-4 md:p-6 gap-4 md:gap-6 font-sans overflow-hidden bg-black">
      {/* ---------------- SIDEBAR: CONTACTS ---------------- */}
      <div
        className={`w-full lg:w-80 xl:w-96 shrink-0 bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-3xl flex-col shadow-2xl relative overflow-hidden transition-all duration-300 ${
          selectedUser ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none"></div>

        <div className="p-6 border-b border-white/5 relative z-10">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400 mb-4 tracking-tight">
            Messages
          </h2>
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-blue-400 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search directory..."
              className="w-full bg-[#141414] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full relative z-10">
          {contacts.map((c) => (
            <button
              key={c._id}
              onClick={() => handleSelectUser(c)}
              className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 border ${
                selectedUser?._id === c._id
                  ? "bg-gradient-to-r from-blue-600/20 to-purple-600/10 border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                  : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
              }`}
            >
              <div className="relative shrink-0">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${
                    selectedUser?._id === c._id
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {c.name.charAt(0)}
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0A0A0A] rounded-full"></div>
              </div>

              <div className="text-left flex-1 min-w-0">
                <p
                  className={`text-sm font-bold truncate ${
                    selectedUser?._id === c._id
                      ? "text-white"
                      : "text-neutral-300"
                  }`}
                >
                  {c.name}
                </p>
                <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mt-0.5">
                  {c.role}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- CHAT WINDOW ---------------- */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex-1 min-w-0 flex-col bg-[#0A0A0A]/90 backdrop-blur-xl border rounded-3xl overflow-hidden relative shadow-2xl transition-all duration-300 ${
          !selectedUser ? "hidden lg:flex" : "flex"
        } ${
          isDragging
            ? "border-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.2)] scale-[0.99]"
            : "border-white/10"
        }`}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-blue-900/20 backdrop-blur-sm flex flex-col items-center justify-center border-2 border-dashed border-blue-500 m-4 rounded-2xl pointer-events-none">
            <div className="bg-blue-600 p-5 rounded-full mb-4 shadow-[0_0_30px_rgba(37,99,235,0.5)] animate-bounce">
              <Paperclip size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Drop to Share
            </h2>
            <p className="text-blue-300 mt-2">
              Instantly send to {selectedUser?.name}
            </p>
          </div>
        )}

        {selectedUser ? (
          <>
            <div className="px-6 py-4 border-b border-white/10 bg-white/[0.01] flex items-center justify-between z-10 backdrop-blur-md">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="lg:hidden p-2 -ml-2 shrink-0 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-blue-400 border border-white/5 shadow-inner">
                  <UserIcon size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg text-white font-bold tracking-tight truncate">
                    {selectedUser.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck
                      size={12}
                      className="text-green-500 shrink-0"
                    />
                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold truncate">
                      End-to-End Encrypted
                    </span>
                  </div>
                </div>
              </div>
              <button className="p-2 shrink-0 text-neutral-500 hover:text-white transition-colors rounded-full hover:bg-white/10">
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-95">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-neutral-500 text-sm font-medium animate-pulse">
                    Decrypting conversation...
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                    <MessageSquare size={24} className="text-blue-400" />
                  </div>
                  <p className="text-neutral-400 font-medium">
                    This is the start of your secure chat.
                  </p>
                  <p className="text-xs text-neutral-600 mt-1">
                    Say hello or drop a file.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId !== selectedUser._id;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                    >
                      <div
                        className={`max-w-[75%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-lg relative ${
                          isMe
                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm"
                            : "bg-[#1A1A1A] text-neutral-200 border border-white/5 rounded-tl-sm"
                        }`}
                      >
                        {msg.messageType === "poll" && (
                          <div className="mb-3 space-y-3 min-w-[240px]">
                            <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
                              <div className="p-1.5 bg-white/10 rounded-md shrink-0">
                                <BarChart2
                                  size={16}
                                  className={
                                    isMe ? "text-white" : "text-blue-400"
                                  }
                                />
                              </div>
                              <p className="font-bold text-sm">
                                {msg.poll.question}
                              </p>
                            </div>
                            {msg.poll.options.map((opt, index) => {
                              const totalVotes = msg.poll.options.reduce(
                                (acc, curr) => acc + (curr.voters?.length || 0),
                                0,
                              );
                              const percentage =
                                totalVotes === 0
                                  ? 0
                                  : Math.round(
                                      ((opt.voters?.length || 0) / totalVotes) *
                                        100,
                                    );

                              return (
                                <button
                                  key={index}
                                  onClick={() => handleVote(msg._id, index)}
                                  className={`w-full relative overflow-hidden text-left p-3 rounded-xl border transition-all flex justify-between items-center group/btn ${
                                    isMe
                                      ? "bg-black/20 border-white/10 hover:bg-black/30"
                                      : "bg-black/40 border-white/5 hover:border-blue-500/50"
                                  }`}
                                >
                                  <div
                                    className={`absolute left-0 top-0 bottom-0 opacity-20 transition-all duration-500 ${
                                      isMe ? "bg-white" : "bg-blue-500"
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                  <span className="relative z-10 text-xs font-medium truncate pr-2">
                                    {opt.text}
                                  </span>
                                  <div className="relative z-10 flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] opacity-70">
                                      {percentage}%
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                                        isMe ? "bg-white/20" : "bg-white/10"
                                      }`}
                                    >
                                      {opt.voters?.length || 0}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {msg.file && (
                          <a
                            href={msg.file.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`block mb-3 p-3 rounded-xl flex items-center gap-3 border transition-all ${
                              isMe
                                ? "bg-black/20 border-white/10 hover:bg-black/30"
                                : "bg-black/30 border-white/5 hover:border-white/20"
                            }`}
                          >
                            <div
                              className={`p-2 shrink-0 rounded-lg ${
                                msg.file.mimeType?.startsWith("image/")
                                  ? "bg-purple-500/20 text-purple-300"
                                  : "bg-blue-500/20 text-blue-300"
                              }`}
                            >
                              {msg.file.mimeType?.startsWith("image/") ? (
                                <ImageIcon size={20} />
                              ) : (
                                <FileText size={20} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">
                                {msg.file.name}
                              </p>
                              <p className="text-[10px] opacity-60 uppercase tracking-wider mt-0.5">
                                {(msg.file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <Download
                              size={16}
                              className="opacity-50 group-hover:opacity-100 transition-opacity shrink-0"
                            />
                          </a>
                        )}

                        <p className="break-words">{msg.content}</p>

                        <div
                          className={`flex items-center justify-end gap-1 mt-2 text-[10px] font-medium ${
                            isMe ? "text-blue-200" : "text-neutral-500"
                          }`}
                        >
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isMe && <CheckCheck size={12} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {showPollMenu && (
              <div className="absolute bottom-24 left-6 right-6 lg:left-1/4 lg:right-1/4 bg-[#1A1A1A]/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 animate-in slide-in-from-bottom-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-white">
                    <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-md">
                      <BarChart2 size={16} />
                    </div>
                    <h4 className="text-sm font-bold tracking-wide">
                      Create Poll
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowPollMenu(false)}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={16} className="text-neutral-400" />
                  </button>
                </div>

                <input
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full bg-[#0A0A0A] border border-white/10 p-3 rounded-xl text-sm text-white mb-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-600"
                />

                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar mb-4">
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-6 text-center text-xs text-neutral-600 font-bold">
                        {i + 1}
                      </div>
                      <input
                        value={opt}
                        onChange={(e) => {
                          const n = [...pollOptions];
                          n[i] = e.target.value;
                          setPollOptions(n);
                        }}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 min-w-0 bg-[#0A0A0A] border border-white/5 p-2.5 rounded-lg text-sm text-white outline-none focus:border-white/20 transition-all"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    className="flex items-center justify-center gap-2 bg-white/5 py-2.5 rounded-xl text-xs font-semibold text-white flex-1 hover:bg-white/10 transition-colors"
                  >
                    <Plus size={14} /> Add Option
                  </button>
                  <button
                    onClick={handleLaunchPoll}
                    disabled={sending}
                    className="bg-blue-600 py-2.5 rounded-xl text-xs font-bold text-white flex-1 hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    Launch Poll
                  </button>
                </div>
              </div>
            )}

            {(selectedFile || previewUrl) && (
              <div className="px-6 py-4 bg-[#141414] border-t border-white/5 flex items-end gap-4 animate-in slide-in-from-bottom-2">
                {previewUrl ? (
                  <div className="relative group shrink-0">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-xl border border-white/10 shadow-lg"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute -top-2 -right-2 bg-neutral-800 border border-white/10 text-white p-1 rounded-full shadow-lg hover:bg-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 max-w-sm">
                    <FileText className="text-blue-400 shrink-0" size={24} />
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-xs text-white font-bold truncate">
                        {selectedFile?.name}
                      </p>
                      <p className="text-[10px] text-blue-400 uppercase font-semibold mt-0.5">
                        {(selectedFile?.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-1 shrink-0 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X
                        size={16}
                        className="text-neutral-400 hover:text-white"
                      />
                    </button>
                  </div>
                )}
              </div>
            )}

            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-[#0A0A0A] border-t border-white/10 flex gap-3 items-end z-10 relative"
            >
              <div className="flex shrink-0 bg-[#141414] border border-white/10 rounded-2xl p-1 shadow-inner h-12">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => handleFileSelection(e.target.files[0])}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  <Paperclip size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPollMenu(!showPollMenu)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                    showPollMenu
                      ? "text-blue-400 bg-blue-500/10"
                      : "text-neutral-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <BarChart2 size={20} />
                </button>
              </div>

              <div className="flex-1 bg-[#141414] border border-white/10 rounded-2xl relative shadow-inner flex items-center h-12 min-w-0">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write a secure message..."
                  className="w-full bg-transparent px-4 py-3 text-[15px] text-white outline-none placeholder:text-neutral-600"
                />
              </div>

              <button
                type="submit"
                disabled={sending || (!newMessage.trim() && !selectedFile)}
                className="w-12 h-12 shrink-0 flex items-center justify-center bg-blue-600 rounded-2xl text-white disabled:opacity-30 disabled:hover:shadow-none hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-0.5"
              >
                {sending ? (
                  <Clock className="animate-spin" size={20} />
                ) : (
                  <Send size={20} className="ml-1" />
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10 w-28 h-28 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-[inset_0_4px_20px_rgba(255,255,255,0.05)]">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center animate-pulse">
                <MessageSquare size={32} className="text-blue-400" />
              </div>
            </div>
            <h3 className="relative z-10 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500 mb-4 tracking-tight">
              Your Virtual Office
            </h3>
            <p className="relative z-10 text-[15px] text-neutral-400 max-w-md leading-relaxed">
              Select an official from the directory to initiate a secure,
              end-to-end encrypted session. Share documents, create live polls,
              and collaborate seamlessly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesTab;
