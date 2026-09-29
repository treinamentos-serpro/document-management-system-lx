---
name: sanitizar-entrada-api
description: Analisa e corrige validação e sanitização de entradas não confiáveis em APIs para prevenir injeção, traversal e outros ataques, com testes focados.
argument-hint: arquivo, rota ou endpoint da API a analisar
agent: agent
---

# Proteger entrada de API

Analise e proteja a entrada não confiável da API indicada: `${input:alvo:arquivo, rota ou endpoint}`. Se houver código selecionado, use-o como contexto inicial; confirme o fluxo completo no workspace antes de editar.

## Regras

- Siga as instruções do projeto e preserve a arquitetura existente. Neste backend, mantenha o fluxo `routes -> controllers -> services -> repositories`, CommonJS e JavaScript sem TypeScript.
- Trace os dados desde a fronteira HTTP (headers, parâmetros de rota/query, JSON e multipart/form-data) até validações, regras de negócio e operações sensíveis.
- Valide tipos, presença, formato, tamanho e valores permitidos conforme o contrato real. Normalize somente quando a semântica exigir; rejeite entradas inválidas com os status e formato de erro já adotados.
- Escolha a defesa pelo ponto de uso: use APIs parametrizadas para consultas, evite montar comandos de shell com dados do usuário, restrinja caminhos a diretórios autorizados e aplique codificação de saída no contexto apropriado. Não trate codificação de saída como sanitização universal de entrada.
- Para uploads, não confie em nomes, caminhos ou metadados fornecidos pelo cliente; respeite os limites e o armazenamento local configurados pelo projeto.
- Não remova caracteres indiscriminadamente, não altere silenciosamente dados válidos e não adicione uma biblioteca de sanitização sem necessidade demonstrada. Sanitização não substitui validação, autorização ou codificação contextual.
- Faça a menor alteração necessária nos arquivos de produção e acrescente testes seguindo `node:test` e os padrões existentes. Não enfraqueça contratos nem exponha detalhes internos nas respostas.
- Não amplie o escopo para endpoints não relacionados. Se encontrar um risco fora do alvo, relate-o separadamente sem corrigi-lo nesta tarefa.

## Processo

1. Inspecione a rota, o controller, os serviços/repositórios envolvidos, o tratamento de erros e os testes próximos.
2. Identifique os limites de confiança, os sinks relevantes, os vetores de ataque plausíveis e as validações já existentes. Diferencie vulnerabilidades demonstráveis de riscos hipotéticos.
3. Implemente a defesa apropriada na camada responsável e cubra entradas válidas, inválidas e casos de borda nos testes.
4. Execute o teste mais específico disponível; se não existir, execute a suíte backend com `node --test backend/test/*.test.js`. Corrija falhas introduzidas pela alteração.
5. Ao concluir, resuma o risco tratado, a estratégia adotada, os arquivos alterados e o resultado dos testes. Aponte limitações ou riscos restantes sem declarar segurança absoluta.
