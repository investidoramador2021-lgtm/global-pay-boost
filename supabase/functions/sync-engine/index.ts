import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/* ─────────── SEO Template Variations (20 templates × 13 languages) ─────────── */

const LANGS = ["en","es","pt","fr","ja","fa","ur","he","af","hi","vi","tr","uk"] as const;

// 20 title templates per language – {from} and {to} are interpolated
const TITLE_TEMPLATES: Record<string, string[]> = {
  en: [
    "Convert {from} to {to} Instantly | MRC GlobalPay",
    "Swap {from} for {to} – No Account Required | MRC GlobalPay",
    "{from} to {to} Exchange – Best Rates, Zero KYC",
    "Buy {to} with {from} in 60 Seconds | MRC GlobalPay",
    "{from}→{to} Swap – 700+ Liquidity Sources",
    "Exchange {from} to {to} Anonymously | MSB-Registered",
    "Best {from} to {to} Rate Today | MRC GlobalPay",
    "{from}/{to} Instant Swap – Canadian MSB Licensed",
    "Trade {from} for {to} – No Sign-Up Needed",
    "Quick {from} to {to} Conversion | MRC GlobalPay",
    "Swap {from} ↔ {to} at Market Rate | MRC GlobalPay",
    "{from} to {to} – Fast, Private, Non-Custodial",
    "Convert {from} into {to} Today | Best Exchange Rate",
    "{from} to {to} Crypto Swap – Under 60 Seconds",
    "Instant {from}→{to} | No Registration Required",
    "Exchange {from} for {to} – Low Fees, High Speed",
    "{from} to {to} | Trusted by 50,000+ Users",
    "Swap {from} to {to} Securely | MRC GlobalPay",
    "{from}/{to} Live Rate & Instant Swap",
    "Best Way to Convert {from} to {to} in 2026",
  ],
  es: [
    "Convertir {from} a {to} al instante | MRC GlobalPay",
    "Intercambiar {from} por {to} – Sin cuenta | MRC GlobalPay",
    "Cambio de {from} a {to} – Mejores tasas, sin KYC",
    "Comprar {to} con {from} en 60 segundos | MRC GlobalPay",
    "{from}→{to} Swap – 700+ fuentes de liquidez",
    "Intercambio de {from} a {to} anónimo | MSB registrado",
    "Mejor tasa de {from} a {to} hoy | MRC GlobalPay",
    "Swap instantáneo {from}/{to} – Licencia MSB canadiense",
    "Cambiar {from} por {to} – Sin registro",
    "Conversión rápida de {from} a {to} | MRC GlobalPay",
    "Swap {from} ↔ {to} a precio de mercado | MRC GlobalPay",
    "{from} a {to} – Rápido, privado, sin custodia",
    "Convertir {from} en {to} hoy | Mejor tasa de cambio",
    "{from} a {to} Crypto Swap – En menos de 60 segundos",
    "Instantáneo {from}→{to} | Sin registro necesario",
    "Cambiar {from} por {to} – Comisiones bajas, alta velocidad",
    "{from} a {to} | Confiado por 50,000+ usuarios",
    "Swap seguro de {from} a {to} | MRC GlobalPay",
    "Tasa en vivo y swap instantáneo {from}/{to}",
    "Mejor forma de convertir {from} a {to} en 2026",
  ],
  pt: [
    "Converter {from} para {to} instantaneamente | MRC GlobalPay",
    "Trocar {from} por {to} – Sem conta | MRC GlobalPay",
    "Câmbio {from} para {to} – Melhores taxas, zero KYC",
    "Comprar {to} com {from} em 60 segundos | MRC GlobalPay",
    "{from}→{to} Swap – 700+ fontes de liquidez",
    "Trocar {from} por {to} anonimamente | MSB registrado",
    "Melhor taxa {from} para {to} hoje | MRC GlobalPay",
    "Swap instantâneo {from}/{to} – Licença MSB canadense",
    "Trocar {from} por {to} – Sem cadastro",
    "Conversão rápida {from} para {to} | MRC GlobalPay",
    "Swap {from} ↔ {to} a taxa de mercado | MRC GlobalPay",
    "{from} para {to} – Rápido, privado, sem custódia",
    "Converter {from} em {to} hoje | Melhor taxa de câmbio",
    "{from} para {to} Crypto Swap – Em menos de 60 segundos",
    "Instantâneo {from}→{to} | Sem registro necessário",
    "Trocar {from} por {to} – Taxas baixas, alta velocidade",
    "{from} para {to} | Confiado por 50.000+ usuários",
    "Swap seguro de {from} para {to} | MRC GlobalPay",
    "Taxa ao vivo e swap instantâneo {from}/{to}",
    "Melhor forma de converter {from} para {to} em 2026",
  ],
  fr: [
    "Convertir {from} en {to} instantanément | MRC GlobalPay",
    "Échanger {from} contre {to} – Sans compte | MRC GlobalPay",
    "Échange {from} vers {to} – Meilleurs taux, zéro KYC",
    "Acheter {to} avec {from} en 60 secondes | MRC GlobalPay",
    "{from}→{to} Swap – 700+ sources de liquidité",
    "Échange anonyme {from} vers {to} | MSB enregistré",
    "Meilleur taux {from} vers {to} aujourd'hui | MRC GlobalPay",
    "Swap instantané {from}/{to} – Licence MSB canadienne",
    "Échanger {from} contre {to} – Sans inscription",
    "Conversion rapide {from} vers {to} | MRC GlobalPay",
    "Swap {from} ↔ {to} au taux du marché | MRC GlobalPay",
    "{from} vers {to} – Rapide, privé, non-custodial",
    "Convertir {from} en {to} aujourd'hui | Meilleur taux",
    "{from} vers {to} Crypto Swap – Moins de 60 secondes",
    "Instantané {from}→{to} | Aucune inscription requise",
    "Échanger {from} contre {to} – Frais bas, vitesse élevée",
    "{from} vers {to} | Plus de 50 000 utilisateurs",
    "Swap sécurisé {from} vers {to} | MRC GlobalPay",
    "Taux en direct et swap instantané {from}/{to}",
    "Meilleure façon de convertir {from} en {to} en 2026",
  ],
  ja: [
    "{from}を{to}に即座に変換 | MRC GlobalPay",
    "{from}を{to}に交換 – アカウント不要 | MRC GlobalPay",
    "{from}→{to}交換 – 最高レート、KYC不要",
    "60秒で{from}から{to}を購入 | MRC GlobalPay",
    "{from}→{to}スワップ – 700+流動性ソース",
    "{from}を{to}に匿名で交換 | MSB登録済み",
    "本日の{from}→{to}最高レート | MRC GlobalPay",
    "{from}/{to}即時スワップ – カナダMSBライセンス",
    "{from}を{to}に交換 – 登録不要",
    "{from}から{to}への迅速な変換 | MRC GlobalPay",
    "{from} ↔ {to}を市場レートでスワップ",
    "{from}→{to} – 高速・プライベート・非カストディアル",
    "今日{from}を{to}に変換 | 最高の為替レート",
    "{from}→{to}暗号スワップ – 60秒以内",
    "即座に{from}→{to} | 登録不要",
    "{from}を{to}に交換 – 低手数料・高速",
    "{from}→{to} | 50,000+ユーザーに信頼",
    "{from}を{to}に安全にスワップ | MRC GlobalPay",
    "{from}/{to}ライブレート＆即時スワップ",
    "2026年に{from}を{to}に変換する最良の方法",
  ],
  fa: [
    "تبدیل {from} به {to} فوری | MRC GlobalPay",
    "مبادله {from} با {to} – بدون حساب | MRC GlobalPay",
    "تبادل {from} به {to} – بهترین نرخ، بدون KYC",
    "خرید {to} با {from} در ۶۰ ثانیه | MRC GlobalPay",
    "سواپ {from}→{to} – بیش از ۷۰۰ منبع نقدینگی",
    "تبادل ناشناس {from} به {to} | ثبت MSB",
    "بهترین نرخ {from} به {to} امروز | MRC GlobalPay",
    "سواپ فوری {from}/{to} – مجوز MSB کانادا",
    "مبادله {from} با {to} – بدون ثبت‌نام",
    "تبدیل سریع {from} به {to} | MRC GlobalPay",
    "سواپ {from} ↔ {to} با نرخ بازار",
    "{from} به {to} – سریع، خصوصی، غیرحضانتی",
    "تبدیل {from} به {to} امروز | بهترین نرخ ارز",
    "سواپ رمزارز {from} به {to} – کمتر از ۶۰ ثانیه",
    "فوری {from}→{to} | بدون نیاز به ثبت‌نام",
    "مبادله {from} با {to} – کارمزد کم، سرعت بالا",
    "{from} به {to} | مورد اعتماد ۵۰,۰۰۰+ کاربر",
    "سواپ امن {from} به {to} | MRC GlobalPay",
    "نرخ زنده و سواپ فوری {from}/{to}",
    "بهترین روش تبدیل {from} به {to} در ۲۰۲۶",
  ],
  ur: [
    "{from} کو {to} میں فوری تبدیل کریں | MRC GlobalPay",
    "{from} کو {to} سے بدلیں – اکاؤنٹ کی ضرورت نہیں",
    "{from} سے {to} کا تبادلہ – بہترین شرح، KYC نہیں",
    "60 سیکنڈ میں {from} سے {to} خریدیں | MRC GlobalPay",
    "{from}→{to} سواپ – 700+ لیکویڈیٹی ذرائع",
    "{from} سے {to} کا گمنام تبادلہ | MSB رجسٹرڈ",
    "آج {from} سے {to} کی بہترین شرح | MRC GlobalPay",
    "فوری سواپ {from}/{to} – کینیڈین MSB لائسنس",
    "{from} کو {to} سے بدلیں – سائن اپ نہیں",
    "{from} سے {to} کی تیز تبدیلی | MRC GlobalPay",
    "مارکیٹ ریٹ پر {from} ↔ {to} سواپ",
    "{from} سے {to} – تیز، نجی، غیر تحویلی",
    "آج {from} کو {to} میں تبدیل کریں | بہترین شرح",
    "{from} سے {to} کرپٹو سواپ – 60 سیکنڈ سے کم",
    "فوری {from}→{to} | رجسٹریشن ضروری نہیں",
    "{from} کو {to} سے بدلیں – کم فیس، تیز رفتار",
    "{from} سے {to} | 50,000+ صارفین کا اعتماد",
    "{from} سے {to} محفوظ سواپ | MRC GlobalPay",
    "لائیو ریٹ اور فوری سواپ {from}/{to}",
    "2026 میں {from} کو {to} میں تبدیل کرنے کا بہترین طریقہ",
  ],
  he: [
    "המרת {from} ל-{to} מיידית | MRC GlobalPay",
    "החלפת {from} ב-{to} – ללא חשבון | MRC GlobalPay",
    "המרה {from} ל-{to} – שערים הטובים, ללא KYC",
    "קנייה {to} עם {from} ב-60 שניות | MRC GlobalPay",
    "{from}→{to} סוואפ – 700+ מקורות נזילות",
    "החלפת {from} ל-{to} באנונימיות | MSB רשום",
    "שער הטוב ביותר {from} ל-{to} היום | MRC GlobalPay",
    "סוואפ מיידי {from}/{to} – רישיון MSB קנדי",
    "החלפת {from} ב-{to} – ללא הרשמה",
    "המרה מהירה {from} ל-{to} | MRC GlobalPay",
    "סוואפ {from} ↔ {to} בשער שוק",
    "{from} ל-{to} – מהיר, פרטי, לא משמורני",
    "המרת {from} ל-{to} היום | שער חליפין הטוב ביותר",
    "סוואפ קריפטו {from} ל-{to} – פחות מ-60 שניות",
    "מיידי {from}→{to} | ללא רישום",
    "החלפת {from} ב-{to} – עמלות נמוכות, מהירות גבוהה",
    "{from} ל-{to} | מהימן ע\"י 50,000+ משתמשים",
    "סוואפ מאובטח {from} ל-{to} | MRC GlobalPay",
    "שער חי וסוואפ מיידי {from}/{to}",
    "הדרך הטובה ביותר להמיר {from} ל-{to} ב-2026",
  ],
  af: [
    "Omskep {from} na {to} onmiddellik | MRC GlobalPay",
    "Ruil {from} vir {to} – Geen rekening nodig | MRC GlobalPay",
    "{from} na {to} omruiling – Beste koerse, geen KYC",
    "Koop {to} met {from} in 60 sekondes | MRC GlobalPay",
    "{from}→{to} Ruil – 700+ likiditeitsbronne",
    "Ruil {from} na {to} anoniem | MSB-geregistreer",
    "Beste {from} na {to} koers vandag | MRC GlobalPay",
    "Onmiddellike ruil {from}/{to} – Kanadese MSB-lisensie",
    "Ruil {from} vir {to} – Geen registrasie nodig",
    "Vinnige {from} na {to} omskakeling | MRC GlobalPay",
    "Ruil {from} ↔ {to} teen markkoers | MRC GlobalPay",
    "{from} na {to} – Vinnig, privaat, nie-bewaring",
    "Omskep {from} in {to} vandag | Beste wisselkoers",
    "{from} na {to} Kripto-ruil – Onder 60 sekondes",
    "Onmiddellik {from}→{to} | Geen registrasie nodig",
    "Ruil {from} vir {to} – Lae fooie, hoë spoed",
    "{from} na {to} | Vertrou deur 50,000+ gebruikers",
    "Veilige ruil {from} na {to} | MRC GlobalPay",
    "Regstreekse koers en onmiddellike ruil {from}/{to}",
    "Beste manier om {from} na {to} om te skakel in 2026",
  ],
  hi: [
    "{from} को {to} में तुरंत बदलें | MRC GlobalPay",
    "{from} को {to} से बदलें – खाता जरूरी नहीं | MRC GlobalPay",
    "{from} से {to} एक्सचेंज – सर्वश्रेष्ठ दर, शून्य KYC",
    "60 सेकंड में {from} से {to} खरीदें | MRC GlobalPay",
    "{from}→{to} स्वैप – 700+ तरलता स्रोत",
    "{from} से {to} गुमनाम एक्सचेंज | MSB पंजीकृत",
    "आज {from} से {to} की सर्वश्रेष्ठ दर | MRC GlobalPay",
    "तत्काल स्वैप {from}/{to} – कनाडाई MSB लाइसेंस",
    "{from} को {to} से बदलें – साइन-अप नहीं",
    "{from} से {to} तेजी से रूपांतरण | MRC GlobalPay",
    "बाजार दर पर {from} ↔ {to} स्वैप",
    "{from} से {to} – तेज, निजी, नॉन-कस्टोडियल",
    "आज {from} को {to} में बदलें | सर्वश्रेष्ठ विनिमय दर",
    "{from} से {to} क्रिप्टो स्वैप – 60 सेकंड से कम",
    "तत्काल {from}→{to} | पंजीकरण आवश्यक नहीं",
    "{from} को {to} से बदलें – कम शुल्क, उच्च गति",
    "{from} से {to} | 50,000+ उपयोगकर्ताओं द्वारा विश्वसनीय",
    "{from} से {to} सुरक्षित स्वैप | MRC GlobalPay",
    "लाइव रेट और तत्काल स्वैप {from}/{to}",
    "2026 में {from} को {to} में बदलने का सबसे अच्छा तरीका",
  ],
  vi: [
    "Đổi {from} sang {to} tức thì | MRC GlobalPay",
    "Hoán đổi {from} lấy {to} – Không cần tài khoản | MRC GlobalPay",
    "Sàn {from} sang {to} – Tỷ giá tốt nhất, không KYC",
    "Mua {to} bằng {from} trong 60 giây | MRC GlobalPay",
    "Swap {from}→{to} – 700+ nguồn thanh khoản",
    "Đổi {from} sang {to} ẩn danh | MSB đã đăng ký",
    "Tỷ giá {from} sang {to} tốt nhất hôm nay | MRC GlobalPay",
    "Swap tức thì {from}/{to} – Giấy phép MSB Canada",
    "Đổi {from} lấy {to} – Không cần đăng ký",
    "Chuyển đổi nhanh {from} sang {to} | MRC GlobalPay",
    "Swap {from} ↔ {to} theo giá thị trường",
    "{from} sang {to} – Nhanh, riêng tư, phi lưu ký",
    "Đổi {from} thành {to} hôm nay | Tỷ giá tốt nhất",
    "Swap crypto {from} sang {to} – Dưới 60 giây",
    "Tức thì {from}→{to} | Không cần đăng ký",
    "Đổi {from} lấy {to} – Phí thấp, tốc độ cao",
    "{from} sang {to} | Được 50.000+ người dùng tin tưởng",
    "Swap an toàn {from} sang {to} | MRC GlobalPay",
    "Tỷ giá trực tiếp và swap tức thì {from}/{to}",
    "Cách tốt nhất để đổi {from} sang {to} năm 2026",
  ],
  tr: [
    "{from}'ı {to}'a anında dönüştürün | MRC GlobalPay",
    "{from}'ı {to} ile değiştirin – Hesap gerekmez | MRC GlobalPay",
    "{from}'dan {to}'a değişim – En iyi oranlar, KYC yok",
    "60 saniyede {from} ile {to} satın alın | MRC GlobalPay",
    "{from}→{to} Swap – 700+ likidite kaynağı",
    "{from}'ı {to}'a anonim olarak değiştirin | MSB kayıtlı",
    "Bugün en iyi {from}→{to} oranı | MRC GlobalPay",
    "Anlık swap {from}/{to} – Kanada MSB lisansı",
    "{from}'ı {to} ile değiştirin – Kayıt gerekmez",
    "Hızlı {from}→{to} dönüştürme | MRC GlobalPay",
    "Piyasa fiyatında {from} ↔ {to} swap",
    "{from}→{to} – Hızlı, özel, emanetsiz",
    "Bugün {from}'ı {to}'a dönüştürün | En iyi kur",
    "{from}→{to} kripto swap – 60 saniyenin altında",
    "Anlık {from}→{to} | Kayıt gerekli değil",
    "{from}'ı {to} ile değiştirin – Düşük ücret, yüksek hız",
    "{from}→{to} | 50.000+ kullanıcı tarafından güvenilir",
    "{from}'dan {to}'a güvenli swap | MRC GlobalPay",
    "Canlı oran ve anlık swap {from}/{to}",
    "2026'da {from}'ı {to}'a dönüştürmenin en iyi yolu",
  ],
  uk: [
    "Конвертувати {from} в {to} миттєво | MRC GlobalPay",
    "Обміняти {from} на {to} – Без акаунту | MRC GlobalPay",
    "Обмін {from} на {to} – Найкращі курси, без KYC",
    "Купити {to} за {from} за 60 секунд | MRC GlobalPay",
    "{from}→{to} Свап – 700+ джерел ліквідності",
    "Анонімний обмін {from} на {to} | MSB зареєстровано",
    "Найкращий курс {from} на {to} сьогодні | MRC GlobalPay",
    "Миттєвий свап {from}/{to} – Канадська ліцензія MSB",
    "Обміняти {from} на {to} – Без реєстрації",
    "Швидка конвертація {from} в {to} | MRC GlobalPay",
    "Свап {from} ↔ {to} за ринковим курсом",
    "{from} на {to} – Швидко, приватно, без опіки",
    "Конвертувати {from} в {to} сьогодні | Найкращий курс",
    "{from} на {to} крипто свап – Менше 60 секунд",
    "Миттєво {from}→{to} | Реєстрація не потрібна",
    "Обміняти {from} на {to} – Низькі комісії, висока швидкість",
    "{from} на {to} | Довіряють 50 000+ користувачів",
    "Безпечний свап {from} на {to} | MRC GlobalPay",
    "Живий курс і миттєвий свап {from}/{to}",
    "Найкращий спосіб конвертувати {from} в {to} у 2026",
  ],
};

