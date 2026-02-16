<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
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
import Card from 'primevue/card'

const router = useRouter()
const toast = useToast()
const classesStore = useClassesStore()
const studentsStore = useStudentsStore()
const assessStore = useAssessmentsStore()

const selectedClass = ref<any>(null)
const step = ref(1)

interface EvaluationData {
  approvedSkills: string[]
  feedback: string
  promoted: boolean
}

const evaluationData = ref<Record<string, EvaluationData>>({})

classesStore.fetchClasses()

const classOptions = computed(() =>
  classesStore.classes.map((c) => ({
    label: `${c.nome} - ${c.horario}`,
    value: c,
  }))
)

async function startEvaluation() {
  const turma = selectedClass.value
  if (!turma || !turma.uuid) return

  await studentsStore.fetchStudentsByClass(turma.uuid)

  if (turma.nivelAlvo?.uuid) {
    await assessStore.fetchSkills(turma.nivelAlvo.uuid)
  }

  studentsStore.students.forEach((student: any) => {
    evaluationData.value[student.uuid] = {
      approvedSkills: [],
      feedback: '',
      promoted: false,
    }
  })

  step.value = 2
}

async function finishAndSave() {
  const turma = selectedClass.value
  if (!turma || !turma.uuid) return

  const list = Object.keys(evaluationData.value).map((studentId) => ({
    studentId,
    ...evaluationData.value[studentId]!,
  }))

  const res = await assessStore.submitEvaluation(turma.uuid, list)

  if (res.success) {
    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Avaliações salvas com sucesso!',
      life: 3000,
    })
    step.value = 3
  } else {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao salvar. Verifique permissões.',
      life: 3000,
    })
  }
}

function sendWhatsApp(student: any) {
  if (!student.telefoneResponsavel) {
    toast.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Telefone não cadastrado para este aluno.',
    })
    return
  }

  // Limpa o telefone (remove caracteres não numéricos)
  const phone = student.telefoneResponsavel.replace(/\D/g, '')

  const studentData = evaluationData.value[student.uuid]
  const status = studentData?.promoted
    ? 'PARABÉNS! Ele(a) foi promovido(a) de nível!'
    : 'Ele(a) continua evoluindo muito bem.'

  const text =
    `Olá! Aqui é da ${selectedClass.value.academia?.nome || 'Escola de Natação'}.%0A%0A` +
    `A avaliação do aluno(a) *${student.nome}* foi concluída.%0A` +
    `Resultado: ${status}%0A%0A` +
    `Você pode solicitar o relatório detalhado na secretaria.`

  window.open(`https://wa.me/55${phone}?text=${text}`, '_blank')
}

function goToReports() {
  router.push('/reports')
}

function backToDashboard() {
  router.push('/')
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        <span v-if="step === 1">Avaliação de Turma</span>
        <span v-else-if="step === 2">Avaliando: {{ selectedClass?.nome }}</span>
        <span v-else class="text-green-600">Avaliação Concluída! 🎉</span>
      </h1>
    </div>

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

    <div v-else-if="step === 2" class="space-y-6">
      <Accordion multiple>
        <AccordionPanel
          v-for="student in studentsStore.students"
          :key="student.uuid"
          :value="student.uuid"
        >
          <AccordionHeader>{{ student.nome }}</AccordionHeader>
          <AccordionContent>
            <div v-if="evaluationData[student.uuid]" class="space-y-4">
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
                    v-model="evaluationData[student.uuid]!.approvedSkills"
                    :value="skill.uuid"
                    :inputId="`${student.uuid}-${skill.uuid}`"
                  />
                  <label
                    :for="`${student.uuid}-${skill.uuid}`"
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
                  v-model="evaluationData[student.uuid]!.feedback"
                  rows="3"
                  placeholder="Escreva como foi o desempenho do aluno..."
                  class="w-full"
                />
              </div>

              <div
                class="flex items-center gap-2 mt-2 bg-green-50 p-3 rounded-lg border border-green-100"
              >
                <Checkbox
                  v-model="evaluationData[student.uuid]!.promoted"
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
          @click="finishAndSave"
          :loading="assessStore.loading"
        />
      </div>
    </div>

    <div v-else-if="step === 3" class="space-y-6">
      <div
        class="bg-green-50 p-6 rounded-xl border border-green-200 text-center"
      >
        <i class="pi pi-check-circle text-5xl text-green-500 mb-4"></i>
        <h2 class="text-2xl font-bold text-green-800">Avaliações Salvas!</h2>
        <p class="text-green-700">
          O histórico dos alunos foi atualizado com sucesso.
        </p>
      </div>

      <h3 class="font-bold text-gray-700 text-lg">Comunicar Responsáveis</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          v-for="student in studentsStore.students"
          :key="student.uuid"
          class="shadow-sm border border-gray-100"
        >
          <template #content>
            <div class="flex justify-between items-center">
              <div>
                <span class="block font-bold text-gray-800">{{
                  student.nome
                }}</span>
                <span
                  class="text-xs font-bold uppercase px-2 py-1 rounded mt-1 inline-block"
                  :class="
                    evaluationData[student.uuid]?.promoted
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  "
                >
                  {{
                    evaluationData[student.uuid]?.promoted
                      ? 'Promovido'
                      : 'Mantido'
                  }}
                </span>
              </div>
              <Button
                icon="pi pi-whatsapp"
                label="Avisar Pais"
                severity="success"
                text
                @click="sendWhatsApp(student)"
              />
            </div>
          </template>
        </Card>
      </div>

      <div
        class="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-200"
      >
        <Button
          label="Voltar ao Dashboard"
          icon="pi pi-home"
          severity="secondary"
          @click="backToDashboard"
        />
        <Button
          label="Ver PDFs nos Relatórios"
          icon="pi pi-file-pdf"
          @click="goToReports"
        />
      </div>
    </div>
  </div>
</template>
