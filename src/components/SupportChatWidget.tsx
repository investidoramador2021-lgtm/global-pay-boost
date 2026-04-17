import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

/* ── Cultural avatar imports ── */
import oliverImg from "@/assets/concierge-oliver.jpg";
import elenaImg from "@/assets/concierge-elena.jpg";
import gabrielImg from "@/assets/concierge-gabriel.jpg";
import kenjiImg from "@/assets/concierge-kenji.jpg";
import chloeImg from "@/assets/concierge-chloe.jpg";
import canImg from "@/assets/concierge-can.jpg";
import arjunImg from "@/assets/concierge-arjun.jpg";
import linhImg from "@/assets/concierge-linh.jpg";
import johanImg from "@/assets/concierge-johan.jpg";
import amirImg from "@/assets/concierge-amir.jpg";
import fatimaImg from "@/assets/concierge-fatima.jpg";
import noaImg from "@/assets/concierge-noa.jpg";
import oksanaImg from "@/assets/concierge-oksana.jpg";

/* ── 13-Language Cultural Persona Map ── */
type Persona = { name: string; role: string; img: string };

const CULTURAL_PERSONAS: Record<string, Persona> = {
  en: { name: "Oliver", role: "Concierge", img: oliverImg },
  es: { name: "Elena", role: "Concierge", img: elenaImg },
  pt: { name: "Gabriel", role: "Concierge", img: gabrielImg },
  ja: { name: "Kenji", role: "Concierge", img: kenjiImg },
  fr: { name: "Chloé", role: "Concierge", img: chloeImg },
  tr: { name: "Can", role: "Concierge", img: canImg },
  hi: { name: "Arjun", role: "Concierge", img: arjunImg },
  vi: { name: "Linh", role: "Concierge", img: linhImg },
  af: { name: "Johan", role: "Concierge", img: johanImg },
  fa: { name: "Amir", role: "Concierge", img: amirImg },
  ur: { name: "Fatima", role: "Concierge", img: fatimaImg },
  he: { name: "Noa", role: "Concierge", img: noaImg },
  uk: { name: "Oksana", role: "Concierge", img: oksanaImg },
};

function getPersonaForLang(lang: string): Persona {
  return CULTURAL_PERSONAS[lang] || CULTURAL_PERSONAS.en;
}

type Msg = { role: "user" | "assistant"; content: string };

