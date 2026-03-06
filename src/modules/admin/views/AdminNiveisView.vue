<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useLevelsStore } from '@/modules/levels/stores/levels'

const toast = useToast()
const levelsStore = useLevelsStore()

const formData = ref({ nome: '', descricao: '' })

async function handleCreate() {
  try {
    await levelsStore.createNivel(formData.value)

    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Nível criado com sucesso!',
      life: 3000,
    })

    formData.value = { nome: '', descricao: '' }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao criar o nível.',
      life: 3000,
    })
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 p-4">
    <div>
      <div class="flex items-center gap-2 mb-1">
        <span
          class="bg-sky-100 text-sky-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
        >
          Gestão
        </span>
      </div>
      <h1 class="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
        Níveis (Toucas)
      </h1>
      <p class="text-slate-500 text-sm mt-1">
        Gerencie os níveis de aprendizado da academia.
      </p>
    </div>

    <div
      class="bg-white rounded-xl border border-slate-100 shadow-sm p-6 max-w-lg"
    >
      <h2
        class="text-lg font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2"
      >
        Novo Nível
      </h2>

      <form @submit.prevent="handleCreate" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5"
            >Nome do Nível <span class="text-red-500">*</span></label
          >
          <input
            v-model="formData.nome"
            required
            type="text"
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            placeholder="Ex: Acqua Baby - Touca Branca"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5"
            >Descrição</label
          >
          <textarea
            v-model="formData.descricao"
            rows="3"
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors resize-none"
            placeholder="Descreva as características deste nível..."
          ></textarea>
        </div>

        <div class="pt-4 border-t border-slate-100">
          <button
            type="submit"
            class="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-4 rounded-lg transition-all shadow-sm shadow-sky-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <i class="pi pi-check"></i> Criar Nível
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
