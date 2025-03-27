"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Edit, Trash2, Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { initializeParse } from "@/lib/parse-config"

// Definição do tipo para um time
interface Team {
  objectId?: string
  name: string
  founded: string
  logo: string
  description: string
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [formData, setFormData] = useState<Team>({
    name: "",
    founded: "",
    logo: "",
    description: "",
  })

  // Inicializar Parse quando o componente montar
  useEffect(() => {
    initializeParse()
    fetchTeams()
  }, [])

  // Buscar times do Back4App
  const fetchTeams = async () => {
    setLoading(true)
    try {
      // Importar Parse dinamicamente para evitar problemas de SSR
      const Parse = require("parse/dist/parse.min.js")
      const query = new Parse.Query("Team")
      const results = await query.find()

      const fetchedTeams = results.map((team: any) => ({
        objectId: team.id,
        name: team.get("name"),
        founded: team.get("founded"),
        logo: team.get("logo"),
        description: team.get("description"),
      }))

      setTeams(fetchedTeams)
      setError(null)
    } catch (err: any) {
      setError(`Erro ao buscar times: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Adicionar um novo time
  const addTeam = async () => {
    try {
      const Parse = require("parse/dist/parse.min.js")
      const Team = Parse.Object.extend("Team")
      const team = new Team()

      team.set("name", formData.name)
      team.set("founded", formData.founded)
      team.set("logo", formData.logo)
      team.set("description", formData.description)

      const result = await team.save()

      setTeams([
        ...teams,
        {
          objectId: result.id,
          ...formData,
        },
      ])

      resetForm()
      setShowForm(false)
    } catch (err: any) {
      setError(`Erro ao adicionar time: ${err.message}`)
    }
  }

  // Atualizar um time existente
  const updateTeam = async () => {
    if (!editingTeam?.objectId) return

    try {
      const Parse = require("parse/dist/parse.min.js")
      const query = new Parse.Query("Team")
      const team = await query.get(editingTeam.objectId)

      team.set("name", formData.name)
      team.set("founded", formData.founded)
      team.set("logo", formData.logo)
      team.set("description", formData.description)

      await team.save()

      setTeams(teams.map((t) => (t.objectId === editingTeam.objectId ? { ...formData, objectId: t.objectId } : t)))

      resetForm()
      setEditingTeam(null)
      setShowForm(false)
    } catch (err: any) {
      setError(`Erro ao atualizar time: ${err.message}`)
    }
  }

  // Remover um time
  const deleteTeam = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este time?")) return

    try {
      const Parse = require("parse/dist/parse.min.js")
      const query = new Parse.Query("Team")
      const team = await query.get(id)

      await team.destroy()
      setTeams(teams.filter((t) => t.objectId !== id))
    } catch (err: any) {
      setError(`Erro ao excluir time: ${err.message}`)
    }
  }

  // Manipular mudanças no formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Iniciar edição de um time
  const startEdit = (team: Team) => {
    setFormData(team)
    setEditingTeam(team)
    setShowForm(true)
  }

  // Resetar o formulário
  const resetForm = () => {
    setFormData({
      name: "",
      founded: "",
      logo: "",
      description: "",
    })
  }

  // Cancelar edição/adição
  const cancelForm = () => {
    resetForm()
    setEditingTeam(null)
    setShowForm(false)
  }

  // Manipular envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTeam) {
      updateTeam()
    } else {
      addTeam()
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Times de Futebol</h1>
        <div className="flex gap-4">
          <Link href="/">
            <Button variant="outline">Voltar</Button>
          </Link>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Time
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingTeam ? "Editar Time" : "Adicionar Novo Time"}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Time</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="founded">Ano de Fundação</Label>
                <Input id="founded" name="founded" value={formData.founded} onChange={handleChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logo">URL do Logo</Label>
                <Input
                  id="logo"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={cancelForm}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingTeam ? "Atualizar" : "Adicionar"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-10">Carregando times...</div>
      ) : teams.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg mb-4">Nenhum time cadastrado ainda.</p>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Primeiro Time
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.objectId} className="overflow-hidden">
              <div className="h-40 bg-gray-100 flex items-center justify-center">
                {team.logo ? (
                  <img
                    src={team.logo || "/placeholder.svg"}
                    alt={`Logo do ${team.name}`}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400">Sem logo</div>
                )}
              </div>
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
                <p className="text-sm text-gray-500">Fundado em: {team.founded}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{team.description || "Sem descrição"}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="icon" onClick={() => startEdit(team)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-500"
                  onClick={() => team.objectId && deleteTeam(team.objectId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

