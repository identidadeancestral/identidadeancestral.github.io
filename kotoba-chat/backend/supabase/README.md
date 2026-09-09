# Backend independente do Ojiisan Chat

Projeto publicado: `yediixixaxqcwzymhcxf`, Ojiisan Chat, São Paulo (`sa-east-1`).
Plano gratuito de US$ 0/mês autorizado pelo proprietário.
API: `https://yediixixaxqcwzymhcxf.supabase.co/functions/v1/ojiisan-api`.

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
   tabelas, permissões e os avisos do Supabase. A implantação inicial foi registrada com `apply_migration` em
   `create_ojiisan_private_backend`. Não reaplicar nem editar a migração publicada.
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
7. Para o perfil legado que ainda não tem senha, a ponte fica habilitada por padrão
   (`OJIISAN_LEGACY_BRIDGE=false` desabilita): a confirmação anterior prova a posse do ID do
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
lá, a API aplica limites globais de 600 tentativas a cada 15 minutos e 100 cadastros
por hora, além de 20 tentativas por e-mail a cada 15 minutos. Há no máximo dois
hashes simultâneos por instância. Esta capacidade inicial não foi testada sob carga.

O runtime Supabase publicado passou por cadastro, login, mensagens com aceite,
grupos, rejeição de terceiros, estudo, recuperação de uso único, revogação e saída.
As três contas e conversas sintéticas foram removidas ao terminar. Não foi feita
inspeção visual no navegador.

No Sites, `OJIISAN_BACKEND_MODE=freeze` bloqueia as escritas durante a cópia;
`supabase` encaminha as APIs antigas ao novo servidor e redireciona a página
inicial ao GitHub. Cada alteração exige publicar a versão salva para aplicar a
revisão do ambiente. A rota `/api/legacy-profile` só comprova o ID do perfil antigo.

O frontend usa a região do banco através do parâmetro oficial
`forceFunctionRegion=sa-east-1`. Em caso de indisponibilidade regional, alterar
a configuração requer nova compilação do frontend.

Os avisos de segurança são informativos: RLS sem políticas é intencional neste
schema privado, cuja API autentica e autoriza as operações no servidor.
[Explicação do aviso](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
Os índices ainda sem uso são esperados em um banco novo e foram preservados
para as consultas e chaves estrangeiras.
[Explicação de índices sem uso](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).

Fontes oficiais verificadas:
- [PostgreSQL em Edge Functions](https://supabase.com/docs/guides/functions/connect-to-postgres)
- [Variáveis da função](https://supabase.com/docs/guides/functions/secrets)
- [Compatibilidade Node/npm](https://supabase.com/blog/edge-functions-node-npm)
- [Limites do runtime](https://supabase.com/docs/guides/functions/limits)

- [Execução na região do banco](https://supabase.com/docs/guides/functions/regional-invocation)
