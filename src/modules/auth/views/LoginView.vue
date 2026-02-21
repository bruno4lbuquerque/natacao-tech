<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth'
import { useToast } from 'primevue/usetoast'

import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import Message from 'primevue/message'
import FloatLabel from 'primevue/floatlabel'

const email = ref('')
const password = ref('')
const errorMessage = ref('')

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

async function handleLogin() {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Preencha todos os campos.'
    return
  }

  const result = await authStore.signIn(email.value, password.value)

  if (result.success) {
    toast.add({
      severity: 'success',
      summary: 'Bem-vindo!',
      detail: 'Login realizado com sucesso.',
      life: 2000,
    })

    router.push('/')
  } else {
    errorMessage.value =
      result.error ?? 'Não foi possível realizar o login. Tente novamente.'
  }
}
</script>

<template>
  <div
    class="min-h-screen w-full flex items-center justify-center bg-gray-50 relative overflow-hidden"
  >
    <Toast />

    <div
      class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-50 to-blue-100 z-0"
    ></div>
    <div
      class="absolute -top-20 -right-20 w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
    ></div>
    <div
      class="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
    ></div>

    <div
      class="bg-white/80 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-lg z-10 relative"
    >
      <div class="text-center mb-10">
        <img
          src="/images/acquOnwhite.jpeg"
          alt="AcquOn Logo"
          class="h-48 mx-auto mb-6 object-contain"
        />
        <p class="text-gray-500 mt-2 text-sm">
          Faça login para gerenciar suas turmas
        </p>
      </div>

      <Message
        v-if="errorMessage"
        severity="error"
        :closable="false"
        class="mb-6"
        >{{ errorMessage }}</Message
      >

      <form @submit.prevent="handleLogin" class="space-y-6">
        <FloatLabel>
          <InputText
            id="email"
            v-model="email"
            class="w-full p-3 bg-white/50 border-gray-200 focus:border-brand-500 focus:ring-0"
          />
          <label for="email">E-mail Corporativo</label>
        </FloatLabel>

        <FloatLabel>
          <Password
            id="password"
            v-model="password"
            :feedback="false"
            toggleMask
            inputClass="w-full p-3 bg-white/50 border-gray-200 focus:border-brand-500 focus:ring-0"
            class="w-full"
          />
          <label for="password">Sua Senha</label>
        </FloatLabel>

        <div
          class="flex items-center justify-between text-sm text-gray-500 px-1"
        >
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              class="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <label for="remember">Lembrar-me</label>
          </div>
          <a href="#" class="hover:text-brand-600 font-medium transition-colors"
            >Esqueceu a senha?</a
          >
        </div>

        <Button
          type="submit"
          label="Acessar Painel"
          class="w-full p-4 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-200 transform transition-all active:scale-95 text-lg"
          :loading="authStore.loading"
        />
      </form>

      <p class="text-center text-xs text-gray-400 mt-8">
        &copy; 2026 AcquOn Systems. v1.0.0
      </p>
    </div>
  </div>
</template>

<style scoped>
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}
</style>
