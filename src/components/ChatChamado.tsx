'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, Camera, X, Clock, User, Wrench, Shield } from 'lucide-react'
import type { ChatMessage } from '@/lib/types'

interface ChatChamadoProps {
  chamadoId: string
  userType: 'cliente' | 'tecnico' | 'admin'
  userName: string
  onClose: () => void
}

export default function ChatChamado({ chamadoId, userType, userName, onClose }: ChatChamadoProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      autor: 'Sistema Casa OK',
      autor_tipo: 'admin',
      mensagem: 'Seu chamado foi recebido e está sendo analisado pela nossa equipe.',
      timestamp: '2024-01-15T10:00:00Z',
      tipo: 'sistema'
    },
    {
      id: '2',
      autor: 'João Silva',
      autor_tipo: 'cliente',
      mensagem: 'A tomada da cozinha parou de funcionar completamente. Já tentei verificar o disjuntor mas não resolveu.',
      timestamp: '2024-01-15T10:05:00Z',
      tipo: 'texto'
    },
    {
      id: '3',
      autor: 'Casa OK',
      autor_tipo: 'admin',
      mensagem: 'Seu chamado foi aprovado! Estamos procurando o melhor técnico para atendê-lo.',
      timestamp: '2024-01-15T11:30:00Z',
      tipo: 'sistema'
    },
    {
      id: '4',
      autor: 'Carlos Técnico',
      autor_tipo: 'tecnico',
      mensagem: 'Olá! Fui designado para resolver seu problema. Posso ir até aí hoje à tarde, por volta das 14h. Confirma?',
      timestamp: '2024-01-15T12:00:00Z',
      tipo: 'texto'
    }
  ])
  
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      autor: userName,
      autor_tipo: userType,
      mensagem: newMessage,
      timestamp: new Date().toISOString(),
      tipo: 'texto'
    }

    setMessages([...messages, message])
    setNewMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getAuthorIcon = (tipo: 'cliente' | 'tecnico' | 'admin') => {
    switch (tipo) {
      case 'cliente': return <User className="w-4 h-4" />
      case 'tecnico': return <Wrench className="w-4 h-4" />
      case 'admin': return <Shield className="w-4 h-4" />
    }
  }

  const getAuthorColor = (tipo: 'cliente' | 'tecnico' | 'admin') => {
    switch (tipo) {
      case 'cliente': return 'bg-blue-500'
      case 'tecnico': return 'bg-[#2A7F62]'
      case 'admin': return 'bg-purple-500'
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl text-[#333333]">Chat do Chamado</CardTitle>
              <p className="text-sm text-gray-600">Chamado #{chamadoId}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Área de Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => {
              const isCurrentUser = message.autor === userName
              const showDate = index === 0 || 
                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp)

              return (
                <div key={message.id}>
                  {/* Separador de Data */}
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <Badge variant="outline" className="text-xs">
                        {formatDate(message.timestamp)}
                      </Badge>
                    </div>
                  )}

                  {/* Mensagem do Sistema */}
                  {message.tipo === 'sistema' ? (
                    <div className="flex justify-center">
                      <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-md text-center">
                        <p className="text-sm text-gray-700">{message.mensagem}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Mensagem Normal */
                    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className={`${getAuthorColor(message.autor_tipo)} text-white text-xs`}>
                            {getAuthorIcon(message.autor_tipo)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Conteúdo da Mensagem */}
                        <div className={`mx-2 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                          <div className={`rounded-lg px-3 py-2 ${
                            isCurrentUser 
                              ? 'bg-[#2A7F62] text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            {!isCurrentUser && (
                              <p className="text-xs font-medium mb-1 opacity-75">
                                {message.autor}
                              </p>
                            )}
                            <p className="text-sm">{message.mensagem}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Área de Input */}
          <div className="border-t p-4 flex-shrink-0">
            <div className="flex space-x-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                size="sm"
                className="bg-[#2A7F62] hover:bg-[#236B54]"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>Pressione Enter para enviar</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}