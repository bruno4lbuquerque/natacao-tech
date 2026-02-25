<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useAuthStore } from '@/core/stores/auth'
import api from '@/core/services/api'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import Tabs from 'primevue/tabs'
import Tab from 'primevue/tab'
import TabList from 'primevue/tablist'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import ConfirmDialog from 'primevue/confirmdialog'

const toast = useToast()
const confirm = useConfirm()
const auth = useAuthStore()

const isDiretor = computed(() => ['ADMIN', 'DIRETOR'].includes(auth.role ?? ''))
const isCoordenador = computed(() =>
  ['ADMIN', 'DIRETOR', 'COORDENADOR'].includes(auth.role ?? '')
)

// ── Aba ativa ───────────────────────────────────────────────────────────
const abaAtiva = ref(isDiretor.value ? 'professores' : 'turmas')

// ── Interfaces ──────────────────────────────────────────────────────────
interface Professor {
  uuid: string
  nome: string
  email: string
  nomeAcademia?: string
  cargo: string
}

interface Academia {
  uuid: string
  nome: string
  endereco: string
  telefone: string
  email?: string
  cnpj?: string
}

interface Nivel {
  uuid: string
  nome: string
}

interface Turma {
  uuid: string
  nome: string
  horarioInicio: string
  horarioFim: string
  diasSemana: string[]
  professor?: { nome: string } | null
  nivelAlvo?: { nome: string } | null
}

interface Aluno {
  uuid: string
  nome: string
  nomeResponsavel: string
  telefoneResponsavel: string
  nivelAtual: string
  nomeTurma: string
}

// ── Professores ─────────────────────────────────────────────────────────
const professores = ref<Professor[]>([])
const academias = ref<Academia[]>([])
const loadingProf = ref(false)
const buscaProf = ref('')

const modalProf = ref(false)
const submittingProf = ref(false)
const editandoProf = ref(false)
const uuidProf = ref<string | null>(null)

const formProf = ref({ nome: '', email: '', senha: '', academiaId: '' })
const errosProf = ref({ nome: '', email: '', senha: '', academiaId: '' })

// ── Academias ───────────────────────────────────────────────────────────
const loadingAcad = ref(false)
const buscaAcad = ref('')

const modalAcad = ref(false)
const submittingAcad = ref(false)
const editandoAcad = ref(false)
const uuidAcad = ref<string | null>(null)

const formAcad = ref({
  nome: '',
  endereco: '',
  telefone: '',
  email: '',
  cnpj: '',
})
const errosAcad = ref({ nome: '', endereco: '', telefone: '' })

// ── Turmas ──────────────────────────────────────────────────────────────
const turmas = ref<Turma[]>([])
const niveis = ref<Nivel[]>([])
const loadingTurmas = ref(false)
const modalTurma = ref(false)
const salvandoTurma = ref(false)
const formTurma = ref({
  nome: '',
  horarioInicio: '',
  horarioFim: '',
  professorId: '' as string,
  nivelAlvoId: '' as string,
  diasSemana: [] as string[],
})

// ── Alunos ──────────────────────────────────────────────────────────────
const alunos = ref<Aluno[]>([])
const buscaAluno = ref('')
const loadingAlunos = ref(false)
const modalAluno = ref(false)
const salvandoAluno = ref(false)
const formAluno = ref({
  nome: '',
  dataNascimento: '',
  nomeResponsavel: '',
  telefoneResponsavel: '',
  turmaId: '' as string,
  nivelId: '' as string,
})

const modalTransf = ref(false)
const salvandoTransf = ref(false)
const alunoTransf = ref<Aluno | null>(null)
const novaTurmaId = ref('')

const DIAS = [
  { label: 'Seg', value: 'SEGUNDA' },
  { label: 'Ter', value: 'TERCA' },
  { label: 'Qua', value: 'QUARTA' },
  { label: 'Qui', value: 'QUINTA' },
  { label: 'Sex', value: 'SEXTA' },
  { label: 'Sáb', value: 'SABADO' },
]

const professoresFiltrados = computed(() => {
  const q = buscaProf.value.toLowerCase()
  if (!q) return professores.value
  return professores.value.filter(
    (p) =>
      p.nome?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.nomeAcademia?.toLowerCase().includes(q)
  )
})

const academiasFiltradas = computed(() => {
  const q = buscaAcad.value.toLowerCase()
  if (!q) return academias.value
  return academias.value.filter(
    (a) =>
      a.nome?.toLowerCase().includes(q) ||
      a.endereco?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q)
  )
})

const academiaOptions = computed(() =>
  academias.value.map((a) => ({ label: a.nome, value: a.uuid }))
)

const alunosFiltrados = computed(() => {
  const q = buscaAluno.value.toLowerCase()
  if (!q) return alunos.value
  return alunos.value.filter(
    (a) =>
      a.nome?.toLowerCase().includes(q) ||
      a.nomeTurma?.toLowerCase().includes(q)
  )
})

const turmasParaTransf = computed(() => {
  if (!alunoTransf.value) return turmas.value
  return turmas.value.filter((t) => t.nome !== alunoTransf.value?.nomeTurma)
})

