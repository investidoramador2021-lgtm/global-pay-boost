import type { BlogPost } from "./types";
import { TRENDING_2026_POSTS } from "./seed-trending-2026";

/**
 * Translation collections for the 8 TRENDING_2026_POSTS.
 *
 * We translate the SEO-critical surfaces — `title`, `metaTitle`,
 * `metaDescription`, `excerpt`, and `category` — into all 12 supported
 * non-English languages. The post `content` (1500+ words each) is reused
 * from the English source: full hand-translated bodies for 8 × 12 = 96
 * long-form posts is a separate, multi-pass effort.
 *
 * This still gives us:
 *  - Localized SERP snippets in 12 languages (Google ranks on title/meta).
 *  - Proper hreflang annotations pointing to /:lang/blog/<slug>.
 *  - Inclusion in language-specific sitemap segments.
 *  - findSlugLanguage() recognition so the canonical-URL router does not
 *    301 these to /blog/<slug>.
 */

type LangMeta = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  category: string;
};

// Map: slug -> lang -> localized SEO surfaces.
const TRANSLATIONS: Record<string, Record<string, LangMeta>> = {
  "how-to-buy-pepe-2026": {
    es: {
      title: "Cómo comprar PEPE en 2026: guía paso a paso, riesgos y proyección de precio",
      metaTitle: "Cómo comprar PEPE en 2026 — Guía de swap instantáneo",
      metaDescription: "Compra PEPE de forma segura en 2026: instrucciones de swap paso a paso, elección de red, cálculo de comisiones y proyección realista de precio.",
      excerpt: "PEPE sigue siendo una de las memecoins más buscadas de 2026. Esta guía explica cómo comprarla sin pagar de más por slippage y qué escenarios de precio son realistas.",
      category: "Guías de compra",
    },
    pt: {
      title: "Como comprar PEPE em 2026: guia passo a passo, riscos e previsão de preço",
      metaTitle: "Como comprar PEPE em 2026 — Guia de swap instantâneo",
      metaDescription: "Compre PEPE com segurança em 2026: instruções passo a passo, escolha de rede, cálculo de taxas, riscos e previsão realista de preço.",
      excerpt: "PEPE continua sendo uma das memecoins mais pesquisadas de 2026. Este guia explica como comprá-la sem pagar a mais em slippage.",
      category: "Guias de compra",
    },
    fr: {
      title: "Comment acheter PEPE en 2026 : guide pas à pas, risques et prévision de prix",
      metaTitle: "Comment acheter PEPE en 2026 — Guide de swap instantané",
      metaDescription: "Achetez PEPE en toute sécurité en 2026 : instructions étape par étape, choix du réseau, calcul des frais, risques et prévision réaliste.",
      excerpt: "PEPE reste l'un des memecoins les plus recherchés de 2026. Ce guide explique comment l'acheter sans surpayer le slippage.",
      category: "Guides d'achat",
    },
    ja: {
      title: "2026年にPEPEを買う方法:ステップバイステップガイド、リスク、価格見通し",
      metaTitle: "2026年にPEPEを買う方法 — インスタントスワップガイド",
      metaDescription: "2026年に安全にPEPEを購入:ステップバイステップのスワップ手順、ネットワーク選択、手数料計算、リスク、現実的な価格見通し。",
      excerpt: "PEPEは2026年に最も検索されているミームコインの一つです。スリッページで損をせずに購入する方法を解説します。",
      category: "購入ガイド",
    },
    fa: {
      title: "نحوه خرید PEPE در ۲۰۲۶: راهنمای گام‌به‌گام، ریسک‌ها و چشم‌انداز قیمت",
      metaTitle: "نحوه خرید PEPE در ۲۰۲۶ — راهنمای سواپ فوری",
      metaDescription: "خرید ایمن PEPE در ۲۰۲۶: دستورالعمل گام‌به‌گام سواپ، انتخاب شبکه، محاسبه کارمزد، ریسک‌ها و چشم‌انداز واقع‌بینانه قیمت.",
      excerpt: "PEPE یکی از پرجستجوترین میم‌کوین‌های ۲۰۲۶ است. این راهنما خرید بدون اسلیپیج بالا را توضیح می‌دهد.",
      category: "راهنمای خرید",
    },
    ur: {
      title: "2026 میں PEPE کیسے خریدیں: مرحلہ وار گائیڈ، خطرات اور قیمت کا تخمینہ",
      metaTitle: "2026 میں PEPE کیسے خریدیں — فوری سواپ گائیڈ",
      metaDescription: "2026 میں محفوظ طریقے سے PEPE خریدیں: مرحلہ وار سواپ ہدایات، نیٹ ورک کا انتخاب، فیس کا حساب، خطرات اور حقیقت پسندانہ قیمت کا تخمینہ۔",
      excerpt: "PEPE 2026 کی سب سے زیادہ تلاش کی جانے والی میم کوائنز میں سے ایک ہے۔ یہ گائیڈ سلپیج میں زیادہ ادائیگی کے بغیر اسے خریدنے کی وضاحت کرتی ہے۔",
      category: "خریداری کی گائیڈز",
    },
    he: {
      title: "איך לקנות PEPE ב-2026: מדריך שלב אחר שלב, סיכונים ותחזית מחיר",
      metaTitle: "איך לקנות PEPE ב-2026 — מדריך החלפה מיידית",
      metaDescription: "קנייה בטוחה של PEPE ב-2026: הוראות החלפה שלב אחר שלב, בחירת רשת, חישוב עמלות, סיכונים ותחזית מחיר ריאליסטית.",
      excerpt: "PEPE נשאר אחד ממטבעות המם המבוקשים ביותר ב-2026. המדריך מסביר איך לקנות מבלי לשלם יתר על המידה על סליפג'.",
      category: "מדריכי קנייה",
    },
    af: {
      title: "Hoe om PEPE in 2026 te koop: stap-vir-stap gids, risiko's en prysvooruitsig",
      metaTitle: "Hoe om PEPE in 2026 te koop — Onmiddellike Swap Gids",
      metaDescription: "Koop PEPE veilig in 2026: stap-vir-stap swap instruksies, netwerkkeuse, fooi-berekening, risiko's en realistiese prysvooruitsig.",
      excerpt: "PEPE bly een van die mees gesoekte memecoins van 2026. Hierdie gids verduidelik hoe om dit te koop sonder om te veel op glipsing te betaal.",
      category: "Koop Gidse",
    },
    hi: {
      title: "2026 में PEPE कैसे खरीदें: चरण-दर-चरण गाइड, जोखिम और मूल्य पूर्वानुमान",
      metaTitle: "2026 में PEPE कैसे खरीदें — त्वरित स्वैप गाइड",
      metaDescription: "2026 में PEPE सुरक्षित रूप से खरीदें: चरण-दर-चरण स्वैप निर्देश, नेटवर्क चुनाव, शुल्क गणना, जोखिम और यथार्थवादी मूल्य पूर्वानुमान।",
      excerpt: "PEPE 2026 के सबसे खोजे जाने वाले मीमकॉइन्स में से एक है। यह गाइड स्लिपेज पर अधिक भुगतान किए बिना इसे खरीदना समझाता है।",
      category: "खरीदारी गाइड",
    },
    vi: {
      title: "Cách mua PEPE năm 2026: hướng dẫn từng bước, rủi ro và dự báo giá",
      metaTitle: "Cách mua PEPE năm 2026 — Hướng dẫn swap tức thì",
      metaDescription: "Mua PEPE an toàn năm 2026: hướng dẫn swap từng bước, chọn mạng, tính phí, rủi ro và dự báo giá thực tế.",
      excerpt: "PEPE vẫn là một trong những memecoin được tìm kiếm nhiều nhất năm 2026. Hướng dẫn này giải thích cách mua mà không bị mất phí slippage.",
      category: "Hướng dẫn mua",
    },
    tr: {
      title: "2026'da PEPE Nasıl Satın Alınır: Adım Adım Rehber, Riskler ve Fiyat Tahmini",
      metaTitle: "2026'da PEPE Nasıl Satın Alınır — Anında Swap Rehberi",
      metaDescription: "2026'da güvenle PEPE satın alın: adım adım swap talimatları, ağ seçimi, ücret hesaplama, riskler ve gerçekçi fiyat tahmini.",
      excerpt: "PEPE 2026'nın en çok aranan memecoin'lerinden biri olmaya devam ediyor. Bu rehber, slippage'da fazla ödeme yapmadan nasıl alınacağını açıklıyor.",
      category: "Satın Alma Rehberleri",
    },
    uk: {
      title: "Як купити PEPE у 2026: покрокова інструкція, ризики та прогноз ціни",
      metaTitle: "Як купити PEPE у 2026 — Інструкція з миттєвого свопу",
      metaDescription: "Безпечна купівля PEPE у 2026: покрокові інструкції зі свопу, вибір мережі, розрахунок комісій, ризики та реалістичний прогноз ціни.",
      excerpt: "PEPE залишається одним із найбільш запитуваних мемкоїнів 2026 року. Цей гід пояснює, як купити без переплат на слипажі.",
      category: "Гіди з купівлі",
    },
  },
  "how-to-buy-doge-2026": {
    es: { title: "Cómo comprar Dogecoin (DOGE) en 2026: guía completa", metaTitle: "Cómo comprar DOGE en 2026 — Swap instantáneo", metaDescription: "Compra Dogecoin (DOGE) en 2026: guía paso a paso, configuración de wallet, comisiones reales y proyección de precio.", excerpt: "Guía completa para comprar Dogecoin en 2026 sin cuenta, sin KYC, con tarifa bloqueada antes de enviar.", category: "Guías de compra" },
    pt: { title: "Como comprar Dogecoin (DOGE) em 2026: guia completo", metaTitle: "Como comprar DOGE em 2026 — Swap instantâneo", metaDescription: "Compre Dogecoin (DOGE) em 2026: guia passo a passo, configuração de carteira, taxas reais e previsão de preço.", excerpt: "Guia completo para comprar Dogecoin em 2026 sem conta, sem KYC, com taxa bloqueada antes do envio.", category: "Guias de compra" },
    fr: { title: "Comment acheter Dogecoin (DOGE) en 2026 : guide complet", metaTitle: "Comment acheter DOGE en 2026 — Swap instantané", metaDescription: "Achetez Dogecoin (DOGE) en 2026 : guide étape par étape, configuration du portefeuille, frais réels et prévision de prix.", excerpt: "Guide complet pour acheter Dogecoin en 2026 sans compte, sans KYC, avec taux verrouillé avant l'envoi.", category: "Guides d'achat" },
    ja: { title: "2026年にDogecoin (DOGE)を買う方法:完全ガイド", metaTitle: "2026年にDOGEを買う方法 — インスタントスワップ", metaDescription: "2026年にDogecoin (DOGE)を購入:ステップバイステップガイド、ウォレット設定、実際の手数料、価格見通し。", excerpt: "2026年にアカウントなし、KYCなし、送金前にレートロックでDogecoinを購入する完全ガイド。", category: "購入ガイド" },
    fa: { title: "نحوه خرید Dogecoin (DOGE) در ۲۰۲۶: راهنمای کامل", metaTitle: "نحوه خرید DOGE در ۲۰۲۶ — سواپ فوری", metaDescription: "خرید Dogecoin (DOGE) در ۲۰۲۶: راهنمای گام‌به‌گام، تنظیم کیف پول، کارمزد واقعی و پیش‌بینی قیمت.", excerpt: "راهنمای کامل خرید Dogecoin در ۲۰۲۶ بدون حساب، بدون KYC، با نرخ قفل‌شده قبل از ارسال.", category: "راهنمای خرید" },
    ur: { title: "2026 میں Dogecoin (DOGE) کیسے خریدیں: مکمل گائیڈ", metaTitle: "2026 میں DOGE کیسے خریدیں — فوری سواپ", metaDescription: "2026 میں Dogecoin (DOGE) خریدیں: مرحلہ وار گائیڈ، والیٹ سیٹ اپ، حقیقی فیس اور قیمت کا تخمینہ۔", excerpt: "بھیجنے سے پہلے لاک ریٹ کے ساتھ بغیر اکاؤنٹ، بغیر KYC کے 2026 میں Dogecoin خریدنے کی مکمل گائیڈ۔", category: "خریداری کی گائیڈز" },
    he: { title: "איך לקנות Dogecoin (DOGE) ב-2026: מדריך מלא", metaTitle: "איך לקנות DOGE ב-2026 — החלפה מיידית", metaDescription: "קנייה של Dogecoin (DOGE) ב-2026: מדריך שלב אחר שלב, הגדרת ארנק, עמלות אמיתיות ותחזית מחיר.", excerpt: "מדריך מלא לקניית Dogecoin ב-2026 ללא חשבון, ללא KYC, עם שער נעול לפני השליחה.", category: "מדריכי קנייה" },
    af: { title: "Hoe om Dogecoin (DOGE) in 2026 te koop: volledige gids", metaTitle: "Hoe om DOGE in 2026 te koop — Onmiddellike Swap", metaDescription: "Koop Dogecoin (DOGE) in 2026: stap-vir-stap gids, beursie opstelling, werklike fooie en prysvooruitsig.", excerpt: "Volledige gids om Dogecoin in 2026 te koop sonder rekening, sonder KYC, met gesluite koers voor stuur.", category: "Koop Gidse" },
    hi: { title: "2026 में Dogecoin (DOGE) कैसे खरीदें: पूरी गाइड", metaTitle: "2026 में DOGE कैसे खरीदें — त्वरित स्वैप", metaDescription: "2026 में Dogecoin (DOGE) खरीदें: चरण-दर-चरण गाइड, वॉलेट सेटअप, वास्तविक शुल्क और मूल्य पूर्वानुमान।", excerpt: "बिना खाता, बिना KYC, भेजने से पहले लॉक की गई दर के साथ 2026 में Dogecoin खरीदने की पूरी गाइड।", category: "खरीदारी गाइड" },
    vi: { title: "Cách mua Dogecoin (DOGE) năm 2026: hướng dẫn đầy đủ", metaTitle: "Cách mua DOGE năm 2026 — Swap tức thì", metaDescription: "Mua Dogecoin (DOGE) năm 2026: hướng dẫn từng bước, cài đặt ví, phí thực tế và dự báo giá.", excerpt: "Hướng dẫn đầy đủ để mua Dogecoin năm 2026 không tài khoản, không KYC, với tỷ giá khóa trước khi gửi.", category: "Hướng dẫn mua" },
    tr: { title: "2026'da Dogecoin (DOGE) Nasıl Satın Alınır: Tam Rehber", metaTitle: "2026'da DOGE Nasıl Satın Alınır — Anında Swap", metaDescription: "2026'da Dogecoin (DOGE) satın alın: adım adım rehber, cüzdan kurulumu, gerçek ücretler ve fiyat tahmini.", excerpt: "Hesap yok, KYC yok, gönderim öncesi kilitli kur ile 2026'da Dogecoin satın almak için tam rehber.", category: "Satın Alma Rehberleri" },
    uk: { title: "Як купити Dogecoin (DOGE) у 2026: повний гід", metaTitle: "Як купити DOGE у 2026 — Миттєвий своп", metaDescription: "Купуйте Dogecoin (DOGE) у 2026: покрокова інструкція, налаштування гаманця, реальні комісії та прогноз ціни.", excerpt: "Повний гід із купівлі Dogecoin у 2026 без облікового запису, без KYC, із зафіксованим курсом перед відправкою.", category: "Гіди з купівлі" },
  },
  "how-to-buy-xrp-2026": {
    es: { title: "Cómo comprar XRP (Ripple) en 2026: guía completa", metaTitle: "Cómo comprar XRP en 2026 — Swap instantáneo", metaDescription: "Compra XRP en 2026: instrucciones, etiqueta de destino, ETFs, comisiones y proyección de precio post-resolución regulatoria.", excerpt: "XRP en 2026 tras la claridad regulatoria de EE. UU. y la aprobación de ETFs. Cómo comprarlo sin cuenta y sin riesgo de etiqueta de destino.", category: "Guías de compra" },
    pt: { title: "Como comprar XRP (Ripple) em 2026: guia completo", metaTitle: "Como comprar XRP em 2026 — Swap instantâneo", metaDescription: "Compre XRP em 2026: instruções, destination tag, ETFs, taxas e previsão de preço pós-clareza regulatória.", excerpt: "XRP em 2026 após a clareza regulatória dos EUA e a aprovação de ETFs. Como comprar sem conta e sem risco de destination tag.", category: "Guias de compra" },
    fr: { title: "Comment acheter XRP (Ripple) en 2026 : guide complet", metaTitle: "Comment acheter XRP en 2026 — Swap instantané", metaDescription: "Achetez XRP en 2026 : instructions, destination tag, ETFs, frais et prévision de prix post-clarté réglementaire.", excerpt: "XRP en 2026 après la clarté réglementaire américaine et l'approbation des ETFs. Comment l'acheter sans compte.", category: "Guides d'achat" },
    ja: { title: "2026年にXRP (Ripple)を買う方法:完全ガイド", metaTitle: "2026年にXRPを買う方法 — インスタントスワップ", metaDescription: "2026年にXRPを購入:手順、デスティネーションタグ、ETF、手数料、規制明確化後の価格見通し。", excerpt: "米国の規制明確化とETF承認後の2026年のXRP。アカウントなし、デスティネーションタグリスクなしで購入する方法。", category: "購入ガイド" },
    fa: { title: "نحوه خرید XRP (Ripple) در ۲۰۲۶: راهنمای کامل", metaTitle: "نحوه خرید XRP در ۲۰۲۶ — سواپ فوری", metaDescription: "خرید XRP در ۲۰۲۶: دستورالعمل‌ها، تگ مقصد، ETFها، کارمزد و چشم‌انداز قیمت پس از شفافیت قانونی.", excerpt: "XRP در ۲۰۲۶ پس از شفافیت قانونی آمریکا و تأیید ETFها. نحوه خرید بدون حساب و بدون ریسک تگ مقصد.", category: "راهنمای خرید" },
    ur: { title: "2026 میں XRP (Ripple) کیسے خریدیں: مکمل گائیڈ", metaTitle: "2026 میں XRP کیسے خریدیں — فوری سواپ", metaDescription: "2026 میں XRP خریدیں: ہدایات، destination tag، ETFs، فیس اور ریگولیٹری وضاحت کے بعد قیمت کا تخمینہ۔", excerpt: "امریکی ریگولیٹری وضاحت اور ETF کی منظوری کے بعد 2026 میں XRP۔ اکاؤنٹ کے بغیر خریداری۔", category: "خریداری کی گائیڈز" },
    he: { title: "איך לקנות XRP (Ripple) ב-2026: מדריך מלא", metaTitle: "איך לקנות XRP ב-2026 — החלפה מיידית", metaDescription: "קנייה של XRP ב-2026: הוראות, destination tag, ETFs, עמלות ותחזית מחיר אחרי בהירות רגולטורית.", excerpt: "XRP ב-2026 אחרי הבהירות הרגולטורית בארה\"ב ואישור ETFs. איך לקנות ללא חשבון.", category: "מדריכי קנייה" },
    af: { title: "Hoe om XRP (Ripple) in 2026 te koop: volledige gids", metaTitle: "Hoe om XRP in 2026 te koop — Onmiddellike Swap", metaDescription: "Koop XRP in 2026: instruksies, destination tag, ETFs, fooie en prysvooruitsig na regulatoriese duidelikheid.", excerpt: "XRP in 2026 na Amerikaanse regulatoriese duidelikheid en ETF-goedkeuring. Hoe om sonder rekening te koop.", category: "Koop Gidse" },
    hi: { title: "2026 में XRP (Ripple) कैसे खरीदें: पूरी गाइड", metaTitle: "2026 में XRP कैसे खरीदें — त्वरित स्वैप", metaDescription: "2026 में XRP खरीदें: निर्देश, destination tag, ETFs, शुल्क और नियामक स्पष्टता के बाद मूल्य पूर्वानुमान।", excerpt: "अमेरिकी नियामक स्पष्टता और ETF अनुमोदन के बाद 2026 में XRP। बिना खाते के कैसे खरीदें।", category: "खरीदारी गाइड" },
    vi: { title: "Cách mua XRP (Ripple) năm 2026: hướng dẫn đầy đủ", metaTitle: "Cách mua XRP năm 2026 — Swap tức thì", metaDescription: "Mua XRP năm 2026: hướng dẫn, destination tag, ETF, phí và dự báo giá sau rõ ràng pháp lý.", excerpt: "XRP năm 2026 sau khi rõ ràng pháp lý Mỹ và phê duyệt ETF. Cách mua không tài khoản.", category: "Hướng dẫn mua" },
    tr: { title: "2026'da XRP (Ripple) Nasıl Satın Alınır: Tam Rehber", metaTitle: "2026'da XRP Nasıl Satın Alınır — Anında Swap", metaDescription: "2026'da XRP satın alın: talimatlar, destination tag, ETF'ler, ücretler ve düzenleyici netlik sonrası fiyat tahmini.", excerpt: "ABD düzenleyici netliği ve ETF onayı sonrası 2026'da XRP. Hesapsız nasıl satın alınır.", category: "Satın Alma Rehberleri" },
    uk: { title: "Як купити XRP (Ripple) у 2026: повний гід", metaTitle: "Як купити XRP у 2026 — Миттєвий своп", metaDescription: "Купуйте XRP у 2026: інструкції, destination tag, ETF, комісії та прогноз ціни після регуляторної ясності.", excerpt: "XRP у 2026 після регуляторної ясності США та схвалення ETF. Як купити без облікового запису.", category: "Гіди з купівлі" },
  },
  "how-to-buy-hype-hyperliquid-2026": {
    es: { title: "Cómo comprar HYPE (Hyperliquid) en 2026: guía del DEX de perpetuos", metaTitle: "Cómo comprar HYPE en 2026 — Swap instantáneo", metaDescription: "Compra HYPE de Hyperliquid en 2026: HyperEVM, ingresos del DEX de perpetuos, riesgos y proyección de precio.", excerpt: "HYPE es el token nativo del DEX de perpetuos líder de 2026. Cómo comprarlo de forma no custodiada.", category: "Guías de compra" },
    pt: { title: "Como comprar HYPE (Hyperliquid) em 2026: guia da DEX de perpétuos", metaTitle: "Como comprar HYPE em 2026 — Swap instantâneo", metaDescription: "Compre HYPE da Hyperliquid em 2026: HyperEVM, receita da DEX de perpétuos, riscos e previsão de preço.", excerpt: "HYPE é o token nativo da DEX de perpétuos líder de 2026. Como comprar de forma não custodial.", category: "Guias de compra" },
    fr: { title: "Comment acheter HYPE (Hyperliquid) en 2026 : guide du DEX perp", metaTitle: "Comment acheter HYPE en 2026 — Swap instantané", metaDescription: "Achetez HYPE de Hyperliquid en 2026 : HyperEVM, revenus du DEX perp, risques et prévision de prix.", excerpt: "HYPE est le token natif du DEX perp leader de 2026. Comment l'acheter en non-custodial.", category: "Guides d'achat" },
    ja: { title: "2026年にHYPE (Hyperliquid)を買う方法:Perp DEXガイド", metaTitle: "2026年にHYPEを買う方法 — インスタントスワップ", metaDescription: "2026年にHyperliquidのHYPEを購入:HyperEVM、Perp DEX収益、リスク、価格見通し。", excerpt: "HYPEは2026年の主要Perp DEXのネイティブトークン。非カストディアルで購入する方法。", category: "購入ガイド" },
    fa: { title: "نحوه خرید HYPE (Hyperliquid) در ۲۰۲۶: راهنمای DEX پرپ", metaTitle: "نحوه خرید HYPE در ۲۰۲۶ — سواپ فوری", metaDescription: "خرید HYPE هایپرلیکوئید در ۲۰۲۶: HyperEVM، درآمد DEX پرپ، ریسک‌ها و چشم‌انداز قیمت.", excerpt: "HYPE توکن بومی DEX پرپ پیشرو در ۲۰۲۶ است. نحوه خرید غیرحضانتی.", category: "راهنمای خرید" },
    ur: { title: "2026 میں HYPE (Hyperliquid) کیسے خریدیں: پرپ DEX گائیڈ", metaTitle: "2026 میں HYPE کیسے خریدیں — فوری سواپ", metaDescription: "2026 میں Hyperliquid کا HYPE خریدیں: HyperEVM، پرپ DEX آمدنی، خطرات اور قیمت کا تخمینہ۔", excerpt: "HYPE 2026 کے سرکردہ پرپ DEX کا مقامی ٹوکن ہے۔ نان کسٹڈیل خریداری۔", category: "خریداری کی گائیڈز" },
    he: { title: "איך לקנות HYPE (Hyperliquid) ב-2026: מדריך Perp DEX", metaTitle: "איך לקנות HYPE ב-2026 — החלפה מיידית", metaDescription: "קנייה של HYPE של Hyperliquid ב-2026: HyperEVM, הכנסות Perp DEX, סיכונים ותחזית מחיר.", excerpt: "HYPE הוא הטוקן הילידי של Perp DEX המוביל של 2026. איך לקנות ללא משמורת.", category: "מדריכי קנייה" },
    af: { title: "Hoe om HYPE (Hyperliquid) in 2026 te koop: Perp DEX gids", metaTitle: "Hoe om HYPE in 2026 te koop — Onmiddellike Swap", metaDescription: "Koop Hyperliquid se HYPE in 2026: HyperEVM, Perp DEX inkomste, risiko's en prysvooruitsig.", excerpt: "HYPE is die inheemse token van die toonaangewende Perp DEX van 2026. Hoe om nie-bewaarend te koop.", category: "Koop Gidse" },
    hi: { title: "2026 में HYPE (Hyperliquid) कैसे खरीदें: पर्प DEX गाइड", metaTitle: "2026 में HYPE कैसे खरीदें — त्वरित स्वैप", metaDescription: "2026 में Hyperliquid का HYPE खरीदें: HyperEVM, पर्प DEX आय, जोखिम और मूल्य पूर्वानुमान।", excerpt: "HYPE 2026 के अग्रणी पर्प DEX का मूल टोकन है। नॉन-कस्टोडियल खरीद।", category: "खरीदारी गाइड" },
    vi: { title: "Cách mua HYPE (Hyperliquid) năm 2026: hướng dẫn DEX perp", metaTitle: "Cách mua HYPE năm 2026 — Swap tức thì", metaDescription: "Mua HYPE Hyperliquid năm 2026: HyperEVM, doanh thu DEX perp, rủi ro và dự báo giá.", excerpt: "HYPE là token bản địa của DEX perp hàng đầu năm 2026. Cách mua phi giám sát.", category: "Hướng dẫn mua" },
    tr: { title: "2026'da HYPE (Hyperliquid) Nasıl Satın Alınır: Perp DEX Rehberi", metaTitle: "2026'da HYPE Nasıl Satın Alınır — Anında Swap", metaDescription: "2026'da Hyperliquid HYPE satın alın: HyperEVM, Perp DEX geliri, riskler ve fiyat tahmini.", excerpt: "HYPE, 2026'nın önde gelen Perp DEX'inin yerel tokenıdır. Saklamasız satın alma.", category: "Satın Alma Rehberleri" },
    uk: { title: "Як купити HYPE (Hyperliquid) у 2026: гід Perp DEX", metaTitle: "Як купити HYPE у 2026 — Миттєвий своп", metaDescription: "Купуйте HYPE Hyperliquid у 2026: HyperEVM, доходи Perp DEX, ризики та прогноз ціни.", excerpt: "HYPE — нативний токен провідного Perp DEX 2026 року. Некастодіальна купівля.", category: "Гіди з купівлі" },
  },
  "how-to-buy-tao-bittensor-2026": {
    es: { title: "Cómo comprar TAO (Bittensor) en 2026: guía de IA descentralizada", metaTitle: "Cómo comprar TAO en 2026 — Swap instantáneo", metaDescription: "Compra Bittensor (TAO) en 2026: subnets, mecánica de subasta dTAO, halving y proyección de precio.", excerpt: "TAO es la apuesta líder en IA descentralizada de 2026. Esta guía explica cómo comprarlo sin cuenta.", category: "Guías de compra" },
    pt: { title: "Como comprar TAO (Bittensor) em 2026: guia de IA descentralizada", metaTitle: "Como comprar TAO em 2026 — Swap instantâneo", metaDescription: "Compre Bittensor (TAO) em 2026: subnets, mecânica de leilão dTAO, halving e previsão de preço.", excerpt: "TAO é a aposta líder em IA descentralizada de 2026. Este guia explica como comprar sem conta.", category: "Guias de compra" },
    fr: { title: "Comment acheter TAO (Bittensor) en 2026 : guide IA décentralisée", metaTitle: "Comment acheter TAO en 2026 — Swap instantané", metaDescription: "Achetez Bittensor (TAO) en 2026 : subnets, mécanique d'enchère dTAO, halving et prévision de prix.", excerpt: "TAO est le pari leader en IA décentralisée de 2026. Comment l'acheter sans compte.", category: "Guides d'achat" },
    ja: { title: "2026年にTAO (Bittensor)を買う方法:分散型AIガイド", metaTitle: "2026年にTAOを買う方法 — インスタントスワップ", metaDescription: "2026年にBittensor (TAO)を購入:サブネット、dTAOオークションメカニクス、ハービング、価格見通し。", excerpt: "TAOは2026年の分散型AIにおける主要ベット。アカウントなしで購入する方法。", category: "購入ガイド" },
    fa: { title: "نحوه خرید TAO (Bittensor) در ۲۰۲۶: راهنمای هوش مصنوعی غیرمتمرکز", metaTitle: "نحوه خرید TAO در ۲۰۲۶ — سواپ فوری", metaDescription: "خرید Bittensor (TAO) در ۲۰۲۶: ساب‌نت‌ها، مکانیک حراج dTAO، هاوینگ و چشم‌انداز قیمت.", excerpt: "TAO شرط پیشرو در هوش مصنوعی غیرمتمرکز ۲۰۲۶ است. نحوه خرید بدون حساب.", category: "راهنمای خرید" },
    ur: { title: "2026 میں TAO (Bittensor) کیسے خریدیں: غیر مرکزی AI گائیڈ", metaTitle: "2026 میں TAO کیسے خریدیں — فوری سواپ", metaDescription: "2026 میں Bittensor (TAO) خریدیں: subnets، dTAO نیلامی میکینکس، halving اور قیمت کا تخمینہ۔", excerpt: "TAO 2026 میں غیر مرکزی AI پر سرکردہ شرط ہے۔ بغیر اکاؤنٹ خریداری۔", category: "خریداری کی گائیڈز" },
    he: { title: "איך לקנות TAO (Bittensor) ב-2026: מדריך AI מבוזר", metaTitle: "איך לקנות TAO ב-2026 — החלפה מיידית", metaDescription: "קנייה של Bittensor (TAO) ב-2026: subnets, מכניקת מכירה dTAO, halving ותחזית מחיר.", excerpt: "TAO הוא ההימור המוביל ב-AI מבוזר של 2026. איך לקנות ללא חשבון.", category: "מדריכי קנייה" },
    af: { title: "Hoe om TAO (Bittensor) in 2026 te koop: gedesentraliseerde AI gids", metaTitle: "Hoe om TAO in 2026 te koop — Onmiddellike Swap", metaDescription: "Koop Bittensor (TAO) in 2026: subnets, dTAO veiling meganika, halving en prysvooruitsig.", excerpt: "TAO is die toonaangewende weddenskap op gedesentraliseerde AI in 2026. Hoe om sonder rekening te koop.", category: "Koop Gidse" },
    hi: { title: "2026 में TAO (Bittensor) कैसे खरीदें: विकेंद्रीकृत AI गाइड", metaTitle: "2026 में TAO कैसे खरीदें — त्वरित स्वैप", metaDescription: "2026 में Bittensor (TAO) खरीदें: सबनेट्स, dTAO नीलामी यांत्रिकी, हाविंग और मूल्य पूर्वानुमान।", excerpt: "TAO 2026 में विकेंद्रीकृत AI पर अग्रणी दांव है। बिना खाते के कैसे खरीदें।", category: "खरीदारी गाइड" },
    vi: { title: "Cách mua TAO (Bittensor) năm 2026: hướng dẫn AI phi tập trung", metaTitle: "Cách mua TAO năm 2026 — Swap tức thì", metaDescription: "Mua Bittensor (TAO) năm 2026: subnet, cơ chế đấu giá dTAO, halving và dự báo giá.", excerpt: "TAO là cú đặt cược hàng đầu vào AI phi tập trung năm 2026. Cách mua không tài khoản.", category: "Hướng dẫn mua" },
    tr: { title: "2026'da TAO (Bittensor) Nasıl Satın Alınır: Merkeziyetsiz AI Rehberi", metaTitle: "2026'da TAO Nasıl Satın Alınır — Anında Swap", metaDescription: "2026'da Bittensor (TAO) satın alın: subnet'ler, dTAO açık artırma mekaniği, halving ve fiyat tahmini.", excerpt: "TAO 2026'da merkeziyetsiz AI üzerine önde gelen bahistir. Hesapsız nasıl satın alınır.", category: "Satın Alma Rehberleri" },
    uk: { title: "Як купити TAO (Bittensor) у 2026: гід з децентралізованого ШІ", metaTitle: "Як купити TAO у 2026 — Миттєвий своп", metaDescription: "Купуйте Bittensor (TAO) у 2026: сабнети, механіка аукціону dTAO, халвінг та прогноз ціни.", excerpt: "TAO — провідна ставка на децентралізований ШІ у 2026 році. Як купити без облікового запису.", category: "Гіди з купівлі" },
  },
  "how-to-buy-siren-2026": {
    es: { title: "Cómo comprar SIREN en 2026: guía completa", metaTitle: "Cómo comprar SIREN en 2026 — Swap instantáneo", metaDescription: "Compra SIREN en 2026: red, configuración de wallet, comisiones y proyección de precio.", excerpt: "Guía completa para comprar SIREN sin cuenta y con tarifa bloqueada antes del envío.", category: "Guías de compra" },
    pt: { title: "Como comprar SIREN em 2026: guia completo", metaTitle: "Como comprar SIREN em 2026 — Swap instantâneo", metaDescription: "Compre SIREN em 2026: rede, configuração de carteira, taxas e previsão de preço.", excerpt: "Guia completo para comprar SIREN sem conta e com taxa bloqueada antes do envio.", category: "Guias de compra" },
    fr: { title: "Comment acheter SIREN en 2026 : guide complet", metaTitle: "Comment acheter SIREN en 2026 — Swap instantané", metaDescription: "Achetez SIREN en 2026 : réseau, configuration du portefeuille, frais et prévision de prix.", excerpt: "Guide complet pour acheter SIREN sans compte avec taux verrouillé avant l'envoi.", category: "Guides d'achat" },
    ja: { title: "2026年にSIRENを買う方法:完全ガイド", metaTitle: "2026年にSIRENを買う方法 — インスタントスワップ", metaDescription: "2026年にSIRENを購入:ネットワーク、ウォレット設定、手数料、価格見通し。", excerpt: "アカウントなし、送金前にレートロックでSIRENを購入する完全ガイド。", category: "購入ガイド" },
    fa: { title: "نحوه خرید SIREN در ۲۰۲۶: راهنمای کامل", metaTitle: "نحوه خرید SIREN در ۲۰۲۶ — سواپ فوری", metaDescription: "خرید SIREN در ۲۰۲۶: شبکه، تنظیم کیف پول، کارمزد و چشم‌انداز قیمت.", excerpt: "راهنمای کامل خرید SIREN بدون حساب و با نرخ قفل‌شده قبل از ارسال.", category: "راهنمای خرید" },
    ur: { title: "2026 میں SIREN کیسے خریدیں: مکمل گائیڈ", metaTitle: "2026 میں SIREN کیسے خریدیں — فوری سواپ", metaDescription: "2026 میں SIREN خریدیں: نیٹ ورک، والیٹ سیٹ اپ، فیس اور قیمت کا تخمینہ۔", excerpt: "بھیجنے سے پہلے لاک ریٹ کے ساتھ بغیر اکاؤنٹ SIREN خریدنے کی مکمل گائیڈ۔", category: "خریداری کی گائیڈز" },
    he: { title: "איך לקנות SIREN ב-2026: מדריך מלא", metaTitle: "איך לקנות SIREN ב-2026 — החלפה מיידית", metaDescription: "קנייה של SIREN ב-2026: רשת, הגדרת ארנק, עמלות ותחזית מחיר.", excerpt: "מדריך מלא לקניית SIREN ללא חשבון ועם שער נעול לפני השליחה.", category: "מדריכי קנייה" },
    af: { title: "Hoe om SIREN in 2026 te koop: volledige gids", metaTitle: "Hoe om SIREN in 2026 te koop — Onmiddellike Swap", metaDescription: "Koop SIREN in 2026: netwerk, beursie opstelling, fooie en prysvooruitsig.", excerpt: "Volledige gids om SIREN te koop sonder rekening en met gesluite koers voor stuur.", category: "Koop Gidse" },
    hi: { title: "2026 में SIREN कैसे खरीदें: पूरी गाइड", metaTitle: "2026 में SIREN कैसे खरीदें — त्वरित स्वैप", metaDescription: "2026 में SIREN खरीदें: नेटवर्क, वॉलेट सेटअप, शुल्क और मूल्य पूर्वानुमान।", excerpt: "बिना खाता और भेजने से पहले लॉक की गई दर के साथ SIREN खरीदने की पूरी गाइड।", category: "खरीदारी गाइड" },
    vi: { title: "Cách mua SIREN năm 2026: hướng dẫn đầy đủ", metaTitle: "Cách mua SIREN năm 2026 — Swap tức thì", metaDescription: "Mua SIREN năm 2026: mạng, cài đặt ví, phí và dự báo giá.", excerpt: "Hướng dẫn đầy đủ để mua SIREN không tài khoản với tỷ giá khóa trước khi gửi.", category: "Hướng dẫn mua" },
    tr: { title: "2026'da SIREN Nasıl Satın Alınır: Tam Rehber", metaTitle: "2026'da SIREN Nasıl Satın Alınır — Anında Swap", metaDescription: "2026'da SIREN satın alın: ağ, cüzdan kurulumu, ücretler ve fiyat tahmini.", excerpt: "Hesap yok, gönderim öncesi kilitli kur ile SIREN satın almak için tam rehber.", category: "Satın Alma Rehberleri" },
    uk: { title: "Як купити SIREN у 2026: повний гід", metaTitle: "Як купити SIREN у 2026 — Миттєвий своп", metaDescription: "Купуйте SIREN у 2026: мережа, налаштування гаманця, комісії та прогноз ціни.", excerpt: "Повний гід із купівлі SIREN без облікового запису з зафіксованим курсом перед відправкою.", category: "Гіди з купівлі" },
  },
  "how-to-buy-blockdag-bdag-2026": {
    es: { title: "Cómo comprar BlockDAG (BDAG) en 2026: guía DAG L1", metaTitle: "Cómo comprar BDAG en 2026 — Swap instantáneo", metaDescription: "Compra BlockDAG (BDAG) en 2026: arquitectura DAG, lanzamiento mainnet, riesgos y proyección de precio.", excerpt: "BlockDAG es uno de los lanzamientos L1 más comentados de 2026. Cómo comprar BDAG sin cuenta.", category: "Guías de compra" },
    pt: { title: "Como comprar BlockDAG (BDAG) em 2026: guia DAG L1", metaTitle: "Como comprar BDAG em 2026 — Swap instantâneo", metaDescription: "Compre BlockDAG (BDAG) em 2026: arquitetura DAG, lançamento da mainnet, riscos e previsão de preço.", excerpt: "BlockDAG é um dos lançamentos L1 mais comentados de 2026. Como comprar BDAG sem conta.", category: "Guias de compra" },
    fr: { title: "Comment acheter BlockDAG (BDAG) en 2026 : guide DAG L1", metaTitle: "Comment acheter BDAG en 2026 — Swap instantané", metaDescription: "Achetez BlockDAG (BDAG) en 2026 : architecture DAG, lancement mainnet, risques et prévision de prix.", excerpt: "BlockDAG est l'un des lancements L1 les plus commentés de 2026. Comment acheter BDAG sans compte.", category: "Guides d'achat" },
    ja: { title: "2026年にBlockDAG (BDAG)を買う方法:DAG L1ガイド", metaTitle: "2026年にBDAGを買う方法 — インスタントスワップ", metaDescription: "2026年にBlockDAG (BDAG)を購入:DAGアーキテクチャ、メインネットローンチ、リスク、価格見通し。", excerpt: "BlockDAGは2026年最も話題のL1ローンチの一つ。アカウントなしでBDAGを購入する方法。", category: "購入ガイド" },
    fa: { title: "نحوه خرید BlockDAG (BDAG) در ۲۰۲۶: راهنمای DAG L1", metaTitle: "نحوه خرید BDAG در ۲۰۲۶ — سواپ فوری", metaDescription: "خرید BlockDAG (BDAG) در ۲۰۲۶: معماری DAG، راه‌اندازی mainnet، ریسک‌ها و چشم‌انداز قیمت.", excerpt: "BlockDAG یکی از پربحث‌ترین راه‌اندازی‌های L1 در ۲۰۲۶ است. نحوه خرید BDAG بدون حساب.", category: "راهنمای خرید" },
    ur: { title: "2026 میں BlockDAG (BDAG) کیسے خریدیں: DAG L1 گائیڈ", metaTitle: "2026 میں BDAG کیسے خریدیں — فوری سواپ", metaDescription: "2026 میں BlockDAG (BDAG) خریدیں: DAG آرکیٹیکچر، mainnet لانچ، خطرات اور قیمت کا تخمینہ۔", excerpt: "BlockDAG 2026 کے سب سے زیادہ زیر بحث L1 لانچز میں سے ایک ہے۔ بغیر اکاؤنٹ BDAG خریداری۔", category: "خریداری کی گائیڈز" },
    he: { title: "איך לקנות BlockDAG (BDAG) ב-2026: מדריך DAG L1", metaTitle: "איך לקנות BDAG ב-2026 — החלפה מיידית", metaDescription: "קנייה של BlockDAG (BDAG) ב-2026: ארכיטקטורת DAG, השקת mainnet, סיכונים ותחזית מחיר.", excerpt: "BlockDAG הוא אחת מהשקות ה-L1 המדוברות ביותר של 2026. איך לקנות BDAG ללא חשבון.", category: "מדריכי קנייה" },
    af: { title: "Hoe om BlockDAG (BDAG) in 2026 te koop: DAG L1 gids", metaTitle: "Hoe om BDAG in 2026 te koop — Onmiddellike Swap", metaDescription: "Koop BlockDAG (BDAG) in 2026: DAG argitektuur, mainnet bekendstelling, risiko's en prysvooruitsig.", excerpt: "BlockDAG is een van die mees besproke L1 bekendstellings van 2026. Hoe om BDAG sonder rekening te koop.", category: "Koop Gidse" },
    hi: { title: "2026 में BlockDAG (BDAG) कैसे खरीदें: DAG L1 गाइड", metaTitle: "2026 में BDAG कैसे खरीदें — त्वरित स्वैप", metaDescription: "2026 में BlockDAG (BDAG) खरीदें: DAG आर्किटेक्चर, मेननेट लॉन्च, जोखिम और मूल्य पूर्वानुमान।", excerpt: "BlockDAG 2026 के सबसे चर्चित L1 लॉन्च में से एक है। बिना खाते के BDAG कैसे खरीदें।", category: "खरीदारी गाइड" },
    vi: { title: "Cách mua BlockDAG (BDAG) năm 2026: hướng dẫn DAG L1", metaTitle: "Cách mua BDAG năm 2026 — Swap tức thì", metaDescription: "Mua BlockDAG (BDAG) năm 2026: kiến trúc DAG, ra mắt mainnet, rủi ro và dự báo giá.", excerpt: "BlockDAG là một trong những đợt ra mắt L1 được bàn tán nhiều nhất 2026. Cách mua BDAG không tài khoản.", category: "Hướng dẫn mua" },
    tr: { title: "2026'da BlockDAG (BDAG) Nasıl Satın Alınır: DAG L1 Rehberi", metaTitle: "2026'da BDAG Nasıl Satın Alınır — Anında Swap", metaDescription: "2026'da BlockDAG (BDAG) satın alın: DAG mimarisi, mainnet lansmanı, riskler ve fiyat tahmini.", excerpt: "BlockDAG 2026'nın en çok konuşulan L1 lansmanlarından biri. Hesapsız BDAG nasıl alınır.", category: "Satın Alma Rehberleri" },
    uk: { title: "Як купити BlockDAG (BDAG) у 2026: гід DAG L1", metaTitle: "Як купити BDAG у 2026 — Миттєвий своп", metaDescription: "Купуйте BlockDAG (BDAG) у 2026: DAG-архітектура, запуск мейннету, ризики та прогноз ціни.", excerpt: "BlockDAG — один із найбільш обговорюваних L1-запусків 2026 року. Як купити BDAG без облікового запису.", category: "Гіди з купівлі" },
  },
  "how-to-buy-bonk-2026": {
    es: { title: "Cómo comprar BONK en 2026: guía de la memecoin de Solana", metaTitle: "Cómo comprar BONK en 2026 — Swap instantáneo", metaDescription: "Compra BONK en 2026: configuración de wallet de Solana, contrato SPL, comisiones y proyección de precio.", excerpt: "BONK es la memecoin más activa de Solana en 2026. Cómo comprarla sin cuenta y sin riesgo de SPL falso.", category: "Guías de compra" },
    pt: { title: "Como comprar BONK em 2026: guia da memecoin de Solana", metaTitle: "Como comprar BONK em 2026 — Swap instantâneo", metaDescription: "Compre BONK em 2026: configuração de carteira Solana, contrato SPL, taxas e previsão de preço.", excerpt: "BONK é a memecoin mais ativa de Solana em 2026. Como comprar sem conta e sem risco de SPL falso.", category: "Guias de compra" },
    fr: { title: "Comment acheter BONK en 2026 : guide du memecoin Solana", metaTitle: "Comment acheter BONK en 2026 — Swap instantané", metaDescription: "Achetez BONK en 2026 : configuration du portefeuille Solana, contrat SPL, frais et prévision de prix.", excerpt: "BONK est le memecoin le plus actif de Solana en 2026. Comment l'acheter sans compte ni risque de faux SPL.", category: "Guides d'achat" },
    ja: { title: "2026年にBONKを買う方法:Solanaミームコインガイド", metaTitle: "2026年にBONKを買う方法 — インスタントスワップ", metaDescription: "2026年にBONKを購入:Solanaウォレット設定、SPLコントラクト、手数料、価格見通し。", excerpt: "BONKは2026年Solanaで最もアクティブなミームコイン。アカウントなし、偽SPLリスクなしで購入。", category: "購入ガイド" },
    fa: { title: "نحوه خرید BONK در ۲۰۲۶: راهنمای میم‌کوین سولانا", metaTitle: "نحوه خرید BONK در ۲۰۲۶ — سواپ فوری", metaDescription: "خرید BONK در ۲۰۲۶: تنظیم کیف پول سولانا، قرارداد SPL، کارمزد و چشم‌انداز قیمت.", excerpt: "BONK فعال‌ترین میم‌کوین سولانا در ۲۰۲۶ است. خرید بدون حساب و بدون ریسک SPL جعلی.", category: "راهنمای خرید" },
    ur: { title: "2026 میں BONK کیسے خریدیں: Solana میم کوائن گائیڈ", metaTitle: "2026 میں BONK کیسے خریدیں — فوری سواپ", metaDescription: "2026 میں BONK خریدیں: Solana والیٹ سیٹ اپ، SPL کنٹریکٹ، فیس اور قیمت کا تخمینہ۔", excerpt: "BONK 2026 میں Solana کا سب سے فعال میم کوائن ہے۔ بغیر اکاؤنٹ، بغیر جعلی SPL خطرے کے خریداری۔", category: "خریداری کی گائیڈز" },
    he: { title: "איך לקנות BONK ב-2026: מדריך מטבע מם של Solana", metaTitle: "איך לקנות BONK ב-2026 — החלפה מיידית", metaDescription: "קנייה של BONK ב-2026: הגדרת ארנק Solana, חוזה SPL, עמלות ותחזית מחיר.", excerpt: "BONK הוא מטבע המם הפעיל ביותר של Solana ב-2026. איך לקנות ללא חשבון וללא סיכון SPL מזויף.", category: "מדריכי קנייה" },
    af: { title: "Hoe om BONK in 2026 te koop: Solana memecoin gids", metaTitle: "Hoe om BONK in 2026 te koop — Onmiddellike Swap", metaDescription: "Koop BONK in 2026: Solana beursie opstelling, SPL kontrak, fooie en prysvooruitsig.", excerpt: "BONK is die mees aktiewe memecoin van Solana in 2026. Hoe om sonder rekening en sonder vals SPL risiko te koop.", category: "Koop Gidse" },
    hi: { title: "2026 में BONK कैसे खरीदें: Solana मीमकॉइन गाइड", metaTitle: "2026 में BONK कैसे खरीदें — त्वरित स्वैप", metaDescription: "2026 में BONK खरीदें: Solana वॉलेट सेटअप, SPL कॉन्ट्रैक्ट, शुल्क और मूल्य पूर्वानुमान।", excerpt: "BONK 2026 में Solana का सबसे सक्रिय मीमकॉइन है। बिना खाते और नकली SPL जोखिम के कैसे खरीदें।", category: "खरीदारी गाइड" },
    vi: { title: "Cách mua BONK năm 2026: hướng dẫn memecoin Solana", metaTitle: "Cách mua BONK năm 2026 — Swap tức thì", metaDescription: "Mua BONK năm 2026: cài đặt ví Solana, hợp đồng SPL, phí và dự báo giá.", excerpt: "BONK là memecoin sôi động nhất Solana năm 2026. Cách mua không tài khoản và không rủi ro SPL giả.", category: "Hướng dẫn mua" },
    tr: { title: "2026'da BONK Nasıl Satın Alınır: Solana Memecoin Rehberi", metaTitle: "2026'da BONK Nasıl Satın Alınır — Anında Swap", metaDescription: "2026'da BONK satın alın: Solana cüzdan kurulumu, SPL kontratı, ücretler ve fiyat tahmini.", excerpt: "BONK 2026'da Solana'nın en aktif memecoin'i. Hesapsız ve sahte SPL riski olmadan nasıl alınır.", category: "Satın Alma Rehberleri" },
    uk: { title: "Як купити BONK у 2026: гід мемкоїна Solana", metaTitle: "Як купити BONK у 2026 — Миттєвий своп", metaDescription: "Купуйте BONK у 2026: налаштування гаманця Solana, контракт SPL, комісії та прогноз ціни.", excerpt: "BONK — найактивніший мемкоїн Solana у 2026 році. Як купити без облікового запису та без ризику фейкового SPL.", category: "Гіди з купівлі" },
  },
};

