# Backend independente do Ojiisan Chat

Estado: implementação preparada; não foi conectada à publicação ativa. O app
continua usando o servidor Sites até a conclusão dos passos abaixo.

## O que muda

As APIs de conta, chat e revisão passam a rodar em uma Edge Function do Supabase
com PostgreSQL em uma conta controlada pelo proprietário do Ojiisan Chat. O
frontend continua em `https://identidadeancestral.github.io/ojiisan-chat/`.

Esta migração preserva a autenticação própria por e-mail, senha scrypt e código
de recuperação. Não substitui contas por Supabase Auth nem promete recuperação
por e-mail sem um remetente configurado. O chat continua com atualização por
consultas periódicas; WebSockets/Realtime não estão implementados nesta etapa.

O schema `ojiisan` é privado, sem acesso para `anon`, `authenticated` ou `PUBLIC`.
As tabelas têm RLS como defesa adicional. A Edge Function usa a conexão de banco
do servidor e valida identidade, participação, aceite e bloqueios em todas as
rotas. O navegador recebe apenas a URL pública da função e um token opaco de
sessão; nunca recebe conexão do banco, segredo do projeto ou chave de serviço.

## Arquivos

- `schema.sql`: schema inicial PostgreSQL, índices, chaves estrangeiras e isolamento.
- `postgres-adapter.ts`: parâmetros SQL e transações para as regras já existentes.
- `router.ts`: roteamento, CORS, limites de corpo e identidade das sessões.
- `edge.ts`: conexão PostgreSQL com TLS, uma conexão por instância e pool compatível.
- `import-snapshot.ts`: importação transacional, somente em destino vazio, preservando IDs.
- `config.toml`: `verify_jwt = false`, pois a API valida suas próprias sessões opacas.
- `../../scripts/build-supabase.mjs`: gera `dist/index.ts` e `dist/deno.json`.

## Publicação e migração

1. Usar as ferramentas autenticadas do Supabase para listar os projetos. Selecionar
   um projeto dedicado ao Ojiisan Chat; não modificar tabelas de outros aplicativos.
   Confirmar os limites e custos reais da conta antes de assumir um plano.
2. Aplicar `schema.sql` somente em um destino sem schema `ojiisan`. Conferir as
   tabelas, permissões e os avisos do Supabase. Registrar a migração com a CLI
   usando os comandos verificados da versão instalada, sem inventar um timestamp.
3. Gerar o bundle com `node scripts/build-supabase.mjs` e publicar `ojiisan-api`.
   A conexão `SUPABASE_DB_URL` é fornecida pelo ambiente. Se for necessário usar
   o pooler, definir `OJIISAN_DATABASE_URL` como segredo somente no servidor.
   A função não depende de `service_role` no cliente nem de Supabase Auth.
4. Validar no runtime publicado: cadastro, login, leitura/escrita, recuperação,
   revogação, duas contas com aceite e rejeição de terceiros. Os testes locais
   usam PostgreSQL real via PGlite, mas não substituem essa verificação do runtime
   hospedado, da conexão TLS, dos limites de CPU nem das variáveis do projeto.
5. Fazer uma janela curta de manutenção bloqueando novas escritas no backend
   antigo. Exportar TODAS as tabelas usando as ferramentas autenticadas do Sites,
   percorrendo a paginação e rejeitando valores/linhas/colunas truncados. Revalidar
   o inventário nesse momento; a leitura feita durante a preparação não é um backup.
   Nunca publicar o export, hashes de senha, tokens ou histórico no GitHub.
6. Importar o snapshot validado em uma transação e conferir contagens, IDs,
   vínculos, hashes e sequência de mensagens. O importador recusa um destino
   não vazio e reverte tudo diante de um erro. Nunca sobrescrever dados novos
   do destino com um export antigo.
7. Para o perfil legado que ainda não tem senha, habilitar temporariamente
   `OJIISAN_LEGACY_BRIDGE=true`: a confirmação anterior prova a posse do ID do
   perfil importado, sem usar e-mail como prova. Após definir a senha, o acesso
   normal não chama o Sites. Desabilitar a ponte após concluir os vínculos.
8. Obter a URL real da função do projeto. Compilar o frontend com
   `OJIISAN_API_BASE` apontando para essa URL terminada em
   `/functions/v1/ojiisan-api`. Não inventar ID de projeto ou URL de publicação.
   Publicar apenas a pasta `ojiisan-chat/` no GitHub Pages, mantendo os demais
   sites do proprietário. Atualizar também o endereço Sites para encaminhar ao
   frontend principal, evitando duas fontes de escrita.
9. Confirmar a publicação e a troca de API. Manter o banco anterior preservado
   e sem novas escritas durante a janela de rollback. Se houver novas mensagens
   no destino, um rollback exige exportá-las antes de reabrir o backend anterior.

## Limites e verificações

A identidade de IP encaminhada pelo Supabase precisa ser confirmada antes de
ativar limites por IP: cabeçalhos enviados pelo cliente não são confiáveis. Até
lá, a API aplica o limite global conservador já existente (60 tentativas a cada
15 minutos, 10 cadastros por hora), além de limites por e-mail. Ajustar essa
capacidade e a proteção contra abuso antes de uma abertura para muitos usuários.

O projeto Supabase deve ser escolhido e a migração verificada antes de mudar o
link ativo. Não foi feita inspeção visual do app nem teste em produção Supabase
durante a preparação. Não são enviadas mensagens a usuários pelos testes locais.

Fontes oficiais verificadas:
- [PostgreSQL em Edge Functions](https://supabase.com/docs/guides/functions/connect-to-postgres)
- [Variáveis da função](https://supabase.com/docs/guides/functions/secrets)
- [Compatibilidade Node/npm](https://supabase.com/blog/edge-functions-node-npm)
- [Limites do runtime](https://supabase.com/docs/guides/functions/limits)
