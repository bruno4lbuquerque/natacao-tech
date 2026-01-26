<script setup lang="ts">
import { ref, computed } from "vue";
import { MOCK_QUESTIONS, MOCK_STUDENTS_BATCH } from "../mocks/mockData";
import Textarea from "primevue/textarea";

const emit = defineEmits(["finish", "cancel"]);

const step = ref<"questions" | "feedback">("questions");
const currentQuestionIndex = ref(0);
const answers = ref<Record<string, boolean>>({});
const feedbacks = ref<Record<string, string>>({});
MOCK_STUDENTS_BATCH.forEach((s) => (feedbacks.value[s.id] = ""));

// Computados
const currentQuestion = computed(
  () => MOCK_QUESTIONS[currentQuestionIndex.value],
);
const isLastQuestion = computed(
  () => currentQuestionIndex.value === MOCK_QUESTIONS.length - 1,
);

const progress = computed(() => {
  if (step.value === "feedback") return 100;
  return ((currentQuestionIndex.value + 1) / (MOCK_QUESTIONS.length + 1)) * 100;
});

// Ações
function nextStep() {
  if (step.value === "questions") {
    if (!isLastQuestion.value) {
      currentQuestionIndex.value++;
    } else {
      step.value = "feedback";
    }
  } else {
    emit("finish", {
      answers: answers.value,
      feedbacks: feedbacks.value,
    });
  }
}

function prevStep() {
  if (step.value === "feedback") {
    step.value = "questions";
  } else if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
}
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[600px] md:h-auto"
  >
    <div class="h-2 bg-gray-100 w-full shrink-0">
      <div
        class="h-full bg-brand-500 transition-all duration-500 ease-out"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>

    <div class="flex-1 overflow-y-auto p-6">
      <div
        v-if="step === 'questions' && currentQuestion"
        class="animate-fade-in"
      >
        <div
          class="text-center mb-8 sticky top-0 bg-white z-10 pb-4 border-b border-gray-50"
        >
          <span
            class="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full"
          >
            Pergunta {{ currentQuestionIndex + 1 }} de
            {{ MOCK_QUESTIONS.length }}
          </span>
          <h2 class="text-2xl font-bold text-gray-800 mt-4 leading-tight">
            {{ currentQuestion.text }}
          </h2>
          <p class="text-gray-400 text-sm mt-2">
            Categoria: {{ currentQuestion.category }}
          </p>
        </div>

        <div class="space-y-3">
          <div
            v-for="student in MOCK_STUDENTS_BATCH"
            :key="student.id"
            class="flex items-center justify-between p-4 rounded-xl border transition-all duration-200"
            :class="
              answers[`${student.id}_${currentQuestion.id}`] !== undefined
                ? 'border-gray-200 bg-white'
                : 'border-orange-200 bg-orange-50'
            "
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0"
              >
                {{ student.name.substring(0, 2).toUpperCase() }}
              </div>
              <span class="font-bold text-gray-700">{{ student.name }}</span>
            </div>

            <div class="flex bg-gray-100 p-1 rounded-lg shrink-0">
              <button
                @click="answers[`${student.id}_${currentQuestion.id}`] = false"
                class="w-12 h-10 rounded-md text-sm font-bold transition-all flex items-center justify-center"
                :class="
                  answers[`${student.id}_${currentQuestion.id}`] === false
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                "
              >
                NÃO
              </button>
              <button
                @click="answers[`${student.id}_${currentQuestion.id}`] = true"
                class="w-12 h-10 rounded-md text-sm font-bold transition-all flex items-center justify-center"
                :class="
                  answers[`${student.id}_${currentQuestion.id}`] === true
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                "
              >
                SIM
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="step === 'feedback'" class="animate-fade-in space-y-6">
        <div class="text-center mb-8">
          <div
            class="w-16 h-16 bg-blue-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <i class="pi pi-comments text-2xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-gray-800">Feedback Final</h2>
          <p class="text-gray-500">
            Adicione observações para os pais (Opcional).
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="student in MOCK_STUDENTS_BATCH"
            :key="student.id"
            class="bg-gray-50 p-4 rounded-xl border border-gray-200 focus-within:ring-2 ring-brand-200 transition-all"
          >
            <div class="flex items-center gap-2 mb-3">
              <div
                class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600"
              >
                {{ student.name.substring(0, 2).toUpperCase() }}
              </div>
              <span class="font-bold text-gray-700 text-sm">{{
                student.name
              }}</span>
            </div>

            <Textarea
              v-model="feedbacks[student.id]"
              placeholder="Escreva um comentário para os pais..."
              class="w-full p-3 text-sm border-gray-300 rounded-lg focus:border-brand-500 focus:ring-0 bg-white min-h-[80px] resize-none"
              autoResize
            />
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
      <button
        @click="prevStep"
        class="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-white transition-colors"
        :disabled="currentQuestionIndex === 0 && step === 'questions'"
        :class="{
          'opacity-50 cursor-not-allowed':
            currentQuestionIndex === 0 && step === 'questions',
        }"
      >
        Voltar
      </button>

      <button
        @click="nextStep"
        class="flex-1 py-3 rounded-xl bg-brand-600 text-white font-bold text-lg shadow-md hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <span v-if="step === 'questions'">{{
          isLastQuestion ? "Ir para Feedback" : "Próxima"
        }}</span>
        <span v-else>Finalizar Avaliação</span>

        <i v-if="step === 'questions'" class="pi pi-arrow-right"></i>
        <i v-else class="pi pi-check-circle"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
