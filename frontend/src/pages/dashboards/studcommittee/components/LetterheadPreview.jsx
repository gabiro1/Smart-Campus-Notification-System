/**
 * @component LetterheadPreview
 * @description Generates a formal look for official student government memos.
 */
export default function LetterheadPreview({ title, content, role }) {
  return (
    <div className="bg-white p-10 text-black font-serif shadow-2xl rounded-sm max-w-lg mx-auto transform scale-75 origin-top">
      <div className="border-b-2 border-black pb-4 mb-6 text-center">
        <h2 className="text-xl font-bold uppercase">University of Rwanda</h2>
        <p className="text-sm italic">
          Student Committee: Office of the {role}
        </p>
      </div>
      <h3 className="text-lg font-bold underline mb-4">{title}</h3>
      <p className="text-sm leading-relaxed mb-10">{content}</p>
      <div className="mt-20 border-t border-black pt-2 w-40">
        <p className="text-xs font-bold italic">Digital Signature</p>
        <p className="text-[10px] uppercase">Verified {role}</p>
      </div>
    </div>
  );
}
