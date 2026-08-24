import { Hero } from "@/features/auth/components/login/hero";
import { LoginForm } from "@/features/auth/components/login/loginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <Hero />
      <LoginForm />
    </main>
  );
}
