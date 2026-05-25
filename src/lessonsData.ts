import { Lesson } from './types';

export const lessonsData: Lesson[] = [
  {
    id: 'konbini',
    title: 'Comprando en el Konbini',
    japaneseTitle: 'コンビニで買い物',
    level: 'Básico',
    icon: 'ShoppingBag',
    description: 'Aprende a manejar las preguntas de rutina del cajero de un Konbini (tienda de conveniencia), como si quieres bolsa, calentar la comida o si tienes tarjeta de puntos.',
    objectives: [
      'Aprender a responder sobre bolsas de plástico (fukuro).',
      'Saber cómo pedir que calienten tu comida (atatamete).',
      'Manejar preguntas sobre tarjetas de fidelidad (kado).'
    ],
    vocabulary: [
      { japanese: 'お弁当 (おべんとう)', romaji: 'obentō', meaning: 'bento (caja de comida japonesa preparados)' },
      { japanese: '袋 (ふくろ)', romaji: 'fukuro', meaning: 'bolsa' },
      { japanese: '温めますか (あたためますか)', romaji: 'atatamemasu ka', meaning: '¿lo caliento?' },
      { japanese: '大丈夫です (だいじょうぶです)', romaji: 'daijōbu desu', meaning: 'estoy bien / no hace falta' },
      { japanese: 'お願いします (おねがいします)', romaji: 'onegaishimasu', meaning: 'por favor' },
      { japanese: 'ポイントカード', romaji: 'pointo kādo', meaning: 'tarjeta de puntos' },
      { japanese: '温めてください', romaji: 'atatamete kudasai', meaning: 'caliéntelo, por favor' },
      { japanese: '袋はいりません', romaji: 'fukuro wa irimasen', meaning: 'no necesito bolsa' }
    ],
    dialogue: [
      {
        id: 'k1',
        speaker: 'partner',
        japanese: 'いらっしゃいませ！ポイントカードはお持ちですか？',
        romaji: 'Irasshaimase! Pointo kādo wa omochi desu ka?',
        spanish: '¡Bienvenido! ¿Tiene tarjeta de puntos?'
      },
      {
        id: 'k2',
        speaker: 'user',
        japanese: 'いいえ、持っていません。',
        romaji: 'Iie, motte imasen.',
        spanish: 'No, no la tengo.'
      },
      {
        id: 'k3',
        speaker: 'partner',
        japanese: 'かしこまりました。お弁当は温めますか？',
        romaji: 'Kashikomarimashita. Obentō wa atatamemasu ka?',
        spanish: 'Entendido. ¿Le caliento su bento?'
      },
      {
        id: 'k4',
        speaker: 'user',
        japanese: 'はい、温めてください。',
        romaji: 'Hai, atatamete kudasai.',
        spanish: 'Sí, caliéntelo, por favor.'
      },
      {
        id: 'k5',
        speaker: 'partner',
        japanese: 'レジ袋はご利用になりますか？一枚五円です。',
        romaji: 'Rejibukuro wa goriyō ni narimasu ka? Ichimai go-en desu.',
        spanish: '¿Desea una bolsa de plástico? Cuesta 5 yenes.'
      },
      {
        id: 'k6',
        speaker: 'user',
        japanese: 'いいえ、袋はいりません。このままでいいです。',
        romaji: 'Iie, fukuro wa irimasen. Kono mama de ii desu.',
        spanish: 'No, no necesito bolsa. Así está bien.'
      },
      {
        id: 'k7',
        speaker: 'partner',
        japanese: 'かしこまりました。お会計は七百円になります。',
        romaji: 'Kashikomarimashita. O-kaikei wa nanahyaku-en ni narimasu.',
        spanish: 'Entendido. El total son 700 yenes.'
      }
    ],
    practicePhrases: [
      {
        id: 'kp1',
        japanese: '袋はいりません。',
        romaji: 'Fukuro wa irimasen.',
        spanish: 'No necesito bolsa.',
        context: 'Úsala cuando el cajero te ofrezca una bolsa o te pregunte si quieres una (Fukuro wa hitsuyou desu ka?).'
      },
      {
        id: 'kp2',
        japanese: '温めてください。',
        romaji: 'Atatamete kudasai.',
        spanish: 'Caliéntelo, por favor.',
        context: 'Para pedir que calienten un bento, onigiri o platillo preparado en el horno microondas de la tienda.'
      },
      {
        id: 'kp3',
        japanese: 'このままで大丈夫です。',
        romaji: 'Kono mama de daijōbu desu.',
        spanish: 'Está bien así (sin bolsa/sin envolver).',
        context: 'Forma cortés de decirle al cajero que te llevarás el producto directamente en la mano o en tu propia mochila.'
      },
      {
        id: 'kp4',
        japanese: 'カードで払います。',
        romaji: 'Kādo de haraimasu.',
        spanish: 'Pagaré con tarjeta.',
        context: 'Cuando quieres elegir el método de pago con tarjeta de crédito en lugar de efectivo.'
      }
    ],
    partnerCharacter: 'Cajero del Konbini (店員)',
    partnerImagePrompt: 'A polite young Japanese convenience store cashier in striped uniform smiling behind a counter, welcoming customer',
    systemPrompt: 'Eres el cajero educado de un Konbini (tienda de conveniencia japonesa). El usuario acaba de acercarse a la caja para comprar artículos como un bento, agua o postres. Háblale en japonés cortés de tienda (Keigo/básico de servicio), hazle las preguntas habituales (tarjeta de puntos, bolsa, calentar la comida). Mantén tus respuestas extremadamente cortas (1-2 frases) para que sea interactivo. Responde SOLO en japonés, y al final puedes dar pequeños consejos amigables o entender lo que te conteste el usuario.',
    initialMessage: 'いらっしゃいませ！ポイントカードはお持ちですか？',
    initialMessageRomaji: 'Irasshaimase! Pointo kādo wa omochi desu ka?',
    initialMessageSpanish: '¡Bienvenido! ¿Tiene tarjeta de puntos?'
  },
  {
    id: 'izakaya',
    title: 'Ordenando en un Izakaya',
    japaneseTitle: '居酒屋で注文',
    level: 'Básico',
    icon: 'Utensils',
    description: 'Aprende a pedir cerveza de barril (Nama), preguntar por recomendaciones, pedir platos clásicos como Edamame o Yakitori, y pedir la cuenta.',
    objectives: [
      'Pedir una bebida al sentarse (toriaezu nama).',
      'Ordenar platos señalándolos en el menú.',
      'Pedir la cuenta al final (okaikei) de forma educada.'
    ],
    vocabulary: [
      { japanese: 'とりあえずビール', romaji: 'toriaezu biiru', meaning: 'para empezar, una cerveza' },
      { japanese: '生ビール (なまビール)', romaji: 'nama biiru', meaning: 'cerveza de barril' },
      { japanese: 'メニュー', romaji: 'menyū', meaning: 'menú' },
      { japanese: 'これ', romaji: 'kore', meaning: 'esto' },
      { japanese: 'お会計 (おかいけい)', romaji: 'o-kaikei', meaning: 'la cuenta / el pago' },
      { japanese: 'お勧め (おすすめ)', romaji: 'osusume', meaning: 'recomendación' },
      { japanese: '美味しい (おいしい)', romaji: 'oishii', meaning: 'delicioso' },
      { japanese: '焼き鳥 (やきとり)', romaji: 'yakitori', meaning: 'brochetas de pollo japonesas' }
    ],
    dialogue: [
      {
        id: 'iz1',
        speaker: 'partner',
        japanese: 'いらっしゃいませ！お飲み物は何にしますか？',
        romaji: 'Irasshaimase! O-nomimono wa nan ni shimasu ka?',
        spanish: '¡Bienvenidos! ¿Qué van a tomar?'
      },
      {
        id: 'iz2',
        speaker: 'user',
        japanese: 'とりあえず生ビールを二つお願いします。',
        romaji: 'Toriaezu nama biiru o futatsu onegaishimasu.',
        spanish: 'Para empezar, dos cervezas de barril por favor.'
      },
      {
        id: 'iz3',
        speaker: 'partner',
        japanese: 'はい！生ビール二つですね。お食事のご注文はお決まりですか？',
        romaji: 'Hai! Nama biiru futatsu desu ne. O-shokuji no go-chūmon wa o-kimari desu ka?',
        spanish: '¡Sí! Dos cervezas de barril. ¿Saben ya lo que van a comer?'
      },
      {
        id: 'iz4',
        speaker: 'user',
        japanese: 'おすすめのご飯は何ですか？',
        romaji: 'Osusume no gohan wa nan desu ka?',
        spanish: '¿Cuál es la comida recomendada?'
      },
      {
        id: 'iz5',
        speaker: 'partner',
        japanese: '今日の焼き鳥盛り合わせがとても人気ですよ！',
        romaji: 'Kyō no yakitori moriawase ga totemo ninki desu yo!',
        spanish: '¡El surtido de brochetas de pollo (yakitori) de hoy es muy popular!'
      },
      {
        id: 'iz6',
        speaker: 'user',
        japanese: 'じゃあ、それと枝豆を一つください。',
        romaji: 'Jā, sore to edamame o hitotsu kudasai.',
        spanish: 'Entonces, eso y una porción de edamame, por favor.'
      },
      {
        id: 'iz7',
        speaker: 'partner',
        japanese: 'かしこまりました。少々お待ちください。',
        romaji: 'Kashikomarimashita. Shōshō omachi kudasai.',
        spanish: 'Entendido. Espere un momento, por favor.'
      }
    ],
    practicePhrases: [
      {
        id: 'izp1',
        japanese: 'とりあえず生ビールをお願いします。',
        romaji: 'Toriaezu nama biiru o onegaishimasu.',
        spanish: 'Para empezar, una cerveza de barril por favor.',
        context: 'Frase clásica japonesa indispensable para pedir tu primera cerveza en cuanto te sientas en el Izakaya.'
      },
      {
        id: 'izp2',
        japanese: 'メニューをください。',
        romaji: 'Menyū o kudasai.',
        spanish: 'El menú por favor.',
        context: 'Úsala para pedir la carta en físico al personal si no está en la mesa.'
      },
      {
        id: 'izp3',
        japanese: 'これとお水をお願いします。',
        romaji: 'Kore to omizu o onegaishimasu.',
        spanish: 'Esto y agua, por favor.',
        context: 'Una excelente combinación para ordenar señalando fotos en un menú japonés, además de pedir agua gratis.'
      },
      {
        id: 'izp4',
        japanese: 'お会計をお願いします。',
        romaji: 'O-kaikei o onegaishimasu.',
        spanish: 'La cuenta, por favor.',
        context: 'Pídele esto al camarero levantando ligeramente la mano para pagar.'
      }
    ],
    partnerCharacter: 'Mesero del Izakaya (店員)',
    partnerImagePrompt: 'A friendly Japanese izakaya tavern waiter holding an order pad in a traditional warm wooden pub restaurant setting',
    systemPrompt: 'Eres un camarero energético y cortés en un animado Izakaya (pub japonés). El usuario es un cliente extranjero que quiere pedir bebidas y aperitivos tradicionales. Salúdalo alegremente, contesta sus preguntas sobre el menú y ayúdalo a pedir platos (como edamame, yakitori o karaage) de forma dinámica. Mantén tus frases cortas y con el clásico entusiasmo de los meseros de Izakaya (usando expresiones como "Hai! Gladly!" o "Kashikomarimashita!"). Responde SOLAMENTE en japonés moderno natural.',
    initialMessage: 'いらっしゃいませ！お飲み物は何にしますか？まずはビールでよろしいですか？',
    initialMessageRomaji: 'Irasshaimase! O-nomimono wa nan ni shimasu ka? Mazu wa biiru de yoroshii desu ka?',
    initialMessageSpanish: '¡Bienvenidos! ¿Qué van a tomar? ¿Les traigo cerveza para empezar?'
  },
  {
    id: 'directions',
    title: 'Preguntando Direcciones en Shibuya',
    japaneseTitle: '渋谷での道聞き',
    level: 'Intermedio',
    icon: 'MapPin',
    description: 'Practica interactuar con transeúntes en las concurridas calles de Shibuya para encontrar lugares famosos como la estatua de Hachiko o la entrada del metro.',
    objectives: [
      'Llamar la atención de alguien de forma educada (sumimasen).',
      'Preguntar por la ubicación de un punto de interés.',
      'Entender direcciones básicas (ir recto, girar, cruzar).'
    ],
    vocabulary: [
      { japanese: 'すみません', romaji: 'sumimasen', meaning: 'disculpe / lo siento' },
      { japanese: '駅 (えき)', romaji: 'eki', meaning: 'estación' },
      { japanese: 'ハチ公像 (はちこうぞう)', romaji: 'hachikōzō', meaning: 'estatua de Hachiko' },
      { japanese: '真っ直ぐ (まっすぐ)', romaji: 'massugu', meaning: 'todo recto / de frente' },
      { japanese: '右 (みぎ) / 左 (ひだり)', romaji: 'migi / hidari', meaning: 'derecha / izquierda' },
      { japanese: '曲がる (まがる)', romaji: 'magaru', meaning: 'girar / doblar' },
      { japanese: 'すぐそこ', romaji: 'sugu soko', meaning: 'justo ahí' },
      { japanese: '交差点 (こうさてん)', romaji: 'kōsaten', meaning: 'cruce / intersección' }
    ],
    dialogue: [
      {
        id: 'dir1',
        speaker: 'user',
        japanese: 'あの、すみません。ハチ公口はどこですか？',
        romaji: 'Ano, sumimasen. Hachikō-guchi wa doko desu ka?',
        spanish: 'Disculpe, ¿dónde está la salida de Hachiko?'
      },
      {
        id: 'dir2',
        speaker: 'partner',
        japanese: 'あ、ハチ公口ですね。この道をまっすぐ行くと、大きなスクランブル交差点がありますよ。',
        romaji: 'A, Hachikō-guchi desu ne. Kono michi o massugu iku to, ōkina sukuranburu kōsaten ga arimasu yo.',
        spanish: 'Ah, ¿la salida de Hachiko? Si vas recto por esta calle, te encontrarás con el gran cruce peatonal de Shibuya.'
      },
      {
        id: 'dir3',
        speaker: 'user',
        japanese: 'スクランブル交差点ですね。そこからどう行きますか？',
        romaji: 'Sukuranburu kōsaten desu ne. Soko kara dō ikimasu ka?',
        spanish: 'El cruce peatonal, de acuerdo. ¿Cómo voy desde allí?'
      },
      {
        id: 'dir4',
        speaker: 'partner',
        japanese: '交差点を渡って、左に曲がるとすぐ駅の入り口とハチ公像が見えますよ。',
        romaji: 'Kōsaten o watatte, hidari ni magaru to sugu eki no iriguchi to Hachikō-zō ga miemasu yo.',
        spanish: 'Cruza la intersección y, al girar a la izquierda, verás enseguida la entrada de la estación y la estatua de Hachiko.'
      },
      {
        id: 'dir5',
        speaker: 'user',
        japanese: 'よく分かりました！ありがとうございます。',
        romaji: 'Yoku vakarimashita! Arigatō gozaimasu.',
        spanish: '¡Entendido perfectamente! Muchas gracias.'
      },
      {
        id: 'dir6',
        speaker: 'partner',
        japanese: 'いいえ。お気をつけて！',
        romaji: 'Iie. O-ki o tsukete!',
        spanish: 'De nada. ¡Cuidado/Que tenga buen viaje!'
      }
    ],
    practicePhrases: [
      {
        id: 'dirp1',
        japanese: 'すみません、渋谷駅はどこですか？',
        romaji: 'Sumimasen, Shibuya-eki wa doko desu ka?',
        spanish: 'Disculpe, ¿dónde está la estación de Shibuya?',
        context: 'La fórmula estándar para preguntar por cualquier dirección o monumento reemplazando "Shibuya-eki" por tu destino.'
      },
      {
        id: 'dirp2',
        japanese: 'まっすぐ行って、右に曲がります。',
        romaji: 'Massugu itte, migi ni magarimasu.',
        spanish: 'Vaya recto y gire a la derecha.',
        context: 'Frase clave de comprensión para retener la dirección que un local te acaba de dar.'
      },
      {
        id: 'dirp3',
        japanese: '歩いてどれくらいですか？',
        romaji: 'Aruite dore kurai desu ka?',
        spanish: '¿Cuánto tiempo se tarda a pie?',
        context: 'Ideal para saber si puedes caminar al destino o si es mejor tomar transporte público.'
      },
      {
        id: 'dirp4',
        japanese: 'もう一度ゆっくりお願いします。',
        romaji: 'Mō ichido yukkuri onegaishimasu.',
        spanish: 'Una vez más, despacio, por favor.',
        context: 'Muy útil si la explicación del japonés local fue demasiado rápida para ti.'
      }
    ],
    partnerCharacter: 'Transeúnte Local en Shibuya (親切な人)',
    partnerImagePrompt: 'A trendy young Japanese citizen standing near Shibuya crossing holding a shopping bag, looking helpful and friendly',
    systemPrompt: 'Eres un residente local de Tokio, muy amable y cercano, caminando cerca del cruce de Shibuya. El usuario es un turista perdido que te detiene para preguntarte cómo llegar a puntos icónicos (Shibuya Station, Hachiko, Shibuya Sky, LINE Store). Respóndele de forma amigable y con un lenguaje natural de nivel intermedio, usando adverbios de lugar y referencias urbanas. Proporciona explicaciones espaciales claras en frases cortas.',
    initialMessage: 'あ、はい！何かお困りですか？道が分かりませんか？',
    initialMessageRomaji: 'A, hai! Nani ka o-komari desu ka? Michi ga vakarimasen ka?',
    initialMessageSpanish: '¡Ah, sí! ¿Tiene algún problema? ¿No ubica el camino?'
  },
  {
    id: 'ryokan',
    title: 'Check-in en un Ryokan Tradicional',
    japaneseTitle: '旅館でのチェックイン',
    level: 'Intermedio',
    icon: 'Home',
    description: 'Aprende a comunicarte educadamente utilizando expresiones de hospitalidad tradicionales en el check-in de un tradicional hotel Ryokan en Kioto.',
    objectives: [
      'Presentarte indicando tu reserva.',
      'Comprender vocabulario formal (Keigo) de servicio de hotel.',
      'Confirmar horarios de comida tradicional (Kaiseki) y baños termales (Onsen).'
    ],
    vocabulary: [
      { japanese: '予約 (よやく)', romaji: 'yoyaku', meaning: 'reserva' },
      { japanese: 'チェックイン', romaji: 'chekkuin', meaning: 'check-in' },
      { japanese: '温泉 (おんせん)', romaji: 'onsen', meaning: 'baños termales japoneses' },
      { japanese: '夕食 (ゆうしょく)', romaji: 'yūshoku', meaning: 'cena / comida de la noche' },
      { japanese: '朝食 (ちょうしょく)', romaji: 'chōshoku', meaning: 'desayuno' },
      { japanese: 'お部屋 (おへや)', romaji: 'o-heya', meaning: 'habitación (formal / cortés)' },
      { japanese: '鍵 (かぎ)', romaji: 'kagi', meaning: 'llave' },
      { japanese: '少々お待ちください', romaji: 'shōshō omachi kudasai', meaning: 'espere un momento por favor' }
    ],
    dialogue: [
      {
        id: 'ry1',
        speaker: 'partner',
        japanese: 'ようこそ大和屋旅館へ。ご予約のお名前を伺ってもよろしいでしょうか？',
        romaji: 'Yōkoso Yamatoya Ryokan e. Go-yoyaku no o-namae o ukagattemo yoroshii deshō ka?',
        spanish: 'Bienvenido al Ryokan Yamatoya. ¿Podría darme el nombre de su reserva?'
      },
      {
        id: 'ry2',
        speaker: 'user',
        japanese: 'カルロスと申します。今日から二泊で予約しています。',
        romaji: 'Karurosu to mōshimasu. Kyō kara nihaku de yoyaku shiteimasu.',
        spanish: 'Me llamo Carlos. Tengo una reserva por dos noches a partir de hoy.'
      },
      {
        id: 'ry3',
        speaker: 'partner',
        japanese: 'カルロス様ですね。ありがとうございます。ご夕食の時間ですが、六時と七時、どちらがよろしいでしょうか？',
        romaji: 'Karurosu-sama desu ne. Arigatō gozaimasu. Go-yūshoku no jikan desu ga, roku-ji to shichi-ji, dochira ga yoroshii deshō ka?',
        spanish: 'Señor Carlos, entendido. Muchas gracias. Con respecto a la hora de la cena, ¿prefiere a las 6:00 o a las 7:00?'
      },
      {
        id: 'ry4',
        speaker: 'user',
        japanese: '七時にお願いします。',
        romaji: 'Shichi-ji ni onegaishimasu.',
        spanish: 'A las 7:00, por favor.'
      },
      {
        id: 'ry5',
        speaker: 'partner',
        japanese: 'かしこまりました。お部屋は二階の「さくら」でございます。こちらが鍵でございます。',
        romaji: 'Kashikomarimashita. O-heya wa nikai no "Sakura" de gozaimasu. Kochira ga kagi de gozaimasu.',
        spanish: 'Entendido. Su habitación está en el segundo piso, se llama "Sakura". Aquí tiene la llave.'
      },
      {
        id: 'ry6',
        speaker: 'user',
        japanese: 'ありがとうございます。お風呂はどこにありますか？',
        romaji: 'Arigatō gozaimasu. O-furo wa doko ni arimasu ka?',
        spanish: 'Muchas gracias. ¿Dónde se encuentran los baños públicos?'
      },
      {
        id: 'ry7',
        speaker: 'partner',
        japanese: '大浴場は一階の奥にございます。一晩中ご利用いただけますよ。',
        romaji: 'Daiyokujō wa ikkai no oku de gozaimasu. Hitobanjū goriyō itadakemasu yo.',
        spanish: 'Los grandes baños públicos están al fondo de la primera planta. Están abiertos para su uso durante toda la noche.'
      }
    ],
    practicePhrases: [
      {
        id: 'ryp1',
        japanese: '予約しているカルロスです。',
        romaji: 'Yoyaku shiteiru Karurosu desu.',
        spanish: 'Soy Carlos y tengo una reserva.',
        context: 'Úsala nada más aproximarte al mostrador de recepción del Ryokan indicando tu nombre.'
      },
      {
        id: 'ryp2',
        japanese: '夕食は七時にお願いします。',
        romaji: 'Yūshoku wa shichi-ji ni onegaishimasu.',
        spanish: 'La cena a las 7:00, por favor.',
        context: 'Para confirmar tu turno preferido de comida, la cual se suele servir de forma puntual en tu habitación o el salón principal.'
      },
      {
        id: 'ryp3',
        japanese: 'Wi-Fiのパスワードは何ですか？',
        romaji: 'Waifai no pasuwādo wa nan desu ka?',
        spanish: '¿Cuál es la contraseña del Wi-Fi?',
        context: 'Ideal para preguntar a la recepción si no está anotado claramente en tu habitación.'
      },
      {
        id: 'ryp4',
        japanese: 'チェックアウトは何時ですか？',
        romaji: 'Chekkuauto wa nanji desu ka?',
        spanish: '¿A qué hora es el check-out?',
        context: 'Excelente pregunta de salida para organizar tu mañana de partida del Ryokan.'
      }
    ],
    partnerCharacter: 'Anfitriona del Ryokan (仲居さん)',
    partnerImagePrompt: 'A graceful elderly Japanese woman in fine lavender kimono bows gracefully inside an elegant traditional inn entrance',
    systemPrompt: 'Eres Nakai-san, la anfitriona educada y atenta de un Ryokan (hotel tradicional japonés) de alta gama en Kioto. El usuario es un huésped extranjero haciendo el check-in. Utiliza partículas de cortesía y palabras de hospitalidad (Keigo suave o japonés muy educado), asistiéndolo en cómo elegir el horario para los baños (onsen) y su cena kaiseki. Contesta a sus dudas sosteniendo siempre una postura amable y de refinamiento. Respóndele SOLO en japonés.',
    initialMessage: 'ようこそ当旅館へお越しくださいました。ご予約のお名前を伺ってもよろしいでしょうか？',
    initialMessageRomaji: 'Yōkoso tō-ryokan e okoshi kudasaimashita. Go-yoyaku no o-namae o ukagattemo yoroshii deshō ka?',
    initialMessageSpanish: 'Sean muy bienvenidos a nuestro ryokan. ¿Sería tan amable de brindarme el nombre con el que reservó?'
  }
];
