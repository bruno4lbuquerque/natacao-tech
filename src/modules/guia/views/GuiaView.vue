<script setup lang="ts">
import { ref } from 'vue'

const secaoAtiva = ref('inicio')

const secoes = [
  { id: 'inicio',           label: 'Dashboard',          icon: 'pi pi-home' },
  { id: 'cargos',           label: 'Hierarquia',          icon: 'pi pi-sitemap' },
  { id: 'academias',        label: 'Academias',           icon: 'pi pi-building' },
  { id: 'usuarios',         label: 'Usuários',            icon: 'pi pi-users' },
  { id: 'niveis',           label: 'Níveis (Toucas)',     icon: 'pi pi-palette' },
  { id: 'habilidades',      label: 'Habilidades',         icon: 'pi pi-star' },
  { id: 'turmas',           label: 'Turmas',              icon: 'pi pi-calendar' },
  { id: 'alunos',           label: 'Alunos',              icon: 'pi pi-id-card' },
  { id: 'avaliacoes',       label: 'Avaliações em Lote',  icon: 'pi pi-list-check' },
  { id: 'relatorios',       label: 'Relatórios',          icon: 'pi pi-file-pdf' },
  { id: 'relatorio-periodo',label: 'Relatório por Período',icon: 'pi pi-chart-bar' },
  { id: 'perfil',           label: 'Perfil & Senha',      icon: 'pi pi-user-edit' },
  { id: 'integracao',       label: 'Integração EVO',      icon: 'pi pi-sync' },
]
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 min-h-screen font-sans">
    <div class="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl mb-8">
      <div class="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-sky-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50"></div>
      <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-inner">
            <i class="pi pi-book text-2xl text-sky-300"></i>
          </div>
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">Manual do Sistema</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
          Guia AcquOn
        </h1>
        <p class="text-slate-400 text-lg max-w-2xl leading-relaxed">
          Diretrizes de módulos, fluxos operacionais e níveis de permissão do sistema de gestão.
        </p>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <nav class="lg:w-72 shrink-0">
        <div class="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 sticky top-6">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-3 mb-2">Módulos</p>
          <div class="space-y-1.5">
            <button
              v-for="s in secoes"
              :key="s.id"
              @click="secaoAtiva = s.id"
              class="w-full group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 relative overflow-hidden text-left"
              :class="secaoAtiva === s.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900'"
            >
              <div
                class="flex items-center justify-center w-8 h-8 rounded-xl transition-colors"
                :class="secaoAtiva === s.id ? 'bg-white/10 text-sky-400' : 'bg-slate-200/50 text-slate-400 group-hover:bg-white group-hover:text-slate-800 group-hover:shadow-sm'"
              >
                <i :class="[s.icon, 'text-base']"></i>
              </div>
              <span class="relative z-10">{{ s.label }}</span>
            </button>
          </div>
        </div>
      </nav>

      <div class="flex-1">
        <div class="bg-white rounded-[2rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10 min-h-[600px] relative overflow-hidden">
          <transition name="fade-slide" mode="out-in">

            <div v-if="secaoAtiva === 'inicio'" key="inicio" class="space-y-6">
              <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl shadow-inner border border-sky-100">
                  <i class="pi pi-home"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h2>
              </div>
              <div class="grid md:grid-cols-3 gap-4 mb-6">
                <div class="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
                  <i class="pi pi-chart-bar text-slate-400 mb-3 text-xl"></i>
                  <h3 class="font-bold text-slate-800 mb-1">Métricas Globais</h3>
                  <p class="text-sm text-slate-500 leading-relaxed">
                    Cards com total de <strong>Turmas</strong>, <strong>Alunos</strong> e <strong>Professores</strong> da sua academia em tempo real.
                  </p>
                </div>
                <div class="p-5 rounded-2xl bg-sky-50 border border-sky-100 hover:shadow-md transition-shadow">
                  <i class="pi pi-sun text-sky-500 mb-3 text-xl"></i>
                  <h3 class="font-bold text-slate-800 mb-1">Aulas de Hoje</h3>
                  <p class="text-sm text-slate-500 leading-relaxed">
                    Lista das turmas que ocorrem no dia atual com horário e quantidade de alunos.
                  </p>
                </div>
                <div class="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 hover:shadow-md transition-shadow">
                  <i class="pi pi-chart-pie text-indigo-500 mb-3 text-xl"></i>
                  <h3 class="font-bold text-slate-800 mb-1">Alunos por Nível</h3>
                  <p class="text-sm text-slate-500 leading-relaxed">
                    Gráfico de distribuição de alunos por nível (cor de touca) para análise rápida da progressão.
                  </p>
                </div>
              </div>
              <div class="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <div class="flex gap-3 items-start">
                  <i class="pi pi-info-circle text-amber-500 mt-0.5 text-lg"></i>
                  <div>
                    <p class="font-semibold text-amber-800 mb-1">Visibilidade por cargo</p>
                    <p class="text-sm text-amber-700">
                      <strong>PROFESSOR</strong> vê apenas os dados das próprias turmas. <strong>DIRETOR e COORDENADOR</strong> veem toda a academia. <strong>ADMIN</strong> vê todos os dados de todas as academias.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="secaoAtiva === 'cargos'" key="cargos" class="space-y-6">
              <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shadow-inner border border-purple-100">
                  <i class="pi pi-sitemap"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Hierarquia de Acesso</h2>
              </div>
              <p class="text-slate-500 text-sm mb-6">Cada cargo herda todas as permissões do cargo abaixo dele na hierarquia.</p>
              <div class="grid md:grid-cols-2 gap-5">
                <div class="group relative p-6 rounded-3xl bg-white border border-slate-200 hover:border-purple-300 hover:shadow-[0_8px_30px_rgb(168,85,247,0.12)] transition-all">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-4">
                    <i class="pi pi-star-fill text-[10px]"></i> ADMIN
                  </span>
                  <ul class="space-y-2 text-sm text-slate-600">
                    <li class="flex gap-2"><i class="pi pi-check-circle text-purple-500 mt-0.5"></i>Acesso global irrestrito a todas as academias.</li>
                    <li class="flex gap-2"><i class="pi pi-check-circle text-purple-500 mt-0.5"></i>Cria e desativa <strong>Academias</strong>.</li>
                    <li class="flex gap-2"><i class="pi pi-check-circle text-purple-500 mt-0.5"></i>Promove usuários a <strong>DIRETOR</strong> vinculando a uma academia.</li>
                    <li class="flex gap-2"><i class="pi pi-check-circle text-purple-500 mt-0.5"></i>Acesso à <strong>Integração EVO</strong>.</li>
                    <li class="flex gap-2"><i class="pi pi-check-circle text-purple-500 mt-0.5"></i>Reseta senha de qualquer usuário (exceto outro ADMIN).</li>
                  </ul>
                </div>
                <div class="group relative p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)] transition-all">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-4">
                    <i class="pi pi-briefcase text-[10px]"></i> DIRETOR
                  </span>
                  <ul class="space-y-2 text-sm text-slate-600">
                    <li class="flex gap-2"><i class="pi pi-check-circle text-blue-500 mt-0.5"></i>Gestão completa de <strong>uma academia</strong>.</li>
                    <li class="flex gap-2"><i class="pi pi-check-circle text-blue-500 mt-0.5"></i>Edita dados e logotipo da academia.</li>
                    <li class="flex gap-2"><i class="pi pi-check-circle text-blue-500 mt-0.5"></i>Cadastra professores e promove a <strong>COORDENADOR</strong>.</li>
                    <li class="flex gap-2"><i class="pi pi-check-circle text-blue-500 mt-0.5"></i>Cria e gerencia <strong>Níveis</strong> e <strong>Habilidades</strong>.</li>
                    <li class="flex gap-2"><i class="pi pi-check-circle text-blue-500 mt-0.5"></i>Reseta senha de usuários da própria academia.</li>
                  </ul>
                </div>
                <div class="group relative p-6 rounded-3xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-[0_8px_30px_rgb(245,158,11,0.12)] transition-all">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold mb-4">
                    <i class="pi pi-compass text-[10px]"></i> COORDENADOR
                  </span>
                  <ul class="space-y-2 text-sm text-slate-600">
                    <li class="flex gap-2"><i class="pi pi-check-circle text-amber-500 mt-0.5"></i>Cria e edita <strong>Turmas</strong>.</li>
                    <li class="flex gap-2"><i class="pi pi-check-circle text-amber-500 mt-0.5"></i>Matricula, transfere e desliga <strong>Alunos</strong>.</li>
                    <li class="flex gap-2"><i class="pi pi-check-circle text-amber-500 mt-0.5"></i>Gerencia <strong>Usuários</strong> da academia.</li>
                    <li class="flex gap-2"><i class="pi pi-check-circle text-amber-500 mt-0.5"></i>Visualiza todos os alunos e turmas da academia.</li>
                  </ul>
                </div>
                <div class="group relative p-6 rounded-3xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-[0_8px_30px_rgb(100,116,139,0.12)] transition-all">
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-4">
                    <i class="pi pi-id-card text-[10px]"></i> PROFESSOR
                  </span>
                  <ul class="space-y-2 text-sm text-slate-600">
                    <li class="flex gap-2"><i class="pi pi-check-circle text-slate-500 mt-0.5"></i>Vê apenas os alunos das <strong>próprias turmas</strong>.</li>
                    <li class="flex gap-2"><i class="pi pi-check-circle text-slate-500 mt-0.5"></i>Realiza e edita <strong>Avaliações</strong>.</li>
                    <li class="flex gap-2"><i class="pi pi-check-circle text-slate-500 mt-0.5"></i>Gera e envia <strong>PDFs</strong> via WhatsApp.</li>
                    <li class="flex gap-2"><i class="pi pi-check-circle text-slate-500 mt-0.5"></i>Altera a própria senha no perfil.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div v-else-if="secaoAtiva === 'academias'" key="academias" class="space-y-6">
              <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl shadow-inner border border-sky-100">
                  <i class="pi pi-building"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Academias</h2>
              </div>
              <div class="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                <ul class="space-y-4 text-slate-600">
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Criação e exclusão:</strong> Exclusivo do <strong>ADMIN</strong>. Cada academia representa um tenant isolado — todos os dados (turmas, alunos, professores, níveis) ficam separados por academia.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Edição:</strong> ADMIN e DIRETOR da respectiva unidade podem atualizar nome, endereço, telefone, e-mail e CNPJ.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Logotipo:</strong> Upload de arquivo <strong>PNG ou JPG</strong> (máx. 2 MB). A logo aparece no cabeçalho dos relatórios PDF gerados para os alunos da academia.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Exclusão lógica (soft-delete):</strong> A academia é desativada sem apagar dados históricos.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div v-else-if="secaoAtiva === 'usuarios'" key="usuarios" class="space-y-6">
              <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl shadow-inner border border-sky-100">
                  <i class="pi pi-users"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Usuários</h2>
              </div>
              <div class="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4 text-slate-600">
                <ul class="space-y-4">
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Cadastro:</strong> Todo usuário inicia como <strong>PROFESSOR</strong>. O cadastro exige nome, e-mail (usado como login) e senha inicial. O vínculo com a academia é definido no momento do cadastro.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Promoção a COORDENADOR:</strong> ADMIN ou DIRETOR podem promover um professor a coordenador na listagem de usuários ou professores. O coordenador herda todas as permissões do professor.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Promoção a DIRETOR:</strong> Exclusivo do <strong>ADMIN</strong>. É necessário vincular o usuário a uma academia específica ao promover.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Reset de senha:</strong> ADMIN pode resetar qualquer usuário. DIRETOR pode resetar usuários da própria academia. A senha é redefinida para o padrão <strong>Natacao@123</strong> — o usuário deve alterá-la no primeiro acesso via Perfil.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Busca:</strong> ADMIN e DIRETOR podem buscar usuários pelo nome do professor para localizar rapidamente um usuário antes de promover ou resetar senha.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Desativação:</strong> ADMIN e DIRETOR podem remover um professor do sistema. As turmas que ele lecionava ficam sem professor atribuído; o histórico de avaliações é preservado.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div v-else-if="secaoAtiva === 'niveis'" key="niveis" class="space-y-6">
              <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl shadow-inner border border-sky-100">
                  <i class="pi pi-palette"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Níveis (Toucas)</h2>
              </div>
              <div class="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4 text-slate-600">
                <ul class="space-y-4">
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Conceito:</strong> Cada nível representa uma faixa de aprendizado identificada por uma cor de touca (ex.: Branca → Verde → Azul → Vermelha). Os alunos são promovidos automaticamente ao atingir a pontuação mínima em uma avaliação.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Criação:</strong> Exclusivo de <strong>ADMIN</strong> e <strong>DIRETOR</strong>. Campos obrigatórios: nome, cor da touca e pontuação mínima para promoção. Campo opcional: próximo nível (encadeamento).</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Encadeamento:</strong> Cada nível pode apontar para o "próximo nível" — quando o aluno é promovido, o sistema move-o automaticamente para o nível configurado como próximo.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Pontuação mínima:</strong> Número de habilidades que o aluno precisa dominar para ser promovido. Defina com base na quantidade total de habilidades cadastradas no nível.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Atribuição em massa:</strong> Na tela de Turmas, é possível atribuir o mesmo nível a todos os alunos de uma turma com um clique (útil ao iniciar uma nova turma).</p>
                  </li>
                </ul>
              </div>
            </div>

            <div v-else-if="secaoAtiva === 'habilidades'" key="habilidades" class="space-y-6">
              <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl shadow-inner border border-sky-100">
                  <i class="pi pi-star"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Habilidades</h2>
              </div>
              <div class="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4 text-slate-600">
                <ul class="space-y-4">
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Vínculo:</strong> Cada habilidade pertence a um <strong>Nível</strong> específico e representa um critério avaliado (ex.: "Boia na água 10 segundos"). Gerenciado na seção Admin › Habilidades.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Categorias:</strong> Agrupamento lógico dentro de um nível (ex.: "Respiração", "Flutuação", "Propulsão"). As categorias organizam o boletim PDF e a tela de avaliação.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Ordem:</strong> As habilidades aparecem na ordem em que foram cadastradas. Para garantir a sequência correta no formulário de avaliação, cadastre-as na ordem desejada.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Remoção:</strong> Uma habilidade só pode ser removida se ainda <strong>não foi avaliada</strong> em nenhum aluno. Caso já tenha sido usada, o sistema bloqueará a exclusão para preservar o histórico.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div v-else-if="secaoAtiva === 'turmas'" key="turmas" class="space-y-6">
              <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl shadow-inner border border-sky-100">
                  <i class="pi pi-calendar"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Turmas</h2>
              </div>
              <div class="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4 text-slate-600">
                <ul class="space-y-4">
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Criação:</strong> ADMIN, DIRETOR e COORDENADOR podem criar turmas. Campos obrigatórios: nome, dias da semana, horário início/fim. Opcionais: professor responsável e nível-alvo.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Dias da semana disponíveis:</strong> Segunda, Terça, Quarta, Quinta, Sexta, Sábado, Domingo. Uma turma pode ter múltiplos dias.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Matrículas:</strong> Na tela de Turmas, botão "Ver Alunos" abre o painel de alunos da turma. É possível adicionar alunos sem turma diretamente pelo painel.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Transferência de aluno:</strong> Dentro do painel de alunos da turma, é possível mover um aluno para outra turma da mesma academia com um clique.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Atribuição de nível em massa:</strong> Botão disponível na turma para definir o mesmo nível para todos os alunos de uma vez (útil ao abrir uma turma nova).</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Encerramento:</strong> Ao encerrar uma turma, todos os vínculos com alunos são removidos, mas o histórico de avaliações é mantido intacto. A turma não aparece mais nas listagens.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div v-else-if="secaoAtiva === 'alunos'" key="alunos" class="space-y-6">
              <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl shadow-inner border border-sky-100">
                  <i class="pi pi-id-card"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Alunos</h2>
              </div>
              <div class="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4 text-slate-600">
                <ul class="space-y-4">
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Dados cadastrais:</strong> Nome completo, data de nascimento (calcula a idade automaticamente), nível atual, WhatsApp do responsável e status (Ativo / Inativo).</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Múltiplas turmas:</strong> Um aluno pode estar matriculado em mais de uma turma simultaneamente. No formulário de edição, todas as turmas disponíveis aparecem como checkboxes selecionáveis.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Filtros da lista:</strong> Busca por nome (com debounce), filtro por professor/turma, e filtro por dia da semana (botões Seg/Ter/Qua/Qui/Sex/Sáb). Os filtros de dia consultam o backend para resultados precisos.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Filtro de turmas no modal:</strong> Ao editar um aluno, o painel de seleção de turmas possui filtro por <strong>dia da semana</strong> e por <strong>professor</strong>, facilitando encontrar a turma certa quando há muitas opções.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Meus Alunos:</strong> Professores podem alternar para uma visão filtrada com apenas os alunos das suas próprias turmas usando o botão "Meus Alunos".</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Histórico:</strong> O ícone de relógio na linha de cada aluno abre o histórico completo de avaliações com datas, níveis e status de promoção.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Desligamento:</strong> Exclusão lógica (soft-delete). O aluno é marcado como inativo e não aparece nas listagens, mas todo o histórico de avaliações é preservado no banco.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div v-else-if="secaoAtiva === 'avaliacoes'" key="avaliacoes" class="space-y-6">
              <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl shadow-inner border border-sky-100">
                  <i class="pi pi-list-check"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Avaliações em Lote</h2>
              </div>
              <div class="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4 text-slate-600">
                <ul class="space-y-4">
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Etapa 1 — Turma:</strong> Selecione a turma a ser avaliada. O sistema carrega automaticamente os alunos e as habilidades do nível-alvo da turma.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Etapa 2 — Alunos:</strong> Selecione quais alunos serão avaliados nessa sessão. É possível avaliar um subconjunto da turma.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Etapa 3 — Wizard por habilidade:</strong> Para cada habilidade, marque quais alunos a dominam. As habilidades aparecem em ordem de cadastro, agrupadas por categoria.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Promoção automática:</strong> O sistema calcula a pontuação de cada aluno ao final. Se atingir a pontuação mínima do nível, o aluno é promovido automaticamente ao nível seguinte.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Promoção manual:</strong> Mesmo sem atingir a pontuação mínima, é possível promover manualmente um aluno marcando a opção na tela de conclusão.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Observações:</strong> Campo livre por aluno para registrar comentários individuais que aparecem no PDF do relatório.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Edição retroativa:</strong> Avaliações já salvas podem ser editadas. O sistema recalcula automaticamente a pontuação e aplica ou reverte a promoção conforme as novas respostas.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Rascunho local:</strong> As respostas são salvas automaticamente no navegador durante o preenchimento. Se fechar e reabrir a mesma turma, o rascunho é recuperado.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div v-else-if="secaoAtiva === 'relatorios'" key="relatorios" class="space-y-6">
              <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl shadow-inner border border-sky-100">
                  <i class="pi pi-file-pdf"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Relatórios de Avaliação</h2>
              </div>
              <div class="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4 text-slate-600">
                <ul class="space-y-4">
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Acesso:</strong> Disponível para <strong>PROFESSOR</strong>, <strong>COORDENADOR</strong> e <strong>DIRETOR</strong>. A listagem mostra o histórico de avaliações da academia.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Conteúdo do PDF:</strong> Cabeçalho com logo da academia, nome e nível do aluno, data da avaliação, grade de habilidades com resultado (aprovado/não aprovado), pontuação total, status de promoção e observações do professor.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Download direto:</strong> O PDF é gerado e baixado imediatamente no navegador ao clicar no ícone de download.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Envio por WhatsApp:</strong> O sistema gera o PDF, salva no Supabase Storage e envia o link para o WhatsApp do responsável via <strong>Twilio</strong>. O número usado é o cadastrado no perfil do aluno.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Armazenamento:</strong> Os PDFs ficam armazenados no Supabase Storage. O link permanente é guardado no banco de dados e pode ser reenviado a qualquer momento.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div v-else-if="secaoAtiva === 'relatorio-periodo'" key="relatorio-periodo" class="space-y-6">
              <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl shadow-inner border border-sky-100">
                  <i class="pi pi-chart-bar"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Relatório por Período</h2>
              </div>
              <div class="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4 text-slate-600">
                <ul class="space-y-4">
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Objetivo:</strong> Visualizar quais alunos foram avaliados e quais estão pendentes dentro de um intervalo de datas selecionado. Útil para monitorar o ciclo de avaliações da academia.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Filtros:</strong> Data início e data fim. O relatório retorna todos os alunos ativos com o status <strong>Avaliado</strong> (e a data da última avaliação no período) ou <strong>Pendente</strong>.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Visibilidade por cargo:</strong> PROFESSOR vê apenas seus alunos. COORDENADOR e DIRETOR veem toda a academia. ADMIN vê todos.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Colunas:</strong> Nome do aluno, nível atual, turmas vinculadas, data da última avaliação no período e status.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div v-else-if="secaoAtiva === 'perfil'" key="perfil" class="space-y-6">
              <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl shadow-inner border border-sky-100">
                  <i class="pi pi-user-edit"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Perfil e Senha</h2>
              </div>
              <div class="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4 text-slate-600">
                <ul class="space-y-4">
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Dados pessoais:</strong> Atualização de nome e e-mail (login) diretamente na tela de perfil.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Troca de senha:</strong> Disponível para qualquer usuário logado. É necessário informar a senha atual antes de definir a nova (mínimo 6 caracteres).</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Senha após reset:</strong> Se um administrador resetou sua senha, ela foi redefinida para <strong>Natacao@123</strong>. Troque-a imediatamente pelo Perfil por segurança.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Sessão e Logout:</strong> O token de acesso expira automaticamente. O sistema renova o token de forma transparente enquanto você usa o sistema. Use o botão de Logout para encerrar a sessão e invalidar os tokens.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div v-else-if="secaoAtiva === 'integracao'" key="integracao" class="space-y-6">
              <div class="flex items-center gap-4 mb-8">
                <div class="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center text-xl shadow-inner border border-slate-200">
                  <i class="pi pi-sync"></i>
                </div>
                <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Integração EVO</h2>
              </div>
              <div class="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4">
                <div class="flex gap-3 items-start">
                  <i class="pi pi-lock text-amber-500 mt-0.5"></i>
                  <p class="text-sm text-amber-700"><strong>Acesso restrito ao ADMIN.</strong> A integração EVO está disponível apenas na aba Admin › Integração do painel administrativo.</p>
                </div>
              </div>
              <div class="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4 text-slate-600">
                <ul class="space-y-4">
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Importação de alunos:</strong> Sincroniza os alunos cadastrados no sistema EVO para a academia selecionada. Alunos já existentes (identificados pelo ID EVO) são ignorados; apenas os novos são criados.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Identificador único:</strong> Cada aluno importado recebe um <strong>ID EVO</strong> único que garante que futuras sincronizações não dupliquem registros.</p>
                  </li>
                  <li class="flex gap-4 items-start">
                    <div class="p-1 rounded-full bg-sky-100 text-sky-500 mt-0.5"><i class="pi pi-check text-xs"></i></div>
                    <p><strong>Planilha de teste:</strong> Disponível para download no painel, permite verificar os dados que seriam importados antes de executar a sincronização real.</p>
                  </li>
                </ul>
              </div>
            </div>

          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.99);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.99);
}
</style>