function randomDelay(min: number, max: number) {
  return new Promise<void>((r) => setTimeout(r, min + Math.random() * (max - min)));
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chat`;

function genSessionId() {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Seed phrase / private key detection ── */
const BIP39_PATTERN = /\b(?:abandon|ability|able|about|above|absent|absorb|abstract|absurd|abuse|access|accident|account|accuse|achieve|acid|acoustic|acquire|across|act|action|actual|adapt|add|addict|address|adjust|admit|adult|advance|advice|aerobic|affair|afford|afraid|again|age|agent|agree|ahead|aim|air|airport|aisle|alarm|album|alcohol|alert|alien|all|alley|allow|almost|alone|alpha|already|also|alter|always|amateur|amazing|among|amount|amused|analyst|anchor|ancient|anger|angle|angry|animal|ankle|announce|annual|another|answer|antenna|antique|anxiety|any|apart|apology|appear|apple|approve|april|arch|arctic|area|arena|argue|arm|armed|armor|army|around|arrange|arrest|arrive|arrow|art|artefact|artist|artwork|ask|aspect|assault|asset|assist|assume|asthma|athlete|atom|attack|attend|attitude|attract|auction|audit|august|aunt|author|auto|autumn|average|avocado|avoid|awake|aware|awesome|awful|awkward|axis)\b/gi;

function looksLikeSeedPhrase(text: string): boolean {
  const words = text.trim().split(/\s+/);
  if (words.length >= 12 && words.length <= 24) {
    const bip39Match = text.match(BIP39_PATTERN);
    if (bip39Match && bip39Match.length >= 10) return true;
  }
  if (/^(0x)?[0-9a-fA-F]{64}$/.test(text.trim())) return true;
  if (/^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/.test(text.trim())) return true;
  return false;
}

const SEED_WARNINGS: Record<string, string> = {
  en: "⚠️ **STOP** — Never share your private keys or seed phrases with anyone, including support. Your funds could be stolen. Please secure your wallet immediately. This message has been removed for your safety.",
  es: "⚠️ **ALTO** — Nunca comparta sus claves privadas o frases semilla con nadie. Sus fondos podrían ser robados. Asegure su billetera de inmediato.",
  pt: "⚠️ **PARE** — Nunca compartilhe suas chaves privadas ou frases de recuperação com ninguém. Seus fundos podem ser roubados. Proteja sua carteira imediatamente.",
  fr: "⚠️ **ARRÊTEZ** — Ne partagez jamais vos clés privées ou phrases de récupération avec quiconque. Vos fonds pourraient être volés. Sécurisez votre portefeuille immédiatement.",
  ja: "⚠️ **停止** — 秘密鍵やシードフレーズは絶対に誰にも共有しないでください。資金が盗まれる可能性があります。直ちにウォレットを保護してください。",
  tr: "⚠️ **DURUN** — Özel anahtarlarınızı veya tohum ifadelerinizi destek dahil kimseyle paylaşmayın. Fonlarınız çalınabilir.",
  hi: "⚠️ **रुकें** — अपनी निजी कुंजी या सीड फ्रेज़ किसी के साथ साझा न करें। आपके फंड चुराए जा सकते हैं।",
  vi: "⚠️ **DỪNG LẠI** — Không bao giờ chia sẻ khóa riêng hoặc cụm từ hạt giống của bạn với bất kỳ ai.",
  af: "⚠️ **STOP** — Moet nooit u private sleutels of saadfrases met enigiemand deel nie.",
  fa: "⚠️ **توقف** — هرگز کلیدهای خصوصی یا عبارات بازیابی خود را با کسی به اشتراک نگذارید.",
  ur: "⚠️ **رکیں** — اپنی نجی کلیدیں یا سیڈ فریز کبھی کسی کے ساتھ شیئر نہ کریں۔",
  he: "⚠️ **עצור** — לעולם אל תשתף את המפתחות הפרטיים או ביטויי הזרע שלך עם אף אחד.",
  uk: "⚠️ **СТОП** — Ніколи не діліться приватними ключами або сід-фразами з будь-ким.",
};

/* ── Proactive engagement messages ── */
const PROACTIVE_MESSAGES: Record<string, (name: string) => string> = {
  en: (n) => `I'm ${n}. I can handle the technical setup for you — just type what you want to do (e.g., "Swap 1 ETH to SOL") or paste your wallet address, and I'll configure the form step-by-step.`,
  es: (n) => `Soy ${n}. Puedo configurar todo por usted — solo escriba lo que desea hacer (ej., "Cambiar 1 ETH a SOL") o pegue su dirección de wallet.`,
  pt: (n) => `Sou ${n}. Posso cuidar da parte técnica — basta digitar o que deseja fazer (ex., "Trocar 1 ETH por SOL") ou cole seu endereço de carteira.`,
  fr: (n) => `Je suis ${n}. Je peux gérer la configuration technique — tapez simplement ce que vous souhaitez faire (ex., "Échanger 1 ETH en SOL") ou collez votre adresse de portefeuille.`,
  ja: (n) => `${n}です。技術的な設定を代行いたします — やりたいことを入力してください（例：「1 ETHをSOLに交換」）。ウォレットアドレスを貼り付けていただいてもOKです。`,
  tr: (n) => `Ben ${n}. Teknik kurulumu sizin için yapabilirim — ne yapmak istediğinizi yazın (ör., "1 ETH'yi SOL'a çevir") veya cüzdan adresinizi yapıştırın.`,
  hi: (n) => `मैं ${n} हूँ। मैं आपके लिए तकनीकी सेटअप कर सकता/सकती हूँ — बस बताएं क्या करना है (जैसे, "1 ETH को SOL में बदलें") या अपना वॉलेट पता पेस्ट करें।`,
  vi: (n) => `Tôi là ${n}. Tôi có thể xử lý phần kỹ thuật cho bạn — chỉ cần gõ những gì bạn muốn làm (ví dụ: "Đổi 1 ETH sang SOL") hoặc dán địa chỉ ví của bạn.`,
  af: (n) => `Ek is ${n}. Ek kan die tegniese opstelling vir jou hanteer — tik net wat jy wil doen (bv., "Verruil 1 ETH vir SOL") of plak jou beursie-adres.`,
  fa: (n) => `من ${n} هستم. می‌توانم تنظیمات فنی را برایتان انجام دهم — فقط بنویسید چه کاری می‌خواهید انجام دهید (مثلاً "تبدیل 1 ETH به SOL").`,
  ur: (n) => `میں ${n} ہوں۔ میں آپ کے لیے تکنیکی سیٹ اپ کر سکتا/سکتی ہوں — بس لکھیں کیا کرنا ہے (جیسے، "1 ETH کو SOL میں تبدیل کریں")۔`,
  he: (n) => `אני ${n}. אני יכול/ה לטפל בהגדרה הטכנית בשבילך — רק כתוב/י מה ברצונך לעשות (לדוגמה, "להמיר 1 ETH ל-SOL") או הדבק/י כתובת ארנק.`,
  uk: (n) => `Я ${n}. Можу все налаштувати за вас — просто напишіть, що хочете зробити (наприклад, "Обміняти 1 ETH на SOL") або вставте адресу гаманця.`,
};

const WELCOME_MESSAGES: Record<string, (name: string) => string> = {
  en: (n) => `Welcome to MRC GlobalPay! I'm ${n}, your personal concierge. I can help you with **Swaps, Buying crypto, Private Transfers, Bridges, Invoices, Loans, and Earning yield**. What would you like to do today?`,
  es: (n) => `¡Bienvenido a MRC GlobalPay! Soy ${n}, su concierge personal. Puedo ayudarle con **Intercambios, Compra de cripto, Transferencias Privadas, Puentes, Facturas, Préstamos y Ganancias**. ¿Qué desea hacer hoy?`,
  pt: (n) => `Bem-vindo ao MRC GlobalPay! Sou ${n}, seu concierge pessoal. Posso ajudá-lo com **Trocas, Compra de cripto, Transferências Privadas, Bridges, Faturas, Empréstimos e Rendimentos**. O que deseja fazer hoje?`,
  fr: (n) => `Bienvenue chez MRC GlobalPay ! Je suis ${n}, votre concierge personnel. Je peux vous aider avec **les Échanges, l'Achat de crypto, les Transferts Privés, les Ponts, les Factures, les Prêts et les Rendements**. Comment puis-je vous assister ?`,
  ja: (n) => `MRC GlobalPayへようこそ！${n}です。**スワップ、暗号購入、プライベート送金、ブリッジ、請求書、ローン、利回り運用**のお手伝いができます。今日は何をされますか？`,
  tr: (n) => `MRC GlobalPay'e hoş geldiniz! Ben ${n}, kişisel danışmanınız. **Takas, Kripto Satın Alma, Özel Transfer, Köprü, Fatura, Kredi ve Kazanç** konularında yardımcı olabilirim. Bugün ne yapmak istersiniz?`,
  hi: (n) => `MRC GlobalPay में आपका स्वागत है! मैं ${n} हूँ। मैं **स्वैप, क्रिप्टो खरीद, प्राइवेट ट्रांसफर, ब्रिज, इनवॉइस, लोन और अर्निंग** में मदद कर सकता/सकती हूँ। आज क्या करना चाहेंगे?`,
  vi: (n) => `Chào mừng đến MRC GlobalPay! Tôi là ${n}. Tôi có thể hỗ trợ bạn với **Hoán đổi, Mua crypto, Chuyển khoản Riêng tư, Cầu nối, Hóa đơn, Vay và Kiếm lợi nhuận**. Bạn muốn làm gì hôm nay?`,
  af: (n) => `Welkom by MRC GlobalPay! Ek is ${n}. Ek kan jou help met **Ruil, Kripto Koop, Privaat Oordrag, Brug, Faktuur, Lenings en Verdienste**. Wat wil jy vandag doen?`,
  fa: (n) => `به MRC GlobalPay خوش آمدید! من ${n} هستم. می‌توانم در **مبادله، خرید کریپتو، انتقال خصوصی، پل، فاکتور، وام و کسب سود** کمکتان کنم. امروز چه کاری می‌خواهید انجام دهید؟`,
  ur: (n) => `MRC GlobalPay میں خوش آمدید! میں ${n} ہوں۔ میں **سواپ، کرپٹو خرید، پرائیویٹ ٹرانسفر، برج، انوائس، لون اور کمائی** میں مدد کر سکتا/سکتی ہوں۔ آج کیا کرنا چاہیں گے?`,
  he: (n) => `ברוכים הבאים ל-MRC GlobalPay! אני ${n}. אני יכול/ה לעזור עם **המרות, קניית קריפטו, העברות פרטיות, גשרים, חשבוניות, הלוואות ותשואה**. מה תרצה/י לעשות היום?`,
  uk: (n) => `Ласкаво просимо до MRC GlobalPay! Я ${n}. Можу допомогти зі **Свопами, Купівлею крипто, Приватними переказами, Мостами, Інвойсами, Кредитами та Заробітком**. Що бажаєте зробити сьогодні?`,
};