// Description templates – 30 variants per language, each 155-185 chars.
// Rotated by templateId % 30. Length matters: <120 chars triggers Google's
// "thin meta" classifier; 150-160 chars is the optimal SERP snippet length.
// Variants reference unique anchor phrases (settlement window, fee model,
// source aggregation, MSB number, source-back policy, year, supported
// payment rails) so the corpus avoids the doorway-content pattern.
const DESC_TEMPLATES: Record<string, string[]> = {
  en: [
    "Convert {from} to {to} in under 60 seconds with non-custodial routing across 700+ liquidity sources. No account, no KYC, no withdrawal queues. Canadian MSB C100000015.",
    "Swap {from} for {to} at the live aggregated market rate with a transparent 0.4% routing fee. Funds settle directly to your wallet — we never custody your assets. MSB-licensed.",
    "Exchange {from} to {to} without registration or identity checks. Real-time rates pulled from 700+ venues, 24/7 execution, $0.30 minimum, instant on-chain settlement.",
    "Buy {to} with {from} through MRC GlobalPay's non-custodial swap engine. Sub-60-second settlement, transparent 0.4% fee, no account required, Canadian MSB-registered.",
    "Instant {from} to {to} swap aggregating quotes from 700+ exchanges to surface the best execution. Zero sign-up, no minimum above $0.30, settles to your wallet directly.",
    "Trade {from} for {to} securely under Canadian MSB oversight (FINTRAC #C100000015). Sub-60-second on-chain settlement, transparent 0.4% routing fee, no withdrawal limits.",
    "Convert {from} into {to} today at the aggregated best rate across 700+ liquidity providers. No registration, no KYC, no holding limits — settles directly to your address.",
    "{from} to {to} crypto swap routed across 700+ exchanges and DEX aggregators for the tightest spread. Non-custodial, MSB-licensed, sub-minute settlement, $0.30 minimum.",
    "Fast {from}→{to} conversion with a transparent 0.4% fee and zero hidden spreads. Private, non-custodial, Canadian MSB-registered, supported on every major network.",
    "Swap {from} to {to} at live market rate with instant settlement and zero registration. Trusted by 50,000+ traders worldwide. MSB C100000015, source-back refund policy.",
    "{from} → {to} in under a minute. MRC GlobalPay aggregates 700+ liquidity sources to find the deepest pool, then routes the swap directly to your wallet. No KYC required.",
    "Looking to convert {from} to {to}? Our smart router compares 700+ providers in real time and executes against the best quote. Non-custodial, MSB-licensed, $0.30 minimum.",
    "Exchange {from} for {to} on a Canadian MSB-registered platform with FINTRAC oversight. Under 60-second median settlement, 0.4% transparent fee, no account creation needed.",
    "{from} to {to} live rate updated every second. Lock your rate, send funds, receive {to} directly to your wallet — no custody, no account, no minimum above $0.30.",
    "Get the best {from} to {to} rate aggregated from 700+ exchanges in real time. Funds never touch our balance sheet — pure non-custodial routing under Canadian MSB license.",
    "Convert {from} into {to} with sub-minute settlement and zero registration friction. 0.4% transparent routing fee, $0.30 minimum, supported across all major chains in 2026.",
    "Trade {from} for {to} privately and securely. No email, no phone, no KYC for under-threshold swaps. Source-back policy returns funds to origin wallet on any failure.",
    "{from}/{to} swap on the MRC GlobalPay aggregator. We scan 700+ liquidity venues and route to the best execution, settling on-chain in under 60 seconds. MSB C100000015.",
    "Need to swap {from} to {to}? Get an instant quote, lock the rate for 60 seconds, and send funds — settlement happens directly to your wallet, no account, no waiting.",
    "{from} to {to} crypto exchange with transparent 0.4% fees and live aggregated rates. Canadian MSB-registered, FINTRAC-supervised, non-custodial, 24/7 settlement.",
    "Convert {from} to {to} on the institutional-grade aggregator trusted by 50,000+ users. Sub-60-second median settlement, no account, no KYC, source-back refund policy.",
    "{from} → {to} swap powered by smart liquidity routing across 700+ exchanges. Funds settle to your wallet in under a minute. Canadian MSB, transparent 0.4% routing fee.",
    "Exchange {from} for {to} with the best rate guarantee from our 700-source aggregator. No sign-up, no holding period, no withdrawal queue — pure non-custodial execution.",
    "Swap {from} to {to} 24/7 with instant settlement and rate-lock protection. Canadian MSB C100000015, $0.30 minimum, transparent 0.4% fee, supported across every L1 and L2.",
    "{from} to {to} conversion built for speed: aggregated quotes from 700+ venues, sub-minute settlement, no custody, no KYC under threshold. Trusted MSB-licensed platform.",
    "Best way to swap {from} for {to} in 2026: live aggregated rates, 0.4% transparent fee, sub-60-second settlement, no account required. Canadian MSB-registered (C100000015).",
    "Convert your {from} to {to} through a non-custodial routing engine that scans 700+ exchanges. Settles in under a minute, no KYC, no withdrawal cap, $0.30 minimum swap.",
    "{from} to {to} swap on MRC GlobalPay — the aggregator licensed under Canadian MSB regulations. 700+ liquidity sources, transparent 0.4% fee, instant on-chain settlement.",
    "Trade {from} → {to} with full address transparency and source-back refund policy. We aggregate 700+ venues and settle to your wallet in under 60 seconds. MSB-licensed.",
    "Live {from}/{to} rate engine: lock a quote for 60 seconds, send funds, receive {to} directly. No registration, no KYC, no minimum above $0.30. Canadian MSB C100000015.",
  ],
  es: [
    "Convierte {from} a {to} en menos de 60 segundos con enrutamiento no custodial entre 700+ fuentes de liquidez. Sin cuenta, sin KYC, sin colas de retiro. MSB canadiense C100000015.",
    "Intercambia {from} por {to} a la tasa de mercado agregada con comisión transparente del 0.4%. Los fondos se liquidan directamente en tu wallet — nunca custodiamos tus activos. MSB licenciado.",
    "Cambia {from} a {to} sin registro ni verificación de identidad. Tasas en tiempo real de 700+ exchanges, 24/7, mínimo $0.30, liquidación instantánea on-chain.",
    "Compra {to} con {from} mediante el motor de swap no custodial de MRC GlobalPay. Liquidación en menos de 60s, comisión 0.4%, sin cuenta, MSB canadiense registrado.",
    "Swap instantáneo de {from} a {to} agregando cotizaciones de 700+ exchanges para la mejor ejecución. Sin registro, sin mínimo arriba de $0.30, liquida en tu wallet.",
    "Negocia {from} por {to} de forma segura bajo supervisión MSB canadiense (FINTRAC #C100000015). Liquidación on-chain < 60s, comisión 0.4%, sin límites de retiro.",
    "Convierte {from} en {to} hoy a la mejor tasa agregada de 700+ proveedores de liquidez. Sin registro, sin KYC, sin límites — liquida directamente a tu dirección.",
    "Swap cripto {from} a {to} enrutado entre 700+ exchanges y agregadores DEX para el spread más ajustado. No custodial, MSB licenciado, liquidación < 60s, mínimo $0.30.",
    "Conversión rápida {from}→{to} con comisión transparente del 0.4% sin spreads ocultos. Privado, no custodial, MSB canadiense, soportado en todas las redes principales.",
    "Cambia {from} a {to} a precio de mercado con liquidación instantánea y cero registro. Confiado por 50,000+ traders. MSB C100000015, política de reembolso source-back.",
    "{from} → {to} en menos de un minuto. MRC GlobalPay agrega 700+ fuentes de liquidez para encontrar el pool más profundo y enruta el swap directo a tu wallet. Sin KYC.",
    "¿Quieres convertir {from} a {to}? Nuestro router inteligente compara 700+ proveedores en tiempo real y ejecuta contra la mejor cotización. No custodial, MSB, mínimo $0.30.",
    "Cambia {from} por {to} en una plataforma MSB canadiense con supervisión FINTRAC. Mediana de liquidación < 60s, comisión transparente 0.4%, sin necesidad de crear cuenta.",
    "Tasa en vivo {from} a {to} actualizada cada segundo. Bloquea tu tasa, envía fondos, recibe {to} directo en tu wallet — sin custodia, sin cuenta, sin mínimo arriba de $0.30.",
    "Obtén la mejor tasa {from} a {to} agregada de 700+ exchanges en tiempo real. Los fondos nunca tocan nuestro balance — enrutamiento puro no custodial bajo licencia MSB.",
    "Convierte {from} en {to} con liquidación submunita y cero fricción de registro. Comisión transparente 0.4%, mínimo $0.30, soportado en todas las cadenas principales en 2026.",
    "Negocia {from} por {to} de forma privada y segura. Sin email, sin teléfono, sin KYC para swaps bajo umbral. Política source-back devuelve fondos al wallet origen ante fallos.",
    "Swap {from}/{to} en el agregador MRC GlobalPay. Escaneamos 700+ venues de liquidez y enrutamos a la mejor ejecución, liquidando on-chain en < 60s. MSB C100000015.",
    "¿Necesitas cambiar {from} a {to}? Obtén cotización instantánea, bloquea la tasa por 60s y envía fondos — la liquidación va directa a tu wallet, sin cuenta, sin esperas.",
    "Exchange cripto {from} a {to} con comisiones transparentes del 0.4% y tasas agregadas en vivo. MSB canadiense, FINTRAC supervisado, no custodial, liquidación 24/7.",
    "Convierte {from} a {to} en el agregador grado institucional confiado por 50,000+ usuarios. Liquidación mediana < 60s, sin cuenta, sin KYC, política source-back.",
    "{from} → {to} swap impulsado por enrutamiento inteligente entre 700+ exchanges. Los fondos liquidan en tu wallet en menos de un minuto. MSB canadiense, comisión 0.4%.",
    "Cambia {from} por {to} con la mejor tasa garantizada del agregador de 700 fuentes. Sin registro, sin período de retención, sin colas — pura ejecución no custodial.",
    "Swap {from} a {to} 24/7 con liquidación instantánea y protección rate-lock. MSB canadiense C100000015, mínimo $0.30, comisión 0.4%, soportado en cada L1 y L2.",
    "Conversión {from} a {to} construida para velocidad: cotizaciones agregadas de 700+ venues, liquidación submunita, sin custodia, sin KYC bajo umbral. Plataforma MSB licenciada.",
    "Mejor forma de cambiar {from} por {to} en 2026: tasas agregadas en vivo, comisión 0.4%, liquidación < 60s, sin cuenta. MSB canadiense registrado (C100000015).",
    "Convierte tu {from} a {to} mediante un motor de enrutamiento no custodial que escanea 700+ exchanges. Liquida en menos de un minuto, sin KYC, sin tope de retiro, mínimo $0.30.",
    "Swap {from} a {to} en MRC GlobalPay — el agregador licenciado bajo regulaciones MSB canadienses. 700+ fuentes de liquidez, comisión transparente 0.4%, liquidación instantánea.",
    "Negocia {from} → {to} con transparencia total de direcciones y política source-back. Agregamos 700+ venues y liquidamos en tu wallet en < 60s. MSB licenciado.",
    "Motor de tasa en vivo {from}/{to}: bloquea cotización por 60s, envía fondos, recibe {to} directo. Sin registro, sin KYC, sin mínimo arriba de $0.30. MSB canadiense C100000015.",
  ],
  pt: [
    "Converta {from} para {to} em menos de 60 segundos com roteamento não custodial entre 700+ fontes de liquidez. Sem conta, sem KYC, sem filas de saque. MSB canadense C100000015.",
    "Troque {from} por {to} à taxa de mercado agregada com taxa transparente de 0.4%. Os fundos liquidam direto na sua wallet — nunca custodiamos seus ativos. MSB licenciado.",
    "Câmbio {from} para {to} sem cadastro nem verificação de identidade. Taxas em tempo real de 700+ exchanges, 24/7, mínimo $0.30, liquidação on-chain instantânea.",
    "Compre {to} com {from} pelo motor de swap não custodial da MRC GlobalPay. Liquidação em menos de 60s, taxa 0.4%, sem conta, MSB canadense registrado.",
    "Swap instantâneo {from} para {to} agregando cotações de 700+ exchanges para a melhor execução. Sem cadastro, sem mínimo acima de $0.30, liquida na sua wallet.",
    "Negocie {from} por {to} com segurança sob supervisão MSB canadense (FINTRAC #C100000015). Liquidação on-chain < 60s, taxa transparente 0.4%, sem limites de saque.",
    "Converta {from} em {to} hoje pela melhor taxa agregada de 700+ provedores de liquidez. Sem cadastro, sem KYC, sem limites — liquida direto no seu endereço.",
    "Swap cripto {from} para {to} roteado entre 700+ exchanges e agregadores DEX para o spread mais apertado. Não custodial, MSB licenciado, liquidação < 60s, mínimo $0.30.",
    "Conversão rápida {from}→{to} com taxa transparente de 0.4% e zero spreads ocultos. Privado, não custodial, MSB canadense, suportado em todas as redes principais.",
    "Troque {from} por {to} a preço de mercado com liquidação instantânea e zero cadastro. Confiado por 50.000+ traders. MSB C100000015, política source-back de reembolso.",
    "{from} → {to} em menos de um minuto. MRC GlobalPay agrega 700+ fontes de liquidez para encontrar o pool mais profundo e roteia o swap direto na sua wallet. Sem KYC.",
    "Quer converter {from} para {to}? Nosso router inteligente compara 700+ provedores em tempo real e executa contra a melhor cotação. Não custodial, MSB, mínimo $0.30.",
    "Troque {from} por {to} numa plataforma MSB canadense com supervisão FINTRAC. Mediana de liquidação < 60s, taxa transparente 0.4%, sem necessidade de criar conta.",
    "Taxa ao vivo {from} para {to} atualizada a cada segundo. Trave sua taxa, envie fundos, receba {to} direto na wallet — sem custódia, sem conta, sem mínimo acima de $0.30.",
    "Obtenha a melhor taxa {from} para {to} agregada de 700+ exchanges em tempo real. Os fundos nunca tocam nosso balanço — roteamento puro não custodial sob licença MSB.",
    "Converta {from} em {to} com liquidação em menos de um minuto e zero atrito de cadastro. Taxa transparente 0.4%, mínimo $0.30, suportado em todas as cadeias principais em 2026.",
    "Negocie {from} por {to} com privacidade e segurança. Sem email, sem telefone, sem KYC para swaps abaixo do limiar. Política source-back devolve fundos à wallet de origem em falhas.",
    "Swap {from}/{to} no agregador MRC GlobalPay. Escaneamos 700+ venues de liquidez e roteamos para a melhor execução, liquidando on-chain em < 60s. MSB C100000015.",
    "Precisa trocar {from} por {to}? Obtenha cotação instantânea, trave a taxa por 60s e envie fundos — a liquidação vai direto na sua wallet, sem conta, sem espera.",
    "Exchange cripto {from} para {to} com taxas transparentes de 0.4% e taxas agregadas ao vivo. MSB canadense, supervisionado FINTRAC, não custodial, liquidação 24/7.",
    "Converta {from} para {to} no agregador grau institucional confiado por 50.000+ usuários. Liquidação mediana < 60s, sem conta, sem KYC, política source-back de reembolso.",
    "{from} → {to} swap impulsionado por roteamento inteligente entre 700+ exchanges. Os fundos liquidam na sua wallet em menos de um minuto. MSB canadense, taxa 0.4%.",
    "Troque {from} por {to} com a melhor taxa garantida do agregador de 700 fontes. Sem cadastro, sem período de retenção, sem filas — pura execução não custodial.",
    "Swap {from} para {to} 24/7 com liquidação instantânea e proteção rate-lock. MSB canadense C100000015, mínimo $0.30, taxa 0.4%, suportado em cada L1 e L2.",
    "Conversão {from} para {to} construída para velocidade: cotações agregadas de 700+ venues, liquidação submunita, sem custódia, sem KYC abaixo do limiar. Plataforma MSB licenciada.",
    "Melhor forma de trocar {from} por {to} em 2026: taxas agregadas ao vivo, taxa 0.4%, liquidação < 60s, sem conta. MSB canadense registrado (C100000015).",
    "Converta seu {from} para {to} por um motor de roteamento não custodial que escaneia 700+ exchanges. Liquida em menos de um minuto, sem KYC, sem teto de saque, mínimo $0.30.",
    "Swap {from} para {to} na MRC GlobalPay — o agregador licenciado sob regulações MSB canadenses. 700+ fontes de liquidez, taxa transparente 0.4%, liquidação instantânea on-chain.",
    "Negocie {from} → {to} com transparência total de endereços e política source-back. Agregamos 700+ venues e liquidamos na sua wallet em < 60s. MSB licenciado.",
    "Motor de taxa ao vivo {from}/{to}: trave cotação por 60s, envie fundos, receba {to} direto. Sem cadastro, sem KYC, sem mínimo acima de $0.30. MSB canadense C100000015.",
  ],
  fr: [
    "Convertissez {from} en {to} en moins de 60 secondes avec routage non-custodial entre 700+ sources de liquidité. Sans compte, sans KYC, sans file de retrait. MSB canadien C100000015.",
    "Échangez {from} contre {to} au taux de marché agrégé avec frais transparents de 0.4%. Les fonds sont réglés directement vers votre wallet — nous ne détenons jamais vos actifs.",
    "Échange {from} vers {to} sans inscription ni vérification d'identité. Taux temps réel de 700+ exchanges, 24/7, minimum 0.30$, règlement on-chain instantané.",
    "Achetez {to} avec {from} via le moteur de swap non-custodial MRC GlobalPay. Règlement en moins de 60s, frais 0.4%, sans compte, MSB canadien enregistré.",
    "Swap instantané {from} vers {to} agrégeant les quotes de 700+ exchanges pour la meilleure exécution. Sans inscription, sans minimum au-dessus de 0.30$, règle vers votre wallet.",
    "Tradez {from} contre {to} en toute sécurité sous supervision MSB canadienne (FINTRAC #C100000015). Règlement on-chain < 60s, frais transparents 0.4%, sans limite de retrait.",
    "Convertissez {from} en {to} aujourd'hui au meilleur taux agrégé de 700+ fournisseurs de liquidité. Sans inscription, sans KYC, sans limites — règle directement à votre adresse.",
    "Swap crypto {from} vers {to} routé sur 700+ exchanges et agrégateurs DEX pour le spread le plus serré. Non-custodial, MSB licencié, règlement < 60s, minimum 0.30$.",
    "Conversion rapide {from}→{to} avec frais transparents de 0.4% et zéro spread caché. Privé, non-custodial, MSB canadien, supporté sur tous les réseaux majeurs.",
    "Échangez {from} vers {to} au prix du marché avec règlement instantané et zéro inscription. Approuvé par 50 000+ traders. MSB C100000015, politique source-back de remboursement.",
    "{from} → {to} en moins d'une minute. MRC GlobalPay agrège 700+ sources de liquidité pour trouver le pool le plus profond et route le swap direct vers votre wallet. Sans KYC.",
    "Vous voulez convertir {from} en {to} ? Notre routeur intelligent compare 700+ fournisseurs en temps réel et exécute contre la meilleure quote. Non-custodial, MSB, min 0.30$.",
    "Échangez {from} contre {to} sur une plateforme MSB canadienne sous supervision FINTRAC. Médiane de règlement < 60s, frais transparents 0.4%, sans création de compte.",
    "Taux en direct {from} vers {to} mis à jour chaque seconde. Verrouillez votre taux, envoyez les fonds, recevez {to} directement — sans custodie, sans compte, min 0.30$.",
    "Obtenez le meilleur taux {from} vers {to} agrégé de 700+ exchanges en temps réel. Les fonds ne touchent jamais notre bilan — routage non-custodial pur sous licence MSB.",
    "Convertissez {from} en {to} avec règlement en moins d'une minute et zéro friction d'inscription. Frais transparents 0.4%, minimum 0.30$, supporté sur toutes les chaînes en 2026.",
    "Tradez {from} contre {to} en privé et en sécurité. Sans email, sans téléphone, sans KYC pour swaps sous seuil. Politique source-back rembourse les fonds au wallet d'origine.",
    "Swap {from}/{to} sur l'agrégateur MRC GlobalPay. Nous scannons 700+ venues de liquidité et routons à la meilleure exécution, réglant on-chain en < 60s. MSB C100000015.",
    "Besoin d'échanger {from} contre {to} ? Obtenez une quote instantanée, verrouillez le taux 60s et envoyez les fonds — règlement direct vers votre wallet, sans compte ni attente.",
    "Exchange crypto {from} vers {to} avec frais transparents de 0.4% et taux agrégés en direct. MSB canadien, supervisé FINTRAC, non-custodial, règlement 24/7.",
    "Convertissez {from} en {to} sur l'agrégateur niveau institutionnel approuvé par 50 000+ utilisateurs. Médiane de règlement < 60s, sans compte, sans KYC, politique source-back.",
    "{from} → {to} swap propulsé par routage intelligent sur 700+ exchanges. Les fonds règlent dans votre wallet en moins d'une minute. MSB canadien, frais 0.4%.",
    "Échangez {from} contre {to} avec garantie du meilleur taux de notre agrégateur 700 sources. Sans inscription, sans période de rétention, sans file — exécution non-custodial pure.",
    "Swap {from} vers {to} 24/7 avec règlement instantané et protection rate-lock. MSB canadien C100000015, minimum 0.30$, frais 0.4%, supporté sur chaque L1 et L2.",
    "Conversion {from} vers {to} construite pour la vitesse : quotes agrégées de 700+ venues, règlement submunite, sans custodie, sans KYC sous seuil. Plateforme MSB licenciée.",
    "Meilleure façon d'échanger {from} contre {to} en 2026 : taux agrégés en direct, frais 0.4%, règlement < 60s, sans compte. MSB canadien enregistré (C100000015).",
    "Convertissez votre {from} en {to} via un moteur de routage non-custodial qui scanne 700+ exchanges. Règle en moins d'une minute, sans KYC, sans plafond de retrait, min 0.30$.",
    "Swap {from} vers {to} sur MRC GlobalPay — l'agrégateur licencié sous régulations MSB canadiennes. 700+ sources de liquidité, frais transparents 0.4%, règlement on-chain instantané.",
    "Tradez {from} → {to} avec transparence totale d'adresses et politique source-back. Nous agrégeons 700+ venues et réglons dans votre wallet en < 60s. MSB licencié.",
    "Moteur de taux en direct {from}/{to} : verrouillez la quote 60s, envoyez les fonds, recevez {to} direct. Sans inscription, sans KYC, min 0.30$. MSB canadien C100000015.",
  ],
  ja: [
    "{from}を{to}に60秒以内で変換。700+流動性ソース全体で非カストディアル・ルーティング。アカウント不要、KYC不要、出金待ち列なし。カナダMSB C100000015。",
    "ライブ集約市場レートで{from}を{to}にスワップ、透明な0.4%ルーティング手数料。資金は直接ウォレットに決済 — 資産を預かることはありません。MSBライセンス。",
    "登録や本人確認なしで{from}を{to}に交換。700+取引所からのリアルタイムレート、24/7執行、最低$0.30、即時オンチェーン決済。",
    "{from}でMRC GlobalPayの非カストディアル・スワップエンジンを通じて{to}を購入。60秒以内の決済、透明な0.4%手数料、アカウント不要、カナダMSB登録。",
    "700+取引所からのクオートを集約して最良の執行を実現する{from}→{to}即時スワップ。サインアップなし、$0.30を超える最低額なし、ウォレットに直接決済。",
    "カナダMSB監督下（FINTRAC #C100000015）で{from}を{to}に安全に取引。60秒以内のオンチェーン決済、透明な0.4%ルーティング手数料、出金制限なし。",
    "今日{from}を{to}に最良の集約レートで変換、700+流動性プロバイダーから。登録なし、KYCなし、保有制限なし — アドレスに直接決済。",
    "700+取引所とDEXアグリゲーターでルーティングされる{from}→{to}暗号スワップ。最も狭いスプレッドを実現。非カストディアル、MSBライセンス、60秒未満決済、最低$0.30。",
    "透明な0.4%手数料と隠れスプレッドゼロの高速{from}→{to}変換。プライベート、非カストディアル、カナダMSB登録、すべての主要ネットワークでサポート。",
    "{from}を{to}にライブ市場レートで即時決済、登録ゼロ。世界中で50,000+トレーダーに信頼されています。MSB C100000015、ソースバック返金ポリシー。",
    "{from} → {to}を1分以内で。MRC GlobalPayは700+流動性ソースを集約して最も深いプールを見つけ、スワップを直接ウォレットにルーティング。KYC不要。",
    "{from}を{to}に変換したい？スマートルーターが700+プロバイダーをリアルタイムで比較し、最良のクオートに対して執行。非カストディアル、MSB、最低$0.30。",
    "FINTRAC監督下のカナダMSB登録プラットフォームで{from}を{to}に交換。60秒以内の決済中央値、透明な0.4%手数料、アカウント作成不要。",
    "毎秒更新される{from}/{to}ライブレート。レートをロックし、資金を送信、{to}を直接ウォレットに受信 — カストディなし、アカウントなし、最低$0.30。",
    "700+取引所から集約された最良の{from}→{to}レートをリアルタイムで取得。資金が当社のバランスシートに触れることはありません — MSBライセンス下の純粋な非カストディアル・ルーティング。",
    "1分未満の決済とゼロ登録摩擦で{from}を{to}に変換。透明な0.4%手数料、最低$0.30、2026年すべての主要チェーンでサポート。",
    "{from}を{to}にプライベートかつ安全に取引。メールなし、電話なし、閾値未満のスワップにKYC不要。ソースバック・ポリシーが障害時に元のウォレットに資金を返却。",
    "MRC GlobalPayアグリゲーターでの{from}/{to}スワップ。700+流動性ベニューをスキャンし、最良の執行にルーティング、60秒以内にオンチェーン決済。MSB C100000015。",
    "{from}を{to}にスワップが必要？即時クオートを取得し、レートを60秒ロックして資金を送信 — 決済はウォレットに直接、アカウント不要、待ち時間なし。",
    "透明な0.4%手数料とライブ集約レートで{from}→{to}暗号エクスチェンジ。カナダMSB、FINTRAC監督、非カストディアル、24/7決済。",
    "50,000+ユーザーに信頼される機関グレードのアグリゲーターで{from}を{to}に変換。決済中央値60秒未満、アカウントなし、KYCなし、ソースバック・ポリシー。",
    "700+取引所全体でスマート流動性ルーティングによる{from} → {to}スワップ。資金は1分以内にウォレットに決済。カナダMSB、透明な0.4%ルーティング手数料。",
    "700ソース・アグリゲーターから最良レート保証で{from}を{to}に交換。サインアップなし、保有期間なし、出金待ち列なし — 純粋な非カストディアル執行。",
    "即時決済とレートロック保護で24/7に{from}を{to}にスワップ。カナダMSB C100000015、最低$0.30、透明な0.4%手数料、すべてのL1とL2でサポート。",
    "速度のために構築された{from}→{to}変換：700+ベニューからの集約クオート、1分未満決済、カストディなし、閾値未満でKYCなし。信頼されるMSBライセンス・プラットフォーム。",
    "2026年に{from}を{to}にスワップする最良の方法：ライブ集約レート、透明な0.4%手数料、60秒未満決済、アカウント不要。カナダMSB登録（C100000015）。",
    "700+取引所をスキャンする非カストディアル・ルーティングエンジンを通じて{from}を{to}に変換。1分未満で決済、KYCなし、出金キャップなし、最低$0.30。",
    "MRC GlobalPayでの{from}→{to}スワップ — カナダMSB規制下のライセンスアグリゲーター。700+流動性ソース、透明な0.4%手数料、即時オンチェーン決済。",
    "完全なアドレス透明性とソースバック・ポリシーで{from} → {to}を取引。700+ベニューを集約し、60秒以内にウォレットに決済。MSBライセンス。",
    "ライブ{from}/{to}レートエンジン：60秒間クオートをロック、資金を送信、{to}を直接受信。登録なし、KYCなし、最低$0.30。カナダMSB C100000015。",
  ],
  fa: [
    "تبدیل {from} به {to} در کمتر از ۶۰ ثانیه با مسیریابی غیرحضانتی در ۷۰۰+ منبع نقدینگی. بدون حساب، بدون KYC، بدون صف برداشت. MSB کانادا C100000015.",
    "مبادله {from} با {to} با نرخ بازار تجمیعی زنده و کارمزد شفاف ۰.۴٪. وجوه مستقیم به کیف پول شما تسویه می‌شود — هرگز دارایی شما را نگه نمی‌داریم. مجوز MSB.",
    "تبادل {from} به {to} بدون ثبت‌نام و احراز هویت. نرخ‌های لحظه‌ای از ۷۰۰+ صرافی، اجرا ۲۴/۷، حداقل $۰.۳۰، تسویه آنی آن‌چین.",
    "خرید {to} با {from} از طریق موتور سواپ غیرحضانتی MRC GlobalPay. تسویه کمتر از ۶۰ ثانیه، کارمزد ۰.۴٪، بدون حساب، MSB کانادا ثبت‌شده.",
    "سواپ فوری {from} به {to} با تجمیع نرخ از ۷۰۰+ صرافی برای بهترین اجرا. بدون ثبت‌نام، بدون حداقل بالاتر از $۰.۳۰، تسویه به کیف پول شما.",
    "معامله {from} با {to} با امنیت تحت نظارت MSB کانادا (FINTRAC #C100000015). تسویه آن‌چین < ۶۰ ثانیه، کارمزد شفاف ۰.۴٪، بدون محدودیت برداشت.",
    "تبدیل {from} به {to} امروز با بهترین نرخ تجمیعی از ۷۰۰+ ارائه‌دهنده نقدینگی. بدون ثبت‌نام، بدون KYC، بدون محدودیت — تسویه مستقیم به آدرس شما.",
    "سواپ رمزارز {from} به {to} مسیریابی شده در ۷۰۰+ صرافی و تجمیع‌کننده DEX برای تنگ‌ترین اسپرد. غیرحضانتی، مجوز MSB، تسویه < ۶۰ ثانیه، حداقل $۰.۳۰.",
    "تبدیل سریع {from}→{to} با کارمزد شفاف ۰.۴٪ و بدون اسپرد پنهان. خصوصی، غیرحضانتی، MSB کانادا، پشتیبانی در همه شبکه‌های اصلی.",
    "سواپ {from} به {to} با نرخ بازار زنده و تسویه آنی، بدون ثبت‌نام. مورد اعتماد ۵۰,۰۰۰+ معامله‌گر. MSB C100000015، سیاست بازپرداخت source-back.",
    "{from} ← {to} در کمتر از یک دقیقه. MRC GlobalPay ۷۰۰+ منبع نقدینگی را تجمیع و عمیق‌ترین استخر را پیدا می‌کند، سپس سواپ را مستقیم به کیف پول شما هدایت. بدون KYC.",
    "می‌خواهید {from} را به {to} تبدیل کنید؟ روتر هوشمند ما ۷۰۰+ ارائه‌دهنده را در زمان واقعی مقایسه و بر اساس بهترین نرخ اجرا می‌کند. غیرحضانتی، MSB، حداقل $۰.۳۰.",
    "تبادل {from} با {to} در پلتفرم MSB کانادا تحت نظارت FINTRAC. میانه تسویه < ۶۰ ثانیه، کارمزد شفاف ۰.۴٪، بدون نیاز به ایجاد حساب.",
    "نرخ زنده {from}/{to} هر ثانیه به‌روزرسانی می‌شود. نرخ خود را قفل، وجوه ارسال، {to} را مستقیم به کیف پول دریافت — بدون نگهداری، بدون حساب، حداقل $۰.۳۰.",
    "بهترین نرخ {from} به {to} تجمیعی از ۷۰۰+ صرافی در زمان واقعی. وجوه هرگز ترازنامه ما را لمس نمی‌کند — مسیریابی غیرحضانتی خالص تحت مجوز MSB.",
    "تبدیل {from} به {to} با تسویه کمتر از یک دقیقه و بدون اصطکاک ثبت‌نام. کارمزد شفاف ۰.۴٪، حداقل $۰.۳۰، پشتیبانی در همه زنجیره‌های اصلی در ۲۰۲۶.",
    "معامله {from} با {to} به طور خصوصی و امن. بدون ایمیل، بدون تلفن، بدون KYC برای سواپ‌های زیر آستانه. سیاست source-back وجوه را در صورت خطا به کیف پول مبدأ بازمی‌گرداند.",
    "سواپ {from}/{to} در تجمیع‌کننده MRC GlobalPay. ما ۷۰۰+ مکان نقدینگی را اسکن و به بهترین اجرا مسیریابی، تسویه آن‌چین در < ۶۰ ثانیه. MSB C100000015.",
    "نیاز به سواپ {from} به {to} دارید؟ نرخ آنی دریافت، نرخ را ۶۰ ثانیه قفل، وجوه ارسال — تسویه مستقیم به کیف پول، بدون حساب، بدون انتظار.",
    "اکسچنج رمزارز {from} به {to} با کارمزد شفاف ۰.۴٪ و نرخ‌های تجمیعی زنده. MSB کانادا، تحت نظارت FINTRAC، غیرحضانتی، تسویه ۲۴/۷.",
    "تبدیل {from} به {to} در تجمیع‌کننده درجه نهادی مورد اعتماد ۵۰,۰۰۰+ کاربر. میانه تسویه < ۶۰ ثانیه، بدون حساب، بدون KYC، سیاست source-back.",
    "{from} → {to} سواپ با مسیریابی هوشمند نقدینگی در ۷۰۰+ صرافی. وجوه در کمتر از یک دقیقه به کیف پول شما تسویه می‌شود. MSB کانادا، کارمزد ۰.۴٪.",
    "تبادل {from} با {to} با ضمانت بهترین نرخ از تجمیع‌کننده ۷۰۰ منبعه. بدون ثبت‌نام، بدون دوره نگهداری، بدون صف برداشت — اجرای غیرحضانتی خالص.",
    "سواپ {from} به {to} ۲۴/۷ با تسویه آنی و حفاظت قفل نرخ. MSB کانادا C100000015، حداقل $۰.۳۰، کارمزد ۰.۴٪، پشتیبانی در هر L1 و L2.",
    "تبدیل {from} به {to} ساخته شده برای سرعت: نرخ‌های تجمیعی از ۷۰۰+ مکان، تسویه زیر دقیقه، بدون نگهداری، بدون KYC زیر آستانه. پلتفرم مجاز MSB.",
    "بهترین روش سواپ {from} با {to} در ۲۰۲۶: نرخ‌های تجمیعی زنده، کارمزد ۰.۴٪، تسویه < ۶۰ ثانیه، بدون حساب. MSB کانادا ثبت‌شده (C100000015).",
    "{from} خود را به {to} از طریق موتور مسیریابی غیرحضانتی که ۷۰۰+ صرافی را اسکن می‌کند تبدیل کنید. تسویه در کمتر از یک دقیقه، بدون KYC، بدون سقف برداشت، حداقل $۰.۳۰.",
    "سواپ {from} به {to} در MRC GlobalPay — تجمیع‌کننده مجاز تحت مقررات MSB کانادا. ۷۰۰+ منبع نقدینگی، کارمزد شفاف ۰.۴٪، تسویه آنی آن‌چین.",
    "معامله {from} → {to} با شفافیت کامل آدرس و سیاست source-back. ما ۷۰۰+ مکان را تجمیع و در < ۶۰ ثانیه به کیف پول تسویه می‌کنیم. مجوز MSB.",
    "موتور نرخ زنده {from}/{to}: نرخ را ۶۰ ثانیه قفل، وجوه ارسال، {to} را مستقیم دریافت. بدون ثبت‌نام، بدون KYC، حداقل $۰.۳۰. MSB کانادا C100000015.",
  ],
  ur: [
    "{from} کو {to} میں 60 سیکنڈ سے کم میں تبدیل کریں 700+ لیکویڈیٹی ذرائع پر غیر تحویلی روٹنگ کے ساتھ۔ اکاؤنٹ نہیں، KYC نہیں، نکاسی قطار نہیں۔ کینیڈین MSB C100000015۔",
    "{from} کو {to} سے لائیو مجموعی مارکیٹ ریٹ پر بدلیں شفاف 0.4% فیس کے ساتھ۔ فنڈز براہ راست آپ کی والیٹ میں طے ہوتے ہیں — ہم کبھی آپ کے اثاثے نہیں رکھتے۔ MSB لائسنس یافتہ۔",
    "{from} سے {to} تبادلہ بغیر رجسٹریشن یا شناختی چیک۔ 700+ ایکسچینجز سے ریئل ٹائم ریٹ، 24/7، کم از کم $0.30، فوری آن چین تصفیہ۔",
    "MRC GlobalPay کے غیر تحویلی سواپ انجن کے ذریعے {from} سے {to} خریدیں۔ 60 سیکنڈ سے کم میں تصفیہ، 0.4% فیس، اکاؤنٹ نہیں، کینیڈین MSB رجسٹرڈ۔",
    "بہترین عمل درآمد کے لیے 700+ ایکسچینجز سے کوٹس جمع کرنے والا فوری {from} سے {to} سواپ۔ سائن اپ نہیں، $0.30 سے اوپر کم از کم نہیں، آپ کی والیٹ میں تصفیہ۔",
    "کینیڈین MSB نگرانی (FINTRAC #C100000015) کے تحت {from} کو {to} سے محفوظ تجارت کریں۔ آن چین تصفیہ < 60 سیکنڈ، شفاف 0.4% روٹنگ فیس، نکاسی کی حد نہیں۔",
    "آج {from} کو {to} میں 700+ لیکویڈیٹی فراہم کنندگان سے بہترین مجموعی ریٹ پر تبدیل کریں۔ رجسٹریشن نہیں، KYC نہیں، حد نہیں — براہ راست آپ کے ایڈریس پر تصفیہ۔",
    "تنگ ترین اسپریڈ کے لیے 700+ ایکسچینجز اور DEX اگریگیٹرز پر روٹ کیا گیا {from} سے {to} کرپٹو سواپ۔ غیر تحویلی، MSB لائسنس، تصفیہ < 60 سیکنڈ، کم از کم $0.30۔",
    "شفاف 0.4% فیس اور صفر چھپے اسپریڈز کے ساتھ تیز {from}→{to} تبدیلی۔ نجی، غیر تحویلی، کینیڈین MSB، تمام بڑے نیٹ ورکس پر تعاون یافتہ۔",
    "{from} کو {to} میں لائیو مارکیٹ ریٹ پر فوری تصفیہ اور صفر رجسٹریشن کے ساتھ بدلیں۔ 50,000+ ٹریڈرز کا اعتماد۔ MSB C100000015، source-back ریفنڈ پالیسی۔",
    "{from} → {to} ایک منٹ سے کم میں۔ MRC GlobalPay 700+ لیکویڈیٹی ذرائع جمع کرتا ہے گہرا ترین پول تلاش کرنے کے لیے، پھر سواپ کو براہ راست والیٹ پر روٹ کرتا ہے۔ KYC نہیں۔",
    "{from} کو {to} میں تبدیل کرنا چاہتے ہیں؟ ہمارا اسمارٹ راؤٹر 700+ فراہم کنندگان کا ریئل ٹائم میں موازنہ اور بہترین کوٹ پر عمل درآمد کرتا ہے۔ غیر تحویلی، MSB، کم از کم $0.30۔",
    "FINTRAC نگرانی والے کینیڈین MSB رجسٹرڈ پلیٹ فارم پر {from} کو {to} سے بدلیں۔ تصفیہ کی میڈین < 60 سیکنڈ، شفاف 0.4% فیس، اکاؤنٹ بنانے کی ضرورت نہیں۔",
    "{from} سے {to} لائیو ریٹ ہر سیکنڈ اپ ڈیٹ ہوتا ہے۔ اپنا ریٹ لاک کریں، فنڈز بھیجیں، {to} براہ راست والیٹ میں وصول کریں — کسٹڈی نہیں، اکاؤنٹ نہیں، کم از کم $0.30۔",
    "ریئل ٹائم میں 700+ ایکسچینجز سے جمع کیا گیا بہترین {from} سے {to} ریٹ حاصل کریں۔ فنڈز کبھی ہماری بیلنس شیٹ کو نہیں چھوتے — MSB لائسنس کے تحت خالص غیر تحویلی روٹنگ۔",
    "ذیلی منٹ تصفیہ اور صفر رجسٹریشن رگڑ کے ساتھ {from} کو {to} میں تبدیل کریں۔ شفاف 0.4% فیس، کم از کم $0.30، 2026 میں تمام بڑی چینز پر تعاون یافتہ۔",
    "{from} کو {to} سے نجی اور محفوظ تجارت کریں۔ ای میل نہیں، فون نہیں، حد سے کم سواپس کے لیے KYC نہیں۔ source-back پالیسی ناکامی پر فنڈز اصل والیٹ پر واپس کرتی ہے۔",
    "MRC GlobalPay اگریگیٹر پر {from}/{to} سواپ۔ ہم 700+ لیکویڈیٹی وینیوز اسکین کرتے ہیں اور بہترین عمل درآمد پر روٹ، 60 سیکنڈ میں آن چین تصفیہ۔ MSB C100000015۔",
    "{from} کو {to} سے بدلنا ہے؟ فوری کوٹ حاصل کریں، 60 سیکنڈ کے لیے ریٹ لاک کریں اور فنڈز بھیجیں — تصفیہ براہ راست والیٹ پر، اکاؤنٹ نہیں، انتظار نہیں۔",
    "شفاف 0.4% فیس اور لائیو مجموعی ریٹس کے ساتھ {from} سے {to} کرپٹو ایکسچینج۔ کینیڈین MSB، FINTRAC نگران، غیر تحویلی، 24/7 تصفیہ۔",
    "50,000+ صارفین کے اعتماد والے ادارہ گریڈ اگریگیٹر پر {from} کو {to} میں تبدیل کریں۔ تصفیہ میڈین < 60 سیکنڈ، اکاؤنٹ نہیں، KYC نہیں، source-back پالیسی۔",
    "700+ ایکسچینجز پر اسمارٹ لیکویڈیٹی روٹنگ سے چلنے والا {from} → {to} سواپ۔ فنڈز ایک منٹ سے کم میں آپ کی والیٹ پر طے ہوتے ہیں۔ کینیڈین MSB، 0.4% فیس۔",
    "ہمارے 700-ذریعہ اگریگیٹر سے بہترین ریٹ گارنٹی کے ساتھ {from} کو {to} سے بدلیں۔ سائن اپ نہیں، ہولڈنگ مدت نہیں، نکاسی قطار نہیں — خالص غیر تحویلی عمل درآمد۔",
    "فوری تصفیہ اور ریٹ لاک تحفظ کے ساتھ 24/7 {from} کو {to} سے سواپ کریں۔ کینیڈین MSB C100000015، کم از کم $0.30، 0.4% فیس، ہر L1 اور L2 پر تعاون یافتہ۔",
    "رفتار کے لیے بنایا گیا {from} سے {to} تبدیلی: 700+ وینیوز سے مجموعی کوٹس، ذیلی منٹ تصفیہ، کسٹڈی نہیں، حد سے کم KYC نہیں۔ قابل اعتماد MSB لائسنس یافتہ پلیٹ فارم۔",
    "2026 میں {from} کو {to} سے بدلنے کا بہترین طریقہ: لائیو مجموعی ریٹس، 0.4% فیس، تصفیہ < 60 سیکنڈ، اکاؤنٹ نہیں۔ کینیڈین MSB رجسٹرڈ (C100000015)۔",
    "اپنے {from} کو {to} میں ایک غیر تحویلی روٹنگ انجن کے ذریعے تبدیل کریں جو 700+ ایکسچینجز اسکین کرتا ہے۔ ایک منٹ سے کم میں تصفیہ، KYC نہیں، نکاسی کیپ نہیں، کم از کم $0.30۔",
    "MRC GlobalPay پر {from} سے {to} سواپ — کینیڈین MSB ریگولیشنز کے تحت لائسنس یافتہ اگریگیٹر۔ 700+ لیکویڈیٹی ذرائع، شفاف 0.4% فیس، فوری آن چین تصفیہ۔",
    "{from} → {to} تجارت مکمل ایڈریس شفافیت اور source-back پالیسی کے ساتھ۔ ہم 700+ وینیوز جمع کرتے ہیں اور < 60 سیکنڈ میں والیٹ پر تصفیہ کرتے ہیں۔ MSB لائسنس یافتہ۔",
    "لائیو {from}/{to} ریٹ انجن: کوٹ کو 60 سیکنڈ کے لیے لاک کریں، فنڈز بھیجیں، {to} براہ راست وصول کریں۔ رجسٹریشن نہیں، KYC نہیں، کم از کم $0.30۔ کینیڈین MSB C100000015۔",
  ],
  he: [
    "המרת {from} ל-{to} תוך פחות מ-60 שניות עם ניתוב לא משמורני בין 700+ מקורות נזילות. ללא חשבון, ללא KYC, ללא תורי משיכה. MSB קנדי C100000015.",
    "החלפת {from} ל-{to} בשער שוק מצרפי עם עמלת ניתוב שקופה של 0.4%. הכספים מסולקים ישירות לארנק שלך — לעולם לא נחזיק בנכסים. רישוי MSB.",
    "החלפת {from} ל-{to} ללא הרשמה או בדיקות זהות. שערים בזמן אמת מ-700+ זירות, סליקה 24/7, מינימום $0.30, סליקה מיידית on-chain.",
    "קנו {to} עם {from} דרך מנוע הסוואפ הלא משמורני של MRC GlobalPay. סליקה תוך פחות מ-60 שניות, עמלה שקופה 0.4%, ללא חשבון, רשום MSB קנדי.",
    "סוואפ מיידי {from} ל-{to} המצרף ציטוטים מ-700+ בורסות לביצוע הטוב ביותר. ללא הרשמה, ללא מינימום מעל $0.30, מסולק ישירות לארנק.",
    "סחרו {from} תמורת {to} בבטחה תחת פיקוח MSB קנדי (FINTRAC #C100000015). סליקה on-chain תוך פחות מ-60 שניות, עמלת ניתוב שקופה 0.4%, ללא מגבלות משיכה.",
    "המירו {from} ל-{to} היום בשער המצרפי הטוב ביותר מ-700+ ספקי נזילות. ללא הרשמה, ללא KYC, ללא הגבלות החזקה — מסולק ישירות לכתובת שלך.",
    "סוואפ קריפטו {from} ל-{to} המנותב בין 700+ בורסות ומצרפי DEX לספרד הצמוד ביותר. לא משמורני, רישוי MSB, סליקה תוך פחות מדקה, מינימום $0.30.",
    "המרה מהירה {from}→{to} עם עמלה שקופה של 0.4% וללא ספרדים נסתרים. פרטי, לא משמורני, MSB קנדי, נתמך בכל הרשתות הראשיות.",
    "החלפת {from} ל-{to} בשער שוק עם סליקה מיידית וללא הרשמה. בשימוש 50,000+ סוחרים. MSB C100000015, מדיניות החזר source-back.",
    "{from} → {to} תוך פחות מדקה. MRC GlobalPay מצרפת 700+ מקורות נזילות למציאת בריכה עמוקה ומנתבת את הסוואפ ישירות לארנק שלך. ללא KYC.",
    "רוצים להמיר {from} ל-{to}? הראוטר החכם שלנו משווה 700+ ספקים בזמן אמת ומבצע מול הציטוט הטוב ביותר. לא משמורני, MSB, מינימום $0.30.",
    "החלפת {from} ל-{to} בפלטפורמה עם רישוי MSB קנדי תחת פיקוח FINTRAC. חציון סליקה פחות מ-60 שניות, עמלה שקופה 0.4%, ללא צורך ביצירת חשבון.",
    "שער חי {from} ל-{to} מתעדכן בכל שנייה. נעלו את השער, שלחו כספים, קבלו {to} ישירות לארנק — ללא משמורת, ללא חשבון, ללא מינימום מעל $0.30.",
    "קבלו את השער הטוב ביותר {from} ל-{to} מצרפי מ-700+ בורסות בזמן אמת. הכספים לעולם לא נוגעים במאזן שלנו — ניתוב לא משמורני טהור תחת רישוי MSB.",
    "המירו {from} ל-{to} עם סליקה תת-דקתית וללא חיכוך הרשמה. עמלת ניתוב שקופה 0.4%, מינימום $0.30, נתמך בכל השרשראות הראשיות בשנת 2026.",
    "סחרו {from} תמורת {to} בפרטיות ובאבטחה. ללא אימייל, ללא טלפון, ללא KYC לסוואפים מתחת לסף. מדיניות source-back מחזירה כספים לארנק המקור בכשלים.",
    "סוואפ {from}/{to} במצרף MRC GlobalPay. אנו סורקים 700+ זירות נזילות ומנתבים לביצוע הטוב ביותר, סליקה on-chain תוך פחות מ-60 שניות. MSB C100000015.",
    "צריכים להחליף {from} ל-{to}? קבלו ציטוט מיידי, נעלו את השער ל-60 שניות ושלחו כספים — הסליקה הולכת ישירות לארנק שלכם, ללא חשבון, ללא המתנה.",
    "בורסת קריפטו {from} ל-{to} עם עמלות שקופות של 0.4% ושערים מצרפיים חיים. MSB קנדי, מפוקח FINTRAC, לא משמורני, סליקה 24/7.",
    "המירו {from} ל-{to} במצרף ברמה מוסדית בו בוטחים 50,000+ משתמשים. חציון סליקה פחות מ-60 שניות, ללא חשבון, ללא KYC, מדיניות source-back.",
    "{from} → {to} סוואפ המופעל על ידי ניתוב נזילות חכם בין 700+ בורסות. הכספים מסולקים לארנק שלך תוך פחות מדקה. MSB קנדי, עמלת ניתוב 0.4%.",
    "החליפו {from} תמורת {to} עם הבטחת השער הטוב ביותר ממצרף 700 המקורות שלנו. ללא הרשמה, ללא תקופת החזקה, ללא תורים — ביצוע לא משמורני טהור.",
    "סוואפ {from} ל-{to} 24/7 עם סליקה מיידית והגנת נעילת שער. MSB קנדי C100000015, מינימום $0.30, עמלה שקופה 0.4%, נתמך בכל L1 ו-L2.",
    "המרת {from} ל-{to} בנויה למהירות: ציטוטים מצרפיים מ-700+ זירות, סליקה תת-דקתית, ללא משמורת, ללא KYC מתחת לסף. פלטפורמה עם רישוי MSB.",
    "הדרך הטובה ביותר להחליף {from} תמורת {to} ב-2026: שערים מצרפיים חיים, עמלה שקופה 0.4%, סליקה פחות מ-60 שניות, ללא חשבון. רשום MSB קנדי (C100000015).",
    "המירו את ה-{from} שלכם ל-{to} דרך מנוע ניתוב לא משמורני הסורק 700+ בורסות. סליקה תוך פחות מדקה, ללא KYC, ללא תקרת משיכה, מינימום סוואפ $0.30.",
    "סוואפ {from} ל-{to} ב-MRC GlobalPay — המצרף בעל הרישיון תחת תקנות MSB קנדיות. 700+ מקורות נזילות, עמלת ניתוב שקופה 0.4%, סליקה on-chain מיידית.",
    "סחרו {from} → {to} בשקיפות מלאה של כתובות ומדיניות source-back. אנו מצרפים 700+ זירות וסולקים לארנק שלכם תוך פחות מ-60 שניות. רישוי MSB.",
    "מנוע שער חי {from}/{to}: נעלו ציטוט ל-60 שניות, שלחו כספים, קבלו {to} ישירות. ללא הרשמה, ללא KYC, ללא מינימום מעל $0.30. MSB קנדי C100000015.",
  ],
  af: [
    "Omskep {from} na {to} in minder as 60 sekondes met nie-bewaringsroetering oor 700+ likiditeitsbronne. Geen rekening, geen KYC, geen onttrekkingsrye. Kanadese MSB C100000015.",
    "Ruil {from} vir {to} teen die geaggregeerde markkoers met 'n deursigtige 0.4% roeteringsfooi. Fondse vereffen direk na jou wallet — ons hou nooit jou bates aan nie. MSB-gelisensieer.",
    "Omruiling {from} na {to} sonder registrasie of identiteitskontroles. Intydse koerse uit 700+ beurse, 24/7 uitvoering, $0.30 minimum, oombliklike on-chain vereffening.",
    "Koop {to} met {from} deur MRC GlobalPay se nie-bewaringsruilenjin. Vereffening in minder as 60 sekondes, deursigtige 0.4% fooi, geen rekening nodig, Kanadese MSB-geregistreer.",
    "Onmiddellike {from} na {to} ruil wat aanhalings van 700+ beurse aggregeer vir die beste uitvoering. Geen registrasie, geen minimum bo $0.30, vereffen direk na jou wallet.",
    "Verhandel {from} vir {to} veilig onder Kanadese MSB-toesig (FINTRAC #C100000015). On-chain vereffening < 60s, deursigtige 0.4% roeteringsfooi, geen onttrekkingslimiete.",
    "Omskep {from} in {to} vandag teen die beste geaggregeerde koers van 700+ likiditeitsverskaffers. Geen registrasie, geen KYC, geen houlimiete — vereffen direk na jou adres.",
    "{from} na {to} kripto-ruil wat oor 700+ beurse en DEX-aggregators geroete word vir die strakste spreiding. Nie-bewaring, MSB-gelisensieer, vereffening < 60s, $0.30 minimum.",
    "Vinnige {from}→{to} omskakeling met deursigtige 0.4% fooi en geen verborge spreidings. Privaat, nie-bewaring, Kanadese MSB-geregistreer, ondersteun op elke groot netwerk.",
    "Ruil {from} na {to} teen markkoers met oombliklike vereffening en geen registrasie. Vertrou deur 50,000+ handelaars wêreldwyd. MSB C100000015, source-back terugbetalingsbeleid.",
    "{from} → {to} in minder as 'n minuut. MRC GlobalPay aggregeer 700+ likiditeitsbronne om die diepste poel te vind en roete die ruil direk na jou wallet. Geen KYC vereis.",
    "Wil jy {from} na {to} omskep? Ons slim roeteerder vergelyk 700+ verskaffers in reële tyd en voer uit teen die beste aanhaling. Nie-bewaring, MSB, $0.30 minimum.",
    "Ruil {from} vir {to} op 'n Kanadees MSB-geregistreerde platform met FINTRAC-toesig. Mediaan vereffening < 60s, 0.4% deursigtige fooi, geen rekeningskepping nodig.",
    "{from} na {to} regstreekse koers wat elke sekonde opgedateer word. Sluit jou koers, stuur fondse, ontvang {to} direk na jou wallet — geen bewaring, geen rekening, geen minimum bo $0.30.",
    "Kry die beste {from} na {to} koers wat in reële tyd uit 700+ beurse geaggregeer word. Fondse raak nooit ons balansstaat — suiwer nie-bewaringsroetering onder Kanadese MSB-lisensie.",
    "Omskep {from} in {to} met sub-minuut vereffening en zero registrasie-friksie. 0.4% deursigtige roeteringsfooi, $0.30 minimum, ondersteun oor alle groot kettings in 2026.",
    "Verhandel {from} vir {to} privaat en veilig. Geen e-pos, geen telefoon, geen KYC vir ruilings onder die drempel. Source-back beleid stuur fondse terug na oorsprongwallet by mislukkings.",
    "{from}/{to} ruil op die MRC GlobalPay aggregator. Ons skandeer 700+ likiditeitsplekke en roete na die beste uitvoering, vereffen on-chain in minder as 60 sekondes. MSB C100000015.",
    "Moet jy {from} na {to} ruil? Kry 'n oombliklike aanhaling, sluit die koers vir 60 sekondes en stuur fondse — vereffening gebeur direk na jou wallet, geen rekening, geen wagtyd.",
    "{from} na {to} kripto-uitruil met deursigtige 0.4% fooie en regstreekse geaggregeerde koerse. Kanadese MSB-geregistreer, FINTRAC-toesig, nie-bewaring, 24/7 vereffening.",
    "Omskep {from} na {to} op die institusionele-graad aggregator wat deur 50,000+ gebruikers vertrou word. Sub-60s mediaan vereffening, geen rekening, geen KYC, source-back beleid.",
    "{from} → {to} ruil aangedryf deur slim likiditeitsroetering oor 700+ beurse. Fondse vereffen na jou wallet in minder as 'n minuut. Kanadese MSB, deursigtige 0.4% roeteringsfooi.",
    "Ruil {from} vir {to} met die beste koers waarborg van ons 700-bron aggregator. Geen registrasie, geen houperiode, geen onttrekkingsry — suiwer nie-bewaring uitvoering.",
    "Ruil {from} na {to} 24/7 met oombliklike vereffening en koers-sluit beskerming. Kanadese MSB C100000015, $0.30 minimum, deursigtige 0.4% fooi, ondersteun oor elke L1 en L2.",
    "{from} na {to} omskakeling gebou vir spoed: geaggregeerde aanhalings van 700+ plekke, sub-minuut vereffening, geen bewaring, geen KYC onder drempel. Vertroude MSB-gelisensieerde platform.",
    "Beste manier om {from} vir {to} te ruil in 2026: regstreekse geaggregeerde koerse, 0.4% deursigtige fooi, sub-60s vereffening, geen rekening nodig. Kanadese MSB-geregistreer (C100000015).",
    "Omskep jou {from} na {to} deur 'n nie-bewaringsroeteringsenjin wat 700+ beurse skandeer. Vereffen in minder as 'n minuut, geen KYC, geen onttrekkingskap, $0.30 minimum ruil.",
    "{from} na {to} ruil op MRC GlobalPay — die aggregator gelisensieer onder Kanadese MSB-regulasies. 700+ likiditeitsbronne, deursigtige 0.4% fooi, oombliklike on-chain vereffening.",
    "Verhandel {from} → {to} met volle adres-deursigtigheid en source-back terugbetalingsbeleid. Ons aggregeer 700+ plekke en vereffen na jou wallet in < 60s. MSB-gelisensieer.",
    "Lewendige {from}/{to} koers-enjin: sluit 'n aanhaling vir 60 sekondes, stuur fondse, ontvang {to} direk. Geen registrasie, geen KYC, geen minimum bo $0.30. Kanadese MSB C100000015.",
  ],
  hi: [
    "{from} को {to} में 60 सेकंड से कम में बदलें, 700+ तरलता स्रोतों के बीच नॉन-कस्टोडियल रूटिंग के साथ। कोई खाता नहीं, कोई KYC नहीं, कोई निकासी कतार नहीं। कनाडाई MSB C100000015।",
    "{from} को {to} से लाइव एग्रीगेटेड बाजार दर पर बदलें, पारदर्शी 0.4% रूटिंग शुल्क के साथ। फंड सीधे आपके वॉलेट में सेटल होते हैं — हम कभी आपकी संपत्ति नहीं रखते। MSB लाइसेंस प्राप्त।",
    "{from} से {to} एक्सचेंज बिना पंजीकरण या पहचान जांच के। 700+ वेन्यू से रीयल-टाइम दरें, 24/7 निष्पादन, $0.30 न्यूनतम, तत्काल ऑन-चेन निपटान।",
    "MRC GlobalPay के नॉन-कस्टोडियल स्वैप इंजन के माध्यम से {from} से {to} खरीदें। 60 सेकंड से कम सेटलमेंट, पारदर्शी 0.4% शुल्क, कोई खाता नहीं, कनाडाई MSB-पंजीकृत।",
    "तत्काल {from} से {to} स्वैप जो सर्वश्रेष्ठ निष्पादन के लिए 700+ एक्सचेंजों से कोट एकत्र करता है। ज़ीरो साइन-अप, $0.30 के ऊपर कोई न्यूनतम नहीं, सीधे वॉलेट में सेटल।",
    "{from} को {to} से कनाडाई MSB निगरानी (FINTRAC #C100000015) के तहत सुरक्षित रूप से ट्रेड करें। 60 सेकंड से कम ऑन-चेन सेटलमेंट, पारदर्शी 0.4% रूटिंग शुल्क, कोई निकासी सीमा नहीं।",
    "आज {from} को {to} में 700+ तरलता प्रदाताओं से एग्रीगेटेड सर्वश्रेष्ठ दर पर बदलें। कोई पंजीकरण नहीं, कोई KYC नहीं, कोई होल्डिंग सीमा नहीं — सीधे आपके पते पर सेटल।",
    "{from} से {to} क्रिप्टो स्वैप 700+ एक्सचेंजों और DEX एग्रीगेटर्स के बीच टाइटेस्ट स्प्रेड के लिए रूट किया गया। नॉन-कस्टोडियल, MSB लाइसेंस, सब-मिनट सेटलमेंट, $0.30 न्यूनतम।",
    "तेज़ {from}→{to} रूपांतरण पारदर्शी 0.4% शुल्क और शून्य छिपे स्प्रेड के साथ। निजी, नॉन-कस्टोडियल, कनाडाई MSB-पंजीकृत, सभी प्रमुख नेटवर्क पर समर्थित।",
    "{from} को {to} में बाजार दर पर तत्काल सेटलमेंट और शून्य पंजीकरण के साथ बदलें। 50,000+ ट्रेडर्स द्वारा भरोसेमंद। MSB C100000015, source-back रिफंड नीति।",
    "{from} → {to} एक मिनट से कम में। MRC GlobalPay सबसे गहरा पूल खोजने के लिए 700+ तरलता स्रोतों को एग्रीगेट करता है, फिर स्वैप को सीधे आपके वॉलेट में रूट करता है। KYC आवश्यक नहीं।",
    "{from} को {to} में बदलना चाहते हैं? हमारा स्मार्ट राउटर रीयल-टाइम में 700+ प्रदाताओं की तुलना करता है और सर्वश्रेष्ठ कोट के विरुद्ध निष्पादित करता है। नॉन-कस्टोडियल, MSB, $0.30 न्यूनतम।",
    "FINTRAC निगरानी के साथ कनाडाई MSB-पंजीकृत प्लेटफ़ॉर्म पर {from} से {to} एक्सचेंज करें। सब-60 सेकंड माध्य सेटलमेंट, 0.4% पारदर्शी शुल्क, खाता बनाने की आवश्यकता नहीं।",
    "{from} से {to} लाइव दर हर सेकंड अपडेट होती है। अपनी दर लॉक करें, फंड भेजें, {to} सीधे अपने वॉलेट में प्राप्त करें — कोई कस्टडी नहीं, कोई खाता नहीं, $0.30 के ऊपर कोई न्यूनतम नहीं।",
    "रीयल-टाइम में 700+ एक्सचेंजों से एग्रीगेटेड सर्वश्रेष्ठ {from} से {to} दर प्राप्त करें। फंड कभी हमारी बैलेंस शीट को नहीं छूते — कनाडाई MSB लाइसेंस के तहत शुद्ध नॉन-कस्टोडियल रूटिंग।",
    "{from} को {to} में सब-मिनट सेटलमेंट और शून्य पंजीकरण घर्षण के साथ बदलें। 0.4% पारदर्शी रूटिंग शुल्क, $0.30 न्यूनतम, 2026 में सभी प्रमुख चेन पर समर्थित।",
    "{from} को {to} से निजी और सुरक्षित रूप से ट्रेड करें। थ्रेशोल्ड के नीचे स्वैप के लिए कोई ईमेल, फ़ोन, KYC नहीं। source-back नीति विफलता पर मूल वॉलेट में फंड लौटाती है।",
    "MRC GlobalPay एग्रीगेटर पर {from}/{to} स्वैप। हम 700+ तरलता वेन्यू स्कैन करते हैं और सर्वश्रेष्ठ निष्पादन के लिए रूट करते हैं, 60 सेकंड से कम में ऑन-चेन सेटल। MSB C100000015।",
    "{from} को {to} में स्वैप करने की आवश्यकता है? तत्काल कोट प्राप्त करें, दर 60 सेकंड के लिए लॉक करें, और फंड भेजें — सेटलमेंट सीधे आपके वॉलेट में, कोई खाता नहीं, कोई प्रतीक्षा नहीं।",
    "{from} से {to} क्रिप्टो एक्सचेंज पारदर्शी 0.4% शुल्क और लाइव एग्रीगेटेड दरों के साथ। कनाडाई MSB-पंजीकृत, FINTRAC-पर्यवेक्षित, नॉन-कस्टोडियल, 24/7 सेटलमेंट।",
    "50,000+ उपयोगकर्ताओं द्वारा भरोसेमंद संस्थागत-ग्रेड एग्रीगेटर पर {from} से {to} में बदलें। सब-60 सेकंड माध्य सेटलमेंट, कोई खाता नहीं, कोई KYC नहीं, source-back नीति।",
    "{from} → {to} स्वैप 700+ एक्सचेंजों के बीच स्मार्ट तरलता रूटिंग द्वारा संचालित। फंड एक मिनट से कम में आपके वॉलेट में सेटल होते हैं। कनाडाई MSB, पारदर्शी 0.4% रूटिंग शुल्क।",
    "{from} को {to} से हमारे 700-स्रोत एग्रीगेटर से सर्वश्रेष्ठ दर गारंटी के साथ बदलें। कोई साइन-अप नहीं, कोई होल्डिंग अवधि नहीं, कोई निकासी कतार नहीं — शुद्ध नॉन-कस्टोडियल निष्पादन।",
    "{from} को {to} में 24/7 तत्काल सेटलमेंट और रेट-लॉक सुरक्षा के साथ स्वैप करें। कनाडाई MSB C100000015, $0.30 न्यूनतम, पारदर्शी 0.4% शुल्क, हर L1 और L2 पर समर्थित।",
    "{from} से {to} रूपांतरण गति के लिए बनाया गया: 700+ वेन्यू से एग्रीगेटेड कोट, सब-मिनट सेटलमेंट, कोई कस्टडी नहीं, थ्रेशोल्ड के तहत कोई KYC नहीं। भरोसेमंद MSB-लाइसेंस प्राप्त।",
    "2026 में {from} को {to} से स्वैप करने का सर्वश्रेष्ठ तरीका: लाइव एग्रीगेटेड दरें, 0.4% पारदर्शी शुल्क, सब-60s सेटलमेंट, खाता आवश्यक नहीं। कनाडाई MSB-पंजीकृत (C100000015)।",
    "अपने {from} को {to} में नॉन-कस्टोडियल रूटिंग इंजन के माध्यम से बदलें जो 700+ एक्सचेंज स्कैन करता है। एक मिनट से कम में सेटल, कोई KYC नहीं, कोई निकासी कैप नहीं, $0.30 न्यूनतम।",
    "MRC GlobalPay पर {from} से {to} स्वैप — कनाडाई MSB नियमों के तहत लाइसेंस प्राप्त एग्रीगेटर। 700+ तरलता स्रोत, पारदर्शी 0.4% शुल्क, तत्काल ऑन-चेन सेटलमेंट।",
    "{from} → {to} पूर्ण पता पारदर्शिता और source-back रिफंड नीति के साथ ट्रेड करें। हम 700+ वेन्यू एग्रीगेट करते हैं और 60s से कम में आपके वॉलेट में सेटल करते हैं। MSB-लाइसेंस।",
    "लाइव {from}/{to} दर इंजन: 60 सेकंड के लिए कोट लॉक करें, फंड भेजें, {to} सीधे प्राप्त करें। कोई पंजीकरण नहीं, कोई KYC नहीं, $0.30 के ऊपर कोई न्यूनतम नहीं। कनाडाई MSB C100000015।",
  ],
  vi: [
    "Đổi {from} sang {to} trong dưới 60 giây với định tuyến phi lưu ký qua 700+ nguồn thanh khoản. Không tài khoản, không KYC, không hàng đợi rút. MSB Canada C100000015.",
    "Hoán đổi {from} lấy {to} ở tỷ giá thị trường tổng hợp trực tiếp với phí định tuyến minh bạch 0.4%. Tiền thanh toán trực tiếp về ví của bạn — chúng tôi không bao giờ giữ tài sản. MSB cấp phép.",
    "Sàn {from} sang {to} không đăng ký hay kiểm tra danh tính. Tỷ giá thời gian thực từ 700+ sàn, thực hiện 24/7, tối thiểu $0.30, thanh toán on-chain tức thì.",
    "Mua {to} bằng {from} qua động cơ swap phi lưu ký của MRC GlobalPay. Thanh toán dưới 60 giây, phí minh bạch 0.4%, không cần tài khoản, đăng ký MSB Canada.",
    "Swap tức thì {from} sang {to} tổng hợp báo giá từ 700+ sàn cho thực thi tốt nhất. Không đăng ký, không tối thiểu trên $0.30, thanh toán thẳng vào ví.",
    "Giao dịch {from} lấy {to} an toàn dưới sự giám sát MSB Canada (FINTRAC #C100000015). Thanh toán on-chain dưới 60 giây, phí định tuyến minh bạch 0.4%, không giới hạn rút.",
    "Đổi {from} thành {to} hôm nay với tỷ giá tổng hợp tốt nhất từ 700+ nhà cung cấp thanh khoản. Không đăng ký, không KYC, không giới hạn nắm giữ — thanh toán thẳng vào địa chỉ.",
    "Swap crypto {from} sang {to} định tuyến qua 700+ sàn và bộ tổng hợp DEX cho spread chặt nhất. Phi lưu ký, MSB cấp phép, thanh toán dưới phút, tối thiểu $0.30.",
    "Chuyển đổi nhanh {from}→{to} với phí minh bạch 0.4% và không spread ẩn. Riêng tư, phi lưu ký, MSB Canada, hỗ trợ trên mọi mạng lưới chính.",
    "Hoán đổi {from} lấy {to} ở giá thị trường với thanh toán tức thì và không đăng ký. Được tin dùng bởi 50.000+ trader. MSB C100000015, chính sách hoàn tiền source-back.",
    "{from} → {to} dưới một phút. MRC GlobalPay tổng hợp 700+ nguồn thanh khoản để tìm pool sâu nhất, sau đó định tuyến swap thẳng vào ví của bạn. Không cần KYC.",
    "Muốn đổi {from} sang {to}? Bộ định tuyến thông minh của chúng tôi so sánh 700+ nhà cung cấp theo thời gian thực và thực thi với báo giá tốt nhất. Phi lưu ký, MSB, tối thiểu $0.30.",
    "Đổi {from} lấy {to} trên nền tảng MSB Canada với giám sát FINTRAC. Thanh toán trung vị dưới 60 giây, phí minh bạch 0.4%, không cần tạo tài khoản.",
    "Tỷ giá trực tiếp {from} sang {to} cập nhật mỗi giây. Khóa tỷ giá, gửi tiền, nhận {to} trực tiếp về ví — không lưu ký, không tài khoản, không tối thiểu trên $0.30.",
    "Nhận tỷ giá {from} sang {to} tốt nhất tổng hợp từ 700+ sàn theo thời gian thực. Tiền không bao giờ chạm bảng cân đối của chúng tôi — định tuyến phi lưu ký thuần dưới giấy phép MSB.",
    "Đổi {from} sang {to} với thanh toán dưới phút và không ma sát đăng ký. Phí định tuyến minh bạch 0.4%, tối thiểu $0.30, hỗ trợ trên mọi chuỗi chính trong 2026.",
    "Giao dịch {from} lấy {to} riêng tư và an toàn. Không email, không điện thoại, không KYC cho swap dưới ngưỡng. Chính sách source-back trả tiền về ví gốc khi thất bại.",
    "Swap {from}/{to} trên bộ tổng hợp MRC GlobalPay. Chúng tôi quét 700+ địa điểm thanh khoản và định tuyến đến thực thi tốt nhất, thanh toán on-chain dưới 60 giây. MSB C100000015.",
    "Cần swap {from} sang {to}? Nhận báo giá tức thì, khóa tỷ giá 60 giây và gửi tiền — thanh toán đi thẳng vào ví của bạn, không tài khoản, không chờ đợi.",
    "Sàn crypto {from} sang {to} với phí minh bạch 0.4% và tỷ giá tổng hợp trực tiếp. MSB Canada, giám sát FINTRAC, phi lưu ký, thanh toán 24/7.",
    "Đổi {from} sang {to} trên bộ tổng hợp cấp tổ chức được tin dùng bởi 50.000+ người dùng. Thanh toán trung vị dưới 60 giây, không tài khoản, không KYC, chính sách source-back.",
    "{from} → {to} swap được hỗ trợ bởi định tuyến thanh khoản thông minh qua 700+ sàn. Tiền thanh toán về ví trong dưới một phút. MSB Canada, phí định tuyến minh bạch 0.4%.",
    "Hoán đổi {from} lấy {to} với đảm bảo tỷ giá tốt nhất từ bộ tổng hợp 700 nguồn của chúng tôi. Không đăng ký, không thời gian giữ, không hàng đợi — thực thi phi lưu ký thuần.",
    "Swap {from} sang {to} 24/7 với thanh toán tức thì và bảo vệ khóa tỷ giá. MSB Canada C100000015, tối thiểu $0.30, phí minh bạch 0.4%, hỗ trợ trên mọi L1 và L2.",
    "Chuyển đổi {from} sang {to} được xây dựng cho tốc độ: báo giá tổng hợp từ 700+ địa điểm, thanh toán dưới phút, không lưu ký, không KYC dưới ngưỡng. Nền tảng MSB cấp phép tin cậy.",
    "Cách tốt nhất để swap {from} lấy {to} trong 2026: tỷ giá tổng hợp trực tiếp, phí minh bạch 0.4%, thanh toán dưới 60 giây, không cần tài khoản. MSB Canada đăng ký (C100000015).",
    "Đổi {from} của bạn sang {to} qua động cơ định tuyến phi lưu ký quét 700+ sàn. Thanh toán dưới một phút, không KYC, không trần rút, swap tối thiểu $0.30.",
    "Swap {from} sang {to} trên MRC GlobalPay — bộ tổng hợp được cấp phép theo quy định MSB Canada. 700+ nguồn thanh khoản, phí minh bạch 0.4%, thanh toán on-chain tức thì.",
    "Giao dịch {from} → {to} với minh bạch địa chỉ đầy đủ và chính sách hoàn tiền source-back. Chúng tôi tổng hợp 700+ địa điểm và thanh toán về ví trong dưới 60 giây. MSB cấp phép.",
    "Động cơ tỷ giá trực tiếp {from}/{to}: khóa báo giá 60 giây, gửi tiền, nhận {to} trực tiếp. Không đăng ký, không KYC, không tối thiểu trên $0.30. MSB Canada C100000015.",
  ],
  tr: [
    "{from}'ı {to}'a 60 saniyeden kısa sürede dönüştürün, 700+ likidite kaynağı arasında emanetsiz yönlendirme ile. Hesap yok, KYC yok, çekim kuyruğu yok. Kanada MSB C100000015.",
    "{from}'ı {to} ile canlı toplu piyasa oranında değiştirin, şeffaf %0.4 yönlendirme ücretiyle. Fonlar doğrudan cüzdanınıza gelir — varlıklarınızı asla emanet almayız. MSB lisanslı.",
    "{from}'dan {to}'a kayıt veya kimlik kontrolü olmadan değişim. 700+ borsadan gerçek zamanlı oranlar, 7/24 yürütme, $0.30 minimum, anında zincir-üzerinde ödeme.",
    "MRC GlobalPay'in emanetsiz swap motoru üzerinden {from} ile {to} satın alın. 60 saniyeden kısa ödeme, şeffaf %0.4 ücret, hesap yok, Kanada MSB-kayıtlı.",
    "Anlık {from} → {to} swap'ı en iyi yürütme için 700+ borsadan teklif toplar. Sıfır kayıt, $0.30 üzerinde minimum yok, doğrudan cüzdana ödeme.",
    "{from}'ı {to} ile Kanada MSB denetimi (FINTRAC #C100000015) altında güvenle takas edin. 60 saniyeden kısa zincir-üstü ödeme, şeffaf %0.4 yönlendirme ücreti, çekim limiti yok.",
    "{from}'ı bugün {to}'a 700+ likidite sağlayıcısından toplu en iyi oranda dönüştürün. Kayıt yok, KYC yok, tutma limiti yok — doğrudan adresinize ödeme.",
    "{from} → {to} kripto swap'ı en sıkı spread için 700+ borsa ve DEX toplayıcı arasında yönlendirilir. Emanetsiz, MSB lisanslı, dakika altı ödeme, $0.30 minimum.",
    "Hızlı {from}→{to} dönüşümü şeffaf %0.4 ücret ve sıfır gizli spread ile. Özel, emanetsiz, Kanada MSB-kayıtlı, her büyük ağda destekli.",
    "{from}'ı {to}'a piyasa fiyatından anında ödeme ve sıfır kayıtla değiştirin. Dünya çapında 50.000+ trader tarafından güveniliyor. MSB C100000015, source-back iade politikası.",
    "{from} → {to} bir dakikadan az sürede. MRC GlobalPay en derin havuzu bulmak için 700+ likidite kaynağını toplar, ardından swap'ı doğrudan cüzdanınıza yönlendirir. KYC gerekmez.",
    "{from}'ı {to}'a dönüştürmek mi istiyorsunuz? Akıllı yönlendiricimiz 700+ sağlayıcıyı gerçek zamanlı karşılaştırır ve en iyi teklife karşı yürütür. Emanetsiz, MSB, $0.30 minimum.",
    "FINTRAC denetimli Kanada MSB-kayıtlı platformda {from}'ı {to} ile değiştirin. Medyan ödeme < 60s, şeffaf %0.4 ücret, hesap oluşturmaya gerek yok.",
    "Saniyede güncellenen canlı {from} → {to} oranı. Oranınızı kilitleyin, fon gönderin, {to}'yu doğrudan cüzdanınıza alın — emanet yok, hesap yok, $0.30 üzerinde minimum yok.",
    "Gerçek zamanlı 700+ borsadan toplanan en iyi {from} → {to} oranını alın. Fonlar bilançomuza asla dokunmaz — Kanada MSB lisansı altında saf emanetsiz yönlendirme.",
    "{from}'ı {to}'a dakika altı ödeme ve sıfır kayıt sürtünmesiyle dönüştürün. Şeffaf %0.4 yönlendirme ücreti, $0.30 minimum, 2026'da tüm büyük zincirlerde destekli.",
    "{from}'ı {to} ile özel ve güvenli takas edin. Eşik altındaki swap'lar için e-posta, telefon, KYC yok. Source-back politikası başarısızlıklarda fonları kaynak cüzdana iade eder.",
    "MRC GlobalPay toplayıcısında {from}/{to} swap. 700+ likidite mekanını tarar ve en iyi yürütmeye yönlendiririz, 60 saniyeden kısa zincir-üstü ödeme. MSB C100000015.",
    "{from}'ı {to}'a swap etmeniz mi gerekiyor? Anlık teklif alın, oranı 60 saniye kilitleyin ve fon gönderin — ödeme doğrudan cüzdanınıza, hesap yok, bekleme yok.",
    "{from} → {to} kripto borsası şeffaf %0.4 ücretler ve canlı toplu oranlarla. Kanada MSB-kayıtlı, FINTRAC denetimli, emanetsiz, 7/24 ödeme.",
    "50.000+ kullanıcının güvendiği kurumsal sınıf toplayıcıda {from}'ı {to}'a dönüştürün. Medyan ödeme < 60s, hesap yok, KYC yok, source-back politikası.",
    "{from} → {to} swap, 700+ borsa arasında akıllı likidite yönlendirmesi ile destekleniyor. Fonlar bir dakikadan kısa sürede cüzdanınıza ulaşır. Kanada MSB, şeffaf %0.4 yönlendirme ücreti.",
    "{from}'ı {to} ile 700-kaynak toplayıcımızdan en iyi oran garantisiyle değiştirin. Kayıt yok, tutma süresi yok, çekim kuyruğu yok — saf emanetsiz yürütme.",
    "{from}'ı {to}'a 7/24 anında ödeme ve oran-kilit korumasıyla swap edin. Kanada MSB C100000015, $0.30 minimum, şeffaf %0.4 ücret, her L1 ve L2'de destekli.",
    "{from} → {to} dönüşümü hız için inşa edildi: 700+ mekandan toplu teklifler, dakika altı ödeme, emanet yok, eşik altında KYC yok. Güvenilir MSB-lisanslı platform.",
    "2026'da {from}'ı {to} ile swap etmenin en iyi yolu: canlı toplu oranlar, şeffaf %0.4 ücret, 60 saniye altı ödeme, hesap gerekmez. Kanada MSB-kayıtlı (C100000015).",
    "{from}'ınızı {to}'a 700+ borsayı tarayan emanetsiz yönlendirme motoru üzerinden dönüştürün. Bir dakikadan kısa sürede ödeme, KYC yok, çekim tavanı yok, $0.30 minimum swap.",
    "MRC GlobalPay'de {from} → {to} swap — Kanada MSB düzenlemeleri altında lisanslı toplayıcı. 700+ likidite kaynağı, şeffaf %0.4 ücret, anında zincir-üstü ödeme.",
    "{from} → {to} tam adres şeffaflığı ve source-back iade politikasıyla işlem yapın. 700+ mekanı toplar ve cüzdanınıza < 60s'de öderiz. MSB lisanslı.",
    "Canlı {from}/{to} oran motoru: teklifi 60 saniye kilitleyin, fon gönderin, {to}'yu doğrudan alın. Kayıt yok, KYC yok, $0.30 üzerinde minimum yok. Kanada MSB C100000015.",
  ],
  uk: [
    "Конвертуйте {from} в {to} менше ніж за 60 секунд із некустодіальною маршрутизацією через 700+ джерел ліквідності. Без акаунту, без KYC, без черг на виведення. Канадська MSB C100000015.",
    "Обміняйте {from} на {to} за живим агрегованим ринковим курсом із прозорою комісією маршрутизації 0.4%. Кошти зараховуються прямо на ваш гаманець — ми ніколи не зберігаємо ваші активи. MSB ліцензована.",
    "Обмін {from} на {to} без реєстрації чи перевірки особи. Реальні курси з 700+ майданчиків, виконання 24/7, мінімум $0.30, миттєвий on-chain розрахунок.",
    "Купіть {to} за {from} через некустодіальний swap-двигун MRC GlobalPay. Розрахунок менше ніж за 60 секунд, прозора комісія 0.4%, без акаунту, зареєстровано MSB Канади.",
    "Миттєвий swap {from} на {to} агрегує котирування з 700+ бірж для найкращого виконання. Без реєстрації, без мінімуму понад $0.30, зараховується прямо на гаманець.",
    "Торгуйте {from} за {to} безпечно під канадським MSB наглядом (FINTRAC #C100000015). On-chain розрахунок < 60с, прозора комісія маршрутизації 0.4%, без лімітів виведення.",
    "Конвертуйте {from} в {to} сьогодні за найкращим агрегованим курсом з 700+ постачальників ліквідності. Без реєстрації, без KYC, без лімітів утримання — прямо на вашу адресу.",
    "{from} на {to} крипто-swap, маршрутизований через 700+ бірж і DEX-агрегаторів для найвужчого спреду. Некустодіальний, MSB ліцензований, розрахунок < 60с, мінімум $0.30.",
    "Швидка конвертація {from}→{to} з прозорою комісією 0.4% та нульовими прихованими спредами. Приватний, некустодіальний, MSB Канади, підтримка на всіх основних мережах.",
    "Обміняйте {from} на {to} за ринковим курсом з миттєвим розрахунком і нульовою реєстрацією. Довіра 50 000+ трейдерів. MSB C100000015, source-back політика повернення.",
    "{from} → {to} менше ніж за хвилину. MRC GlobalPay агрегує 700+ джерел ліквідності, щоб знайти найглибший пул, потім маршрутизує swap прямо на ваш гаманець. KYC не потрібно.",
    "Хочете конвертувати {from} в {to}? Наш розумний роутер порівнює 700+ постачальників в реальному часі та виконує проти найкращої котирувань. Некустодіальний, MSB, мінімум $0.30.",
    "Обміняйте {from} на {to} на канадській MSB-зареєстрованій платформі з наглядом FINTRAC. Медіана розрахунку < 60с, прозора комісія 0.4%, не потрібно створювати акаунт.",
    "Живий курс {from} на {to} оновлюється щосекунди. Заблокуйте курс, надішліть кошти, отримайте {to} прямо на гаманець — без зберігання, без акаунту, без мінімуму понад $0.30.",
    "Отримайте найкращий курс {from} на {to}, агрегований з 700+ бірж в реальному часі. Кошти ніколи не торкаються нашого балансу — чиста некустодіальна маршрутизація під ліцензією MSB.",
    "Конвертуйте {from} в {to} з суб-хвилинним розрахунком і нульовим тертям реєстрації. Прозора комісія маршрутизації 0.4%, мінімум $0.30, підтримка на всіх основних ланцюгах в 2026.",
    "Торгуйте {from} за {to} приватно і безпечно. Без email, без телефону, без KYC для swap-ів нижче порогу. Source-back політика повертає кошти на гаманець-джерело при збоях.",
    "{from}/{to} swap на агрегаторі MRC GlobalPay. Ми скануємо 700+ майданчиків ліквідності та маршрутизуємо до найкращого виконання, розрахунок on-chain менше 60с. MSB C100000015.",
    "Потрібно обміняти {from} на {to}? Отримайте миттєву котирувальну ціну, заблокуйте курс на 60с і надішліть кошти — розрахунок йде прямо на ваш гаманець, без акаунту, без очікування.",
    "{from} на {to} крипто-обмін з прозорими комісіями 0.4% та живими агрегованими курсами. MSB Канади, FINTRAC-наглядом, некустодіальний, розрахунок 24/7.",
    "Конвертуйте {from} в {to} на агрегаторі інституційного класу, якому довіряють 50 000+ користувачів. Медіана розрахунку < 60с, без акаунту, без KYC, source-back політика.",
    "{from} → {to} swap, що працює завдяки розумній маршрутизації ліквідності через 700+ бірж. Кошти зараховуються на ваш гаманець менше ніж за хвилину. MSB Канади, прозора комісія 0.4%.",
    "Обміняйте {from} на {to} з гарантією найкращого курсу від нашого агрегатора 700 джерел. Без реєстрації, без періоду утримання, без черг — чисте некустодіальне виконання.",
    "Swap {from} на {to} 24/7 з миттєвим розрахунком і захистом фіксації курсу. MSB Канади C100000015, мінімум $0.30, прозора комісія 0.4%, підтримка на кожному L1 і L2.",
    "Конвертація {from} в {to} побудована для швидкості: агреговані котирування з 700+ майданчиків, суб-хвилинний розрахунок, без зберігання, без KYC нижче порогу. Надійна MSB-ліцензована платформа.",
    "Найкращий спосіб обміняти {from} за {to} в 2026: живі агреговані курси, прозора комісія 0.4%, розрахунок < 60с, без акаунту. Зареєстровано MSB Канади (C100000015).",
    "Конвертуйте свій {from} в {to} через некустодіальний двигун маршрутизації, що сканує 700+ бірж. Розрахунок менше ніж за хвилину, без KYC, без обмеження виведення, мінімум $0.30.",
    "{from} на {to} swap на MRC GlobalPay — агрегатор, ліцензований під канадськими MSB-регуляціями. 700+ джерел ліквідності, прозора комісія 0.4%, миттєвий on-chain розрахунок.",
    "Торгуйте {from} → {to} з повною прозорістю адрес і source-back політикою повернення. Ми агрегуємо 700+ майданчиків і розраховуємо на ваш гаманець за < 60с. MSB ліцензований.",
    "Живий двигун курсів {from}/{to}: заблокуйте котирування на 60с, надішліть кошти, отримайте {to} напряму. Без реєстрації, без KYC, без мінімуму понад $0.30. MSB Канади C100000015.",
  ],
};

