# Ojiisan Chat — Japonês em cenas

Chat para aprender japonês com outras pessoas, associado ao Método 100 Blocos de Wagner Toshiro Umeda. Uma mensagem guarda a frase japonesa e pode ser lida como figuras, figuras com japonês ou apenas japonês. As cenas revelam contexto, objetos, partículas e ações na ordem dos blocos japoneses.

## Funciona nesta versão

- Entrada com ChatGPT e criação de perfil com apelido, avatar, idioma e nível.
- Pessoas disponíveis, convites com aceite e conversas individuais.
- Grupos com até 25 participantes, convites, saída e administração.
- Mensagens e perfis persistidos no servidor; histórico com paginação.
- Teclado visual com frases selecionadas e texto livre sem tradução automática.
- Cenas animadas com repetição, pausa e respeito a movimento reduzido.
- Quatro frases narrativas, incluindo 今日、起きて、太陽を見ました。 (“Hoje acordei e olhei o sol”), com destaque e avanço por bloco.
- Catálogo pesquisável de exatamente 100 verbos, 100 substantivos e 100 adjetivos, todos com figura, kana e significados em português e inglês.
- Nove formas para cada verbo: dicionário, polida, negativa polida, passado polido, passado negativo polido, negativa simples, passado simples, passado negativo simples e forma て.
- Sete formas de adjetivos, distinguindo い e な, incluindo uso antes de substantivos. Grupos de verbos explícitos e exceções como 行く, 来る, ある e いい.
- Envio de palavras nas formas selecionadas como cartões de estudo; leitura sem tradução para recuperação ativa.
- Link do ebook fornecido pelo autor: https://hotmart.com/pt-br/club/toshiro-umeda. O link abre a página Hotmart informada; o app não processa compras nem verifica assinaturas.
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
- A passagem entre quadros acompanha a escrita japonesa. Partículas mostram relações e não são tratadas como eventos físicos. Os quatro roteiros atuais são passados; a forma て inicial liga as ações.
- Palavras avulsas e flexões são cartões didáticos. Não existe montagem automática de qualquer combinação das 300 palavras, nem filme gerado para texto livre.
- O cronograma de revisão do ebook é orientação; esta versão não calcula revisões nem promete memorização permanente.
- O espaço de prática é temporário. Somente idioma e modo de leitura são preferências locais; os dados de conversas reais ficam no banco.
- Figuras e símbolos de partículas são pistas didáticas. Kanji podem ter várias leituras; hiragana representa sons. A função de uma partícula depende da construção.

Os testes usam quatro perfis sintéticos e SQLite real para verificar aceite, autorização, bloqueio, persistência, deduplicação de envio e paginação. Também verificam as 300 entradas, as flexões, exceções, a ordem dos roteiros e a validação de novas mensagens. Não criam usuários ou mensagens na publicação.

## Referências pedagógicas

A estrutura de treino aproveita as ideias do ebook do autor (v1, 175 páginas): arquitetura em blocos (pp. 6–11), verbos-motor (pp. 33–38), histórias de kana (pp. 55–56) e recuperação com revisão (pp. 167–170). O PDF pago não é distribuído neste repositório. O vocabulário adicional e as cenas foram escritos para o app; não constituem transcrição das 100 estruturas do livro.

As regras foram conferidas com as [notas gramaticais Irodori, Japan Foundation](https://www.irodori.jpf.go.jp/assets/data/Grammar_all.pdf), incluindo as tabelas de [forma て](https://www.irodori.jpf.go.jp/assets/data/elementary01/pdf/Y_L01.pdf) e [passado simples](https://www.irodori.jpf.go.jp/assets/data/elementary01/pdf/Y_L08.pdf). Trata-se de uma seleção de vocabulário para expansão, sem alegação de corresponder integralmente a um nível JLPT.
