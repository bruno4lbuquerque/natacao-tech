<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import api from '@/core/services/api'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import ConfirmDialog from 'primevue/confirmdialog'
import Tooltip from 'primevue/tooltip'

const vTooltip = Tooltip
const toast = useToast()
const confirm = useConfirm()

// ── Estado ──────────────────────────────────────────────────────────────
const niveis = ref<any[]>([])
const habilidades = ref<any[]>([])
const nivelSelecionado = ref<any>(null)
const loading = ref(false)

const showModal = ref(false)
const submitting = ref(false)
const modoEdicao = ref(false)
const uuidEditando = ref<string | null>(null)

const form = ref({ descricao: '', categoria: '' })
const erros = ref({ descricao: '', categoria: '' })

const categoriasDisponiveis = [
  'Controle Respiratório',
  'Flutuação',
  'Propulsão',
  'Imersão',
  'Coordenação',
  'Resistência',
  'Técnica de Nado',
  'Outro',
]

// ── Computed ─────────────────────────────────────────────────────────────
const nivelOptions = computed(() =>
  niveis.value.map((n) => ({ label: n.nome, value: n }))
)

const habilidadesAtivas = computed(() =>
  habilidades.value.filter((h) => h.ativo !== false)
)

const habilidadesPorCategoria = computed(() => {
  const grupos: Record<string, any[]> = {}
  for (const h of habilidadesAtivas.value) {
    grupos[h.categoria] ??= []
    grupos[h.categoria]!.push(h)
  }
  return grupos
})

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  await carregarNiveis()
})

// ── Funções ───────────────────────────────────────────────────────────────
async function carregarNiveis() {
  try {
    const { data } = await api.get('/api/niveis')
    niveis.value = data
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao carregar níveis.',
    })
  }
}

async function aoMudarNivel() {
  if (!nivelSelecionado.value) return
  loading.value = true
  habilidades.value = []
  try {
    const { data } = await api.get(
      `/api/niveis/${nivelSelecionado.value.uuid}/habilidades`
    )
    habilidades.value = data
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao carregar habilidades.',
    })
  } finally {
    loading.value = false
  }
}

function abrirCriar() {
  if (!nivelSelecionado.value) {
    toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Selecione um nível primeiro.',
    })
    return
  }
  modoEdicao.value = false
  uuidEditando.value = null
  form.value = { descricao: '', categoria: '' }
  erros.value = { descricao: '', categoria: '' }
  showModal.value = true
}

function abrirEditar(hab: any) {
  modoEdicao.value = true
  uuidEditando.value = hab.uuid
  form.value = { descricao: hab.descricao, categoria: hab.categoria }
  erros.value = { descricao: '', categoria: '' }
  showModal.value = true
}

function validar(): boolean {
  let ok = true
  erros.value = { descricao: '', categoria: '' }
  if (!form.value.descricao.trim()) {
    erros.value.descricao = 'Descrição é obrigatória.'
    ok = false
  }
  if (!form.value.categoria.trim()) {
    erros.value.categoria = 'Categoria é obrigatória.'
    ok = false
  }
  return ok
}

async function salvar() {
  if (!validar()) return
  submitting.value = true
  try {
    if (modoEdicao.value && uuidEditando.value) {
      const { data } = await api.put(`/api/habilidades/${uuidEditando.value}`, {
        descricao: form.value.descricao,
        categoria: form.value.categoria,
      })
      const idx = habilidades.value.findIndex(
        (h) => h.uuid === uuidEditando.value
      )
      if (idx !== -1) habilidades.value[idx] = data
      toast.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Habilidade atualizada!',
      })
    } else {
      const { data } = await api.post('/api/habilidades', {
        nivelId: nivelSelecionado.value.uuid,
        descricao: form.value.descricao,
        categoria: form.value.categoria,
      })
      habilidades.value.push(data)
      toast.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Habilidade criada!',
      })
    }
    showModal.value = false
  } catch (e: any) {
    const msg = e.response?.data?.message || 'Falha ao salvar.'
    toast.add({ severity: 'error', summary: 'Erro', detail: msg })
  } finally {
    submitting.value = false
  }
}

