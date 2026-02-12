<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/core/services/api' // Importando API para cadastro

import { useStudentsStore } from '@/modules/students/stores/students'
import { useClassesStore } from '@/modules/classes/stores/classes'
import { useLevelsStore } from '@/modules/levels/stores/levels'

import Select from 'primevue/select'
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Calendar from 'primevue/calendar'

const toast = useToast()
const studentsStore = useStudentsStore()
const classesStore = useClassesStore()
const levelsStore = useLevelsStore()

const selectedClass = ref<any>(null)
const searchQuery = ref('')

// Controle do Modal de Cadastro
const showCreateModal = ref(false)
const createLoading = ref(false)
const newStudent = ref({
  nome: '',
  dataNascimento: null,
  nomeResponsavel: '',
  telefoneResponsavel: '',
  nivelId: null,
  turmaId: null,
})

onMounted(async () => {
  await Promise.all([
    studentsStore.fetchStudents(),
    classesStore.fetchClasses(),
    levelsStore.fetchLevels(),
  ])
  selectedClass.value = { name: 'Todas as Turmas', code: 'all' }
})

const classOptions = computed(() => {
  const options = classesStore.classes.map((t) => ({
    name: `${t.nome} - ${t.horario}`,
    code: t.uuid,
  }))
  return [{ name: 'Todas as Turmas', code: 'all' }, ...options]
})

const formClassOptions = computed(() =>
  classesStore.classes.map((t) => ({
    name: `${t.nome} - ${t.horario}`,
    code: t.uuid,
  }))
)

const levelOptions = computed(() => {
  return levelsStore.levels.map((l) => ({
    name: l.nome,
    code: l.id,
  }))
})

const filteredStudents = computed(() => {
  return studentsStore.students.filter((student: any) => {
    const matchesSearch = student.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase())

    const matchesClass =
      !selectedClass.value ||
      selectedClass.value.code === 'all' ||
      student.class_code.includes(selectedClass.value.name.split(' - ')[0])

    return matchesSearch && matchesClass
  })
})

const showMoveModal = ref(false)
const studentToMove = ref<any>(null)
const targetClass = ref<any>(null)

function getLevelName(levelCode: string) {
  return levelCode
}

function openMoveModal(student: any) {
  studentToMove.value = student
  targetClass.value = null
  showMoveModal.value = true
}

async function saveMove() {
  if (!targetClass.value || !studentToMove.value) return

  const result = await studentsStore.transferStudent(
    studentToMove.value.id,
    targetClass.value.code
  )

  if (result.success) {
    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Aluno transferido!',
      life: 3000,
    })
    showMoveModal.value = false
  } else {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao transferir.',
      life: 3000,
    })
  }
}

function openCreateModal() {
  // Limpa o formulário
  newStudent.value = {
    nome: '',
    dataNascimento: null,
    nomeResponsavel: '',
    telefoneResponsavel: '',
    nivelId: null,
    turmaId: null,
  }
  showCreateModal.value = true
}

async function createStudent() {
  if (
    !newStudent.value.nome ||
    !newStudent.value.nivelId ||
    !newStudent.value.dataNascimento
  ) {
    toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Preencha os campos obrigatórios.',
    })
    return
  }

  createLoading.value = true
  try {
    const date = new Date(newStudent.value.dataNascimento)
    const formattedDate = date.toISOString().split('T')[0]

    const payload = {
      nome: newStudent.value.nome,
      dataNascimento: formattedDate,
      nomeResponsavel: newStudent.value.nomeResponsavel,
      telefoneResponsavel: newStudent.value.telefoneResponsavel,
      nivelId: newStudent.value.nivelId,
      turmaId: newStudent.value.turmaId,
    }

    await api.post('/api/alunos', payload)

    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Aluno cadastrado!',
      life: 3000,
    })
    showCreateModal.value = false
    studentsStore.fetchStudents()
  } catch (error) {
    console.error(error)
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao cadastrar aluno.',
    })
  } finally {
    createLoading.value = false
  }
}
</script>

