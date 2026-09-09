# Ojiisan Chat — Japonês em blocos

Chat para aprender japonês com outras pessoas, baseado no Método 100 Blocos de Wagner Toshiro Umeda. A mensagem é escrita em peças com função identificada; os verbos, substantivos, partículas, advérbios e adjetivos usam cores e rótulos distintos. A explicação mostra como o molde foi preenchido.

## Funciona nesta versão

- Tela inicial em três passos: entender um molde, reconstruir seus blocos e recuperar o sentido sem cores nem tradução.
- Dez moldes iniciais ligados aos números do ebook: 01, 02, 05, 07, 16, 46, 47, 49, 53 e 61, com contexto adicional do bloco 63 no passado.
- Escolha de palavras e verbos compatíveis, partículas explicadas e quatro flexões polidas nas estruturas que permitem a troca.
- Mensagens em blocos com “Como foi montada”, aberto na nova mensagem enviada e recolhível. Texto livre continua sem análise automática.
- Respostas editáveis sugeridas para perguntas dos moldes; o usuário decide o envio.
- Roteiro guiado de apresentação, gostos e café; os personagens são exemplos, não usuários online.
- Revisões dos dez moldes e das quatro histórias salvas por conta, com intervalos de 10 minutos a 60 dias conforme a autoavaliação.
- Leitura lenta por síntese de voz quando o aparelho disponibiliza uma voz japonesa.
- Cadastro e entrada com e-mail e senha próprios do Ojiisan Chat; perfil com apelido, avatar, idioma e nível.
- Recuperação por código privado, alteração de senha e saída da conta. O código é entregue no cadastro e trocado após recuperar ou alterar a senha.
- Vinculação opcional de um perfil da versão anterior, sem recriar conversas nem revisões.
- Lista de pessoas com rolagem própria e áreas separadas para o link do app, prática e perfil, inclusive no celular.
- Pessoas disponíveis, convites com aceite e conversas individuais.
- Grupos com até 25 participantes, convites, saída e administração.
- Mensagens e perfis persistidos no servidor; histórico com paginação.
- Teclado de palavras com frases selecionadas e texto livre sem tradução automática.
- Imagens desligadas por padrão no catálogo; pistas visuais opcionais nas quatro histórias, com pausa e movimento reduzido.
- Quatro frases narrativas, incluindo 今日、起きて、太陽を見ました。 (“Hoje acordei e olhei o sol”), com destaque e avanço por bloco.
- Catálogo pesquisável de exatamente 100 verbos, 100 advérbios, 100 adjetivos e 100 substantivos (400 palavras), com kana e significados em português e inglês.
- Os 100 advérbios têm exemplos próprios com leitura e tradução; não recebem flexões verbais. Algumas entradas também têm uso nominal ou adjetival, identificado nas notas quando relevante.
- Advérbios opcionais em combinações selecionadas dos moldes: frequência no presente polido e intensidade com 好きです. Os demais continuam disponíveis como palavras de estudo, com seus exemplos.
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

O acesso principal é por e-mail e senha, em `/api/account`, tanto no endereço GitHub quanto no Sites. As contas ficam no PostgreSQL privado do Supabase. As senhas são protegidas por `node:crypto` scrypt (N=16384, r=8, p=5), sal aleatório de 16 bytes e comparação de tempo constante. No máximo dois hashes são calculados simultaneamente por isolate, com limites adicionais persistidos por identificador de conta e capacidade global. Não são registrados senhas, códigos ou tokens nos logs.

A interface principal é `https://identidadeancestral.github.io/ojiisan-chat/`. GitHub Pages entrega HTML, CSS e JavaScript; o servidor e o banco ficam no Supabase, em São Paulo. O endereço Sites encaminha ao frontend principal; clientes antigos usam uma ponte para a mesma API, sem novas escritas no D1. O conteúdo da raiz do site Identidade Ancestral é preservado.

A senha aceita de 15 a 128 caracteres, incluindo espaços e Unicode, sem truncamento nem remoção de espaços. O e-mail é um identificador privado de entrada: não se afirma que a caixa de entrada foi verificada. Não há serviço de envio de e-mails configurado. A recuperação funciona com um código aleatório privado entregue na criação da conta; não promete enviar links por e-mail. O código só é armazenado como hash, é de uso único e muda após recuperação ou alteração de senha. Depois de redefinir a senha, o usuário entra novamente.

As sessões usam tokens opacos de oito horas, cujos hashes ficam no banco. A aba retém somente o token em `sessionStorage`; a senha e o código de recuperação não são persistidos no navegador. Cada consulta de identidade verifica também a versão da credencial, invalidando imediatamente sessões antigas ao alterar a senha, inclusive se uma limpeza posterior falhar. As requisições continuam validando participação, aceite e bloqueios no servidor. APIs de conta aceitam somente as origens conhecidas; o CORS externo permite apenas o GitHub configurado.

