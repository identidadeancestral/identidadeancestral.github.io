# Disponibilidade do Ojiisan Chat

O incidente de 9 de setembro de 2026 ocorreu porque o HTML estático continuava
com o `connect-src` do Sites após a mudança da API para Supabase. Os testes de
API isolados passaram, mas não verificavam a política aplicada pelo navegador.

O CSP publicado permite `self` e apenas `https://yediixixaxqcwzymhcxf.supabase.co`
para conexões. A compilação passa a gerar essa regra a partir da mesma variável
usada no bundle. `postbuild:github` confere o HTML final e o endereço incluído no
JavaScript. O teste de regressão rejeita explicitamente o CSP antigo.

Um 401 do gateway Supabase não apaga mais a sessão: somente um 401 com
`{"error":"sign_in"}` produzido pela aplicação dispara expiração. Erros de rede
ou infraestrutura durante a abertura preservam a sessão ainda válida na aba.

O projeto `yediixixaxqcwzymhcxf` foi consultado diretamente e está em
`sa-east-1`, São Paulo. `forceFunctionRegion` controla a execução da função;
não altera a localização do banco.

## Verificação periódica

O arquivo `github/workflows/ojiisan-health.yml` é publicado no repositório
`identidadeancestral/identidadeancestral.github.io`, em
`.github/workflows/ojiisan-health.yml`, na branch `main`.

O cron `17 10 */3 * *` executa às 10:17 UTC nos dias 1, 4, 7 etc. do mês,
com intervalos de no máximo três dias. Também pode ser executado manualmente,
ao atualizar o próprio workflow ou depois de uma publicação do Pages.
Ele consulta o banco pelo endpoint `/health`, exige o protocolo 2 com sync,
verifica o acesso público inicial de conta, o CORS (incluindo `Retry-After`)
e o CSP do HTML publicado. Não cria usuários nem mensagens,
não usa chave administrativa e não possui permissão de escrita no repositório.

Isso verifica disponibilidade e gera atividade real de consulta, mas não é uma
garantia contra pausa. O Supabase considera atividade insuficiente em uma janela
de sete dias; uma chamada a cada três dias pode não bastar. A documentação cita
algumas consultas por dia como atividade normalmente suficiente e informa que
planos pagos não estão sujeitos à pausa automática. Não houve mudança de plano.

O GitHub pode atrasar ou descartar execuções agendadas em períodos de carga e
desativa workflows agendados de repositórios públicos após 60 dias sem atividade
no repositório. Conferir o histórico do workflow e os avisos dos provedores.

## Limites que permanecem

A atualização automática combina presença, pessoas e mensagens em uma chamada,
em vez das três de uma conversa aberta. Para na tela Aprender, em aba oculta e
sem rede. Falhas aumentam o intervalo até 60 segundos; um `Retry-After` maior tem
prioridade. Chat e estudo compartilham um limite de 120 pedidos por conta por
minuto no PostgreSQL, independente do número de sessões. Esses controles foram
verificados nos testes de sync, permissões, concorrência e espera do cliente.
Os requisitos ainda pendentes da proteção externa estão em
[backend/gateway/README.md](../backend/gateway/README.md).

`verify_jwt=false` é intencional: a API valida suas próprias sessões opacas.
Há limites persistidos de 600 operações de autenticação por 15 minutos,
100 cadastros por hora e 20 tentativas por e-mail por 15 minutos, além dos
limites de mensagens e convites. Não é correto dizer que cadastro não tem limite.
Esses controles internos não bloqueiam o consumo de invocações no gateway.
Uma chave pública `anon` no navegador tampouco seria um segredo contra abuso.
O plano gratuito inclui 500 mil invocações; proteção contra esgotamento da cota
exige controle de tráfego antes da função e acompanhamento de uso. Não há WAF
configurado nesta correção e não foi realizado teste de carga.

Fontes:
- [Pausa de projetos Supabase](https://supabase.com/docs/guides/platform/free-project-pausing)
- [Invocações incluídas por plano](https://supabase.com/docs/guides/functions/pricing)
- [Execução regional](https://supabase.com/docs/guides/functions/regional-invocation)
- [Agendamento no GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
