import { Loader2Icon } from 'lucide-react';

interface SubmitButtonProps {
   loading: boolean;
   text?: string;
   bgColor: { color: string; hover: string };
   type?: 'submit' | 'reset' | 'button';
   onClick?: () => void;
}

export function SubmitButton({ text, loading, bgColor, type, onClick }: SubmitButtonProps) {
   return (
      <button
         type={type}
         className={`flex w-full items-center justify-center rounded-lg ${bgColor.color} py-2 text-white transition-all duration-300 ease-out hover:${bgColor.hover} disabled:cursor-no-drop disabled:opacity-5`}
         disabled={loading}
         onClick={onClick}
      >
         {loading ? <Loader2Icon size={24} className="animate-spin" /> : (text ?? 'Entrar')}
      </button>
   );
}
