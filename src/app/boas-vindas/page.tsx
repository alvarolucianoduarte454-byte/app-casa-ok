'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Star, Zap, Home } from 'lucide-react'

export default function BoasVindasPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex flex-col">
      {/* Header */}
      <header className="w-full p-4 flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2 text-teal-700 font-bold text-lg">
          <Home className="w-6 h-6" />
          Casa OK
        </Link>
      </header>

      {/* Conteúdo principal */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-teal-600" />
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-800">
              Bem-vindo à Casa OK! 🎉
            </CardTitle>
            
            <CardDescription className="text-gray-600 text-base">
              Sua conta foi criada com sucesso! Agora você pode escolher como deseja continuar:
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Opção 1: Assinar plano */}
            <Card className="border-2 border-teal-200 bg-teal-50/50 hover:bg-teal-50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Assinar um plano agora
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Acesso completo a todos os serviços de manutenção, suporte prioritário e muito mais.
                    </p>
                    <Button 
                      onClick={() => router.push('/planos')}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium"
                    >
                      Ver planos disponíveis
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opção 2: Usar sem assinar */}
            <Card className="border border-gray-200 bg-white/50 hover:bg-white/70 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Usar sem assinar
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Explore o dashboard básico e conheça nossos serviços. Você pode assinar depois.
                    </p>
                    <Button 
                      onClick={() => router.push('/dashboard?v=2')}
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Continuar no modo básico
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações adicionais */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Você pode alterar sua escolha a qualquer momento nas configurações da sua conta.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer simples */}
      <footer className="p-4 text-center">
        <p className="text-sm text-gray-500">
          Precisa de ajuda?{' '}
          <Link href="/contato" className="text-teal-600 hover:text-teal-700">
            Entre em contato
          </Link>
        </p>
      </footer>
    </div>
  )
}