/* ── Tab-aware contextual messages ── */
type WidgetMode = "exchange" | "buysell" | "private" | "bridge" | "request";

const TAB_CONTEXT_MESSAGES: Record<string, Record<WidgetMode, string>> = {
  en: {
    exchange: "I see you're looking at **Crypto Swaps**! I can help you find the best rates, explain fees, or walk you through the process step-by-step. What coins are you looking to swap?",
    buysell: "You're on the **Buy Crypto** tab! I can guide you through purchasing crypto with your local currency — via card, SEPA, PIX, or other methods. What would you like to buy?",
    private: "Interested in **Private Transfers**? I can explain how our shielded routing works to protect your transaction privacy. How much are you looking to transfer?",
    bridge: "You're exploring **Permanent Bridges**! I can help you set up a fixed deposit address for recurring cross-chain transfers. Which networks do you need to bridge?",
    request: "Looking at **Invoices**? I can help you create a professional crypto invoice to request payment from anyone. Who do you need to invoice?",
  },
  es: {
    exchange: "¡Veo que está explorando los **Intercambios Cripto**! Puedo ayudarle a encontrar las mejores tasas y guiarle paso a paso. ¿Qué monedas desea intercambiar?",
    buysell: "¡Está en la pestaña de **Compra de Cripto**! Puedo guiarle para comprar con su moneda local — tarjeta, SEPA, PIX u otros métodos. ¿Qué desea comprar?",
    private: "¿Interesado en **Transferencias Privadas**? Puedo explicar cómo funciona nuestro enrutamiento protegido. ¿Cuánto desea transferir?",
    bridge: "¡Está explorando **Puentes Permanentes**! Puedo ayudarle a configurar una dirección fija para transferencias recurrentes. ¿Qué redes necesita conectar?",
    request: "¿Está viendo **Facturas**? Puedo ayudarle a crear una factura cripto profesional. ¿A quién necesita facturar?",
  },
  pt: {
    exchange: "Vejo que está explorando **Trocas Cripto**! Posso ajudar a encontrar as melhores taxas. Quais moedas deseja trocar?",
    buysell: "Está na aba de **Compra de Cripto**! Posso guiá-lo na compra com sua moeda local — cartão, SEPA, PIX. O que deseja comprar?",
    private: "Interessado em **Transferências Privadas**? Posso explicar como funciona nosso roteamento protegido. Quanto deseja transferir?",
    bridge: "Explorando **Bridges Permanentes**! Posso ajudar a configurar um endereço fixo. Quais redes precisa conectar?",
    request: "Vendo **Faturas**? Posso ajudar a criar uma fatura cripto profissional. Para quem precisa faturar?",
  },
  fr: {
    exchange: "Je vois que vous explorez les **Échanges Crypto** ! Je peux vous aider à trouver les meilleurs taux. Quelles cryptos souhaitez-vous échanger ?",
    buysell: "Vous êtes sur l'onglet **Achat Crypto** ! Je peux vous guider pour acheter avec votre monnaie locale. Que souhaitez-vous acheter ?",
    private: "Intéressé par les **Transferts Privés** ? Je peux expliquer notre routage protégé. Combien souhaitez-vous transférer ?",
    bridge: "Vous explorez les **Ponts Permanents** ! Je peux vous aider à configurer une adresse fixe. Quels réseaux avez-vous besoin de relier ?",
    request: "Vous consultez les **Factures** ? Je peux vous aider à créer une facture crypto professionnelle. Qui devez-vous facturer ?",
  },
  ja: {
    exchange: "**暗号スワップ**をご覧ですね！最適なレートを見つけるお手伝いができます。どのコインをスワップしたいですか？",
    buysell: "**暗号購入**タブですね！現地通貨での購入をガイドします。何を購入したいですか？",
    private: "**プライベート送金**に興味がありますか？シールドルーティングについて説明します。いくら送金したいですか？",
    bridge: "**パーマネントブリッジ**を探索中ですね！固定アドレスの設定をお手伝いします。どのネットワークを接続しますか？",
    request: "**請求書**をご覧ですね！プロフェッショナルな暗号請求書の作成をお手伝いします。誰に請求しますか？",
  },
  tr: {
    exchange: "**Kripto Takas** sekmesine bakıyorsunuz! En iyi kurları bulmada yardımcı olabilirim. Hangi coinleri takas etmek istiyorsunuz?",
    buysell: "**Kripto Satın Al** sekmesinde! Yerel para biriminizle satın alma konusunda rehberlik edebilirim. Ne almak istiyorsunuz?",
    private: "**Özel Transfer** ile ilgileniyor musunuz? Korumalı yönlendirmemizi açıklayabilirim. Ne kadar transfer etmek istiyorsunuz?",
    bridge: "**Kalıcı Köprü** keşfediyorsunuz! Sabit adres kurulumunda yardımcı olabilirim. Hangi ağları bağlamanız gerekiyor?",
    request: "**Fatura** sekmesine bakıyorsunuz! Profesyonel bir kripto fatura oluşturmanıza yardımcı olabilirim.",
  },
  hi: {
    exchange: "मैं देख रहा/रही हूँ कि आप **क्रिप्टो स्वैप** देख रहे हैं! मैं सबसे अच्छी दरें खोजने में मदद कर सकता/सकती हूँ। कौन से कॉइन स्वैप करना चाहेंगे?",
    buysell: "आप **क्रिप्टो खरीद** टैब पर हैं! मैं स्थानीय मुद्रा से खरीदने में गाइड कर सकता/सकती हूँ। क्या खरीदना चाहेंगे?",
    private: "**प्राइवेट ट्रांसफर** में रुचि है? मैं शील्डेड रूटिंग समझा सकता/सकती हूँ। कितना ट्रांसफर करना चाहेंगे?",
    bridge: "**परमानेंट ब्रिज** एक्सप्लोर कर रहे हैं! फिक्स्ड एड्रेस सेटअप में मदद कर सकता/सकती हूँ।",
    request: "**इनवॉइस** देख रहे हैं? प्रोफेशनल क्रिप्टो इनवॉइस बनाने में मदद कर सकता/सकती हूँ।",
  },
  vi: {
    exchange: "Tôi thấy bạn đang xem **Hoán đổi Crypto**! Tôi có thể giúp tìm tỷ giá tốt nhất. Bạn muốn đổi coin nào?",
    buysell: "Bạn đang ở tab **Mua Crypto**! Tôi có thể hướng dẫn mua bằng tiền địa phương. Bạn muốn mua gì?",
    private: "Quan tâm đến **Chuyển khoản Riêng tư**? Tôi có thể giải thích cách hoạt động. Bạn muốn chuyển bao nhiêu?",
    bridge: "Bạn đang khám phá **Cầu nối Vĩnh viễn**! Tôi có thể giúp thiết lập địa chỉ cố định.",
    request: "Đang xem **Hóa đơn**? Tôi có thể giúp tạo hóa đơn crypto chuyên nghiệp.",
  },
  af: {
    exchange: "Ek sien jy kyk na **Kripto Ruil**! Ek kan help om die beste koerse te vind. Watter munte wil jy ruil?",
    buysell: "Jy is op die **Kripto Koop** oortjie! Ek kan jou lei om met jou plaaslike geldeenheid te koop.",
    private: "Belangstel in **Privaat Oordrag**? Ek kan verduidelik hoe ons beskermde roeting werk.",
    bridge: "Jy verken **Permanente Brûe**! Ek kan help met vaste adres-opstelling.",
    request: "Kyk na **Fakture**? Ek kan help om 'n professionele kripto-faktuur te skep.",
  },
  fa: {
    exchange: "می‌بینم که به **مبادله کریپتو** نگاه می‌کنید! می‌توانم بهترین نرخ‌ها را پیدا کنم. کدام کوین‌ها را می‌خواهید مبادله کنید؟",
    buysell: "در تب **خرید کریپتو** هستید! می‌توانم راهنمایی خرید با ارز محلی کنم.",
    private: "به **انتقال خصوصی** علاقه‌مندید؟ می‌توانم مسیریابی محافظت‌شده را توضیح دهم.",
    bridge: "در حال بررسی **پل دائمی** هستید! می‌توانم آدرس ثابت تنظیم کنم.",
    request: "**فاکتور** می‌بینید؟ می‌توانم فاکتور کریپتو حرفه‌ای بسازم.",
  },
  ur: {
    exchange: "میں دیکھ رہا/رہی ہوں کہ آپ **کرپٹو سواپ** دیکھ رہے ہیں! بہترین ریٹ تلاش کرنے میں مدد کر سکتا/سکتی ہوں۔",
    buysell: "آپ **کرپٹو خرید** ٹیب پر ہیں! مقامی کرنسی سے خریدنے میں رہنمائی کر سکتا/سکتی ہوں۔",
    private: "**پرائیویٹ ٹرانسفر** میں دلچسپی ہے؟ شیلڈڈ روٹنگ سمجھا سکتا/سکتی ہوں۔",
    bridge: "**پرمننٹ برج** دیکھ رہے ہیں! فکسڈ ایڈریس سیٹ اپ میں مدد کر سکتا/سکتی ہوں۔",
    request: "**انوائس** دیکھ رہے ہیں؟ پروفیشنل کرپٹو انوائس بنانے میں مدد کر سکتا/سکتی ہوں۔",
  },
  he: {
    exchange: "אני רואה שאתה בודק **המרות קריפטו**! אוכל לעזור למצוא את השערים הטובים ביותר. אילו מטבעות ברצונך להמיר?",
    buysell: "אתה בלשונית **קניית קריפטו**! אוכל להדריך ברכישה במטבע המקומי שלך.",
    private: "מעוניין ב**העברות פרטיות**? אוכל להסביר כיצד הניתוב המוגן שלנו עובד.",
    bridge: "בודק **גשרים קבועים**! אוכל לעזור בהגדרת כתובת קבועה.",
    request: "בודק **חשבוניות**? אוכל לעזור ליצור חשבונית קריפטו מקצועית.",
  },
  uk: {
    exchange: "Бачу, ви дивитесь на **Крипто Свопи**! Можу допомогти знайти найкращі курси. Які монети хочете обміняти?",
    buysell: "Ви на вкладці **Купівля Крипто**! Можу провести через покупку у вашій місцевій валюті.",
    private: "Цікавить **Приватний Переказ**? Можу пояснити як працює захищена маршрутизація.",
    bridge: "Досліджуєте **Постійні Мости**! Можу допомогти налаштувати фіксовану адресу.",
    request: "Дивитесь на **Інвойси**? Можу допомогти створити професійний крипто-інвойс.",
  },
};

