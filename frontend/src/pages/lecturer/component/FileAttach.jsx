/**
 * @component FileAttach
 * @description Specialized file uploader for lecture notes and assignments.
 */
export default function FileAttach() {
  return (
    <div className="mt-4 border-2 border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center hover:bg-white/[0.02] cursor-pointer transition-all">
      <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-3">
        <FileText className="text-blue-500" />
      </div>
      <p className="text-sm font-bold">Upload Lecture Notes</p>
      <p className="text-[10px] text-neutral-500 mt-1">
        PDF, DOCX, or PPT (Max 10MB)
      </p>
    </div>
  );
}
