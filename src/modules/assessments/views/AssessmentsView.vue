<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import api from '@/core/services/api'
import { useAssessmentsStore } from '@/modules/assessments/stores/assessments'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'

const toast = useToast()
const confirm = useConfirm()
const assessmentsStore = useAssessmentsStore()

interface NivelResumo {
  uuid: string
  nome: string
  corTouca?: string | null
}

interface Turma {
  uuid: string
  nome: string
  nivelAlvo: NivelResumo | null
}

interface Aluno {
  uuid: string
  nome: string
  nivelAtual?: NivelResumo | null
  nivelAtualNome?: string
  telefoneResponsavel?: string | null
}

interface Habilidade {
  uuid: string
  descricao: string
  categoria: string
  ativo: boolean
}

interface Historico {
  uuid: string
  dataAvaliacao: string
  nivelNome: string
  corTouca: string | null
  pontuacaoTotal: number
  promovido: boolean
  observacoes: string | null
}

const etapa = ref<number>(1)

const turmas = ref<Turma[]>([])
const turmaSelecionada = ref<Turma | null>(null)
const loadingTurmas = ref(false)
const loadingAlunos = ref(false)

const alunos = ref<Aluno[]>([])
const habilidades = ref<Habilidade[]>([])
const alunosSelecionados = ref<Set<string>>(new Set())
const buscaAluno = ref('')

const perguntaAtual = ref(0)
const respostas = ref<Record<string, Record<string, boolean>>>({})

const salvando = ref(false)

const modalHistorico = ref(false)
const alunoModal = ref<Aluno | null>(null)
const historico = ref<Historico[]>([])
const loadingHistorico = ref(false)
const baixandoPdf = ref<Record<string, boolean>>({})
const enviandoWA = ref<Record<string, boolean>>({})

const alunosFiltrados = computed(() => {
  const q = buscaAluno.value.toLowerCase().trim()
  if (!q) return alunos.value
  return alunos.value.filter((a) => a.nome.toLowerCase().includes(q))
})

const alunosSelecionadosLista = computed(() =>
  alunos.value.filter((a) => alunosSelecionados.value.has(a.uuid))
)

const habilidadesAtivas = computed(() =>
  habilidades.value.filter((h) => h.ativo !== false)
)

const perguntaCorrente = computed(
  () => habilidadesAtivas.value[perguntaAtual.value] ?? null
)

const totalPerguntas = computed(() => habilidadesAtivas.value.length)

const progresso = computed(() =>
  totalPerguntas.value > 0
    ? Math.round(((perguntaAtual.value + 1) / totalPerguntas.value) * 100)
    : 0
)

const isUltimaPergunta = computed(
  () => perguntaAtual.value === totalPerguntas.value - 1
)

const semRespostaAtual = computed(() => {
  const hab = perguntaCorrente.value
  if (!hab) return 0
  return alunosSelecionadosLista.value.filter(
    (a) => respostas.value[hab.uuid]?.[a.uuid] === undefined
  ).length
})

const resultado = computed(() =>
  alunosSelecionadosLista.value.map((aluno) => {
    const aprovadas = habilidadesAtivas.value.filter(
      (h) => respostas.value[h.uuid]?.[aluno.uuid] === true
    ).length
    const total = habilidadesAtivas.value.length
    return {
      aluno,
      aprovadas,
      total,
      pct: total > 0 ? Math.round((aprovadas / total) * 100) : 0,
    }
  })
)

onMounted(carregarTurmas)

function irParaEtapa1() {
  etapa.value = 1
}

function irParaEtapa2() {
  etapa.value = 2
}

function revisar() {
  etapa.value = 3
  perguntaAtual.value = 0
}

async function carregarTurmas() {
  loadingTurmas.value = true
  try {
    const { data } = await api.get<Turma[]>('/api/turmas')
    turmas.value = data
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao carregar turmas.',
    })
  } finally {
    loadingTurmas.value = false
  }
}

