<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import api from '@/core/services/api'
import { useStudentsStore } from '@/modules/students/stores/students'
import type { HistoricoAvaliacaoDTO } from '@/core/types/api'

// Componentes
import Select from 'primevue/select'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const toast = useToast()
const studentsStore = useStudentsStore()

const selectedStudent = ref<any>(null)
const history = ref<HistoricoAvaliacaoDTO[]>([])
const loadingHistory = ref(false)
const downloading = ref(false)

const showDetailModal = ref(false)
const selectedReport = ref<any>(null)

onMounted(() => {
  studentsStore.fetchStudents()
})

// CORREÇÃO AQUI: s.nome e s.uuid em vez de s.name e s.id
const studentOptions = computed(() => {
  if (!Array.isArray(studentsStore.students)) return []

  return studentsStore.students.map((s: any) => ({
    label: s.nome || s.name || 'Aluno Indefinido',
    value: s.uuid || s.id,
  }))
})

function sendToWhatsApp() {
  if (!selectedReport.value) return

  const text =
    `Olá! Confira o relatório de natação:\n` +
    `📅 Data: ${selectedReport.value.data}\n` +
    `🏊 Nível: ${selectedReport.value.nivel}\n` +
    `⭐ Pontuação: ${selectedReport.value.pontuacao}\n` +
    `💬 Feedback: ${selectedReport.value.feedback}`

  const url = `https://wa.me/?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}

async function fetchHistory() {
  if (!selectedStudent.value) return

  loadingHistory.value = true
  history.value = []

  try {
    const res = await api.get(`/api/alunos/${selectedStudent.value}/historico`)
    history.value = res.data
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível buscar o histórico.',
    })
  } finally {
    loadingHistory.value = false
  }
}

function viewReport(data: HistoricoAvaliacaoDTO) {
  selectedReport.value = {
    uuid: data.uuid,
    data: new Date(data.dataAvaliacao).toLocaleDateString('pt-BR'),
    nivel: data.nivel,
    pontuacao: data.pontuacaoTotal,
    status: data.promovido ? 'aprovado' : 'manter',
    feedback: data.observacoes || 'Sem observações.',
    habilidades: data.habilidadesAprovadas || [],
  }
  showDetailModal.value = true
}

async function downloadPDF() {
  if (!selectedReport.value?.uuid) return

  downloading.value = true
  toast.add({
    severity: 'info',
    summary: 'Gerando PDF',
    detail: 'Aguarde...',
    life: 2000,
  })

  try {
    const response = await api.get(
      `/api/avaliacoes/${selectedReport.value.uuid}/pdf`,
      {
        responseType: 'blob',
      }
    )

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `relatorio_avaliacao.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Download iniciado!',
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao baixar o PDF.',
      life: 4000,
    })
  } finally {
    downloading.value = false
  }
}

function getScoreColor(score: number) {
  if (score >= 10) return 'bg-green-500'
  if (score >= 5) return 'bg-yellow-500'
  return 'bg-red-500'
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6 p-4">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
          Histórico Escolar
        </h1>
        <p class="text-gray-500">Acompanhe a evolução do aluno.</p>
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <label class="block font-bold mb-2 text-gray-700"
        >Selecione o Aluno</label
      >
      <Select
        v-model="selectedStudent"
        :options="studentOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Buscar aluno..."
        class="w-full md:w-1/2"
        filter
        @change="fetchHistory"
      />
    </div>

    <div
      v-if="selectedStudent"
      class="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
    >
      <div v-if="loadingHistory" class="flex justify-center py-10">
        <i class="pi pi-spin pi-spinner text-4xl text-sky-500"></i>
      </div>

      <div
        v-else-if="history.length === 0"
        class="text-center py-10 text-gray-500"
      >
        Nenhuma avaliação encontrada.
      </div>

      <DataTable v-else :value="history" stripedRows responsiveLayout="scroll">
        <Column field="dataAvaliacao" header="Data">
          <template #body="slotProps">
            {{
              new Date(slotProps.data.dataAvaliacao).toLocaleDateString('pt-BR')
            }}
          </template>
        </Column>
        <Column field="nivel" header="Nível"></Column>
        <Column field="pontuacaoTotal" header="Pontos"></Column>
        <Column header="Status">
          <template #body="slotProps">
            <Tag
              :value="slotProps.data.promovido ? 'Promovido' : 'Mantido'"
              :severity="slotProps.data.promovido ? 'success' : 'warn'"
            />
          </template>
        </Column>
        <Column header="Ações">
          <template #body="slotProps">
            <Button
              icon="pi pi-eye"
              text
              rounded
              @click="viewReport(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="showDetailModal"
      modal
      header="Detalhes da Avaliação"
      :style="{ width: '90vw', maxWidth: '600px' }"
    >
      <div v-if="selectedReport" class="space-y-6">
        <div
          class="bg-gray-50 p-4 rounded-xl flex items-center justify-between"
        >
          <div>
            <p class="text-sm text-gray-500">Data</p>
            <h2 class="text-xl font-bold text-gray-800">
              {{ selectedReport.data }}
            </h2>
          </div>
          <Tag
            :value="
              selectedReport.status === 'aprovado' ? 'Aprovado' : 'Em Evolução'
            "
            :severity="
              selectedReport.status === 'aprovado' ? 'success' : 'warn'
            "
          />
        </div>

        <div class="text-center py-2">
          <span
            class="text-sm font-bold text-gray-400 uppercase tracking-widest"
            >Habilidades</span
          >
          <div class="text-5xl font-extrabold text-gray-900 mt-2 mb-4">
            {{ selectedReport.pontuacao }}
          </div>
          <div class="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full"
              :class="getScoreColor(selectedReport.pontuacao)"
              style="width: 100%"
            ></div>
          </div>
        </div>

        <div class="bg-blue-50 p-5 rounded-xl border border-blue-100">
          <h4 class="font-bold text-blue-800 mb-2">
            <i class="pi pi-comments mr-2"></i>Feedback
          </h4>
          <p class="text-blue-900 italic">"{{ selectedReport.feedback }}"</p>
        </div>

        <Button
          label="Baixar PDF Oficial"
          icon="pi pi-file-pdf"
          severity="danger"
          class="w-full py-3"
          :loading="downloading"
          @click="downloadPDF"
        />
        <Button
          label="Enviar por WhatsApp"
          icon="pi pi-whatsapp"
          severity="success"
          class="w-full py-3"
          @click="sendToWhatsApp"
        />
      </div>
    </Dialog>
  </div>
</template>
