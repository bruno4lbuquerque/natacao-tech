<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/core/services/api'

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

const toast = useToast()
const confirm = useConfirm()
const classesStore = useClassesStore()
const levelsStore = useLevelsStore()

const showCreateModal = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const academias = ref<any[]>([])

// FORMULÁRIO
const form = ref({
  nome: '',
  horario: null as Date | null,
  diasSemana: [] as string[],
  nivelAlvoId: null as string | null,
  academiaId: '',
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
  await Promise.all([
    classesStore.fetchClasses(),
    levelsStore.fetchLevels(),
    fetchAcademias(),
  ])
})

async function fetchAcademias() {
  try {
    const res = await api.get('/api/academias')
    academias.value = res.data
    if (academias.value.length > 0 && !form.value.academiaId) {
      form.value.academiaId = academias.value[0].uuid
    }
  } catch (e) {
    console.error('Erro ao buscar academias. Verifique se está logado.', e)
  }
}

const filteredClasses = computed(() => {
  if (!searchQuery.value) return classesStore.classes
  const lower = searchQuery.value.toLowerCase()
  return classesStore.classes.filter(
    (c) =>
      c.nome.toLowerCase().includes(lower) ||
      (c.nivelAlvo?.nome && c.nivelAlvo.nome.toLowerCase().includes(lower))
  )
})

const academiaOptions = computed(() =>
  academias.value.map((a) => ({
    label: a.nome,
    value: a.uuid,
  }))
)

function openCreateModal() {
  form.value = {
    nome: '',
    horario: null,
    diasSemana: [],
    nivelAlvoId: null,
    academiaId: form.value.academiaId || academias.value[0]?.uuid || '',
  }
  showCreateModal.value = true
}

function confirmDelete(turma: any) {
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
          detail: 'Erro ao excluir (permissão?)',
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
  if (!form.value.horario)
    return toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Informe o horário.',
    })
  if (form.value.diasSemana.length === 0)
    return toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Selecione os dias.',
    })
  if (!form.value.nivelAlvoId)
    return toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Selecione o Nível.',
    })
  if (!form.value.academiaId)
    return toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Academia não identificada.',
    })

  submitting.value = true

  try {
    const timeString = form.value.horario.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })

    const payload = {
      nome: form.value.nome,
      horario: timeString,
      diasSemana: form.value.diasSemana,
      nivelAlvoId: form.value.nivelAlvoId,
      academiaId: form.value.academiaId,
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
        detail: 'Falha ao criar. Verifique se é ADMIN.',
      })
    }
  } catch (error) {
    console.error(error)
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha na comunicação.',
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
      <p class="text-gray-500">Nenhuma turma encontrada (ou acesso negado).</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="turma in filteredClasses"
        :key="turma.uuid"
        class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative"
      >
        <Button
          icon="pi pi-trash"
          text
          severity="danger"
          class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          @click="confirmDelete(turma)"
        />

        <div class="flex justify-between items-start mb-4">
          <div
            class="w-12 h-12 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 font-bold text-lg group-hover:bg-sky-600 group-hover:text-white transition-colors"
          >
            {{ turma.nome.charAt(0).toUpperCase() }}
          </div>
          <Tag :value="turma.nivelAlvo?.nome || 'Multinível'" severity="info" />
        </div>

        <h3 class="font-bold text-lg text-gray-800 mb-1">{{ turma.nome }}</h3>

        <div class="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <i class="pi pi-clock"></i>
          <span>{{ turma.horario.substring(0, 5) }}</span>
        </div>

        <div class="flex flex-wrap gap-1 mb-4">
          <span
            v-for="day in formatDays(turma.diasSemana)"
            :key="day"
            class="text-[10px] uppercase font-bold px-2 py-1 bg-gray-50 text-gray-600 rounded"
          >
            {{ day }}
          </span>
        </div>

        <div
          class="pt-4 border-t border-gray-50 flex justify-between items-center"
        >
          <span class="text-xs text-gray-400 font-medium">
            <i class="pi pi-building mr-1"></i>
            {{ turma.nomeProfessor || 'Sua Turma' }}
          </span>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="showCreateModal"
      modal
      header="Nova Turma"
      :style="{ width: '30rem' }"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-2">
          <label class="font-bold text-sm text-gray-700">Nome da Turma</label>
          <InputText v-model="form.nome" placeholder="Ex: Baby Manhã A" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="font-bold text-sm text-gray-700">Horário</label>
            <DatePicker
              v-model="form.horario"
              timeOnly
              hourFormat="24"
              placeholder="00:00"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="font-bold text-sm text-gray-700">Nível Alvo</label>
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
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-sm text-gray-700">Dias da Semana</label>
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

        <div class="flex flex-col gap-2">
          <label class="font-bold text-sm text-gray-700"
            >Unidade (Academia)</label
          >
          <Select
            v-model="form.academiaId"
            :options="academiaOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
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
