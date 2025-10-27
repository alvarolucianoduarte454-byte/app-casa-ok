'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Eye, EyeOff, Home } from 'lucide-react'
import { signUpWithEmail } from '@/lib/authClient'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    partnerCode: ''
  })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Nome completo obrigatório
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório'
    }

    // Email obrigatório e formato válido
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido'
    }

    // Senha mínimo 6 caracteres
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    // Confirmar senha deve bater
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    // Termos obrigatórios
    if (!acceptedTerms) {
      newErrors.terms = 'Você deve aceitar os Termos de Uso e Política de Privacidade'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await signUpWithEmail(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phone || undefined,
        formData.partnerCode || undefined
      )

      // Toast de sucesso seria ideal aqui
      console.log('✅ Conta criada com sucesso')
      
      // Redirecionar para dashboard
      window.location.href = '/dashboard?v=2'
    } catch (error: any) {
      console.error('❌ Erro no cadastro:', error)
      setAuthError(error.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex flex-col">
      {/* Header com botão voltar e Casa OK */}
      <header className="w-full p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        
        <Link href="/" className="flex items-center gap-2 text-teal-700 font-bold text-lg">
          <Home className="w-6 h-6" />
          Casa OK
        </Link>

        <Link href="/login">
          <Button variant="outline" size="sm" className="border-teal-200 text-teal-700 hover:bg-teal-50">
            Entrar
          </Button>
        </Link>
      </header>

      {/* Formulário de cadastro */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Criar conta
            </CardTitle>
            <CardDescription className="text-gray-600">
              Preencha os dados para criar sua conta na Casa OK
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Nome completo *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`${errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'}`}
                  placeholder="Seu nome completo"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'}`}
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'}`}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirmar senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar senha *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'}`}
                    placeholder="Digite a senha novamente"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Telefone (opcional) */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Telefone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="border-gray-200 focus:border-teal-500"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {/* Código da imobiliária (opcional) */}
              <div className="space-y-2">
                <Label htmlFor="partnerCode" className="text-sm font-medium text-gray-700">
                  Código da imobiliária
                </Label>
                <Input
                  id="partnerCode"
                  type="text"
                  value={formData.partnerCode}
                  onChange={(e) => handleInputChange('partnerCode', e.target.value)}
                  className="border-gray-200 focus:border-teal-500"
                  placeholder="Código opcional"
                />
              </div>

              {/* Checkbox termos */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => {
                    setAcceptedTerms(checked as boolean)
                    if (errors.terms) {
                      setErrors(prev => ({ ...prev, terms: '' }))
                    }
                  }}
                  className={`${errors.terms ? 'border-red-500' : 'border-gray-300'} data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600`}
                />
                <Label
                  htmlFor="terms"
                  className={`text-sm leading-5 ${errors.terms ? 'text-red-600' : 'text-gray-600'}`}
                >
                  Li e aceito os{' '}
                  <Link href="/termos" className="text-teal-600 hover:text-teal-700 underline">
                    Termos de Uso
                  </Link>{' '}
                  e a{' '}
                  <Link href="/privacidade" className="text-teal-600 hover:text-teal-700 underline">
                    Política de Privacidade
                  </Link>
                </Label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-600">{errors.terms}</p>
              )}

              {/* Erro de autenticação */}
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{authError}</p>
                </div>
              )}

              {/* Botão criar conta */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg shadow-sm transition-colors"
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            {/* Link para login */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                  Faça login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}