async function selecionarTurma(turma: Turma) {
  turmaSelecionada.value = turma
  loadingAlunos.value = true
  alunos.value = []
  habilidades.value = []
  alunosSelecionados.value = new Set()
  buscaAluno.value = ''
  try {
    const { data: alunosData } = await api.get<Aluno[]>(
      `/api/turmas/${turma.uuid}/alunos`
    )
    alunos.value = alunosData

    const nivelUuid =
      turma.nivelAlvo?.uuid ?? alunosData[0]?.nivelAtual?.uuid ?? null
    if (nivelUuid) {
      const { data: habsData } = await api.get<Habilidade[]>(
        `/api/niveis/${nivelUuid}/habilidades`
      )
      habilidades.value = habsData.filter((h) => h.ativo !== false)
    }
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: e.response?.data?.message ?? 'Falha ao carregar dados.',
    })
  } finally {
    loadingAlunos.value = false
  }
}

function toggleAluno(uuid: string) {
  if (alunosSelecionados.value.has(uuid)) {
    alunosSelecionados.value.delete(uuid)
  } else {
    alunosSelecionados.value.add(uuid)
  }
}

function selecionarTodos() {
  alunos.value.forEach((a) => alunosSelecionados.value.add(a.uuid))
}

function limparSelecao() {
  alunosSelecionados.value = new Set()
}

function avancarParaWizard() {
  if (alunosSelecionados.value.size === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Selecione ao menos um aluno.',
    })
    return
  }
  if (habilidadesAtivas.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Nenhuma habilidade cadastrada para este nível.',
    })
    return
  }
  respostas.value = {}
  habilidadesAtivas.value.forEach((h) => {
    respostas.value[h.uuid] = {}
  })
  perguntaAtual.value = 0
  etapa.value = 3
}

function responder(alunoUuid: string, valor: boolean) {
  const hab = perguntaCorrente.value
  if (!hab) return
  if (!respostas.value[hab.uuid]) respostas.value[hab.uuid] = {}
  const bloco = respostas.value[hab.uuid] as Record<string, boolean>
  bloco[alunoUuid] = valor
}

function getResposta(alunoUuid: string): boolean | undefined {
  const habUuid = perguntaCorrente.value?.uuid
  if (!habUuid) return undefined
  return respostas.value[habUuid]?.[alunoUuid]
}

function marcarTodosSim() {
  const hab = perguntaCorrente.value
  if (!hab) return
  if (!respostas.value[hab.uuid]) respostas.value[hab.uuid] = {}
  const bloco = respostas.value[hab.uuid] as Record<string, boolean>
  alunosSelecionadosLista.value.forEach((a) => {
    bloco[a.uuid] = true
  })
}

function marcarTodosNao() {
  const hab = perguntaCorrente.value
  if (!hab) return
  if (!respostas.value[hab.uuid]) respostas.value[hab.uuid] = {}
  const bloco = respostas.value[hab.uuid] as Record<string, boolean>
  alunosSelecionadosLista.value.forEach((a) => {
    bloco[a.uuid] = false
  })
}

function proximaPergunta() {
  if (!isUltimaPergunta.value) {
    perguntaAtual.value++
  } else {
    etapa.value = 4
  }
}

function voltarPergunta() {
  if (perguntaAtual.value > 0) {
    perguntaAtual.value--
  } else {
    etapa.value = 2
  }
}

async function salvarAvaliacao() {
  confirm.require({
    message: `Salvar avaliação de ${alunosSelecionadosLista.value.length} aluno(s)?`,
    header: 'Confirmar Avaliação',
    icon: 'pi pi-check-circle',
    acceptLabel: 'Salvar',
    rejectLabel: 'Revisar',
    accept: async () => {
      salvando.value = true
      try {
        const payload = {
          turmaId: turmaSelecionada.value!.uuid,
          avaliacoes: alunosSelecionadosLista.value.map((aluno) => ({
            alunoId: aluno.uuid,
            habilidadesAprovadasIds: habilidadesAtivas.value
              .filter((h) => respostas.value[h.uuid]?.[aluno.uuid] === true)
              .map((h) => h.uuid),
            observacao: null,
            promoverManual: false,
          })),
        }
        await api.post('/api/avaliacoes/lote', payload)
        toast.add({
          severity: 'success',
          summary: 'Avaliação salva!',
          detail: `${alunosSelecionadosLista.value.length} aluno(s) avaliado(s).`,
          life: 5000,
        })
        reiniciar()
      } catch (e: any) {
        toast.add({
          severity: 'error',
          summary: 'Erro ao salvar',
          detail: e.response?.data?.message ?? 'Falha ao salvar avaliação.',
        })
      } finally {
        salvando.value = false
      }
    },
  })
}

