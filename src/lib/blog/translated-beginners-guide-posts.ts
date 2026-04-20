import { seedAuthors } from "./seed-authors";
import type { BlogPost } from "./types";

export const BEGINNERS_GUIDE_EN: BlogPost = {
  slug: "beginners-guide-digital-assets-wallet-to-swap",
  title: "The Absolute Beginner's Guide to Digital Assets: From Wallet to Swap",
  metaTitle: "Beginner's Guide to Crypto Wallets & Swaps | MRC Global Pay",
  metaDescription: "Learn how to set up a digital wallet, find your address, and swap crypto in under 5 minutes. No experience needed. Step-by-step guide from a Registered Canadian MSB.",
  excerpt: "A complete, zero-jargon walkthrough for first-time digital asset users. Learn how to install a wallet, find your address, and complete your first swap on MRC Global Pay — all in under 5 minutes.",
  author: seedAuthors.danielCarter,
  publishedAt: "2026-04-12",
  updatedAt: "2026-04-12",
  readTime: "12 min read",
  category: "Guides",
  tags: ["Beginner", "Wallet", "Swap", "Trust Wallet", "Onboarding", "Digital Assets"],
  content: `Welcome to MRC Global Pay. We are a Registered Canadian Money Services Business (MSB). This guide will show you how to set up your digital vault and move funds globally in under 5 minutes, with no technical experience required.

## Why do I need a "Digital Vault" to hold my funds?

To hold digital assets, you need a **Wallet**. Think of this as a **private bank account** that exists only on your phone. Unlike a traditional bank, you are in full control — no middlemen, no approvals, no delays.

Your wallet is your vault. It stores your assets securely and gives you a unique **"Account Number"** (called an Address) for each type of coin you hold.

## How do I set up my wallet? (Step 1)

Setting up your wallet takes less than 2 minutes:

- Open your phone's **App Store** (iPhone) or **Play Store** (Android)
- Search for **"Trust Wallet"** (Look for the Blue Shield icon)
- Download and open the app
- Tap **"Create a new wallet"**

### ⚠️ THE GOLDEN RULE

The app will show you **12 words**. This is your **Physical Key**.

- **Write them down on paper**
- **Store that paper in a safe place**
- **If you lose these words, you lose your money**
- **Never share them with anyone, including us**

Think of these 12 words as the master key to your vault. There is no "forgot password" button. This is the tradeoff for having a truly private, self-controlled account.

## How do I find my "Account Number" (Address)? (Step 2)

Every asset has a unique **"Account Number"** (called an Address). You need this to receive money.

- On the main screen of the app, tap the coin you want (e.g., **Bitcoin** or **USDT**)
- Tap the big **[RECEIVE]** button
- You will see a long code of letters and numbers (Example: 0x71C...)
- Tap the **[COPY]** button

**CEO Tip:** Never type this code by hand. Always use the **[COPY]** and **[PASTE]** buttons. One wrong letter means the money is lost forever.

Think of this like an email address — if even one character is wrong, the message (or money) goes to the wrong place, and there is no way to get it back.

## How do I swap on MRC Global Pay? (Step 3)

Now that you have your code, you can use our website to exchange assets instantly.

- Go to [mrcglobalpay.com](/)
- **You Send:** Choose the coin you are giving
- **You Get:** Choose the coin you want to receive
- **Recipient Address:** Hold your finger in the box and select **PASTE**. This is where you put the code you copied in Step 2
- **Start Swap:** Tap **[Exchange Now]**

### The Transfer

- Our website will show you a **"Deposit Address."** Copy it
- Go back to your Trust Wallet, tap **[SEND]**, and **Paste** our address there
- Send the amount
- That's it — the swap is now in progress

## What happens after I send my funds? (Step 4)

Here is what you'll see on screen after initiating your swap:

- **Waiting:** Our system will say **"Waiting for Deposit"**
- **Confirming:** Once you send the funds, the screen will change to **"Confirming."** This is just the network verifying the safety of the trade (5–10 minutes)
- **Success:** Within minutes, your new coins will appear automatically in your Trust Wallet

You don't need to do anything else. The process is fully automated. Just sit back and wait for the confirmation.

## What if I'm afraid of losing money?

This is completely normal. Here is our recommendation:

**Start with a $1.00 "test swap."** This lets you see exactly how the system works before moving larger amounts. MRC Global Pay supports swaps from as low as **$0.30**, so there is no barrier to testing.

MRC Global Pay is a **Registered Canadian Money Services Business (MSB)**. Your transaction is processed through the same regulated infrastructure used by institutional clients.

## Where can I find my address if I'm lost?

Follow these exact steps:

- Open **Trust Wallet**
- Tap the **Coin** you want to receive
- Tap **[RECEIVE]**
- Tap **[COPY]**
- Come back to [mrcglobalpay.com](/) and **PASTE** it into the Recipient Address field

If you're still stuck, our 24/7 AI Concierge (bottom-right of the screen) can walk you through it in your language.

## Do I need to create an account on MRC Global Pay?

**No.** Your Trust Wallet **is** your account. MRC Global Pay does not store your personal data, ensuring your total privacy. The platform is registration-free and non-custodial — no account creation or sign-up forms required.

Just paste your address, choose your coins, and swap. It's that simple.

## Why is my transaction taking a while?

Digital networks perform a safety check called **"Confirmation."** This usually takes **5–15 minutes**. Your funds are safe and will appear in your wallet as soon as the check is complete.

Think of it like a bank transfer that says "processing" — the money has left one account and is on its way to the other. It just needs a few minutes for the network to verify everything is correct.

## Quick Reference: The Complete Flow

- **Step 1:** Download Trust Wallet → Create Wallet → Save your 12 words
- **Step 2:** Tap Coin → Tap [RECEIVE] → Tap [COPY]
- **Step 3:** Go to [mrcglobalpay.com](/) → Choose coins → PASTE your address → Tap [Exchange Now]
- **Step 4:** Copy the Deposit Address → Go to Trust Wallet → Tap [SEND] → PASTE → Send
- **Done:** Wait 5–15 minutes. Your new coins appear automatically.

---

*This guide is published by MRC Global Pay, a Registered Canadian Money Services Business (MSB Registration: C100000015). For questions, use the 24/7 AI Concierge on our website or visit our [FAQ page](/faq).*`,
};

