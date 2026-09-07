# Kotoba — Japonês em imagens

Chat para aprender japonês com outras pessoas. Uma mensagem guarda a frase japonesa e pode ser lida como figuras, figuras com japonês ou apenas japonês. Pequenas cenas 2D ilustram ações como olhar, beber, comer e ir a um lugar.

## Funciona nesta versão

- Entrada com ChatGPT e criação de perfil com apelido, avatar, idioma e nível.
- Pessoas disponíveis, convites com aceite e conversas individuais.
- Grupos com até 25 participantes, convites, saída e administração.
- Mensagens e perfis persistidos no servidor; histórico com paginação.
- Teclado visual com frases selecionadas e texto livre sem tradução automática.
- Cenas animadas com repetição, pausa e respeito a movimento reduzido.
- Leitura de palavras, kana, romanização, significado e pistas de memória em português e inglês.
- Bloqueio de pessoas, controle de disponibilidade e verificação de participação em todas as rotas.

## Executar e verificar

Requer Node.js 22.13 ou mais recente. O projeto usa React, Vinext e Cloudflare D1, com componentes de interface já incluídos.

1. Instale com `npm ci`.
2. Verifique as permissões com `node --test tests/chat-permissions.test.mjs`.
3. Verifique os tipos com `npx tsc --noEmit`.
4. Gere mudanças no banco com `npm run db:generate`.
5. Compile com `npm run build`.

A configuração de hospedagem fica em `.openai/hosting.json`. As migrações em `drizzle/` devem ser aplicadas na ordem. Não altere uma migração depois de publicada.

## Autenticação e publicação

A publicação utiliza o Sites e a autenticação gerenciada “Entrar com ChatGPT”. O servidor confia nos cabeçalhos de identidade encaminhados pelo serviço de hospedagem. Não exponha este servidor diretamente com cabeçalhos de identidade fornecidos pelo visitante. Ao migrar para outro provedor, implemente e verifique a autenticação desse provedor antes de abrir o acesso.

O GitHub guarda o código. GitHub Pages sozinho não executa este servidor nem o banco de conversas. O endereço online é fornecido pela publicação no Sites.

## Comportamento e limites

- A conversa se atualiza automaticamente a cada aproximadamente 5 segundos com a página visível. Não utiliza WebSocket.
- A disponibilidade expira depois de 75 segundos sem atividade.
- Convites são enviados apenas a perfis que aceitam aparecer como disponíveis.
- Os membros que aceitam entrar num grupo podem ler o histórico desse grupo.
- Bloqueio oculta mensagens entre as duas pessoas, inclusive em grupos compartilhados.
- Há limites básicos de frequência de mensagens e convites.
- Não há criptografia de ponta a ponta, tradução automática, áudio de falantes nativos nem conversão ilimitada de japonês livre para cenas.
- As animações usam símbolos emoji do aparelho, que podem variar visualmente. Cada animação corresponde a uma das estruturas de frase selecionadas.
- O espaço de prática é temporário. Somente idioma e modo de leitura são preferências locais; os dados de conversas reais ficam no banco.
- Figuras e símbolos de partículas são pistas didáticas. Kanji podem ter várias leituras; hiragana representa sons. A função de uma partícula depende da construção.

Os testes usam quatro perfis sintéticos e SQLite real para verificar aceite, autorização, bloqueio, persistência, deduplicação de envio e paginação. Não criam usuários ou mensagens na publicação.
