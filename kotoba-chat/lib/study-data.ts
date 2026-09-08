// Original vocabulary selection for Ojiisan Chat. Images are mnemonic cues,
// not etymologies or one-to-one translations of kanji.
export type Category = "verb" | "noun" | "adjective";
export type Group = "godan" | "ichidan" | "suru" | "kuru" | "i" | "na" | "noun";
export type Entry = { id:string; category:Category; jp:string; kana:string; pt:string; en:string; icon:string; group:Group };
function rows(category:Category,source:string):Entry[] {
  return source.trim().split("\n").map(line=>{
    const [id,jp,kana,pt,en,icon,group]=line.split("|");
    return {id,category,jp,kana,pt,en,icon,group:(group||"noun") as Group};
  });
}
export const verbs=rows("verb",`
do|する|する|fazer|do|🛠️|suru
go|行く|いく|ir|go|🚶|godan
come|来る|くる|vir|come|🙋|kuru
return|帰る|かえる|voltar para casa|return home|🏠|godan
eat|食べる|たべる|comer|eat|🍽️|ichidan
drink|飲む|のむ|beber|drink|🥤|godan
see|見る|みる|ver / olhar|see / look|👀|ichidan
hear|聞く|きく|ouvir / perguntar|hear / ask|👂|godan
speak|話す|はなす|falar / conversar|speak / talk|💬|godan
read|読む|よむ|ler|read|📖|godan
write|書く|かく|escrever|write|✍️|godan
sleep|寝る|ねる|dormir / deitar|sleep / go to bed|🛌|ichidan
wake|起きる|おきる|acordar / levantar|wake up / get up|🌅|ichidan
rest|休む|やすむ|descansar / faltar|rest / take time off|😌|godan
work|働く|はたらく|trabalhar|work|👷|godan
study|勉強する|べんきょうする|estudar|study|📚|suru
learn|習う|ならう|aprender com alguém|learn from someone|🧑‍🏫|godan
teach|教える|おしえる|ensinar / informar|teach / tell|👩‍🏫|ichidan
remember|覚える|おぼえる|memorizar / aprender|memorize / learn|🧠|ichidan
forget|忘れる|わすれる|esquecer|forget|💭|ichidan
understand|分かる|わかる|entender|understand|💡|godan
think|考える|かんがえる|pensar / considerar|think / consider|🤔|ichidan
know|知る|しる|ficar sabendo|find out|💡|godan
say|言う|いう|dizer|say|🗣️|godan
ask|質問する|しつもんする|fazer uma pergunta|ask a question|❓|suru
answer|答える|こたえる|responder|answer|🙋|ichidan
meet|会う|あう|encontrar uma pessoa|meet someone|🤝|godan
wait|待つ|まつ|esperar|wait|⏳|godan
buy|買う|かう|comprar|buy|🛍️|godan
sell|売る|うる|vender|sell|🏷️|godan
pay|払う|はらう|pagar|pay|💳|godan
use|使う|つかう|usar|use|🧰|godan
make|作る|つくる|fazer / produzir|make / create|🧑‍🍳|godan
cook|料理する|りょうりする|cozinhar|cook|🍳|suru
wash|洗う|あらう|lavar|wash|🧼|godan
clean|掃除する|そうじする|limpar|clean|🧹|suru
open|開ける|あける|abrir algo|open something|🚪|ichidan
close|閉める|しめる|fechar algo|close something|🚪|ichidan
enter|入る|はいる|entrar|enter|🚪|godan
leave|出る|でる|sair|leave / exit|🚶|ichidan
sit|座る|すわる|sentar|sit|🪑|godan
stand|立つ|たつ|ficar de pé|stand|🧍|godan
walk|歩く|あるく|andar / caminhar|walk|🚶|godan
run|走る|はしる|correr|run|🏃|godan
swim|泳ぐ|およぐ|nadar|swim|🏊|godan
fly|飛ぶ|とぶ|voar / saltar|fly / jump|🕊️|godan
ride|乗る|のる|embarcar / andar em|get on / ride|🚆|godan
get-off|降りる|おりる|descer de um veículo|get off a vehicle|🚏|ichidan
arrive|着く|つく|chegar|arrive|📍|godan
live|住む|すむ|morar|live / reside|🏡|godan
exist-object|ある|ある|existir: coisas|exist: things|📦|godan
exist-living|いる|いる|existir: seres animados|exist: animate beings|🐈|ichidan
have|持つ|もつ|segurar / ter consigo|hold / carry|🤲|godan
take|取る|とる|pegar / retirar|take|🫴|godan
put|置く|おく|colocar / pôr|put / place|📦|godan
insert|入れる|いれる|colocar dentro|put in|📥|ichidan
take-out|出す|だす|tirar / enviar|take out / send|📤|godan
give|あげる|あげる|dar a outra pessoa|give to someone|🎁|ichidan
receive|もらう|もらう|receber|receive|🎁|godan
give-me|くれる|くれる|dar a mim / aos meus|give to me / my group|🎁|ichidan
lend|貸す|かす|emprestar a alguém|lend|🤝|godan
borrow|借りる|かりる|pegar emprestado|borrow|📖|ichidan
return-object|返す|かえす|devolver|return something|↩️|godan
send|送る|おくる|enviar / acompanhar|send / see off|📮|godan
phone|電話する|でんわする|telefonar|phone|📞|suru
play|遊ぶ|あそぶ|brincar / divertir-se|play / hang out|🪁|godan
sing|歌う|うたう|cantar|sing|🎤|godan
dance|踊る|おどる|dançar|dance|💃|godan
laugh|笑う|わらう|rir / sorrir|laugh / smile|😄|godan
cry|泣く|なく|chorar|cry|😢|godan
get-angry|怒る|おこる|ficar bravo|get angry|😠|godan
enjoy|楽しむ|たのしむ|aproveitar / desfrutar|enjoy|🎉|godan
help|手伝う|てつだう|ajudar numa tarefa|help with a task|🤝|godan
choose|選ぶ|えらぶ|escolher|choose|☑️|godan
decide|決める|きめる|decidir|decide|✅|ichidan
begin|始める|はじめる|começar algo|start something|▶️|ichidan
finish|終わる|おわる|terminar / acabar|finish / end|🏁|godan
continue|続ける|つづける|continuar algo|continue something|🔁|ichidan
stop|止める|とめる|parar algo|stop something|🛑|ichidan
change|変える|かえる|mudar algo|change something|🔄|ichidan
become|なる|なる|tornar-se / ficar|become|🌱|godan
cut|切る|きる|cortar|cut|✂️|godan
wear|着る|きる|vestir: parte superior|wear: upper body|👕|ichidan
wear-shoes|履く|はく|calçar / vestir: parte inferior|wear: footwear / lower body|👟|godan
remove-clothes|脱ぐ|ぬぐ|tirar roupa / calçado|take off clothing|👕|godan
turn-on|つける|つける|ligar / acender|turn on|💡|ichidan
turn-off|消す|けす|apagar / desligar|erase / turn off|🔌|godan
search|探す|さがす|procurar|look for|🔎|godan
find|見つける|みつける|encontrar algo|find something|🔍|ichidan
lose|なくす|なくす|perder algo|lose something|🔑|godan
photograph|撮る|とる|fotografar / filmar|take a photo / film|📷|godan
travel|旅行する|りょこうする|viajar|travel|🧳|suru
drive|運転する|うんてんする|dirigir|drive|🚗|suru
exercise|運動する|うんどうする|fazer exercício|exercise|🏋️|suru
reserve|予約する|よやくする|reservar|book / reserve|🗓️|suru
explain|説明する|せつめいする|explicar|explain|🧑‍🏫|suru
practice|練習する|れんしゅうする|praticar|practice|🎯|suru
marry|結婚する|けっこんする|casar-se|get married|💍|suru
be-tired|疲れる|つかれる|cansar-se|get tired|😮‍💨|ichidan
need|要る|いる|precisar|need|📋|godan
`);
export const nouns=rows("noun",`
tree|木|き|árvore|tree|🌳
flower|花|はな|flor|flower|🌸
mountain|山|やま|montanha|mountain|⛰️
river|川|かわ|rio|river|🏞️
sea|海|うみ|mar|sea|🌊
sky|空|そら|céu|sky|🌌
sun|太陽|たいよう|sol|sun|☀️
moon|月|つき|lua|moon|🌙
star|星|ほし|estrela|star|⭐
rain|雨|あめ|chuva|rain|🌧️
snow|雪|ゆき|neve|snow|❄️
wind|風|かぜ|vento|wind|🍃
water|水|みず|água|water|💧
fire|火|ひ|fogo|fire|🔥
stone|石|いし|pedra|stone|🪨
cat|猫|ねこ|gato|cat|🐈
dog|犬|いぬ|cachorro|dog|🐕
bird|鳥|とり|pássaro|bird|🐦
fish|魚|さかな|peixe|fish|🐟
horse|馬|うま|cavalo|horse|🐎
person|人|ひと|pessoa|person|🧑
child|子ども|こども|criança|child|🧒
friend|友達|ともだち|amigo|friend|🧑‍🤝‍🧑
family|家族|かぞく|família|family|👪
mother|母|はは|minha mãe|my mother|👩
father|父|ちち|meu pai|my father|👨
grandfather|おじいさん|おじいさん|avô / senhor idoso|grandfather / elderly man|👴
grandmother|おばあさん|おばあさん|avó / senhora idosa|grandmother / elderly woman|👵
teacher|先生|せんせい|professor|teacher|🧑‍🏫
student|学生|がくせい|estudante|student|🧑‍🎓
house|家|いえ|casa|house|🏠
room|部屋|へや|quarto / cômodo|room|🛋️
door|ドア|ドア|porta|door|🚪
window|窓|まど|janela|window|🪟
desk|机|つくえ|mesa de trabalho|desk|🖥️
chair|椅子|いす|cadeira|chair|🪑
bed|ベッド|ベッド|cama|bed|🛏️
school|学校|がっこう|escola|school|🏫
station|駅|えき|estação|station|🚉
hospital|病院|びょういん|hospital|hospital|🏥
shop|店|みせ|loja|shop|🏪
restaurant|レストラン|レストラン|restaurante|restaurant|🍽️
park|公園|こうえん|parque|park|🏞️
bank|銀行|ぎんこう|banco|bank|🏦
post-office|郵便局|ゆうびんきょく|correio / agência postal|post office|🏣
company|会社|かいしゃ|empresa|company|🏢
library|図書館|としょかん|biblioteca|library|📚
toilet|トイレ|トイレ|banheiro|toilet|🚻
road|道|みち|caminho / rua|road / path|🛣️
town|町|まち|cidade / bairro|town / neighborhood|🏘️
japan|日本|にほん|Japão|Japan|🇯🇵
brazil|ブラジル|ブラジル|Brasil|Brazil|🇧🇷
train|電車|でんしゃ|trem elétrico|train|🚆
car|車|くるま|carro|car|🚗
bicycle|自転車|じてんしゃ|bicicleta|bicycle|🚲
bus|バス|バス|ônibus|bus|🚌
airplane|飛行機|ひこうき|avião|airplane|✈️
ticket|切符|きっぷ|bilhete de transporte|ticket|🎫
bag|かばん|かばん|bolsa / mochila|bag|🎒
key|鍵|かぎ|chave|key|🔑
book|本|ほん|livro|book|📖
notebook|ノート|ノート|caderno|notebook|📓
pencil|鉛筆|えんぴつ|lápis|pencil|✏️
paper|紙|かみ|papel|paper|📄
phone|電話|でんわ|telefone / telefonema|phone / call|📞
computer|パソコン|パソコン|computador|computer|💻
clock|時計|とけい|relógio|clock / watch|🕰️
photo|写真|しゃしん|fotografia|photo|📷
money|お金|おかね|dinheiro|money|💴
name|名前|なまえ|nome|name|🏷️
rice|ご飯|ごはん|arroz cozido / refeição|cooked rice / meal|🍚
bread|パン|パン|pão|bread|🍞
egg|卵|たまご|ovo|egg|🥚
meat|肉|にく|carne|meat|🥩
vegetable|野菜|やさい|verdura / legume|vegetable|🥬
fruit|果物|くだもの|fruta|fruit|🍇
apple|りんご|りんご|maçã|apple|🍎
banana|バナナ|バナナ|banana|banana|🍌
tea|お茶|おちゃ|chá|tea|🍵
coffee|コーヒー|コーヒー|café|coffee|☕
milk|牛乳|ぎゅうにゅう|leite de vaca|milk|🥛
juice|ジュース|ジュース|suco|juice|🧃
salt|塩|しお|sal|salt|🧂
sugar|砂糖|さとう|açúcar|sugar|🍬
breakfast|朝ご飯|あさごはん|café da manhã|breakfast|🍳
today|今日|きょう|hoje|today|📅
tomorrow|明日|あした|amanhã|tomorrow|🌅
yesterday|昨日|きのう|ontem|yesterday|📆
morning|朝|あさ|manhã|morning|🌅
night|夜|よる|noite|night|🌃
time|時間|じかん|tempo / horas|time / hours|⏰
day-off|休み|やすみ|folga / descanso|day off / break|🏖️
job|仕事|しごと|trabalho|work / job|💼
weather|天気|てんき|tempo / clima do dia|weather|🌤️
hand|手|て|mão|hand|✋
eye|目|め|olho|eye|👁️
ear|耳|みみ|orelha / ouvido|ear|👂
mouth|口|くち|boca|mouth|👄
head|頭|あたま|cabeça|head|🧑
foot|足|あし|pé / perna|foot / leg|🦶
`);
export const adjectives=rows("adjective",`
big|大きい|おおきい|grande|big|🐘|i
small|小さい|ちいさい|pequeno|small|🐜|i
new|新しい|あたらしい|novo|new|✨|i
old|古い|ふるい|antigo: coisas|old: things|🏚️|i
good|いい|いい|bom|good|👍|i
bad|悪い|わるい|ruim|bad|👎|i
hot-weather|暑い|あつい|quente: clima|hot: weather|🥵|i
hot-touch|熱い|あつい|quente: ao toque|hot: to touch|♨️|i
cold-weather|寒い|さむい|frio: clima|cold: weather|🥶|i
cold-touch|冷たい|つめたい|frio: ao toque|cold: to touch|🧊|i
warm|暖かい|あたたかい|quente agradável: clima|warm: weather|🌤️|i
cool-weather|涼しい|すずしい|fresco: clima|cool: weather|🍃|i
expensive|高い|たかい|caro / alto|expensive / high|💴|i
cheap|安い|やすい|barato|cheap|🏷️|i
low|低い|ひくい|baixo: altura|low|📉|i
long|長い|ながい|comprido / longo|long|📏|i
short|短い|みじかい|curto|short|✂️|i
wide|広い|ひろい|amplo / espaçoso|wide / spacious|🏞️|i
narrow|狭い|せまい|estreito / apertado|narrow / cramped|🚪|i
near|近い|ちかい|perto|near|📍|i
far|遠い|とおい|longe|far|🔭|i
fast|速い|はやい|rápido|fast|🏎️|i
early|早い|はやい|cedo|early|🌅|i
slow|遅い|おそい|lento / tarde|slow / late|🐢|i
heavy|重い|おもい|pesado|heavy|🏋️|i
light-weight|軽い|かるい|leve|lightweight|🪶|i
strong|強い|つよい|forte|strong|💪|i
weak|弱い|よわい|fraco|weak|🪫|i
difficult|難しい|むずかしい|difícil|difficult|🧩|i
easy|易しい|やさしい|fácil|easy|✅|i
gentle|優しい|やさしい|gentil / carinhoso|gentle / kind|🤗|i
fun|楽しい|たのしい|divertido|fun|🎉|i
interesting|面白い|おもしろい|interessante / engraçado|interesting / funny|😄|i
boring|つまらない|つまらない|chato / sem graça|boring|😑|i
happy|嬉しい|うれしい|contente / feliz|happy / glad|😊|i
sad|悲しい|かなしい|triste|sad|😢|i
lonely|寂しい|さびしい|solitário / com saudade|lonely|🥺|i
scary|怖い|こわい|assustador / com medo|scary / afraid|😨|i
sleepy|眠い|ねむい|com sono|sleepy|😴|i
painful|痛い|いたい|dolorido|painful|🤕|i
busy|忙しい|いそがしい|ocupado|busy|🏃|i
delicious|おいしい|おいしい|delicioso|delicious|😋|i
bad-tasting|まずい|まずい|de gosto ruim|bad-tasting|🤢|i
sweet|甘い|あまい|doce|sweet|🍬|i
spicy|辛い|からい|picante|spicy|🌶️|i
bitter|苦い|にがい|amargo|bitter|☕|i
sour|酸っぱい|すっぱい|azedo|sour|🍋|i
salty|しょっぱい|しょっぱい|salgado|salty|🧂|i
bright|明るい|あかるい|claro / alegre|bright / cheerful|💡|i
dark|暗い|くらい|escuro|dark|🌑|i
red|赤い|あかい|vermelho|red|🔴|i
blue|青い|あおい|azul|blue|🔵|i
white|白い|しろい|branco|white|⚪|i
black|黒い|くろい|preto|black|⚫|i
yellow|黄色い|きいろい|amarelo|yellow|🟡|i
dirty|汚い|きたない|sujo|dirty|🗑️|i
thick|厚い|あつい|espesso|thick|📚|i
thin|薄い|うすい|fino / diluído|thin / weak in concentration|📄|i
hard|硬い|かたい|duro / rígido|hard / rigid|🪨|i
soft|柔らかい|やわらかい|macio / flexível|soft / flexible|🧸|i
quiet|静か|しずか|silencioso / tranquilo|quiet|🤫|na
lively|にぎやか|にぎやか|animado / movimentado|lively|🎊|na
beautiful|きれい|きれい|bonito / limpo|beautiful / clean|✨|na
healthy|元気|げんき|bem / cheio de energia|well / energetic|💪|na
convenient|便利|べんり|conveniente / prático|convenient|📱|na
inconvenient|不便|ふべん|inconveniente|inconvenient|🚧|na
famous|有名|ゆうめい|famoso|famous|🌟|na
kind|親切|しんせつ|prestativo / gentil|helpful / kind|🤝|na
free-time|暇|ひま|livre / sem ocupação|free / unoccupied|🏖️|na
like|好き|すき|de que se gosta|liked / fond of|💚|na
dislike|嫌い|きらい|de que não se gosta|disliked|🙅|na
skilled|上手|じょうず|habilidoso|skillful|🏅|na
unskilled|下手|へた|sem habilidade|unskilled|🙈|na
simple|簡単|かんたん|simples / fácil|simple / easy|👌|na
complex|複雑|ふくざつ|complexo|complex|🕸️|na
important|大切|たいせつ|precioso / importante|precious / important|💎|na
necessary|必要|ひつよう|necessário|necessary|📋|na
safe|安全|あんぜん|seguro|safe|🛡️|na
dangerous|危険|きけん|perigoso|dangerous|⚠️|na
well-loved|大好き|だいすき|de que se gosta muito|very fond of|❤️|na
serious|真面目|まじめ|sério / dedicado|serious / diligent|🧑‍💼|na
polite|丁寧|ていねい|cuidadoso / cortês|careful / polite|🙇|na
rude|失礼|しつれい|rude / indelicado|rude|😒|na
excellent|立派|りっぱ|admirável / excelente|admirable / excellent|🏆|na
splendid|素敵|すてき|encantador / ótimo|lovely / wonderful|💐|na
free|自由|じゆう|livre|free|🕊️|na
in-good-order|丈夫|じょうぶ|resistente / robusto|sturdy / robust|🪵|na
special|特別|とくべつ|especial|special|🎁|na
weird|変|へん|estranho|strange|🤨|na
unfortunate|残念|ざんねん|lamentável / decepcionante|unfortunate / disappointing|😞|na
enough|十分|じゅうぶん|suficiente|enough / sufficient|✅|na
plentiful|豊か|ゆたか|rico / abundante|rich / abundant|🌾|na
calm|穏やか|おだやか|calmo / sereno|calm / gentle|🕊️|na
fresh|新鮮|しんせん|fresco: alimento|fresh: food|🥬|na
comfortable|快適|かいてき|confortável|comfortable|🛋️|na
accurate|正確|せいかく|exato / preciso|accurate|🎯|na
honest|正直|しょうじき|honesto|honest|🤲|na
enthusiastic|熱心|ねっしん|dedicado / entusiasmado|enthusiastic / devoted|🔥|na
sincere|誠実|せいじつ|sincero / íntegro|sincere|🤝|na
peaceful|平和|へいわ|pacífico|peaceful|☮️|na
`);
export const entries:Entry[]=[...verbs,...nouns,...adjectives].map(e=>({...e,id:e.category+":"+e.id}));
export const entryById=Object.fromEntries(entries.map(e=>[e.id,e])) as Record<string,Entry>;