/* ── Page-aware welcome overrides (affiliates / partner program) ── */
const AFFILIATE_WELCOME: Record<string, (name: string) => string> = {
  en: (n) => `Hi, I'm ${n}! I see you're checking out our **Partner Program** 🎯 — earn **50% of MRC's revenue in BTC** every time someone swaps through your link or widget. Want me to walk you through generating your widget (it's translated into 13 languages — something no other affiliate widget offers) or help you register in under 60 seconds?`,
  es: (n) => `¡Hola, soy ${n}! Veo que está explorando nuestro **Programa de Socios** 🎯 — gane el **50% de los ingresos de MRC en BTC** por cada intercambio referido. ¿Le ayudo a generar su widget (traducido a 13 idiomas — único en el mercado) o a registrarse en menos de 60 segundos?`,
  pt: (n) => `Olá, sou ${n}! Vejo que está explorando nosso **Programa de Parceiros** 🎯 — ganhe **50% da receita da MRC em BTC** a cada swap referido. Posso ajudar a gerar seu widget (traduzido em 13 idiomas — único no mercado) ou registrar em menos de 60 segundos?`,
  fr: (n) => `Bonjour, je suis ${n} ! Je vois que vous explorez notre **Programme Partenaire** 🎯 — gagnez **50% des revenus MRC en BTC** sur chaque swap référé. Je vous aide à générer votre widget (traduit en 13 langues — unique sur le marché) ou à vous inscrire en moins de 60 secondes ?`,
  ja: (n) => `こんにちは、${n}です！**パートナープログラム**をご覧ですね 🎯 — 紹介スワップごとに **MRCの収益の50%をBTCで獲得**できます。13言語に翻訳されたウィジェット（業界唯一）の生成、または60秒以内の登録をお手伝いしましょうか？`,
  tr: (n) => `Merhaba, ben ${n}! **Partner Programı**na göz attığınızı görüyorum 🎯 — yönlendirdiğiniz her takastan **MRC gelirinin %50'sini BTC olarak** kazanın. 13 dile çevrilmiş widget'ınızı oluşturmanıza (sektörde tek) veya 60 saniyede kaydolmanıza yardımcı olayım mı?`,
  hi: (n) => `नमस्ते, मैं ${n} हूँ! आप हमारे **पार्टनर प्रोग्राम** को देख रहे हैं 🎯 — हर रेफर किए गए स्वैप पर **MRC के राजस्व का 50% BTC में** कमाएँ। 13 भाषाओं में अनुवादित विजेट जनरेट करने (इंडस्ट्री में अनोखा) या 60 सेकंड में रजिस्टर करने में मदद करूँ?`,
  vi: (n) => `Chào, tôi là ${n}! Bạn đang xem **Chương trình Đối tác** 🎯 — kiếm **50% doanh thu MRC bằng BTC** cho mỗi swap được giới thiệu. Tôi hỗ trợ bạn tạo widget (dịch ra 13 ngôn ngữ — duy nhất trên thị trường) hoặc đăng ký dưới 60 giây nhé?`,
  af: (n) => `Hallo, ek is ${n}! Ek sien jy kyk na ons **Vennoot Program** 🎯 — verdien **50% van MRC se inkomste in BTC** vir elke verwysde ruil. Sal ek help om jou widget (vertaal in 13 tale — uniek in die mark) te genereer of jou binne 60 sekondes te registreer?`,
  fa: (n) => `سلام، من ${n} هستم! می‌بینم که **برنامه شرکا** را بررسی می‌کنید 🎯 — برای هر مبادله ارجاعی، **۵۰٪ درآمد MRC را به BTC** کسب کنید. ویجت ترجمه‌شده به ۱۳ زبان (منحصربه‌فرد در بازار) را تولید کنیم یا در کمتر از ۶۰ ثانیه ثبت‌نام کنیم؟`,
  ur: (n) => `سلام، میں ${n} ہوں! آپ ہمارے **پارٹنر پروگرام** کو دیکھ رہے ہیں 🎯 — ہر ریفرڈ سواپ پر **MRC کی آمدنی کا 50% BTC میں** کمائیں۔ 13 زبانوں میں ترجمہ شدہ ویجٹ (مارکیٹ میں منفرد) بنانے یا 60 سیکنڈ میں رجسٹر ہونے میں مدد کروں؟`,
  he: (n) => `שלום, אני ${n}! אני רואה שאתה בודק את **תכנית השותפים** שלנו 🎯 — הרווח/י **50% מהכנסות MRC ב-BTC** על כל המרה שתפנה/י. שאעזור לך ליצור את הווידג'ט (מתורגם ל-13 שפות — ייחודי בשוק) או להירשם תוך 60 שניות?`,
  uk: (n) => `Привіт, я ${n}! Бачу, ви розглядаєте нашу **Партнерську Програму** 🎯 — заробляйте **50% доходу MRC у BTC** з кожного реферального обміну. Допомогти згенерувати ваш віджет (перекладений 13 мовами — єдиний на ринку) або зареєструватись за 60 секунд?`,
};

