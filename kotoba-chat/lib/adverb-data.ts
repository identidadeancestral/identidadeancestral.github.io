import type { Entry } from "./study-data";

// Original selection and examples. These are adverbial uses, including words
// that can have other grammatical roles and a few conventional に expressions.
// Keep readings separate from kanji; do not generate verb endings for adverbs.
export const adverbs:Entry[] = `
always|いつも|いつも|sempre|always|いつもお茶を飲みます。|いつもおちゃをのみます。|Sempre bebo chá.|I always drink tea.
often|よく|よく|com frequência / bem|often / well|よく公園に行きます。|よくこうえんにいきます。|Vou ao parque com frequência.|I often go to the park.|Aqui indica frequência. Em よく分かります, pode indicar entender bem.|Here it marks frequency. In よく分かります it can mean understanding well.
sometimes|時々|ときどき|às vezes|sometimes|時々魚を食べます。|ときどきさかなをたべます。|Às vezes como peixe.|I sometimes eat fish.
occasionally|たまに|たまに|de vez em quando|occasionally|たまに映画を見ます。|たまにえいがをみます。|De vez em quando vejo um filme.|I occasionally watch a movie.
frequently|しばしば|しばしば|frequentemente|frequently|しばしばこの店に来ます。|しばしばこのみせにきます。|Venho frequentemente a esta loja.|I frequently come to this shop.|Tem um tom mais escrito que よく.|It sounds more written than よく.
repeatedly|たびたび|たびたび|repetidas vezes|repeatedly|たびたび同じ質問をします。|たびたびおなじしつもんをします。|Faço repetidas vezes a mesma pergunta.|I repeatedly ask the same question.
rarely|めったに|めったに|raramente, com negativa|rarely, with a negative|めったにお酒を飲みません。|めったにおさけをのみません。|Raramente bebo álcool.|I rarely drink alcohol.|Aprenda com uma negativa: めったに〜ません. A negativa japonesa já faz parte do sentido de raramente.|Learn it with a negative: めったに〜ません. The Japanese negative is part of the meaning rarely.
not-much|あまり|あまり|não muito, com negativa|not very much, with a negative|あまりパンを食べません。|あまりぱんをたべません。|Não como muito pão.|I do not eat much bread.|Neste uso inicial, combine com uma negativa. Não traduza あまり sozinho como muito.|In this beginner use, pair it with a negative. Do not translate あまり alone as very.
not-at-all|全然|ぜんぜん|nada / de modo algum, com negativa|not at all, with a negative|全然分かりません。|ぜんぜんわかりません。|Não entendo nada.|I do not understand at all.|Aqui acompanha a negativa. Há usos afirmativos na fala, mas este exemplo ensina o padrão negativo.|Here it accompanies a negative. Affirmative colloquial uses exist, but this example teaches the negative pattern.
hardly|ほとんど|ほとんど|quase / quase nada|almost / hardly|ほとんどテレビを見ません。|ほとんどてれびをみません。|Quase não vejo televisão.|I hardly watch television.|Com negativa significa quase não. Com uma afirmação pode indicar quase tudo ou quase completo.|With a negative it means hardly. With an affirmative it can mean almost all or almost complete.
usually|たいてい|たいてい|geralmente|usually|たいてい家で食べます。|たいていいえでたべます。|Geralmente como em casa.|I usually eat at home.
normally|普段|ふだん|normalmente / no dia a dia|normally / in daily life|普段コーヒーを飲みます。|ふだんこーひーをのみます。|Normalmente bebo café.|I normally drink coffee.|Aqui funciona como expressão de frequência; 普段 também tem uso nominal.|Here it works as a frequency expression; 普段 also has a noun use.
constantly|常に|つねに|constantemente / sempre|constantly / always|常に安全を確認します。|つねにあんぜんをかくにんします。|Sempre verifico a segurança.|I always check safety.
all-the-time|しょっちゅう|しょっちゅう|toda hora / frequentemente|all the time / very often|しょっちゅう鍵を探しています。|しょっちゅうかぎをさがしています。|Estou toda hora procurando a chave.|I am looking for my key all the time.|Expressão comum na conversa informal.|Common in informal conversation.
again-anew|再び|ふたたび|novamente|again / once again|再び日本に来ました。|ふたたびにほんにきました。|Vim novamente ao Japão.|I came to Japan again.
again|また|また|outra vez / novamente|again|また会いましょう。|またあいましょう。|Vamos nos encontrar outra vez.|Let us meet again.
already|もう|もう|já / mais, conforme a frase|already / more, depending on the sentence|もう食べました。|もうたべました。|Já comi.|I have already eaten.|もう食べました = já comi. もう少し = um pouco mais. Aprenda com o restante da frase.|もう食べました means already ate. もう少し means a little more. Learn it with the rest of the sentence.
still|まだ|まだ|ainda|still / yet|まだ終わっていません。|まだおわっていません。|Ainda não terminou.|It has not finished yet.|Ainda não se expressa aqui com まだ e uma forma negativa.|Not yet is expressed here with まだ and a negative form.
immediately|すぐ|すぐ|imediatamente / logo|immediately / soon|すぐ帰ります。|すぐかえります。|Vou voltar para casa logo.|I will go home soon.
shortly|まもなく|まもなく|dentro de pouco tempo|shortly / soon|まもなく電車が来ます。|まもなくでんしゃがきます。|O trem chegará em breve.|The train will arrive shortly.
about-time|そろそろ|そろそろ|já está na hora / em breve|about time / soon|そろそろ帰りましょう。|そろそろかえりましょう。|Já está na hora de voltarmos.|It is about time we went home.
eventually|やがて|やがて|com o tempo / em breve|eventually / before long|やがて春が来ます。|やがてはるがきます。|Logo chegará a primavera.|Spring will come before long.
one-day|いずれ|いずれ|algum dia / mais cedo ou mais tarde|someday / sooner or later|いずれ日本に住みたいです。|いずれにほんにすみたいです。|Algum dia quero morar no Japão.|I want to live in Japan someday.
right-away|早速|さっそく|sem demora / logo de início|right away / without delay|早速勉強を始めます。|さっそくべんきょうをはじめます。|Vou começar a estudar sem demora.|I will start studying right away.
long-since|とっくに|とっくに|já faz tempo|long ago / long since|とっくに終わりました。|とっくにおわりました。|Terminou há muito tempo.|It finished long ago.
already-formal|すでに|すでに|já, tom mais formal|already, more formal|すでに予約しました。|すでによやくしました。|Já fiz a reserva.|I have already made a reservation.
beforehand|あらかじめ|あらかじめ|antecipadamente|in advance|あらかじめ時間を確認します。|あらかじめじかんをかくにんします。|Confiro o horário antecipadamente.|I check the time in advance.
in-advance|前もって|まえもって|com antecedência|beforehand|前もって切符を買います。|まえもってきっぷをかいます。|Compro a passagem com antecedência.|I buy the ticket beforehand.
first|まず|まず|primeiro / para começar|first / to begin with|まず名前を書いてください。|まずなまえをかいてください。|Primeiro, escreva seu nome.|First, please write your name.
finally|ついに|ついに|finalmente|finally|ついに夢がかないました。|ついにゆめがかないました。|Finalmente meu sonho se realizou.|My dream finally came true.
in-the-end|とうとう|とうとう|por fim / finalmente|finally / in the end|とうとう雨が降り始めました。|とうとうあめがふりはじめました。|Por fim, começou a chover.|It finally started raining.
at-last|ようやく|ようやく|finalmente, após demora|at last, after a wait|ようやく駅に着きました。|ようやくえきにつきました。|Finalmente cheguei à estação.|I arrived at the station at last.
finally-managed|やっと|やっと|finalmente / com esforço|finally / with effort|やっと宿題が終わりました。|やっとしゅくだいがおわりました。|Finalmente terminei a lição de casa.|I finally finished my homework.
throughout|ずっと|ずっと|o tempo todo / muito mais|all along / much more|ずっとここで待っていました。|ずっとここでまっていました。|Fiquei esperando aqui o tempo todo.|I was waiting here all along.|Com uma duração, pode indicar continuidade. Em comparações, pode significar muito mais.|With a duration it can indicate continuity. In comparisons it can mean much more.
for-a-while|しばらく|しばらく|por algum tempo|for a while|しばらく休みます。|しばらくやすみます。|Vou descansar por algum tempo.|I will rest for a while.
gradually|だんだん|だんだん|aos poucos|gradually|だんだん寒くなります。|だんだんさむくなります。|Vai ficando frio aos poucos.|It gradually gets colder.
steadily|どんどん|どんどん|cada vez mais / em ritmo rápido|steadily / rapidly|日本語がどんどん上手になります。|にほんごがどんどんじょうずになります。|O japonês vai melhorando cada vez mais.|The Japanese keeps getting better.
gradually-formal|徐々に|じょじょに|gradualmente|gradually|徐々に慣れてきました。|じょじょになれてきました。|Fui me acostumando gradualmente.|I have gradually become accustomed to it.
increasingly|ますます|ますます|cada vez mais|increasingly / more and more|ますます日本語が好きになります。|ますますにほんごがすきになります。|Gosto cada vez mais de japonês.|I like Japanese more and more.
one-after-another|次々に|つぎつぎに|um após o outro|one after another|お客さんが次々に来ます。|おきゃくさんがつぎつぎにきます。|Os clientes chegam um após o outro.|Customers come one after another.
slowly|ゆっくり|ゆっくり|devagar / com calma|slowly / at leisure|ゆっくり話してください。|ゆっくりはなしてください。|Fale devagar, por favor.|Please speak slowly.
leisurely|のんびり|のんびり|tranquilamente / sem pressa|leisurely / without hurry|家でのんびり過ごします。|いえでのんびりすごします。|Passo o tempo em casa sem pressa.|I spend time relaxing at home.
suddenly|突然|とつぜん|de repente|suddenly|突然雨が降りました。|とつぜんあめがふりました。|De repente começou a chover.|It suddenly rained.
abruptly|いきなり|いきなり|de repente / sem aviso|abruptly / without warning|いきなりドアが開きました。|いきなりどあがあきました。|A porta abriu de repente.|The door suddenly opened.
properly|ちゃんと|ちゃんと|direitinho / adequadamente|properly|ちゃんと朝ご飯を食べます。|ちゃんとあさごはんをたべます。|Tomo o café da manhã direitinho.|I make sure to eat breakfast properly.
neatly|きちんと|きちんと|corretamente / de forma organizada|properly / neatly|靴をきちんと並べます。|くつをきちんとならべます。|Organizo os sapatos direitinho.|I arrange the shoes neatly.
firmly|しっかり|しっかり|firmemente / com atenção|firmly / thoroughly|しっかり覚えます。|しっかりおぼえます。|Vou memorizar bem.|I will learn it thoroughly.
clearly|はっきり|はっきり|claramente|clearly|はっきり話してください。|はっきりはなしてください。|Fale claramente, por favor.|Please speak clearly.
gently|そっと|そっと|delicadamente / sem fazer barulho|gently / quietly|ドアをそっと閉めます。|どあをそっとしめます。|Fecho a porta sem fazer barulho.|I close the door quietly.
secretly|こっそり|こっそり|escondido / secretamente|secretly|こっそりプレゼントを用意します。|こっそりぷれぜんとをよういします。|Preparo um presente em segredo.|I prepare a gift secretly.
motionlessly|じっと|じっと|sem se mover / fixamente|still / intently|猫がじっと見ています。|ねこがじっとみています。|O gato está olhando fixamente.|The cat is staring intently.
absentmindedly|ぼんやり|ぼんやり|distraidamente / vagamente|absentmindedly / vaguely|ぼんやり空を見ています。|ぼんやりそらをみています。|Estou olhando o céu distraidamente.|I am gazing at the sky absentmindedly.
carelessly|うっかり|うっかり|por descuido|carelessly / inadvertently|うっかり鍵を忘れました。|うっかりかぎをわすれました。|Esqueci a chave por descuido.|I carelessly forgot my key.
unintentionally|つい|つい|sem querer / sem resistir|unintentionally / despite oneself|つい食べすぎました。|ついたべすぎました。|Acabei comendo demais sem resistir.|I could not help eating too much.|Este uso descreve uma ação feita sem pensar ou sem conseguir resistir; つい também aparece em expressões de tempo recente.|This use describes an unthinking or irresistible action; つい also appears in expressions of recent time.
deliberately|わざと|わざと|de propósito|deliberately|わざと遅く歩きました。|わざとおそくあるきました。|Andei devagar de propósito.|I deliberately walked slowly.
go-out-of-way|わざわざ|わざわざ|fazendo questão / dando-se ao trabalho|specially / going out of one's way|わざわざ来てくれてありがとう。|わざわざきてくれてありがとう。|Obrigado por ter se dado ao trabalho de vir.|Thank you for going out of your way to come.
by-chance|たまたま|たまたま|por acaso|by chance|たまたま友達に会いました。|たまたまともだちにあいました。|Encontrei um amigo por acaso.|I met a friend by chance.
coincidentally|偶然|ぐうぜん|por coincidência|coincidentally|偶然同じ電車に乗りました。|ぐうぜんおなじでんしゃにのりました。|Por coincidência, pegamos o mesmo trem.|We happened to take the same train.
exactly|ちょうど|ちょうど|exatamente / bem na hora|exactly / just|ちょうど三時です。|ちょうどさんじです。|São exatamente três horas.|It is exactly three o'clock.
perfectly|ぴったり|ぴったり|perfeitamente / na medida|exactly / perfectly|この靴はぴったり合います。|このくつはぴったりあいます。|Estes sapatos servem perfeitamente.|These shoes fit perfectly.
completely|すっかり|すっかり|completamente|completely|すっかり忘れました。|すっかりわすれました。|Esqueci completamente.|I completely forgot.
not-a-bit|さっぱり|さっぱり|nada, com negativa / de modo refrescante|not at all, with a negative / refreshingly|さっぱり分かりません。|さっぱりわかりません。|Não entendo nada.|I do not understand at all.|Aqui, さっぱり〜ません significa não entender nada. Em outro contexto pode transmitir leveza ou frescor.|Here さっぱり〜ません means not understanding at all. In another context it can convey freshness or lightness.
soundly|ぐっすり|ぐっすり|profundamente, ao dormir|soundly, when sleeping|ぐっすり眠りました。|ぐっすりねむりました。|Dormi profundamente.|I slept soundly.
not-easily|なかなか|なかなか|não facilmente / bastante|not easily / quite|なかなか眠れません。|なかなかねむれません。|Não consigo pegar no sono facilmente.|I cannot get to sleep easily.|Com negativa indica dificuldade ou demora. Com avaliação afirmativa, pode significar bastante ou melhor do que se esperava.|With a negative it indicates difficulty or delay. With a positive evaluation it can mean quite or better than expected.
thoroughly|じっくり|じっくり|com calma e atenção|carefully / without rushing|じっくり考えます。|じっくりかんがえます。|Vou pensar com calma e atenção.|I will think it through carefully.
relaxedly|ゆったり|ゆったり|de maneira relaxada / folgada|in a relaxed or spacious way|ゆったり座ります。|ゆったりすわります。|Sento-me de maneira relaxada.|I sit in a relaxed way.
promptly|さっさと|さっさと|logo / sem enrolar|quickly / without delay|さっさと宿題を終えます。|さっさとしゅくだいをおえます。|Termino logo a lição de casa.|I finish my homework promptly.|Num pedido a outra pessoa, pode soar impaciente.|In a request to someone else, it can sound impatient.
fluently|すらすら|すらすら|com fluidez / sem hesitar|smoothly / fluently|ひらがなをすらすら読みます。|ひらがなをすらすらよみます。|Leio hiragana sem hesitar.|I read hiragana smoothly.
briskly|すたすた|すたすた|a passos rápidos|briskly, when walking|すたすた歩きます。|すたすたあるきます。|Ando a passos rápidos.|I walk briskly.
aimlessly|ぶらぶら|ぶらぶら|sem rumo / passeando|aimlessly / strolling|町をぶらぶら歩きます。|まちをぶらぶらあるきます。|Passeio sem rumo pela cidade.|I stroll around town.
sparkling|きらきら|きらきら|com brilho cintilante|sparkling / glittering|星がきらきら光っています。|ほしがきらきらひかっています。|As estrelas estão cintilando.|The stars are twinkling.
pouring|ざあざあ|ざあざあ|fortemente, sobre chuva|heavily, of rain|雨がざあざあ降っています。|あめがざあざあふっています。|Está chovendo forte.|It is pouring with rain.
drizzling|しとしと|しとしと|suavemente, sobre chuva|gently, of rain|雨がしとしと降っています。|あめがしとしとふっています。|Está caindo uma chuva fina.|It is raining gently.
diligently|こつこつ|こつこつ|com esforço constante|steadily / diligently|こつこつ日本語を勉強します。|こつこつにほんごをべんきょうします。|Estudo japonês com esforço constante.|I study Japanese steadily.
round-and-round|ぐるぐる|ぐるぐる|em voltas|round and round|犬がぐるぐる回っています。|いぬがぐるぐるまわっています。|O cachorro está dando voltas.|The dog is going round and round.
very|とても|とても|muito, intensidade|very, degree|この本はとても面白いです。|このほんはとてもおもしろいです。|Este livro é muito interessante.|This book is very interesting.|Intensifica uma qualidade. Não substitui sempre たくさん, que pode indicar quantidade.|It intensifies a quality. It does not always replace たくさん, which can indicate quantity.
extremely|たいへん|たいへん|muito / extremamente|very / extremely|たいへん助かりました。|たいへんたすかりました。|Isso me ajudou muito.|That helped me a great deal.|Aqui é um advérbio de intensidade; 大変 também pode funcionar como adjetivo な.|Here it is an adverb of degree; 大変 can also function as a な adjective.
quite|かなり|かなり|bastante / consideravelmente|quite / considerably|かなり寒いです。|かなりさむいです。|Está bastante frio.|It is quite cold.
remarkably|ずいぶん|ずいぶん|bastante, com surpresa|quite a lot, with surprise|ずいぶん遠いですね。|ずいぶんとおいですね。|É bem longe, não é?|It is quite far, isn't it?
more|もっと|もっと|mais|more|もっとゆっくり話してください。|もっとゆっくりはなしてください。|Fale mais devagar, por favor.|Please speak more slowly.
most|最も|もっとも|mais, grau máximo|most|これが最も大切です。|これがもっともたいせつです。|Isto é o mais importante.|This is the most important.
a-little|少し|すこし|um pouco|a little|少し休みます。|すこしやすみます。|Vou descansar um pouco.|I will rest a little.
a-bit|ちょっと|ちょっと|um pouco / um instante|a little / a moment|ちょっと待ってください。|ちょっとまってください。|Espere um instante, por favor.|Please wait a moment.|Também pode suavizar um pedido ou sinalizar hesitação, conforme a situação.|It can also soften a request or signal hesitation, depending on the situation.
a-lot|たくさん|たくさん|muito / em grande quantidade|a lot|水をたくさん飲みます。|みずをたくさんのみます。|Bebo bastante água.|I drink a lot of water.
lots|いっぱい|いっぱい|muito / até encher|a lot / to capacity|いっぱい食べました。|いっぱいたべました。|Comi bastante.|I ate a lot.|Expressão comum na fala. 一杯 também pode ser uma xícara ou um copo em outro contexto.|Common in speech. 一杯 can also mean one cup or glass in another context.
plenty|たっぷり|たっぷり|bastante / generosamente|plenty / generously|たっぷり休みます。|たっぷりやすみます。|Vou descansar bastante.|I will get plenty of rest.
sufficiently|十分|じゅうぶん|suficientemente|sufficiently / enough|十分休んでください。|じゅうぶんやすんでください。|Descanse o suficiente, por favor.|Please get enough rest.|Aqui modifica 休んで. 十分 também é usado como adjetivo な.|Here it modifies 休んで. 十分 is also used as a な adjective.
considerably|だいぶ|だいぶ|bastante / consideravelmente|considerably / quite a lot|だいぶ暖かくなりました。|だいぶあたたかくなりました。|Ficou bem mais quente.|It has become considerably warmer.
never|決して|けっして|nunca / de modo algum, com negativa|never / by no means, with a negative|決して忘れません。|けっしてわすれません。|Não esquecerei de modo algum.|I will never forget.|Use com negativa neste padrão: 決して〜ません.|Use it with a negative in this pattern: 決して〜ません.
almost|ほぼ|ほぼ|quase / aproximadamente|almost / approximately|ほぼ終わりました。|ほぼおわりました。|Está quase terminado.|It is almost finished.
approximately|およそ|およそ|aproximadamente|approximately|およそ一時間かかります。|およそいちじかんかかります。|Leva aproximadamente uma hora.|It takes approximately one hour.
roughly|だいたい|だいたい|mais ou menos / em geral|roughly / generally|だいたい分かりました。|だいたいわかりました。|Entendi mais ou menos.|I understood the general idea.
probably|たぶん|たぶん|provavelmente|probably|たぶん雨が降るでしょう。|たぶんあめがふるでしょう。|Provavelmente vai chover.|It will probably rain.|Indica uma suposição; não uma certeza. でしょう também expressa estimativa neste exemplo.|It signals a guess, not certainty. でしょう also expresses an estimate in this example.
surely|きっと|きっと|certamente, como expectativa|surely / probably, as an expectation|きっとうまくいきます。|きっとうまくいきます。|Acredito que vai dar certo.|I am sure it will go well.|Mostra uma expectativa forte do falante; não comprova o resultado.|It expresses the speaker's strong expectation; it does not prove the outcome.
presumably|おそらく|おそらく|provavelmente / presumivelmente|probably / presumably|おそらく明日は雨でしょう。|おそらくあしたはあめでしょう。|Provavelmente amanhã vai chover.|It will probably rain tomorrow.
perhaps|もしかすると|もしかすると|talvez / pode ser que|perhaps / possibly|もしかすると道を間違えたかもしれません。|もしかするとみちをまちがえたかもしれません。|Talvez eu tenha errado o caminho.|Perhaps I took the wrong road.|Expressão adverbial de possibilidade, aqui junto de かもしれません.|An adverbial expression of possibility, here paired with かもしれません.
without-fail|必ず|かならず|sem falta / certamente|without fail / invariably|必ず連絡します。|かならずれんらくします。|Entrarei em contato sem falta.|I will contact you without fail.
by-all-means|ぜひ|ぜひ|por favor, com ênfase / com certeza aceito|by all means / gladly|ぜひ遊びに来てください。|ぜひあそびにきてください。|Venha nos visitar, por favor.|Please do come and visit.|Enfatiza um desejo, pedido ou aceitação. Não funciona como certeza sobre qualquer acontecimento.|It emphasizes a wish, request or acceptance. It is not a general prediction of certainty.
why|どうして|どうして|por quê / como|why / how|どうして日本語を勉強しますか。|どうしてにほんごをべんきょうしますか。|Por que você estuda japonês?|Why do you study Japanese?
how|どう|どう|como / de que maneira|how / in what way|どう書きますか。|どうかきますか。|Como se escreve?|How do you write it?
`.trim().split("\n").map(line=>{
  const [id,jp,kana,pt,en,exampleJp,exampleKana,examplePt,exampleEn,notePt,noteEn]=line.split("|");
  return {id,category:"adverb",group:"adverb",jp,kana,pt,en,icon:"",example:{jp:exampleJp,kana:exampleKana,pt:examplePt,en:exampleEn},notePt,noteEn};
});
