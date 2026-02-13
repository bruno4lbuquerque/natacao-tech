<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/core/stores/auth'
import api from '@/core/services/api'
import { useToast } from 'primevue/usetoast'

// UI Components
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Skeleton from 'primevue/skeleton'
import Avatar from 'primevue/avatar'
import Badge from 'primevue/badge'

const authStore = useAuthStore()
const toast = useToast()

const loading = ref(true)
const submitting = ref(false)
const professorUuid = ref('')

const form = ref({
  nome: '',
  email: '',
  academia: '',
  telefone: '',
})

onMounted(async () => {
  try {
    // CORREÇÃO 1: Verificação segura de tipo para evitar erro "property email does not exist on type never"
    let emailLogado = ''

    const user = authStore.user // Copia para variável local

    if (typeof user === 'string') {
      emailLogado = user
    } else if (user && typeof user === 'object') {
      // Casting explícito para any ou verificação com 'in'
      emailLogado = (user as any).email || ''
    }

    if (!emailLogado) throw new Error('Sessão inválida')

    const { data: todosProfessores } = await api.get('/api/professores')
    const meuPerfil = todosProfessores.find((p: any) => p.email === emailLogado)

    if (meuPerfil) {
      professorUuid.value = meuPerfil.uuid
      form.value.nome = meuPerfil.nome
      form.value.email = meuPerfil.email
      form.value.academia = meuPerfil.nomeAcademia || 'Matriz'
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível carregar seus dados.',
    })
  } finally {
    loading.value = false
  }
})

async function save() {
  if (!professorUuid.value) return

  submitting.value = true
  try {
    await api.put(`/api/professores/${professorUuid.value}`, {
      nome: form.value.nome,
      email: form.value.email,
    })

    toast.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Perfil atualizado!',
    })

    // CORREÇÃO 2: Verificação de nulidade antes de atribuir
    if (authStore.user && typeof authStore.user === 'object') {
      ;(authStore.user as any).email = form.value.email
    }
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao salvar alterações.',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto p-2 md:p-6 space-y-6">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-slate-800">
          Minha Conta
        </h1>
        <p class="text-slate-500 text-sm">
          Gerencie suas informações pessoais e de acesso.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card class="shadow-sm border border-slate-100 h-fit">
        <template #content>
          <div class="flex flex-col items-center text-center py-4">
            <Skeleton v-if="loading" shape="circle" size="6rem" class="mb-4" />
            <Skeleton v-if="loading" width="8rem" class="mb-2" />
            <Skeleton v-if="loading" width="5rem" />

            <div v-else class="flex flex-col items-center">
              <Avatar
                :label="form.nome.charAt(0)"
                class="mb-4 bg-sky-100 text-sky-600 text-2xl font-bold"
                size="xlarge"
                shape="circle"
              />
              <h2 class="font-bold text-xl text-slate-800">{{ form.nome }}</h2>
              <p class="text-slate-500 text-sm mb-3">{{ form.email }}</p>
              <Badge
                :value="form.academia"
                severity="info"
                class="capitalize"
              />
            </div>
          </div>
        </template>
      </Card>

      <Card class="lg:col-span-2 shadow-sm border border-slate-100">
        <template #title>
          <span class="text-lg font-bold text-slate-700">Dados Pessoais</span>
        </template>
        <template #content>
          <div v-if="loading" class="space-y-4">
            <Skeleton height="3rem" />
            <Skeleton height="3rem" />
            <Skeleton height="3rem" />
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div class="flex flex-col gap-2 md:col-span-2">
              <label class="text-sm font-semibold text-slate-600"
                >Nome Completo</label
              >
              <span class="p-input-icon-left w-full">
                <i class="pi pi-user" />
                <InputText
                  v-model="form.nome"
                  class="w-full"
                  placeholder="Seu nome"
                />
              </span>
            </div>

            <div class="flex flex-col gap-2 md:col-span-2">
              <label class="text-sm font-semibold text-slate-600"
                >E-mail (Login)</label
              >
              <span class="p-input-icon-left w-full">
                <i class="pi pi-envelope" />
                <InputText
                  v-model="form.email"
                  class="w-full"
                  placeholder="email@exemplo.com"
                />
              </span>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-slate-600"
                >Telefone</label
              >
              <span class="p-input-icon-left w-full">
                <i class="pi pi-phone" />
                <InputText
                  v-model="form.telefone"
                  class="w-full"
                  placeholder="(00) 00000-0000"
                />
              </span>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-slate-600"
                >Unidade</label
              >
              <span class="p-input-icon-left w-full opacity-70">
                <i class="pi pi-building" />
                <InputText
                  v-model="form.academia"
                  disabled
                  class="w-full bg-slate-50"
                />
              </span>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end pt-4 border-t border-slate-50">
            <Button
              label="Salvar Alterações"
              icon="pi pi-check"
              :loading="submitting"
              @click="save"
              class="w-full md:w-auto"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
