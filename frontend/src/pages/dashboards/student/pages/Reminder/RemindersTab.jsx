import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import reminderService from "../../../../../services/reminderService"; // Adjust path as needed

// ─── Design Tokens ──────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  High: {
    label: "High Priority",
    dot: "bg-red-500",
    glow: "shadow-red-500/20",
    border: "border-red-500/20",
    badge: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
    ambient: "from-red-500/5",
  },
  Medium: {
    label: "Medium Priority",
    dot: "bg-amber-400",
    glow: "shadow-amber-400/20",
    border: "border-amber-400/20",
    badge: "bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/20",
    ambient: "from-amber-400/5",
  },
  Low: {
    label: "Low Priority",
    dot: "bg-emerald-400",
    glow: "shadow-emerald-400/20",
    border: "border-emerald-400/20",
    badge: "bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20",
    ambient: "from-emerald-400/5",
  },
};

// ─── Shared Components ──────────────────────────────────────────────────────
const GlassCard = ({ children, className = "", glow = "" }) => (
  <div
    className={`relative rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl shadow-xl ${glow} ${className}`}
  >
    {children}
  </div>
);

const TaskCard = ({ item, priorityKey, index, onDelete, onEdit }) => {
  const config = PRIORITY_CONFIG[priorityKey];
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date();

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Draggable key={item._id} draggableId={item._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <GlassCard
              glow={snapshot.isDragging ? `shadow-xs ${config.glow}` : ""}
              className="p-4 group cursor-grab active:cursor-grabbing transition-all hover:bg-white/[0.05]"
            >
              <div
                className={`absolute -top-6 -left-6 w-24 h-24 rounded-sm bg-gradient-radial ${config.ambient} to-transparent blur-2xl opacity-60 pointer-events-none`}
              />

              <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${config.dot}`}
                  />
                  <h3 className="text-sm font-medium text-zinc-100 truncate">
                    {item.title}
                  </h3>
                </div>
                {/* On mobile devices, opacity-100 might be needed if hover isn't supported, 
                    but sticking strictly to your design here */}
                <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all bg-black/40 md:bg-transparent rounded px-1 md:px-0">
                  {/* Edit Button */}
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1 text-zinc-400 hover:text-blue-400 transition-colors"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => onDelete(priorityKey, item._id)}
                    className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>

              {item.note && (
                <p className="text-xs text-zinc-500 line-clamp-2 mb-3 pl-4 relative z-10">
                  {item.note}
                </p>
              )}

              <div className="flex items-center justify-between pl-4 gap-2 relative z-10">
                <span className="text-[10px] text-zinc-700">
                  {formatDateTime(item.createdAt)}
                </span>
                {item.dueDate && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isOverdue
                        ? "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                        : "bg-white/[0.04] text-zinc-500"
                    }`}
                  >
                    {isOverdue ? "⚠ " : ""}Due {formatDateTime(item.dueDate)}
                  </span>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
};

