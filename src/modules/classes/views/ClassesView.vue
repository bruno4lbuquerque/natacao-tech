<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'

import { useClassesStore } from '@/modules/classes/stores/classes'
import { useLevelsStore } from '@/modules/levels/stores/levels'
import { formatDays } from '@/core/utils/formatters'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

interface TurmaItem {
  uuid: string
  nome: string
  horarioInicio: string
  horarioFim: string
  diasSemana: string[]
  professor?: {
    uuid: string
    nome: string
    email: string
    nomeAcademia: string
    cargo?: string | null
  } | null
  nivelAlvo?: { uuid: string; nome: string; corTouca?: string | null } | null
  quantidadeAlunos?: number
}

const toast = useToast()
const confirm = useConfirm()
const classesStore = useClassesStore()
const levelsStore = useLevelsStore()

const showCreateModal = ref(false)
const submitting = ref(false)
const searchQuery = ref('')

const form = ref({
  nome: '',
  horarioInicio: null as Date | null,
  horarioFim: null as Date | null,
  diasSemana: [] as string[],
  nivelAlvoId: null as string | null,
  professorId: null as string | null,
})

const weekDays = [
  { label: 'Segunda-feira', value: 'SEGUNDA' },
  { label: 'Terça-feira', value: 'TERCA' },
  { label: 'Quarta-feira', value: 'QUARTA' },
  { label: 'Quinta-feira', value: 'QUINTA' },
  { label: 'Sexta-feira', value: 'SEXTA' },
  { label: 'Sábado', value: 'SABADO' },
]

onMounted(async () => {
  await Promise.all([classesStore.fetchClasses(), levelsStore.fetchLevels()])
})

const filteredClasses = computed(() => {
  if (!searchQuery.value) return classesStore.classes
  const lower = searchQuery.value.toLowerCase()
  return classesStore.classes.filter(
    (c: TurmaItem) =>
      (c.nome ?? '').toLowerCase().includes(lower) ||
      (c.nivelAlvo?.nome?.toLowerCase().includes(lower) ?? false)
  )
})

function formatarHorario(horario: string | null | undefined): string {
  if (!horario) return '--:--'
  return horario.substring(0, 5)
}

function toTimeString(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function openCreateModal() {
  form.value = {
    nome: '',
    horarioInicio: null,
    horarioFim: null,
    diasSemana: [],
    nivelAlvoId: null,
    professorId: null,
  }
  showCreateModal.value = true
}

function confirmDelete(turma: TurmaItem) {
  confirm.require({
    message: `Tem certeza que deseja excluir a turma "${turma.nome}"?`,
    header: 'Confirmar Exclusão',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancelar',
    acceptLabel: 'Excluir',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const res = await classesStore.deleteClass(turma.uuid)
      if (res.success) {
        toast.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Turma excluída.',
        })
      } else {
        toast.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível excluir a turma.',
        })
      }
    },
  })
}

