<script setup lang="ts">
import { ref } from "vue";
import BatchEvaluationWizard from "../components/BatchEvaluationWizard.vue";
import { useToast } from "primevue/usetoast";

import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import ProgressBar from "primevue/progressbar";

const toast = useToast();

// --- MOCKS ---
const MOCK_CLASSES = [
  { name: "Segunda e Quarta - 09:00", code: "T1" },
  { name: "Terça e Quinta - 15:00", code: "T2" },
  { name: "Sábado - 10:00", code: "T3" },
];

const MOCK_LEVELS = [
  { name: "Acqua Baby (Touca Branca)", code: "baby" },
  { name: "Acqua Aprendizado (Touca Laranja)", code: "laranja" },
  { name: "Acqua Iniciante (Touca Vermelha)", code: "vermelha" },
  { name: "Acqua Expert (Touca Preta)", code: "expert" },
];

const step = ref<"selection" | "wizard" | "success">("selection");
const selectedClass = ref();
const selectedLevel = ref();
const loading = ref(false);
const generatingPdf = ref(false);
const showWhatsappModal = ref(false);

function startEvaluation() {
  if (selectedClass.value && selectedLevel.value) {
    loading.value = true;
    setTimeout(() => {
      loading.value = false;
      step.value = "wizard";
    }, 800);
  }
}

function handleWizardFinish(data: any) {
  console.log("Dados finais para salvar:", data);
  // Aqui entraria o código do Supabase
  step.value = "success";
}

function generateReports() {
  generatingPdf.value = true;
  toast.add({
    severity: "info",
    summary: "Gerando PDFs",
    detail: "Compilando gráficos e feedbacks...",
    life: 2000,
  });

  setTimeout(() => {
    generatingPdf.value = false;
    toast.add({
      severity: "success",
      summary: "Sucesso",
      detail: "3 Relatórios gerados com sucesso!",
      life: 3000,
    });
  }, 2500);
}

function openWhatsappModal() {
  showWhatsappModal.value = true;
}

