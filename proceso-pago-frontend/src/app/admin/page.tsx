import { LogoutButton } from "@/components/LogoutButton";
import LanguageSelector from "@/components/SelectorIdioma";

export default function AdminPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Panel Admin</h1>
        <div className="flex items-center gap-3">
          <LanguageSelector /> 
          <LogoutButton />
        </div>
      </div>
      <p>Bienvenido, Administrador.</p>
    </>
  );
}
