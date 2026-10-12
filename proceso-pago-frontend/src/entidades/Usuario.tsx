export type Rol = "Admin" | "Tecnico_RH" | "Contador";

export interface Usuario {
  usuario: string;
  contrasena: string;
  rol: Rol;
}