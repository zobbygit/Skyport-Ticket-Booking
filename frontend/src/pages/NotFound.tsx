import { Link } from "react-router-dom";
import { PlaneTakeoff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <PlaneTakeoff size={40} className="text-slate-300" />
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-slate-400">Looks like this route took off without you.</p>
      <Link to="/" className="btn-primary mt-2">Back home</Link>
    </div>
  );
}