function isAffiliateRoute(pathname: string): boolean {
  const stripped = pathname.replace(/^\/(en|es|pt|fr|ja|tr|hi|vi|af|fa|ur|he|uk)(\/|$)/, "/");
  return stripped.startsWith("/affiliates") || stripped.startsWith("/partners") || stripped.startsWith("/referral");
}

/* ── Pages that trigger proactive popup ── */
const TOOL_PAGES = ["/", "/bridge", "/private-transfer", "/affiliates", "/partners"];

const SupportChatWidget = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(genSessionId);
  const [proactiveShown, setProactiveShown] = useState(false);
  const [proactiveDismissed, setProactiveDismissed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const proactiveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lang = i18n.language?.split("-")[0] || "en";

  // Get the culturally appropriate persona based on detected language
  const currentPersona = getPersonaForLang(lang);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Welcome message — reset when language or route changes; affiliates page gets a sales-pitch greeting
  useEffect(() => {
    if (open && messages.length === 0) {
      const onAffiliates = isAffiliateRoute(location.pathname);
      const greetMap = onAffiliates ? AFFILIATE_WELCOME : WELCOME_MESSAGES;
      const greet = greetMap[lang] || greetMap.en;
      setMessages([{ role: "assistant", content: greet(currentPersona.name) }]);
    }
  }, [open, lang, location.pathname]);

  /* ── Listen for widget tab changes and inject contextual message ── */
  useEffect(() => {
    const handler = (e: Event) => {
      if (!open) return; // only when chat is open
      const tab = (e as CustomEvent).detail as WidgetMode;
      const tabMsgs = TAB_CONTEXT_MESSAGES[lang] || TAB_CONTEXT_MESSAGES.en;
      const msg = tabMsgs[tab];
      if (msg) {
        setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
      }
    };
    window.addEventListener("mrc-widget-tab-change", handler);
    return () => window.removeEventListener("mrc-widget-tab-change", handler);
  }, [open, lang]);

  /* ── Proactive 10-second popup on tool pages ── */
  useEffect(() => {
    if (open || proactiveDismissed || proactiveShown) return;

    const isToolPage = TOOL_PAGES.some((p) => location.pathname === p || location.pathname.startsWith(`/${lang}${p === "/" ? "" : p}`));
    if (!isToolPage) return;

    proactiveTimer.current = setTimeout(() => {
      if (!open && !proactiveDismissed) {
        setProactiveShown(true);
        window.dispatchEvent(new CustomEvent("mrc-highlight-send-box"));
      }
    }, 10000);

    return () => {
      if (proactiveTimer.current) clearTimeout(proactiveTimer.current);
    };
  }, [location.pathname, open, proactiveDismissed, proactiveShown, lang]);

  const handleProactiveAccept = () => {
    setProactiveShown(false);
    setProactiveDismissed(true);
    setOpen(true);
  };

  const handleProactiveDismiss = () => {
    setProactiveShown(false);
    setProactiveDismissed(true);
  };

  const saveLog = useCallback(
    async (userMsg: string, aiMsg: string) => {
      try {
        await supabase.from("support_chat_logs" as any).insert({
          session_id: sessionId,
          persona_name: currentPersona.name,
          user_message: userMsg,
          ai_response: aiMsg,
          page_url: window.location.pathname,
        } as any);
      } catch {
        /* silent */
      }
    },
    [sessionId, currentPersona.name]
  );

  const updateAssistant = (text: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
        return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: text } : m));
      }
      return [...prev, { role: "assistant", content: text }];
    });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    // ── SEED PHRASE / PRIVATE KEY GUARDRAIL ──
    if (looksLikeSeedPhrase(text)) {
      const warning = SEED_WARNINGS[lang] || SEED_WARNINGS.en;
      setMessages((prev) => [...prev, { role: "assistant", content: warning }]);
      return;
    }

    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const allMessages = [...messages, userMsg].filter((m) => m.role === "user" || m.role === "assistant");

    try {
      await randomDelay(800, 2000);

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, persona: currentPersona.name, language: lang }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = "";
      const tokenQueue: string[] = [];
      let streamDone = false;
      let fullResponse = "";

      const readStream = async () => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) { streamDone = true; break; }
          sseBuffer += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = sseBuffer.indexOf("\n")) !== -1) {
            let line = sseBuffer.slice(0, idx);
            sseBuffer = sseBuffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") { streamDone = true; return; }
            try {
              const parsed = JSON.parse(json);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) tokenQueue.push(content);
            } catch {
              sseBuffer = line + "\n" + sseBuffer;
              break;
            }
          }
        }
      };

      const drip = async () => {
        let displayed = "";
        while (!streamDone || tokenQueue.length > 0) {
          if (tokenQueue.length > 0) {
            const chunk = tokenQueue.shift()!;
            const chars = chunk.split("");
            for (const char of chars) {
              displayed += char;
              fullResponse = displayed;
              updateAssistant(displayed);
              if (".!?".includes(char)) {
                await randomDelay(120, 350);
              } else if (char === ",") {
                await randomDelay(60, 150);
              } else if (char === "\n") {
                await randomDelay(100, 250);
              } else {
                await randomDelay(15, 45);
              }
            }
          } else {
            await randomDelay(30, 60);
          }
        }
      };

      await Promise.all([readStream(), drip()]);

      if (fullResponse) saveLog(text, fullResponse);
    } catch {
      const fallback = "I'm sorry, I'm having trouble connecting right now. Please try again or email support@mrc-pay.com.";
      setMessages((prev) => [...prev, { role: "assistant", content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const p = currentPersona;

  return (
    <>
      {/* ── Proactive popup bubble ── */}
      {proactiveShown && !open && (
        <div className="fixed bottom-36 right-4 z-50 md:bottom-24 md:right-6 w-[calc(100vw-32px)] max-w-[340px] animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="relative rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] p-4">
            <div className="absolute -bottom-2 right-6 w-4 h-4 rotate-45 bg-card/95 border-r border-b border-border/60" />
            <div className="flex items-start gap-3">
              <img
                src={p.img}
                alt={p.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30 flex-shrink-0"
                width={40}
                height={40}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground mb-1">{p.name} · <span className="text-primary">{p.role}</span></p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {(PROACTIVE_MESSAGES[lang] || PROACTIVE_MESSAGES.en)(p.name)}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleProactiveAccept} className="flex-1 rounded-xl text-xs h-8">
                Chat Now
              </Button>
              <Button size="sm" variant="ghost" onClick={handleProactiveDismiss} className="rounded-xl text-xs h-8 text-muted-foreground">
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setProactiveShown(false); setProactiveDismissed(true); }}
          className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.5)] flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Open support chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-2 z-50 md:bottom-6 md:right-6 w-[calc(100vw-16px)] max-w-[400px] h-[520px] rounded-2xl border border-border/60 bg-background shadow-[0_8px_40px_-12px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-card/80 backdrop-blur-sm border-b border-border/40">
            <div className="relative">
              <img
                src={p.img}
                alt={p.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30"
                width={40}
                height={40}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary ring-2 ring-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.role} · Online</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <img src={p.img} alt="" className="w-7 h-7 rounded-full object-cover mt-1 flex-shrink-0" width={28} height={28} />
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/60 text-foreground rounded-bl-md"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-1 [&>p:last-child]:mb-0">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2">
                <img src={p.img} alt="" className="w-7 h-7 rounded-full object-cover mt-1" width={28} height={28} />
                <div className="bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border/40 bg-card/60 backdrop-blur-sm px-3 py-2.5">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message…"
                rows={1}
                className="flex-1 resize-none bg-muted/40 border border-border/40 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 max-h-24"
              />
              <Button
                size="icon"
                className="h-10 w-10 rounded-xl flex-shrink-0"
                onClick={send}
                disabled={!input.trim() || loading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-center">
              MRC GlobalPay Concierge · Available 24/7
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportChatWidget;
