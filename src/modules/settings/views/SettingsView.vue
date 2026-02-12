<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/core/stores/auth'
import api from '@/core/services/api'
import { useToast } from 'primevue/usetoast'

import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const errorMsg = ref('')
const professorUuid = ref('')
const form = ref({
  nome: '',
  email: '',
  telefone: '',
})

onMounted(async () => {
  loading.value = true
  try {
    let emailLogado = ''

    if (typeof authStore.user === 'string') {
      emailLogado = authStore.user
    } else if (
      authStore.user &&
      typeof authStore.user === 'object' &&
      'email' in authStore.user
    ) {
      // @ts-ignore
      emailLogado = authStore.user.email
    }

    if (!emailLogado) {
      throw new Error('Usuário não identificado.')
    }

    const response = await api.get('/api/professores')
    const todosProfessores: any[] = response.data

    const meuPerfil = todosProfessores.find((p: any) => p.email === emailLogado)

    if (meuPerfil) {
      professorUuid.value = meuPerfil.uuid
      form.value.nome = meuPerfil.nome
      form.value.email = meuPerfil.email
    } else {
      errorMsg.value = 'Perfil não encontrado.'
    }
  } catch (error) {
    console.error(error)
    errorMsg.value = 'Erro ao carregar dados.'
  } finally {
    loading.value = false
  }
})

async function save() {
  if (!professorUuid.value) return

  loading.value = true
  try {
    await api.put(`/api/professores/${professorUuid.value}`, {
      nome: form.value.nome,
      email: form.value.email,
    })
    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Atualizado!',
    })

    if (authStore.user && typeof authStore.user === 'object') {
      // @ts-ignore
      authStore.user.email = form.value.email
    }
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao salvar.',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-6">Configurações do Perfil</h1>

    <div
      class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6"
    >
      <div class="flex flex-col gap-2">
        <label class="font-bold">Nome Completo</label>
        <InputText v-model="form.nome" />
      </div>

      <div class="flex flex-col gap-2">
        <label class="font-bold">E-mail (Login)</label>
        <InputText v-model="form.email" />
      </div>

      <Button label="Salvar Alterações" @click="save" :loading="loading" />
    </div>
  </div>
</template>