onMounted(async () => {
  const calls: Promise<any>[] = [
    carregarAcademias(),
    carregarNiveis(),
    carregarTurmas(),
    carregarAlunos(),
  ]
  if (isDiretor.value) calls.push(carregarProfessores())
  await Promise.all(calls)
})

async function carregarProfessores() {
  loadingProf.value = true
  try {
    const { data } = await api.get<Professor[]>('/api/professores')
    professores.value = data
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao carregar professores.',
    })
  } finally {
    loadingProf.value = false
  }
}

function abrirCriarProf() {
  editandoProf.value = false
  uuidProf.value = null
  formProf.value = {
    nome: '',
    email: '',
    senha: '',
    academiaId: academias.value[0]?.uuid || '',
  }
  errosProf.value = { nome: '', email: '', senha: '', academiaId: '' }
  modalProf.value = true
}

function abrirEditarProf(prof: Professor) {
  editandoProf.value = true
  uuidProf.value = prof.uuid
  formProf.value = {
    nome: prof.nome,
    email: prof.email,
    senha: '',
    academiaId: '',
  }
  errosProf.value = { nome: '', email: '', senha: '', academiaId: '' }
  modalProf.value = true
}

function validarProf(): boolean {
  let ok = true
  errosProf.value = { nome: '', email: '', senha: '', academiaId: '' }
  if (!formProf.value.nome.trim()) {
    errosProf.value.nome = 'Nome é obrigatório.'
    ok = false
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formProf.value.email.trim()) {
    errosProf.value.email = 'E-mail é obrigatório.'
    ok = false
  } else if (!emailRe.test(formProf.value.email)) {
    errosProf.value.email = 'E-mail inválido.'
    ok = false
  }
  if (!editandoProf.value) {
    if (!formProf.value.senha) {
      errosProf.value.senha = 'Senha é obrigatória.'
      ok = false
    } else if (formProf.value.senha.length < 6) {
      errosProf.value.senha = 'Mínimo 6 caracteres.'
      ok = false
    }
    if (!formProf.value.academiaId) {
      errosProf.value.academiaId = 'Selecione uma academia.'
      ok = false
    }
  }
  return ok
}

async function salvarProf() {
  if (!validarProf()) return
  submittingProf.value = true
  try {
    if (editandoProf.value && uuidProf.value) {
      await api.put(`/api/professores/${uuidProf.value}`, {
        nome: formProf.value.nome,
        email: formProf.value.email,
      })
      toast.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Professor atualizado!',
      })
    } else {
      await api.post('/api/professores', {
        nome: formProf.value.nome,
        email: formProf.value.email,
        senha: formProf.value.senha,
        academiaId: formProf.value.academiaId,
      })
      toast.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Professor cadastrado!',
      })
    }
    modalProf.value = false
    await carregarProfessores()
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Erro ao salvar',
      detail:
        e.response?.data?.message || 'Verifique os dados e tente novamente.',
    })
  } finally {
    submittingProf.value = false
  }
}

function excluirProf(prof: Professor) {
  confirm.require({
    message: `Remover "${prof.nome}"? Esta ação não pode ser desfeita.`,
    header: 'Remover Professor',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Remover',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/api/professores/${prof.uuid}`)
        professores.value = professores.value.filter(
          (p) => p.uuid !== prof.uuid
        )
        toast.add({
          severity: 'success',
          summary: 'Removido',
          detail: `${prof.nome} removido.`,
        })
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível remover.',
        })
      }
    },
  })
}

function promoverCoordenador(prof: Professor) {
  confirm.require({
    message: `Promover ${prof.nome} ao cargo de Coordenador?`,
    header: 'Confirmar Promoção',
    icon: 'pi pi-arrow-up',
    acceptLabel: 'Promover',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await api.patch(`/api/professores/${prof.uuid}/promover-coordenador`)
        toast.add({
          severity: 'success',
          summary: `${prof.nome} agora é Coordenador!`,
          life: 4000,
        })
        await carregarProfessores()
      } catch (e: any) {
        toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: e.response?.data?.message ?? 'Falha ao promover.',
        })
      }
    },
  })
}

function rebaixarProfessor(prof: Professor) {
  confirm.require({
    message: `Rebaixar ${prof.nome} de volta ao cargo de Professor?`,
    header: 'Confirmar Rebaixamento',
    icon: 'pi pi-arrow-down',
    acceptLabel: 'Rebaixar',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await api.patch(`/api/professores/${prof.uuid}/rebaixar-professor`)
        toast.add({
          severity: 'info',
          summary: `${prof.nome} voltou a ser Professor.`,
          life: 4000,
        })
        await carregarProfessores()
      } catch (e: any) {
        toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: e.response?.data?.message ?? 'Falha ao rebaixar.',
        })
      }
    },
  })
}

// ── Academias: funções ───────────────────────────────────────────────────
async function carregarAcademias() {
  loadingAcad.value = true
  try {
    const { data } = await api.get<Academia[]>('/api/academias')
    academias.value = data
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao carregar academias.',
    })
  } finally {
    loadingAcad.value = false
  }
}

