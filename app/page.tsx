import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">Sistema de Gerenciamento de Times de Futebol</h1>

        <div className="grid gap-6 text-center">
          <p className="text-xl">
            Bem-vindo ao sistema de gerenciamento de times de futebol. Aqui você pode adicionar, visualizar, editar e
            remover times.
          </p>

          <div className="flex justify-center mt-6">
            <Link href="/teams">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Ver Times
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