function confirmarRemocao(hab: any) {
  confirm.require({
    message: `Desativar "${hab.descricao}"? Ela não aparecerá mais nas avaliações.`,
    header: 'Confirmar Desativação',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Desativar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/api/habilidades/${hab.uuid}`)
        const idx = habilidades.value.findIndex((h) => h.uuid === hab.uuid)
        if (idx !== -1) habilidades.value[idx].ativo = false
        toast.add({
          severity: 'success',
          summary: 'Desativada',
          detail: 'Habilidade desativada.',
        })
      } catch {
        toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível desativar.',
        })
      }
    },
  })
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 p-4">
    <ConfirmDialog />

    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span
            class="bg-sky-100 text-sky-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
          >
            Gestão
          </span>
        </div>
        <h1
          class="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight"
        >
          Habilidades por Nível
        </h1>
        <p class="text-slate-500 text-sm mt-1">
          Defina os critérios de avaliação para cada touca.
        </p>
      </div>

      <Button
        label="Nova Habilidade"
        icon="pi pi-plus"
        :disabled="!nivelSelecionado"
        @click="abrirCriar"
        class="w-full md:w-auto"
      />
    </div>

    <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <label class="block text-sm font-semibold text-slate-700 mb-2">
        Selecione o Nível (Touca)
      </label>
      <Select
        v-model="nivelSelecionado"
        :options="nivelOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Escolha um nível para ver suas habilidades..."
        class="w-full md:w-96"
        @change="aoMudarNivel"
      />
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <i class="pi pi-spin pi-spinner text-4xl text-sky-500"></i>
    </div>

    <div
      v-else-if="!nivelSelecionado"
      class="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200"
    >
      <i class="pi pi-list-check text-4xl text-slate-300 mb-3 block"></i>
      <p class="text-slate-500 font-medium">Selecione um nível acima</p>
      <p class="text-slate-400 text-sm mt-1">
        As habilidades cadastradas aparecerão aqui.
      </p>
    </div>

    <div
      v-else-if="habilidadesAtivas.length === 0"
      class="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200"
    >
      <i class="pi pi-plus-circle text-4xl text-sky-300 mb-3 block"></i>
      <p class="text-slate-500 font-medium">Nenhuma habilidade cadastrada</p>
      <p class="text-slate-400 text-sm mt-1 mb-4">
        Clique em "Nova Habilidade" para começar.
      </p>
      <Button
        label="Nova Habilidade"
        icon="pi pi-plus"
        size="small"
        @click="abrirCriar"
      />
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(itens, categoria) in habilidadesPorCategoria"
        :key="categoria"
        class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div
          class="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100"
        >
          <i class="pi pi-tag text-sky-500 text-sm"></i>
          <span
            class="font-semibold text-slate-700 text-sm uppercase tracking-wide"
            >{{ categoria }}</span
          >
          <span
            class="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full"
            >{{ itens.length }}</span
          >
        </div>

        <div class="divide-y divide-slate-50">
          <div
            v-for="hab in itens"
            :key="hab.uuid"
            class="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors group"
          >
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full bg-sky-400 shrink-0"></div>
              <span class="text-slate-700 text-sm">{{ hab.descricao }}</span>
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
                @click="abrirEditar(hab)"
              />
              <Button
                icon="pi pi-times"
                text
                rounded
                size="small"
                severity="danger"
                v-tooltip.top="'Desativar'"
                @click="confirmarRemocao(hab)"
              />
            </div>
          </div>
        </div>
      </div>

      <p class="text-right text-xs text-slate-400">
        {{ habilidadesAtivas.length }} habilidade(s) ativa(s) neste nível
      </p>
    </div>

    <Dialog
      v-model:visible="showModal"
      modal
      :header="modoEdicao ? 'Editar Habilidade' : 'Nova Habilidade'"
      :style="{ width: '26rem' }"
      :closable="!submitting"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-slate-700">
            Descrição <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="form.descricao"
            placeholder="Ex: Solta bolhas na superfície"
            :class="{ 'p-invalid': erros.descricao }"
            class="w-full"
          />
          <small v-if="erros.descricao" class="text-red-500 text-xs">{{
            erros.descricao
          }}</small>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-semibold text-slate-700">
            Categoria <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="form.categoria"
            :options="categoriasDisponiveis"
            editable
            placeholder="Selecione ou digite uma categoria"
            :class="{ 'p-invalid': erros.categoria }"
            class="w-full"
          />
          <small v-if="erros.categoria" class="text-red-500 text-xs">{{
            erros.categoria
          }}</small>
          <small class="text-slate-400 text-xs"
            >Você pode selecionar uma existente ou digitar uma nova.</small
          >
        </div>

        <div
          v-if="!modoEdicao"
          class="bg-sky-50 border border-sky-100 rounded-lg p-3 text-xs text-sky-700"
        >
          <i class="pi pi-info-circle mr-1"></i>
          Será adicionada ao nível:
          <strong>{{ nivelSelecionado?.nome }}</strong>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            label="Cancelar"
            severity="secondary"
            outlined
            :disabled="submitting"
            @click="showModal = false"
          />
          <Button
            :label="modoEdicao ? 'Salvar' : 'Criar Habilidade'"
            icon="pi pi-check"
            :loading="submitting"
            @click="salvar"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