A opção secundária “Vincular meu perfil anterior” usa a confirmação da identidade da versão antiga uma única vez. O fluxo existente de `/connect` e PKCE permanece somente para essa transição. Uma sessão antiga ainda válida também pode definir a nova senha. O vínculo reutiliza a identidade já autenticada; nunca procura nem assume um perfil antigo apenas porque foi digitado o mesmo e-mail. Ao definir a senha, os tokens antigos são revogados e a identidade legada deixa de autorizar chat e revisões daquela conta. Novos usuários não precisam de ChatGPT.

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
- Palavras avulsas e flexões são cartões didáticos. Os dez moldes permitem substituições de um vocabulário compatível selecionado; não prometem aceitar qualquer combinação das 400 entradas. Há palavras auxiliares dos moldes fora do catálogo de 400.
- O roteiro demonstra uma troca possível com essa base. Não comprova fluência, eficácia clínica ou memorização permanente. As revisões são uma adaptação prática; não reproduzem integralmente o calendário D+0 até D+180 do livro.
- As revisões são uma agenda simples por autoavaliação: “Preciso rever” agenda dez minutos; “Lembrei” progride por um, três, sete, 21 e 60 dias. Repetir “Lembrei” antes do prazo não pula etapas. Não há avaliação automática de pronúncia nem promessa de memorização permanente.
- O espaço de prática é temporário. Idioma e modo de leitura são preferências locais. Conversas reais e revisões ficam no banco; o token de sessão do GitHub fica apenas nesta aba.
- Figuras e símbolos de partículas são pistas didáticas. Kanji podem ter várias leituras; hiragana representa sons. A função de uma partícula depende da construção.

Os testes usam quatro perfis sintéticos e SQLite real para verificar aceite, autorização, bloqueio, persistência, deduplicação de envio e paginação. Também verificam as 400 entradas, as flexões, exceções, a ordem dos roteiros e a validação de novas mensagens. Um teste adicional usa dois perfis sintéticos, aceite de convite e troca do roteiro em SQLite, verificando as frases reconstruídas pelo servidor. Os moldes, papéis gramaticais, flexões e rejeição de combinações incompatíveis também são verificados. Os testes também verificam o vínculo PKCE, uso único e expiração dos códigos, revogação de sessões, restrição de origem e separação do progresso por usuário. Não criam usuários ou mensagens na publicação. A compilação e esses testes não substituem uma verificação interativa de login em cada navegador.

## Referências pedagógicas

A estrutura de treino aproveita as ideias do ebook do autor (v1, 175 páginas): arquitetura em blocos (pp. 6–11), verbos-motor (pp. 33–38), histórias de kana (pp. 55–56) e recuperação com revisão (pp. 167–170). O PDF pago não é distribuído neste repositório. A edição em blocos usa a anatomia de molde (p. 79), a seleção identificada dos blocos nas pp. 82–119 e as expressões de conversa (pp. 156–159). O vocabulário adicional e as histórias foram escritos para o app; o ebook completo e sua versão integral dos 100 blocos não são distribuídos. As cores por função são uma convenção do app.

As regras foram conferidas com as [notas gramaticais Irodori, Japan Foundation](https://www.irodori.jpf.go.jp/assets/data/Grammar_all.pdf), incluindo as tabelas de [forma て](https://www.irodori.jpf.go.jp/assets/data/elementary01/pdf/Y_L01.pdf) e [passado simples](https://www.irodori.jpf.go.jp/assets/data/elementary01/pdf/Y_L08.pdf). Trata-se de uma seleção de vocabulário para expansão, sem alegação de corresponder integralmente a um nível JLPT.

A expansão de advérbios usa exemplos originais. A frequência, a ordem variável antes do verbo e os padrões negativos foram conferidos nas notas Irodori da Japan Foundation, pp. 13 e 33–35 do PDF citado acima. As seleções de combinação dos moldes são limitadas para preservar o sentido; não há conversão livre de qualquer sequência de palavras em uma frase correta. O endereço público principal e canônico é https://identidadeancestral.github.io/ojiisan-chat/.

## Verificação do acesso por senha

Testes locais com perfis sintéticos verificam cadastro, login, envio com aceite, rejeição de terceiros, saída, expiração, alteração de senha, revogação por versão de credencial, recuperação de uso único, vínculo de histórico antigo, limites de tentativas e tamanho do corpo da requisição. Não criam contas de teste na publicação. O ajuste para celular foi conferido no código; não foi realizada inspeção visual no navegador.

Referências: [armazenamento de senhas — OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) e [node:crypto em Cloudflare Workers](https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/).

## Backend Supabase

Disponibilidade, correção do CSP, tratamento de erros do gateway e verificação
periódica estão documentados em [docs/availability.md](docs/availability.md).

A API independente está em `backend/supabase/`, no projeto Ojiisan Chat
`yediixixaxqcwzymhcxf`, região São Paulo, plano gratuito autorizado.
A URL pública da função é
`https://yediixixaxqcwzymhcxf.supabase.co/functions/v1/ojiisan-api`.
Preserva as APIs, os blocos, a autenticação por senha e os identificadores
existentes. Consulte `backend/supabase/README.md` para publicação e transição.
Os dados de produção não fazem parte deste repositório.

Foram verificados 36 testes locais, incluindo dez com PostgreSQL via PGlite e
dois de congelamento/encaminhamento. O runtime publicado também passou por
cadastro, login, mensagens com aceite, grupos, bloqueio de terceiros, estudo,
recuperação e revogação usando três contas sintéticas removidas ao terminar.
Isso verifica os fluxos de servidor; não é teste de carga nem inspeção visual
em todos os navegadores.