async function saveClass() {
  if (!form.value.nome)
    return toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Informe o nome da turma.',
    })
  if (!form.value.horarioInicio)
    return toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Informe o horário de início.',
    })
  if (!form.value.horarioFim)
    return toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Informe o horário de fim.',
    })
  if (form.value.diasSemana.length === 0)
    return toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Selecione ao menos um dia.',
    })
  if (!form.value.nivelAlvoId)
    return toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Selecione o nível alvo.',
    })

  submitting.value = true
  try {
    const payload = {
      nome: form.value.nome,
      horarioInicio: toTimeString(form.value.horarioInicio),
      horarioFim: toTimeString(form.value.horarioFim),
      diasSemana: form.value.diasSemana,
      nivelAlvoId: form.value.nivelAlvoId,
      professorId: form.value.professorId ?? null,
    }
    const res = await classesStore.createClass(payload)
    if (res.success) {
      toast.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Turma criada!',
      })
      showCreateModal.value = false
    } else {
      toast.add({
        severity: 'error',
        summary: 'Erro',
        detail: res.error ?? 'Falha ao criar turma.',
      })
    }
  } catch (error) {
    console.error(error)
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha na comunicação com o servidor.',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto p-4 space-y-6">
    <ConfirmDialog />

    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Minhas Turmas</h1>
        <p class="text-gray-500">Gerencie horários e níveis.</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <IconField iconPosition="left" class="w-full sm:w-64">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            placeholder="Buscar turma..."
            class="w-full"
          />
        </IconField>
        <Button
          label="Nova Turma"
          icon="pi pi-plus"
          @click="openCreateModal"
          class="w-full sm:w-auto"
        />
      </div>
    </div>

    <div v-if="classesStore.loading" class="text-center py-10">
      <i class="pi pi-spin pi-spinner text-4xl text-sky-500"></i>
    </div>

    <div
      v-else-if="filteredClasses.length === 0"
      class="text-center py-12 bg-white rounded-xl border border-gray-100"
    >
      <i class="pi pi-calendar text-4xl text-slate-200 mb-3 block"></i>
      <p class="text-gray-500">Nenhuma turma encontrada.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="turma in filteredClasses"
        :key="turma.uuid"
        class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-4">
            <div
              class="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 font-bold text-xl group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300"
            >
              {{ turma.nome?.charAt(0)?.toUpperCase() ?? '?' }}
            </div>
            <Tag
              :value="turma.nivelAlvo?.nome || 'Multinível'"
              severity="info"
              class="text-xs"
            />
          </div>

          <h3 class="font-bold text-lg text-gray-800 mb-1 leading-tight">
            {{ turma.nome }}
          </h3>

          <div class="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <i class="pi pi-clock text-sky-400"></i>
            <span class="font-medium">
              {{ formatarHorario(turma.horarioInicio) }} –
              {{ formatarHorario(turma.horarioFim) }}
            </span>
          </div>

          <div class="flex flex-wrap gap-1 mb-4">
            <span
              v-for="(dia, i) in formatDays(turma.diasSemana ?? [])"
              :key="`${turma.uuid}-dia-${i}`"
              class="text-[10px] uppercase font-bold px-2 py-1 bg-slate-50 text-slate-500 rounded-md border border-slate-100"
            >
              {{ dia }}
            </span>
          </div>
        </div>

        <div
          class="pt-4 border-t border-gray-50 flex justify-between items-center mt-auto"
        >
          <span
            class="text-xs text-gray-400 font-medium flex items-center gap-1"
          >
            <i class="pi pi-user"></i>
            {{ turma.professor?.nome || 'Sem professor' }}
          </span>
          <Button
            icon="pi pi-trash"
            text
            rounded
            severity="secondary"
            class="w-8 h-8 !text-gray-300 hover:!text-red-500 hover:bg-red-50 transition-colors"
            v-tooltip.bottom="'Excluir Turma'"
            @click="confirmDelete(turma)"
          />
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="showCreateModal"
      modal
      header="Nova Turma"
      :style="{ width: '32rem' }"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-2">
          <label class="font-bold text-sm text-gray-700"
            >Nome da Turma <span class="text-red-500">*</span></label
          >
          <InputText v-model="form.nome" placeholder="Ex: Baby Manhã A" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="font-bold text-sm text-gray-700"
              >Início <span class="text-red-500">*</span></label
            >
            <DatePicker
              v-model="form.horarioInicio"
              timeOnly
              hourFormat="24"
              placeholder="09:00"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="font-bold text-sm text-gray-700"
              >Fim <span class="text-red-500">*</span></label
            >
            <DatePicker
              v-model="form.horarioFim"
              timeOnly
              hourFormat="24"
              placeholder="10:00"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-sm text-gray-700"
            >Nível Alvo <span class="text-red-500">*</span></label
          >
          <Select
            v-model="form.nivelAlvoId"
            :options="levelsStore.levels"
            optionLabel="nome"
            optionValue="uuid"
            placeholder="Selecione o nível"
            class="w-full"
            filter
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-sm text-gray-700"
            >Dias da Semana <span class="text-red-500">*</span></label
          >
          <MultiSelect
            v-model="form.diasSemana"
            :options="weekDays"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecione os dias"
            :maxSelectedLabels="3"
            class="w-full"
          />
        </div>

        <div class="flex justify-end gap-2 mt-2 pt-4 border-t border-gray-100">
          <Button
            label="Cancelar"
            severity="secondary"
            @click="showCreateModal = false"
          />
          <Button
            label="Criar Turma"
            icon="pi pi-check"
            @click="saveClass"
            :loading="submitting"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