function abrirCriarAcad() {
  editandoAcad.value = false
  uuidAcad.value = null
  formAcad.value = { nome: '', endereco: '', telefone: '', email: '', cnpj: '' }
  errosAcad.value = { nome: '', endereco: '', telefone: '' }
  modalAcad.value = true
}

function abrirEditarAcad(acad: Academia) {
  editandoAcad.value = true
  uuidAcad.value = acad.uuid
  formAcad.value = {
    nome: acad.nome,
    endereco: acad.endereco,
    telefone: acad.telefone,
    email: acad.email || '',
    cnpj: acad.cnpj || '',
  }
  errosAcad.value = { nome: '', endereco: '', telefone: '' }
  modalAcad.value = true
}

function validarAcad(): boolean {
  let ok = true
  errosAcad.value = { nome: '', endereco: '', telefone: '' }
  if (!formAcad.value.nome.trim()) {
    errosAcad.value.nome = 'Nome é obrigatório.'
    ok = false
  }
  if (!formAcad.value.endereco.trim()) {
    errosAcad.value.endereco = 'Endereço é obrigatório.'
    ok = false
  }
  if (!formAcad.value.telefone.trim()) {
    errosAcad.value.telefone = 'Telefone é obrigatório.'
    ok = false
  }
  return ok
}

async function salvarAcad() {
  if (!validarAcad()) return
  submittingAcad.value = true
  try {
    const dadosJson = JSON.stringify({
      nome: formAcad.value.nome,
      endereco: formAcad.value.endereco,
      telefone: formAcad.value.telefone,
      email: formAcad.value.email || null,
      cnpj: formAcad.value.cnpj || null,
    })
    const formData = new FormData()
    formData.append(
      'dados',
      new Blob([dadosJson], { type: 'application/json' })
    )

    if (editandoAcad.value && uuidAcad.value) {
      await api.put(`/api/academias/${uuidAcad.value}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Academia atualizada!',
      })
    } else {
      await api.post('/api/academias', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Academia cadastrada!',
      })
    }
    modalAcad.value = false
    await carregarAcademias()
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Erro ao salvar',
      detail:
        e.response?.data?.message || 'Verifique os dados e tente novamente.',
    })
  } finally {
    submittingAcad.value = false
  }
}

function excluirAcad(acad: Academia) {
  confirm.require({
    message: `Remover a academia "${acad.nome}"? Todos os dados vinculados serão afetados.`,
    header: 'Remover Academia',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Remover',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/api/academias/${acad.uuid}`)
        academias.value = academias.value.filter((a) => a.uuid !== acad.uuid)
        toast.add({
          severity: 'success',
          summary: 'Removida',
          detail: `${acad.nome} removida.`,
        })
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Erro',
          detail:
            'Não foi possível remover. Verifique se há professores ou turmas vinculados.',
        })
      }
    },
  })
}

async function carregarNiveis() {
  const { data } = await api.get<Nivel[]>('/api/niveis')
  niveis.value = data
}

async function carregarTurmas() {
  loadingTurmas.value = true
  try {
    const { data } = await api.get<Turma[]>('/api/turmas')
    turmas.value = data
  } finally {
    loadingTurmas.value = false
  }
}

function abrirModalTurma() {
  formTurma.value = {
    nome: '',
    horarioInicio: '',
    horarioFim: '',
    professorId: '',
    nivelAlvoId: '',
    diasSemana: [],
  }
  modalTurma.value = true
}

function toggleDia(dia: string) {
  const i = formTurma.value.diasSemana.indexOf(dia)
  if (i >= 0) formTurma.value.diasSemana.splice(i, 1)
  else formTurma.value.diasSemana.push(dia)
}

async function salvarTurma() {
  const { nome, horarioInicio, horarioFim, diasSemana } = formTurma.value
  if (!nome || !horarioInicio || !horarioFim || diasSemana.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Preencha nome, horários e ao menos um dia.',
    })
    return
  }
  salvandoTurma.value = true
  try {
    await api.post('/api/turmas', {
      nome,
      horarioInicio:
        horarioInicio.length === 5 ? horarioInicio + ':00' : horarioInicio,
      horarioFim: horarioFim.length === 5 ? horarioFim + ':00' : horarioFim,
      diasSemana,
      professorId: formTurma.value.professorId || null,
      nivelAlvoId: formTurma.value.nivelAlvoId || null,
    })
    toast.add({ severity: 'success', summary: 'Turma criada!', life: 3000 })
    modalTurma.value = false
    await carregarTurmas()
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: e.response?.data?.message ?? 'Falha ao criar turma.',
    })
  } finally {
    salvandoTurma.value = false
  }
}

function encerrarTurma(turma: Turma) {
  confirm.require({
    message: `Encerrar a turma "${turma.nome}"? Os alunos serão desvinculados.`,
    header: 'Encerrar Turma',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Encerrar',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await api.delete(`/api/turmas/${turma.uuid}`)
        toast.add({
          severity: 'success',
          summary: 'Turma encerrada.',
          life: 3000,
        })
        await carregarTurmas()
      } catch (e: any) {
        toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: e.response?.data?.message ?? 'Falha.',
        })
      }
    },
  })
}