function reiniciar() {
  etapa.value = 1
  turmaSelecionada.value = null
  alunos.value = []
  habilidades.value = []
  alunosSelecionados.value = new Set()
  respostas.value = {}
  perguntaAtual.value = 0
  buscaAluno.value = ''
}

async function abrirHistorico(aluno: Aluno) {
  alunoModal.value = aluno
  historico.value = []
  modalHistorico.value = true
  loadingHistorico.value = true
  try {
    const { data } = await api.get(`/api/alunos/${aluno.uuid}/historico`)
    historico.value = data.content || data
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao carregar histórico.',
    })
  } finally {
    loadingHistorico.value = false
  }
}

async function baixarPdf(hist: Historico) {
  baixandoPdf.value[hist.uuid] = true
  try {
    if (assessmentsStore.downloadAvaliacaoPdf) {
      await assessmentsStore.downloadAvaliacaoPdf(hist.uuid)
    }
    toast.add({ severity: 'success', summary: 'PDF baixado!', life: 3000 })
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao baixar PDF.',
    })
  } finally {
    baixandoPdf.value[hist.uuid] = false
  }
}

async function enviarWhatsApp(hist: Historico) {
  enviandoWA.value[hist.uuid] = true
  try {
    await api.post(`/api/whatsapp/enviar-avaliacao/${hist.uuid}`)
    toast.add({ severity: 'success', summary: 'WhatsApp enviado!', life: 5000 })
  } catch (e: any) {
    toast.add({
      severity: 'error',
      summary: 'Erro ao enviar',
      detail: e.response?.data?.message ?? 'Falha ao enviar.',
    })
  } finally {
    enviandoWA.value[hist.uuid] = false
  }
}

