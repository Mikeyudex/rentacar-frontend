import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Iniciar Sesión - Sistema ERP",
  description: "Accede al sistema de gestión empresarial",
}

export default function LoginPage() {
  return <LoginForm />
}
