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
    "{from}を{to}に60秒以内で変換。アカウント不要、KYC不要。700+ソース。MSB登録済み。",
    "{from}を{to}に即座に交換。登録不要。透明な0.4%手数料。MSB C100000015。",
    "{from}→{to}交換、登録なし。700+流動性ソース、リアルタイムレート、24/7。",
    "{from}で{to}を購入 – 高速、プライベート、非カストディアル。カナダMSB。最低$0.30。",
    "即座の{from}→{to}スワップ。700+取引所から最高レート。アカウント不要。",
    "{from}を{to}に安全に交換。カナダMSB (C100000015)。60秒以内。",
    "今日{from}を{to}に最高レートで変換。登録・KYC・制限なし。",
    "{from}→{to}暗号スワップ – 700+ソースを比較。MSBライセンス。",
    "高速{from}→{to}変換、透明な0.4%手数料。非カストディアル、プライベート。",
    "{from}→{to}スワップ – 市場レート、即時決済。50,000+ユーザーの信頼。",
  ],
  fa: [
    "تبدیل {from} به {to} در کمتر از ۶۰ ثانیه. بدون حساب، بدون KYC. ۷۰۰+ منبع. MSB ثبت‌شده.",
    "مبادله {from} با {to} فوری. بدون ثبت‌نام. کارمزد شفاف ۰.۴٪. MSB C100000015.",
    "تبادل {from} به {to} بدون ثبت‌نام. ۷۰۰+ منبع نقدینگی، نرخ لحظه‌ای، ۲۴/۷.",
    "خرید {to} با {from} – سریع، خصوصی، غیرحضانتی. MSB کانادا. حداقل ۰.۳۰$.",
    "سواپ فوری {from} به {to}. بهترین نرخ از ۷۰۰+ صرافی. بدون حساب.",
    "تبادل امن {from} با {to}. MSB کانادا (C100000015). تسویه < ۶۰ ثانیه.",
    "تبدیل {from} به {to} امروز با بهترین نرخ. بدون ثبت‌نام، بدون KYC.",
    "سواپ رمزارز {from} به {to} – مقایسه ۷۰۰+ منبع. مجوز MSB.",
    "تبدیل سریع {from}→{to} با کارمزد شفاف ۰.۴٪. غیرحضانتی، خصوصی.",
    "سواپ {from} به {to} – نرخ بازار، تسویه فوری. ۵۰,۰۰۰+ کاربر.",
  ],
  ur: [
    "{from} کو {to} میں 60 سیکنڈ میں تبدیل کریں۔ اکاؤنٹ نہیں، KYC نہیں۔ 700+ ذرائع۔ MSB رجسٹرڈ۔",
    "{from} کو {to} سے فوری بدلیں۔ سائن اپ نہیں۔ شفاف 0.4% فیس۔ MSB C100000015۔",
    "{from} سے {to} تبادلہ بغیر رجسٹریشن۔ 700+ ذرائع، ریئل ٹائم ریٹ، 24/7۔",
    "{from} سے {to} خریدیں – تیز، نجی، غیر تحویلی۔ کینیڈین MSB۔ کم از کم $0.30۔",
    "فوری {from} سے {to} سواپ۔ 700+ ایکسچینجز سے بہترین ریٹ۔ اکاؤنٹ ضروری نہیں۔",
    "{from} کو {to} سے محفوظ بدلیں۔ کینیڈین MSB (C100000015)۔ 60 سیکنڈ سے کم۔",
    "آج {from} کو {to} میں بہترین ریٹ پر تبدیل کریں۔ سائن اپ، KYC، حد نہیں۔",
    "{from} سے {to} کرپٹو سواپ – 700+ ذرائع کا موازنہ۔ MSB لائسنس۔",
    "تیز {from}→{to} تبدیلی شفاف 0.4% فیس کے ساتھ۔ غیر تحویلی، نجی۔",
    "{from} سے {to} سواپ – مارکیٹ ریٹ، فوری تصفیہ۔ 50,000+ صارفین کا اعتماد۔",
  ],
  he: [
    "המרת {from} ל-{to} תוך 60 שניות. ללא חשבון, ללא KYC. 700+ מקורות. MSB רשום.",
    "החלפת {from} ב-{to} מיידית. ללא הרשמה. עמלה שקופה 0.4%. MSB C100000015.",
    "המרה {from} ל-{to} ללא רישום. 700+ מקורות נזילות, שערים בזמן אמת, 24/7.",
    "קנו {to} עם {from} – מהיר, פרטי, לא משמורני. MSB קנדי. מינימום $0.30.",
    "סוואפ מיידי {from} ל-{to}. שערים הטובים ביותר מ-700+ בורסות. ללא חשבון.",
    "החלפת {from} ב-{to} בבטחה. MSB קנדי (C100000015). פחות מ-60 שניות.",
    "המרת {from} ל-{to} היום בשער הטוב ביותר. ללא הרשמה, ללא KYC.",
    "סוואפ קריפטו {from} ל-{to} – השוואת 700+ מקורות. רישיון MSB.",
    "המרה מהירה {from}→{to} עם עמלה שקופה 0.4%. לא משמורני, פרטי.",
    "סוואפ {from} ל-{to} – שער שוק, סליקה מיידית. 50,000+ משתמשים.",
  ],
  af: [
    "Omskep {from} na {to} in minder as 60 sekondes. Geen rekening, geen KYC. 700+ bronne. MSB-geregistreer.",
    "Ruil {from} vir {to} onmiddellik. Geen registrasie. Deursigtige 0.4% fooi. MSB C100000015.",
    "Omruiling {from} na {to} sonder registrasie. 700+ likiditeitsbronne, intydse koerse, 24/7.",
    "Koop {to} met {from} – vinnig, privaat, nie-bewaring. Kanadese MSB. Minimum $0.30.",
    "Onmiddellike {from} na {to} ruil. Beste koerse van 700+ beurse. Geen rekening nodig.",
    "Ruil {from} vir {to} veilig. Kanadese MSB (C100000015). < 60 sekondes.",
    "Omskep {from} in {to} vandag teen die beste koers. Geen registrasie, geen KYC.",
    "Kripto-ruil {from} na {to} – vergelyk 700+ bronne. MSB-lisensie.",
    "Vinnige {from}→{to} omskakeling met 0.4% fooi. Nie-bewaring, privaat.",
    "Ruil {from} na {to} – markkoers, onmiddellike afhandeling. 50,000+ gebruikers.",
  ],
  hi: [
    "{from} को {to} में 60 सेकंड में बदलें। कोई खाता नहीं, कोई KYC नहीं। 700+ स्रोत। MSB पंजीकृत।",
    "{from} को {to} से तुरंत बदलें। कोई साइन-अप नहीं। पारदर्शी 0.4% शुल्क। MSB C100000015।",
    "{from} से {to} एक्सचेंज बिना रजिस्ट्रेशन। 700+ तरलता स्रोत, रियल-टाइम दर, 24/7।",
    "{from} से {to} खरीदें – तेज, निजी, नॉन-कस्टोडियल। कनाडाई MSB। न्यूनतम $0.30।",
    "तत्काल {from} से {to} स्वैप। 700+ एक्सचेंजों से सर्वश्रेष्ठ दर। खाता जरूरी नहीं।",
    "{from} को {to} से सुरक्षित बदलें। कनाडाई MSB (C100000015)। 60 सेकंड से कम।",
    "आज {from} को {to} में सर्वश्रेष्ठ दर पर बदलें। साइन-अप, KYC, सीमा नहीं।",
    "{from} से {to} क्रिप्टो स्वैप – 700+ स्रोतों की तुलना। MSB लाइसेंस।",
    "तेज {from}→{to} रूपांतरण पारदर्शी 0.4% शुल्क। नॉन-कस्टोडियल, निजी।",
    "{from} से {to} स्वैप – बाजार दर, तत्काल निपटान। 50,000+ उपयोगकर्ता।",
  ],
  vi: [
    "Đổi {from} sang {to} trong 60 giây. Không tài khoản, không KYC. 700+ nguồn. MSB đăng ký.",
    "Hoán đổi {from} lấy {to} tức thì. Không đăng ký. Phí minh bạch 0.4%. MSB C100000015.",
    "Sàn {from} sang {to} không đăng ký. 700+ nguồn thanh khoản, tỷ giá thời gian thực, 24/7.",
    "Mua {to} bằng {from} – nhanh, riêng tư, phi lưu ký. MSB Canada. Tối thiểu $0.30.",
    "Swap tức thì {from} sang {to}. Tỷ giá tốt nhất từ 700+ sàn. Không cần tài khoản.",
    "Đổi {from} lấy {to} an toàn. MSB Canada (C100000015). < 60 giây.",
    "Đổi {from} thành {to} hôm nay với tỷ giá tốt nhất. Không đăng ký, không KYC.",
    "Swap crypto {from} sang {to} – so sánh 700+ nguồn. Giấy phép MSB.",
    "Chuyển đổi nhanh {from}→{to} với phí 0.4%. Phi lưu ký, riêng tư.",
    "Swap {from} sang {to} – giá thị trường, thanh toán tức thì. 50.000+ người dùng.",
  ],
  tr: [
    "{from}'ı {to}'a 60 saniyede dönüştürün. Hesap yok, KYC yok. 700+ kaynak. MSB kayıtlı.",
    "{from}'ı {to} ile anında değiştirin. Kayıt yok. %0.4 şeffaf ücret. MSB C100000015.",
    "{from}'dan {to}'a değişim kayıt olmadan. 700+ likidite kaynağı, anlık oranlar, 7/24.",
    "{from} ile {to} satın alın – hızlı, özel, emanetsiz. Kanada MSB. Min $0.30.",
    "Anlık {from}→{to} swap. 700+ borsadan en iyi oranlar. Hesap gerekmez.",
    "{from}'ı {to} ile güvenle değiştirin. Kanada MSB (C100000015). < 60 saniye.",
    "Bugün {from}'ı {to}'a en iyi oranda dönüştürün. Kayıt, KYC, limit yok.",
    "{from}→{to} kripto swap – 700+ kaynağı karşılaştırın. MSB lisansı.",
    "Hızlı {from}→{to} dönüştürme %0.4 ücretle. Emanetsiz, özel.",
    "{from}→{to} swap – piyasa fiyatı, anlık ödeme. 50.000+ kullanıcı.",
  ],
  uk: [
    "Конвертуйте {from} в {to} за 60 секунд. Без акаунту, без KYC. 700+ джерел. MSB зареєстровано.",
    "Обміняйте {from} на {to} миттєво. Без реєстрації. Прозора комісія 0.4%. MSB C100000015.",
    "Обмін {from} на {to} без реєстрації. 700+ джерел ліквідності, курси в реальному часі, 24/7.",
    "Купіть {to} за {from} – швидко, приватно, без опіки. Канадська MSB. Мінімум $0.30.",
    "Миттєвий свап {from} на {to}. Найкращі курси з 700+ бірж. Акаунт не потрібен.",
    "Обміняйте {from} на {to} безпечно. Канадська MSB (C100000015). < 60 секунд.",
    "Конвертуйте {from} в {to} сьогодні за найкращим курсом. Без реєстрації, без KYC.",
    "Крипто свап {from} на {to} – порівняйте 700+ джерел. Ліцензія MSB.",
    "Швидка конвертація {from}→{to} з комісією 0.4%. Без опіки, приватно.",
    "Свап {from} на {to} – ринковий курс, миттєвий розрахунок. 50 000+ користувачів.",
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