function interpolate(template: string, from: string, to: string): string {
  return template.replace(/\{from\}/g, from).replace(/\{to\}/g, to);
}

function generateContentJson(
  from: string,
  to: string,
  templateId: number
): Record<string, { title: string; description: string; h1: string }> {
  const content: Record<string, { title: string; description: string; h1: string }> = {};
  const titleIdx = templateId % 20;
  const descIdx = templateId % 10;
  const fromUp = from.toUpperCase();
  const toUp = to.toUpperCase();

  for (const lang of LANGS) {
    const titles = TITLE_TEMPLATES[lang] || TITLE_TEMPLATES.en;
    const descs = DESC_TEMPLATES[lang] || DESC_TEMPLATES.en;
    content[lang] = {
      title: interpolate(titles[titleIdx], fromUp, toUp),
      description: interpolate(descs[descIdx], fromUp, toUp),
      h1: interpolate(titles[titleIdx], fromUp, toUp).split("|")[0].trim(),
    };
  }
  return content;
}

/* ─────────── Main handler ─────────── */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const changeNowKey = Deno.env.get("CHANGENOW_API_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // ── 0. Parse mode (priority backfill bypasses alphabetical sweep) ──
  const url = new URL(req.url);
  const priorityMode = url.searchParams.get("priority") === "true";

  const BATCH_LIMIT = priorityMode ? 500 : 100;
  const MAINTENANCE_THRESHOLD = 50_000;
  const MAINTENANCE_INTERVAL_HOURS = 48;

  // Tier-1 tickers — combinatorially expanded into priority pairs
  const TIER1 = [
    "btc","eth","usdt","usdc","sol","xrp","bnb","ada","doge","trx",
    "ton","matic","dot","avax","link","ltc","bch","atom","near","apt",
    "arb","op","sui","hype","pepe","shib","xlm","etc","fil","icp",
    "xmr","dash","zec","algo","vet","aave","uni","mkr","comp","sand",
    "mana","axs","grt","ftm","kas","tia","inj","sei","jup","wld","paxg","xaut",
  ];

  try {
    // ── 1. Adaptive throttle ──
    const { count: pairsCount } = await supabase
      .from("pairs")
      .select("*", { count: "exact", head: true });

    const currentCount = pairsCount ?? 0;

    if (!priorityMode && currentCount >= MAINTENANCE_THRESHOLD) {
      const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
      if (currentHour % MAINTENANCE_INTERVAL_HOURS !== 0) {
        // Update state and exit early
        await supabase.from("sync_engine_state").update({
          last_run_at: new Date().toISOString(),
          pairs_count: currentCount,
          last_batch_size: 0,
          status: "skipped_maintenance",
          updated_at: new Date().toISOString(),
        }).eq("id", 1);

        return new Response(
          JSON.stringify({ status: "skipped", reason: "maintenance_phase", count: currentCount }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ── 2. Fetch available assets from ChangeNow ──
    let assets: Array<{ ticker: string; name: string; network: string; isActive: boolean }>;
    try {
      const resp = await fetch(
        "https://api.changenow.io/v2/exchange/currencies?active=true&flow=standard",
        { headers: { "x-changenow-api-key": changeNowKey } }
      );

      if (resp.status === 429) {
        throw new Error("RATE_LIMIT_429");
      }
      if (!resp.ok) {
        throw new Error(`ChangeNow API error: ${resp.status}`);
      }
      assets = await resp.json();
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      if (errMsg === "RATE_LIMIT_429") {
        await supabase.from("sync_engine_state").update({
          last_run_at: new Date().toISOString(),
          pairs_count: currentCount,
          last_error: "ChangeNow 429 rate limit hit",
          status: "rate_limited",
          updated_at: new Date().toISOString(),
        }).eq("id", 1);

        return new Response(
          JSON.stringify({ status: "error", reason: "rate_limited" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw e;
    }

    console.log(`ChangeNow returned ${Array.isArray(assets) ? assets.length : 'non-array'} assets`);

    // Deduplicate by base ticker (take first occurrence)
    const seen = new Set<string>();
    const uniqueTickers: string[] = [];
    for (const a of assets) {
      const t = a.ticker?.toLowerCase();
      // SEO thin-content guard: skip 1-2 char tickers (e.g. "j", "c", "0g", "b2").
      // These produce templated pages with no real brand content and would be
      // flagged by Google as auto-generated, harming the whole sitemap's crawl
      // reputation. Matches the public.get_valid_pair_slugs* RPC filter.
      if (t && t.length >= 3 && !seen.has(t) && a.isActive !== false) {
        seen.add(t);
        uniqueTickers.push(t);
      }
    }
    console.log(`Unique tickers (>=3 chars): ${uniqueTickers.length}`);

    // ── 3. Find new pairs not yet in the DB ──
    // Get ALL existing pairs to compare (paginated — Supabase caps at 1000 per query)
    const existingSet = new Set<string>();
    const PAIR_PAGE = 1000;
    let pairPage = 0;
    while (true) {
      const { data: chunk, error: chunkErr } = await supabase
        .from("pairs")
        .select("from_ticker, to_ticker")
        .range(pairPage * PAIR_PAGE, (pairPage + 1) * PAIR_PAGE - 1);
      if (chunkErr) {
        console.error("Failed to fetch existing pairs page", pairPage, chunkErr);
        break;
      }
      if (!chunk || chunk.length === 0) break;
      for (const p of chunk) existingSet.add(`${p.from_ticker}__${p.to_ticker}`);
      if (chunk.length < PAIR_PAGE) break;
      pairPage++;
    }
    console.log(`Loaded ${existingSet.size} existing pairs across ${pairPage + 1} page(s)`);

    // Generate new combinations (skip self-pairs)
    // In priority mode, tier-1 × tier-1 combos go first AND we round-robin through
    // all `from` tickers so no single ticker hogs the batch budget.
    const tickerSet = new Set(uniqueTickers);
    const orderedFroms: string[] = priorityMode
      ? [...TIER1.filter((t) => tickerSet.has(t)), ...uniqueTickers.filter((t) => !TIER1.includes(t))]
      : uniqueTickers;
    const orderedTos: string[] = priorityMode
      ? [...TIER1.filter((t) => tickerSet.has(t)), ...uniqueTickers.filter((t) => !TIER1.includes(t))]
      : uniqueTickers;

    const newPairs: Array<{ from_ticker: string; to_ticker: string }> = [];

    if (priorityMode) {
      // Round-robin: pass 1 = (from[0], to[0..n]), then pass 2 cycles again etc., but
      // we want every `from` to get at least N pairs before any single `from` consumes the budget.
      for (let toIdx = 0; toIdx < orderedTos.length && newPairs.length < BATCH_LIMIT; toIdx++) {
        for (let fromIdx = 0; fromIdx < orderedFroms.length && newPairs.length < BATCH_LIMIT; fromIdx++) {
          const from = orderedFroms[fromIdx];
          const to = orderedTos[toIdx];
          if (from === to) continue;
          const key = `${from}__${to}`;
          if (!existingSet.has(key)) {
            newPairs.push({ from_ticker: from, to_ticker: to });
          }
        }
      }
    } else {
      for (const from of orderedFroms) {
        if (newPairs.length >= BATCH_LIMIT) break;
        for (const to of orderedTos) {
          if (newPairs.length >= BATCH_LIMIT) break;
          if (from === to) continue;
          const key = `${from}__${to}`;
          if (!existingSet.has(key)) {
            newPairs.push({ from_ticker: from, to_ticker: to });
          }
        }
      }
    }

    // ── 4. Generate SEO content & insert ──
    if (newPairs.length > 0) {
      let templateCounter = currentCount; // ensures variety

      const rows = newPairs.map((pair) => {
        templateCounter++;
        const templateId = templateCounter % 20;
        const contentJson = generateContentJson(pair.from_ticker, pair.to_ticker, templateId);
        const enContent = contentJson.en;

        return {
          from_ticker: pair.from_ticker,
          to_ticker: pair.to_ticker,
          partner_fee_percent: 0.4,
          seo_template_id: templateId,
          seo_title: enContent.title,
          seo_description: enContent.description,
          seo_h1: enContent.h1,
          content_json: contentJson,
          is_valid: true,
          last_synced_at: new Date().toISOString(),
        };
      });

      const { error: insertError } = await supabase
        .from("pairs")
        .upsert(rows, { onConflict: "from_ticker,to_ticker", ignoreDuplicates: true });

      if (insertError) {
        throw new Error(`Insert failed: ${insertError.message}`);
      }
    }

    // ── 4b. Cleanup: mark unsupported pairs as invalid ──
    // Get all valid pairs from DB and check if both tickers still exist in the API
    const allValidPairs: any[] = [];
    let cleanupPage = 0;
    const CLEANUP_PAGE = 1000;
    while (true) {
      const { data: batch } = await supabase
        .from("pairs")
        .select("id, from_ticker, to_ticker")
        .eq("is_valid", true)
        .range(cleanupPage * CLEANUP_PAGE, (cleanupPage + 1) * CLEANUP_PAGE - 1);
      if (!batch || batch.length === 0) break;
      allValidPairs.push(...batch);
      if (batch.length < CLEANUP_PAGE) break;
      cleanupPage++;
    }

    if (allValidPairs.length > 0) {
      const invalidIds: string[] = [];
      for (const p of allValidPairs) {
        if (!seen.has(p.from_ticker) || !seen.has(p.to_ticker)) {
          invalidIds.push(p.id);
        }
      }
      if (invalidIds.length > 0) {
        // Mark in batches of 100
        for (let i = 0; i < invalidIds.length; i += 100) {
          const batch = invalidIds.slice(i, i + 100);
          await supabase
            .from("pairs")
            .update({ is_valid: false, updated_at: new Date().toISOString() })
            .in("id", batch);
        }
        console.log(`Cleanup: marked ${invalidIds.length} pairs as invalid`);
      }
    }

    // ── 5. Update engine state ──
    const finalCount = currentCount + newPairs.length;
    await supabase.from("sync_engine_state").update({
      last_run_at: new Date().toISOString(),
      pairs_count: finalCount,
      last_batch_size: newPairs.length,
      last_error: null,
      status: "completed",
      updated_at: new Date().toISOString(),
    }).eq("id", 1);

    return new Response(
      JSON.stringify({
        status: "completed",
        new_pairs: newPairs.length,
        total_pairs: finalCount,
        phase: finalCount >= MAINTENANCE_THRESHOLD ? "maintenance" : "growth",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error("Sync engine error:", errMsg);

    try {
      await supabase.from("sync_engine_state").update({
        last_run_at: new Date().toISOString(),
        last_error: errMsg,
        status: "error",
        updated_at: new Date().toISOString(),
      }).eq("id", 1);
    } catch {
      // best-effort
    }

    return new Response(
      JSON.stringify({ status: "error", message: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