function sendWhatsappLink() {
  showWhatsappModal.value = false;
  toast.add({
    severity: "success",
    summary: "Enviado",
    detail: "Links enviados para os responsáveis via WhatsApp API.",
    life: 3000,
  });

  // Exemplo de link real: window.open(`https://wa.me/5511999999999?text=Olá, segue o relatório...`)
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <Dialog
      v-model:visible="showWhatsappModal"
      modal
      header="Enviar Relatórios"
      :style="{ width: '90vw', maxWidth: '400px' }"
    >
      <div class="text-center p-4">
        <i class="pi pi-whatsapp text-green-500 text-5xl mb-4"></i>
        <p class="text-gray-600 mb-6">
          Deseja enviar o link do relatório automaticamente para os
          <b>3 alunos</b> avaliados desta turma?
        </p>
        <div class="flex gap-2 justify-center">
          <Button
            label="Cancelar"
            severity="secondary"
            @click="showWhatsappModal = false"
            text
          />
          <Button
            label="Confirmar Envio"
            severity="success"
            icon="pi pi-send"
            @click="sendWhatsappLink"
          />
        </div>
      </div>
    </Dialog>

    <div
      class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
          Avaliações
        </h1>
        <p class="text-gray-500">Gerencie o progresso dos alunos na piscina</p>
      </div>

      <Button
        v-if="step === 'wizard'"
        label="Cancelar"
        icon="pi pi-times"
        severity="secondary"
        text
        @click="step = 'selection'"
      />
    </div>

    <transition name="fade" mode="out-in">
      <div
        v-if="step === 'selection'"
        class="grid md:grid-cols-2 gap-8 items-start"
      >
        <Card class="shadow-sm border border-gray-100">
          <template #title>Nova Avaliação em Lote</template>
          <template #subtitle>Selecione os parâmetros para começar</template>
          <template #content>
            <div class="space-y-6 mt-4">
              <div class="flex flex-col gap-2">
                <label class="font-bold text-gray-700">Selecione a Turma</label>
                <Dropdown
                  v-model="selectedClass"
                  :options="MOCK_CLASSES"
                  optionLabel="name"
                  placeholder="Selecione..."
                  class="w-full"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label class="font-bold text-gray-700"
                  >Metodologia / Nível</label
                >
                <Dropdown
                  v-model="selectedLevel"
                  :options="MOCK_LEVELS"
                  optionLabel="name"
                  placeholder="Selecione..."
                  class="w-full"
                />
              </div>

              <Button
                label="Iniciar Avaliação"
                icon="pi pi-play"
                class="w-full font-bold"
                :loading="loading"
                :disabled="!selectedClass || !selectedLevel"
                @click="startEvaluation"
              />
            </div>
          </template>
        </Card>

        <div class="hidden md:block bg-brand-50 rounded-2xl p-8 text-center">
          <div
            class="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-brand-500"
          >
            <i class="pi pi-check-circle text-5xl"></i>
          </div>
          <h3 class="text-xl font-bold text-brand-900 mb-2">
            Avaliação Rápida
          </h3>
          <p class="text-brand-700 leading-relaxed">
            Otimize seu tempo. Avalie múltiplos alunos e gere relatórios com
            gráficos automáticos ao final.
          </p>
        </div>
      </div>

      <div v-else-if="step === 'wizard'">
        <BatchEvaluationWizard @finish="handleWizardFinish" />
      </div>

      <div v-else-if="step === 'success'" class="max-w-2xl mx-auto">
        <div
          class="bg-white rounded-2xl border border-green-100 shadow-lg overflow-hidden"
        >
          <div class="bg-green-50 p-8 text-center border-b border-green-100">
            <div
              class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce"
            >
              <i class="pi pi-check text-4xl font-bold"></i>
            </div>
            <h2 class="text-3xl font-bold text-gray-800">
              Avaliação Concluída!
            </h2>
            <p class="text-gray-600 mt-2">
              Os dados da turma <b>{{ selectedClass.name }}</b> foram salvos.
            </p>
          </div>

          <div class="p-8 space-y-6">
            <h3
              class="font-bold text-gray-700 text-lg border-l-4 border-brand-500 pl-3"
            >
              O que você deseja fazer agora?
            </h3>

            <div
              class="p-4 border border-gray-200 rounded-xl hover:border-brand-300 transition-colors flex items-center justify-between group"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center"
                >
                  <i class="pi pi-file-pdf text-xl"></i>
                </div>
                <div>
                  <h4
                    class="font-bold text-gray-800 group-hover:text-brand-600"
                  >
                    Baixar Relatórios PDF
                  </h4>
                  <p class="text-sm text-gray-500">
                    Inclui gráficos de evolução e feedback.
                  </p>
                </div>
              </div>
              <Button
                label="Gerar"
                icon="pi pi-download"
                severity="danger"
                text
                @click="generateReports"
                :loading="generatingPdf"
              />
            </div>
            <ProgressBar
              v-if="generatingPdf"
              mode="indeterminate"
              style="height: 4px"
              class="mb-4"
            />

            <div
              class="p-4 border border-gray-200 rounded-xl hover:border-green-300 transition-colors flex items-center justify-between group"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center"
                >
                  <i class="pi pi-whatsapp text-xl"></i>
                </div>
                <div>
                  <h4
                    class="font-bold text-gray-800 group-hover:text-green-600"
                  >
                    Enviar para Responsáveis
                  </h4>
                  <p class="text-sm text-gray-500">
                    Envia o link do relatório via WhatsApp.
                  </p>
                </div>
              </div>
              <Button
                label="Enviar"
                icon="pi pi-send"
                severity="success"
                text
                @click="openWhatsappModal"
              />
            </div>

            <div class="pt-6 border-t border-gray-100 text-center">
              <Button
                label="Voltar ao Início"
                severity="secondary"
                @click="step = 'selection'"
              />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
