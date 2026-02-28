<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold text-gray-900">Alunos</h1>
        <button
          @click="toggleFiltro"
          class="text-sm font-medium px-3 py-1.5 rounded-md border transition-colors"
          :class="
            mostrarApenasMeus
              ? 'bg-sky-100 text-sky-700 border-sky-200'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          "
        >
          {{ mostrarApenasMeus ? 'Ver Todos' : 'Meus Alunos' }}
        </button>
      </div>
      <button
        @click="openModal()"
        class="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 flex items-center space-x-2 transition-colors"
      >
        <i class="pi pi-plus text-sm"></i>
        <span>Novo Aluno</span>
      </button>
    </div>

    <div
      class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-600 border-b border-gray-100">
            <tr>
              <th class="px-6 py-4 font-semibold">Nome</th>
              <th class="px-6 py-4 font-semibold">Idade</th>
              <th class="px-6 py-4 font-semibold">Nível</th>
              <th class="px-6 py-4 font-semibold">Turmas</th>
              <th class="px-6 py-4 font-semibold">Status</th>
              <th class="px-6 py-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="student in studentsStore.students"
              :key="student.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="px-6 py-4 font-medium text-slate-800">
                {{ student.name }}
              </td>
              <td class="px-6 py-4 text-slate-500">{{ student.age }} anos</td>
              <td class="px-6 py-4">
                <span
                  class="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-100 rounded-full text-xs font-medium"
                >
                  {{ student.level }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1.5">
                  <template
                    v-if="student.turmas && student.turmas !== 'Sem Turma'"
                  >
                    <span
                      v-for="turma in student.turmas.split(', ')"
                      :key="turma"
                      class="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium"
                    >
                      {{ turma }}
                    </span>
                  </template>
                  <span v-else class="text-slate-400 text-xs italic"
                    >Sem turma</span
                  >
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="
                    student.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-red-50 text-red-700 border-red-100'
                  "
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                >
                  {{ student.status === 'active' ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-1">
                <button
                  @click="abrirHistorico(student.id)"
                  class="w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors inline-flex items-center justify-center"
                  title="Ver Histórico"
                >
                  <i class="pi pi-history"></i>
                </button>
                <button
                  @click="openModal(student)"
                  class="w-8 h-8 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors inline-flex items-center justify-center"
                  title="Editar"
                >
                  <i class="pi pi-pencil"></i>
                </button>
                <button
                  @click="deleteStudent(student.id)"
                  class="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors inline-flex items-center justify-center"
                  title="Excluir"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl">
        <h2 class="text-xl font-bold text-slate-800 mb-6">
          {{ editingId ? 'Editar Aluno' : 'Novo Aluno' }}
        </h2>
        <form @submit.prevent="saveStudent" class="space-y-4">
          <div class="grid grid-cols-2 gap-5">
            <div class="col-span-2">
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Nome Completo</label
              >
              <input
                v-model="form.name"
                type="text"
                required
                class="block w-full rounded-lg border-slate-200 px-3 py-2 focus:border-sky-500 focus:ring-sky-500 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Idade</label
              >
              <input
                v-model="form.age"
                type="number"
                required
                class="block w-full rounded-lg border-slate-200 px-3 py-2 focus:border-sky-500 focus:ring-sky-500 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Nível</label
              >
              <select
                v-model="form.nivelId"
                :required="!editingId"
                :disabled="!!editingId"
                class="block w-full rounded-lg border-slate-200 px-3 py-2 focus:border-sky-500 focus:ring-sky-500 text-sm bg-white disabled:bg-slate-100"
              >
                <option value="" disabled>Selecione um nível</option>
                <option
                  v-for="level in levelsStore.levels"
                  :key="level.uuid"
                  :value="level.uuid"
                >
                  {{ level.nome }}
                </option>
              </select>
              <p v-if="editingId" class="text-[10px] text-slate-400 mt-1">
                Nível atual: {{ form.level }}
              </p>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-semibold text-slate-700 mb-2"
                >Turmas Múltiplas</label
              >
              <div
                class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-slate-100 p-2 rounded-lg bg-slate-50"
              >
                <label
                  v-for="c in classesStore.classes"
                  :key="c.uuid"
                  class="flex items-center space-x-3 bg-white p-2.5 rounded-md border border-slate-100 cursor-pointer hover:border-sky-200 hover:bg-sky-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    :value="c.uuid"
                    v-model="form.turmasIds"
                    class="rounded text-sky-500 focus:ring-sky-500 border-slate-300 w-4 h-4"
                  />
                  <div class="flex flex-col">
                    <span class="text-sm font-semibold text-slate-700">{{
                      c.nome
                    }}</span>
                    <span class="text-xs text-slate-500">{{
                      c.horarioInicio?.substring(0, 5)
                    }}</span>
                  </div>
                </label>
                <div
                  v-if="classesStore.classes.length === 0"
                  class="col-span-full text-xs text-slate-400 p-2"
                >
                  Nenhuma turma cadastrada.
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Contato (WhatsApp)</label
              >
              <input
                v-model="form.contact"
                type="text"
                required
                placeholder="(00) 00000-0000"
                class="block w-full rounded-lg border-slate-200 px-3 py-2 focus:border-sky-500 focus:ring-sky-500 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5"
                >Status</label
              >
              <select
                v-model="form.status"
                required
                class="block w-full rounded-lg border-slate-200 px-3 py-2 focus:border-sky-500 focus:ring-sky-500 text-sm bg-white"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>
          <div
            class="flex justify-end space-x-3 pt-6 mt-6 border-t border-slate-100"
          >
            <button
              type="button"
              @click="showModal = false"
              class="px-5 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 bg-sky-500 text-white font-medium rounded-lg hover:bg-sky-600 shadow-sm shadow-sky-200 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>

    <Dialog
      v-model:visible="historicoModal.visivel"
      header="Histórico de Avaliações"
      :style="{ width: '30rem' }"
      modal
    >
      <ul class="space-y-3">
        <li
          v-for="item in historicoModal.dados"
          :key="item.uuid"
          class="p-4 border border-slate-100 bg-slate-50 rounded-lg"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="font-bold text-slate-800">{{
              item.dataAvaliacao
            }}</span>
            <span
              :class="
                item.promovido
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-500 bg-slate-100'
              "
              class="px-2 py-1 text-xs font-bold rounded"
            >
              {{ item.promovido ? 'Promovido' : 'Mantido' }}
            </span>
          </div>
          <div class="text-sm text-slate-600">
            Nível: <strong>{{ item.nivel }}</strong>
          </div>
          <div
            v-if="item.observacoes"
            class="text-xs text-slate-500 mt-1 italic"
          >
            "{{ item.observacoes }}"
          </div>
        </li>
        <li
          v-if="historicoModal.dados.length === 0"
          class="text-center text-slate-500 py-6"
        >
          Nenhum histórico encontrado para este aluno.
        </li>
      </ul>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import { useStudentsStore } from '../stores/students'
import { useClassesStore } from '../../classes/stores/classes'
import { useLevelsStore } from '../../levels/stores/levels'

const studentsStore = useStudentsStore()
const classesStore = useClassesStore()
const levelsStore = useLevelsStore()

const showModal = ref(false)
const editingId = ref<string | null>(null)
const mostrarApenasMeus = ref(false)
const historicoModal = ref<{ visivel: boolean; dados: any[] }>({
  visivel: false,
  dados: [],
})

const form = ref({
  name: '',
  age: 0,
  nivelId: '',
  level: 'Iniciante',
  turmasIds: [] as string[],
  status: 'active' as 'active' | 'inactive',
  contact: '',
})

onMounted(async () => {
  await Promise.all([
    studentsStore.fetchStudents(),
    classesStore.fetchClasses(),
    levelsStore.fetchLevels(),
  ])
})

async function toggleFiltro() {
  mostrarApenasMeus.value = !mostrarApenasMeus.value
  if (mostrarApenasMeus.value && studentsStore.fetchMeusAlunos) {
    await studentsStore.fetchMeusAlunos()
  } else {
    await studentsStore.fetchStudents()
  }
}

async function abrirHistorico(uuid: string) {
  if (studentsStore.fetchHistoricoAluno) {
    historicoModal.value.dados = await studentsStore.fetchHistoricoAluno(uuid)
  }
  historicoModal.value.visivel = true
}

function openModal(student?: any) {
  if (student) {
    editingId.value = student.id
    const selectedClassIds =
      student.turmas && student.turmas !== 'Sem Turma'
        ? (student.turmas
            .split(', ')
            .map((nome: string) => {
              const cls = classesStore.classes.find((c) => c.nome === nome)
              return cls ? cls.uuid : null
            })
            .filter(Boolean) as string[])
        : []

    form.value = {
      name: student.name,
      age: student.age,
      nivelId: student.nivelId,
      level: student.level || 'Iniciante',
      turmasIds: selectedClassIds,
      status: student.status,
      contact: student.contact,
    }
  } else {
    editingId.value = null
    form.value = {
      name: '',
      age: 0,
      nivelId: '',
      level: 'Iniciante',
      turmasIds: [],
      status: 'active',
      contact: '',
    }
  }
  showModal.value = true
}

async function saveStudent() {
  try {
    if (editingId.value) {
      await studentsStore.updateStudent(editingId.value, {
        nome: form.value.name,
        telefoneResponsavel: form.value.contact,
        novasTurmasIds: form.value.turmasIds,
      })
    } else {
      await studentsStore.addStudent({
        nome: form.value.name,
        dataNascimento: new Date(
          new Date().setFullYear(new Date().getFullYear() - form.value.age)
        )
          .toISOString()
          .split('T')[0],
        telefoneResponsavel: form.value.contact,
        nomeResponsavel: 'Responsável',
        nivelId: form.value.nivelId,
        turmasIds: form.value.turmasIds,
      })
    }
    showModal.value = false
  } catch (e) {
    console.error(e)
    alert('Erro ao salvar o aluno. Verifique os dados.')
  }
}

function deleteStudent(id: string) {
  if (confirm('Tem certeza que deseja excluir este aluno?')) {
    studentsStore.deleteStudent(id)
  }
}
</script>
