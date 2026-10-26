import { LogoutButton } from "@/components/LogoutButton";
import LanguageSelector from "@/components/SelectorIdioma";

export default function RRHHPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Panel Contador</h1>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <LogoutButton />
        </div>
      </div>
      <p>Bienvenido, Contador.</p>
    </div>
  );
}