function iniciais(nome: string): string {
  return (nome ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

function formatarData(dt: string | number[]): string {
  if (!dt) return '--/--/----'
  if (Array.isArray(dt)) {
    const [y, m, d] = dt
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`
  }
  return new Date(dt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getNivelNome(aluno: Aluno): string {
  return (
    turmaSelecionada.value?.nivelAlvo?.nome ??
    aluno.nivelAtual?.nome ??
    aluno.nivelAtualNome ??
    ''
  )
}

function getCorTouca(cor: string | null | undefined): Record<string, string> {
  return cor ? { backgroundColor: cor } : {}
}

function avatarCls(resp: boolean | undefined): string {
  if (resp === true) return 'bg-gradient-to-br from-emerald-400 to-emerald-600'
  if (resp === false) return 'bg-gradient-to-br from-red-400 to-red-500'
  return 'bg-slate-200'
}

function avatarTxtCls(resp: boolean | undefined): string {
  return resp === undefined ? 'text-slate-500' : 'text-white'
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-5 p-4">
    <ConfirmDialog />

    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 tracking-tight">
          Avaliações
        </h1>
        <p class="text-slate-400 text-sm mt-0.5">
          <span v-if="etapa === 1">Selecione a turma para iniciar</span>
          <span v-else-if="etapa === 2">Escolha os alunos a avaliar</span>
          <span v-else-if="etapa === 3">
            Pergunta {{ perguntaAtual + 1 }} de {{ totalPerguntas }}
          </span>
          <span v-else>Resumo da avaliação</span>
        </p>
      </div>

      <div class="hidden sm:flex items-center gap-1">
        <div
          v-for="n in [1, 2, 3, 4]"
          :key="n"
          class="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all"
          :class="
            etapa === n
              ? 'bg-sky-500 text-white shadow-sm shadow-sky-200'
              : etapa > n
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-slate-100 text-slate-400'
          "
        >
          <i v-if="etapa > n" class="pi pi-check" style="font-size: 0.6rem"></i>
          <span v-else>{{ n }}</span>
        </div>
      </div>
    </div>

    <template v-if="etapa === 1">
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p
          class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4"
        >
          <i class="pi pi-calendar mr-1.5 text-sky-400"></i>Selecione a turma
        </p>

        <div v-if="loadingTurmas" class="flex justify-center py-10">
          <i class="pi pi-spin pi-spinner text-3xl text-sky-400"></i>
        </div>

        <div
          v-else-if="turmas.length === 0"
          class="text-center py-10 text-slate-400"
        >
          <i class="pi pi-calendar text-4xl mb-2 block"></i>
          Nenhuma turma encontrada.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            v-for="turma in turmas"
            :key="turma.uuid"
            @click="selecionarTurma(turma)"
            class="flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left hover:border-sky-300 hover:bg-sky-50 group"
            :class="
              turmaSelecionada?.uuid === turma.uuid && !loadingAlunos
                ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-100'
                : 'border-slate-100 bg-slate-50'
            "
          >
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold shrink-0"
            >
              {{ turma.nome.charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-slate-800 text-sm truncate">
                {{ turma.nome }}
              </p>
              <p
                v-if="turma.nivelAlvo"
                class="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5"
              >
                <span
                  class="w-2.5 h-2.5 rounded-full inline-block border border-white/30"
                  :style="
                    turma.nivelAlvo.corTouca
                      ? { backgroundColor: turma.nivelAlvo.corTouca }
                      : { backgroundColor: '#0ea5e9' }
                  "
                ></span>
                {{ turma.nivelAlvo.nome }}
              </p>
            </div>
            <i
              v-if="turmaSelecionada?.uuid === turma.uuid && !loadingAlunos"
              class="pi pi-check-circle text-sky-500 shrink-0"
            ></i>
          </button>
        </div>
      </div>

      <div
        v-if="loadingAlunos"
        class="bg-white rounded-2xl border border-slate-100 p-8 flex flex-col items-center gap-3"
      >
        <i class="pi pi-spin pi-spinner text-3xl text-sky-400"></i>
        <p class="text-slate-400 text-sm">Carregando alunos e habilidades...</p>
      </div>

      <div
        v-if="turmaSelecionada && !loadingAlunos && alunos.length > 0"
        class="flex justify-end"
      >
        <button
          @click="irParaEtapa2"
          class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-sm shadow-sky-200 active:scale-95"
        >
          Selecionar Alunos <i class="pi pi-arrow-right text-sm"></i>
        </button>
      </div>

      <div
        v-if="
          turmaSelecionada &&
          !loadingAlunos &&
          alunos.length === 0 &&
          !loadingTurmas
        "
        class="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400"
      >
        <i class="pi pi-users text-4xl mb-2 block"></i>
        Nenhum aluno matriculado nesta turma.
      </div>
    </template>

    <template v-else-if="etapa === 2">
      <div
        class="flex items-center gap-3 bg-sky-50 border border-sky-100 rounded-xl px-4 py-3"
      >
        <button
          @click="irParaEtapa1"
          class="text-sky-600 hover:text-sky-800 transition-colors"
        >
          <i class="pi pi-arrow-left text-sm"></i>
        </button>
        <div
          class="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0"
        >
          {{ turmaSelecionada?.nome.charAt(0).toUpperCase() }}
        </div>
        <div>
          <p class="font-semibold text-sky-800 text-sm">
            {{ turmaSelecionada?.nome }}
          </p>
          <p v-if="turmaSelecionada?.nivelAlvo" class="text-xs text-sky-500">
            {{ turmaSelecionada.nivelAlvo.nome }} ·
            {{ habilidadesAtivas.length }} habilidade(s)
          </p>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div class="p-4 border-b border-slate-50 space-y-3">
          <div class="relative">
            <i
              class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"
            ></i>
            <input
              v-model="buscaAluno"
              type="text"
              placeholder="Buscar aluno por nome..."
              class="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-slate-50 placeholder:text-slate-400"
            />
          </div>
          <div class="flex items-center justify-between">
            <p class="text-xs text-slate-500">
              <span class="font-bold text-sky-600">{{
                alunosSelecionados.size
              }}</span>
              de {{ alunos.length }} selecionados
            </p>
            <div class="flex gap-2">
              <button
                @click="selecionarTodos"
                class="text-xs font-semibold text-sky-600 hover:text-sky-700 px-3 py-1.5 rounded-lg hover:bg-sky-50 border border-sky-200 transition-colors"
              >
                Todos
              </button>
              <button
                @click="limparSelecao"
                class="text-xs font-semibold text-slate-500 px-3 py-1.5 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        <div class="divide-y divide-slate-50 max-h-72 overflow-y-auto">
          <div
            v-for="aluno in alunosFiltrados"
            :key="aluno.uuid"
            role="button"
            tabindex="0"
            @click="toggleAluno(aluno.uuid)"
            @keydown.enter="toggleAluno(aluno.uuid)"
            class="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors text-left group cursor-pointer"
          >
            <div
              class="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all"
              :class="
                alunosSelecionados.has(aluno.uuid)
                  ? 'bg-sky-500 border-sky-500'
                  : 'border-slate-300 bg-white group-hover:border-sky-300'
              "
            >
              <i
                v-if="alunosSelecionados.has(aluno.uuid)"
                class="pi pi-check text-white"
                style="font-size: 0.6rem"
              ></i>
            </div>
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all"
              :class="
                alunosSelecionados.has(aluno.uuid)
                  ? 'bg-gradient-to-br from-sky-400 to-blue-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              "
            >
              {{ iniciais(aluno.nome) }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-slate-800 text-sm truncate">
                {{ aluno.nome }}
              </p>
              <p
                v-if="getNivelNome(aluno)"
                class="text-xs text-slate-400 mt-0.5"
              >
                {{ getNivelNome(aluno) }}
              </p>
            </div>
            <button
              @click.stop="abrirHistorico(aluno)"
              class="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50"
              title="Ver histórico"
            >
              <i class="pi pi-history text-xs"></i>
            </button>
          </div>

          <div
            v-if="alunosFiltrados.length === 0"
            class="text-center py-8 text-slate-400 text-sm"
          >
            Nenhum aluno encontrado.
          </div>
        </div>
      </div>

      <button
        @click="avancarParaWizard"
        :disabled="alunosSelecionados.size === 0"
        class="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold px-6 py-4 rounded-xl transition-all shadow-sm shadow-sky-200 active:scale-95"
      >
        <i class="pi pi-play text-sm"></i>
        Iniciar Avaliação
        <span
          v-if="alunosSelecionados.size > 0"
          class="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full"
        >
          {{ alunosSelecionados.size }} aluno(s)
        </span>
      </button>
    </template>

    <template v-else-if="etapa === 3 && perguntaCorrente">
      <div
        class="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4"
      >
        <div class="flex items-center justify-between mb-2">
          <span
            class="text-xs font-bold text-slate-500 uppercase tracking-wider"
            >Progresso</span
          >
          <span class="text-xs font-bold text-sky-600">
            {{ perguntaAtual + 1 }}/{{ totalPerguntas }}
          </span>
        </div>
        <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-500"
            :style="{ width: `${progresso}%` }"
          ></div>
        </div>
        <div class="flex items-center justify-between mt-2">
          <p class="text-xs text-slate-400">
            <i class="pi pi-tag mr-1 text-slate-300"></i>
            {{ perguntaCorrente.categoria }}
          </p>
          <p
            v-if="semRespostaAtual > 0"
            class="text-xs text-amber-500 font-semibold"
          >
            <i class="pi pi-exclamation-circle mr-1"></i>
            {{ semRespostaAtual }} sem resposta
          </p>
          <p v-else class="text-xs text-emerald-500 font-semibold">
            <i class="pi pi-check-circle mr-1"></i>Todos respondidos
          </p>
        </div>
      </div>

      <div
        class="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-sky-200/50"
      >
        <div class="flex items-center gap-2 mb-3 opacity-70">
          <i class="pi pi-question-circle text-sm"></i>
          <span class="text-xs font-bold uppercase tracking-wider">
            Pergunta {{ perguntaAtual + 1 }}
          </span>
        </div>
        <h2 class="text-xl md:text-2xl font-bold leading-snug">
          {{ perguntaCorrente.descricao }}
        </h2>
        <div class="flex gap-2 mt-5">
          <button
            @click="marcarTodosSim"
            class="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            <i class="pi pi-check text-emerald-300"></i> Todos SIM
          </button>
          <button
            @click="marcarTodosNao"
            class="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
          >
            <i class="pi pi-times text-red-300"></i> Todos NÃO
          </button>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div class="px-5 py-3 border-b border-slate-50">
          <p class="text-sm font-semibold text-slate-700">
            Alunos · {{ turmaSelecionada?.nivelAlvo?.nome ?? '' }}
          </p>
        </div>
        <div class="divide-y divide-slate-50">
          <div
            v-for="aluno in alunosSelecionadosLista"
            :key="aluno.uuid"
            class="flex items-center justify-between px-5 py-4 transition-colors"
            :class="
              getResposta(aluno.uuid) === undefined
                ? 'bg-amber-50/40'
                : 'bg-white'
            "
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all"
                :class="[
                  avatarCls(getResposta(aluno.uuid)),
                  avatarTxtCls(getResposta(aluno.uuid)),
                ]"
              >
                {{ iniciais(aluno.nome) }}
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-slate-800 text-sm truncate">
                  {{ aluno.nome }}
                </p>
                <p
                  class="text-xs mt-0.5"
                  :class="{
                    'text-emerald-600': getResposta(aluno.uuid) === true,
                    'text-red-500': getResposta(aluno.uuid) === false,
                    'text-amber-400': getResposta(aluno.uuid) === undefined,
                  }"
                >
                  {{
                    getResposta(aluno.uuid) === true
                      ? '✓ Sim'
                      : getResposta(aluno.uuid) === false
                        ? '✗ Não'
                        : 'Aguardando...'
                  }}
                </p>
              </div>
            </div>

            <div class="flex gap-2 shrink-0">
              <button
                @click="responder(aluno.uuid, false)"
                class="w-[4.5rem] py-2.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-95"
                :class="
                  getResposta(aluno.uuid) === false
                    ? 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-200'
                    : 'bg-white text-red-400 border-red-200 hover:border-red-400 hover:bg-red-50'
                "
              >
                NÃO
              </button>
              <button
                @click="responder(aluno.uuid, true)"
                class="w-[4.5rem] py-2.5 rounded-xl text-sm font-bold border-2 transition-all active:scale-95"
                :class="
                  getResposta(aluno.uuid) === true
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-200'
                    : 'bg-white text-emerald-500 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'
                "
              >
                SIM
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          @click="voltarPergunta"
          class="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <i class="pi pi-arrow-left text-sm"></i> Voltar
        </button>
        <button
          @click="proximaPergunta"
          class="flex-[2] flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all active:scale-95 shadow-sm"
          :class="
            isUltimaPergunta
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
              : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200'
          "
        >
          <span>{{
            isUltimaPergunta ? 'Ver Resumo' : 'Próxima Pergunta'
          }}</span>
          <i
            :class="
              isUltimaPergunta ? 'pi pi-check-circle' : 'pi pi-arrow-right'
            "
            class="text-sm"
          ></i>
        </button>
      </div>
    </template>

    <template v-else-if="etapa === 4">
      <div
        class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200/50"
      >
        <div class="flex items-center gap-3 mb-1">
          <i class="pi pi-check-circle text-2xl text-emerald-200"></i>
          <h2 class="text-xl font-bold">Avaliação Concluída!</h2>
        </div>
        <p class="text-emerald-100 text-sm">
          {{ alunosSelecionadosLista.length }} aluno(s) ·
          {{ totalPerguntas }} habilidade(s) · revise antes de salvar.
        </p>
      </div>

      <div class="space-y-3">
        <div
          v-for="item in resultado"
          :key="item.aluno.uuid"
          class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                :class="
                  item.pct >= 70
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                    : item.pct >= 40
                      ? 'bg-gradient-to-br from-amber-400 to-amber-500'
                      : 'bg-gradient-to-br from-red-400 to-red-500'
                "
              >
                {{ iniciais(item.aluno.nome) }}
              </div>
              <div>
                <p class="font-bold text-slate-800 text-sm">
                  {{ item.aluno.nome }}
                </p>
                <p class="text-xs text-slate-400 mt-0.5">
                  {{ getNivelNome(item.aluno) }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p
                class="text-2xl font-extrabold"
                :class="
                  item.pct >= 70
                    ? 'text-emerald-600'
                    : item.pct >= 40
                      ? 'text-amber-500'
                      : 'text-red-500'
                "
              >
                {{ item.pct }}%
              </p>
              <p class="text-xs text-slate-400">
                {{ item.aprovadas }}/{{ item.total }}
              </p>
            </div>
          </div>

          <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div
              class="h-full rounded-full"
              :class="
                item.pct >= 70
                  ? 'bg-emerald-500'
                  : item.pct >= 40
                    ? 'bg-amber-500'
                    : 'bg-red-400'
              "
              :style="{ width: `${item.pct}%` }"
            ></div>
          </div>

          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="hab in habilidadesAtivas"
              :key="hab.uuid"
              class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              :class="
                respostas[hab.uuid]?.[item.aluno.uuid] === true
                  ? 'bg-emerald-100 text-emerald-700'
                  : respostas[hab.uuid]?.[item.aluno.uuid] === false
                    ? 'bg-red-100 text-red-600'
                    : 'bg-slate-100 text-slate-400'
              "
              :title="hab.descricao"
            >
              {{
                respostas[hab.uuid]?.[item.aluno.uuid] === true
                  ? '✓'
                  : respostas[hab.uuid]?.[item.aluno.uuid] === false
                    ? '✗'
                    : '–'
              }}
              {{
                hab.descricao.length > 24
                  ? hab.descricao.slice(0, 24) + '…'
                  : hab.descricao
              }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex gap-3 pt-1">
        <button
          @click="revisar"
          class="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
        >
          <i class="pi pi-pencil text-sm"></i> Revisar
        </button>
        <button
          @click="salvarAvaliacao"
          :disabled="salvando"
          class="flex-[2] flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-sm shadow-emerald-200 active:scale-95"
        >
          <i v-if="salvando" class="pi pi-spin pi-spinner text-sm"></i>
          <i v-else class="pi pi-check text-sm"></i>
          {{ salvando ? 'Salvando...' : 'Salvar Avaliação' }}
        </button>
      </div>
    </template>

    <Dialog v-model:visible="modalHistorico" modal :style="{ width: '36rem' }">
      <template #header>
        <div>
          <h3 class="font-bold text-slate-800 text-lg">
            Histórico de Avaliações
          </h3>
          <p class="text-sm text-slate-400 mt-0.5">
            <i class="pi pi-user mr-1"></i>{{ alunoModal?.nome }}
          </p>
        </div>
      </template>

      <div v-if="loadingHistorico" class="flex justify-center py-10">
        <i class="pi pi-spin pi-spinner text-3xl text-sky-400"></i>
      </div>

      <div v-else-if="historico.length === 0" class="text-center py-10">
        <i class="pi pi-inbox text-5xl text-slate-200 mb-3 block"></i>
        <p class="text-slate-400 font-medium">
          Nenhuma avaliação registrada ainda.
        </p>
      </div>

      <div v-else class="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        <div
          v-for="hist in historico"
          :key="hist.uuid"
          class="border border-slate-100 rounded-xl p-4 bg-slate-50"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-2">
                <span
                  class="text-sm font-bold px-2 py-0.5 rounded-full text-white"
                  :style="getCorTouca(hist.corTouca)"
                  :class="!hist.corTouca ? 'bg-sky-500' : ''"
                >
                  {{ hist.nivelNome }}
                </span>
                <span
                  v-if="hist.promovido"
                  class="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700"
                >
                  🏆 Promovido
                </span>
              </div>
              <p class="text-xs text-slate-500">
                <i class="pi pi-calendar mr-1"></i>
                {{ formatarData(hist.dataAvaliacao) }}
                <span class="mx-2 text-slate-300">·</span>
                {{ hist.pontuacaoTotal }} habilidade(s) aprovada(s)
              </p>
            </div>
            <div class="flex flex-col gap-2 shrink-0">
              <Button
                icon="pi pi-file-pdf"
                label="PDF"
                size="small"
                severity="secondary"
                outlined
                :loading="baixandoPdf[hist.uuid]"
                @click="baixarPdf(hist)"
              />
              <Button
                icon="pi pi-whatsapp"
                label="Enviar"
                size="small"
                severity="success"
                :loading="enviandoWA[hist.uuid]"
                @click="enviarWhatsApp(hist)"
              />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>
