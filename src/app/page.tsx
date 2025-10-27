'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { 
  Home, 
  Check, 
  User, 
  Building2, 
  Wrench, 
  Shield,
  Star,
  MessageCircle,
  Download,
  Smartphone,
  ExternalLink
} from 'lucide-react'
import { PLANOS_CASA_OK } from '@/lib/constants'
import { signOutUser } from '@/lib/authClient'

export default function CasaOKApp() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'home' | 'planos'>('home')
  const [showInstallPrompt, setShowInstallPrompt] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  // Monitorar estado de autenticação
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        // Buscar role do usuário no Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'cliente')
          } else {
            setUserRole('cliente')
          }
        } catch (error) {
          console.error('Erro ao buscar role do usuário:', error)
          setUserRole('cliente')
        }
      } else {
        setUserRole(null)
      }
      setAuthLoading(false)
    })
    return () => unsub()
  }, [])

  // Capturar evento beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  // Função para instalar o app
  const handleInstallApp = async () => {
    if (deferredPrompt) {
      // Android/Chrome - usar evento beforeinstallprompt
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowInstallPrompt(false)
      }
      setDeferredPrompt(null)
    } else {
      // iPhone/Safari - mostrar instruções
      alert('Para instalar no iPhone, toque no ícone de compartilhar ▢↑ e escolha "Adicionar à Tela de Início".')
    }
  }
  
  // Dados dos planos
  const planos = PLANOS_CASA_OK.map(plano => ({
    ...plano,
    servicos_inclusos: plano.servicos_inclusos
  }))

  const handleSignOut = async () => {
    try {
      await signOutUser()
      setCurrentUser(null)
      setUserRole(null)
    } catch (error) {
      console.error('Erro no logout:', error)
    }
  }

  // Função para redirecionar baseado no role
  const handleRoleClick = (role: string) => {
    if (currentUser && userRole) {
      // Se usuário já está logado, redirecionar para o painel do role dele
      switch (userRole) {
        case 'cliente':
          router.push('/dashboard')
          break
        case 'imobiliaria':
          router.push('/imobiliaria')
          break
        case 'tecnico':
          router.push('/tecnico')
          break
        case 'admin':
          router.push('/admin')
          break
        default:
          router.push('/dashboard')
      }
    } else {
      // Se não está logado, ir para login com role
      router.push(`/login?role=${role}`)
    }
  }

  // Componente Header
  const Header = () => (
    <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/07c47844-ad36-4409-b846-9594009a58b4.png" 
            alt="Casa OK Logo" 
            className="h-12 w-auto"
          />
        </div>
        
        {currentUser ? (
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback className="bg-[#00A39A] text-white">
                {currentUser.displayName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-right hidden sm:block">
              <p className="font-medium text-[#222222]">{currentUser.displayName || 'Usuário'}</p>
              <p className="text-sm text-gray-600 capitalize">{userRole}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
            >
              Sair
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link href="/signup">
              <Button 
                className="bg-[#00A39A] hover:bg-[#008A82] text-white"
                size="sm"
              >
                Criar conta
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/login?role=cliente')}
            >
              Entrar
            </Button>
          </div>
        )}
      </div>
    </header>
  )

  // Banner de instalação PWA
  const InstallBanner = () => (
    showInstallPrompt && (
      <div className="bg-[#00A39A] text-white px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5" />
            <div>
              <p className="font-medium">Instale o Casa OK</p>
              <p className="text-sm opacity-90">Adicione à sua tela inicial para acesso rápido</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="secondary"
              className="bg-white text-[#00A39A] hover:bg-gray-100"
              onClick={handleInstallApp}
            >
              <Download className="w-4 h-4 mr-1" />
              Instalar
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => setShowInstallPrompt(false)}
            >
              Dispensar
            </Button>
          </div>
        </div>
      </div>
    )
  )

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A39A] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Página inicial
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gray-50">
        <InstallBanner />
        <Header />
        
        <main className="max-w-6xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/07c47844-ad36-4409-b846-9594009a58b4.png" 
                alt="Casa OK Logo" 
                className="h-24 w-auto"
              />
            </div>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Assinatura prática e inteligente para manutenção de imóveis residenciais e de temporada
            </p>
            
            {/* Botões de Acesso por Perfil */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full h-20 flex-col border-[#00A39A] text-[#00A39A] hover:bg-[#00A39A] hover:text-white"
                onClick={() => handleRoleClick('cliente')}
              >
                <User className="w-6 h-6 mb-2" />
                Cliente
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full h-20 flex-col border-[#00A39A] text-[#00A39A] hover:bg-[#00A39A] hover:text-white"
                onClick={() => handleRoleClick('imobiliaria')}
              >
                <Building2 className="w-6 h-6 mb-2" />
                Imobiliária
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full h-20 flex-col border-[#00A39A] text-[#00A39A] hover:bg-[#00A39A] hover:text-white"
                onClick={() => handleRoleClick('tecnico')}
              >
                <Wrench className="w-6 h-6 mb-2" />
                Técnico
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full h-20 flex-col border-[#00A39A] text-[#00A39A] hover:bg-[#00A39A] hover:text-white"
                onClick={() => handleRoleClick('admin')}
              >
                <Shield className="w-6 h-6 mb-2" />
                Admin
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-[#00A39A] hover:bg-[#008A82] text-white px-8 py-3 text-lg"
                onClick={() => setCurrentView('planos')}
              >
                Assinar Plano
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-[#00A39A] text-[#00A39A] hover:bg-[#00A39A] hover:text-white px-8 py-3 text-lg"
                onClick={() => router.push('/login?role=cliente')}
              >
                Entrar
              </Button>
            </div>
          </div>

          {/* Benefícios */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-[#00A39A] rounded-lg flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-[#222222]">Manutenção Completa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Serviços elétricos, hidráulicos, pintura e muito mais com técnicos qualificados
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-[#00A39A] rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-[#222222]">Acompanhamento em Tempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Chat integrado, fotos do progresso e notificações sobre o status do seu chamado
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-[#00A39A] rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-[#222222]">Para Imobiliárias</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Painel exclusivo para acompanhar os imóveis que você indica aos seus clientes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Final */}
          <div className="text-center bg-[#00A39A] rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
            <p className="text-xl mb-8 opacity-90">
              Escolha seu plano e tenha a tranquilidade de um imóvel sempre bem cuidado
            </p>
            <Button 
              size="lg" 
              className="bg-white text-[#00A39A] hover:bg-gray-100 px-8 py-3 text-lg"
              onClick={() => setCurrentView('planos')}
            >
              Ver Planos
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Página de planos
  if (currentView === 'planos') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#222222] mb-4">Escolha seu Plano</h1>
            <p className="text-xl text-gray-600">
              Planos mensais sem fidelidade, cancele quando quiser
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {planos.map((plano, index) => (
              <Card key={plano.id} className={`relative hover:shadow-xl transition-shadow ${index === 1 ? 'border-[#00A39A] border-2 scale-105' : ''}`}>
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#00A39A] text-white px-4 py-1">Mais Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-[#222222]">{plano.nome}</CardTitle>
                  <CardDescription className="text-sm">{plano.descricao}</CardDescription>
                  <div className="text-4xl font-bold text-[#00A39A] mt-4">
                    R$ {plano.preco.toFixed(2).replace('.', ',')}
                    <span className="text-lg text-gray-600 font-normal">/mês</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{plano.visitas}</p>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h4 className="font-semibold text-[#222222] mb-3">Serviços inclusos:</h4>
                    <ul className="space-y-2 mb-4">
                      {plano.servicos_inclusos.map((servico, i) => (
                        <li key={i} className="flex items-start text-sm">
                          <Check className="w-4 h-4 text-[#00A39A] mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{servico}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {plano.servicos_orcamento && plano.servicos_orcamento.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-[#222222] text-sm mb-2">Serviços sob orçamento:</h5>
                        <p className="text-xs text-gray-600">{plano.servicos_orcamento[0]}</p>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className={`w-full ${index === 1 ? 'bg-[#00A39A] hover:bg-[#008A82]' : 'bg-gray-800 hover:bg-gray-700'}`}
                    onClick={() => window.open(plano.link_pagamento, '_blank')}
                  >
                    Assinar Agora
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center bg-gray-100 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-[#222222] mb-2">💬 Observações Gerais</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Os materiais são por conta do cliente</p>
              <p>• Chamados fora do escopo são orçados dentro do app</p>
              <p>• Todos os planos incluem suporte via chat Casa OK e notificações automáticas</p>
              <p>• Chamados ou visitas extras podem ser contratados com desconto exclusivo para assinantes</p>
            </div>
          </div>

          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentView('home')}
            >
              Voltar ao Início
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return null
}