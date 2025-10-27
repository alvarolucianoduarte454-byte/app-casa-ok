'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Camera, Upload, X, AlertCircle, Clock } from 'lucide-react'
import type { ChamadoForm, Imovel } from '@/lib/types'

interface NovoChamadoProps {
  imoveis: Imovel[]
  onSubmit: (chamado: ChamadoForm) => void
  onCancel: () => void
}

const tiposServico = [
  { id: 'eletrica', nome: 'Elétrica', categoria: 'Manutenção' },
  { id: 'hidraulica', nome: 'Hidráulica', categoria: 'Manutenção' },
  { id: 'pintura', nome: 'Pintura', categoria: 'Reforma' },
  { id: 'marcenaria', nome: 'Marcenaria', categoria: 'Móveis' },
  { id: 'limpeza', nome: 'Limpeza', categoria: 'Serviços' },
  { id: 'jardinagem', nome: 'Jardinagem', categoria: 'Área Externa' },
  { id: 'ar_condicionado', nome: 'Ar Condicionado', categoria: 'Climatização' },
  { id: 'outros', nome: 'Outros', categoria: 'Diversos' }
]

export default function NovoChamado({ imoveis, onSubmit, onCancel }: NovoChamadoProps) {
  const [form, setForm] = useState<ChamadoForm>({
    imovel_id: '',
    tipo_servico: '',
    descricao: '',
    prioridade: 'normal'
  })
  const [fotos, setFotos] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + fotos.length > 5) {
      alert('Máximo de 5 fotos permitidas')
      return
    }

    const newFotos = [...fotos, ...files]
    setFotos(newFotos)

    // Criar URLs de preview
    const newUrls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls([...previewUrls, ...newUrls])
  }

  const removePhoto = (index: number) => {
    const newFotos = fotos.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)
    
    // Revogar URL do objeto removido
    URL.revokeObjectURL(previewUrls[index])
    
    setFotos(newFotos)
    setPreviewUrls(newUrls)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.imovel_id || !form.tipo_servico || !form.descricao.trim()) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    onSubmit({
      ...form,
      fotos: fotos.length > 0 ? fotos : undefined
    })

    // Limpar URLs de preview
    previewUrls.forEach(url => URL.revokeObjectURL(url))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl text-[#333333]">Novo Chamado</CardTitle>
              <CardDescription>Descreva o problema que precisa ser resolvido</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção do Imóvel */}
            <div className="space-y-2">
              <Label htmlFor="imovel">Imóvel *</Label>
              <Select value={form.imovel_id} onValueChange={(value) => setForm({...form, imovel_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o imóvel" />
                </SelectTrigger>
                <SelectContent>
                  {imoveis.map((imovel) => (
                    <SelectItem key={imovel.id} value={imovel.id}>
                      <div>
                        <p className="font-medium">{imovel.tipo.charAt(0).toUpperCase() + imovel.tipo.slice(1)}</p>
                        <p className="text-sm text-gray-600">{imovel.endereco}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Serviço */}
            <div className="space-y-2">
              <Label htmlFor="tipo_servico">Tipo de Serviço *</Label>
              <Select value={form.tipo_servico} onValueChange={(value) => setForm({...form, tipo_servico: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  {tiposServico.map((tipo) => (
                    <SelectItem key={tipo.id} value={tipo.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{tipo.nome}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {tipo.categoria}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="prioridade"
                    value="normal"
                    checked={form.prioridade === 'normal'}
                    onChange={(e) => setForm({...form, prioridade: e.target.value as 'normal' | 'urgente'})}
                    className="text-[#2A7F62]"
                  />
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Normal</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="prioridade"
                    value="urgente"
                    checked={form.prioridade === 'urgente'}
                    onChange={(e) => setForm({...form, prioridade: e.target.value as 'normal' | 'urgente'})}
                    className="text-red-500"
                  />
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>Urgente</span>
                </label>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição do Problema *</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva detalhadamente o problema que precisa ser resolvido..."
                value={form.descricao}
                onChange={(e) => setForm({...form, descricao: e.target.value})}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Upload de Fotos */}
            <div className="space-y-2">
              <Label>Fotos do Problema (opcional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="foto-upload"
                />
                <label htmlFor="foto-upload" className="cursor-pointer">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Clique para adicionar fotos</p>
                  <p className="text-sm text-gray-500">Máximo 5 fotos (JPG, PNG)</p>
                </label>
              </div>

              {/* Preview das Fotos */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Informações Importantes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Informações Importantes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Chamados urgentes têm prioridade no atendimento</li>
                <li>• Fotos ajudam nossos técnicos a se prepararem melhor</li>
                <li>• Você receberá atualizações por notificação e chat</li>
                <li>• O prazo de atendimento varia conforme seu plano</li>
              </ul>
            </div>

            {/* Botões */}
            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-[#2A7F62] hover:bg-[#236B54]"
              >
                <Upload className="w-4 h-4 mr-2" />
                Enviar Chamado
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}