# Ojiisan Chat — Japonês em blocos

Chat para aprender japonês com outras pessoas, baseado no Método 100 Blocos de Wagner Toshiro Umeda. A mensagem é escrita em peças com função identificada; os verbos, substantivos, partículas e adjetivos usam cores e rótulos distintos. A explicação mostra como o molde foi preenchido.

## Funciona nesta versão

- Tela inicial em três passos: entender um molde, reconstruir seus blocos e recuperar o sentido sem cores nem tradução.
- Dez moldes iniciais ligados aos números do ebook: 01, 02, 05, 07, 16, 46, 47, 49, 53 e 61, com contexto adicional do bloco 63 no passado.
- Escolha de palavras e verbos compatíveis, partículas explicadas e quatro flexões polidas nas estruturas que permitem a troca.
- Mensagens em blocos com “Como foi montada”, aberto na nova mensagem enviada e recolhível. Texto livre continua sem análise automática.
- Respostas editáveis sugeridas para perguntas dos moldes; o usuário decide o envio.
- Roteiro guiado de apresentação, gostos e café; os personagens são exemplos, não usuários online.
- Revisões dos dez moldes e das quatro histórias salvas por conta, com intervalos de 10 minutos a 60 dias conforme a autoavaliação.
- Leitura lenta por síntese de voz quando o aparelho disponibiliza uma voz japonesa.
- Entrada com ChatGPT e criação de perfil com apelido, avatar, idioma e nível.
- Pessoas disponíveis, convites com aceite e conversas individuais.
- Grupos com até 25 participantes, convites, saída e administração.
- Mensagens e perfis persistidos no servidor; histórico com paginação.
- Teclado de palavras com frases selecionadas e texto livre sem tradução automática.
- Imagens desligadas por padrão no catálogo; pistas visuais opcionais nas quatro histórias, com pausa e movimento reduzido.
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
5. Compile o servidor com `npm run build`.
6. Compile a interface para GitHub Pages com `npm run build:github`; publique o conteúdo de `github-dist/` em `ojiisan-chat/` na branch usada pelo Pages.

A configuração de hospedagem fica em `.openai/hosting.json`. As migrações em `drizzle/` devem ser aplicadas na ordem. Não altere uma migração depois de publicada.

## Autenticação e publicação

A publicação utiliza o Sites e a autenticação gerenciada “Entrar com ChatGPT”. O servidor confia nos cabeçalhos de identidade encaminhados pelo serviço de hospedagem. Não exponha este servidor diretamente com cabeçalhos de identidade fornecidos pelo visitante. Ao migrar para outro provedor, implemente e verifique a autenticação desse provedor antes de abrir o acesso.

A interface está preparada para `https://identidadeancestral.github.io/ojiisan-chat/`. GitHub Pages entrega HTML, CSS e JavaScript; o servidor e o banco continuam no Sites. Os endereços permitidos estão em `lib/frontend-config.ts`. O conteúdo da raiz do site Identidade Ancestral é preservado.

O botão Entrar abre a autenticação do Sites por navegação de página inteira. Após a autenticação gerenciada, `/connect` emite um código de uso único, válido por dois minutos, vinculado a uma prova PKCE S256. O retorno usa um destino fixo e um fragmento que o cliente remove antes da troca. O cliente valida o estado da tentativa e troca o código usando o verificador temporário desta aba. O servidor aceita CORS apenas da origem GitHub configurada.

As sessões da interface GitHub expiram em oito horas e são revogadas ao sair. O servidor guarda somente hashes dos códigos e tokens; a aba guarda o token opaco em `sessionStorage`. Não coloque credenciais de infraestrutura no frontend. Cada requisição continua verificando identidade, participação na conversa e bloqueios no servidor. Ao sair ou trocar de sessão, os dados da tela são descartados.

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
- Palavras avulsas e flexões são cartões didáticos. Os dez moldes permitem substituições de um vocabulário compatível selecionado; não prometem aceitar qualquer combinação das 300 entradas. Há palavras auxiliares dos moldes fora do catálogo de 300.
- O roteiro demonstra uma troca possível com essa base. Não comprova fluência, eficácia clínica ou memorização permanente. As revisões são uma adaptação prática; não reproduzem integralmente o calendário D+0 até D+180 do livro.
- As revisões são uma agenda simples por autoavaliação: “Preciso rever” agenda dez minutos; “Lembrei” progride por um, três, sete, 21 e 60 dias. Repetir “Lembrei” antes do prazo não pula etapas. Não há avaliação automática de pronúncia nem promessa de memorização permanente.
- O espaço de prática é temporário. Idioma e modo de leitura são preferências locais. Conversas reais e revisões ficam no banco; o token de sessão do GitHub fica apenas nesta aba.
- Figuras e símbolos de partículas são pistas didáticas. Kanji podem ter várias leituras; hiragana representa sons. A função de uma partícula depende da construção.

Os testes usam quatro perfis sintéticos e SQLite real para verificar aceite, autorização, bloqueio, persistência, deduplicação de envio e paginação. Também verificam as 300 entradas, as flexões, exceções, a ordem dos roteiros e a validação de novas mensagens. Um teste adicional usa dois perfis sintéticos, aceite de convite e troca do roteiro em SQLite, verificando as frases reconstruídas pelo servidor. Os moldes, papéis gramaticais, flexões e rejeição de combinações incompatíveis também são verificados. Os testes também verificam o vínculo PKCE, uso único e expiração dos códigos, revogação de sessões, restrição de origem e separação do progresso por usuário. Não criam usuários ou mensagens na publicação. A compilação e esses testes não substituem uma verificação interativa de login em cada navegador.

## Referências pedagógicas

A estrutura de treino aproveita as ideias do ebook do autor (v1, 175 páginas): arquitetura em blocos (pp. 6–11), verbos-motor (pp. 33–38), histórias de kana (pp. 55–56) e recuperação com revisão (pp. 167–170). O PDF pago não é distribuído neste repositório. A edição em blocos usa a anatomia de molde (p. 79), a seleção identificada dos blocos nas pp. 82–119 e as expressões de conversa (pp. 156–159). O vocabulário adicional e as histórias foram escritos para o app; o ebook completo e sua versão integral dos 100 blocos não são distribuídos. As cores por função são uma convenção do app.

As regras foram conferidas com as [notas gramaticais Irodori, Japan Foundation](https://www.irodori.jpf.go.jp/assets/data/Grammar_all.pdf), incluindo as tabelas de [forma て](https://www.irodori.jpf.go.jp/assets/data/elementary01/pdf/Y_L01.pdf) e [passado simples](https://www.irodori.jpf.go.jp/assets/data/elementary01/pdf/Y_L08.pdf). Trata-se de uma seleção de vocabulário para expansão, sem alegação de corresponder integralmente a um nível JLPT.
