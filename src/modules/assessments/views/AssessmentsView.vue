<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useClassesStore } from '@/modules/classes/stores/classes'
import { useStudentsStore } from '@/modules/students/stores/students'
import { useAssessmentsStore } from '@/modules/assessments/stores/assessments'

// Componentes UI
import Select from 'primevue/select'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Textarea from 'primevue/textarea'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'

const toast = useToast()
const classesStore = useClassesStore()
const studentsStore = useStudentsStore()
const assessStore = useAssessmentsStore()

const selectedClass = ref<any>(null)
const step = ref(1)

// Define a estrutura dos dados da avaliação
interface EvaluationData {
  approvedSkills: string[]
  feedback: string
  promoted: boolean
}

const evaluationData = ref<Record<string, EvaluationData>>({})

// Carrega as turmas ao iniciar
classesStore.fetchClasses()

const classOptions = computed(() =>
  classesStore.classes.map((c) => ({
    label: `${c.nome} - ${c.horario}`,
    value: c,
  }))
)

async function startEvaluation() {
  const turma = selectedClass.value

  // Verificação de segurança
  if (!turma || !turma.uuid) return

  // Busca alunos
  await studentsStore.fetchStudentsByClass(turma.uuid)

  // Busca habilidades se tiver nível alvo
  if (turma.nivelAlvo?.uuid) {
    await assessStore.fetchSkills(turma.nivelAlvo.uuid)
  }

  // Inicializa o objeto de avaliação para CADA aluno encontrado
  studentsStore.students.forEach((student: any) => {
    evaluationData.value[student.id] = {
      approvedSkills: [],
      feedback: '',
      promoted: false,
    }
  })

  step.value = 2
}

async function finish() {
  const turma = selectedClass.value
  if (!turma || !turma.uuid) return

  // Converte o Objeto em Lista para enviar ao Java
  const list = Object.keys(evaluationData.value).map((studentId) => ({
    studentId,
    // O sinal ! diz ao TS: "Eu garanto que existe porque peguei a chave do próprio objeto"
    ...evaluationData.value[studentId]!,
  }))

  const res = await assessStore.submitEvaluation(turma.uuid, list)

  if (res.success) {
    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Avaliações salvas!',
      life: 3000,
    })
    // Reseta o fluxo
    step.value = 1
    selectedClass.value = null
    evaluationData.value = {}
  } else {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao salvar.',
      life: 3000,
    })
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Avaliação de Turma</h1>

    <div
      v-if="step === 1"
      class="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    >
      <label class="block font-bold mb-2">Selecione a Turma</label>
      <Select
        v-model="selectedClass"
        :options="classOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Escolha uma turma..."
        class="w-full mb-4"
      />
      <Button
        label="Iniciar Avaliação"
        @click="startEvaluation"
        :disabled="!selectedClass"
      />
    </div>

    <div v-else class="space-y-6">
      <Accordion multiple>
        <AccordionPanel
          v-for="student in studentsStore.students"
          :key="student.id"
          :value="student.id"
        >
          <AccordionHeader>{{ student.name }}</AccordionHeader>
          <AccordionContent>
            <div v-if="evaluationData[student.id]" class="space-y-4">
              <h3 class="font-bold text-gray-700 text-sm">
                Habilidades (Marque se aprovado):
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  v-for="skill in assessStore.skills"
                  :key="skill.uuid"
                  class="flex items-center gap-2"
                >
                  <Checkbox
                    v-model="evaluationData[student.id]!.approvedSkills"
                    :value="skill.uuid"
                    :inputId="`${student.id}-${skill.uuid}`"
                  />
                  <label
                    :for="`${student.id}-${skill.uuid}`"
                    class="text-sm text-gray-600 cursor-pointer"
                  >
                    {{ skill.descricao }}
                  </label>
                </div>
              </div>

              <div class="border-t border-gray-100 my-4"></div>

              <div class="flex flex-col gap-2">
                <label class="font-bold text-sm text-gray-700">
                  Feedback / Observações
                </label>
                <Textarea
                  v-model="evaluationData[student.id]!.feedback"
                  rows="3"
                  placeholder="Escreva como foi o desempenho do aluno..."
                  class="w-full"
                />
              </div>

              <div
                class="flex items-center gap-2 mt-2 bg-green-50 p-3 rounded-lg border border-green-100"
              >
                <Checkbox
                  v-model="evaluationData[student.id]!.promoted"
                  :binary="true"
                />
                <span class="text-sm font-bold text-green-700">
                  Promover aluno de nível?
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>

      <div class="flex justify-end gap-3 mt-6">
        <Button label="Voltar" severity="secondary" @click="step = 1" />
        <Button
          label="Finalizar e Salvar"
          icon="pi pi-check"
          @click="finish"
          :loading="assessStore.loading"
        />
      </div>
    </div>
  </div>
</template>