/** Translated versions keyed by language code */
export const TRANSLATED_BEGINNERS_GUIDE_POSTS: Record<string, BlogPost> = {
  "af": {
    slug: "beginners-guide-digital-assets-wallet-to-swap",
    title: "Die Absolute Beginnersgids tot Digitale Bates: Van Beursie tot Ruil",
    metaTitle: "Beginnersgids tot Crypto Beursies en Ruile | MRC Global Pay",
    metaDescription: "Leer hoe om 'n digitale beursie op te stel, jou adres te vind, en kripto te ruil in minder as 5 minute. Geen ervaring nodig nie. Stap-vir-stap gids van 'n Geregistreerde Kanadese MSB.",
    excerpt: "'n Volledige, jargon-vrye deurloop vir eerstekeer-gebruikers van digitale bates. Leer hoe om 'n beursie te installeer, jou adres te vind, en jou eerste ruil op MRC Global Pay te voltooi — alles in minder as 5 minute.",
    author: seedAuthors.danielCarter,
    publishedAt: "2026-04-12",
    updatedAt: "2026-04-12",
    readTime: "12 min leestyd",
    category: "Guides",
    tags: ["Beginner", "Wallet", "Swap", "Trust Wallet", "Onboarding", "Digital Assets"],
    content: `Welkom by MRC Global Pay. Ons is 'n Geregistreerde Kanadese Geld Dienste Besigheid (MSB). Hierdie gids sal jou wys hoe om jou digitale kluis op te stel en fondse wêreldwyd te skuif in minder as 5 minute, sonder dat tegniese ervaring benodig word.

## Hoekom het ek 'n "Digitale Kluis" nodig om my fondse te hou?

Om digitale bates te hou, benodig jy 'n **Beursie**. Dink hieraan as 'n **privaat bankrekening** wat slegs op jou foon bestaan. Anders as 'n tradisionele bank, is jy in volle beheer — geen tussengangers, geen goedkeurings, geen vertragings nie.

Jou beursie is jou kluis. Dit stoor jou bates veilig en gee jou 'n unieke **"Rekeningnommer"** (genoem 'n Adres) vir elke tipe munt wat jy hou.

## Hoe stel ek my beursie op? (Stap 1)

Die opstel van jou beursie neem minder as 2 minute:

- Maak jou foon se **App Store** (iPhone) of **Play Store** (Android) oop
- Soek vir **"Trust Wallet"** (Soek vir die Blou Skild ikoon)
- Laai af en maak die toepassing oop
- Tik **"Create a new wallet"**

### ⚠️ DIE GOUDE REËL

Die toepassing sal jou **12 woorde** wys. Dit is jou **Fisiese Sleutel**.

- **Skryf dit op papier neer**
- **Bêre daardie papier op 'n veilige plek**
- **As jy hierdie woorde verloor, verloor jy jou geld**
- **Deel dit nooit met enigiemand nie, insluitend ons**

Dink aan hierdie 12 woorde as die hoofsleutel tot jou kluis. Daar is geen "wagwoord vergeet"-knoppie nie. Dit is die afweging vir 'n ware private, selfbeheerde rekening.

## Hoe vind ek my "Rekeningnommer" (Adres)? (Stap 2)

Elke bate het 'n unieke **"Rekeningnommer"** (genoem 'n Adres). Jy benodig dit om geld te ontvang.

- Op die hoofskerm van die toepassing, tik die muntstuk wat jy wil hê (bv. **Bitcoin** of **USDT**)
- Tik die groot **[RECEIVE]**-knoppie
- Jy sal 'n lang kode van letters en syfers sien (Voorbeeld: 0x71C...)
- Tik die **[COPY]**-knoppie

**HUB-wenk:** Tik nooit hierdie kode met die hand nie. Gebruik altyd die **[COPY]** en **[PASTE]** knoppies. Een verkeerde letter beteken die geld is vir ewig verlore.

Dink hieraan soos 'n e-posadres — as selfs een karakter verkeerd is, gaan die boodskap (of geld) na die verkeerde plek, en daar is geen manier om dit terug te kry nie.

## Hoe ruil ek op MRC Global Pay? (Stap 3)

Noudat jy jou kode het, kan jy ons webwerf gebruik om bates onmiddellik te ruil.

- Gaan na [mrcglobalpay.com](/
- **You Send:** Kies die munt wat jy gee
- **You Get:** Kies die munt wat jy wil ontvang
- **Recipient Address:** Hou jou vinger in die blokkie en kies **PASTE**. Dit is waar jy die kode wat jy in Stap 2 gekopieer het, plak
- **Start Swap:** Tik **[Exchange Now]**

### Die Oordrag

- Ons webwerf sal jou 'n **"Deposit Address"** wys. Kopieer dit
- Gaan terug na jou Trust Wallet, tik **[SEND]**, en **Plak** ons adres daar
- Stuur die bedrag
- Dis dit — die ruil is nou aan die gang

## Wat gebeur nadat ek my fondse gestuur het? (Stap 4)

Hier is wat jy op die skerm sal sien nadat jy jou ruil geïnisieer het:

- **Waiting:** Ons stelsel sal sê **"Waiting for Deposit"**
- **Confirming:** Sodra jy die fondse stuur, sal die skerm verander na **"Confirming."** Dit is net die netwerk wat die veiligheid van die transaksie verifieer (5-10 minute)
- **Success:** Binne minute sal jou nuwe munte outomaties in jou Trust Wallet verskyn

Jy hoef niks anders te doen nie. Die proses is ten volle outomaties. Sit net terug en wag vir die bevestiging.

## Wat as ek bang is om geld te verloor?

Dit is heeltemal normaal. Hier is ons aanbeveling:

**Begin met 'n $1.00 "toetsruil."** Dit laat jou presies sien hoe die stelsel werk voordat jy groter bedrae skuif. MRC Global Pay ondersteun ruile vanaf so laag as **$0.30**, so daar is geen belemmering om te toets nie.

MRC Global Pay is 'n **Geregistreerde Kanadese Geld Dienste Besigheid (MSB)**. Jou transaksie word verwerk deur dieselfde gereguleerde infrastruktuur wat deur institusionele kliënte gebruik word.

## Waar kan ek my adres vind as ek verdwaal het?

Volg hierdie presiese stappe:

- Maak **Trust Wallet** oop
- Tik die **Munt** wat jy wil ontvang
- Tik **[RECEIVE]**
- Tik **[COPY]**
- Kom terug na [mrcglobalpay.com](/) en **PLAK** dit in die Recipient Address-veld

As jy nog steeds vasgevang is, kan ons 24/7 KI Konsierge (regs-onder van die skerm) jou daardeur lei in jou taal.

## Moet ek 'n rekening op MRC Global Pay skep?

**Nee.** Jou Trust Wallet **is** jou rekening. MRC Global Pay stoor nie jou persoonlike data nie, wat jou totale privaatheid verseker. Daar is geen registrasie, geen KYC-vorms, en geen wagtye nie.

Plak net jou adres, kies jou munte, en ruil. Dit is so eenvoudig.

## Waarom neem my transaksie 'n rukkie?

Digitale netwerke voer 'n veiligheidskontrole uit wat **"Confirmation"** genoem word. Dit duur gewoonlik **5-15 minute**. Jou fondse is veilig en sal in jou beursie verskyn sodra die kontrole voltooi is.

Dink daaraan soos 'n bankoordrag wat sê "verwerking" — die geld het een rekening verlaat en is op pad na die ander. Dit benodig net 'n paar minute vir die netwerk om alles korrek te verifieer.

## Vinnige Verwysing: Die Volledige Vloei

- **Stap 1:** Laai Trust Wallet af → Skep Beursie → Stoor jou 12 woorde
- **Stap 2:** Tik Munt → Tik [RECEIVE] → Tik [COPY]
- **Stap 3:** Gaan na [mrcglobalpay.com](/) → Kies munte → PLAK jou adres → Tik [Exchange Now]
- **Stap 4:** Kopieer die Deposit Adres → Gaan na Trust Wallet → Tik [SEND] → PLAK → Stuur
- **Klaar:** Wag 5-15 minute. Jou nuwe munte verskyn outomaties.

---

*Hierdie gids word gepubliseer deur MRC Global Pay, 'n Geregistreerde Kanadese Geld Dienste Besigheid (MSB Registrasie: C100000015). Vir vrae, gebruik die 24/7 KI Konsierge op ons webwerf of besoek ons [FAQ bladsy](/faq).*`,
  },
  "es": {
    slug: "beginners-guide-digital-assets-wallet-to-swap",
    title: "La Guía Absoluta para Principiantes sobre Activos Digitales: De la Cartera al Intercambio",
    metaTitle: "Guía para Principiantes Cripto: Cartera & Intercambios | MRC Global Pay",
    metaDescription: "Aprende a configurar una cartera digital, encontrar tu dirección e intercambiar cripto en menos de 5 minutos. No se necesita experiencia. Guía paso a paso de un MSB canadiense registrado.",
    excerpt: "Una guía completa y sin jerga para usuarios primerizos de activos digitales. Aprende a instalar una cartera, encontrar tu dirección y completar tu primer intercambio en MRC Global Pay, todo en menos de 5 minutos.",
    author: seedAuthors.danielCarter,
    publishedAt: "2026-04-12",
    updatedAt: "2026-04-12",
    readTime: "12 min de lectura",
    category: "Guides",
    tags: ["Beginner", "Wallet", "Swap", "Trust Wallet", "Onboarding", "Digital Assets"],
    content: `Bienvenido a MRC Global Pay. Somos una empresa canadiense registrada de servicios monetarios (MSB). Esta guía te mostrará cómo configurar tu bóveda digital y mover fondos globalmente en menos de 5 minutos, sin necesidad de experiencia técnica.

## ¿Por qué necesito una "Bóveda Digital" para guardar mis fondos?

Para mantener activos digitales, necesitas una **Cartera** (Wallet). Piensa en esto como una **cuenta bancaria privada** que existe solo en tu teléfono. A diferencia de un banco tradicional, tienes el control total: sin intermediarios, sin aprobaciones, sin demoras.

Tu cartera es tu bóveda. Almacena tus activos de forma segura y te proporciona un **"Número de Cuenta"** único (llamado Dirección) para cada tipo de moneda que poseas.

## ¿Cómo configuro mi cartera? (Paso 1)

Configurar tu cartera lleva menos de 2 minutos:

- Abre la **App Store** (iPhone) o **Play Store** (Android) de tu teléfono.
- Busca **"Trust Wallet"** (Busca el icono del Escudo Azul).
- Descarga y abre la aplicación.
- Toca **"Crear una nueva cartera"**.

### ⚠️ LA REGLA DE ORO

La aplicación te mostrará **12 palabras**. Esta es tu **Llave Física**.

- **Escríbelas en papel**.
- **Guarda ese papel en un lugar seguro**.
- **Si pierdes estas palabras, pierdes tu dinero**.
- **Nunca las compartas con nadie, incluidos nosotros**.

Piensa en estas 12 palabras como la llave maestra de tu bóveda. No hay un botón de "olvidé mi contraseña". Este es el precio a pagar por tener una cuenta verdaderamente privada y autocontrolada.

## ¿Cómo encuentro mi “Número de Cuenta” (Dirección)? (Paso 2)

Cada activo tiene un **"Número de Cuenta"** único (llamado Dirección). Lo necesitas para recibir dinero.

- En la pantalla principal de la aplicación, toca la moneda que desees (por ejemplo, **Bitcoin** o **USDT**).
- Toca el gran botón **[RECEIVE]**.
- Verás un código largo de letras y números (Ejemplo: 0x71C...).
- Toca el botón **[COPY]**.

**Consejo del CEO:** Nunca escribas este código a mano. Siempre usa los botones **[COPY]** y **[PASTE]**. Una letra incorrecta significa que el dinero se pierde para siempre.

Piensa en esto como una dirección de correo electrónico: si incluso un carácter es incorrecto, el mensaje (o el dinero) va al lugar equivocado, y no hay forma de recuperarlo.

## ¿Cómo hago un intercambio en MRC Global Pay? (Paso 3)

Ahora que tienes tu código, puedes usar nuestro sitio web para intercambiar activos al instante.

- Ve a [mrcglobalpay.com](/) .
- **Tú envías:** Elige la moneda que estás dando.
- **Tú recibes:** Elige la moneda que deseas recibir.
- **Dirección del destinatario:** Mantén el dedo en el recuadro y selecciona **PASTE**. Aquí es donde pones el código que copiaste en el Paso 2.
- **Iniciar intercambio:** Toca **[Exchange Now]**.

### La Transferencia

- Nuestro sitio web te mostrará una **"Dirección de Depósito"**. Cópiala.
- Vuelve a tu Trust Wallet, toca **[SEND]**, y **Pega** nuestra dirección allí.
- Envía la cantidad.
- Eso es todo, el intercambio ya está en curso.

## ¿Qué sucede después de enviar mis fondos? (Paso 4)

Esto es lo que verás en pantalla después de iniciar tu intercambio:

- **Esperando:** Nuestro sistema dirá **"Waiting for Deposit"** (Esperando depósito).
- **Confirmando:** Una vez que envíes los fondos, la pantalla cambiará a **"Confirming"** (Confirmando). Esto es solo la red verificando la seguridad de la transacción (5-10 minutos).
- **Éxito:** En cuestión de minutos, tus nuevas monedas aparecerán automáticamente en tu Trust Wallet.

No necesitas hacer nada más. El proceso está completamente automatizado. Solo siéntate y espera la confirmación.

## ¿Qué pasa si tengo miedo de perder dinero?

Esto es completamente normal. Aquí está nuestra recomendación:

**Empieza con un "intercambio de prueba" de $1.00.** Esto te permite ver exactamente cómo funciona el sistema antes de mover cantidades mayores. MRC Global Pay admite intercambios desde tan solo **$0.30**, por lo que no hay barreras para la prueba.

MRC Global Pay es una **empresa canadiense de servicios monetarios (MSB) registrada**. Tu transacción se procesa a través de la misma infraestructura regulada utilizada por clientes institucionales.

## ¿Dónde puedo encontrar mi dirección si estoy perdido?

Sigue estos pasos exactos:

- Abre **Trust Wallet**.
- Toca la **Moneda** que deseas recibir.
- Toca **[RECEIVE]**.
- Toca **[COPY]**.
- Vuelve a [mrcglobalpay.com](/) y **PEGA** en el campo de Dirección del destinatario.

Si sigues atascado, nuestro Concierge IA 24/7 (abajo a la derecha de la pantalla) puede guiarte en tu idioma.

## ¿Necesito crear una cuenta en MRC Global Pay?

**No.** Tu Trust Wallet **es** tu cuenta. MRC Global Pay no almacena tus datos personales, garantizando tu total privacidad. No hay registro, no hay formularios KYC y no hay períodos de espera.

Simplemente pega tu dirección, elige tus monedas e intercambia. Así de simple.

## ¿Por qué mi transacción está tardando un poco?

Las redes digitales realizan una comprobación de seguridad llamada **"Confirmación"**. Esto generalmente tarda **5-15 minutos**. Tus fondos están seguros y aparecerán en tu cartera tan pronto como se complete la comprobación.

Piensa en ello como una transferencia bancaria que dice "procesando": el dinero ha salido de una cuenta y está en camino a la otra. Solo necesita unos minutos para que la red verifique que todo está correcto.

## Referencia Rápida: El Flujo Completo

- **Paso 1:** Descarga Trust Wallet → Crea una cartera → Guarda tus 12 palabras.
- **Paso 2:** Toca Moneda → Toca [RECEIVE] → Toca [COPY].
- **Paso 3:** Ve a [mrcglobalpay.com](/) → Elige monedas → PEGA tu dirección → Toca [Exchange Now].
- **Paso 4:** Copia la dirección de depósito → Ve a Trust Wallet → Toca [SEND] → PEGA → Envía.
- **Listo:** Espera 5-15 minutos. Tus nuevas monedas aparecerán automáticamente.

---

*Esta guía es publicada por MRC Global Pay, una empresa de servicios monetarios (MSB) canadiense registrada (Registro MSB: C100000015). Para preguntas, usa el Concierge IA 24/7 en nuestro sitio web o visita nuestra [página de preguntas frecuentes](/faq).*`,
  },
  "fa": {
    slug: "beginners-guide-digital-assets-wallet-to-swap",
    title: "راهنمای کامل مبتدیان برای دارایی‌های دیجیتال: از کیف پول تا سوآپ",
    metaTitle: "راهنمای مبتدیان برای کیف پول و مبادلات کریپتو | MRC Global Pay",
    metaDescription: "نحوه راه‌اندازی کیف پول دیجیتال، پیدا کردن آدرس و مبادله رمزارز در کمتر از 5 دقیقه را بیاموزید. بدون نیاز به تجربه. راهنمای گام به گام از یک MSB ثبت شده کانادایی.",
    excerpt: "یک راهنمای کامل و بدون اصطلاحات تخصصی برای کاربران دارایی‌های دیجیتال برای اولین بار. نحوه نصب کیف پول، پیدا کردن آدرس و تکمیل اولین مبادله خود در MRC Global Pay را بیاموزید - همه در کمتر از 5 دقیقه.",
    author: seedAuthors.danielCarter,
    publishedAt: "2026-04-12",
    updatedAt: "2026-04-12",
    readTime: "۱۲ دقیقه مطالعه",
    category: "Guides",
    tags: ["Beginner", "Wallet", "Swap", "Trust Wallet", "Onboarding", "Digital Assets"],
    content: `به MRC Global Pay خوش آمدید. ما یک تجارت خدمات مالی (MSB) ثبت شده کانادایی هستیم. این راهنما به شما نشان می‌دهد که چگونه خزانه دیجیتالی خود را راه‌اندازی کرده و وجوه را در سطح جهانی در کمتر از 5 دقیقه و بدون نیاز به تجربه فنی انتقال دهید.

## چرا برای نگهداری وجوه خود به «خزانه دیجیتال» نیاز دارم؟

برای نگهداری دارایی‌های دیجیتال، به یک **کیف پول** نیاز دارید. این را به عنوان یک **حساب بانکی خصوصی** در نظر بگیرید که فقط در تلفن شما وجود دارد. برخلاف یک بانک سنتی، شما کنترل کامل دارید — بدون واسطه، بدون تأییدیه، بدون تأخیر.

کیف پول شما خزانه شماست. دارایی‌های شما را به صورت ایمن ذخیره می‌کند و به شما یک **«شماره حساب»** منحصر به فرد (که آدرس نامیده می‌شود) برای هر نوع سکه‌ای که نگهداری می‌کنید می‌دهد.

## چگونه کیف پول خود را راه‌اندازی کنم؟ (مرحله 1)

راه‌اندازی کیف پول شما کمتر از 2 دقیقه طول می‌کشد:

- **App Store** (آیفون) یا **Play Store** (اندروید) تلفن خود را باز کنید.
- **«Trust Wallet»** را جستجو کنید (به دنبال آیکون سپرد آبی باشید)
- برنامه را دانلود و باز کنید
- روی **«Create a new wallet»** ضربه بزنید

### ⚠️ قانون طلایی

برنامه **12 کلمه** را به شما نشان می‌دهد. این **کلید فیزیکی** شماست.

- **آن‌ها را روی کاغذ بنویسید**
- **آن کاغذ را در مکانی امن نگهداری کنید**
- **اگر این کلمات را گم کنید، پول خود را از دست می‌دهید**
- **هرگز آن‌ها را با کسی، از جمله ما، به اشتراک نگذارید**

این 12 کلمه را به عنوان کلید اصلی خزانه خود در نظر بگیرید. دکمه «فراموشی رمز عبور» وجود ندارد. این امتیاز داشتن یک حساب واقعاً خصوصی و خود-کنترل شده است.

## چگونه «شماره حساب» (آدرس) خود را پیدا کنم؟ (مرحله 2)

هر دارایی یک **«شماره حساب»** منحصر به فرد (که آدرس نامیده می‌شود) دارد. برای دریافت پول به این شماره نیاز دارید.

- در صفحه اصلی برنامه، روی سکه مورد نظر خود ضربه بزنید (مثلاً **بیت کوین** یا **USDT**)
- روی دکمه بزرگ **[RECEIVE]** ضربه بزنید
- یک کد بلند از حروف و اعداد خواهید دید (مثال: 0x71C...)
- روی دکمه **[COPY]** ضربه بزنید

**نکته مدیرعامل:** هرگز این کد را به صورت دستی تایپ نکنید. همیشه از دکمه‌های **[COPY]** و **[PASTE]** استفاده کنید. یک حرف اشتباه به معنای از دست رفتن وجه برای همیشه است.

این را مانند یک آدرس ایمیل در نظر بگیرید — اگر حتی یک کاراکتر اشتباه باشد، پیام (یا پول) به مکان اشتباهی می‌رود و هیچ راهی برای بازگرداندن آن وجود ندارد.

## چگونه در MRC Global Pay سوآپ کنم؟ (مرحله 3)

اکنون که کد خود را دارید، می‌توانید از وب‌سایت ما برای مبادله فوری دارایی‌ها استفاده کنید.

- به [mrcglobalpay.com](/) بروید
- **You Send:** سکه‌ای را که می‌فرستید انتخاب کنید
- **You Get:** سکه‌ای را که می‌خواهید دریافت کنید انتخاب کنید
- **Recipient Address:** انگشت خود را در کادر نگه دارید و **PASTE** را انتخاب کنید. اینجاست که کدی را که در مرحله 2 کپی کردید، قرار می‌دهید.
- **Start Swap:** روی **[Exchange Now]** ضربه بزنید

### انتقال

- وب‌سایت ما یک **«Deposit Address»** (آدرس واریز) به شما نشان می‌دهد. آن را کپی کنید.
- به Trust Wallet خود برگردید، روی **[SEND]** ضربه بزنید و آدرس ما را در آنجا **Paste** کنید.
- مبلغ را ارسال کنید.
- همین است — مبادله اکنون در حال انجام است.

## بعد از ارسال وجوه چه اتفاقی می‌افتد؟ (مرحله 4)

این چیزی است که پس از شروع مبادله خود روی صفحه خواهید دید:

- **Waiting:** سیستم ما **«Waiting for Deposit»** (در انتظار واریز) را نشان می‌دهد.
- **Confirming:** هنگامی که وجوه را ارسال کردید، صفحه به **«Confirming»** (در حال تأیید) تغییر می‌کند. این فقط شبکه است که ایمنی معامله را تأیید می‌کند (5 تا 10 دقیقه)
- **Success:** در عرض چند دقیقه، سکه‌های جدید شما به طور خودکار در Trust Wallet شما ظاهر می‌شوند.

شما نیازی به انجام هیچ کار دیگری ندارید. فرآیند کاملاً خودکار است. فقط بنشینید و منتظر تأیید بمانید.

## اگر از دست دادن پول می‌ترسم، چه کاری باید انجام دهم؟

این کاملاً طبیعی است. توصیه ما این است:

**با یک «مبادله آزمایشی» 1.00 دلاری شروع کنید.** این به شما امکان می‌دهد قبل از جابجایی مبالغ بزرگتر، نحوه عملکرد سیستم را دقیقاً مشاهده کنید. MRC Global Pay مبادلاتی را از حداقل **0.30 دلار** پشتیبانی می‌کند، بنابراین هیچ مانعی برای آزمایش وجود ندارد.

MRC Global Pay یک **شرکت خدمات پولی (MSB) ثبت شده کانادایی** است. تراکنش شما از طریق همان زیرساخت تحت نظارت که توسط مشتریان سازمانی استفاده می‌شود، پردازش می‌شود.

## اگر گم شدم، آدرس خود را کجا پیدا کنم؟

این مراحل دقیق را دنبال کنید:

- **Trust Wallet** را باز کنید
- روی **Coin** مورد نظر برای دریافت ضربه بزنید
- روی **[RECEIVE]** ضربه بزنید
- روی **[COPY]** ضربه بزنید
- به [mrcglobalpay.com](/) برگردید و آن را در فیلد Recipient Address **PASTE** کنید.

اگر هنوز گیر کرده‌اید، هوش مصنوعی کانسیِرژ 24/7 ما (پایین سمت راست صفحه) می‌تواند شما را به زبان خودتان راهنمایی کند.

## آیا باید در MRC Global Pay حساب ایجاد کنم؟

**خیر.** Trust Wallet شما **همان** حساب شماست. MRC Global Pay اطلاعات شخصی شما را ذخیره نمی‌کند و از حریم خصوصی کامل شما اطمینان می‌دهد. هیچ ثبت‌نام، هیچ فرم KYC و هیچ دوره انتظاری وجود ندارد.

فقط آدرس خود را جای‌گذاری کنید، سکه‌های خود را انتخاب کنید و مبادله کنید. به همین سادگی.

## چرا تراکنش من طول می‌کشد؟

شبکه‌های دیجیتال یک بررسی ایمنی به نام **«تأیید»** انجام می‌دهند. این معمولاً **5 تا 15 دقیقه** طول می‌کشد. وجوه شما ایمن هستند و به محض تکمیل بررسی در کیف پول شما ظاهر خواهند شد.

این را مانند یک انتقال بانکی در نظر بگیرید که می‌گوید «در حال پردازش» — پول از یک حساب خارج شده و در راه حساب دیگر است. فقط چند دقیقه طول می‌کشد تا شبکه همه چیز را تأیید کند که درست است.

## مرجع سریع: جریان کامل

- **مرحله 1:** Trust Wallet را دانلود کنید → کیف پول ایجاد کنید → 12 کلمه خود را ذخیره کنید
- **مرحله 2:** روی Coin ضربه بزنید → روی [RECEIVE] ضربه بزنید → روی [COPY] ضربه بزنید
- **مرحله 3:** به [mrcglobalpay.com](/) بروید → سکه‌ها را انتخاب کنید → آدرس خود را **PASTE** کنید → روی [Exchange Now] ضربه بزنید
- **مرحله 4:** Deposit Address را کپی کنید → به Trust Wallet بروید → روی [SEND] ضربه بزنید → **PASTE** → ارسال کنید
- **انجام شد:** 5 تا 15 دقیقه صبر کنید. سکه‌های جدید شما به طور خودکار ظاهر می‌شوند.

---

*این راهنما توسط MRC Global Pay، یک شرکت خدمات پولی (MSB Registration: C100000015) ثبت شده کانادایی منتشر شده است. برای پرسش‌ها، از هوش مصنوعی کانسیِرژ 24/7 در وب‌سایت ما استفاده کنید یا از [صفحه پرسش‌های متداول](/faq) ما بازدید کنید.*`,
  },
  "fr": {
    slug: "beginners-guide-digital-assets-wallet-to-swap",
    title: "Le guide du débutant absolu sur les actifs numériques : du portefeuille à l'échange",
    metaTitle: "Guide débutant Portefeuilles & Swaps Crypto | MRC Global Pay",
    metaDescription: "Apprenez à configurer un portefeuille numérique, à trouver votre adresse et à échanger des cryptomonnaies en moins de 5 minutes. Aucune expérience requise. Guide étape par étape d'une EFS canadienne enregistrée.",
    excerpt: "Un guide complet et sans jargon pour les nouveaux utilisateurs d'actifs numériques. Apprenez à installer un portefeuille, à trouver votre adresse et à effectuer votre premier échange sur MRC Global Pay – le tout en moins de 5 minutes.",
    author: seedAuthors.danielCarter,
    publishedAt: "2026-04-12",
    updatedAt: "2026-04-12",
    readTime: "12 min de lecture",
    category: "Guides",
    tags: ["Beginner", "Wallet", "Swap", "Trust Wallet", "Onboarding", "Digital Assets"],
    content: `Bienvenue chez MRC Global Pay. Nous sommes une entreprise de services monétaires (ESM) canadienne enregistrée. Ce guide vous montrera comment configurer votre coffre-fort numérique et transférer des fonds à l'échelle mondiale en moins de 5 minutes, sans aucune expérience technique requise.

## Pourquoi ai-je besoin d'un "coffre-fort numérique" pour conserver mes fonds ?

Pour détenir des actifs numériques, vous avez besoin d'un **portefeuille**. Considérez cela comme un **compte bancaire privé** qui n'existe que sur votre téléphone. Contrairement à une banque traditionnelle, vous avez le contrôle total – pas d'intermédiaires, pas d'approbations, pas de délais.

Votre portefeuille est votre coffre-fort. Il stocke vos actifs en toute sécurité et vous donne un **"numéro de compte"** unique (appelé adresse) pour chaque type de pièce que vous détenez.

## Comment configurer mon portefeuille ? (Étape 1)

La configuration de votre portefeuille prend moins de 2 minutes :

- Ouvrez le **App Store** (iPhone) ou le **Play Store** (Android) de votre téléphone
- Recherchez **"Trust Wallet"** (Recherchez l'icône du bouclier bleu)
- Téléchargez et ouvrez l'application
- Appuyez sur **"Créer un nouveau portefeuille"**

### ⚠️ LA RÈGLE D'OR

L'application vous montrera **12 mots**. C'est votre **clé physique**.

- **Notez-les sur papier**
- **Conservez ce papier en lieu sûr**
- **Si vous perdez ces mots, vous perdez votre argent**
- **Ne les partagez jamais avec personne, y compris nous**

Considérez ces 12 mots comme la clé principale de votre coffre-fort. Il n'y a pas de bouton "mot de passe oublié". C'est le compromis pour avoir un compte véritablement privé et autonome.

## Comment trouver mon "numéro de compte" (adresse) ? (Étape 2)

Chaque actif a un **"numéro de compte"** unique (appelé adresse). Vous en avez besoin pour recevoir de l'argent.

- Sur l'écran principal de l'application, appuyez sur la pièce souhaitée (par exemple, **Bitcoin** ou **USDT**)
- Appuyez sur le gros bouton **[RECEIVE]**
- Vous verrez un long code de lettres et de chiffres (Exemple : 0x71C...)
- Appuyez sur le bouton **[COPY]**

**Conseil du PDG :** Ne tapez jamais ce code à la main. Utilisez toujours les boutons **[COPY]** et **[PASTE]**. Une mauvaise lettre signifie que l'argent est perdu à jamais.

Considérez cela comme une adresse e-mail — si un seul caractère est incorrect, le message (ou l'argent) va au mauvais endroit, et il n'y a aucun moyen de le récupérer.

## Comment puis-je échanger sur MRC Global Pay ? (Étape 3)

Maintenant que vous avez votre code, vous pouvez utiliser notre site Web pour échanger des actifs instantanément.

- Rendez-vous sur [mrcglobalpay.com](/
- **Vous envoyez :** Choisissez la pièce que vous donnez
- **Vous recevez :** Choisissez la pièce que vous souhaitez recevoir
- **Adresse du destinataire :** Maintenez votre doigt dans la case et sélectionnez **[PASTE]**. C'est là que vous mettez le code que vous avez copié à l'étape 2
- **Démarrer l'échange :** Appuyez sur **[Exchange Now]**

### Le transfert

- Notre site Web vous montrera une **"adresse de dépôt"**. Copiez-la
- Retournez à votre Trust Wallet, appuyez sur **[SEND]**, et **collez** notre adresse là
- Envoyez le montant
- C'est tout — l'échange est maintenant en cours

## Que se passe-t-il après l'envoi de mes fonds ? (Étape 4)

Voici ce que vous verrez à l'écran après avoir initié votre échange :

- **En attente :** Notre système affichera **"Waiting for Deposit"**
- **Confirmation :** Une fois que vous avez envoyé les fonds, l'écran passera à **"Confirming"**. Le réseau ne fait que vérifier la sécurité de la transaction (5 à 10 minutes)
- **Succès :** En quelques minutes, vos nouvelles pièces apparaîtront automatiquement dans votre Trust Wallet

Vous n'avez rien d'autre à faire. Le processus est entièrement automatisé. Il vous suffit de vous asseoir et d'attendre la confirmation.

## Et si j'ai peur de perdre de l'argent ?

C'est tout à fait normal. Voici notre recommandation :

**Commencez par un "échange test" de 1,00 $.** Cela vous permet de voir exactement comment le système fonctionne avant de déplacer des montants plus importants. MRC Global Pay prend en charge des échanges à partir de **0,30 $**, il n'y a donc aucun obstacle aux tests.

MRC Global Pay est une **entreprise canadienne de services monétaires (ESM) enregistrée**. Votre transaction est traitée via la même infrastructure réglementée utilisée par les clients institutionnels.

## Où puis-je trouver mon adresse si je suis perdu ?

Suivez ces étapes exactes :

- Ouvrez **Trust Wallet**
- Appuyez sur la **pièce** que vous souhaitez recevoir
- Appuyez sur **[RECEIVE]**
- Appuyez sur **[COPY]**
- Revenez sur [mrcglobalpay.com](/) et **collez-la** dans le champ "Recipient Address"

Si vous êtes toujours bloqué, notre concierge IA 24h/24 et 7j/7 (en bas à droite de l'écran) peut vous guider dans votre langue.

## Dois-je créer un compte sur MRC Global Pay ?

**Non.** Votre Trust Wallet **est** votre compte. MRC Global Pay ne stocke pas vos données personnelles, garantissant ainsi votre confidentialité totale. Il n'y a pas d'enregistrement, pas de formulaires KYC et pas de périodes d'attente.

Il suffit de coller votre adresse, de choisir vos pièces et d'échanger. C'est aussi simple que cela.

## Pourquoi ma transaction prend-elle un certain temps ?

Les réseaux numériques effectuent un contrôle de sécurité appelé **"confirmation"**. Cela prend généralement **5 à 15 minutes**. Vos fonds sont en sécurité et apparaîtront dans votre portefeuille dès que le contrôle sera terminé.

Considérez-le comme un virement bancaire qui indique "en cours de traitement" – l'argent a quitté un compte et est en route vers l'autre. Il faut juste quelques minutes au réseau pour vérifier que tout est correct.

## Référence rapide : Le flux complet

- **Étape 1 :** Téléchargez Trust Wallet → Créez un portefeuille → Enregistrez vos 12 mots
- **Étape 2 :** Appuyez sur la pièce → Appuyez sur [RECEIVE] → Appuyez sur [COPY]
- **Étape 3 :** Allez sur [mrcglobalpay.com](/) → Choisissez les pièces → ColleZ votre adresse → Appuyez sur [Exchange Now]
- **Étape 4 :** Copiez l'adresse de dépôt → Allez sur Trust Wallet → Appuyez sur [SEND] → COLLEZ → Envoyez
- **Terminé :** Attendez 5 à 15 minutes. Vos nouvelles pièces apparaissent automatiquement.

---

*Ce guide est publié par MRC Global Pay, une entreprise de services monétaires (ESM) canadienne enregistrée (enregistrement ESM : C100000015). Pour toute question, utilisez le concierge IA 24h/24 et 7j/7 sur notre site Web ou visitez notre [page FAQ](/faq).* `,
  },
  "he": {
    slug: "beginners-guide-digital-assets-wallet-to-swap",
    title: "המדריך למתחילים מוחלטים לנכסים דיגיטליים: מארנק ועד החלפה",
    metaTitle: "מדריך למתחילים לארנקי קריפטו והחלפות | MRC Global Pay",
    metaDescription: "למד כיצד להגדיר ארנק דיגיטלי, למצוא את הכתובת שלך ולהחליף קריפטו בפחות מ-5 דקות. אין צורך בניסיון. מדריך שלב אחר שלב מחברה קנדית רשומה למתן שירותי מטבע.",
    excerpt: "מדריך מלא, ללא ז'רגון, למשתמשי נכסים דיגיטליים בפעם הראשונה. למד כיצד להתקין ארנק, למצוא את הכתובת שלך ולהשלים את ההחלפה הראשונה שלך ב-MRC Global Pay - הכל בפחות מ-5 דקות.",
    author: seedAuthors.danielCarter,
    publishedAt: "2026-04-12",
    updatedAt: "2026-04-12",
    readTime: "12 דקות קריאה",
    category: "Guides",
    tags: ["Beginner", "Wallet", "Swap", "Trust Wallet", "Onboarding", "Digital Assets"],
    content: `ברוכים הבאים ל-MRC Global Pay. אנו עסק קנדי רשום למתן שירותי מטבע (MSB). מדריך זה יראה לך כיצד להגדיר את הכספת הדיגיטלית שלך ולהעביר כספים באופן גלובלי בפחות מ-5 דקות, ללא צורך בניסיון טכני.

## למה אני צריך "כספת דיגיטלית" כדי להחזיק את הכספים שלי?

כדי להחזיק נכסים דיגיטליים, אתה צריך **ארנק**. חשוב על זה כעל **חשבון בנק פרטי** שקיים רק בטלפון שלך. בניגוד לבנק מסורתי, אתה בשליטה מלאה – ללא מתווכים, ללא אישורים, ללא עיכובים.

הארנק שלך הוא הכספת שלך. הוא מאחסן את נכסיך באופן מאובטח ומעניק לך **"מספר חשבון"** ייחודי (הנקרא כתובת) עבור כל סוג מטבע שאתה מחזיק.

## כיצד אני מגדיר את הארנק שלי? (שלב 1)

הגדרת הארנק שלך אורכת פחות מ-2 דקות:

- פתח את **App Store** (אייפון) או **Play Store** (אנדרואיד) בטלפון שלך
- חפש "**Trust Wallet**" (חפש את אייקון המגן הכחול)
- הורד ופתח את האפליקציה
- הקש על **"Create a new wallet"** (צור ארנק חדש)

### ⚠️ חוק הזהב

האפליקציה תראה לך **12 מילים**. זהו **המפתח הפיזי** שלך.

- **כתוב אותן על נייר**
- **אחסן את הנייר הזה במקום בטוח**
- **אם תאבד את המילים האלה, תאבד את כספך**
- **לעולם אל תשתף אותן עם אף אחד, כולל אותנו**

חשוב על 12 המילים האלה כעל מפתח האב לכספת שלך. אין כפתור "שכחתי סיסמה". זהו הפשרה עבור חשבון פרטי באמת, בשליטה עצמית.

## כיצד אני מוצא את "מספר החשבון" שלי (כתובת)? (שלב 2)

לכל נכס יש **"מספר חשבון"** ייחודי (הנקרא כתובת). אתה צריך את זה כדי לקבל כסף.

- במסך הראשי של האפליקציה, הקש על המטבע הרצוי (לדוגמה, **ביטקוין** או **USDT**)
- הקש על הכפתור הגדול **[RECEIVE]** (קבל)
- תראה קוד ארוך של אותיות ומספרים (דוגמה: 0x71C...)
- הקש על הכפתור **[COPY]** (העתק)

**טיפ המנכ"ל:** לעולם אל תקליד קוד זה ידנית. השתמש תמיד בכפתורים **[COPY]** ו-**[PASTE]**. אות שגויה אחת משמעותה שהכסף אבד לנצח.

חשוב על זה כעל כתובת דואר אלקטרוני – אם אפילו תו אחד שגוי, ההודעה (או הכסף) הולכת למקום הלא נכון, ואין דרך להחזיר אותה.

## כיצד אני מבצע החלפה ב-MRC Global Pay? (שלב 3)

כעת, כשברשותך הקוד שלך, תוכל להשתמש באתר שלנו כדי להחליף נכסים באופן מיידי.

- עבור אל [mrcglobalpay.com](/)
- **You Send:** (אתה שולח) בחר את המטבע שאתה נותן
- **You Get:** (אתה מקבל) בחר את המטבע שברצונך לקבל
- **Recipient Address:** (כתובת המקבל) החזק את האצבע בתיבה ובחר **PASTE**. לכאן אתה מכניס את הקוד שהעתקת בשלב 2
- **Start Swap:** (התחל החלפה) הקש על **[Exchange Now]** (החלף עכשיו)

### ההעברה

- אתר האינטרנט שלנו יציג לך **"Deposit Address"** (כתובת הפקדה). העתק אותה
- חזור לארנק Trust שלך, הקש על **[SEND]** (שלח), ו**הדבק** את הכתובת שלנו שם
- שלח את הסכום
- זהו זה – ההחלפה בעיצומה

## מה קורה לאחר שאני שולח את הכספים שלי? (שלב 4)

זה מה שתראה על המסך לאחר שהתחלת את ההחלפה שלך:

- **Waiting:** (ממתין) המערכת שלנו תגיד **"Waiting for Deposit"** (ממתין להפקדה)
- **Confirming:** (אימות) ברגע שתשלח את הכספים, המסך ישתנה ל-**"Confirming."** (מאמת) זוהי רק הרשת המאמתת את בטיחות העסקה (5–10 דקות)
- **Success:** (הצלחה) בתוך דקות, המטבעות החדשים שלך יופיעו אוטומטית בארנק Trust שלך

אינך צריך לעשות שום דבר אחר. התהליך אוטומטי לחלוטין. פשוט שב והמתן לאישור.

## מה אם אני חושש לאבד כסף?

זה נורמלי לחלוטין. הנה המלצתנו:

**התחל עם "החלפת בדיקה" בסך 1.00 דולר.** זה מאפשר לך לראות בדיוק איך המערכת עובדת לפני העברת סכומים גדולים יותר. MRC Global Pay תומכת בהחלפות החל מ-**0.30 דולר**, כך שאין חסם לבדיקה.

MRC Global Pay היא **עסק קנדי רשום למתן שירותי מטבע (MSB)**. העסקה שלך מעובדת דרך אותה תשתית מפוקחת המשמשת לקוחות מוסדיים.

## היכן אני יכול למצוא את הכתובת שלי אם אבדתי?

פעל לפי שלבים אלה בדיוק:

- פתח את **Trust Wallet**
- הקש על ה**מטבע** שברצונך לקבל
- הקש על **[RECEIVE]**
- הקש על **[COPY]**
- חזור אל [mrcglobalpay.com](/) ו**הדבק** אותה בשדה כתובת המקבל

אם עדיין נתקעת, שירות הקונסיירז' שלנו מבוסס בינה מלאכותית, זמין 24/7 (בתחתית המסך מימין), יכול להדריך אותך בשפה שלך.

## האם אני צריך ליצור חשבון ב-MRC Global Pay?

**לא.** ארנק Trust שלך **הוא** החשבון שלך. MRC Global Pay אינה מאחסנת את הנתונים האישיים שלך, מה שמבטיח את פרטיותך המלאה. אין רישום, אין טפסי KYC ואין תקופות המתנה.

פשוט הדבק את הכתובת שלך, בחר את המטבעות שלך ובצע החלפה. זה כל כך פשוט.

## למה העסקה שלי לוקחת זמן?

רשתות דיגיטליות מבצעות בדיקת בטיחות הנקראת **"אישור"**. זה לרוב לוקח **5–15 דקות**. הכספים שלך בטוחים ויופיעו בארנק שלך ברגע שהבדיקה תושלם.

חשוב על זה כמו העברה בנקאית שאומרת "בטיפול" – הכסף יצא מחשבון אחד ונמצא בדרכו לאחר. פשוט דרושות כמה דקות לרשת כדי לוודא שהכל תקין.

## הפניה מהירה: זרימה מלאה

- **שלב 1:** הורד את Trust Wallet ← צור ארנק ← שמור את 12 המילים שלך
- **שלב 2:** הקש על מטבע ← הקש על [RECEIVE] ← הקש על [COPY]
- **שלב 3:** עבור אל [mrcglobalpay.com](/) ← בחר מטבעות ← הדבק את הכתובת שלך ← הקש על [Exchange Now]
- **שלב 4:** העתק את כתובת ההפקדה ← עבור אל Trust Wallet ← הקש על [SEND] ← הדבק ← שלח
- **בוצע:** המתן 5–15 דקות. המטבעות החדשים שלך יופיעו אוטומטית.

---

*מדריך זה מתפרסם על ידי MRC Global Pay, עסק קנדי רשום למתן שירותי מטבע (רישום MSB: C100000015). לשאלות, השתמש בקונסיירז' הבינה המלאכותית שלנו הזמין 24/7 באתר שלנו או בקר ב[דף השאלות הנפוצות שלנו](/faq).* `,
  },
  "hi": {
    slug: "beginners-guide-digital-assets-wallet-to-swap",
    title: "डिजिटल एसेट्स के लिए निरपेक्ष शुरुआती मार्गदर्शिका: वॉलेट से स्वैप तक",
    metaTitle: "क्रिप्टो वॉलेट और स्वैप के लिए शुरुआती मार्गदर्शिका | MRC Global Pay",
    metaDescription: "डिजिटल वॉलेट कैसे सेट करें, अपना पता कैसे ढूंढें, और 5 मिनट से कम समय में क्रिप्टो कैसे स्वैप करें, यह जानें। किसी अनुभव की आवश्यकता नहीं। एक पंजीकृत कनाडाई MSB से चरण-दर-चरण मार्गदर्शिका।",
    excerpt: "पहली बार डिजिटल एसेट का उपयोग करने वालों के लिए एक पूर्ण, बिना तकनीकी शब्दों वाली व्याख्या। वॉलेट इंस्टॉल करना, अपना पता ढूंढना और MRC Global Pay पर अपना पहला स्वैप पूरा करना सीखें - सब कुछ 5 मिनट से कम समय में।",
    author: seedAuthors.danielCarter,
    publishedAt: "2026-04-12",
    updatedAt: "2026-04-12",
    readTime: "12 मिनट पढ़ने का समय",
    category: "Guides",
    tags: ["Beginner", "Wallet", "Swap", "Trust Wallet", "Onboarding", "Digital Assets"],
    content: `MRC Global Pay में आपका स्वागत है। हम एक पंजीकृत कनाडाई मनी सर्विसेज बिजनेस (MSB) हैं। यह मार्गदर्शिका आपको बताएगी कि अपने डिजिटल वॉलेट को कैसे सेट करें और 5 मिनट से कम समय में वैश्विक स्तर पर फंड कैसे ट्रांसफर करें, जिसमें किसी तकनीकी अनुभव की आवश्यकता नहीं है।

## मुझे अपने फंड रखने के लिए "डिजिटल वॉलेट" की आवश्यकता क्यों है?

डिजिटल एसेट्स रखने के लिए, आपको एक **वॉलेट** की आवश्यकता होती है। इसे एक **निजी बैंक खाते** के रूप में सोचें जो केवल आपके फोन पर मौजूद है। पारंपरिक बैंक के विपरीत, आपका पूरा नियंत्रण होता है - कोई बिचौलिए नहीं, कोई अनुमोदन नहीं, कोई देरी नहीं।

आपका वॉलेट आपका तिजोरी है। यह आपकी संपत्तियों को सुरक्षित रूप से संग्रहीत करता है और आपको आपके द्वारा रखे गए प्रत्येक प्रकार के सिक्के के लिए एक अद्वितीय **"खाता संख्या"** (जिसे पता कहा जाता है) देता है।

## मैं अपना वॉलेट कैसे सेट करूँ? (चरण 1)

अपना वॉलेट सेट करने में 2 मिनट से भी कम समय लगता है:

- अपने फोन का **App Store** (iPhone) या **Play Store** (Android) खोलें
- **"Trust Wallet"** खोजें (नीले शील्ड आइकन को देखें)
- ऐप डाउनलोड करें और खोलें
- **"Create a new wallet"** पर टैप करें

### ⚠️ सुनहरा नियम

ऐप आपको **12 शब्द** दिखाएगा। यह आपकी **भौतिक कुंजी** है।

- **इन्हें कागज़ पर लिख लें**
- **उस कागज़ को सुरक्षित जगह पर रखें**
- **यदि आप इन शब्दों को खो देते हैं, तो आप अपना पैसा खो देते हैं**
- **इन्हें कभी भी किसी के साथ साझा न करें, जिसमें हम भी शामिल हैं**

इन 12 शब्दों को अपनी तिजोरी की मास्टर कुंजी के रूप में सोचें। कोई "पासवर्ड भूल गए" बटन नहीं है। यह वास्तव में निजी, स्व-नियंत्रित खाता रखने का एक समझौता है।

## मैं अपना "खाता संख्या" (पता) कैसे ढूंढूँ? (चरण 2)

प्रत्येक संपत्ति की एक अद्वितीय **"खाता संख्या"** (जिसे पता कहा जाता है) होती है। आपको पैसे प्राप्त करने के लिए इसकी आवश्यकता होती है।

- ऐप की मुख्य स्क्रीन पर, उस सिक्के पर टैप करें जिसे आप चाहते हैं (उदा. **Bitcoin** या **USDT**)
- बड़े **[RECEIVE]** बटन पर टैप करें
- आपको अक्षरों और संख्याओं का एक लंबा कोड दिखाई देगा (उदाहरण: 0x71C...)
- **[COPY]** बटन पर टैप करें

**CEO टिप:** इस कोड को कभी भी हाथ से टाइप न करें। हमेशा **[COPY]** और **[PASTE]** बटन का उपयोग करें। एक गलत अक्षर का मतलब है कि पैसा हमेशा के लिए खो गया।

इसे एक ईमेल पते की तरह समझें — यदि एक भी अक्षर गलत है, तो संदेश (या पैसा) गलत जगह चला जाता है, और उसे वापस पाने का कोई तरीका नहीं है।

## मैं MRC Global Pay पर कैसे स्वैप करूँ? (चरण 3)

अब जब आपके पास आपका कोड है, तो आप हमारी वेबसाइट का उपयोग करके तुरंत संपत्ति का आदान-प्रदान कर सकते हैं।

- [mrcglobalpay.com](/) पर जाएं
- **You Send:** वह सिक्का चुनें जिसे आप दे रहे हैं
- **You Get:** वह सिक्का चुनें जिसे आप प्राप्त करना चाहते हैं
- **Recipient Address:** बॉक्स में अपनी उंगली रखें और **PASTE** चुनें। यह वह जगह है जहाँ आप चरण 2 में कॉपी किया गया कोड डालते हैं
- **Start Swap:** **[Exchange Now]** पर टैप करें

### स्थानांतरण

- हमारी वेबसाइट आपको एक **"Deposit Address"** दिखाएगी। इसे कॉपी करें
- अपने Trust Wallet पर वापस जाएं, **[SEND]** पर टैप करें और हमारा पता वहां **पेस्ट** करें
- राशि भेजें
- बस इतना ही – स्वैप अब प्रगति पर है

## फंड भेजने के बाद क्या होता है? (चरण 4)

अपने स्वैप को शुरू करने के बाद आपको स्क्रीन पर क्या दिखाई देगा, यह यहां बताया गया है:

- **Waiting:** हमारी प्रणाली **"Waiting for Deposit"** कहेगी
- **Confirming:** एक बार जब आप फंड भेज देते हैं, तो स्क्रीन **"Confirming"** में बदल जाएगी। यह सिर्फ नेटवर्क है जो व्यापार की सुरक्षा को सत्यापित कर रहा है (5-10 मिनट)
- **Success:** मिनटों के भीतर, आपके नए सिक्के स्वचालित रूप से आपके Trust Wallet में दिखाई देंगे

आपको कुछ और करने की आवश्यकता नहीं है। प्रक्रिया पूरी तरह से स्वचालित है। बस आराम से बैठें और पुष्टि की प्रतीक्षा करें।

## अगर मुझे पैसे खोने का डर है तो क्या होगा?

यह पूरी तरह से सामान्य है। यहाँ हमारी अनुशंसा है:

**$1.00 "टेस्ट स्वैप" से शुरू करें।** यह आपको यह देखने देता है कि बड़ी मात्रा में स्थानांतरित करने से पहले सिस्टम कैसे काम करता है। MRC Global Pay **$0.30** जितना कम स्वैप का समर्थन करता है, इसलिए परीक्षण के लिए कोई बाधा नहीं है।

MRC Global Pay एक **पंजीकृत कनाडाई मनी सर्विसेज बिजनेस (MSB)** है। आपका लेनदेन उसी विनियमित बुनियादी ढांचे के माध्यम से संसाधित होता है जिसका उपयोग संस्थागत ग्राहक करते हैं।

## अगर मैं खो जाऊं तो मैं अपना पता कहाँ ढूंढ सकता हूँ?

इन सटीक चरणों का पालन करें:

- **Trust Wallet** खोलें
- उस **Coin** पर टैप करें जिसे आप प्राप्त करना चाहते हैं
- **[RECEIVE]** पर टैप करें
- **[COPY]** पर टैप करें
- [mrcglobalpay.com](/) पर वापस आएं और इसे Recipient Address फ़ील्ड में **पेस्ट** करें

यदि आप अभी भी अटके हुए हैं, तो हमारा 24/7 AI Concierge (स्क्रीन के नीचे-दाएं) आपको आपकी भाषा में इसके माध्यम से ले जा सकता है।

## क्या मुझे MRC Global Pay पर एक खाता बनाने की आवश्यकता है?

**नहीं।** आपका Trust Wallet **ही** आपका खाता है। MRC Global Pay आपका व्यक्तिगत डेटा संग्रहीत नहीं करता है, जिससे आपकी पूर्ण गोपनीयता सुनिश्चित होती है। कोई पंजीकरण नहीं, कोई KYC फॉर्म नहीं, और कोई प्रतीक्षा अवधि नहीं।

बस अपना पता पेस्ट करें, अपने सिक्के चुनें और स्वैप करें। यह इतना आसान है।

## मेरा लेनदेन कुछ समय क्यों ले रहा है?

डिजिटल नेटवर्क एक सुरक्षा जांच करते हैं जिसे **"Confirmation"** कहा जाता है। इसमें आमतौर पर **5-15 मिनट** लगते हैं। आपके फंड सुरक्षित हैं और चेक पूरा होते ही आपके वॉलेट में दिखाई देंगे।

इसे एक बैंक हस्तांतरण की तरह सोचें जो "प्रसंस्करण" कहता है - पैसा एक खाते से निकल गया है और दूसरे खाते में जा रहा है। नेटवर्क को सब कुछ सही है यह सत्यापित करने के लिए बस कुछ मिनट लगते हैं।

## त्वरित संदर्भ: संपूर्ण प्रवाह

- **चरण 1:** Trust Wallet डाउनलोड करें → वॉलेट बनाएं → अपने 12 शब्द सहेजें
- **चरण 2:** सिक्का टैप करें → [RECEIVE] टैप करें → [COPY] टैप करें
- **चरण 3:** [mrcglobalpay.com](/) पर जाएं → सिक्के चुनें → अपना पता पेस्ट करें → [Exchange Now] टैप करें
- **चरण 4:** डिपॉजिट पता कॉपी करें → Trust Wallet पर जाएं → [SEND] टैप करें → पेस्ट करें → भेजें
- **हो गया:** 5-15 मिनट प्रतीक्षा करें। आपके नए सिक्के स्वचालित रूप से दिखाई देंगे।

---

*यह मार्गदर्शिका MRC Global Pay, एक पंजीकृत कनाडाई मनी सर्विसेज बिजनेस (MSB पंजीकरण: C100000015) द्वारा प्रकाशित की गई है। प्रश्नों के लिए, हमारी वेबसाइट पर 24/7 AI Concierge का उपयोग करें या हमारे [FAQ page](/faq) पर जाएं।*`,
  },
  "ja": {
    slug: "beginners-guide-digital-assets-wallet-to-swap",
    title: "デジタル資産の絶対的初心者ガイド：ウォレットからスワップまで",
    metaTitle: "暗号資産ウォレットとスワップ初心者ガイド | MRC Global Pay",
    metaDescription: "デジタルウォレットの設定方法、アドレスの確認方法、暗号資産のスワップ方法を5分以内に学びましょう。経験不要。カナダ登録MSBによるステップバイステップガイド。",
    excerpt: "デジタル資産を初めて利用する方への、専門用語なしの完全なウォークスルー。5分以内でウォレットのインストール方法、アドレスの確認方法、MRC Global Payでの最初のスワップの完了方法を学びます。",
    author: seedAuthors.danielCarter,
    publishedAt: "2026-04-12",
    updatedAt: "2026-04-12",
    readTime: "12分で読めます",
    category: "Guides",
    tags: ["Beginner", "Wallet", "Swap", "Trust Wallet", "Onboarding", "Digital Assets"],
    content: `MRC Global Payへようこそ。当社はカナダの登録送金サービス事業者（MSB）です。このガイドでは、技術的な経験は一切不要で、5分以内にデジタル金庫を設定し、世界中に資金を移動する方法をご案内します。

## なぜ資金を保持するために「デジタル金庫」が必要なのですか？

デジタル資産を保持するには、**ウォレット**が必要です。これは、スマートフォン上のみに存在する**プライベートな銀行口座**と考えてください。従来の銀行とは異なり、あなたは完全に管理権を持ちます――仲介者も、承認も、遅延もありません。

あなたのウォレットはあなたの金庫です。資産を安全に保管し、あなたが保有する各コインの種類ごとに固有の**「口座番号」**（アドレスと呼ばれます）を提供します。

## ウォレットはどのように設定しますか？（ステップ1）

ウォレットの設定は2分もかかりません：

- スマートフォンの**App Store**（iPhone）または**Play Store**（Android）を開きます。
- **「Trust Wallet」**を検索します（青い盾のアイコンを探してください）。
- アプリをダウンロードして開きます。
- **「新しいウォレットを作成」**をタップします。

### ⚠️ 黄金のルール

アプリには**12個の単語**が表示されます。これがあなたの**物理的な鍵**です。

- **紙に書き留めてください。**
- **その紙を安全な場所に保管してください。**
- **これらの単語を紛失すると、資金を失います。**
- **当社を含め、誰にも共有しないでください。**

これらの12個の単語は、あなたの金庫のマスターキーと考えてください。「パスワードを忘れた場合のボタン」はありません。これは、真にプライベートで自己管理された口座を持つことのトレードオフです。

## 「口座番号」（アドレス）はどのように見つけますか？（ステップ2）

すべての資産には固有の**「口座番号」**（アドレスと呼ばれます）があります。これを受け取るにはこれが必要です。

- アプリのメイン画面で、希望するコイン（例：**Bitcoin**または**USDT**）をタップします。
- 大きな**[RECEIVE]**ボタンをタップします。
- 文字と数字の長いコードが表示されます（例：0x71C...）。
- **[COPY]**ボタンをタップします。

**CEOからのヒント：**このコードを手動で入力しないでください。常に**[COPY]**と**[PASTE]**ボタンを使用してください。一文字でも間違えると、資金は永遠に失われます。

これはメールアドレスのようなものです――一文字でも間違っていると、メッセージ（またはお金）は間違った場所に送られ、元に戻す方法はありません。

## MRC Global Payでスワップするにはどうすればよいですか？（ステップ3）

コードが手に入ったので、当社のウェブサイトを使って瞬時に資産を交換できます。

- [mrcglobalpay.com](/)にアクセスします。
- **You Send：** 送信するコインを選択します。
- **You Get：** 受け取りたいコインを選択します。
- **Recipient Address：** ボックスに指を押し当てて**PASTE**を選択します。ここにステップ2でコピーしたコードを貼り付けます。
- **Start Swap：** **[Exchange Now]**をタップします。

### 送金

- 当社のウェブサイトに**「Deposit Address」**が表示されます。これをコピーします。
- Trust Walletに戻り、**[SEND]**をタップし、当社の\`アドレスをそこに**PASTE**します。
- 金額を送信します。
- これで完了です――スワップが進行中です。

## 資金を送金した後、どうなりますか？（ステップ4）

スワップを開始した後、画面には次のように表示されます。

- **Waiting：** 当社のシステムは**「Waiting for Deposit」**と表示します。
- **Confirming：** 資金を送金すると、画面は**「Confirming」**に変わります。これはネットワークが取引の安全性を確認している状態です（5～10分）。
- **Success：** 数分以内に、新しいコインが自動的にTrust Walletに表示されます。

他の操作は必要ありません。プロセスは完全に自動化されています。確認を待つだけです。

## お金を失うのが怖い場合はどうすればいいですか？

これは全く正常なことです。私たちの推奨事項はこちらです。

**1.00ドルの「テストスワップ」から始めてください。**これにより、大金を動かす前にシステムがどのように機能するかを正確に確認できます。MRC Global Payは**0.30ドル**という少額からのスワップをサポートしているため、テストに障壁はありません。

MRC Global Payは**カナダの登録送金サービス事業者（MSB）**です。あなたの取引は、機関投資家が利用するのと同じ規制されたインフラストラクチャを通じて処理されます。

## 迷ったらアドレスはどこで確認できますか？

以下の手順に正確に従ってください。

- **Trust Wallet**を開きます。
- 受け取りたい**コイン**をタップします。
- **[RECEIVE]**をタップします。
- **[COPY]**をタップします。
- [mrcglobalpay.com](/)に戻り、Recipient Addressフィールドに**PASTE**します。

それでも困っている場合は、画面右下にある24時間年中無休のAIコンシェルジュがあなたの言語で案内します。

## MRC Global Payでアカウントを作成する必要がありますか？

**いいえ。**あなたのTrust Walletがあなたのアカウントです。MRC Global Payはあなたの個人データを保存せず、あなたの完全なプライバシーを確保します。登録、KYCフォーム、待機期間はありません。

アドレスを貼り付け、コインを選択し、スワップするだけです。それほど簡単です。

## 取引に時間がかかっているのはなぜですか？

デジタルネットワークは**「確認」**と呼ばれる安全チェックを実行します。通常、これには**5～15分**かかります。あなたの資金は安全であり、チェックが完了するとすぐにウォレットに表示されます。

これは「処理中」と表示される銀行振込のようなものだと考えてください――お金は一方の口座から送金され、もう一方の口座に向かっています。すべてが正しいことをネットワークが確認するのに数分かかるだけです。

## クイックリファレンス：フロー全体

- **ステップ1：** Trust Walletをダウンロード → ウォレットを作成 → 12個の単語を保存
- **ステップ2：** コインをタップ → [RECEIVE]をタップ → [COPY]をタップ
- **ステップ3：** [mrcglobalpay.com](/)にアクセス → コインを選択 → アドレスをPASTE → [Exchange Now]をタップ
- **ステップ4：** 預金アドレスをコピー → Trust Walletに移動 → [SEND]をタップ → PASTE → 送金
- **完了：** 5～15分待つと、新しいコインが自動的に表示されます。

---

*このガイドは、カナダの登録送金サービス事業者（MSB登録：C100000015）であるMRC Global Payによって公開されています。ご質問がある場合は、当社のウェブサイトの24時間年中無休AIコンシェルジュを使用するか、[FAQページ](/faq)をご覧ください。*`,
  },
  "pt": {
    slug: "beginners-guide-digital-assets-wallet-to-swap",
    title: "O Guia Absoluto para Iniciantes em Ativos Digitais: Da Carteira ao Swap",
    metaTitle: "Guia para Iniciantes em Carteiras e Swaps Cripto | MRC Global Pay",
    metaDescription: "Aprenda a configurar uma carteira digital, encontrar seu endereço e trocar cripto em menos de 5 minutos. Não é necessária experiência. Guia passo a passo de um MSB canadense registrado.",
    excerpt: "Um passo a passo completo, sem jargões, para usuários de ativos digitais iniciantes. Aprenda a instalar uma carteira, encontrar seu endereço e completar seu primeiro swap na MRC Global Pay — tudo em menos de 5 minutos.",
    author: seedAuthors.danielCarter,
    publishedAt: "2026-04-12",
    updatedAt: "2026-04-12",
    readTime: "12 min de leitura",
    category: "Guides",
    tags: ["Beginner", "Wallet", "Swap", "Trust Wallet", "Onboarding", "Digital Assets"],
    content: `Bem-vindo à MRC Global Pay. Somos uma Empresa de Serviços Monetários (MSB) canadense registrada. Este guia mostrará como configurar sua "fortaleza" digital e movimentar fundos globalmente em menos de 5 minutos, sem a necessidade de experiência técnica.

## Por que preciso de uma "Fortaleza Digital" para guardar meus fundos?

Para possuir ativos digitais, você precisa de uma **Carteira**. Pense nela como uma **conta bancária privada** que existe apenas no seu telefone. Ao contrário de um banco tradicional, você tem controle total — sem intermediários, sem aprovações, sem atrasos.

Sua carteira é sua "fortaleza". Ela armazena seus ativos com segurança e lhe dá um **"Número de Conta"** exclusivo (chamado de Endereço) para cada tipo de moeda que você possui.

## Como configuro minha carteira? (Passo 1)

Configurar sua carteira leva menos de 2 minutos:

- Abra a **App Store** (iPhone) ou **Play Store** (Android) do seu telefone
- Procure por **"Trust Wallet"** (Procure o ícone do Escudo Azul)
- Baixe e abra o aplicativo
- Toque em **"Criar uma nova carteira"**

### ⚠️ A REGRA DE OURO

O aplicativo mostrará **12 palavras**. Esta é sua **Chave Física**.

- **Anote-as em um papel**
- **Guarde esse papel em um lugar seguro**
- **Se você perder essas palavras, perderá seu dinheiro**
- **Nunca as compartilhe com ninguém, incluindo nós**

Pense nessas 12 palavras como a chave mestra para sua "fortaleza". Não há botão de "esqueci a senha". Esta é a contrapartida de ter uma conta verdadeiramente privada e autocontrolada.

## Como encontro meu "Número de Conta" (Endereço)? (Passo 2)

Cada ativo tem um **"Número de Conta"** exclusivo (chamado de Endereço). Você precisa disso para receber dinheiro.

- Na tela principal do aplicativo, toque na moeda que deseja (por exemplo, **Bitcoin** ou **USDT**)
- Toque no grande botão **[RECEIVE]** (RECEBER)
- Você verá um código longo de letras e números (Exemplo: 0x71C...)
- Toque no botão **[COPY]** (COPIAR)

**Dica do CEO:** Nunca digite este código manualmente. Sempre use os botões **[COPY]** e **[PASTE]** (COLAR). Uma letra errada significa que o dinheiro está perdido para sempre.

Pense nisso como um endereço de e-mail — se até mesmo um caractere estiver errado, a mensagem (ou o dinheiro) vai para o lugar errado, e não há como recuperá-lo.

## Como faço um swap na MRC Global Pay? (Passo 3)

Agora que você tem seu código, pode usar nosso site para trocar ativos instantaneamente.

- Acesse [mrcglobalpay.com](/)
- **Você Envia:** Escolha a moeda que você está dando
- **Você Recebe:** Escolha a moeda que você deseja receber
- **Endereço do Destinatário:** Segure o dedo na caixa e selecione **PASTE** (COLAR). É aqui que você insere o código que copiou no Passo 2
- **Iniciar Swap:** Toque em **[Exchange Now]** (Trocar Agora)

### A Transferência

- Nosso site exibirá um **"Deposit Address"** (Endereço de Depósito). Copie-o
- Volte para sua Trust Wallet, toque em **[SEND]** (ENVIAR) e **Cole** nosso endereço lá
- Envie o valor
- Pronto — o swap está em andamento

## O que acontece depois de eu enviar meus fundos? (Passo 4)

Isto é o que você verá na tela após iniciar seu swap:

- **Waiting (Aguardando):** Nosso sistema dirá **"Waiting for Deposit"** (Aguardando Depósito)
- **Confirming (Confirmando):** Assim que você enviar os fundos, a tela mudará para **"Confirming."** (Confirmando.) Isso é apenas a rede verificando a segurança da transação (5–10 minutos)
- **Success (Sucesso):** Em minutos, suas novas moedas aparecerão automaticamente em sua Trust Wallet

Você não precisa fazer mais nada. O processo é totalmente automatizado. Apenas sente-se e aguarde a confirmação.

## E se eu tiver medo de perder dinheiro?

Isso é completamente normal. Aqui está nossa recomendação:

**Comece com um "swap de teste" de $1,00.** Isso permite que você veja exatamente como o sistema funciona antes de mover quantias maiores. A MRC Global Pay suporta swaps a partir de apenas **$0,30**, então não há barreiras para testar.

MRC Global Pay é uma **Empresa de Serviços Monetários (MSB) canadense registrada**. Sua transação é processada através da mesma infraestrutura regulamentada usada por clientes institucionais.

## Onde posso encontrar meu endereço se estiver perdido?

Siga estes passos exatos:

- Abra a **Trust Wallet**
- Toque na **Moeda** que deseja receber
- Toque em **[RECEIVE]** (RECEBER)
- Toque em **[COPY]** (COPIAR)
- Volte para [mrcglobalpay.com](/) e **COLE**-o no campo Endereço do Destinatário

Se você ainda estiver preso, nosso Concierge de IA 24/7 (canto inferior direito da tela) pode guiá-lo em seu idioma.

## Preciso criar uma conta na MRC Global Pay?

**Não.** Sua Trust Wallet **é** sua conta. A MRC Global Pay não armazena seus dados pessoais, garantindo sua total privacidade. Não há registro, formulários KYC e períodos de espera.

Basta colar seu endereço, escolher suas moedas e fazer o swap. É simples assim.

## Por que minha transação está demorando?

As redes digitais realizam uma verificação de segurança chamada **"Confirmação."** Isso geralmente leva **5–15 minutos**. Seus fundos estão seguros e aparecerão em sua carteira assim que a verificação for concluída.

Pense nisso como uma transferência bancária que diz "processando" — o dinheiro saiu de uma conta e está a caminho da outra. Apenas precisa de alguns minutos para a rede verificar que tudo está correto.

## Referência Rápida: O Fluxo Completo

- **Passo 1:** Baixar Trust Wallet → Criar Carteira → Salvar suas 12 palavras
- **Passo 2:** Tocar em Moeda → Tocar em [RECEIVE] → Tocar em [COPY]
- **Passo 3:** Ir para [mrcglobalpay.com](/) → Escolher moedas → COLAR seu endereço → Tocar em [Exchange Now]
- **Passo 4:** Copiar o Endereço de Depósito → Ir para Trust Wallet → Tocar em [SEND] → COLAR → Enviar
- **Feito:** Aguardar 5–15 minutos. Suas novas moedas aparecem automaticamente.

---

*Este guia é publicado pela MRC Global Pay, uma Empresa de Serviços Monetários (MSB) canadense registrada (Registro MSB: C100000015). Para perguntas, use o Concierge de IA 24/7 em nosso site ou visite nossa [página de FAQ](/faq).* `,
  },
  "tr": {
    slug: "beginners-guide-digital-assets-wallet-to-swap",
    title: "Dijital Varlıklara Yeni Başlayanlar İçin Kapsamlı Rehber: Cüzdan Kurulumundan Takasa",
    metaTitle: "Kripto Cüzdanları ve Takas Rehberi | MRC Global Pay",
    metaDescription: "Dijital cüzdanınızı nasıl kuracağınızı, adresinizi nasıl bulacağınızı ve 5 dakikadan kısa sürede kripto takası yapmayı öğrenin. Deneyim gerekmez. Kayıtlı bir Kanada MSB'den adım adım rehber.",
    excerpt: "Dijital varlıkları ilk kez kullananlar için eksiksiz, jargon içermeyen bir rehber. Bir cüzdanı nasıl kuracağınızı, adresinizi nasıl bulacağınızı ve MRC Global Pay'de ilk takasınızı nasıl tamamlayacağınızı öğrenin — hepsi 5 dakikadan kısa sürede.",
    author: seedAuthors.danielCarter,
    publishedAt: "2026-04-12",
    updatedAt: "2026-04-12",
    readTime: "12 dk okuma süresi",
    category: "Guides",
    tags: ["Beginner", "Wallet", "Swap", "Trust Wallet", "Onboarding", "Digital Assets"],
    content: `MRC Global Pay'a hoş geldiniz. Biz, Kayıtlı bir Kanada Para Hizmetleri İşletmesiyiz (MSB). Bu rehber, dijital kasanızı nasıl kuracağınızı ve 5 dakikadan kısa sürede, teknik deneyim gerektirmeden fonları küresel olarak nasıl transfer edeceğinizi gösterecektir.

## Fonlarımı tutmak için neden bir "Dijital Kasaya" ihtiyacım var?

Dijital varlıkları tutmak için bir **Cüzdan**'a ihtiyacınız var. Bunu, yalnızca telefonunuzda var olan **özel bir banka hesabı** olarak düşünün. Geleneksel bir bankanın aksine, tam kontrol sizdedir — aracı yok, onay yok, gecikme yok.

Cüzdanınız sizin kasanızdır. Varlıklarınızı güvenli bir şekilde saklar ve elinizdeki her tür para birimi için size benzersiz bir **"Hesap Numarası"** (Adres denir) verir.

## Cüzdanımı nasıl kurarım? (Adım 1)

Cüzdanınızı kurmak 2 dakikadan az sürer:

- Telefonunuzun **App Store**'unu (iPhone) veya **Play Store**'unu (Android) açın
- **"Trust Wallet"** araması yapın (Mavi Kalkan simgesini arayın)
- Uygulamayı indirin ve açın
- **"Yeni bir cüzdan oluştur"** seçeneğine dokunun

### ⚠️ ALTIN KURAL

Uygulama size **12 kelime** gösterecektir. Bu sizin **Fiziksel Anahtarınız**dır.

- **Bunları bir kağıda yazın**
- **Bu kağıdı güvenli bir yere saklayın**
- **Bu kelimeleri kaybederseniz, paranızı kaybedersiniz**
- **Biz dahil kimseyle asla paylaşmayın**

Bu 12 kelimeyi kasanızın ana anahtarı olarak düşünün. "Şifremi unuttum" düğmesi yoktur. Bu, gerçekten özel, kişisel kontrolün olduğu bir hesaba sahip olmanın bedelidir.

## "Hesap Numaramı" (Adresimi) nasıl bulurum? (Adım 2)

Her varlığın benzersiz bir **"Hesap Numarası"** (Adres denir) vardır. Para almak için buna ihtiyacınız vardır.

- Uygulamanın ana ekranında, istediğiniz para birimine dokunun (örn. **Bitcoin** veya **USDT**)
- Büyük **[RECEIVE]** düğmesine dokunun
- Uzun bir harf ve sayı kodunu göreceksiniz (Örnek: 0x71C...)
- **[COPY]** düğmesine dokunun

**CEO İpuçları:** Bu kodu asla elle yazmayın. Her zaman **[COPY]** ve **[PASTE]** düğmelerini kullanın. Bir yanlış harf, paranın sonsuza dek kaybolması anlamına gelir.

Bunu bir e-posta adresi gibi düşünün — tek bir karakter bile yanlışsa, mesaj (veya para) yanlış yere gider ve geri almanın hiçbir yolu yoktur.

## MRC Global Pay'de nasıl takas yaparım? (Adım 3)

Artık kodunuz olduğuna göre, web sitemizi anında varlık değişimi için kullanabilirsiniz.

- [mrcglobalpay.com](/) adresine gidin
- **Siz Gönderin:** Vereceğiniz para birimini seçin
- **Siz Alın:** Almak istediğiniz para birimini seçin
- **Alıcı Adresi:** Kutuda parmağınızı basılı tutun ve **PASTE**'i seçin. Buraya Adım 2'de kopyaladığınız kodu yapıştırın
- **Takasa Başla:** **[Exchange Now]** seçeneğine dokunun

### Transfer

- Web sitemiz size bir **"Yatırma Adresi"** gösterecektir. Kopyalayın
- Trust Wallet'ınıza geri dönün, **[SEND]**'e dokunun ve adresimizi oraya **Yapıştırın**
- Miktarı gönderin
- İşte bu kadar — takas şimdi devam ediyor

## Fonlarımı gönderdikten sonra ne olur? (Adım 4)

Takasınızı başlattıktan sonra ekranda görecekleriniz şunlardır:

- **Bekleniyor:** Sistemimiz **"Para yatırma bekleniyor"** diyecektir
- **Onaylanıyor:** Fonları gönderdiğinizde, ekran **"Onaylanıyor"** olarak değişecektir. Bu sadece ağın ticaretin güvenliğini doğrulamasıdır (5–10 dakika)
- **Başarı:** Dakikalar içinde yeni coinleriniz otomatik olarak Trust Wallet'ınızda görünecektir

Başka hiçbir şey yapmanıza gerek yok. Süreç tamamen otomatiktir. Sadece arkanıza yaslanın ve onayı bekleyin.

## Ya para kaybetmekten korkuyorsam?

Bu tamamen normaldir. İşte tavsiyemiz:

**1,00 $'lık bir "test takası" ile başlayın.** Bu, daha büyük miktarları aktarmadan önce sistemin tam olarak nasıl çalıştığını görmenizi sağlar. MRC Global Pay, **0,30 $** gibi düşük miktarlardan başlayan takasları destekler, bu nedenle test etmenin önünde hiçbir engel yoktur.

MRC Global Pay **Kayıtlı bir Kanada Para Hizmetleri İşletmesidir (MSB)**. İşleminiz, kurumsal müşteriler tarafından kullanılan aynı düzenlenmiş altyapı üzerinden işlenir.

## Kaybolursam adresimi nerede bulabilirim?

Tam olarak şu adımları izleyin:

- **Trust Wallet**'ı açın
- Almak istediğiniz **Coin**'e dokunun
- **[RECEIVE]**'e dokunun
- **[COPY]**'e dokunun
- [mrcglobalpay.com](/) adresine geri dönün ve Alıcı Adresi alanına **YAPIŞTIRIN**

Hala takılırsanız, 7/24 AI Konsiyerjemiz (ekranın sağ alt köşesi) size kendi dilinizde yol gösterebilir.

## MRC Global Pay'de bir hesap oluşturmam gerekiyor mu?

**Hayır.** Trust Cüzdanınız **sizin** hesabınızdır. MRC Global Pay kişisel verilerinizi saklamaz, bu da toplam gizliliğinizi sağlar. Kayıt yok, KYC formları yok ve bekleme süreleri yok.

Sadece adresinizi yapıştırın, coinlerinizi seçin ve takas yapın. Bu kadar basit.

## İşlemim neden bu kadar uzun sürüyor?

Dijital ağlar **"Onaylama"** adı verilen bir güvenlik kontrolü yapar. Bu genellikle **5–15 dakika** sürer. Fonlarınız güvendedir ve kontrol tamamlandığında cüzdanınızda görünecektir.

Bunu, "işleniyor" diyen bir banka havalesi gibi düşünün — para bir hesaptan çıktı ve diğerine doğru yolda. Ağın her şeyin doğru olduğunu doğrulaması için sadece birkaç dakika gerekiyor.

## Hızlı Referans: Tam Akış

- **Adım 1:** Trust Wallet'ı indirin → Cüzdan Oluşturun → 12 kelimenizi kaydedin
- **Adım 2:** Coine dokunun → [RECEIVE] öğesine dokunun → [COPY] öğesine dokunun
- **Adım 3:** [mrcglobalpay.com](/) adresine gidin → Coinleri seçin → Adresinizi YAPIŞTIRIN → [Exchange Now] öğesine dokunun
- **Adım 4:** Yatırma Adresini kopyalayın → Trust Wallet'a gidin → [SEND] öğesine dokunun → YAPIŞTIRIN → Gönderin
- **Bitti:** 5–15 dakika bekleyin. Yeni coinleriniz otomatik olarak görünür.

---

*Bu rehber, Kayıtlı bir Kanada Para Hizmetleri İşletmesi (MSB Kaydı: C100000015) olan MRC Global Pay tarafından yayınlanmıştır. Sorularınız için web sitemizdeki 7/24 AI Concierge'yi kullanın veya [SSS sayfamızı](/faq) ziyaret edin.*`,
  },
  "uk": {
    slug: "beginners-guide-digital-assets-wallet-to-swap",
    title: "Посібник із цифрових активів для початківців: від гаманця до обміну",
    metaTitle: "Для початківців: криптогаманці та обміни | MRC Global Pay",
    metaDescription: "Дізнайтеся, як налаштувати цифровий гаманець, знайти свою адресу та обміняти криптоактиви менш ніж за 5 хвилин. Досвід не потрібен. Покроковий посібник від зареєстрованого канадського MSB.",
    excerpt: "Повний посібник без жаргону для користувачів, які вперше працюють із цифровими активами. Дізнайтеся, як встановити гаманець, знайти свою адресу та здійснити свій перший обмін на MRC Global Pay — усе менш ніж за 5 хвилин.",
    author: seedAuthors.danielCarter,
    publishedAt: "2026-04-12",
    updatedAt: "2026-04-12",
    readTime: "12 хв читання",
    category: "Guides",
    tags: ["Beginner", "Wallet", "Swap", "Trust Wallet", "Onboarding", "Digital Assets"],
    content: `Ласкаво просимо до MRC Global Pay. Ми є зареєстрованим канадським бізнесом із грошових послуг (MSB). Цей посібник покаже вам, як налаштувати своє цифрове сховище та переміщувати кошти по всьому світу менш ніж за 5 хвилин, без потреби в технічному досвіді.

## Навіщо мені потрібне «Цифрове сховище» для зберігання моїх коштів?

Щоб зберігати цифрові активи, вам потрібен **Гаманець**. Уявіть це як **приватний банківський рахунок**, який існує лише на вашому телефоні. На відміну від традиційного банку, ви маєте повний контроль — без посередників, без погоджень, без затримок.

Ваш гаманець — це ваше сховище. Він безпечно зберігає ваші активи та надає вам унікальний **«Номер рахунку»** (називається Адресою) для кожного типу монети, яку ви зберігаєте.

## Як налаштувати гаманець? (Крок 1)

Налаштування гаманця займає менше 2 хвилин:

- Відкрийте **App Store** (iPhone) або **Play Store** (Android) на своєму телефоні
- Знайдіть **«Trust Wallet»** (шукайте синю іконку щита)
- Завантажте та відкрийте додаток
- Натисніть **«Створити новий гаманець»**

### ⚠️ ЗОЛОТЕ ПРАВИЛО

Додаток покаже вам **12 слів**. Це ваш **Фізичний ключ**.

- **Запишіть їх на папері**
- **Зберігайте цей папір у безпечному місці**
- **Якщо ви втратите ці слова, ви втратите свої гроші**
- **Ніколи не діліться ними ні з ким, включаючи нас**

Уявіть ці 12 слів як головний ключ до вашого сховища. Немає кнопки «забули пароль». Це компроміс для того, щоб мати справді приватний, самоконтрольований рахунок.

## Як знайти свій «Номер рахунку» (Адресу)? (Крок 2)

Кожен актив має унікальний **«Номер рахунку»** (називається Адресою). Він вам потрібен для отримання грошей.

- На головному екрані програми торкніться монети, яку ви хочете (наприклад, **Bitcoin** або **USDT**)
- Натисніть велику кнопку **[RECEIVE]**
- Ви побачите довгий код з літер та цифр (Приклад: 0x71C...)
- Натисніть кнопку **[COPY]**

**Порада генерального директора:** Ніколи не вводьте цей код вручну. Завжди використовуйте кнопки **[COPY]** та **[PASTE]**. Одна неправильна літера означає, що гроші втрачені назавжди.

Подумайте про це як про адресу електронної пошти — якщо хоч один символ неправильний, повідомлення (або гроші) надходять не туди, і немає можливості їх повернути.

## Як обміняти на MRC Global Pay? (Крок 3)

Тепер, коли у вас є ваш код, ви можете використовувати наш вебсайт для миттєвого обміну активами.

- Перейдіть на [mrcglobalpay.com](/)
- **Ви надсилаєте:** Виберіть монету, яку ви віддаєте
- **Ви отримаєте:** Виберіть монету, яку ви хочете отримати
- **Адреса отримувача:** Утримуйте палець у вікні та виберіть **PASTE**. Сюди ви вставляєте код, скопійований на Кроці 2
- **Почати обмін:** Натисніть **[Exchange Now]**

### Переказ

- Наш вебсайт покаже вам **«Адресу депозиту».** Скопіюйте її
- Поверніться до свого Trust Wallet, натисніть **[SEND]** і **вставте** нашу адресу туди
- Надішліть суму
- Ось і все — обмін триває

## Що відбувається після того, як я надсилаю свої кошти? (Крок 4)

Ось що ви побачите на екрані після ініціювання обміну:

- **Очікування:** Наша система скаже **«Waiting for Deposit»** (Очікування депозиту)
- **Підтвердження:** Як тільки ви надішлете кошти, екран зміниться на **«Confirming»** (Підтвердження). Це просто мережа перевіряє безпеку операції (5–10 хвилин)
- **Успіх:** Протягом кількох хвилин ваші нові монети автоматично з'являться у вашому Trust Wallet

Вам більше нічого не потрібно робити. Процес повністю автоматизований. Просто розслабтеся і дочекайтеся підтвердження.

## Що робити, якщо я боюся втратити гроші?

Це абсолютно нормально. Ось наша рекомендація:

**Почніть з «тестового обміну» на $1.00.** Це дозволить вам побачити, як працює система, перш ніж переводити більші суми. MRC Global Pay підтримує обміни від **$0.30**, тому немає перешкод для тестування.

MRC Global Pay є **Зареєстрованим канадським бізнесом з грошових послуг (MSB)**. Ваша транзакція обробляється через ту ж регульовану інфраструктуру, що використовується інституційними клієнтами.

## Де я можу знайти свою адресу, якщо я заблукав?

Дотримуйтесь цих точних кроків:

- Відкрийте **Trust Wallet**
- Торкніться **Монети**, яку ви хочете отримати
- Торкніться **[RECEIVE]**
- Торкніться **[COPY]**
- Поверніться на [mrcglobalpay.com](/) і **ВСТАВТЕ** її в поле Адреса отримувача

Якщо ви все ще застрягли, наш цілодобовий AI Консьєрж (внизу праворуч на екрані) може провести вас через це вашою мовою.

## Чи потрібно мені створювати обліковий запис на MRC Global Pay?

**Ні.** Ваш Trust Wallet **є** вашим обліковим записом. MRC Global Pay не зберігає ваші особисті дані, забезпечуючи вашу повну конфіденційність. Немає реєстрації, форм KYC і періодів очікування.

Просто вставте свою адресу, виберіть свої монети та обміняйте. Це так просто.

## Чому моя транзакція займає деякий час?

Цифрові мережі виконують перевірку безпеки, яка називається **«Підтвердження»**. Зазвичай це займає **5–15 хвилин**. Ваші кошти в безпеці і з'являться у вашому гаманці, як тільки перевірка буде завершена.

Уявіть це як банківський переказ, який говорить «обробляється» — гроші покинули один рахунок і прямують до іншого. Просто потрібні кілька хвилин, щоб мережа перевірила, чи все правильно.

## Швидкий довідник: Повний потік

- **Крок 1:** Завантажте Trust Wallet → Створіть гаманець → Збережіть свої 12 слів
- **Крок 2:** Торкніться Монети → Торкніться [RECEIVE] → Торкніться [COPY]
- **Крок 3:** Перейдіть на [mrcglobalpay.com](/) → Виберіть монети → ВСТАВТЕ свою адресу → Торкніться [Exchange Now]
- **Крок 4:** Скопіюйте Адресу депозиту → Перейдіть у Trust Wallet → Торкніться [SEND] → ВСТАВТЕ → Надішліть
- **Готово:** Зачекайте 5–15 хвилин. Ваші нові монети з'являться автоматично.

---

*Цей посібник опубліковано MRC Global Pay, зареєстрованим канадським бізнесом з грошових послуг (реєстрація MSB: C100000015). З питань використовуйте цілодобовий AI Консьєрж на нашому вебсайті або відвідайте нашу [сторінку поширених запитань](/faq).*`,
  },
  "vi": {
    slug: "beginners-guide-digital-assets-wallet-to-swap",
    title: "Hướng dẫn Tuyệt đối dành cho Người mới bắt đầu về Tài sản kỹ thuật số: Từ Ví đến Giao dịch hoán đổi",
    metaTitle: "Hướng dẫn cho người mới bắt đầu về Ví & Giao dịch tiền mã hóa | MRC Global Pay",
    metaDescription: "Tìm hiểu cách thiết lập ví kỹ thuật số, tìm địa chỉ của bạn và hoán đổi tiền mã hóa trong vòng chưa đầy 5 phút. Không cần kinh nghiệm. Hướng dẫn từng bước từ một MSB đã đăng ký tại Canada.",
    excerpt: "Hướng dẫn đầy đủ, không thuật ngữ dành cho những người dùng tài sản kỹ thuật số lần đầu. Tìm hiểu cách cài đặt ví, tìm địa chỉ của bạn và hoàn tất giao dịch hoán đổi đầu tiên của bạn trên MRC Global Pay – tất cả chỉ trong vòng chưa đầy 5 phút.",
    author: seedAuthors.danielCarter,
    publishedAt: "2026-04-12",
    updatedAt: "2026-04-12",
    readTime: "12 phút đọc",
    category: "Guides",
    tags: ["Beginner", "Wallet", "Swap", "Trust Wallet", "Onboarding", "Digital Assets"],
    content: `Chào mừng bạn đến với MRC Global Pay. Chúng tôi là một Doanh nghiệp dịch vụ tiền tệ (MSB) đã đăng ký tại Canada. Hướng dẫn này sẽ chỉ cho bạn cách thiết lập kho tiền kỹ thuật số và chuyển tiền toàn cầu trong vòng chưa đầy 5 phút mà không yêu cầu kinh nghiệm kỹ thuật.

## Tại sao tôi cần một "Kho tiền kỹ thuật số" để giữ tiền của mình?

Để giữ tài sản kỹ thuật số, bạn cần một **Ví**. Hãy coi đây là một **tài khoản ngân hàng cá nhân** chỉ tồn tại trên điện thoại của bạn. Không giống như ngân hàng truyền thống, bạn hoàn toàn kiểm soát – không có trung gian, không cần phê duyệt, không chậm trễ.

Ví của bạn là kho tiền của bạn. Nó lưu trữ tài sản của bạn một cách an toàn và cung cấp cho bạn một **"Số tài khoản"** (được gọi là Địa chỉ) duy nhất cho mỗi loại tiền bạn nắm giữ.

## Làm cách nào để thiết lập ví của tôi? (Bước 1)

Thiết lập ví của bạn mất chưa đầy 2 phút:

- Mở **App Store** (iPhone) hoặc **Play Store** (Android) trên điện thoại của bạn
- Tìm kiếm **"Trust Wallet"** (Tìm biểu tượng Khiên màu xanh)
- Tải xuống và mở ứng dụng
- Nhấn vào **"Tạo ví mới"**

### ⚠️ QUY TẮC VÀNG

Ứng dụng sẽ hiển thị cho bạn **12 từ**. Đây là **Khóa vật lý** của bạn.

- **Ghi chúng ra giấy**
- **Cất giữ tờ giấy đó ở nơi an toàn**
- **Nếu bạn làm mất những từ này, bạn sẽ mất tiền**
- **Không bao giờ chia sẻ chúng với bất kỳ ai, kể cả chúng tôi**

Hãy coi 12 từ này là chìa khóa chính để vào kho tiền của bạn. Không có nút "quên mật khẩu". Đây là sự đánh đổi để có một tài khoản thực sự riêng tư, tự kiểm soát.

## Làm cách nào để tìm "Số tài khoản" (Địa chỉ) của tôi? (Bước 2)

Mỗi tài sản có một **"Số tài khoản"** (được gọi là Địa chỉ) duy nhất. Bạn cần cái này để nhận tiền.

- Trên màn hình chính của ứng dụng, chạm vào đồng tiền bạn muốn (ví dụ: **Bitcoin** hoặc **USDT**)
- Chạm vào nút **[RECEIVE]** lớn
- Bạn sẽ thấy một mã dài gồm các chữ cái và số (Ví dụ: 0x71C...)
- Chạm vào nút **[COPY]**

**Mẹo của CEO:** Không bao giờ nhập mã này bằng tay. Luôn sử dụng các nút **[COPY]** và **[PASTE]**. Một chữ cái sai nghĩa là tiền bị mất vĩnh viễn.

Hãy nghĩ về điều này giống như một địa chỉ email — nếu có dù chỉ một ký tự sai, tin nhắn (hoặc tiền) sẽ đến nhầm chỗ và không có cách nào để lấy lại.

## Làm cách nào để hoán đổi trên MRC Global Pay? (Bước 3)

Bây giờ bạn đã có mã của mình, bạn có thể sử dụng trang web của chúng tôi để hoán đổi tài sản ngay lập tức.

- Truy cập [mrcglobalpay.com](/) 
- **Bạn gửi:** Chọn đồng tiền bạn đang gửi
- **Bạn nhận:** Chọn đồng tiền bạn muốn nhận
- **Địa chỉ người nhận:** Giữ ngón tay của bạn trong ô và chọn **PASTE**. Đây là nơi bạn đặt mã bạn đã sao chép ở Bước 2
- **Bắt đầu hoán đổi:** Chạm vào **[Exchange Now]**

### Chuyển khoản

- Trang web của chúng tôi sẽ hiển thị cho bạn một **"Địa chỉ gửi tiền."** Sao chép nó
- Quay lại Trust Wallet của bạn, chạm vào **[SEND]** và **Dán** địa chỉ của chúng tôi vào đó
- Gửi số tiền
- Vậy là xong — giao dịch hoán đổi đang được tiến hành

## Điều gì xảy ra sau khi tôi gửi tiền? (Bước 4)

Đây là những gì bạn sẽ thấy trên màn hình sau khi bắt đầu giao dịch hoán đổi của mình:

- **Đang chờ:** Hệ thống của chúng tôi sẽ hiển thị **"Waiting for Deposit"**
- **Đang xác nhận:** Sau khi bạn gửi tiền, màn hình sẽ chuyển sang **"Confirming."** Đây chỉ là mạng lưới xác minh tính an toàn của giao dịch (5-10 phút)
- **Thành công:** Trong vòng vài phút, các đồng tiền mới của bạn sẽ tự động xuất hiện trong Trust Wallet của bạn

Bạn không cần phải làm bất cứ điều gì khác. Quy trình được tự động hoàn toàn. Chỉ cần ngồi lại và chờ xác nhận.

## Điều gì xảy ra nếu tôi sợ mất tiền?

Điều này hoàn toàn bình thường. Đây là khuyến nghị của chúng tôi:

**Bắt đầu với một "giao dịch hoán đổi thử nghiệm" $1.00.** Điều này cho phép bạn xem chính xác cách hệ thống hoạt động trước khi chuyển số tiền lớn hơn. MRC Global Pay hỗ trợ các giao dịch hoán đổi từ mức thấp nhất là **$0.30**, vì vậy không có rào cản nào để thử nghiệm.

MRC Global Pay là một **Doanh nghiệp dịch vụ tiền tệ (MSB) đã đăng ký tại Canada**. Giao dịch của bạn được xử lý thông qua cùng một cơ sở hạ tầng được quản lý được sử dụng bởi các khách hàng tổ chức.

## Tôi có thể tìm địa chỉ của mình ở đâu nếu tôi bị lạc?

Làm theo các bước chính xác sau:

- Mở **Trust Wallet**
- Chạm vào **Coin** bạn muốn nhận
- Chạm vào **[RECEIVE]**
- Chạm vào **[COPY]**
- Quay lại [mrcglobalpay.com](/) và **DÁN** nó vào trường Địa chỉ người nhận

Nếu bạn vẫn gặp khó khăn, Trợ lý AI 24/7 của chúng tôi (góc dưới bên phải màn hình) có thể hướng dẫn bạn bằng ngôn ngữ của bạn.

## Tôi có cần tạo tài khoản trên MRC Global Pay không?

**Không.** Trust Wallet của bạn **chính là** tài khoản của bạn. MRC Global Pay không lưu trữ dữ liệu cá nhân của bạn, đảm bảo quyền riêng tư hoàn toàn của bạn. Không có đăng ký, không có biểu mẫu KYC và không có thời gian chờ đợi.

Chỉ cần dán địa chỉ của bạn, chọn đồng tiền của bạn và hoán đổi. Thật đơn giản.

## Tại sao giao dịch của tôi mất một thời gian?

Các mạng kỹ thuật số thực hiện kiểm tra an toàn được gọi là **"Xác nhận."** Điều này thường mất **5-15 phút**. Tiền của bạn an toàn và sẽ xuất hiện trong ví của bạn ngay sau khi kiểm tra hoàn tất.

Hãy nghĩ về nó giống như một giao dịch ngân hàng ghi "đang xử lý" — tiền đã rời khỏi một tài khoản và đang trên đường đến tài khoản kia. Nó chỉ cần vài phút để mạng lưới xác minh mọi thứ đều đúng.

## Tham khảo nhanh: Quy trình hoàn chỉnh

- **Bước 1:** Tải xuống Trust Wallet → Tạo ví → Lưu 12 từ của bạn
- **Bước 2:** Chạm vào Coin → Chạm vào [RECEIVE] → Chạm vào [COPY]
- **Bước 3:** Truy cập [mrcglobalpay.com](/) → Chọn đồng tiền → DÁN địa chỉ của bạn → Chạm vào [Exchange Now]
- **Bước 4:** Sao chép Địa chỉ gửi tiền → Truy cập Trust Wallet → Chạm vào [SEND] → DÁN → Gửi
- **Hoàn tất:** Chờ 5-15 phút. Các đồng tiền mới của bạn sẽ tự động xuất hiện.

---

*Hướng dẫn này được xuất bản bởi MRC Global Pay, một Doanh nghiệp Dịch vụ Tiền tệ (MSB Registration: C100000015) đã đăng ký tại Canada. Mọi thắc mắc, vui lòng sử dụng Trợ lý AI 24/7 trên trang web của chúng tôi hoặc truy cập [trang Câu hỏi thường gặp](/faq) của chúng tôi.*`,
  },
  "ur": {
    slug: "beginners-guide-digital-assets-wallet-to-swap",
    title: "ڈیجیٹل اثاثہ جات کے لیے مکمل ابتدائی گائیڈ: والیٹ سے سوئیپ تک",
    metaTitle: "ڈیجیٹل اثاثہ جات: والیٹ سے سوئیپ تک کی مکمل گائیڈ",
    metaDescription: "MRC Global Pay کے ساتھ ڈیجیٹل اثاثہ جات کی دنیا میں قدم رکھیں۔ اپنی Wallet سیٹ کریں، فنڈز کو محفوظ طریقے سے منتقل کریں، اور عالمی سطح پر مالی آزادی کا تجربہ کریں۔",
    excerpt: "MRC Global Pay میں خوش آمدید۔ یہ گائیڈ آپ کو دکھائے گا کہ آپ اپنا ڈیجیٹل والٹ کیسے سیٹ کریں اور 5 منٹ سے بھی کم وقت میں عالمی سطح پر فنڈز کیسے منتقل کریں، بغیر کسی تکنیکی تجربے کے۔",
    author: seedAuthors.danielCarter,
    publishedAt: "2026-04-12",
    updatedAt: "2026-04-12",
    readTime: "12 منٹ پڑھنے کا وقت",
    category: "Guides",
    tags: ["Beginner", "Wallet", "Swap", "Trust Wallet", "Onboarding", "Digital Assets"],
    content: `MRC Global Pay میں خوش آمدید۔ ہم ایک رجسٹرڈ کینیڈین منی سروسز بزنس (MSB) ہیں۔ یہ گائیڈ آپ کو دکھائے گا کہ آپ اپنا ڈیجیٹل والٹ کیسے سیٹ کریں اور 5 منٹ سے بھی کم وقت میں عالمی سطح پر فنڈز کیسے منتقل کریں، بغیر کسی تکنیکی تجربے کے۔

## مجھے اپنے فنڈز رکھنے کے لیے "ڈیجیٹل والٹ" کی ضرورت کیوں ہے؟

ڈیجیٹل اثاثہ جات رکھنے کے لیے، آپ کو ایک **Wallet** کی ضرورت ہے۔ اسے ایک **نجی بینک اکاؤنٹ** سمجھیں جو صرف آپ کے فون پر موجود ہوتا ہے۔ روایتی بینک کے برعکس، آپ مکمل کنٹرول میں ہوتے ہیں — کوئی درمیانی آدمی نہیں، کوئی منظوری نہیں، کوئی تاخیر نہیں۔

آپ کا Wallet آپ کا والٹ ہے۔ یہ آپ کے اثاثے محفوظ طریقے سے ذخیرہ کرتا ہے اور آپ کو ہر قسم کے سکے کے لیے ایک منفرد **"اکاؤنٹ نمبر"** (جسے Address کہا جاتا ہے) دیتا ہے جو آپ رکھتے ہیں۔

## میں اپنا Wallet کیسے سیٹ اپ کروں؟ (مرحلہ 1)

اپنا Wallet سیٹ اپ کرنے میں 2 منٹ سے بھی کم وقت لگتا ہے:

- اپنے فون کا **App Store** (iPhone) یا **Play Store** (Android) کھولیں
- **"Trust Wallet"** تلاش کریں (نیلی شیلڈ آئیکن دیکھیں)
- ایپ ڈاؤن لوڈ کریں اور کھولیں
- **"Create a new wallet"** پر ٹیپ کریں

### ⚠️ سنہری اصول

ایپ آپ کو **12 الفاظ** دکھائے گی۔ یہ آپ کی **Physical Key** ہے۔

- **انہیں کاغذ پر لکھیں**
- **اس کاغذ کو محفوظ جگہ پر رکھیں**
- **اگر آپ یہ الفاظ کھو دیتے ہیں، تو آپ اپنے پیسے کھو دیتے ہیں**
- **انہیں کبھی بھی کسی کے ساتھ شیئر نہ کریں، بشمول ہم**

ان 12 الفاظ کو اپنے والٹ کی ماسٹر کی سمجھیں۔ یہاں کوئی "password بھول گئے" کا بٹن نہیں ہوتا۔ یہ ایک حقیقی نجی، خود کنٹرول شدہ اکاؤنٹ رکھنے کا فائدہ ہے۔

## میں اپنا "Account Number" (Address) کیسے تلاش کروں؟ (مرحلہ 2)

ہر اثاثہ کا ایک منفرد **"Account Number"** (جسے Address کہا جاتا ہے) ہوتا ہے۔ آپ کو پیسہ وصول کرنے کے لیے اس کی ضرورت ہوتی ہے۔

- ایپ کی مرکزی اسکرین پر، جس سکہ کو آپ چاہتے ہیں اس پر ٹیپ کریں (مثال کے طور پر، **Bitcoin** یا **USDT**)
- بڑے **[RECEIVE]** بٹن پر ٹیپ کریں
- آپ کو حروف اور اعداد کا ایک لمبا کوڈ نظر آئے گا (مثال: 0x71C...)
- **[COPY]** بٹن پر ٹیپ کریں

**CEO ٹِپ:** اس کوڈ کو کبھی بھی خود ٹائپ نہ کریں۔ ہمیشہ **[COPY]** اور **[PASTE]** بٹن استعمال کریں۔ ایک غلط حرف کا مطلب ہے کہ پیسہ ہمیشہ کے لیے کھو گیا۔

اسے ای میل ایڈریس کی طرح سمجھیں — اگر ایک حرف بھی غلط ہو تو پیغام (یا پیسہ) غلط جگہ چلا جاتا ہے`,
  },
};
