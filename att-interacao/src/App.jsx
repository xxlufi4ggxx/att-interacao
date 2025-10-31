import React, { useEffect, useState } from 'react'
import './styles.css'

const API_BASE = 'https://jsonplaceholder.typicode.com/todos'

export default function App() {
  const [tarefas, setTarefas] = useState([])
  const [form, setForm] = useState({ id: null, titulo: '', concluida: false })
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [modoEdicao, setModoEdicao] = useState(false)

  async function listarTarefas() {
    setCarregando(true)
    setErro(null)
    try {
      const res = await fetch(`${API_BASE}?_limit=10`)
      if (!res.ok) throw new Error('Erro ao buscar tarefas')
      const data = await res.json()
      setTarefas(data)
    } catch (err) {
      setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { listarTarefas() }, [])

  async function criarTarefa(e) {
    e.preventDefault()
    setErro(null)
    if (!form.titulo.trim()) return setErro('Erro 400 ')

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.titulo, completed: form.concluida })
      })
      if (!res.ok) throw new Error('Erro 404')
      const nova = await res.json()
      setTarefas(prev => [nova, ...prev])
      setForm({ id: null, titulo: '', concluida: false })
    } catch (err) {
      setErro(err.message)
    }
  }
  async function atualizarTarefa(e) {
    e.preventDefault()
    setErro(null)
    if (!form.titulo.trim()) return setErro('Erro 400 ')

    try {
      const res = await fetch(`${API_BASE}/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.titulo, completed: form.concluida })
      })
      if (!res.ok) throw new Error('Erro 404')
      const atualizada = await res.json()
      setTarefas(prev => prev.map(t => t.id === form.id ? atualizada : t))
      setModoEdicao(false)
      setForm({ id: null, titulo: '', concluida: false })
    } catch (err) {
      setErro(err.message)
    }
  }

  function iniciarEdicao(tarefa) {
    setModoEdicao(true)
    setForm({ id: tarefa.id, titulo: tarefa.title, concluida: tarefa.completed })
  }

  async function deletarTarefa(id) {
    setErro(null)
    if (!confirm('Deseja realmente excluir esta tarefa?')) return
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('error 404')
      setTarefas(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      setErro(err.message)
    }
  }

  return (
    <div className="app">
      <h1>Gerenciador de Tarefas (CRUD Completo)</h1>

      {erro && <div className="erro">{erro}</div>}
      {carregando && <p>Carregando tarefas...</p>}

      <form className="form" onSubmit={modoEdicao ? atualizarTarefa : criarTarefa}>
        <input
          className="input"
          placeholder="Título da tarefa..."
          value={form.titulo}
          onChange={e => setForm({ ...form, titulo: e.target.value })}
        />
        <label className="label-check">
          <input
            type="checkbox"
            checked={form.concluida}
            onChange={e => setForm({ ...form, concluida: e.target.checked })}
          />
          Concluída
        </label>
        <button className="btn">
          {modoEdicao ? 'Salvar Alterações' : 'Criar Tarefa'}
        </button>
        {modoEdicao && (
          <button
            type="button"
            className="btn-sec"
            onClick={() => { setModoEdicao(false); setForm({ id: null, titulo: '', concluida: false }) }}
          >
            Cancelar
          </button>
        )}
      </form>

      <ul className="lista">
        {tarefas.map(t => (
          <li key={t.id} className="item">
            <div>
              <span className="titulo">{t.title}</span>
              <p className="status">{t.completed ? ' Concluída' : ' Pendente'}</p>
            </div>
            <div>
              <button className="btn-peq" onClick={() => iniciarEdicao(t)}>Editar</button>
              <button className="btn-danger" onClick={() => deletarTarefa(t.id)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>

    </div>
  )
}