// ── Alunos: funções ──────────────────────────────────────────────────────
async function carregarAlunos() {
  loadingAlunos.value = true
  try {
    const { data } = await api.get<Aluno[]>('/api/alunos')
    alunos.value = data
  } finally {
    loadingAlunos.value = false
  }
}

function abrirModalAluno() {
  formAluno.value = {
    nome: '',
    dataNascimento: '',
    nomeResponsavel: '',
    telefoneResponsavel: '',
    turmaId: '',
    nivelId: '',
  }
  modalAluno.value = true
}

async function salvarAluno() {
  if (!formAluno.value.nome || !formAluno.value.nivelId) {
    toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Nome e nível inicial são obrigatórios.',
    })
    return
  }
  salvandoAluno.value = true
  try {
    await api.post('/api/alunos', {
      nome: formAluno.value.nome,
      dataNascimento: formAluno.value.dataNascimento || null,
      nomeResponsavel: formAluno.value.nomeResponsavel || null,
      telefoneResponsavel: formAluno.value.telefoneResponsavel || null,
      turmaId: formAluno.value.turmaId || null,
      nivelId: formAluno.value.nivelId,
    })
    toast.add({
      severity: 'success',
      summary: 'Aluno matriculado!',
      life: 3000,
    })
    modalAluno.value = false
    await carregarAlunos()
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: e.response?.data?.message ?? 'Falha.',
    })
  } finally {
    salvandoAluno.value = false
  }
}

function abrirTransferencia(aluno: Aluno) {
  alunoTransf.value = aluno
  novaTurmaId.value = ''
  modalTransf.value = true
}

async function transferirAluno() {
  if (!novaTurmaId.value) {
    toast.add({ severity: 'warn', summary: 'Selecione a turma de destino.' })
    return
  }
  salvandoTransf.value = true
  try {
    await api.patch(`/api/alunos/${alunoTransf.value!.uuid}/transferencia`, {
      novaTurmaId: novaTurmaId.value,
    })
    toast.add({
      severity: 'success',
      summary: 'Aluno transferido!',
      life: 3000,
    })
    modalTransf.value = false
    await carregarAlunos()
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: e.response?.data?.message ?? 'Falha.',
    })
  } finally {
    salvandoTransf.value = false
  }
}

function desligarAluno(aluno: Aluno) {
  confirm.require({
    message: `Desligar ${aluno.nome}? O histórico de avaliações será preservado.`,
    header: 'Confirmar Desligamento',
    icon: 'pi pi-user-minus',
    acceptLabel: 'Desligar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/api/alunos/${aluno.uuid}`)
        toast.add({
          severity: 'success',
          summary: 'Aluno desligado.',
          life: 3000,
        })
        await carregarAlunos()
      } catch (e: any) {
        toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: e.response?.data?.message ?? 'Falha.',
        })
      }
    },
  })
}

function iniciais(nome: string) {
  return (
    nome
      ?.split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?'
  )
}

function cargoBadge(cargo: string) {
  const map: Record<string, { label: string; cls: string }> = {
    ADMIN: {
      label: 'Admin',
      cls: 'bg-purple-100 text-purple-700 border border-purple-200',
    },
    DIRETOR: {
      label: 'Diretor',
      cls: 'bg-blue-100 text-blue-700 border border-blue-200',
    },
    COORDENADOR: {
      label: 'Coordenador',
      cls: 'bg-amber-100 text-amber-700 border border-amber-200',
    },
    PROFESSOR: {
      label: 'Professor',
      cls: 'bg-slate-100 text-slate-600 border border-slate-200',
    },
  }
  return map[cargo] ?? { label: cargo, cls: 'bg-slate-100 text-slate-500' }
}

function formatarHorario(h: string) {
  return h?.slice(0, 5) ?? ''
}

