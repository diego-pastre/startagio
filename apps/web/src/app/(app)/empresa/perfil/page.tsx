import type { Metadata } from "next";
import { EmpresaPerfil } from "./empresa-perfil";

export const metadata: Metadata = { title: "Dados da empresa" };

export default function EmpresaPerfilPage() {
  return <EmpresaPerfil />;
}
