import { Loader2Icon } from "lucide-react";

export function SubmitButton({ loading, bgColor, type, onClick }: { loading: boolean, bgColor: { color: string, hover: string }, type: "submit" | "reset" | "button" | undefined, onClick: () => void }) {
   return (
      <button
         type={type}
         className={`w-full rounded-lg flex items-center justify-center ${bgColor.color} py-2 text-white transition-all duration-300 ease-out hover:${bgColor.hover}`}
         disabled={loading}
         onClick={onClick}
      >
         {loading ? (
            <Loader2Icon size={24} className="animate-spin" />
         ) : (
            'Entrar'
         )}
      </button>
   )
}