/**
 * Build per-source-post translation collections matching the shape consumed
 * by `ALL_TRANSLATED_COLLECTIONS` in `blog-data.ts`. Each top-level export
 * is a `Record<lang, BlogPost>` for one English source post.
 */
function buildCollection(slug: string): Record<string, BlogPost> {
  const source = TRENDING_2026_POSTS.find((p) => p.slug === slug);
  if (!source) return {};
  const langs = TRANSLATIONS[slug] ?? {};
  const result: Record<string, BlogPost> = {};
  for (const [lang, meta] of Object.entries(langs)) {
    result[lang] = {
      ...source,
      title: meta.title,
      metaTitle: meta.metaTitle,
      metaDescription: meta.metaDescription,
      excerpt: meta.excerpt,
      category: meta.category,
    };
  }
  return result;
}

export const TRANSLATED_TRENDING_2026_PEPE = buildCollection("how-to-buy-pepe-2026");
export const TRANSLATED_TRENDING_2026_DOGE = buildCollection("how-to-buy-doge-2026");
export const TRANSLATED_TRENDING_2026_XRP = buildCollection("how-to-buy-xrp-2026");
export const TRANSLATED_TRENDING_2026_HYPE = buildCollection("how-to-buy-hype-hyperliquid-2026");
export const TRANSLATED_TRENDING_2026_TAO = buildCollection("how-to-buy-tao-bittensor-2026");
export const TRANSLATED_TRENDING_2026_SIREN = buildCollection("how-to-buy-siren-2026");
export const TRANSLATED_TRENDING_2026_BDAG = buildCollection("how-to-buy-blockdag-bdag-2026");
export const TRANSLATED_TRENDING_2026_BONK = buildCollection("how-to-buy-bonk-2026");
