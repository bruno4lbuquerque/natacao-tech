<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/core/services/api'

import Select from 'primevue/select'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'

const toast = useToast()

const REPORTS_DATA = [
  {
    id: 'uuid-exemplo-do-banco',
    student_name: 'Davi Rocha',
    class_name: 'Segunda/Quarta - 09:00',
    level: 'Touca Laranja',
    date: '2026-01-20',
    score: 85,
    status: 'aprovado',
    feedback: 'Davi teve uma evolução incrível na respiração lateral.',
  },
  {
    id: '102',
    student_name: 'Maria Silva',
    class_name: 'Terça/Quinta - 15:00',
    level: 'Touca Vermelha',
    date: '2026-01-18',
    score: 60,
    status: 'manter',
    feedback: 'Precisa melhorar o batimento de pernas.',
  },
]

// Filtros
const selectedStatus = ref({ name: 'Todos', code: 'all' })
const statusOptions = [
  { name: 'Todos', code: 'all' },
  { name: 'Aprovados (Troca de Nível)', code: 'aprovado' },
  { name: 'Manter Nível', code: 'manter' },
]

const showDetailModal = ref(false)
const selectedReport = ref<any>(null)
const downloading = ref(false) // Estado de loading do download

const filteredReports = computed(() => {
  if (selectedStatus.value.code === 'all') return REPORTS_DATA
  return REPORTS_DATA.filter((r) => r.status === selectedStatus.value.code)
})

function viewReport(report: any) {
  selectedReport.value = report
  showDetailModal.value = true
}

// --- INTEGRAÇÃO DE DOWNLOAD PDF ---
async function downloadPDF() {
  if (!selectedReport.value?.id) return

  downloading.value = true
  toast.add({
    severity: 'info',
    summary: 'Aguarde',
    detail: 'Gerando PDF...',
    life: 2000,
  })

  try {
    // Chama endpoint: GET /api/avaliacoes/{uuid}/pdf
    const response = await api.get(
      `/api/avaliacoes/${selectedReport.value.id}/pdf`,
      {
        responseType: 'blob', // Importante para arquivos
      }
    )

    // Cria link invisível para download
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `relatorio_${selectedReport.value.student_name}.pdf`
    )
    document.body.appendChild(link)
    link.click()
    link.remove() // Limpa

    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'PDF baixado!',
      life: 3000,
    })
  } catch (error) {
    console.error('Erro ao baixar PDF:', error)
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail:
        'Não foi possível baixar o arquivo. (ID inválido ou erro no servidor)',
      life: 4000,
    })
  } finally {
    downloading.value = false
  }
}

function sendWhatsApp() {
  toast.add({
    severity: 'success',
    summary: 'WhatsApp',
    detail: 'Funcionalidade futura.',
    life: 2000,
  })
}

function getScoreColor(score: number) {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
          Relatórios de Evolução
        </h1>
        <p class="text-gray-500">
          Histórico de avaliações e gráficos de desempenho.
        </p>
      </div>

      <div class="w-full md:w-64">
        <Select
          v-model="selectedStatus"
          :options="statusOptions"
          optionLabel="name"
          class="w-full"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="report in filteredReports"
        :key="report.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer group"
        @click="viewReport(report)"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3
              class="font-bold text-lg text-gray-800 group-hover:text-brand-600 transition-colors"
            >
              {{ report.student_name }}
            </h3>
            <p class="text-xs text-gray-500">{{ report.class_name }}</p>
          </div>
          <Tag
            :value="report.status === 'aprovado' ? 'Aprovado' : 'Em Evolução'"
            :severity="report.status === 'aprovado' ? 'success' : 'warn'"
          />
        </div>

        <div class="mb-4">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600 font-medium">Desempenho</span>
            <span class="font-bold text-gray-900">{{ report.score }}%</span>
          </div>
          <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="getScoreColor(report.score)"
              :style="{ width: `${report.score}%` }"
            ></div>
          </div>
        </div>

        <div
          class="flex items-center justify-between text-sm text-gray-400 mt-4 pt-4 border-t border-gray-50"
        >
          <span><i class="pi pi-calendar mr-1"></i> {{ report.date }}</span>
          <span
            class="text-brand-500 font-bold text-xs uppercase tracking-wider group-hover:underline"
            >Ver Detalhes</span
          >
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="showDetailModal"
      modal
      header="Detalhes da Avaliação"
      :style="{ width: '90vw', maxWidth: '600px' }"
    >
      <div v-if="selectedReport" class="space-y-6">
        <div class="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
          <div
            class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-brand-600 shadow-sm"
          >
            {{ selectedReport.student_name.substring(0, 2).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800">
              {{ selectedReport.student_name }}
            </h2>
            <p class="text-gray-500 text-sm">{{ selectedReport.level }}</p>
          </div>
        </div>

        <div class="text-center py-4">
          <span
            class="text-sm font-bold text-gray-400 uppercase tracking-widest"
            >Aproveitamento Geral</span
          >
          <div class="text-5xl font-extrabold text-gray-900 mt-2 mb-4">
            {{ selectedReport.score }}%
          </div>

          <div class="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-1000"
              :class="getScoreColor(selectedReport.score)"
              :style="{ width: `${selectedReport.score}%` }"
            ></div>
          </div>
        </div>

        <div class="bg-blue-50 p-5 rounded-xl border border-blue-100">
          <h4 class="font-bold text-blue-800 mb-2 flex items-center gap-2">
            <i class="pi pi-comments"></i> Feedback do Professor
          </h4>
          <p class="text-blue-900 italic">"{{ selectedReport.feedback }}"</p>
        </div>

        <div class="flex gap-3 pt-2">
          <Button
            label="Baixar PDF"
            icon="pi pi-file-pdf"
            severity="danger"
            class="flex-1"
            :loading="downloading"
            @click="downloadPDF"
          />
          <Button
            label="WhatsApp"
            icon="pi pi-whatsapp"
            severity="success"
            class="flex-1"
            @click="sendWhatsApp"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>
