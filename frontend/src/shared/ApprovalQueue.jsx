import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import apiClient from "../../services/apiClient"; //

export default function ApprovalQueue() {
  const [pendingPulses, setPendingPulses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // map actions to human-readable verbs [loading, success]
  const actionVerbs = {
    approve: ["Accepting", "Accepted"],
    reject: ["Rejecting", "Rejected"],
  };

  // 1. Fetch pulses scoped to the Dean/Principal's domain
  const fetchPending = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/events/approvals/pending"); //
      setPendingPulses(data.pulses || []);
    } catch (error) {
      toast.error("Failed to load approval queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // 2. Acceptance Logic
  const handleAction = async (pulseId, action) => {
    // avoid duplicate requests for same item
    if (processingId === pulseId) return;
    setProcessingId(pulseId);

    const [loadingVerb, successVerb] = actionVerbs[action] || [
      "Processing",
      "Done",
    ];
    const toastId = toast.loading(`${loadingVerb} pulse...`);
    try {
      await apiClient.post(`/events/approvals/${pulseId}`, { action }); //
      setPendingPulses((prev) => prev.filter((p) => p._id !== pulseId));
      toast.success(`Pulse ${successVerb} successfully`, { id: toastId });
    } catch (error) {
      toast.error("Process failed", { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading)
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" />
      </div>
    );

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Clock className="text-yellow-500" /> Pending Approvals
        </h2>
        <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-black">
          {pendingPulses.length} REQUESTS
        </span>
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {pendingPulses.map((pulse) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={pulse._id}
              className="glass p-6 rounded-[32px] border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
                      {pulse.priority} Priority
                    </span>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">
                      From: {pulse.requestedBy?.name} ({pulse.requestedBy?.role}
                      )
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {pulse.title}
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">
                    {pulse.description}
                  </p>
                </div>

                <div className="flex md:flex-col gap-2 justify-center">
                  <button
                    onClick={() => handleAction(pulse._id, "approve")}
                    disabled={processingId === pulse._id}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 size={18} /> Accept
                  </button>
                  <button
                    onClick={() => handleAction(pulse._id, "reject")}
                    disabled={processingId === pulse._id}
                    className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all border border-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {pendingPulses.length === 0 && (
          <div className="glass p-12 rounded-[40px] border border-white/5 text-center">
            <ShieldAlert className="mx-auto text-neutral-600 mb-4" size={48} />
            <p className="text-neutral-500 font-medium">
              Your approval queue is currently empty.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
