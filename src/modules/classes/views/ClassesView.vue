<template>
  <div class="max-w-6xl mx-auto p-4 space-y-6">
    <ConfirmDialog />

    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Minhas Turmas</h1>
        <p class="text-gray-500">Gerencie horários, níveis e alunos.</p>
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
      <p class="text-gray-500">
        Nenhuma turma encontrada para o filtro "{{ searchQuery }}".
      </p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="turma in filteredClasses"
        :key="turma.uuid"
        @click="openClassStudentsModal(turma)"
        class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-sky-400 transition-all duration-300 group flex flex-col justify-between cursor-pointer"
      >
        <div>
          <div class="flex justify-between items-start mb-4">
            <div
              class="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 font-bold text-xl group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300"
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

        <div class="pt-4 border-t border-gray-50 flex flex-col gap-2 mt-auto">
          <div class="flex items-center text-sm text-gray-600">
            <i class="pi pi-user mr-2 text-slate-400"></i>
            {{ turma.professor?.nome || 'Sem professor atribuído' }}
          </div>
          <div class="flex items-center justify-between text-sm text-gray-600">
            <span class="flex items-center gap-2">
              <i class="pi pi-users text-slate-400"></i>
              {{ getStudentCount(turma.uuid) }} alunos matriculados
            </span>
            <Button
              icon="pi pi-trash"
              text
              rounded
              severity="secondary"
              class="w-8 h-8 !text-gray-300 hover:!text-red-500 hover:bg-red-50 transition-colors z-10"
              v-tooltip.bottom="'Excluir Turma'"
              @click.stop="confirmDelete(turma)"
            />
          </div>
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
            <InputText
              v-model="form.horarioInicio"
              type="time"
              class="w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="font-bold text-sm text-gray-700"
              >Fim <span class="text-red-500">*</span></label
            >
            <InputText v-model="form.horarioFim" type="time" class="w-full" />
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
            >Professor Responsável <span class="text-red-500">*</span></label
          >
          <Select
            v-model="form.professorId"
            :options="professores"
            optionLabel="nome"
            optionValue="uuid"
            placeholder="Selecione um professor"
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
            outlined
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

    <Dialog
      v-model:visible="showStudentsModal"
      modal
      header="Alunos Matriculados"
      :style="{ width: '36rem' }"
    >
      <div v-if="selectedClass" class="flex flex-col gap-4 pt-2">
        <div class="bg-slate-50 border border-slate-100 rounded-lg p-4">
          <p class="text-sm text-gray-500">
            Turma:
            <strong class="text-gray-800">{{ selectedClass.nome }}</strong> ({{
              formatarHorario(selectedClass.horarioInicio)
            }})
          </p>
        </div>

        <div
          v-if="classStudents.length === 0"
          class="text-center py-8 text-gray-500"
        >
          <i class="pi pi-users text-3xl mb-2 text-slate-300 block"></i>
          Nenhum aluno matriculado nesta turma ainda.
        </div>

        <ul
          v-else
          class="divide-y divide-gray-100 max-h-96 overflow-y-auto pr-2"
        >
          <li
            v-for="student in classStudents"
            :key="student.id"
            class="py-3 flex justify-between items-center"
          >
            <div class="flex items-center">
              <div
                class="w-10 h-10 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center font-bold mr-4"
              >
                {{ student.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">
                  {{ student.name }}
                </p>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ student.age }} anos • Contato: {{ student.contact }}
                </p>
              </div>
            </div>
            <Tag
              :value="student.status === 'active' ? 'Ativo' : 'Inativo'"
              :severity="student.status === 'active' ? 'success' : 'danger'"
            />
          </li>
        </ul>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

import api from '@/core/services/api'
import { useClassesStore } from '@/modules/classes/stores/classes'
import { useStudentsStore } from '@/modules/students/stores/students'
import { useLevelsStore } from '@/modules/levels/stores/levels'
import { formatDays } from '@/core/utils/formatters'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import MultiSelect from 'primevue/multiselect'
import Select from 'primevue/select'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import ConfirmDialog from 'primevue/confirmdialog'

const toast = useToast()
const confirm = useConfirm()
const classesStore = useClassesStore()
const studentsStore = useStudentsStore()
const levelsStore = useLevelsStore()

const showCreateModal = ref(false)
const showStudentsModal = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const selectedClass = ref<any>(null)
const professores = ref([])

const form = ref({
  nome: '',
  horarioInicio: '',
  horarioFim: '',
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

const carregarProfessores = async () => {
  try {
    const { data } = await api.get('/api/professores')
    professores.value = data
  } catch (error) {
    console.error('Erro ao buscar professores', error)
  }
}

onMounted(async () => {
  await Promise.all([
    classesStore.fetchClasses(),
    levelsStore.fetchLevels(),
    carregarProfessores(),
  ])
})

const filteredClasses = computed(() => {
  if (!searchQuery.value) return classesStore.classes
  const lower = searchQuery.value.toLowerCase()
  return classesStore.classes.filter(
    (c: any) =>
      (c.nome ?? '').toLowerCase().includes(lower) ||
      (c.nivelAlvo?.nome?.toLowerCase().includes(lower) ?? false) ||
      (c.professor?.nome?.toLowerCase().includes(lower) ?? false)
  )
})

function formatarHorario(horario: string | null | undefined): string {
  if (!horario) return '--:--'
  return horario.substring(0, 5)
}

function getStudentCount(turmaUuid: string) {
  return studentsStore.students.filter(
    (s) => s.classIds && s.classIds.includes(turmaUuid)
  ).length
}

const classStudents = computed(() => {
  if (!selectedClass.value) return []
  return studentsStore.students.filter(
    (s) => s.classIds && s.classIds.includes(selectedClass.value.uuid)
  )
})

function openClassStudentsModal(classItem: any) {
  selectedClass.value = classItem
  showStudentsModal.value = true
}

function openCreateModal() {
  form.value = {
    nome: '',
    horarioInicio: '',
    horarioFim: '',
    diasSemana: [],
    nivelAlvoId: null,
    professorId: null,
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
  if (
    !form.value.nome ||
    !form.value.horarioInicio ||
    !form.value.horarioFim ||
    form.value.diasSemana.length === 0 ||
    !form.value.nivelAlvoId ||
    !form.value.professorId
  ) {
    return toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Preencha todos os campos obrigatórios.',
    })
  }

  submitting.value = true
  try {
    const payload: any = {
      nome: form.value.nome,
      horarioInicio:
        form.value.horarioInicio.length === 5
          ? `${form.value.horarioInicio}:00`
          : form.value.horarioInicio,
      horarioFim:
        form.value.horarioFim.length === 5
          ? `${form.value.horarioFim}:00`
          : form.value.horarioFim,
      diasSemana: form.value.diasSemana,
      nivelAlvoId: form.value.nivelAlvoId,
      professorId: form.value.professorId,
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
