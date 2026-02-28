<script setup lang="ts">
import { ref, computed } from 'vue'
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

const COOLDOWN_MS = 2_000
const MAX_TENTATIVAS_RAPIDAS = 5
const BLOQUEIO_MS = 30_000

let ultimaTentativa = 0
let contadorTentativas = 0
let bloqueadoAte = 0

const bloqueado = ref(false)
const cooldownLabel = ref('')
let cooldownInterval: ReturnType<typeof setInterval> | null = null

function iniciarBloqueio(duracaoMs: number) {
  bloqueadoAte = Date.now() + duracaoMs
  bloqueado.value = true

  if (cooldownInterval) clearInterval(cooldownInterval)
  cooldownInterval = setInterval(() => {
    const restante = Math.ceil((bloqueadoAte - Date.now()) / 1000)
    if (restante <= 0) {
      bloqueado.value = false
      cooldownLabel.value = ''
      if (cooldownInterval) clearInterval(cooldownInterval)
    } else {
      cooldownLabel.value = `Aguarde ${restante}s`
    }
  }, 500)
}

const botaoLabel = computed(() => cooldownLabel.value || 'Acessar Painel')

async function handleLogin() {
  errorMessage.value = ''

  if (bloqueado.value || Date.now() < bloqueadoAte) return

  const agora = Date.now()
  if (agora - ultimaTentativa < COOLDOWN_MS) {
    iniciarBloqueio(COOLDOWN_MS - (agora - ultimaTentativa))
    return
  }

  ultimaTentativa = agora
  contadorTentativas++

  if (contadorTentativas >= MAX_TENTATIVAS_RAPIDAS) {
    contadorTentativas = 0
    errorMessage.value =
      'Muitas tentativas seguidas. Aguarde antes de tentar novamente.'
    iniciarBloqueio(BLOQUEIO_MS)
    return
  }

  if (!email.value || !password.value) {
    errorMessage.value = 'Preencha todos os campos.'
    return
  }

  const result = await authStore.signIn(email.value, password.value)

  if (result.success) {
    contadorTentativas = 0
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
    class="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans p-4"
  >
    <Toast />

    <div
      class="absolute inset-0 bg-gradient-to-br from-sky-50 via-slate-50 to-blue-100 z-0"
    ></div>
    <div
      class="absolute -top-32 -right-32 w-96 h-96 bg-sky-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob z-0"
    ></div>
    <div
      class="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000 z-0"
    ></div>
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-cyan-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 animate-blob animation-delay-4000 z-0"
    ></div>

    <div
      class="bg-white/90 backdrop-blur-xl border border-white shadow-2xl p-8 md:p-12 rounded-[2rem] w-full max-w-[28rem] z-10 relative"
    >
      <div class="text-center mb-8">
        <img
          src="/images/acquOnwhite.jpeg"
          alt="AcquOn Logo"
          class="h-32 md:h-40 mx-auto mb-6 object-contain drop-shadow-sm"
        />
        <h1
          class="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight"
        >
          Bem-vindo(a) de volta
        </h1>
        <p class="text-slate-500 text-sm mt-2">
          Faça login para gerenciar suas turmas e alunos
        </p>
      </div>

      <transition-group name="fade" tag="div" class="space-y-3 mb-6">
        <Message
          v-if="errorMessage"
          severity="error"
          :closable="false"
          key="error"
        >
          {{ errorMessage }}
        </Message>
        <Message
          v-if="bloqueado"
          severity="warn"
          :closable="false"
          key="cooldown"
        >
          <i class="pi pi-clock mr-2"></i>{{ cooldownLabel }}
        </Message>
      </transition-group>

      <form @submit.prevent="handleLogin" class="space-y-6" autocomplete="on">
        <FloatLabel class="w-full">
          <InputText
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            class="w-full p-3.5 bg-slate-50 border-slate-200 hover:border-sky-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl transition-all text-slate-700"
            :disabled="authStore.loading || bloqueado"
          />
          <label for="email" class="text-slate-500 ml-1"
            >E-mail Corporativo</label
          >
        </FloatLabel>

        <FloatLabel class="w-full">
          <Password
            id="password"
            v-model="password"
            :feedback="false"
            toggleMask
            autocomplete="current-password"
            inputClass="w-full p-3.5 bg-slate-50 border-slate-200 hover:border-sky-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl transition-all text-slate-700"
            class="w-full custom-password"
            :disabled="authStore.loading || bloqueado"
          />
          <label for="password" class="text-slate-500 ml-1">Sua Senha</label>
        </FloatLabel>

        <div class="flex items-center justify-between text-sm px-1">
          <div class="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              id="remember"
              class="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500 transition-all cursor-pointer"
            />
            <label
              for="remember"
              class="text-slate-500 group-hover:text-slate-700 transition-colors cursor-pointer"
              >Lembrar-me</label
            >
          </div>
          <a href="#" class="text-sky-600 hover:text-sky-700 transition-colors">
            Esqueceu a senha?
          </a>
        </div>

        <Button
          type="submit"
          :label="botaoLabel"
          class="w-full p-4 mt-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium text-base rounded-xl shadow-lg shadow-sky-200 hover:shadow-sky-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border-none"
          :loading="authStore.loading"
          :disabled="bloqueado"
        />
      </form>

      <p
        class="text-center text-xs text-slate-400 tracking-wider uppercase mt-8"
      >
        &copy; 2026 AcquOn Systems
      </p>
    </div>
  </div>
</template>

<style scoped>
.animate-blob {
  animation: blob 8s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
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

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

:deep(.custom-password .p-password-mask-icon) {
  right: 1rem;
  color: #94a3b8;
  transition: color 0.2s;
}
:deep(.custom-password .p-password-mask-icon:hover) {
  color: #0ea5e9;
}

:deep(.p-floatlabel:has(input:focus) label),
:deep(.p-floatlabel:has(input.p-filled) label) {
  background-color: transparent !important;
  color: #0ea5e9 !important;
}
</style>
