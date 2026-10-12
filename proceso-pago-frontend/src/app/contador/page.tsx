import { LogoutButton } from "@/components/LogoutButton"

export default function ContadorPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Panel Contador</h1>
        <LogoutButton />
      </div>
      <p>Bienvenido, Contador.</p>
    </div>
  );
}