<template>
  <div class="card p-4 bg-white rounded-lg shadow-sm">
    <div
      class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6"
    >
      <h1 class="text-2xl font-bold text-gray-800">Alunos</h1>

      <div class="flex gap-2 w-full md:w-auto flex-wrap">
        <IconField iconPosition="left" class="w-full md:w-auto">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            placeholder="Buscar aluno..."
            class="w-full"
          />
        </IconField>

        <Select
          v-model="selectedClass"
          :options="classOptions"
          optionLabel="name"
          placeholder="Filtrar Turma"
          class="w-48"
        />

        <Button label="Novo Aluno" icon="pi pi-plus" @click="openCreateModal" />
      </div>
    </div>

    <div v-if="studentsStore.loading" class="text-center py-10">
      <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div
        v-for="student in filteredStudents"
        :key="student.id"
        class="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold"
          >
            {{ student.name.charAt(0) }}
          </div>
          <div>
            <h3 class="font-bold text-gray-800">{{ student.name }}</h3>
            <div class="flex gap-2 text-sm text-gray-500">
              <span>{{ student.class_code }}</span>
              <span>•</span>
              <span class="capitalize">{{ getLevelName(student.level) }}</span>
            </div>
          </div>
        </div>

        <Button
          icon="pi pi-arrow-right-arrow-left"
          text
          rounded
          aria-label="Mover"
          @click="openMoveModal(student)"
        />
      </div>

      <div
        v-if="filteredStudents.length === 0"
        class="text-center text-gray-500 py-8"
      >
        Nenhum aluno encontrado.
      </div>
    </div>

    <Dialog
      v-model:visible="showMoveModal"
      modal
      header="Transferir Aluno"
      :style="{ width: '25rem' }"
    >
      <div class="flex flex-col gap-4 pt-4">
        <p class="text-sm text-gray-600">
          Selecione a nova turma para <strong>{{ studentToMove?.name }}</strong
          >.
        </p>
        <div class="flex flex-col gap-2">
          <label class="font-bold text-sm">Nova Turma</label>
          <Select
            v-model="targetClass"
            :options="classOptions.filter((c) => c.code !== 'all')"
            optionLabel="name"
            placeholder="Selecione..."
            class="w-full"
          />
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <Button
            label="Cancelar"
            severity="secondary"
            @click="showMoveModal = false"
          />
          <Button label="Confirmar" @click="saveMove" />
        </div>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="showCreateModal"
      modal
      header="Cadastrar Aluno"
      :style="{ width: '30rem' }"
    >
      <div class="flex flex-col gap-4 pt-2">
        <div class="flex flex-col gap-2">
          <label class="font-bold text-sm">Nome Completo *</label>
          <InputText v-model="newStudent.nome" placeholder="Ex: João Silva" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="font-bold text-sm">Data de Nascimento *</label>
          <Calendar
            v-model="newStudent.dataNascimento"
            dateFormat="dd/mm/yy"
            showIcon
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="font-bold text-sm">Responsável</label>
            <InputText
              v-model="newStudent.nomeResponsavel"
              placeholder="Ex: Maria"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="font-bold text-sm">Telefone</label>
            <InputText
              v-model="newStudent.telefoneResponsavel"
              placeholder="(XX) 9..."
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="font-bold text-sm">Nível Inicial *</label>
            <Select
              v-model="newStudent.nivelId"
              :options="levelOptions"
              optionLabel="name"
              optionValue="code"
              placeholder="Selecione..."
            />
          </div>
          <div class="flex flex-col gap-2">
            <label class="font-bold text-sm">Turma (Opcional)</label>
            <Select
              v-model="newStudent.turmaId"
              :options="formClassOptions"
              optionLabel="name"
              optionValue="code"
              placeholder="Selecione..."
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-4 border-t pt-4">
          <Button
            label="Cancelar"
            severity="secondary"
            @click="showCreateModal = false"
          />
          <Button
            label="Cadastrar"
            icon="pi pi-check"
            @click="createStudent"
            :loading="createLoading"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
