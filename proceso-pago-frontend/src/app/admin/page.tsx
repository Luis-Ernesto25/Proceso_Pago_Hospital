import { LogoutButton } from "@/components/LogoutButton"

export default function AdminPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Panel Admin</h1>
        <LogoutButton />
      </div>
      <p>Bienvenido, Administrador.</p>
    </>
  );
}