<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "primevue/usetoast";

import Button from "primevue/button";
import Calendar from "primevue/calendar";
import Dropdown from "primevue/dropdown";
import Tag from "primevue/tag";

// Mock Data
const MOCK_CLASSES = [
  { name: "Segunda e Quarta - 09:00", code: "T1" },
  { name: "Terça e Quinta - 15:00", code: "T2" },
];

const MOCK_STUDENTS = [
  {
    id: "1",
    name: "Davi Rocha",
    photo: null,
    attendance_rate: 90,
    status: "excelente",
  },
  {
    id: "2",
    name: "Maria Silva",
    photo: null,
    attendance_rate: 75,
    status: "bom",
  },
  {
    id: "3",
    name: "João Pedro",
    photo: null,
    attendance_rate: 40,
    status: "ruim",
  },
  {
    id: "4",
    name: "Ana Clara",
    photo: null,
    attendance_rate: 100,
    status: "excelente",
  },
  {
    id: "5",
    name: "Lucas Souza",
    photo: null,
    attendance_rate: 60,
    status: "regular",
  },
];

const selectedClass = ref(MOCK_CLASSES[0]);
const selectedDate = ref(new Date());
const attendanceMap = ref<Record<string, boolean>>({});
const loading = ref(false);
const toast = useToast();

MOCK_STUDENTS.forEach((s) => (attendanceMap.value[s.id] = true));

function getStatusColor(status: string) {
  switch (status) {
    case "excelente":
      return "success";
    case "bom":
      return "info";
    case "regular":
      return "warning";
    case "ruim":
      return "danger";
    default:
      return "secondary";
  }
}

async function saveAttendance() {
  loading.value = true;

  setTimeout(() => {
    console.log("Payload para Supabase:", {
      class_id: selectedClass.value?.code,
      date: selectedDate.value,
      records: Object.entries(attendanceMap.value).map(
        ([student_id, present]) => ({
          student_id,
          present,
        }),
      ),
    });

    toast.add({
      severity: "success",
      summary: "Chamada Salva",
      detail: "Frequência registrada com sucesso!",
      life: 3000,
    });
    loading.value = false;
  }, 1000);
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Chamada</h1>
        <p class="text-gray-500">Registre a presença da turma</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <Dropdown
          v-model="selectedClass"
          :options="MOCK_CLASSES"
          optionLabel="name"
          class="w-full md:w-64"
        />
        <Calendar
          v-model="selectedDate"
          dateFormat="dd/mm/yy"
          showIcon
          class="w-full md:w-40"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div
        v-for="student in MOCK_STUDENTS"
        :key="student.id"
        class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between transition-all"
        :class="{ 'opacity-60 bg-gray-50': !attendanceMap[student.id] }"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
            :class="
              attendanceMap[student.id]
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-200 text-gray-500'
            "
          >
            {{ student.name.substring(0, 2).toUpperCase() }}
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-lg">{{ student.name }}</h3>
            <div class="flex items-center gap-2 mt-1">
              <Tag
                :severity="getStatusColor(student.status)"
                :value="student.status.toUpperCase()"
                class="text-xs"
              />
              <span class="text-xs text-gray-500"
                >{{ student.attendance_rate }}% Freq.</span
              >
            </div>
          </div>
        </div>

        <div
          @click="attendanceMap[student.id] = !attendanceMap[student.id]"
          class="cursor-pointer w-24 h-12 rounded-full flex items-center px-1 transition-colors duration-300 select-none"
          :class="
            attendanceMap[student.id]
              ? 'bg-green-500 justify-end'
              : 'bg-gray-300 justify-start'
          "
        >
          <div
            class="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center"
          >
            <i
              class="pi text-sm font-bold"
              :class="
                attendanceMap[student.id]
                  ? 'pi-check text-green-600'
                  : 'pi-times text-gray-400'
              "
            ></i>
          </div>
        </div>
      </div>
    </div>

    <div
      class="sticky bottom-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 shadow-2xl z-10"
    >
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-600">
          <span class="font-bold text-gray-900">{{
            Object.values(attendanceMap).filter(Boolean).length
          }}</span>
          presentes de {{ MOCK_STUDENTS.length }}
        </div>
        <Button
          label="Salvar Chamada"
          icon="pi pi-save"
          @click="saveAttendance"
          :loading="loading"
          class="px-8 font-bold bg-brand-600 border-brand-600 hover:bg-brand-700"
        />
      </div>
    </div>
  </div>
</template>
