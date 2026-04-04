# AGENTS.md

## 📌 Projeto
Marketplace de nicho para peças, acessórios e carros voltados a arrancada e carros antigos.

Nome do projeto: market_car

---

## 🎯 Objetivo
Desenvolver um aplicativo estilo marketplace onde:

- vendedores anunciam produtos
- compradores entram em contato direto (WhatsApp)
- a plataforma NÃO intermedia pagamento

---

## 🧱 Arquitetura atual

- Frontend: HTML, CSS, JavaScript puro
- Backend: Firebase (Auth, Firestore, Storage)
- Tipo: PWA (Progressive Web App)

---

## 📦 Estrutura do projeto

- index.html → estrutura principal
- style.css → layout e identidade visual
- app.js → lógica principal
- firebase-config.js → configuração do Firebase
- sw.js → service worker
- manifest.json → PWA

---

## 🔄 Versionamento

- V00 → base estrutural
- V01 → autenticação
- V02 → anúncios
- V03 → upload de imagem
- V04 → busca e filtros
- V05 → perfil de usuário
- V06 → monetização

⚠️ Nunca pular versão.
⚠️ Sempre manter compatibilidade.

---

## 🚫 Regras obrigatórias para o agente

- NÃO quebrar funcionalidades existentes
- NÃO remover código sem justificativa
- NÃO alterar nomes de arquivos sem necessidade
- NÃO introduzir bibliotecas sem autorização
- NÃO modificar estrutura sem explicar

---

## ✅ Regras de desenvolvimento

- Sempre entregar arquivos completos (não trechos)
- Sempre explicar mudanças realizadas
- Sempre indicar riscos
- Sempre sugerir próximos passos

---

## 🔍 Qualidade de código

- Código limpo e organizado
- Nomes claros e consistentes
- Separação de responsabilidades
- Evitar duplicação de lógica

---

## 🧪 Testes obrigatórios

Sempre validar:

- cadastro de usuário
- login
- criação de anúncio
- listagem de anúncios
- filtro de busca
- contato via WhatsApp

---

## 🧠 Comportamento esperado do agente

Antes de programar:

1. Entender o contexto
2. Validar objetivo
3. Propor solução
4. Só então implementar

---

## ⚠️ Segurança (futuro)

- Implementar regras Firestore seguras
- Associar anúncios ao usuário logado
- Evitar acesso não autorizado

---

## 📈 Evolução esperada

O projeto deve evoluir para:

- sistema de reputação
- anúncios destacados pagos
- painel administrativo
- chat interno
- verificação de vendedores

---

## 📌 Padrão de entrega

Toda implementação deve conter:

1. Código completo
2. Explicação técnica
3. Possíveis erros
4. Checklist de testes
5. Próxima versão sugerida