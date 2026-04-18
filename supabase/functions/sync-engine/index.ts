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

// Description templates (shorter set – 10 per language, rotated)
const DESC_TEMPLATES: Record<string, string[]> = {
  en: [
    "Convert {from} to {to} in under 60 seconds. No account, no KYC. Compare rates from 700+ sources. Canadian MSB-registered.",
    "Swap {from} for {to} instantly at the best market rate. Zero sign-up. 0.4% transparent fee. MSB C100000015.",
    "Exchange {from} to {to} with no registration. 700+ liquidity sources, real-time rates, 24/7 availability.",
    "Buy {to} with {from} – fast, private, non-custodial. Licensed Canadian MSB. $0.30 minimum swap.",
    "Instant {from} to {to} swap. Best rates aggregated from 700+ exchanges. No account required.",
    "Trade {from} for {to} securely. Canadian MSB-registered (C100000015). Under 60-second settlement.",
    "Convert {from} into {to} today at the best rate. No sign-up, no KYC, no limits.",
    "{from} to {to} crypto swap – compare 700+ liquidity sources for the best rate. MSB-licensed.",
    "Fast {from}→{to} conversion with transparent 0.4% fee. Non-custodial, private, Canadian MSB.",
    "Swap {from} to {to} – market rate, instant settlement, zero registration. Trusted by 50,000+ users.",
  ],
  es: [
    "Convierte {from} a {to} en menos de 60 segundos. Sin cuenta, sin KYC. 700+ fuentes de liquidez. MSB registrado.",
    "Intercambia {from} por {to} al instante. Sin registro. Comisión transparente del 0.4%. MSB C100000015.",
    "Cambia {from} a {to} sin registro. 700+ fuentes de liquidez, tasas en tiempo real, 24/7.",
    "Compra {to} con {from} – rápido, privado, sin custodia. MSB canadiense. Mínimo $0.30.",
    "Swap instantáneo {from} a {to}. Mejores tasas de 700+ exchanges. Sin cuenta necesaria.",
    "Intercambia {from} por {to} de forma segura. MSB canadiense (C100000015). Liquidación < 60s.",
    "Convierte {from} en {to} hoy a la mejor tasa. Sin registro, sin KYC, sin límites.",
    "Crypto swap {from} a {to} – compara 700+ fuentes. Con licencia MSB.",
    "Conversión rápida {from}→{to} con comisión transparente del 0.4%. No custodial, privado.",
    "Swap {from} a {to} – tasa de mercado, liquidación instantánea, cero registro. 50,000+ usuarios.",
  ],
  pt: [
    "Converta {from} para {to} em menos de 60 segundos. Sem conta, sem KYC. 700+ fontes. MSB registrado.",
    "Troque {from} por {to} instantaneamente. Sem cadastro. Taxa transparente de 0.4%. MSB C100000015.",
    "Câmbio {from} para {to} sem registro. 700+ fontes de liquidez, taxas em tempo real, 24/7.",
    "Compre {to} com {from} – rápido, privado, sem custódia. MSB canadense. Mínimo $0.30.",
    "Swap instantâneo {from} para {to}. Melhores taxas de 700+ exchanges. Sem conta necessária.",
    "Troque {from} por {to} com segurança. MSB canadense (C100000015). Liquidação < 60s.",
    "Converta {from} em {to} hoje pela melhor taxa. Sem cadastro, sem KYC, sem limites.",
    "Crypto swap {from} para {to} – compare 700+ fontes. Licença MSB.",
    "Conversão rápida {from}→{to} com taxa transparente de 0.4%. Não custodial, privado.",
    "Swap {from} para {to} – taxa de mercado, liquidação instantânea, zero registro. 50.000+ usuários.",
  ],
  fr: [
    "Convertissez {from} en {to} en moins de 60 secondes. Sans compte, sans KYC. 700+ sources. MSB enregistré.",
    "Échangez {from} contre {to} instantanément. Sans inscription. Frais de 0.4%. MSB C100000015.",
    "Échange {from} vers {to} sans inscription. 700+ sources de liquidité, taux en temps réel, 24/7.",
    "Achetez {to} avec {from} – rapide, privé, non-custodial. MSB canadien. Minimum 0.30$.",
    "Swap instantané {from} vers {to}. Meilleurs taux de 700+ exchanges. Sans compte.",
    "Échangez {from} contre {to} en toute sécurité. MSB canadien (C100000015). < 60s.",
    "Convertissez {from} en {to} au meilleur taux. Sans inscription, sans KYC, sans limites.",
    "Crypto swap {from} vers {to} – comparez 700+ sources. Licence MSB.",
    "Conversion rapide {from}→{to} avec frais de 0.4%. Non-custodial, privé.",
    "Swap {from} vers {to} – taux du marché, règlement instantané. 50 000+ utilisateurs.",
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

    if (currentCount >= MAINTENANCE_THRESHOLD) {
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
      if (t && !seen.has(t) && a.isActive !== false) {
        seen.add(t);
        uniqueTickers.push(t);
      }
    }
    console.log(`Unique tickers: ${uniqueTickers.length}`);

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
    const newPairs: Array<{ from_ticker: string; to_ticker: string }> = [];
    for (const from of uniqueTickers) {
      if (newPairs.length >= BATCH_LIMIT) break;
      for (const to of uniqueTickers) {
        if (newPairs.length >= BATCH_LIMIT) break;
        if (from === to) continue;
        const key = `${from}__${to}`;
        if (!existingSet.has(key)) {
          newPairs.push({ from_ticker: from, to_ticker: to });
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
