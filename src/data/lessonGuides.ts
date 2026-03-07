
import { UiLanguage } from '../i18n/translations';

export type LocalizedText = Record<UiLanguage, string>;

export interface LessonExample {
  de: string;
  translations: LocalizedText;
}

export interface LessonSection {
  title: LocalizedText;
  content: LocalizedText;
  example?: LessonExample[];
}

export interface LessonGuideContent {
  title: LocalizedText;
  description: LocalizedText;
  sections: LessonSection[];
}

export const lessonGuides: Record<string, LessonGuideContent> = {
  'alphabet': {
    title: {
      en: 'The German Alphabet',
      zh: '德语字母表',
      de: 'Das deutsche Alphabet'
    },
    description: {
      en: 'Learn the basics of German pronunciation and special characters.',
      zh: '学习德语发音基础与特殊字符。',
      de: 'Lerne die Grundlagen der deutschen Aussprache und Sonderzeichen.'
    },
    sections: [
      {
        title: {
          en: 'Special Characters',
          zh: '特殊字符',
          de: 'Sonderzeichen'
        },
        content: {
          en: 'German has four special characters: Ä, Ö, Ü (Umlauts) and ß (Eszett).',
          zh: '德语有四个特殊字符：Ä、Ö、Ü（变音符）和 ß（德语尖音 s）。',
          de: 'Deutsch hat vier Sonderzeichen: Ä, Ö, Ü (Umlaute) und ß (Eszett).'
        },
        example: [
          {
            de: 'Äpfel',
            translations: {
              en: 'Apples (sounds like "eh")',
              zh: '苹果（发音类似“诶”）',
              de: 'Äpfel (klingt wie „eh“)'
            }
          },
          {
            de: 'Öl',
            translations: {
              en: 'Oil (sounds like "ur" in burn)',
              zh: '油（发音类似“呃”）',
              de: 'Öl (klingt wie „ö“)'
            }
          },
          {
            de: 'Über',
            translations: {
              en: 'Over (rounded "u" sound)',
              zh: '在……上方（圆唇“ü”）',
              de: 'Über (rundes „ü“)'
            }
          },
          {
            de: 'Straße',
            translations: {
              en: 'Street (sharp "s" sound)',
              zh: '街道（“ß”发清晰 s 音）',
              de: 'Straße (scharfes „s“)'
            }
          }
        ]
      },
      {
        title: {
          en: 'Pronunciation Rules',
          zh: '发音规则',
          de: 'Aussprache-Regeln'
        },
        content: {
          en: 'Vowels can be short or long. "ie" sounds like "ee" and "ei" sounds like "eye".',
          zh: '元音有长短之分。“ie”发“ee”，“ei”发“ai”。',
          de: 'Vokale können kurz oder lang sein. „ie“ klingt wie „ie“, „ei“ wie „ai“.'
        },
        example: [
          {
            de: 'Wien',
            translations: {
              en: 'Vienna (long i)',
              zh: '维也纳（长音 i）',
              de: 'Wien (langes i)'
            }
          },
          {
            de: 'Wein',
            translations: {
              en: 'Wine (like eye)',
              zh: '葡萄酒（ai 发音）',
              de: 'Wein (wie „ai“)'
            }
          }
        ]
      }
    ]
  },
  'pronouns': {
    title: {
      en: 'Personal Pronouns',
      zh: '人称代词',
      de: 'Personalpronomen'
    },
    description: {
      en: 'How to say I, you, he, she, it, we, you (plural), and they.',
      zh: '如何表达我、你、他、她、它、我们、你们、他们。',
      de: 'Wie man ich, du, er, sie, es, wir, ihr und sie sagt.'
    },
    sections: [
      {
        title: {
          en: 'Singular Pronouns',
          zh: '单数代词',
          de: 'Singular'
        },
        content: {
          en: 'These are used for one person.',
          zh: '用于指一个人。',
          de: 'Diese Formen nutzt man für eine Person.'
        },
        example: [
          { de: 'ich', translations: { en: 'I', zh: '我', de: 'ich' } },
          { de: 'du', translations: { en: 'you (informal)', zh: '你（非正式）', de: 'du' } },
          { de: 'er', translations: { en: 'he', zh: '他', de: 'er' } },
          { de: 'sie', translations: { en: 'she', zh: '她', de: 'sie' } },
          { de: 'es', translations: { en: 'it', zh: '它', de: 'es' } }
        ]
      },
      {
        title: {
          en: 'Plural Pronouns',
          zh: '复数代词',
          de: 'Plural'
        },
        content: {
          en: 'These are used for multiple people.',
          zh: '用于指多个人。',
          de: 'Diese Formen nutzt man für mehrere Personen.'
        },
        example: [
          { de: 'wir', translations: { en: 'we', zh: '我们', de: 'wir' } },
          { de: 'ihr', translations: { en: 'you all (informal)', zh: '你们（非正式）', de: 'ihr' } },
          { de: 'sie', translations: { en: 'they', zh: '他们/她们/它们', de: 'sie' } },
          { de: 'Sie', translations: { en: 'You (formal)', zh: '您（正式）', de: 'Sie' } }
        ]
      }
    ]
  },
  'verb_sein': {
    title: {
      en: 'The Verb "sein" (to be)',
      zh: '动词 sein（是）',
      de: 'Das Verb „sein“'
    },
    description: {
      en: 'The most important verb in German.',
      zh: '德语中最重要的动词之一。',
      de: 'Das wichtigste Verb im Deutschen.'
    },
    sections: [
      {
        title: {
          en: 'Conjugation',
          zh: '变位',
          de: 'Konjugation'
        },
        content: {
          en: '"sein" is irregular. Memorize these forms.',
          zh: 'sein 是不规则动词，需要记忆。',
          de: '„sein“ ist unregelmäßig. Diese Formen muss man lernen.'
        },
        example: [
          { de: 'ich bin', translations: { en: 'I am', zh: '我是', de: 'ich bin' } },
          { de: 'du bist', translations: { en: 'you are', zh: '你是', de: 'du bist' } },
          { de: 'er/sie/es ist', translations: { en: 'he/she/it is', zh: '他/她/它是', de: 'er/sie/es ist' } },
          { de: 'wir sind', translations: { en: 'we are', zh: '我们是', de: 'wir sind' } },
          { de: 'ihr seid', translations: { en: 'you all are', zh: '你们是', de: 'ihr seid' } },
          { de: 'sie sind', translations: { en: 'they are', zh: '他们是', de: 'sie sind' } }
        ]
      },
      {
        title: {
          en: 'Usage',
          zh: '用法',
          de: 'Verwendung'
        },
        content: {
          en: 'Use "sein" to describe identity, qualities, or location.',
          zh: '用于描述身份、特征或位置。',
          de: 'Mit „sein“ beschreibt man Identität, Eigenschaften oder Ort.'
        },
        example: [
          {
            de: 'Ich bin Student.',
            translations: { en: 'I am a student.', zh: '我是学生。', de: 'Ich bin Student.' }
          },
          {
            de: 'Das ist gut.',
            translations: { en: 'That is good.', zh: '那很好。', de: 'Das ist gut.' }
          },
          {
            de: 'Wir sind hier.',
            translations: { en: 'We are here.', zh: '我们在这里。', de: 'Wir sind hier.' }
          }
        ]
      }
    ]
  },
  'verb_haben': {
    title: {
      en: 'The Verb "haben" (to have)',
      zh: '动词 haben（有）',
      de: 'Das Verb „haben“'
    },
    description: {
      en: 'Used to express possession and to form past tenses later.',
      zh: '用于表达拥有，也用于构成过去时。',
      de: 'Drückt Besitz aus und bildet später Vergangenheitsformen.'
    },
    sections: [
      {
        title: {
          en: 'Conjugation',
          zh: '变位',
          de: 'Konjugation'
        },
        content: {
          en: '"haben" is mostly regular but changes in the singular.',
          zh: 'haben 大体规则，但单数有变化。',
          de: '„haben“ ist weitgehend regelmäßig, aber im Singular verändert.'
        },
        example: [
          { de: 'ich habe', translations: { en: 'I have', zh: '我有', de: 'ich habe' } },
          { de: 'du hast', translations: { en: 'you have', zh: '你有', de: 'du hast' } },
          { de: 'er/sie/es hat', translations: { en: 'he/she/it has', zh: '他/她/它有', de: 'er/sie/es hat' } },
          { de: 'wir haben', translations: { en: 'we have', zh: '我们有', de: 'wir haben' } },
          { de: 'ihr habt', translations: { en: 'you all have', zh: '你们有', de: 'ihr habt' } },
          { de: 'sie haben', translations: { en: 'they have', zh: '他们有', de: 'sie haben' } }
        ]
      }
    ]
  },
  'basic_statements': {
    title: {
      en: 'Basic Sentence Structure',
      zh: '基础句型结构',
      de: 'Grundlegender Satzbau'
    },
    description: {
      en: 'Subject + Verb + Object.',
      zh: '主语 + 动词 + 宾语。',
      de: 'Subjekt + Verb + Objekt.'
    },
    sections: [
      {
        title: {
          en: 'Standard Word Order',
          zh: '标准语序',
          de: 'Standard-Wortstellung'
        },
        content: {
          en: 'In a simple statement, the verb is always in the second position.',
          zh: '简单陈述句中，动词总在第二位置。',
          de: 'Im Hauptsatz steht das Verb immer an Position zwei.'
        },
        example: [
          {
            de: 'Ich lerne Deutsch.',
            translations: { en: 'I am learning German.', zh: '我在学德语。', de: 'Ich lerne Deutsch.' }
          },
          {
            de: 'Das ist ein Buch.',
            translations: { en: 'That is a book.', zh: '那是一本书。', de: 'Das ist ein Buch.' }
          }
        ]
      }
    ]
  },
  'articles_nom': {
    title: {
      en: 'Definite Articles (Nominative)',
      zh: '定冠词（主格）',
      de: 'Bestimmte Artikel (Nominativ)'
    },
    description: {
      en: 'The three genders: der, die, das.',
      zh: '三种性别：der、die、das。',
      de: 'Die drei Genera: der, die, das.'
    },
    sections: [
      {
        title: {
          en: 'Gender',
          zh: '性别',
          de: 'Genus'
        },
        content: {
          en: 'Every noun has a gender: masculine, feminine, or neuter.',
          zh: '每个名词都有性别：阳性、阴性或中性。',
          de: 'Jedes Substantiv hat ein Genus: maskulin, feminin oder neutrum.'
        },
        example: [
          { de: 'der Mann', translations: { en: 'the man', zh: '男人', de: 'der Mann' } },
          { de: 'die Frau', translations: { en: 'the woman', zh: '女人', de: 'die Frau' } },
          { de: 'das Kind', translations: { en: 'the child', zh: '孩子', de: 'das Kind' } }
        ]
      },
      {
        title: {
          en: 'Plural',
          zh: '复数',
          de: 'Plural'
        },
        content: {
          en: 'The plural article is always "die".',
          zh: '复数定冠词统一使用 die。',
          de: 'Im Plural steht immer „die“.'
        },
        example: [
          { de: 'die Männer', translations: { en: 'the men', zh: '男人们', de: 'die Männer' } },
          { de: 'die Frauen', translations: { en: 'the women', zh: '女人们', de: 'die Frauen' } },
          { de: 'die Kinder', translations: { en: 'the children', zh: '孩子们', de: 'die Kinder' } }
        ]
      }
    ]
  },
  'negation': {
    title: {
      en: 'Negation: nicht vs. kein',
      zh: '否定：nicht 与 kein',
      de: 'Negation: nicht vs. kein'
    },
    description: {
      en: 'How to say "no" or "not".',
      zh: '如何表达“不是/不”。',
      de: 'Wie man „nicht“ oder „kein“ verwendet.'
    },
    sections: [
      {
        title: {
          en: 'nicht',
          zh: 'nicht',
          de: 'nicht'
        },
        content: {
          en: 'Use "nicht" to negate verbs and adjectives.',
          zh: '用于否定动词和形容词。',
          de: '„nicht“ negiert Verben und Adjektive.'
        },
        example: [
          {
            de: 'Das ist nicht gut.',
            translations: { en: 'That is not good.', zh: '那不好。', de: 'Das ist nicht gut.' }
          },
          {
            de: 'Ich arbeite nicht.',
            translations: { en: 'I am not working.', zh: '我不工作。', de: 'Ich arbeite nicht.' }
          }
        ]
      },
      {
        title: {
          en: 'kein',
          zh: 'kein',
          de: 'kein'
        },
        content: {
          en: 'Use "kein" to negate nouns with ein/eine. It implies "no" or "none".',
          zh: '用于否定带不定冠词的名词，表示“没有”。',
          de: '„kein“ negiert Nomen mit ein/eine und bedeutet „kein/keine“.'
        },
        example: [
          {
            de: 'Das ist kein Apfel.',
            translations: { en: 'That is not an apple.', zh: '那不是苹果。', de: 'Das ist kein Apfel.' }
          },
          {
            de: 'Ich habe keine Zeit.',
            translations: { en: 'I have no time.', zh: '我没有时间。', de: 'Ich habe keine Zeit.' }
          }
        ]
      }
    ]
  },
  'regular_conjugation': {
    title: {
      en: 'Regular Verb Conjugation',
      zh: '规则动词变位',
      de: 'Regelmäßige Verbkonjugation'
    },
    description: {
      en: 'The pattern for most verbs in the present tense.',
      zh: '现在时大多数动词的规律。',
      de: 'Das Muster für die meisten Verben im Präsens.'
    },
    sections: [
      {
        title: {
          en: 'Endings',
          zh: '词尾变化',
          de: 'Endungen'
        },
        content: {
          en: 'Remove "-en" from the infinitive and add these endings.',
          zh: '去掉 -en，再加上对应词尾。',
          de: 'Man entfernt „-en“ und fügt die Endungen an.'
        },
        example: [
          { de: 'ich mache (-e)', translations: { en: 'I make', zh: '我做', de: 'ich mache' } },
          { de: 'du machst (-st)', translations: { en: 'you make', zh: '你做', de: 'du machst' } },
          { de: 'er macht (-t)', translations: { en: 'he makes', zh: '他做', de: 'er macht' } },
          { de: 'wir machen (-en)', translations: { en: 'we make', zh: '我们做', de: 'wir machen' } },
          { de: 'ihr macht (-t)', translations: { en: 'you all make', zh: '你们做', de: 'ihr macht' } },
          { de: 'sie machen (-en)', translations: { en: 'they make', zh: '他们做', de: 'sie machen' } }
        ]
      }
    ]
  },
  'modal_koennen': {
    title: {
      en: 'Modal Verb: können',
      zh: '情态动词：können',
      de: 'Modalverb: können'
    },
    description: {
      en: 'Expressing ability or possibility.',
      zh: '表达能力或可能性。',
      de: 'Drückt Fähigkeit oder Möglichkeit aus.'
    },
    sections: [
      {
        title: {
          en: 'Conjugation',
          zh: '变位',
          de: 'Konjugation'
        },
        content: {
          en: 'Notice the vowel change in singular forms (kann).',
          zh: '单数形式元音变化（kann）。',
          de: 'Im Singular ändert sich der Vokal (kann).'
        },
        example: [
          { de: 'ich kann', translations: { en: 'I can', zh: '我能', de: 'ich kann' } },
          { de: 'du kannst', translations: { en: 'you can', zh: '你能', de: 'du kannst' } },
          { de: 'er kann', translations: { en: 'he can', zh: '他能', de: 'er kann' } },
          { de: 'wir können', translations: { en: 'we can', zh: '我们能', de: 'wir können' } }
        ]
      },
      {
        title: {
          en: 'Sentence Structure',
          zh: '句子结构',
          de: 'Satzbau'
        },
        content: {
          en: 'The modal verb goes in position 2, and the main verb goes to the end in infinitive form.',
          zh: '情态动词在第二位置，主要动词以不定式放在句末。',
          de: 'Das Modalverb steht an Position zwei, das Vollverb im Infinitiv am Satzende.'
        },
        example: [
          {
            de: 'Ich kann gut schwimmen.',
            translations: { en: 'I can swim well.', zh: '我能很好地游泳。', de: 'Ich kann gut schwimmen.' }
          }
        ]
      }
    ]
  },
  'word_order_v2': {
    title: {
      en: 'Verb Second Rule',
      zh: '动词第二位规则',
      de: 'Verb-Zweit-Regel'
    },
    description: {
      en: 'The golden rule of German sentence structure.',
      zh: '德语语序的黄金规则。',
      de: 'Die goldene Regel des deutschen Satzbaus.'
    },
    sections: [
      {
        title: {
          en: 'Position 2',
          zh: '第二位置',
          de: 'Position 2'
        },
        content: {
          en: 'In a main clause, the conjugated verb is always the second element.',
          zh: '主句中，变位动词总在第二位置。',
          de: 'Im Hauptsatz steht das konjugierte Verb immer an Position zwei.'
        },
        example: [
          {
            de: 'Ich gehe heute ins Kino.',
            translations: { en: 'I go to the cinema today.', zh: '我今天去电影院。', de: 'Ich gehe heute ins Kino.' }
          },
          {
            de: 'Heute gehe ich ins Kino.',
            translations: { en: 'Today I go to the cinema.', zh: '今天我去电影院。', de: 'Heute gehe ich ins Kino.' }
          }
        ]
      }
    ]
  },
  'separable_verbs': {
    title: {
      en: 'Separable Verbs',
      zh: '可分动词',
      de: 'Trennbare Verben'
    },
    description: {
      en: 'Verbs with prefixes that split off.',
      zh: '带前缀且可拆分的动词。',
      de: 'Verben mit abtrennbaren Präfixen.'
    },
    sections: [
      {
        title: {
          en: 'The Split',
          zh: '拆分规则',
          de: 'Die Trennung'
        },
        content: {
          en: 'Common prefixes like an-, aus-, ein-, auf- separate and go to the end of the sentence.',
          zh: '如 an-, aus-, ein-, auf- 等前缀会分离并放到句末。',
          de: 'Präfixe wie an-, aus-, ein-, auf- trennen sich und stehen am Satzende.'
        },
        example: [
          {
            de: 'Ich stehe um 7 Uhr auf.',
            translations: { en: 'I get up at 7.', zh: '我七点起床。', de: 'Ich stehe um 7 Uhr auf.' }
          },
          {
            de: 'Wir kaufen im Supermarkt ein.',
            translations: { en: 'We shop at the supermarket.', zh: '我们在超市购物。', de: 'Wir kaufen im Supermarkt ein.' }
          }
        ]
      }
    ]
  },
  'accusative_intro': {
    title: {
      en: 'The Accusative Case',
      zh: '宾格入门',
      de: 'Der Akkusativ'
    },
    description: {
      en: 'Direct objects change their article.',
      zh: '直接宾语的冠词会变化。',
      de: 'Direkte Objekte ändern den Artikel.'
    },
    sections: [
      {
        title: {
          en: 'What changes?',
          zh: '哪些会变？',
          de: 'Was ändert sich?'
        },
        content: {
          en: 'Only masculine articles change. "Der" becomes "den". "Ein" becomes "einen".',
          zh: '只有阳性冠词变化：der→den，ein→einen。',
          de: 'Nur maskuline Artikel ändern sich: der→den, ein→einen.'
        },
        example: [
          {
            de: 'Ich habe einen Bruder.',
            translations: { en: 'I have a brother.', zh: '我有一个兄弟。', de: 'Ich habe einen Bruder.' }
          },
          {
            de: 'Ich sehe den Mann.',
            translations: { en: 'I see the man.', zh: '我看到那个男人。', de: 'Ich sehe den Mann.' }
          },
          {
            de: 'Ich esse eine Pizza.',
            translations: { en: 'I eat a pizza.', zh: '我吃一块披萨。', de: 'Ich esse eine Pizza.' }
          }
        ]
      }
    ]
  },
  'dative_intro': {
    title: {
      en: 'The Dative Case',
      zh: '与格入门',
      de: 'Der Dativ'
    },
    description: {
      en: 'Indirect objects and specific prepositions.',
      zh: '间接宾语与特定介词。',
      de: 'Indirekte Objekte und bestimmte Präpositionen.'
    },
    sections: [
      {
        title: {
          en: 'Article Changes',
          zh: '冠词变化',
          de: 'Artikeländerungen'
        },
        content: {
          en: 'Der → dem, die → der, das → dem, plural die → den.',
          zh: 'der→dem，die→der，das→dem，复数 die→den。',
          de: 'der → dem, die → der, das → dem, Plural die → den.'
        },
        example: [
          {
            de: 'Ich helfe dem Mann.',
            translations: { en: 'I help the man.', zh: '我帮助那位男士。', de: 'Ich helfe dem Mann.' }
          },
          {
            de: 'Ich gebe der Frau ein Buch.',
            translations: { en: 'I give the woman a book.', zh: '我给那位女士一本书。', de: 'Ich gebe der Frau ein Buch.' }
          }
        ]
      }
    ]
  },
  'perfekt_form': {
    title: {
      en: 'The Perfekt Tense',
      zh: '完成时（Perfekt）',
      de: 'Das Perfekt'
    },
    description: {
      en: 'Talking about the past in spoken German.',
      zh: '口语中谈论过去的主要时态。',
      de: 'Vergangenheit in der gesprochenen Sprache.'
    },
    sections: [
      {
        title: {
          en: 'Formation',
          zh: '构成',
          de: 'Bildung'
        },
        content: {
          en: 'Use a helper verb (haben or sein) + past participle at the end.',
          zh: '使用助动词（haben 或 sein）+ 过去分词放在句末。',
          de: 'Mit Hilfsverb (haben oder sein) + Partizip II am Satzende.'
        },
        example: [
          {
            de: 'Ich habe Fußball gespielt.',
            translations: { en: 'I played soccer.', zh: '我踢了足球。', de: 'Ich spielte Fußball.' }
          },
          {
            de: 'Ich bin nach Berlin gefahren.',
            translations: { en: 'I went to Berlin.', zh: '我去了柏林。', de: 'Ich fuhr nach Berlin.' }
          }
        ]
      },
      {
        title: {
          en: 'haben vs. sein',
          zh: 'haben 与 sein 的选择',
          de: 'haben vs. sein'
        },
        content: {
          en: 'Use "sein" with movement or change of state. Most other verbs take "haben".',
          zh: '移动或状态变化用 sein，其余大多用 haben。',
          de: 'Bei Bewegung oder Zustandswechsel nutzt man „sein“, sonst meist „haben“.'
        },
        example: [
          {
            de: 'Wir sind früh aufgestanden.',
            translations: { en: 'We got up early.', zh: '我们起得很早。', de: 'Wir standen früh auf.' }
          },
          {
            de: 'Sie hat viel gearbeitet.',
            translations: { en: 'She worked a lot.', zh: '她工作很多。', de: 'Sie arbeitete viel.' }
          }
        ]
      },
      {
        title: {
          en: 'Participle Patterns',
          zh: '分词规律',
          de: 'Partizip-Muster'
        },
        content: {
          en: 'Regular verbs use ge- + stem + -t. Many irregular verbs use -en.',
          zh: '规则动词用 ge- + 词干 + -t，不规则多为 -en。',
          de: 'Regelmäßig: ge- + Stamm + -t, unregelmäßig oft -en.'
        },
        example: [
          {
            de: 'machen → gemacht',
            translations: { en: 'make → made', zh: '做 → 做过', de: 'machen → gemacht' }
          },
          {
            de: 'gehen → gegangen',
            translations: { en: 'go → gone', zh: '去 → 去过', de: 'gehen → gegangen' }
          }
        ]
      },
      {
        title: {
          en: 'Mini Diary Entry',
          zh: '迷你日记',
          de: 'Mini-Tagebuch'
        },
        content: {
          en: 'Short narratives often chain Perfekt sentences with time words.',
          zh: '短叙述常用时间词连接多个 Perfekt 句。',
          de: 'Kurze Erzählungen verbinden Perfekt-Sätze mit Zeitadverbien.'
        },
        example: [
          {
            de: 'Gestern habe ich Kaffee gekocht und ein Buch gelesen.',
            translations: {
              en: 'Yesterday I made coffee and read a book.',
              zh: '昨天我煮了咖啡并读了一本书。',
              de: 'Gestern kochte ich Kaffee und las ein Buch.'
            }
          }
        ]
      }
    ]
  },
  'two_way_prepositions': {
    title: {
      en: 'Two-Way Prepositions',
      zh: '双向介词',
      de: 'Wechselpräpositionen'
    },
    description: {
      en: 'Accusative for direction, dative for location.',
      zh: '表示方向用宾格，表示位置用与格。',
      de: 'Akkusativ für Richtung, Dativ für Ort.'
    },
    sections: [
      {
        title: {
          en: 'Core Prepositions',
          zh: '常见介词',
          de: 'Wichtige Präpositionen'
        },
        content: {
          en: 'an, auf, in, über, unter, hinter, vor, neben, zwischen.',
          zh: 'an, auf, in, über, unter, hinter, vor, neben, zwischen。',
          de: 'an, auf, in, über, unter, hinter, vor, neben, zwischen.'
        }
      },
      {
        title: {
          en: 'Direction (Akkusativ)',
          zh: '方向（宾格）',
          de: 'Richtung (Akkusativ)'
        },
        content: {
          en: 'Movement toward a place uses the accusative.',
          zh: '表示进入或朝向使用宾格。',
          de: 'Bei Bewegung zum Ort steht der Akkusativ.'
        },
        example: [
          {
            de: 'Ich gehe in die Schule.',
            translations: { en: 'I go into the school.', zh: '我走进学校。', de: 'Ich gehe in die Schule.' }
          }
        ]
      },
      {
        title: {
          en: 'Location (Dativ)',
          zh: '位置（与格）',
          de: 'Ort (Dativ)'
        },
        content: {
          en: 'Position without movement uses the dative.',
          zh: '静止位置使用与格。',
          de: 'Ohne Bewegung steht der Dativ.'
        },
        example: [
          {
            de: 'Ich bin in der Schule.',
            translations: { en: 'I am in the school.', zh: '我在学校里。', de: 'Ich bin in der Schule.' }
          }
        ]
      }
    ]
  },
  'comparatives': {
    title: {
      en: 'Comparatives and Superlatives',
      zh: '比较级与最高级',
      de: 'Komparativ und Superlativ'
    },
    description: {
      en: 'Compare people, things, and qualities.',
      zh: '用于比较人、事、物和特征。',
      de: 'Vergleiche Personen, Dinge und Eigenschaften.'
    },
    sections: [
      {
        title: {
          en: 'Comparative',
          zh: '比较级',
          de: 'Komparativ'
        },
        content: {
          en: 'Add -er to the adjective and use "als" for comparisons.',
          zh: '形容词加 -er，用 als 做比较。',
          de: 'Adjektiv + -er, Vergleich mit „als“.'
        },
        example: [
          {
            de: 'Berlin ist größer als Köln.',
            translations: { en: 'Berlin is bigger than Cologne.', zh: '柏林比科隆大。', de: 'Berlin ist größer als Köln.' }
          }
        ]
      },
      {
        title: {
          en: 'Superlative',
          zh: '最高级',
          de: 'Superlativ'
        },
        content: {
          en: 'Use am + -sten or the -ste form with articles.',
          zh: '用 am + -sten 或带冠词的 -ste 形式。',
          de: 'Mit „am -sten“ oder der -ste-Form.'
        },
        example: [
          {
            de: 'Das ist am wichtigsten.',
            translations: { en: 'That is the most important.', zh: '那是最重要的。', de: 'Das ist am wichtigsten.' }
          }
        ]
      }
    ]
  },
  'reflexive_verbs': {
    title: {
      en: 'Reflexive Verbs',
      zh: '反身动词',
      de: 'Reflexive Verben'
    },
    description: {
      en: 'Actions you do to yourself.',
      zh: '对自己进行的动作。',
      de: 'Handlungen, die man an sich selbst ausführt.'
    },
    sections: [
      {
        title: {
          en: 'Reflexive Pronouns',
          zh: '反身代词',
          de: 'Reflexivpronomen'
        },
        content: {
          en: 'mich, dich, sich, uns, euch, sich.',
          zh: 'mich, dich, sich, uns, euch, sich。',
          de: 'mich, dich, sich, uns, euch, sich.'
        }
      },
      {
        title: {
          en: 'Daily Routines',
          zh: '日常行为',
          de: 'Alltag'
        },
        content: {
          en: 'Common reflexive verbs: sich waschen, sich anziehen, sich beeilen.',
          zh: '常见反身动词：sich waschen, sich anziehen, sich beeilen。',
          de: 'Häufig: sich waschen, sich anziehen, sich beeilen.'
        },
        example: [
          {
            de: 'Ich ziehe mich schnell an.',
            translations: { en: 'I get dressed quickly.', zh: '我很快穿好衣服。', de: 'Ich ziehe mich schnell an.' }
          }
        ]
      }
    ]
  },
  'weil_dass': {
    title: {
      en: 'Subordinate Clauses: weil & dass',
      zh: '从句：weil 与 dass',
      de: 'Nebensätze: weil & dass'
    },
    description: {
      en: 'Introduce reasons and statements with verb-final order.',
      zh: '引入原因或陈述，从句动词在句末。',
      de: 'Begründungen und Aussagen mit Verb am Satzende.'
    },
    sections: [
      {
        title: {
          en: 'Verb at the End',
          zh: '动词放句末',
          de: 'Verb am Ende'
        },
        content: {
          en: 'In subordinate clauses, the conjugated verb goes to the end.',
          zh: '从句里变位动词放句末。',
          de: 'Im Nebensatz steht das konjugierte Verb am Ende.'
        },
        example: [
          {
            de: 'Ich bleibe zu Hause, weil ich krank bin.',
            translations: { en: 'I stay home because I am sick.', zh: '我留在家，因为我生病了。', de: 'Ich bleibe zu Hause, weil ich krank bin.' }
          },
          {
            de: 'Er sagt, dass er später kommt.',
            translations: { en: 'He says that he will come later.', zh: '他说他晚点来。', de: 'Er sagt, dass er später kommt.' }
          }
        ]
      }
    ]
  },
  'future_will': {
    title: {
      en: 'Future with werden',
      zh: 'werden 表将来',
      de: 'Futur mit werden'
    },
    description: {
      en: 'Talking about plans and predictions.',
      zh: '表达计划与预测。',
      de: 'Pläne und Vorhersagen.'
    },
    sections: [
      {
        title: {
          en: 'Structure',
          zh: '结构',
          de: 'Struktur'
        },
        content: {
          en: 'werden + infinitive at the end.',
          zh: 'werden + 不定式置于句末。',
          de: 'werden + Infinitiv am Satzende.'
        },
        example: [
          {
            de: 'Ich werde morgen lernen.',
            translations: { en: 'I will study tomorrow.', zh: '我明天会学习。', de: 'Ich werde morgen lernen.' }
          }
        ]
      }
    ]
  },
  'adjective_endings_basic': {
    title: {
      en: 'Basic Adjective Endings',
      zh: '基础形容词词尾',
      de: 'Grundlegende Adjektivendungen'
    },
    description: {
      en: 'Adjective endings after definite and indefinite articles.',
      zh: '定冠词和不定冠词后的形容词词尾。',
      de: 'Adjektivendungen nach bestimmtem und unbestimmtem Artikel.'
    },
    sections: [
      {
        title: {
          en: 'With Definite Articles',
          zh: '定冠词后',
          de: 'Mit bestimmtem Artikel'
        },
        content: {
          en: 'Der gute Mann, die gute Frau, das gute Kind.',
          zh: 'der gute Mann, die gute Frau, das gute Kind。',
          de: 'der gute Mann, die gute Frau, das gute Kind.'
        }
      },
      {
        title: {
          en: 'With Indefinite Articles',
          zh: '不定冠词后',
          de: 'Mit unbestimmtem Artikel'
        },
        content: {
          en: 'Ein guter Mann, eine gute Frau, ein gutes Kind.',
          zh: 'ein guter Mann, eine gute Frau, ein gutes Kind。',
          de: 'ein guter Mann, eine gute Frau, ein gutes Kind.'
        }
      }
    ]
  },
  'passive_voice': {
    title: {
      en: 'Passive Voice',
      zh: '被动语态',
      de: 'Passiv'
    },
    description: {
      en: 'Focusing on the action, not the actor.',
      zh: '强调动作而非执行者。',
      de: 'Der Fokus liegt auf der Handlung, nicht auf dem Handelnden.'
    },
    sections: [
      {
        title: {
          en: 'Formation',
          zh: '构成',
          de: 'Bildung'
        },
        content: {
          en: 'Use "werden" + past participle.',
          zh: '使用 werden + 过去分词。',
          de: 'Mit „werden“ + Partizip II.'
        },
        example: [
          {
            de: 'Das Auto wird repariert.',
            translations: { en: 'The car is being repaired.', zh: '汽车正在被修理。', de: 'Das Auto wird repariert.' }
          },
          {
            de: 'Das Haus wurde gebaut.',
            translations: { en: 'The house was built.', zh: '这房子被建好了。', de: 'Das Haus wurde gebaut.' }
          }
        ]
      },
      {
        title: {
          en: 'Agent with von',
          zh: '执行者用 von',
          de: 'Handelnder mit von'
        },
        content: {
          en: 'Add the agent with "von" when it is important.',
          zh: '需要强调执行者时用 von。',
          de: 'Der Handelnde wird mit „von“ ergänzt.'
        },
        example: [
          {
            de: 'Der Brief wird von Maria geschrieben.',
            translations: { en: 'The letter is written by Maria.', zh: '这封信由玛丽亚写。', de: 'Der Brief wird von Maria geschrieben.' }
          }
        ]
      },
      {
        title: {
          en: 'Passive with Modals',
          zh: '含情态动词的被动',
          de: 'Passiv mit Modalverben'
        },
        content: {
          en: 'Use modal verb + past participle + werden.',
          zh: '情态动词 + 过去分词 + werden。',
          de: 'Modalverb + Partizip II + werden.'
        },
        example: [
          {
            de: 'Die Aufgabe muss heute erledigt werden.',
            translations: { en: 'The task must be completed today.', zh: '任务必须今天完成。', de: 'Die Aufgabe muss heute erledigt werden.' }
          }
        ]
      },
      {
        title: {
          en: 'Literary & News Style',
          zh: '文学与新闻语体',
          de: 'Literarisch und journalistisch'
        },
        content: {
          en: 'Passive is common in reports to highlight events over actors.',
          zh: '报道中常用被动强调事件本身。',
          de: 'Im Berichtstil betont das Passiv Ereignisse statt Personen.'
        },
        example: [
          {
            de: 'In der Stadt wurden neue Brücken gebaut.',
            translations: { en: 'New bridges were built in the city.', zh: '城市里建起了新桥。', de: 'In der Stadt wurden neue Brücken gebaut.' }
          }
        ]
      }
    ]
  },
  'relative_clauses': {
    title: {
      en: 'Relative Clauses',
      zh: '关系从句',
      de: 'Relativsätze'
    },
    description: {
      en: 'Add details about nouns with der/die/das.',
      zh: '用 der/die/das 给名词补充信息。',
      de: 'Ergänze Informationen zu Nomen mit der/die/das.'
    },
    sections: [
      {
        title: {
          en: 'Basic Form',
          zh: '基本形式',
          de: 'Grundform'
        },
        content: {
          en: 'The relative pronoun matches the gender and case of the noun.',
          zh: '关系代词与名词的性别和格一致。',
          de: 'Das Relativpronomen richtet sich nach Genus und Kasus.'
        },
        example: [
          {
            de: 'Das ist der Mann, der hier wohnt.',
            translations: { en: 'That is the man who lives here.', zh: '那是住在这里的男人。', de: 'Das ist der Mann, der hier wohnt.' }
          }
        ]
      }
    ]
  },
  'konjunktiv2': {
    title: {
      en: 'Konjunktiv II',
      zh: '虚拟式 II',
      de: 'Konjunktiv II'
    },
    description: {
      en: 'Polite requests and unreal situations.',
      zh: '礼貌请求与非现实情况。',
      de: 'Höfliche Bitten und Irreales.'
    },
    sections: [
      {
        title: {
          en: 'Polite Requests',
          zh: '礼貌请求',
          de: 'Höfliche Bitten'
        },
        content: {
          en: 'Use würde + infinitive or special forms like hätte/wäre.',
          zh: '使用 würde + 不定式，或 hätte/wäre 等特殊形式。',
          de: 'Mit würde + Infinitiv oder Formen wie hätte/wäre.'
        },
        example: [
          {
            de: 'Ich hätte gern einen Kaffee.',
            translations: { en: 'I would like a coffee.', zh: '我想要一杯咖啡。', de: 'Ich hätte gern einen Kaffee.' }
          }
        ]
      }
    ]
  },
  'reported_speech': {
    title: {
      en: 'Reported Speech Basics',
      zh: '间接引语入门',
      de: 'Indirekte Rede (Grundlagen)'
    },
    description: {
      en: 'Summarize what someone said.',
      zh: '转述他人所说。',
      de: 'Wiedergabe dessen, was jemand gesagt hat.'
    },
    sections: [
      {
        title: {
          en: 'That-Clauses',
          zh: 'dass 从句',
          de: 'dass-Sätze'
        },
        content: {
          en: 'Use "dass" and shift the verb to the end.',
          zh: '用 dass 引导，从句动词置尾。',
          de: 'Mit „dass“ und Verb am Ende.'
        },
        example: [
          {
            de: 'Er sagt, dass er keine Zeit hat.',
            translations: { en: 'He says that he has no time.', zh: '他说他没有时间。', de: 'Er sagt, dass er keine Zeit hat.' }
          }
        ]
      }
    ]
  },
  'narrative_prateritum': {
    title: {
      en: 'Narrative Past (Präteritum)',
      zh: '叙述过去时（Präteritum）',
      de: 'Erzähltempus (Präteritum)'
    },
    description: {
      en: 'Used in stories, literature, and formal writing.',
      zh: '用于故事、文学与正式写作。',
      de: 'In Erzählungen, Literatur und formellem Schreiben.'
    },
    sections: [
      {
        title: {
          en: 'Common Verbs',
          zh: '常见动词',
          de: 'Häufige Verben'
        },
        content: {
          en: 'sein → war, haben → hatte, gehen → ging, kommen → kam.',
          zh: 'sein→war, haben→hatte, gehen→ging, kommen→kam。',
          de: 'sein → war, haben → hatte, gehen → ging, kommen → kam.'
        }
      },
      {
        title: {
          en: 'Literary Snapshot',
          zh: '文学片段',
          de: 'Literarischer Moment'
        },
        content: {
          en: 'Short scenes often chain Präteritum sentences for mood.',
          zh: '短场景常用 Präteritum 形成叙事氛围。',
          de: 'Kurze Szenen nutzen Präteritum für Atmosphäre.'
        },
        example: [
          {
            de: 'Der Wind wehte leise, und die Straße lag still.',
            translations: {
              en: 'The wind blew softly, and the street lay quiet.',
              zh: '风轻轻吹着，街道一片寂静。',
              de: 'Der Wind wehte leise, und die Straße lag still.'
            }
          }
        ]
      }
    ]
  },
  'n_declension': {
    title: {
      en: 'N-Declension Nouns',
      zh: '弱变化名词',
      de: 'N-Deklination'
    },
    description: {
      en: 'Some masculine nouns add -n/-en in all cases except nominative.',
      zh: '部分阳性名词除主格外都加 -n/-en。',
      de: 'Einige maskuline Nomen erhalten -n/-en in allen Fällen außer Nominativ.'
    },
    sections: [
      {
        title: {
          en: 'Examples',
          zh: '例子',
          de: 'Beispiele'
        },
        content: {
          en: 'der Student → den Studenten, dem Studenten.',
          zh: 'der Student → den Studenten, dem Studenten。',
          de: 'der Student → den Studenten, dem Studenten.'
        },
        example: [
          {
            de: 'Ich sehe den Studenten.',
            translations: { en: 'I see the student.', zh: '我看到那位学生。', de: 'Ich sehe den Studenten.' }
          }
        ]
      }
    ]
  }
};
