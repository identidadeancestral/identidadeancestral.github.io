# Proteção externa: preparação e condição de ativação

Status: **não ativada**. O aplicativo continua usando Supabase diretamente.
Nesta sessão não há integração Cloudflare nem acesso às configurações dessa conta.
Não foi contratado plano pago, criado domínio ou alterado o login dos usuários.

## O que já pode ser publicado

- Uma chamada `POST /api/chat` com `action: "sync"` reúne presença, pessoas e
  mensagens. Substitui as três chamadas do ciclo de conversa aberta.
- A consulta automática para na tela Aprender, com a página oculta ou sem rede.
- Falhas têm espera progressiva; `Retry-After` tem prioridade. A sessão só é
  encerrada pelo erro explícito `sign_in`, nunca por um 401 genérico do gateway.
- Chat e estudo aceitam até 120 pedidos por conta por minuto. Todas as sessões
  da mesma conta compartilham o contador PostgreSQL; o IP informado pelo cliente
  não identifica o usuário. Os limites existentes de cadastro, senha, mensagens
  e convites continuam valendo.

Essas medidas economizam o uso normal e limitam trabalho no banco. **Não bloqueiam
o consumo de invocações por chamadas feitas diretamente à Edge Function.**

## Configuração proposta para uma camada externa

Após obter acesso à conta Cloudflare do proprietário:

1. Confirmar os recursos gratuitos disponíveis. Preparar um Worker separado,
   com upstream fixo para a função existente; nunca aceitar URL de destino do
   cliente. Manter o site em `identidadeancestral.github.io/ojiisan-chat/`.
2. Permitir apenas os caminhos atuais: `/api/account`, `/api/chat`, `/api/study`,
   `/api/frontend-session` e `/health`; métodos GET, POST e OPTIONS; corpos de
   até 8.192 bytes para conta e 10.000 para as outras rotas. Não registrar senha,
   e-mail, token, código de recuperação ou conteúdo de mensagens nos logs.
3. Rejeitar tráfego excessivo antes de encaminhar. Um limite amplo por IP
   verificado pela Cloudflare pode conter rajadas, mas precisa considerar redes
   compartilhadas. O rate limiter de Workers é por localidade e não constitui
   um teto global exato. Se houver teto diário/mensal, usar contador central e
   atômico, falhando fechado quando indisponível; definir os valores após medir
   o uso real e considerar também os limites do plano Cloudflare.
4. **Resolver e testar o acesso direto à origem antes de chamar isso de proteção
   da cota.** A URL Supabase já é pública. Apenas adicionar um proxy, um segredo
   verificado dentro da função ou CORS não elimina o caminho de ataque direto.
   Não publicar uma chave privilegiada no bundle. Não ativar `verify_jwt=true`
   na aplicação atual: os tokens `oj1_...` são sessões próprias, não JWT Supabase.
   Qualquer mudança de autenticação entre gateway e origem exige um contrato
   separado, credencial somente no servidor e teste de compatibilidade do login.
5. Confirmar com medição de uso/documentação do provedor se rejeições na entrada
   realmente deixam de contar como invocação. A documentação de cobrança diz
   que o status HTTP não isenta a chamada; não assumir que um 401 protege a cota.
   Se não houver bloqueio não faturado da origem no plano escolhido, a garantia
   exige outra arquitetura de execução, não apenas um Worker de proxy.
6. Só depois dessas verificações trocar `OJIISAN_API_BASE`, recompilar (o CSP
   acompanha essa origem), atualizar o monitor e testar cadastro, login, estudo,
   aceite de convite, mensagens, bloqueios e expiração de sessão. Preservar o
   backend anterior até validar a transição e registrar o procedimento de volta.

Não há código de proxy marcado como pronto para produção porque o requisito de
bloqueio da origem ainda não foi validado. Essa é a condição de ativação, além
do acesso à conta, para não apresentar uma proteção apenas aparente.

## Monitoramento e limites conhecidos

O workflow `github/workflows/ojiisan-health.yml` verifica uma consulta real ao
banco, versão do protocolo, entrada pública de conta, CORS e CSP. Mantém o cron
solicitado a cada três dias e também executa após a publicação do Pages.
Não mede consumo mensal nem assegura disponibilidade contínua. Consultas pouco
frequentes não garantem que o projeto gratuito nunca seja pausado. Workflows
públicos agendados também podem ser desativados após 60 dias sem atividade no
repositório, e a execução pode atrasar.

Fontes oficiais consultadas:

- [Cobrança de invocações Supabase](https://supabase.com/docs/guides/platform/manage-your-usage/edge-function-invocations): franquia gratuita de 500.000; chamadas contam independentemente do status; OPTIONS não é cobrado.
- [Autenticação de funções](https://supabase.com/docs/guides/functions/auth).
- [Pausa de projetos gratuitos](https://supabase.com/docs/guides/platform/free-project-pausing).
- [Rate limiting de Workers](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).
- [Limites e preços de Durable Objects](https://developers.cloudflare.com/durable-objects/platform/pricing/).
- [Agendamentos do GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).