function diasAbrev(dias: string[]) {
  const map: Record<string, string> = {
    SEGUNDA: 'Seg',
    TERCA: 'Ter',
    QUARTA: 'Qua',
    QUINTA: 'Qui',
    SEXTA: 'Sex',
    SABADO: 'Sáb',
  }
  return (dias ?? []).map((d) => map[d] ?? d).join(', ')
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6 p-4">
    <ConfirmDialog />

    <div class="flex items-start justify-between">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span
            class="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
          >
            <i class="pi pi-lock mr-1 text-[10px]"></i>Somente Admin
          </span>
        </div>
        <h1
          class="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight"
        >
          Gestão de Usuários
        </h1>
        <p class="text-slate-500 text-sm mt-1">
          Cadastre professores, academias, turmas e alunos do sistema.
        </p>
      </div>
    </div>

    <Tabs v-model:value="abaAtiva">
      <TabList>
        <!-- Professores e Academias: apenas ADMIN e DIRETOR -->
        <Tab v-if="isDiretor" value="professores">
          <i class="pi pi-users mr-2"></i>
          Professores
          <span
            class="ml-2 bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full"
          >
            {{ professores.length }}
          </span>
        </Tab>
        <Tab v-if="isDiretor" value="academias">
          <i class="pi pi-building mr-2"></i>
          Academias
          <span
            class="ml-2 bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full"
          >
            {{ academias.length }}
          </span>
        </Tab>

        <Tab v-if="isCoordenador" value="turmas">
          <i class="pi pi-calendar mr-2"></i>
          Turmas
          <span
            class="ml-2 bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full"
          >
            {{ turmas.length }}
          </span>
        </Tab>
        <Tab v-if="isCoordenador" value="alunos">
          <i class="pi pi-user mr-2"></i>
          Alunos
          <span
            class="ml-2 bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full"
          >
            {{ alunos.length }}
          </span>
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="professores">
          <div class="space-y-4 pt-4">
            <div
              class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
            >
              <IconField iconPosition="left" class="w-full sm:w-72">
                <InputIcon class="pi pi-search" />
                <InputText
                  v-model="buscaProf"
                  placeholder="Buscar por nome, e-mail ou academia..."
                  class="w-full"
                />
              </IconField>
              <Button
                label="Novo Professor"
                icon="pi pi-user-plus"
                @click="abrirCriarProf"
                class="w-full sm:w-auto shrink-0"
              />
            </div>

            <div v-if="loadingProf" class="flex justify-center py-16">
              <i class="pi pi-spin pi-spinner text-3xl text-sky-500"></i>
            </div>

            <div
              v-else-if="professoresFiltrados.length === 0"
              class="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200"
            >
              <i class="pi pi-users text-4xl text-slate-300 mb-3 block"></i>
              <p class="text-slate-500 font-medium">
                Nenhum professor encontrado
              </p>
              <Button
                label="Cadastrar primeiro professor"
                size="small"
                text
                class="mt-3"
                @click="abrirCriarProf"
              />
            </div>

            <div
              v-else
              class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div class="divide-y divide-slate-50">
                <div
                  v-for="prof in professoresFiltrados"
                  :key="prof.uuid"
                  class="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div class="flex items-center gap-4 min-w-0">
                    <div
                      class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0"
                      :class="
                        prof.cargo === 'COORDENADOR'
                          ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                          : 'bg-gradient-to-br from-sky-400 to-blue-600'
                      "
                    >
                      {{ iniciais(prof.nome) }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-slate-800 text-sm">
                        {{ prof.nome }}
                      </p>
                      <div class="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span class="text-xs text-slate-500">
                          <i class="pi pi-envelope mr-1"></i>{{ prof.email }}
                        </span>
                        <span
                          v-if="prof.nomeAcademia"
                          class="text-xs text-sky-600 font-medium"
                        >
                          <i class="pi pi-building mr-1"></i
                          >{{ prof.nomeAcademia }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 shrink-0 ml-3">
                    <span
                      class="text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:inline-flex"
                      :class="cargoBadge(prof.cargo).cls"
                    >
                      {{ cargoBadge(prof.cargo).label }}
                    </span>

                    <div
                      class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Button
                        icon="pi pi-pencil"
                        text
                        rounded
                        size="small"
                        severity="secondary"
                        v-tooltip.top="'Editar'"
                        @click="abrirEditarProf(prof)"
                      />

                      <Button
                        v-if="isDiretor && prof.cargo === 'PROFESSOR'"
                        icon="pi pi-arrow-up"
                        text
                        rounded
                        size="small"
                        severity="success"
                        v-tooltip.top="'Promover a Coordenador'"
                        @click="promoverCoordenador(prof)"
                      />
                      <Button
                        v-if="isDiretor && prof.cargo === 'COORDENADOR'"
                        icon="pi pi-arrow-down"
                        text
                        rounded
                        size="small"
                        severity="warning"
                        v-tooltip.top="'Rebaixar a Professor'"
                        @click="rebaixarProfessor(prof)"
                      />
                      <Button
                        v-if="
                          prof.cargo !== 'ADMIN' && prof.cargo !== 'DIRETOR'
                        "
                        icon="pi pi-trash"
                        text
                        rounded
                        size="small"
                        severity="danger"
                        v-tooltip.top="'Remover'"
                        @click="excluirProf(prof)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Legenda dos cargos -->
            <div class="pt-4 border-t border-slate-100">
              <p
                class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3"
              >
                Hierarquia de cargos
              </p>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div
                  v-for="item in [
                    {
                      cargo: 'ADMIN',
                      desc: 'Acesso total, sem vínculo de academia.',
                    },
                    {
                      cargo: 'DIRETOR',
                      desc: 'Acesso total, vinculado a uma academia.',
                    },
                    { cargo: 'COORDENADOR', desc: 'Gerencia turmas e alunos.' },
                    {
                      cargo: 'PROFESSOR',
                      desc: 'Avalia alunos das suas turmas.',
                    },
                  ]"
                  :key="item.cargo"
                  class="bg-slate-50 rounded-xl p-3 border border-slate-100"
                >
                  <span
                    class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :class="cargoBadge(item.cargo).cls"
                  >
                    {{ cargoBadge(item.cargo).label }}
                  </span>
                  <p class="text-xs text-slate-500 mt-2 leading-relaxed">
                    {{ item.desc }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel value="academias">
          <div class="space-y-4 pt-4">
            <div
              class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
            >
              <IconField iconPosition="left" class="w-full sm:w-72">
                <InputIcon class="pi pi-search" />
                <InputText
                  v-model="buscaAcad"
                  placeholder="Buscar academia..."
                  class="w-full"
                />
              </IconField>
              <Button
                label="Nova Academia"
                icon="pi pi-building"
                @click="abrirCriarAcad"
                class="w-full sm:w-auto shrink-0"
              />
            </div>

            <div v-if="loadingAcad" class="flex justify-center py-16">
              <i class="pi pi-spin pi-spinner text-3xl text-sky-500"></i>
            </div>

            <div
              v-else-if="academiasFiltradas.length === 0"
              class="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200"
            >
              <i class="pi pi-building text-4xl text-slate-300 mb-3 block"></i>
              <p class="text-slate-500 font-medium">
                Nenhuma academia encontrada
              </p>
              <Button
                label="Cadastrar primeira academia"
                size="small"
                text
                class="mt-3"
                @click="abrirCriarAcad"
              />
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                v-for="acad in academiasFiltradas"
                :key="acad.uuid"
                class="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow group"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shrink-0"
                    >
                      <i class="pi pi-building text-sm"></i>
                    </div>
                    <div>
                      <p class="font-semibold text-slate-800 text-sm">
                        {{ acad.nome }}
                      </p>
                      <p v-if="acad.cnpj" class="text-xs text-slate-400">
                        {{ acad.cnpj }}
                      </p>
                    </div>
                  </div>
                  <div
                    class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Button
                      icon="pi pi-pencil"
                      text
                      rounded
                      size="small"
                      severity="secondary"
                      v-tooltip.top="'Editar'"
                      @click="abrirEditarAcad(acad)"
                    />
                    <Button
                      icon="pi pi-trash"
                      text
                      rounded
                      size="small"
                      severity="danger"
                      v-tooltip.top="'Remover'"
                      @click="excluirAcad(acad)"
                    />
                  </div>
                </div>
                <div class="space-y-1.5 text-xs text-slate-500">
                  <p>
                    <i class="pi pi-map-marker mr-2 text-slate-400"></i
                    >{{ acad.endereco }}
                  </p>
                  <p>
                    <i class="pi pi-phone mr-2 text-slate-400"></i
                    >{{ acad.telefone }}
                  </p>
                  <p v-if="acad.email">
                    <i class="pi pi-envelope mr-2 text-slate-400"></i
                    >{{ acad.email }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- ─── ABA: TURMAS ───────────────────────────────────────────── -->
        <TabPanel value="turmas">
          <div class="space-y-4 pt-4">
            <div class="flex justify-between items-center flex-wrap gap-3">
              <p class="text-sm text-slate-500">
                Crie e encerre turmas. Cada turma tem um professor e nível alvo.
              </p>
              <Button
                label="Nova Turma"
                icon="pi pi-plus"
                size="small"
                @click="abrirModalTurma"
              />
            </div>

            <div v-if="loadingTurmas" class="flex justify-center py-16">
              <i class="pi pi-spin pi-spinner text-3xl text-sky-500"></i>
            </div>

            <div
              v-else
              class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3"
            >
              <div
                v-for="turma in turmas"
                :key="turma.uuid"
                class="border border-slate-100 rounded-xl p-4 bg-white hover:border-sky-200 hover:shadow-sm transition-all group"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-slate-800 text-sm truncate">
                      {{ turma.nome }}
                    </p>
                    <p class="text-xs text-slate-500 mt-1">
                      <i class="pi pi-clock mr-1"></i
                      >{{ formatarHorario(turma.horarioInicio) }}
                      <span v-if="turma.horarioFim">
                        – {{ formatarHorario(turma.horarioFim) }}</span
                      >
                      <span v-if="turma.diasSemana?.length">
                        · {{ diasAbrev(turma.diasSemana) }}</span
                      >
                    </p>
                    <p
                      v-if="turma.professor"
                      class="text-xs text-slate-500 mt-0.5"
                    >
                      <i class="pi pi-user mr-1"></i>{{ turma.professor.nome }}
                    </p>
                    <span
                      v-if="turma.nivelAlvo"
                      class="mt-2 inline-block text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100 rounded-full px-2 py-0.5"
                    >
                      {{ turma.nivelAlvo.nome }}
                    </span>
                  </div>
                  <Button
                    icon="pi pi-times"
                    v-tooltip.top="'Encerrar turma'"
                    text
                    rounded
                    size="small"
                    severity="danger"
                    class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    @click="encerrarTurma(turma)"
                  />
                </div>
              </div>

              <div
                v-if="turmas.length === 0"
                class="col-span-3 text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400"
              >
                <i class="pi pi-calendar text-4xl mb-3 block"></i>
                Nenhuma turma cadastrada ainda.
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel value="alunos">
          <div class="space-y-4 pt-4">
            <div
              class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
            >
              <IconField iconPosition="left" class="w-full sm:w-72">
                <InputIcon class="pi pi-search" />
                <InputText
                  v-model="buscaAluno"
                  placeholder="Buscar por nome ou turma..."
                  class="w-full"
                />
              </IconField>
              <Button
                label="Matricular Aluno"
                icon="pi pi-plus"
                size="small"
                @click="abrirModalAluno"
                class="w-full sm:w-auto shrink-0"
              />
            </div>

            <div v-if="loadingAlunos" class="flex justify-center py-16">
              <i class="pi pi-spin pi-spinner text-3xl text-sky-500"></i>
            </div>

            <div
              v-else
              class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
            >
              <div class="divide-y divide-slate-50">
                <div
                  v-for="aluno in alunosFiltrados"
                  :key="aluno.uuid"
                  class="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div class="flex items-center gap-4 min-w-0">
                    <div
                      class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0"
                    >
                      {{ iniciais(aluno.nome) }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-slate-800 text-sm">
                        {{ aluno.nome }}
                      </p>
                      <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span class="text-xs text-slate-500 truncate">{{
                          aluno.nomeTurma
                        }}</span>
                        <span
                          class="text-xs font-medium text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded shrink-0"
                        >
                          {{ aluno.nivelAtual }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                  >
                    <Button
                      icon="pi pi-arrow-right-arrow-left"
                      v-tooltip.top="'Transferir de turma'"
                      text
                      rounded
                      size="small"
                      severity="secondary"
                      @click="abrirTransferencia(aluno)"
                    />
                    <Button
                      icon="pi pi-user-minus"
                      v-tooltip.top="'Desligar aluno'"
                      text
                      rounded
                      size="small"
                      severity="danger"
                      @click="desligarAluno(aluno)"
                    />
                  </div>
                </div>

                <div
                  v-if="alunosFiltrados.length === 0"
                  class="text-center py-12 text-slate-400"
                >
                  <i class="pi pi-user text-4xl mb-3 block"></i>
                  Nenhum aluno matriculado ainda.
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>

    <Dialog
      v-model:visible="modalProf"
      modal
      :header="editandoProf ? 'Editar Professor' : 'Novo Professor'"
      :style="{ width: '28rem' }"
      :closable="!submittingProf"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-slate-700"
            >Nome Completo <span class="text-red-500">*</span></label
          >
          <InputText
            v-model="formProf.nome"
            placeholder="Ex: Ana Paula Silva"
            :class="{ 'p-invalid': errosProf.nome }"
            class="w-full"
            autocomplete="off"
          />
          <small v-if="errosProf.nome" class="text-red-500 text-xs">{{
            errosProf.nome
          }}</small>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-slate-700"
            >E-mail <span class="text-red-500">*</span></label
          >
          <InputText
            v-model="formProf.email"
            placeholder="professor@academia.com"
            type="email"
            :class="{ 'p-invalid': errosProf.email }"
            class="w-full"
            autocomplete="off"
          />
          <small v-if="errosProf.email" class="text-red-500 text-xs">{{
            errosProf.email
          }}</small>
        </div>
        <template v-if="!editandoProf">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-slate-700"
              >Senha <span class="text-red-500">*</span></label
            >
            <InputText
              v-model="formProf.senha"
              placeholder="Mínimo 6 caracteres"
              type="password"
              :class="{ 'p-invalid': errosProf.senha }"
              class="w-full"
              autocomplete="new-password"
            />
            <small v-if="errosProf.senha" class="text-red-500 text-xs">{{
              errosProf.senha
            }}</small>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-slate-700"
              >Academia <span class="text-red-500">*</span></label
            >
            <Select
              v-model="formProf.academiaId"
              :options="academiaOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecione a academia"
              :class="{ 'p-invalid': errosProf.academiaId }"
              class="w-full"
            />
            <small v-if="errosProf.academiaId" class="text-red-500 text-xs">{{
              errosProf.academiaId
            }}</small>
          </div>
          <div
            class="bg-sky-50 border border-sky-100 rounded-xl p-3 text-xs text-sky-700 flex items-start gap-2"
          >
            <i class="pi pi-info-circle mt-0.5 shrink-0"></i>
            <span
              >O professor receberá o cargo <strong>Professor</strong>. Você
              pode promovê-lo a Coordenador depois nesta mesma tela.</span
            >
          </div>
        </template>
        <div
          v-if="editandoProf"
          class="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700"
        >
          <i class="pi pi-info-circle mr-1"></i>
          Apenas nome e e-mail podem ser alterados aqui. A senha é gerenciada
          pelo próprio professor.
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            label="Cancelar"
            severity="secondary"
            outlined
            :disabled="submittingProf"
            @click="modalProf = false"
          />
          <Button
            :label="editandoProf ? 'Salvar' : 'Cadastrar'"
            icon="pi pi-check"
            :loading="submittingProf"
            @click="salvarProf"
          />
        </div>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="modalAcad"
      modal
      :header="editandoAcad ? 'Editar Academia' : 'Nova Academia'"
      :style="{ width: '30rem' }"
      :closable="!submittingAcad"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-slate-700"
            >Nome da Academia <span class="text-red-500">*</span></label
          >
          <InputText
            v-model="formAcad.nome"
            placeholder="Ex: Connect Acqua Kids"
            :class="{ 'p-invalid': errosAcad.nome }"
            class="w-full"
          />
          <small v-if="errosAcad.nome" class="text-red-500 text-xs">{{
            errosAcad.nome
          }}</small>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-slate-700"
            >Endereço <span class="text-red-500">*</span></label
          >
          <InputText
            v-model="formAcad.endereco"
            placeholder="Ex: Rua das Piscinas, 100 - Centro"
            :class="{ 'p-invalid': errosAcad.endereco }"
            class="w-full"
          />
          <small v-if="errosAcad.endereco" class="text-red-500 text-xs">{{
            errosAcad.endereco
          }}</small>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-slate-700"
              >Telefone <span class="text-red-500">*</span></label
            >
            <InputText
              v-model="formAcad.telefone"
              placeholder="(11) 99999-0000"
              :class="{ 'p-invalid': errosAcad.telefone }"
              class="w-full"
            />
            <small v-if="errosAcad.telefone" class="text-red-500 text-xs">{{
              errosAcad.telefone
            }}</small>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-slate-700">CNPJ</label>
            <InputText
              v-model="formAcad.cnpj"
              placeholder="00.000.000/0001-00"
              class="w-full"
            />
          </div>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-slate-700"
            >E-mail da Academia</label
          >
          <InputText
            v-model="formAcad.email"
            placeholder="contato@academia.com"
            type="email"
            class="w-full"
          />
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            label="Cancelar"
            severity="secondary"
            outlined
            :disabled="submittingAcad"
            @click="modalAcad = false"
          />
          <Button
            :label="editandoAcad ? 'Salvar' : 'Cadastrar'"
            icon="pi pi-check"
            :loading="submittingAcad"
            @click="salvarAcad"
          />
        </div>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="modalTurma"
      modal
      header="Nova Turma"
      :style="{ width: '30rem' }"
    >
      <div class="space-y-4 pt-2">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5"
            >Nome da turma *</label
          >
          <InputText
            v-model="formTurma.nome"
            placeholder="Ex: Acqua Baby - Manhã A"
            class="w-full"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1.5"
              >Início *</label
            >
            <InputText
              v-model="formTurma.horarioInicio"
              type="time"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1.5"
              >Fim *</label
            >
            <InputText
              v-model="formTurma.horarioFim"
              type="time"
              class="w-full"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-2"
            >Dias da semana *</label
          >
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="dia in DIAS"
              :key="dia.value"
              @click="toggleDia(dia.value)"
              class="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors"
              :class="
                formTurma.diasSemana.includes(dia.value)
                  ? 'bg-sky-500 text-white border-sky-500'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
              "
            >
              {{ dia.label }}
            </button>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5"
            >Professor responsável</label
          >
          <Select
            v-model="formTurma.professorId"
            :options="professores"
            optionLabel="nome"
            optionValue="uuid"
            placeholder="Selecionar professor..."
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5"
            >Nível alvo</label
          >
          <Select
            v-model="formTurma.nivelAlvoId"
            :options="niveis"
            optionLabel="nome"
            optionValue="uuid"
            placeholder="Selecionar nível..."
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="Cancelar"
          text
          severity="secondary"
          @click="modalTurma = false"
        />
        <Button
          label="Criar Turma"
          icon="pi pi-check"
          :loading="salvandoTurma"
          @click="salvarTurma"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="modalAluno"
      modal
      header="Matricular Aluno"
      :style="{ width: '30rem' }"
    >
      <div class="space-y-4 pt-2">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5"
            >Nome do aluno *</label
          >
          <InputText
            v-model="formAluno.nome"
            placeholder="Nome completo"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5"
            >Data de nascimento</label
          >
          <InputText
            v-model="formAluno.dataNascimento"
            type="date"
            class="w-full"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1.5"
              >Nome do responsável</label
            >
            <InputText
              v-model="formAluno.nomeResponsavel"
              placeholder="Pai/Mãe"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1.5"
              >Telefone (WhatsApp)</label
            >
            <InputText
              v-model="formAluno.telefoneResponsavel"
              placeholder="11 99999-9999"
              class="w-full"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5"
            >Nível inicial *</label
          >
          <Select
            v-model="formAluno.nivelId"
            :options="niveis"
            optionLabel="nome"
            optionValue="uuid"
            placeholder="Selecionar nível..."
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5"
            >Turma
            <span class="text-slate-400 font-normal">(opcional)</span></label
          >
          <Select
            v-model="formAluno.turmaId"
            :options="turmas"
            optionLabel="nome"
            optionValue="uuid"
            placeholder="Selecionar turma..."
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="Cancelar"
          text
          severity="secondary"
          @click="modalAluno = false"
        />
        <Button
          label="Matricular"
          icon="pi pi-check"
          :loading="salvandoAluno"
          @click="salvarAluno"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="modalTransf"
      modal
      :header="`Transferir — ${alunoTransf?.nome}`"
      :style="{ width: '26rem' }"
    >
      <div class="pt-2 space-y-3">
        <div
          class="text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100"
        >
          Turma atual: <strong>{{ alunoTransf?.nomeTurma || '—' }}</strong>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1.5"
            >Turma de destino *</label
          >
          <Select
            v-model="novaTurmaId"
            :options="turmasParaTransf"
            optionLabel="nome"
            optionValue="uuid"
            placeholder="Selecionar turma..."
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="Cancelar"
          text
          severity="secondary"
          @click="modalTransf = false"
        />
        <Button
          label="Transferir"
          icon="pi pi-check"
          :loading="salvandoTransf"
          @click="transferirAluno"
        />
      </template>
    </Dialog>
  </div>
</template>