// ─── Main Tab Component ─────────────────────────────────────────────────────
const RemindersTab = () => {
  const [columns, setColumns] = useState({ High: [], Medium: [], Low: [] });
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [newReminder, setNewReminder] = useState({
    title: "",
    note: "",
    dueDate: "",
    priority: "Low",
  });

  const [editingTask, setEditingTask] = useState(null);

  // Load Data
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await reminderService.getReminders();
      const organized = { High: [], Medium: [], Low: [] };
      data.reminders.forEach((rem) => {
        if (organized[rem.priority]) organized[rem.priority].push(rem);
      });
      setColumns(organized);
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Drag and Drop Logic
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const newCols = { ...columns };
    const [removed] = newCols[source.droppableId].splice(source.index, 1);
    removed.priority = destination.droppableId;
    newCols[destination.droppableId].splice(destination.index, 0, removed);
    setColumns(newCols);

    try {
      await reminderService.updateReminder(draggableId, {
        priority: destination.droppableId,
      });
      if (source.droppableId !== destination.droppableId)
        toast.success(`Moved to ${destination.droppableId}`);
    } catch (err) {
      toast.error("Failed to update database");
      fetchTasks();
    }
  };

  // Add Task
  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newReminder.title || !newReminder.dueDate)
      return toast.error("Title and Date are required");

    try {
      const response = await reminderService.createReminder(newReminder);
      const savedTask = response.reminder;
      setColumns((prev) => ({
        ...prev,
        [savedTask.priority]: [savedTask, ...prev[savedTask.priority]],
      }));
      setIsModalOpen(false);
      setNewReminder({ title: "", note: "", dueDate: "", priority: "Low" });
      toast.success("Task Created");
    } catch (err) {
      toast.error("Failed to save task");
    }
  };

  // Update Task
  const handleUpdateReminder = async (e) => {
    e.preventDefault();
    try {
      await reminderService.updateReminder(editingTask._id, editingTask);
      toast.success("Task Updated");
      setIsEditModalOpen(false);
      fetchTasks(); // Refresh list to ensure correct ordering/columns
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const deleteReminder = async (col, id) => {
    try {
      await reminderService.deleteReminder(id);
      setColumns((prev) => ({
        ...prev,
        [col]: prev[col].filter((r) => r._id !== id),
      }));
      toast.success("Task Deleted");
    } catch (err) {
      toast.error("Could not delete from server");
    }
  };

  const openEditModal = (task) => {
    // Format date for datetime-local input (YYYY-MM-DDThh:mm)
    const formattedDate = task.dueDate
      ? new Date(task.dueDate).toISOString().slice(0, 16)
      : "";
    setEditingTask({ ...task, dueDate: formattedDate });
    setIsEditModalOpen(true);
  };

  if (loading)
    return (
      <div className="ml-20 md:ml-72 p-4 md:p-8 text-zinc-500 animate-pulse transition-all duration-300">
        Synchronizing with database...
      </div>
    );

  return (
    <div className="relative min-h-screen bg-[#000000] text-white ml-20 md:ml-72 transition-all duration-300 overflow-hidden">
      <Toaster position="bottom-right" />

      <div className="relative z-10 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Reminders
            </h1>
            <p className="text-xs md:text-sm text-zinc-600 mt-0.5 md:mt-1">
              Real-time synchronization ensures your reminders stay up to date.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium bg-white text-black hover:bg-zinc-200 transition-all shadow-lg shadow-white/5 w-full sm:w-auto justify-center"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Task
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {Object.keys(columns).map((priorityKey) => (
              <div key={priorityKey} className="flex flex-col gap-3">
                <GlassCard className="px-4 py-3 flex items-center justify-between sticky top-0 z-20">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[priorityKey].dot}`}
                    />
                    <span className="text-xs font-semibold text-zinc-300">
                      {PRIORITY_CONFIG[priorityKey].label}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_CONFIG[priorityKey].badge}`}
                  >
                    {columns[priorityKey].length}
                  </span>
                </GlassCard>

                <Droppable droppableId={priorityKey}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-[5px] lg:min-h-[500px] space-y-3 p-2 rounded-xl border transition-all ${
                        snapshot.isDraggingOver
                          ? "border-white/10 bg-white/[0.02]"
                          : "border-transparent"
                      }`}
                    >
                      <AnimatePresence>
                        {columns[priorityKey].map((item, index) => (
                          <TaskCard
                            key={item._id}
                            item={item}
                            priorityKey={priorityKey}
                            index={index}
                            onDelete={deleteReminder}
                            onEdit={openEditModal}
                          />
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* New Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm sm:pl-20 md:pl-72"
            onClick={(e) =>
              e.target === e.currentTarget && setIsModalOpen(false)
            }
          >
            <motion.div
              initial={{ scale: 0.96, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 16, opacity: 0 }}
              className="w-full max-w-md"
            >
              <GlassCard className="w-full p-6 bg-[#0a0a0a]/95 border-white/10">
                <h2 className="text-base font-semibold mb-6">New Task</h2>
                <form onSubmit={handleAddReminder} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Task title"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3.5 py-2.5 text-sm outline-none focus:border-white/20 transition-all"
                    value={newReminder.title}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, title: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Add notes..."
                    rows={3}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3.5 py-2.5 text-sm outline-none focus:border-white/20 transition-all resize-none"
                    value={newReminder.note}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, note: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="datetime-local"
                      className="bg-white/[0.03] border border-white/[0.08] rounded-md px-3 py-2.5 text-sm [color-scheme:dark] w-full"
                      value={newReminder.dueDate}
                      onChange={(e) =>
                        setNewReminder({
                          ...newReminder,
                          dueDate: e.target.value,
                        })
                      }
                    />
                    <select
                      className="bg-white/[0.03] border border-white/[0.08] rounded-md px-3 py-2.5 text-sm [color-scheme:dark] w-full"
                      value={newReminder.priority}
                      onChange={(e) =>
                        setNewReminder({
                          ...newReminder,
                          priority: e.target.value,
                        })
                      }
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 border border-white/[0.08] text-zinc-400 py-2.5 rounded-md text-sm hover:text-white transition-all order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-white text-black py-2.5 rounded-md text-sm font-semibold hover:bg-zinc-200 transition-all order-1 sm:order-2"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Task Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm sm:pl-20 md:pl-72"
            onClick={(e) =>
              e.target === e.currentTarget && setIsEditModalOpen(false)
            }
          >
            <motion.div
              initial={{ scale: 0.96, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 16, opacity: 0 }}
              className="w-full max-w-md"
            >
              <GlassCard className="w-full p-6 bg-[#0a0a0a]/95 border-white/10">
                <h2 className="text-base font-semibold mb-6">Update Task</h2>
                <form onSubmit={handleUpdateReminder} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Task title"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3.5 py-2.5 text-sm outline-none focus:border-white/20 transition-all"
                    value={editingTask.title}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, title: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Add notes..."
                    rows={3}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3.5 py-2.5 text-sm outline-none focus:border-white/20 transition-all resize-none"
                    value={editingTask.note}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, note: e.target.value })
                    }
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="datetime-local"
                      className="bg-white/[0.03] border border-white/[0.08] rounded-md px-3 py-2.5 text-sm [color-scheme:dark] w-full"
                      value={editingTask.dueDate}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          dueDate: e.target.value,
                        })
                      }
                    />
                    <select
                      className="bg-white/[0.03] border border-white/[0.08] rounded-md px-3 py-2.5 text-sm [color-scheme:dark] w-full"
                      value={editingTask.priority}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          priority: e.target.value,
                        })
                      }
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 border border-white/[0.08] text-zinc-400 py-2.5 rounded-md text-sm hover:text-white transition-all order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-white text-black py-2.5 rounded-md text-sm font-semibold hover:bg-zinc-200 transition-all order-1 sm:order-2"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RemindersTab;
