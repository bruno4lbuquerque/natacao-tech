<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'

import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Message from 'primevue/message'

const toast = useToast()

interface MockTurma {
  name: string
  code: string
}

const MOCK_CLASSES: MockTurma[] = [
  { name: 'Segunda e Quarta - 09:00', code: 'T1' },
  { name: 'Terça e Quinta - 15:00', code: 'T2' },
]

const MOCK_STUDENTS = [
  { id: '1', name: 'Davi Rocha', status: 'presente' },
  { id: '2', name: 'Maria Silva', status: 'ausente' },
  { id: '3', name: 'João Pedro', status: 'presente' },
]

const selectedClass = ref<MockTurma | null>(null)

function saveAttendance() {
  toast.add({
    severity: 'info',
    summary: 'Funcionalidade Futura',
    detail:
      'O módulo de chamada aguarda a criação da tabela de frequências no Banco de Dados.',
    life: 5000,
  })
}

function toggleStatus(student: any) {
  student.status = student.status === 'presente' ? 'ausente' : 'presente'
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-800">Chamada</h1>
    </div>

    <Message
      severity="warn"
      :closable="false"
      icon="pi pi-exclamation-triangle"
    >
      <strong>Módulo em Desenvolvimento:</strong> A funcionalidade de salvar
      presença não está disponível pois não existe tabela de "Frequência" no
      Banco de Dados atual.
    </Message>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div class="flex gap-4 mb-6">
        <Button
          v-for="turma in MOCK_CLASSES"
          :key="turma.code"
          :label="turma.name"
          :severity="selectedClass === turma ? 'primary' : 'secondary'"
          @click="selectedClass = turma"
        />
      </div>

      <div v-if="selectedClass" class="space-y-2">
        <div
          v-for="student in MOCK_STUDENTS"
          :key="student.id"
          class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          @click="toggleStatus(student)"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm"
            >
              {{ student.name.charAt(0) }}
            </div>
            <span class="font-bold text-gray-700">{{ student.name }}</span>
          </div>

          <Tag
            :value="student.status.toUpperCase()"
            :severity="student.status === 'presente' ? 'success' : 'danger'"
            class="w-24 text-center cursor-pointer"
          />
        </div>

        <div class="pt-4 flex justify-end">
          <Button
            label="Salvar Chamada"
            icon="pi pi-check"
            @click="saveAttendance"
          />
        </div>
      </div>

      <div
        v-else
        class="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400"
      >
        <i class="pi pi-list text-3xl mb-2 block"></i>
        Selecione uma turma acima para realizar a chamada.
      </div>
    </div>
  </div>
</template>
