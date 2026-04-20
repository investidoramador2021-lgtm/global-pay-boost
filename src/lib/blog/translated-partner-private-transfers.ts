import { seedAuthors } from "./seed-authors";
import type { BlogPost } from "./types";

const SLUG_EN = "private-transfers-for-partners-api";

const CONTENT_EN = `On-chain transparency is a feature of public blockchains — but for businesses, it is also a liability. Every partner integration that settles directly between two wallets leaks operational data: counterparties, payment cadence, treasury balances, and supplier relationships. MRC Global Pay's Private Transfers — available through both the [Partner API](/developers/api) and the consumer [Private Transfer terminal](/private-transfer) — change how partner traffic appears on-chain, without changing the integration model, fees, or compliance posture.

This is not a mixer. It is not a privacy coin. It is a routing topology change applied at the transaction layer, fully aligned with our [Canadian MSB framework](/about) (FINTRAC reg. C100000015).

## What partners actually get

Private Transfers ship as a flag on the existing swap endpoint. Partners use the same API key, the same fee model, and the same execution path. The only thing that changes is how the resulting on-chain footprint can be interpreted by external observers.

| Capability | Standard swap | Private transfer |
|---|---|---|
| API key | Same | Same |
| Endpoint | /v1/swap | /v1/swap (with shielded flag) |
| Fee schedule | Standard | Standard (no premium) |
| AML / KYT screening | Yes | Yes (identical pipeline) |
| Asset coverage | 6,000+ tokens | Full parity |
| Settlement time | < 60 seconds | < 60 seconds |
| On-chain link sender→recipient | Direct A → B | A → pool → B (no observable continuity) |
| Per-transfer deposit address | Unique | Unique, single-use |
| Pooling or batching | n/a | None — every transfer is independent |

There is no separate SDK, no second key, no premium tier. If your integration already calls our swap API, enabling Private Transfers is a request to your account manager and a single boolean on the request body.

## Why on-chain transparency is a partner-side risk in 2026

Public blockchains expose every counterparty interaction. Firms like Chainalysis, TRM Labs, and Elliptic have indexed billions of addresses into clusters and behavioral profiles. A wallet that looks anonymous today can be deanonymized tomorrow by:

- A KYC event at any centralized exchange the wallet ever touched
- Repeated transfer patterns that map to a known business cadence
- Address reuse for payouts, refunds, or treasury rebalancing
- Cross-referencing of timestamps with public press releases or filings

Once a single address is attributed, every historical transaction connected to it inherits that attribution. For partners running consumer apps, OTC desks, or treasury rails, the externally visible payment graph effectively becomes a dataset that competitors, attackers, and analytics vendors can mine.

The risk is not theoretical. Multiple high-profile incidents in 2025 traced internal partner volume, customer behavior, and even employee bonuses through public on-chain data — all without any breach of the partner's own systems.

## How shielded routing works

A Private Transfer alters the topology of the transaction graph. Instead of a single observable edge from sender to recipient, the transfer is decomposed into two independent on-chain transactions, joined only inside our infrastructure.

1. **Deposit phase.** The partner requests a swap with the shielded flag. Our system generates a unique, single-use deposit address for that specific transfer. The sender broadcasts a standard transaction to that address. On-chain, this is indistinguishable from any other inbound deposit to one of our liquidity addresses.
2. **Internal settlement.** Once confirmed, funds move inside our [aggregated liquidity layer](/blog/understanding-crypto-liquidity-aggregation) across multiple providers. There is no shared pool balance and no batching with other users — each transfer is processed individually but settled against ambient liquidity flow.
3. **Payout phase.** A separate on-chain transaction is sent to the recipient address from a different payout address that has no on-chain link to the deposit address. To external analytics, the deposit and the payout are two unrelated events.

The result is a transaction graph in which standard heuristics — common-input clustering, change-output analysis, peel-chain tracing — cannot reconstruct a direct path from the sender to the recipient. The transactions remain fully standard, fully verifiable, and fully on-chain.

## Integration: same key, same call, one flag

For partners already using our [Partner API](/developers/api), enabling Private Transfers requires no new infrastructure. The request payload accepts a single additional field. Webhook signatures, rate quoting, refund handling, and reconciliation all behave identically.

\`\`\`json
POST /v1/swap
{
  "from": "BTC",
  "to": "USDT-TRC20",
  "amount": "0.05",
  "address": "T...",
  "shielded": true
}
\`\`\`

The response body is identical to a standard swap. Order IDs, deposit addresses, ETAs, and webhook events all use the same schema. From the partner's perspective, the only operational change is that the on-chain footprint of the resulting transfer no longer connects sender and recipient.

## Compliance, not concealment

Private Transfers operate inside the same compliance perimeter as every other swap on the platform. Every transaction passes the same automated AML / KYT screening at deposit, internal settlement, and payout. Risk-based controls are applied identically — low-risk flows complete automatically, flagged activity is reviewed or restricted. Cooperation with global regulators continues unchanged.

This is a critical distinction from mixers, CoinJoin services, and privacy-coin bridges. Those tools operate by deliberately removing visibility from the entire system, including from the operator. Private Transfers remove visibility *only from external observers* — internally, every flow is fully attributable, fully screened, and fully recoverable in the event of a compliance hold.

| Approach | External linkability reduction | Compliance posture | Partner-side risk |
|---|---|---|---|
| Direct wallet-to-wallet transfer | None | Compliant | High data leakage |
| CoinJoin / mixers | High | High flagging risk at exchanges | Operational + reputational |
| Privacy coin (XMR / ZEC) | Very high | Delisted on most CEXes | Liquidity + rail risk |
| MRC Global Pay Private Transfer | Meaningful | Full MSB / FINTRAC alignment | None — same key, same flow |

For B2B partners — payment processors, fintechs, OTC desks, custodians — this means meaningful on-chain privacy is finally compatible with institutional compliance requirements.

## Use cases driving partner adoption

Partners typically enable Private Transfers for one or more of the following:

- **Treasury and rebalancing flows** between hot and cold wallets, where repeated direct paths would otherwise expose internal accounting.
- **Payouts to suppliers, contractors, and contributors** that should not reveal the partner's full payment cadence to public observers.
- **Consumer-facing privacy features**, where end-users explicitly want their swap output not to trace back to their funding wallet.
- **Cross-jurisdictional settlements**, where a fully visible settlement graph would create unnecessary regulatory or commercial exposure.
- **OTC desk fills**, where revealing the venue and counterparty of a large block trade would cost the desk pricing power on subsequent trades.

In each case, Private Transfers preserve the partner's existing compliance reporting while removing the implicit data leak created by direct on-chain routing.

## What this means for the broader market

The 2026 trajectory of public-chain analytics is one-directional: clustering precision improves, attribution latency shrinks, and behavioral fingerprints become richer. Direct wallet-to-wallet rails — which were the default in the 2017–2023 era — now expose partners to a level of external observability that no traditional payment rail (card networks, ACH, SWIFT) ever permitted.

Selective disclosure — the ability to remain fully compliant with regulators while not broadcasting every payment to the open internet — is becoming the institutional default. Private Transfers via the MRC Global Pay Partner API are our contribution to that standard.

## Getting started

If you are already integrated, contact your account manager to enable shielded routing on your existing key. New partners can [apply for API access](/partners) and request the capability during onboarding. Consumers can use the feature directly via the [Private Transfer terminal](/private-transfer) — no registration required.

For the full technical breakdown — input masking, path randomization, output normalization, and the AML overlay — read the [Shielded Architecture Whitepaper](/private-transfer/whitepaper).

The same API. The same fees. The same execution. A different on-chain footprint.`;

const CONTENT_PT = `A transparência on-chain é uma característica das blockchains públicas — mas, para as empresas, também é uma vulnerabilidade. Cada integração de parceiro que liquida diretamente entre duas carteiras vaza dados operacionais: contrapartes, frequência de pagamento, saldos de tesouraria e relações com fornecedores. As Transferências Privadas da MRC Global Pay — disponíveis tanto via [API de Parceiros](/developers/api) quanto via terminal [Private Transfer](/private-transfer) — mudam como o tráfego do parceiro aparece on-chain, sem alterar o modelo de integração, taxas ou postura de conformidade.

Isso não é um mixer. Não é uma moeda de privacidade. É uma mudança de topologia de roteamento aplicada na camada da transação, totalmente alinhada com nosso [enquadramento MSB canadense](/about) (FINTRAC reg. C100000015).

## O que os parceiros realmente recebem

As Transferências Privadas são entregues como uma flag no endpoint de swap existente. Parceiros usam a mesma chave de API, o mesmo modelo de taxa e o mesmo caminho de execução. A única coisa que muda é como a pegada on-chain resultante pode ser interpretada por observadores externos.

| Capacidade | Swap padrão | Transferência privada |
|---|---|---|
| Chave de API | Mesma | Mesma |
| Endpoint | /v1/swap | /v1/swap (com flag shielded) |
| Tabela de taxas | Padrão | Padrão (sem prêmio) |
| Triagem AML / KYT | Sim | Sim (pipeline idêntico) |
| Cobertura de ativos | 6.000+ tokens | Paridade total |
| Tempo de liquidação | < 60 segundos | < 60 segundos |
| Vínculo on-chain remetente→destinatário | Direto A → B | A → pool → B (sem continuidade observável) |
| Endereço de depósito por transferência | Único | Único, uso único |
| Pooling ou batching | n/a | Nenhum — cada transferência é independente |

Não há SDK separado, segunda chave ou nível premium. Se sua integração já chama nossa API de swap, ativar Transferências Privadas é uma solicitação ao seu gerente de conta e um único booleano no corpo da requisição.

## Por que a transparência on-chain é um risco para o parceiro em 2026

Blockchains públicas expõem cada interação com contrapartes. Empresas como Chainalysis, TRM Labs e Elliptic indexaram bilhões de endereços em clusters e perfis comportamentais. Uma carteira que parece anônima hoje pode ser desanonimizada amanhã por:

- Um evento de KYC em qualquer exchange centralizada que a carteira já tenha tocado
- Padrões de transferência repetidos que mapeiam para uma cadência empresarial conhecida
- Reutilização de endereços para pagamentos, reembolsos ou rebalanceamento de tesouraria
- Cruzamento de timestamps com comunicados de imprensa ou registros públicos

Uma vez que um único endereço é atribuído, cada transação histórica conectada a ele herda essa atribuição. Para parceiros que operam apps de consumidor, mesas OTC ou trilhos de tesouraria, o gráfico de pagamento visível externamente se torna efetivamente um conjunto de dados que concorrentes, atacantes e fornecedores de análise podem minerar.

## Como funciona o roteamento blindado

Uma Transferência Privada altera a topologia do gráfico da transação. Em vez de uma única aresta observável do remetente ao destinatário, a transferência é decomposta em duas transações on-chain independentes, unidas apenas dentro de nossa infraestrutura.

1. **Fase de depósito.** O parceiro solicita um swap com a flag shielded. Nosso sistema gera um endereço de depósito único e de uso único para essa transferência específica. O remetente transmite uma transação padrão para esse endereço.
2. **Liquidação interna.** Uma vez confirmados, os fundos movem-se dentro de nossa [camada de liquidez agregada](/blog/understanding-crypto-liquidity-aggregation) entre múltiplos provedores. Não há saldo de pool compartilhado e nem batching com outros usuários.
3. **Fase de pagamento.** Uma transação on-chain separada é enviada ao endereço do destinatário a partir de um endereço de pagamento diferente que não tem vínculo on-chain com o endereço de depósito.

O resultado é um gráfico de transações no qual heurísticas padrão — clustering por entrada comum, análise de saída de troco, rastreamento de peel-chain — não conseguem reconstruir um caminho direto do remetente ao destinatário.

## Integração: mesma chave, mesma chamada, uma flag

Para parceiros já usando nossa [API de Parceiros](/developers/api), ativar Transferências Privadas não requer nova infraestrutura. O payload da requisição aceita um único campo adicional.

\`\`\`json
POST /v1/swap
{
  "from": "BTC",
  "to": "USDT-TRC20",
  "amount": "0.05",
  "address": "T...",
  "shielded": true
}
\`\`\`

O corpo da resposta é idêntico a um swap padrão. IDs de pedido, endereços de depósito, ETAs e eventos de webhook usam o mesmo schema.

## Conformidade, não ocultação

As Transferências Privadas operam dentro do mesmo perímetro de conformidade que qualquer outro swap na plataforma. Cada transação passa pela mesma triagem automatizada AML / KYT no depósito, liquidação interna e pagamento. Esta é uma distinção crítica em relação a mixers, serviços CoinJoin e bridges de moedas de privacidade.

| Abordagem | Redução de rastreabilidade externa | Postura de conformidade | Risco para o parceiro |
|---|---|---|---|
| Transferência direta carteira-a-carteira | Nenhuma | Conforme | Alto vazamento de dados |
| CoinJoin / mixers | Alta | Alto risco de sinalização nas exchanges | Operacional + reputacional |
| Moeda de privacidade (XMR / ZEC) | Muito alta | Deslistada na maioria das CEXes | Risco de liquidez + trilho |
| MRC Global Pay Private Transfer | Significativa | Alinhamento total MSB / FINTRAC | Nenhum — mesma chave, mesmo fluxo |

## Casos de uso impulsionando a adoção pelos parceiros

- **Fluxos de tesouraria e rebalanceamento** entre carteiras quentes e frias.
- **Pagamentos a fornecedores, contratados e colaboradores** que não devem revelar a cadência completa de pagamentos do parceiro.
- **Recursos de privacidade voltados ao consumidor**, onde os usuários finais querem explicitamente que sua saída de swap não rastreie de volta para a carteira de origem.
- **Liquidações entre jurisdições**, onde um gráfico de liquidação totalmente visível criaria exposição regulatória ou comercial desnecessária.
- **Preenchimentos de mesa OTC**, onde revelar o local e a contraparte de um trade em bloco custaria poder de precificação à mesa.

## Como começar

Se você já está integrado, entre em contato com seu gerente de conta para habilitar o roteamento blindado em sua chave existente. Novos parceiros podem [solicitar acesso à API](/partners). Consumidores podem usar o recurso diretamente via o [terminal Private Transfer](/private-transfer) — sem cadastro.

Para o detalhamento técnico completo, leia o [Whitepaper da Arquitetura Blindada](/private-transfer/whitepaper).

A mesma API. As mesmas taxas. A mesma execução. Uma pegada on-chain diferente.`;

const CONTENT_ES = `La transparencia on-chain es una característica de las blockchains públicas — pero para las empresas, también es una vulnerabilidad. Cada integración de socio que liquida directamente entre dos carteras filtra datos operativos: contrapartes, cadencia de pagos, saldos de tesorería y relaciones con proveedores. Las Transferencias Privadas de MRC Global Pay — disponibles tanto a través de la [API de Socios](/developers/api) como del terminal [Private Transfer](/private-transfer) — cambian cómo aparece el tráfico del socio on-chain, sin alterar el modelo de integración, las tarifas o la postura de cumplimiento.

Esto no es un mezclador. No es una moneda de privacidad. Es un cambio de topología de enrutamiento aplicado en la capa de transacción, totalmente alineado con nuestro [marco MSB canadiense](/about) (FINTRAC reg. C100000015).

## Lo que los socios realmente obtienen

Las Transferencias Privadas se entregan como una bandera en el endpoint de swap existente. Los socios usan la misma clave API, el mismo modelo de tarifas y la misma ruta de ejecución.

| Capacidad | Swap estándar | Transferencia privada |
|---|---|---|
| Clave API | Misma | Misma |
| Endpoint | /v1/swap | /v1/swap (con bandera shielded) |
| Tarifas | Estándar | Estándar (sin prima) |
| Filtrado AML / KYT | Sí | Sí (pipeline idéntico) |
| Cobertura de activos | 6.000+ tokens | Paridad total |
| Tiempo de liquidación | < 60 segundos | < 60 segundos |
| Enlace on-chain remitente→destinatario | Directo A → B | A → pool → B |
| Dirección de depósito | Única | Única, un solo uso |
| Pooling o batching | n/a | Ninguno |

No hay SDK separado, segunda clave o nivel premium. Si su integración ya llama a nuestra API de swap, habilitar Transferencias Privadas es una solicitud a su gestor de cuenta y un único booleano en el cuerpo de la solicitud.

## Por qué la transparencia on-chain es un riesgo para el socio en 2026

Las blockchains públicas exponen cada interacción con contrapartes. Empresas como Chainalysis, TRM Labs y Elliptic han indexado miles de millones de direcciones en clusters y perfiles de comportamiento. Una billetera que parece anónima hoy puede ser desanonimizada mañana por:

- Un evento KYC en cualquier exchange centralizado que la billetera haya tocado
- Patrones de transferencia repetidos que se mapean a una cadencia empresarial conocida
- Reutilización de direcciones para pagos, reembolsos o reequilibrio de tesorería
- Cruce de marcas de tiempo con comunicados o presentaciones públicas

Una vez que se atribuye una sola dirección, cada transacción histórica conectada a ella hereda esa atribución.

## Cómo funciona el enrutamiento blindado

Una Transferencia Privada altera la topología del gráfico de transacciones. En lugar de una única arista observable del remitente al destinatario, la transferencia se descompone en dos transacciones on-chain independientes, unidas solo dentro de nuestra infraestructura.

1. **Fase de depósito.** El socio solicita un swap con la bandera shielded. Nuestro sistema genera una dirección de depósito única y de un solo uso para esa transferencia específica.
2. **Liquidación interna.** Una vez confirmados, los fondos se mueven dentro de nuestra [capa de liquidez agregada](/blog/understanding-crypto-liquidity-aggregation) entre múltiples proveedores.
3. **Fase de pago.** Se envía una transacción on-chain separada a la dirección del destinatario desde una dirección de pago diferente que no tiene vínculo on-chain con la dirección de depósito.

## Integración: misma clave, misma llamada, una bandera

\`\`\`json
POST /v1/swap
{
  "from": "BTC",
  "to": "USDT-TRC20",
  "amount": "0.05",
  "address": "T...",
  "shielded": true
}
\`\`\`

El cuerpo de la respuesta es idéntico a un swap estándar.

## Cumplimiento, no ocultación

Las Transferencias Privadas operan dentro del mismo perímetro de cumplimiento que cualquier otro swap en la plataforma. Cada transacción pasa por el mismo filtrado AML / KYT en depósito, liquidación interna y pago.

| Enfoque | Reducción de trazabilidad externa | Postura de cumplimiento | Riesgo para el socio |
|---|---|---|---|
| Transferencia directa cartera-a-cartera | Ninguna | Conforme | Alta fuga de datos |
| CoinJoin / mezcladores | Alta | Alto riesgo de marcado en exchanges | Operacional + reputacional |
| Moneda de privacidad (XMR / ZEC) | Muy alta | Deslistada en la mayoría de CEXes | Riesgo de liquidez |
| MRC Global Pay Private Transfer | Significativa | Alineación total MSB / FINTRAC | Ninguno — misma clave, mismo flujo |

## Casos de uso

- **Flujos de tesorería y reequilibrio** entre carteras frías y calientes.
- **Pagos a proveedores, contratistas y colaboradores**.
- **Funciones de privacidad orientadas al consumidor**.
- **Liquidaciones entre jurisdicciones**.
- **Operaciones de mesa OTC**.

## Cómo empezar

Si ya está integrado, contacte a su gestor de cuenta para habilitar el enrutamiento blindado en su clave existente. Los nuevos socios pueden [solicitar acceso a la API](/partners). Los consumidores pueden usar la función directamente vía el [terminal Private Transfer](/private-transfer) — sin registro.

Para el desglose técnico completo, lea el [Whitepaper de Arquitectura Blindada](/private-transfer/whitepaper).

La misma API. Las mismas tarifas. La misma ejecución. Una huella on-chain diferente.`;

const CONTENT_FR = `La transparence on-chain est une caractéristique des blockchains publiques — mais pour les entreprises, c'est aussi une vulnérabilité. Chaque intégration partenaire qui règle directement entre deux portefeuilles laisse fuir des données opérationnelles : contreparties, cadence de paiement, soldes de trésorerie et relations fournisseurs. Les Transferts Privés de MRC Global Pay — disponibles via l'[API Partenaires](/developers/api) et via le terminal consommateur [Private Transfer](/private-transfer) — modifient la manière dont le trafic des partenaires apparaît on-chain, sans changer le modèle d'intégration, les frais ou la posture de conformité.

Ce n'est pas un mixeur. Ce n'est pas une crypto de confidentialité. C'est un changement de topologie de routage appliqué au niveau de la transaction, pleinement aligné avec notre [cadre MSB canadien](/about) (FINTRAC reg. C100000015).

## Ce que les partenaires obtiennent réellement

Les Transferts Privés sont livrés comme un drapeau sur le endpoint de swap existant. Les partenaires utilisent la même clé API, le même modèle de frais et le même chemin d'exécution.

| Capacité | Swap standard | Transfert privé |
|---|---|---|
| Clé API | Identique | Identique |
| Endpoint | /v1/swap | /v1/swap (avec drapeau shielded) |
| Frais | Standard | Standard (sans prime) |
| Filtrage AML / KYT | Oui | Oui (pipeline identique) |
| Couverture d'actifs | 6 000+ tokens | Parité totale |
| Délai de règlement | < 60 secondes | < 60 secondes |
| Lien on-chain expéditeur→destinataire | Direct A → B | A → pool → B |
| Adresse de dépôt | Unique | Unique, à usage unique |
| Pooling ou batching | n/a | Aucun |

Pas de SDK séparé, pas de seconde clé, pas de palier premium.

## Pourquoi la transparence on-chain est un risque côté partenaire en 2026

Les blockchains publiques exposent chaque interaction avec les contreparties. Des entreprises comme Chainalysis, TRM Labs et Elliptic ont indexé des milliards d'adresses en clusters et profils comportementaux.

- Un événement KYC sur n'importe quel exchange centralisé que le portefeuille a touché
- Des schémas de transfert répétés qui correspondent à une cadence d'affaires connue
- La réutilisation d'adresses pour les paiements ou le rééquilibrage
- Le recoupement des horodatages avec des communiqués publics

Une fois qu'une seule adresse est attribuée, chaque transaction historique connectée hérite de cette attribution.

## Comment fonctionne le routage blindé

Un Transfert Privé modifie la topologie du graphe de transactions. Au lieu d'une seule arête observable de l'expéditeur au destinataire, le transfert est décomposé en deux transactions on-chain indépendantes, jointes uniquement à l'intérieur de notre infrastructure.

1. **Phase de dépôt.** Le partenaire demande un swap avec le drapeau shielded. Notre système génère une adresse de dépôt unique et à usage unique.
2. **Règlement interne.** Une fois confirmés, les fonds se déplacent dans notre [couche de liquidité agrégée](/blog/understanding-crypto-liquidity-aggregation).
3. **Phase de paiement.** Une transaction on-chain distincte est envoyée à l'adresse du destinataire depuis une adresse de paiement différente, sans lien on-chain avec l'adresse de dépôt.

## Intégration : même clé, même appel, un drapeau

\`\`\`json
POST /v1/swap
{
  "from": "BTC",
  "to": "USDT-TRC20",
  "amount": "0.05",
  "address": "T...",
  "shielded": true
}
\`\`\`

Le corps de la réponse est identique à un swap standard.

## Conformité, pas dissimulation

Les Transferts Privés opèrent dans le même périmètre de conformité que tout autre swap. Chaque transaction passe le même filtrage AML / KYT au dépôt, au règlement interne et au paiement.

| Approche | Réduction de la traçabilité externe | Posture de conformité | Risque côté partenaire |
|---|---|---|---|
| Transfert direct portefeuille-à-portefeuille | Aucune | Conforme | Forte fuite de données |
| CoinJoin / mixeurs | Élevée | Risque élevé de signalement | Opérationnel + réputationnel |
| Crypto de confidentialité (XMR / ZEC) | Très élevée | Délistée sur la plupart des CEX | Risque de liquidité |
| MRC Global Pay Private Transfer | Significative | Alignement complet MSB / FINTRAC | Aucun |

## Cas d'usage

- Flux de trésorerie et rééquilibrage entre portefeuilles chauds et froids.
- Paiements aux fournisseurs, contractuels et contributeurs.
- Fonctionnalités de confidentialité grand public.
- Règlements transfrontaliers.
- Exécutions de table OTC.

## Comment démarrer

Si vous êtes déjà intégré, contactez votre responsable de compte pour activer le routage blindé sur votre clé existante. Les nouveaux partenaires peuvent [demander un accès API](/partners). Les consommateurs peuvent utiliser la fonctionnalité directement via le [terminal Private Transfer](/private-transfer) — sans inscription.

Pour le détail technique complet, lisez le [Whitepaper de l'Architecture Blindée](/private-transfer/whitepaper).

La même API. Les mêmes frais. La même exécution. Une empreinte on-chain différente.`;

const CONTENT_JA = `オンチェーンの透明性はパブリックブロックチェーンの特徴ですが、企業にとっては脆弱性でもあります。2つのウォレット間で直接決済される各パートナー統合は、運用データ — 取引相手、支払い頻度、財務残高、サプライヤー関係 — を漏らします。MRC Global Payのプライベート送金は、[パートナーAPI](/developers/api)と[Private Transfer端末](/private-transfer)の両方を通じて利用可能で、統合モデル、手数料、コンプライアンス姿勢を変えることなく、パートナーのトラフィックがオンチェーンでどのように見えるかを変更します。

これはミキサーではありません。プライバシーコインでもありません。トランザクション層で適用されるルーティングトポロジーの変更であり、当社の[カナダMSBフレームワーク](/about)(FINTRAC登録 C100000015)と完全に整合しています。

## パートナーが実際に得るもの

プライベート送金は、既存のスワップエンドポイント上のフラグとして提供されます。パートナーは同じAPIキー、同じ手数料モデル、同じ実行パスを使用します。

| 機能 | 標準スワップ | プライベート送金 |
|---|---|---|
| APIキー | 同じ | 同じ |
| エンドポイント | /v1/swap | /v1/swap (shieldedフラグ付き) |
| 手数料体系 | 標準 | 標準(プレミアムなし) |
| AML / KYTスクリーニング | あり | あり(同一のパイプライン) |
| アセットカバレッジ | 6,000+トークン | 完全パリティ |
| 決済時間 | 60秒未満 | 60秒未満 |
| 送信者→受信者のオンチェーンリンク | 直接 A → B | A → プール → B |
| 入金アドレス | ユニーク | ユニーク、単回使用 |
| プーリングまたはバッチ処理 | n/a | なし |

別途SDK、第二のキー、プレミアム階層はありません。

## 2026年にオンチェーンの透明性がパートナー側のリスクとなる理由

パブリックブロックチェーンはすべての取引相手とのやりとりを公開します。Chainalysis、TRM Labs、Elliptic などの企業は、数十億のアドレスをクラスタおよび行動プロファイルに索引化しています。

- ウォレットが触れたあらゆる中央集権型取引所でのKYCイベント
- 既知のビジネスサイクルにマッピングする繰り返しの送金パターン
- 支払い、返金、財務リバランスのためのアドレスの再利用
- タイムスタンプと公開プレスリリースとの相互参照

単一のアドレスが帰属されると、それに接続された各履歴トランザクションがその帰属を継承します。

## シールドルーティングの仕組み

プライベート送金は、トランザクショングラフのトポロジーを変更します。送信者から受信者への単一の観測可能なエッジの代わりに、送金は2つの独立したオンチェーントランザクションに分解され、当社のインフラストラクチャ内でのみ結合されます。

1. **デポジットフェーズ。** パートナーはshieldedフラグ付きのスワップをリクエストします。当社のシステムは、その特定の送金のために、ユニークで単回使用のデポジットアドレスを生成します。
2. **内部決済。** 確認されると、資金は[集約流動性レイヤー](/blog/understanding-crypto-liquidity-aggregation)内で複数のプロバイダーをまたいで移動します。
3. **支払いフェーズ。** デポジットアドレスとオンチェーンリンクのない別の支払いアドレスから、受信者アドレスに別個のオンチェーントランザクションが送信されます。

## 統合: 同じキー、同じコール、1つのフラグ

\`\`\`json
POST /v1/swap
{
  "from": "BTC",
  "to": "USDT-TRC20",
  "amount": "0.05",
  "address": "T...",
  "shielded": true
}
\`\`\`

レスポンスボディは標準スワップと同一です。

## 隠蔽ではなく、コンプライアンス

プライベート送金は、プラットフォーム上の他のすべてのスワップと同じコンプライアンス境界内で動作します。各トランザクションは、デポジット、内部決済、支払いにおいて同じ自動化されたAML / KYTスクリーニングを通過します。これは、ミキサー、CoinJoinサービス、プライバシーコインブリッジとの重要な区別です。

| アプローチ | 外部追跡可能性の削減 | コンプライアンス姿勢 | パートナー側リスク |
|---|---|---|---|
| 直接ウォレット間送金 | なし | 準拠 | 高いデータ漏洩 |
| CoinJoin / ミキサー | 高 | 取引所での高いフラグリスク | 運用 + 評判 |
| プライバシーコイン (XMR / ZEC) | 非常に高い | ほとんどのCEXで上場廃止 | 流動性リスク |
| MRC Global Pay Private Transfer | 意味のある | MSB / FINTRACとの完全な整合 | なし |

## ユースケース

- ホットウォレットとコールドウォレット間の財務およびリバランスフロー
- サプライヤー、契約者、貢献者への支払い
- 消費者向けプライバシー機能
- 法域間の決済
- OTCデスクの約定

## はじめに

すでに統合されている場合は、アカウントマネージャーに連絡して、既存のキーでシールドルーティングを有効にしてください。新規パートナーは[APIアクセスを申請](/partners)できます。消費者は[Private Transfer端末](/private-transfer)を介して直接機能を使用できます — 登録不要。

完全な技術的内訳については、[シールドアーキテクチャホワイトペーパー](/private-transfer/whitepaper)をお読みください。

同じAPI。同じ手数料。同じ実行。異なるオンチェーンフットプリント。`;

const CONTENT_TR = `Zincir üstü şeffaflık, halka açık blok zincirlerinin bir özelliğidir — ancak işletmeler için aynı zamanda bir zafiyettir. İki cüzdan arasında doğrudan uzlaşan her ortak entegrasyonu operasyonel verileri sızdırır: karşı taraflar, ödeme sıklığı, hazine bakiyeleri ve tedarikçi ilişkileri. MRC Global Pay'in Özel Transferleri — hem [Ortak API'si](/developers/api) hem de tüketici [Private Transfer terminali](/private-transfer) aracılığıyla mevcuttur — entegrasyon modelini, ücretleri veya uyum duruşunu değiştirmeden ortak trafiğinin zincir üstünde nasıl göründüğünü değiştirir.

Bu bir karıştırıcı değildir. Bir gizlilik coini değildir. İşlem katmanında uygulanan bir yönlendirme topolojisi değişikliğidir ve [Kanada MSB çerçevemizle](/about) (FINTRAC reg. C100000015) tamamen uyumludur.

## Ortakların gerçekten elde ettikleri

Özel Transferler, mevcut swap uç noktasında bir bayrak olarak gönderilir. Ortaklar aynı API anahtarını, aynı ücret modelini ve aynı yürütme yolunu kullanır.

| Yetenek | Standart swap | Özel transfer |
|---|---|---|
| API anahtarı | Aynı | Aynı |
| Uç nokta | /v1/swap | /v1/swap (shielded bayrağı ile) |
| Ücret tarifesi | Standart | Standart (prim yok) |
| AML / KYT taraması | Evet | Evet (aynı pipeline) |
| Varlık kapsamı | 6.000+ token | Tam parite |
| Uzlaşma süresi | < 60 saniye | < 60 saniye |
| Zincir üstü gönderici→alıcı bağlantısı | Doğrudan A → B | A → havuz → B |
| Yatırım adresi | Benzersiz | Benzersiz, tek kullanımlık |
| Havuzlama veya gruplama | n/a | Yok |

## Neden zincir üstü şeffaflık 2026'da ortak tarafı için bir risktir

Halka açık blok zincirleri her karşı taraf etkileşimini açığa çıkarır. Chainalysis, TRM Labs ve Elliptic gibi firmalar milyarlarca adresi kümelere ve davranışsal profillere dizine eklemiştir.

- Cüzdanın dokunduğu herhangi bir merkezi borsada bir KYC olayı
- Bilinen bir iş ritmine eşlenen tekrarlayan transfer kalıpları
- Ödemeler, iadeler veya hazine yeniden dengeleme için adres yeniden kullanımı
- Zaman damgalarının halka açık basın bültenleriyle çapraz referanslanması

## Korumalı yönlendirme nasıl çalışır

Bir Özel Transfer, işlem grafiğinin topolojisini değiştirir. Göndericiden alıcıya tek bir gözlemlenebilir kenar yerine, transfer iki bağımsız zincir üstü işleme ayrıştırılır ve yalnızca altyapımızın içinde birleştirilir.

1. **Yatırım aşaması.** Ortak, shielded bayrağı ile bir swap talep eder. Sistemimiz o belirli transfer için benzersiz, tek kullanımlık bir yatırım adresi oluşturur.
2. **İç uzlaşma.** Onaylandıktan sonra, fonlar [toplu likidite katmanımız](/blog/understanding-crypto-liquidity-aggregation) içinde hareket eder.
3. **Ödeme aşaması.** Yatırım adresi ile zincir üstü bağlantısı olmayan farklı bir ödeme adresinden alıcı adresine ayrı bir zincir üstü işlem gönderilir.

## Entegrasyon: aynı anahtar, aynı çağrı, bir bayrak

\`\`\`json
POST /v1/swap
{
  "from": "BTC",
  "to": "USDT-TRC20",
  "amount": "0.05",
  "address": "T...",
  "shielded": true
}
\`\`\`

## Uyum, gizleme değil

Özel Transferler, platformdaki diğer her swap ile aynı uyum çevresinde çalışır. Her işlem yatırım, iç uzlaşma ve ödemede aynı otomatik AML / KYT taramasından geçer.

| Yaklaşım | Dış izlenebilirlik azaltma | Uyum duruşu | Ortak tarafı riski |
|---|---|---|---|
| Doğrudan cüzdandan-cüzdana transfer | Yok | Uyumlu | Yüksek veri sızıntısı |
| CoinJoin / karıştırıcılar | Yüksek | Borsalarda yüksek işaretleme riski | Operasyonel + itibari |
| Gizlilik coini (XMR / ZEC) | Çok yüksek | Çoğu CEX'te listeden çıkarıldı | Likidite riski |
| MRC Global Pay Private Transfer | Anlamlı | Tam MSB / FINTRAC uyumu | Yok |

## Kullanım durumları

- Sıcak ve soğuk cüzdanlar arasında hazine ve yeniden dengeleme akışları.
- Tedarikçilere, yüklenicilere ve katkıda bulunanlara ödemeler.
- Tüketiciye yönelik gizlilik özellikleri.
- Yargı bölgeleri arası uzlaşmalar.
- OTC masa dolumları.

## Başlarken

Zaten entegre iseniz, mevcut anahtarınızda korumalı yönlendirmeyi etkinleştirmek için hesap yöneticinize başvurun. Yeni ortaklar [API erişimi başvurabilir](/partners). Tüketiciler özelliği doğrudan [Private Transfer terminali](/private-transfer) üzerinden kullanabilir — kayıt gerektirmez.

Tam teknik dökümü için [Korumalı Mimari Whitepaper'ını](/private-transfer/whitepaper) okuyun.

Aynı API. Aynı ücretler. Aynı yürütme. Farklı bir zincir üstü ayak izi.`;

const CONTENT_HI = `ऑन-चेन पारदर्शिता सार्वजनिक ब्लॉकचेन की एक विशेषता है — लेकिन व्यवसायों के लिए, यह एक भेद्यता भी है। प्रत्येक पार्टनर एकीकरण जो दो वॉलेट के बीच सीधे निपटान करता है, परिचालन डेटा लीक करता है: काउंटरपार्टी, भुगतान आवृत्ति, कोषागार शेष और आपूर्तिकर्ता संबंध। MRC Global Pay के निजी ट्रांसफर — [पार्टनर API](/developers/api) और उपभोक्ता [Private Transfer टर्मिनल](/private-transfer) दोनों के माध्यम से उपलब्ध — यह बदलते हैं कि पार्टनर ट्रैफिक ऑन-चेन कैसे दिखता है, बिना एकीकरण मॉडल, शुल्क या अनुपालन मुद्रा बदले।

यह मिक्सर नहीं है। यह प्राइवेसी कॉइन नहीं है। यह लेनदेन परत पर लागू एक रूटिंग टोपोलॉजी परिवर्तन है, जो हमारे [कनाडाई MSB ढांचे](/about) (FINTRAC पंजीकरण C100000015) के साथ पूरी तरह संरेखित है।

## पार्टनर वास्तव में क्या प्राप्त करते हैं

निजी ट्रांसफर मौजूदा स्वैप एंडपॉइंट पर एक फ्लैग के रूप में आते हैं। पार्टनर वही API कुंजी, वही शुल्क मॉडल और वही निष्पादन पथ का उपयोग करते हैं।

| क्षमता | मानक स्वैप | निजी ट्रांसफर |
|---|---|---|
| API कुंजी | समान | समान |
| एंडपॉइंट | /v1/swap | /v1/swap (shielded फ्लैग के साथ) |
| शुल्क | मानक | मानक (कोई प्रीमियम नहीं) |
| AML / KYT स्क्रीनिंग | हाँ | हाँ (समान पाइपलाइन) |
| संपत्ति कवरेज | 6,000+ टोकन | पूर्ण समानता |
| निपटान समय | < 60 सेकंड | < 60 सेकंड |
| ऑन-चेन प्रेषक→प्राप्तकर्ता लिंक | प्रत्यक्ष A → B | A → पूल → B |
| जमा पता | अद्वितीय | अद्वितीय, एकल उपयोग |

## 2026 में ऑन-चेन पारदर्शिता पार्टनर-साइड जोखिम क्यों है

सार्वजनिक ब्लॉकचेन प्रत्येक काउंटरपार्टी इंटरैक्शन को उजागर करते हैं। Chainalysis, TRM Labs और Elliptic जैसी फर्मों ने अरबों पतों को क्लस्टर और व्यवहारिक प्रोफाइल में अनुक्रमित किया है।

- किसी भी केंद्रीकृत एक्सचेंज पर KYC घटना जिसे वॉलेट ने स्पर्श किया हो
- दोहराए गए ट्रांसफर पैटर्न जो ज्ञात व्यावसायिक ताल पर मैप होते हैं
- भुगतान, रिफंड या कोषागार पुनर्संतुलन के लिए पते का पुन: उपयोग

## शील्डेड रूटिंग कैसे काम करती है

एक निजी ट्रांसफर लेनदेन ग्राफ की टोपोलॉजी को बदलता है। प्रेषक से प्राप्तकर्ता तक एकल अवलोकनीय किनारे के बजाय, ट्रांसफर को दो स्वतंत्र ऑन-चेन लेनदेन में विघटित किया जाता है।

1. **जमा चरण।** पार्टनर shielded फ्लैग के साथ स्वैप का अनुरोध करता है। हमारा सिस्टम उस विशिष्ट ट्रांसफर के लिए अद्वितीय, एकल-उपयोग जमा पता उत्पन्न करता है।
2. **आंतरिक निपटान।** पुष्टि होने पर, धन हमारी [समग्र तरलता परत](/blog/understanding-crypto-liquidity-aggregation) के भीतर चलता है।
3. **भुगतान चरण।** एक अलग पते से प्राप्तकर्ता पते पर एक अलग लेनदेन भेजा जाता है।

## एकीकरण: समान कुंजी, समान कॉल, एक फ्लैग

\`\`\`json
POST /v1/swap
{
  "from": "BTC",
  "to": "USDT-TRC20",
  "amount": "0.05",
  "address": "T...",
  "shielded": true
}
\`\`\`

## अनुपालन, छिपाव नहीं

निजी ट्रांसफर प्लेटफ़ॉर्म पर हर दूसरे स्वैप के समान अनुपालन परिधि के भीतर संचालित होते हैं।

| दृष्टिकोण | बाहरी ट्रेसबिलिटी कमी | अनुपालन मुद्रा | पार्टनर-साइड जोखिम |
|---|---|---|---|
| प्रत्यक्ष वॉलेट-टू-वॉलेट | कोई नहीं | अनुपालक | उच्च डेटा रिसाव |
| CoinJoin / मिक्सर | उच्च | एक्सचेंजों पर उच्च फ्लैगिंग जोखिम | परिचालन + प्रतिष्ठात्मक |
| गोपनीयता कॉइन (XMR / ZEC) | बहुत उच्च | अधिकांश CEX से डिलिस्टेड | तरलता जोखिम |
| MRC Global Pay Private Transfer | सार्थक | पूर्ण MSB / FINTRAC संरेखण | कोई नहीं |

## उपयोग के मामले

- हॉट और कोल्ड वॉलेट के बीच कोषागार और पुनर्संतुलन प्रवाह
- आपूर्तिकर्ताओं, ठेकेदारों और योगदानकर्ताओं को भुगतान
- उपभोक्ता-सामना गोपनीयता सुविधाएँ
- क्रॉस-न्यायक्षेत्र निपटान
- OTC डेस्क फिल

## शुरुआत कैसे करें

यदि आप पहले से एकीकृत हैं, तो अपनी मौजूदा कुंजी पर शील्डेड रूटिंग सक्षम करने के लिए अपने खाता प्रबंधक से संपर्क करें। नए पार्टनर [API एक्सेस के लिए आवेदन कर सकते हैं](/partners)।

पूर्ण तकनीकी विवरण के लिए, [शील्डेड आर्किटेक्चर व्हाइटपेपर](/private-transfer/whitepaper) पढ़ें।

समान API। समान शुल्क। समान निष्पादन। एक अलग ऑन-चेन फुटप्रिंट।`;

const CONTENT_VI = `Tính minh bạch on-chain là một đặc tính của blockchain công cộng — nhưng đối với doanh nghiệp, đó cũng là một lỗ hổng. Mỗi tích hợp đối tác thanh toán trực tiếp giữa hai ví đều rò rỉ dữ liệu vận hành: đối tác, tần suất thanh toán, số dư kho bạc và quan hệ nhà cung cấp. Private Transfers của MRC Global Pay — có sẵn qua [API Đối tác](/developers/api) và terminal [Private Transfer](/private-transfer) — thay đổi cách lưu lượng đối tác xuất hiện on-chain mà không thay đổi mô hình tích hợp, phí hoặc tư thế tuân thủ.

Đây không phải là mixer. Đây không phải là privacy coin. Đây là sự thay đổi cấu trúc định tuyến áp dụng ở lớp giao dịch, hoàn toàn phù hợp với [khuôn khổ MSB Canada của chúng tôi](/about) (FINTRAC reg. C100000015).

## Đối tác thực sự nhận được gì

Private Transfers được cung cấp dưới dạng cờ trên endpoint swap hiện có. Đối tác sử dụng cùng khóa API, cùng mô hình phí và cùng đường dẫn thực thi.

| Khả năng | Swap chuẩn | Private transfer |
|---|---|---|
| Khóa API | Giống nhau | Giống nhau |
| Endpoint | /v1/swap | /v1/swap (với cờ shielded) |
| Phí | Chuẩn | Chuẩn (không phụ phí) |
| Sàng lọc AML / KYT | Có | Có (pipeline giống hệt) |
| Phạm vi tài sản | 6.000+ token | Đầy đủ |
| Thời gian thanh toán | < 60 giây | < 60 giây |
| Liên kết on-chain người gửi→người nhận | Trực tiếp A → B | A → pool → B |
| Địa chỉ nạp | Duy nhất | Duy nhất, dùng một lần |

## Tại sao tính minh bạch on-chain là rủi ro phía đối tác vào năm 2026

Blockchain công cộng phơi bày mọi tương tác với đối tác. Các công ty như Chainalysis, TRM Labs và Elliptic đã lập chỉ mục hàng tỷ địa chỉ thành các cụm và hồ sơ hành vi.

- Sự kiện KYC trên bất kỳ sàn tập trung nào mà ví đã chạm vào
- Mẫu chuyển khoản lặp lại ánh xạ đến nhịp kinh doanh đã biết
- Tái sử dụng địa chỉ cho thanh toán, hoàn tiền hoặc tái cân bằng kho bạc

## Cách định tuyến bảo vệ hoạt động

Một Private Transfer thay đổi cấu trúc của đồ thị giao dịch. Thay vì một cạnh có thể quan sát duy nhất từ người gửi đến người nhận, việc chuyển tiền được phân tách thành hai giao dịch on-chain độc lập, chỉ được nối bên trong cơ sở hạ tầng của chúng tôi.

1. **Giai đoạn nạp.** Đối tác yêu cầu một swap với cờ shielded. Hệ thống của chúng tôi tạo một địa chỉ nạp duy nhất, dùng một lần cho lần chuyển cụ thể đó.
2. **Thanh toán nội bộ.** Sau khi xác nhận, tiền di chuyển trong [lớp thanh khoản tổng hợp](/blog/understanding-crypto-liquidity-aggregation) của chúng tôi.
3. **Giai đoạn thanh toán.** Một giao dịch on-chain riêng được gửi đến địa chỉ người nhận từ một địa chỉ thanh toán khác không có liên kết on-chain với địa chỉ nạp.

## Tích hợp: cùng khóa, cùng cuộc gọi, một cờ

\`\`\`json
POST /v1/swap
{
  "from": "BTC",
  "to": "USDT-TRC20",
  "amount": "0.05",
  "address": "T...",
  "shielded": true
}
\`\`\`

## Tuân thủ, không phải che giấu

Private Transfers hoạt động trong cùng phạm vi tuân thủ như mọi swap khác trên nền tảng. Mỗi giao dịch đều trải qua sàng lọc AML / KYT tự động giống hệt nhau ở giai đoạn nạp, thanh toán nội bộ và thanh toán.

| Cách tiếp cận | Giảm khả năng truy vết bên ngoài | Tư thế tuân thủ | Rủi ro phía đối tác |
|---|---|---|---|
| Chuyển trực tiếp ví-tới-ví | Không | Tuân thủ | Rò rỉ dữ liệu cao |
| CoinJoin / mixer | Cao | Rủi ro gắn cờ cao tại sàn | Vận hành + uy tín |
| Privacy coin (XMR / ZEC) | Rất cao | Bị hủy niêm yết trên hầu hết CEX | Rủi ro thanh khoản |
| MRC Global Pay Private Transfer | Đáng kể | Tuân thủ MSB / FINTRAC đầy đủ | Không |

## Trường hợp sử dụng

- Luồng kho bạc và tái cân bằng giữa ví nóng và ví lạnh
- Thanh toán cho nhà cung cấp, nhà thầu và cộng tác viên
- Tính năng riêng tư hướng người tiêu dùng
- Thanh toán xuyên khu vực pháp lý
- Lệnh OTC

## Bắt đầu

Nếu bạn đã tích hợp, hãy liên hệ với người quản lý tài khoản của bạn để bật định tuyến bảo vệ trên khóa hiện có. Đối tác mới có thể [đăng ký truy cập API](/partners). Người tiêu dùng có thể sử dụng tính năng này trực tiếp qua [terminal Private Transfer](/private-transfer) — không cần đăng ký.

Để biết chi tiết kỹ thuật đầy đủ, hãy đọc [Whitepaper Kiến trúc Bảo vệ](/private-transfer/whitepaper).

Cùng API. Cùng phí. Cùng thực thi. Một dấu chân on-chain khác.`;

const CONTENT_AF = `On-chain deursigtigheid is 'n kenmerk van publieke blokkettings — maar vir besighede is dit ook 'n kwesbaarheid. Elke vennootintegrasie wat direk tussen twee beursies vereffen, lek operasionele data: teenpartye, betaalkadens, tesouriebalanse en verskafferverhoudings. MRC Global Pay se Privaat Oordragte — beskikbaar deur beide die [Vennoot-API](/developers/api) en die verbruiker [Private Transfer terminaal](/private-transfer) — verander hoe vennootverkeer on-chain verskyn, sonder om die integrasiemodel, fooie of nakomingshouding te verander.

Dit is nie 'n menger nie. Dit is nie 'n privaatheidsmuntstuk nie. Dit is 'n verandering van roeteringstopologie wat by die transaksielaag toegepas word, ten volle in lyn met ons [Kanadese MSB-raamwerk](/about) (FINTRAC reg. C100000015).

## Wat vennote werklik kry

Privaat Oordragte word verskaf as 'n vlag op die bestaande ruileindpunt. Vennote gebruik dieselfde API-sleutel, dieselfde fooi-model en dieselfde uitvoeringspad.

| Vermoë | Standaard ruil | Privaat oordrag |
|---|---|---|
| API-sleutel | Dieselfde | Dieselfde |
| Eindpunt | /v1/swap | /v1/swap (met shielded vlag) |
| Fooie | Standaard | Standaard (geen premie) |
| AML / KYT-sifting | Ja | Ja (identiese pyplyn) |
| Bate-dekking | 6 000+ tokens | Volle pariteit |
| Vereffeningstyd | < 60 sekondes | < 60 sekondes |
| On-chain skakel sender→ontvanger | Direk A → B | A → poel → B |
| Deposito-adres | Uniek | Uniek, eenmalige gebruik |

## Hoekom on-chain deursigtigheid in 2026 'n vennoot-kant risiko is

Publieke blokkettings ontbloot elke teenparty-interaksie. Firmas soos Chainalysis, TRM Labs en Elliptic het miljarde adresse in trosse en gedragsprofiele geïndekseer.

- 'n KYC-gebeurtenis by enige gesentraliseerde beurs wat die beursie ooit aangeraak het
- Herhaalde oordragpatrone wat na 'n bekende besigheidskadens kaart
- Adres-hergebruik vir uitbetalings, terugbetalings of tesourie-herbalansering

## Hoe beskermde roetering werk

'n Privaat Oordrag verander die topologie van die transaksiegrafiek. In plaas van 'n enkele waarneembare rand van sender na ontvanger, word die oordrag in twee onafhanklike on-chain transaksies ontbind, wat slegs binne ons infrastruktuur saamgevoeg word.

1. **Depositofase.** Die vennoot versoek 'n ruil met die shielded vlag. Ons stelsel genereer 'n unieke, eenmalige deposito-adres vir daardie spesifieke oordrag.
2. **Interne vereffening.** Sodra dit bevestig is, beweeg fondse binne ons [saamgevoegde likiditeitslaag](/blog/understanding-crypto-liquidity-aggregation).
3. **Uitbetalingsfase.** 'n Aparte on-chain transaksie word na die ontvanger se adres gestuur vanaf 'n ander uitbetalingsadres wat geen on-chain skakel met die deposito-adres het nie.

## Integrasie: dieselfde sleutel, dieselfde oproep, een vlag

\`\`\`json
POST /v1/swap
{
  "from": "BTC",
  "to": "USDT-TRC20",
  "amount": "0.05",
  "address": "T...",
  "shielded": true
}
\`\`\`

## Nakoming, nie verberging nie

Privaat Oordragte werk binne dieselfde nakomingsomtrek as enige ander ruil op die platform. Elke transaksie slaag dieselfde outomatiese AML / KYT-sifting by deposito, interne vereffening en uitbetaling.

| Benadering | Eksterne naspeurbaarheidsvermindering | Nakomingshouding | Vennoot-kant risiko |
|---|---|---|---|
| Direkte beursie-tot-beursie oordrag | Geen | Konform | Hoë data-lekkasie |
| CoinJoin / mengers | Hoog | Hoë vlagrisiko by beurse | Operasioneel + reputasioneel |
| Privaatheidsmuntstuk (XMR / ZEC) | Baie hoog | Onge-noteer op meeste CEX'e | Likiditeitsrisiko |
| MRC Global Pay Private Transfer | Beduidend | Volle MSB / FINTRAC belyning | Geen |

## Gebruiksgevalle

- Tesourie- en herbalanseringsvloei tussen warm en koue beursies
- Betalings aan verskaffers, kontrakteurs en bydraers
- Verbruikersgerigte privaatheidskenmerke
- Inter-jurisdiksie vereffenings
- OTC-tafelvulling

## Hoe om te begin

As jy reeds geïntegreer is, kontak jou rekeningbestuurder om beskermde roetering op jou bestaande sleutel te aktiveer. Nuwe vennote kan [aansoek doen vir API-toegang](/partners). Verbruikers kan die kenmerk direk gebruik via die [Private Transfer terminaal](/private-transfer) — geen registrasie nodig.

Vir die volledige tegniese uiteensetting, lees die [Beskermde Argitektuur Whitepaper](/private-transfer/whitepaper).

Dieselfde API. Dieselfde fooie. Dieselfde uitvoering. 'n Ander on-chain voetspoor.`;

const CONTENT_FA = `شفافیت آن‌چین یک ویژگی بلاک‌چین‌های عمومی است — اما برای کسب‌وکارها، یک آسیب‌پذیری نیز هست. هر یکپارچه‌سازی شریک که مستقیماً بین دو کیف پول تسویه می‌شود، داده‌های عملیاتی را افشا می‌کند: طرف مقابل، کادنس پرداخت، موجودی خزانه‌داری و روابط با تأمین‌کنندگان. انتقال‌های خصوصی MRC Global Pay — هم از طریق [API شرکا](/developers/api) و هم ترمینال مصرف‌کننده [Private Transfer](/private-transfer) در دسترس است — نحوه ظاهر شدن ترافیک شریک در آن‌چین را تغییر می‌دهد، بدون تغییر در مدل یکپارچه‌سازی، کارمزدها یا وضعیت انطباق.

این یک میکسر نیست. این یک کوین حریم خصوصی نیست. این یک تغییر توپولوژی مسیریابی است که در لایه تراکنش اعمال می‌شود و کاملاً با [چارچوب MSB کانادایی ما](/about) (ثبت FINTRAC C100000015) همسو است.

## شرکا واقعاً چه چیزی به دست می‌آورند

انتقال‌های خصوصی به عنوان یک پرچم در نقطه پایانی swap موجود ارائه می‌شوند. شرکا از همان کلید API، همان مدل کارمزد و همان مسیر اجرا استفاده می‌کنند.

| قابلیت | swap استاندارد | انتقال خصوصی |
|---|---|---|
| کلید API | یکسان | یکسان |
| نقطه پایانی | /v1/swap | /v1/swap (با پرچم shielded) |
| کارمزدها | استاندارد | استاندارد (بدون اضافه‌بها) |
| غربالگری AML / KYT | بله | بله (پایپ‌لاین یکسان) |
| پوشش دارایی | 6,000+ توکن | برابری کامل |
| زمان تسویه | < 60 ثانیه | < 60 ثانیه |
| پیوند آن‌چین فرستنده→گیرنده | مستقیم A → B | A → استخر → B |

## چرا شفافیت آن‌چین در سال 2026 یک ریسک سمت شریک است

بلاک‌چین‌های عمومی هر تعامل با طرف مقابل را افشا می‌کنند. شرکت‌هایی مانند Chainalysis، TRM Labs و Elliptic میلیاردها آدرس را در خوشه‌ها و پروفایل‌های رفتاری ایندکس کرده‌اند.

- یک رویداد KYC در هر صرافی متمرکزی که کیف پول لمس کرده است
- الگوهای انتقال تکراری که به یک کادنس کسب‌وکار شناخته‌شده نگاشت می‌شوند
- استفاده مجدد از آدرس برای پرداخت‌ها، بازپرداخت‌ها یا متعادل‌سازی مجدد خزانه‌داری

## مسیریابی محافظت‌شده چگونه کار می‌کند

یک انتقال خصوصی توپولوژی گراف تراکنش را تغییر می‌دهد. به جای یک یال قابل مشاهده از فرستنده به گیرنده، انتقال به دو تراکنش آن‌چین مستقل تجزیه می‌شود که فقط در داخل زیرساخت ما به هم می‌پیوندند.

1. **مرحله سپرده.** شریک یک swap با پرچم shielded درخواست می‌کند. سیستم ما یک آدرس سپرده منحصر به فرد و یک‌بار مصرف برای آن انتقال خاص تولید می‌کند.
2. **تسویه داخلی.** پس از تأیید، وجوه در [لایه نقدینگی تجمیعی](/blog/understanding-crypto-liquidity-aggregation) ما حرکت می‌کنند.
3. **مرحله پرداخت.** یک تراکنش آن‌چین جداگانه از یک آدرس پرداخت متفاوت که هیچ پیوند آن‌چینی با آدرس سپرده ندارد به آدرس گیرنده ارسال می‌شود.

## یکپارچه‌سازی: همان کلید، همان فراخوانی، یک پرچم

\`\`\`json
POST /v1/swap
{
  "from": "BTC",
  "to": "USDT-TRC20",
  "amount": "0.05",
  "address": "T...",
  "shielded": true
}
\`\`\`

## انطباق، نه پنهان‌کاری

انتقال‌های خصوصی در همان محیط انطباق با هر swap دیگری روی پلتفرم عمل می‌کنند. هر تراکنش از همان غربالگری خودکار AML / KYT در سپرده، تسویه داخلی و پرداخت عبور می‌کند.

| رویکرد | کاهش قابلیت ردیابی خارجی | وضعیت انطباق | ریسک سمت شریک |
|---|---|---|---|
| انتقال مستقیم کیف پول به کیف پول | هیچ | منطبق | نشت داده بالا |
| CoinJoin / میکسرها | بالا | ریسک علامت‌گذاری بالا در صرافی‌ها | عملیاتی + شهرت |
| کوین حریم خصوصی (XMR / ZEC) | بسیار بالا | از فهرست بیشتر CEXها حذف شده | ریسک نقدینگی |
| MRC Global Pay Private Transfer | معنادار | همسویی کامل MSB / FINTRAC | هیچ |

## موارد استفاده

- جریان‌های خزانه‌داری و متعادل‌سازی مجدد بین کیف پول‌های گرم و سرد
- پرداخت به تأمین‌کنندگان، پیمانکاران و مشارکت‌کنندگان
- ویژگی‌های حریم خصوصی مصرف‌کننده‌محور
- تسویه‌های بین‌حوزه‌ای
- پر کردن میز OTC

## شروع کار

اگر قبلاً یکپارچه شده‌اید، با مدیر حساب خود تماس بگیرید تا مسیریابی محافظت‌شده را در کلید موجود خود فعال کند. شرکای جدید می‌توانند [برای دسترسی به API درخواست دهند](/partners). مصرف‌کنندگان می‌توانند از این ویژگی مستقیماً از طریق [ترمینال Private Transfer](/private-transfer) استفاده کنند — بدون نیاز به ثبت‌نام.

برای جزئیات فنی کامل، [وایت‌پیپر معماری محافظت‌شده](/private-transfer/whitepaper) را بخوانید.

همان API. همان کارمزدها. همان اجرا. یک ردپای آن‌چین متفاوت.`;

const CONTENT_HE = `שקיפות on-chain היא תכונה של בלוקצ'יינים ציבוריים — אבל עבור עסקים, היא גם פגיעות. כל אינטגרציית שותף המסתפקת ישירות בין שני ארנקים מדליפה נתונים תפעוליים: צדדים נגדיים, קצב תשלומים, יתרות אוצר ויחסי ספקים. ההעברות הפרטיות של MRC Global Pay — זמינות הן דרך [API השותפים](/developers/api) והן דרך טרמינל הצרכן [Private Transfer](/private-transfer) — משנות את האופן שבו תנועת השותפים מופיעה on-chain, מבלי לשנות את מודל האינטגרציה, העמלות או עמדת הציות.

זה לא מיקסר. זו לא מטבע פרטיות. זהו שינוי טופולוגיית ניתוב המוחל בשכבת העסקה, מיושר במלואו עם [מסגרת MSB הקנדית שלנו](/about) (FINTRAC reg. C100000015).

## מה השותפים מקבלים בפועל

ההעברות הפרטיות מסופקות כדגל על נקודת הקצה הקיימת של ה-swap. השותפים משתמשים באותו מפתח API, באותו מודל עמלות ובאותו נתיב ביצוע.

| יכולת | swap סטנדרטי | העברה פרטית |
|---|---|---|
| מפתח API | זהה | זהה |
| נקודת קצה | /v1/swap | /v1/swap (עם דגל shielded) |
| לוח עמלות | סטנדרטי | סטנדרטי (ללא פרמיה) |
| סינון AML / KYT | כן | כן (צינור זהה) |
| כיסוי נכסים | 6,000+ טוקנים | פריטטיות מלאה |
| זמן סליקה | < 60 שניות | < 60 שניות |
| קישור on-chain שולח→מקבל | ישיר A → B | A → בריכה → B |

## מדוע שקיפות on-chain היא סיכון בצד השותף ב-2026

בלוקצ'יינים ציבוריים חושפים כל אינטראקציה עם צד נגדי. חברות כמו Chainalysis, TRM Labs ו-Elliptic אינדקסו מיליארדי כתובות לאשכולות ופרופילים התנהגותיים.

- אירוע KYC בכל בורסה מרוכזת שאליה הארנק נגע
- דפוסי העברה חוזרים הממופים לקצב עסקי ידוע
- שימוש חוזר בכתובות לתשלומים, החזרים או איזון מחדש של אוצר

## איך עובד הניתוב המוגן

העברה פרטית משנה את הטופולוגיה של גרף העסקאות. במקום קצה יחיד הנצפה מהשולח למקבל, ההעברה מפורקת לשתי עסקאות on-chain עצמאיות, המחוברות רק בתוך התשתית שלנו.

1. **שלב ההפקדה.** השותף מבקש swap עם דגל shielded. המערכת שלנו יוצרת כתובת הפקדה ייחודית וחד-פעמית עבור אותה העברה ספציפית.
2. **סליקה פנימית.** לאחר אישור, הכספים נעים בתוך [שכבת הנזילות המצרפית](/blog/understanding-crypto-liquidity-aggregation) שלנו.
3. **שלב התשלום.** עסקה on-chain נפרדת נשלחת לכתובת המקבל מכתובת תשלום שונה ללא קשר on-chain לכתובת ההפקדה.

## אינטגרציה: אותו מפתח, אותה קריאה, דגל אחד

\`\`\`json
POST /v1/swap
{
  "from": "BTC",
  "to": "USDT-TRC20",
  "amount": "0.05",
  "address": "T...",
  "shielded": true
}
\`\`\`

## ציות, לא הסתרה

ההעברות הפרטיות פועלות בתוך אותו היקף ציות כמו כל swap אחר בפלטפורמה. כל עסקה עוברת את אותו סינון AML / KYT אוטומטי בהפקדה, סליקה פנימית ותשלום.

| גישה | הפחתת מעקב חיצוני | עמדת ציות | סיכון בצד השותף |
|---|---|---|---|
| העברה ישירה ארנק-לארנק | אין | תואם | דליפת נתונים גבוהה |
| CoinJoin / מיקסרים | גבוה | סיכון סימון גבוה בבורסות | תפעולי + מוניטיני |
| מטבע פרטיות (XMR / ZEC) | גבוה מאוד | הוסר מרוב ה-CEX | סיכון נזילות |
| MRC Global Pay Private Transfer | משמעותי | יישור מלא MSB / FINTRAC | אין |

## מקרי שימוש

- זרימות אוצר ואיזון מחדש בין ארנקים חמים וקרים
- תשלומים לספקים, קבלנים ותורמים
- תכונות פרטיות צרכניות
- סליקות בין-תחומיות
- מילויי שולחן OTC

## איך מתחילים

אם אתם כבר משולבים, פנו למנהל החשבון שלכם להפעיל ניתוב מוגן על המפתח הקיים שלכם. שותפים חדשים יכולים [להגיש בקשה לגישת API](/partners). צרכנים יכולים להשתמש בתכונה ישירות דרך [טרמינל Private Transfer](/private-transfer) — ללא הרשמה.

לפירוט הטכני המלא, קראו את [הנייר הלבן של הארכיטקטורה המוגנת](/private-transfer/whitepaper).

אותו API. אותן עמלות. אותו ביצוע. טביעת on-chain שונה.`;

const CONTENT_UR = `آن چین شفافیت پبلک بلاک چینز کی ایک خصوصیت ہے — لیکن کاروباری اداروں کے لیے، یہ ایک کمزوری بھی ہے۔ ہر پارٹنر انٹیگریشن جو دو والیٹس کے درمیان براہ راست تصفیہ کرتا ہے، آپریشنل ڈیٹا لیک کرتا ہے: کاؤنٹر پارٹیز، ادائیگی کی تعدد، خزانہ بیلنس، اور سپلائر تعلقات۔ MRC Global Pay کی پرائیویٹ ٹرانسفرز — [پارٹنر API](/developers/api) اور صارف [Private Transfer ٹرمینل](/private-transfer) دونوں کے ذریعے دستیاب — انٹیگریشن ماڈل، فیسز، یا تعمیل کی پوزیشن کو تبدیل کیے بغیر آن چین پر پارٹنر ٹریفک کے ظاہر ہونے کا طریقہ تبدیل کرتی ہیں۔

یہ مکسر نہیں ہے۔ یہ پرائیویسی کوائن نہیں ہے۔ یہ ٹرانزیکشن لیئر پر لاگو روٹنگ ٹوپولوجی کی تبدیلی ہے، جو ہمارے [کینیڈین MSB فریم ورک](/about) (FINTRAC رجسٹریشن C100000015) کے ساتھ مکمل طور پر ہم آہنگ ہے۔

## پارٹنرز اصل میں کیا حاصل کرتے ہیں

پرائیویٹ ٹرانسفرز موجودہ swap اینڈ پوائنٹ پر ایک فلیگ کے طور پر فراہم کی جاتی ہیں۔ پارٹنرز وہی API کلید، وہی فیس ماڈل، اور وہی ایگزیکیوشن پاتھ استعمال کرتے ہیں۔

| صلاحیت | معیاری swap | پرائیویٹ ٹرانسفر |
|---|---|---|
| API کلید | ایک جیسی | ایک جیسی |
| اینڈ پوائنٹ | /v1/swap | /v1/swap (shielded فلیگ کے ساتھ) |
| فیس | معیاری | معیاری (کوئی پریمیم نہیں) |
| AML / KYT اسکریننگ | ہاں | ہاں (یکساں پائپ لائن) |
| اثاثہ کوریج | 6,000+ ٹوکنز | مکمل برابری |
| تصفیہ کا وقت | < 60 سیکنڈ | < 60 سیکنڈ |
| آن چین بھیجنے والا→وصول کنندہ لنک | براہ راست A → B | A → پول → B |

## 2026 میں آن چین شفافیت پارٹنر سائیڈ رسک کیوں ہے

پبلک بلاک چینز ہر کاؤنٹر پارٹی تعامل کو ظاہر کرتے ہیں۔ Chainalysis، TRM Labs، اور Elliptic جیسی فرموں نے اربوں پتوں کو کلسٹرز اور رویوں کے پروفائلز میں انڈیکس کیا ہے۔

- کسی بھی مرکزی ایکسچینج پر KYC ایونٹ جس کو والیٹ نے چھوا ہو
- بار بار ٹرانسفر پیٹرنز جو معلوم کاروباری ردھم سے میپ ہوتے ہیں
- ادائیگیوں، رفنڈز، یا خزانہ ری بیلنسنگ کے لیے پتوں کا دوبارہ استعمال

## شیلڈڈ روٹنگ کیسے کام کرتی ہے

ایک پرائیویٹ ٹرانسفر ٹرانزیکشن گراف کی ٹوپولوجی کو تبدیل کرتی ہے۔ بھیجنے والے سے وصول کنندہ تک ایک قابل مشاہدہ کنارے کے بجائے، ٹرانسفر کو دو آزاد آن چین ٹرانزیکشنز میں تقسیم کیا جاتا ہے۔

1. **ڈپازٹ مرحلہ۔** پارٹنر shielded فلیگ کے ساتھ swap کی درخواست کرتا ہے۔ ہمارا سسٹم اس مخصوص ٹرانسفر کے لیے ایک منفرد، ایک بار استعمال ہونے والا ڈپازٹ ایڈریس تیار کرتا ہے۔
2. **اندرونی تصفیہ۔** تصدیق کے بعد، فنڈز ہماری [مجموعی لیکویڈیٹی پرت](/blog/understanding-crypto-liquidity-aggregation) کے اندر منتقل ہوتے ہیں۔
3. **ادائیگی کا مرحلہ۔** ایک علیحدہ آن چین ٹرانزیکشن وصول کنندہ کے ایڈریس پر مختلف ادائیگی ایڈریس سے بھیجی جاتی ہے جس کا ڈپازٹ ایڈریس سے کوئی آن چین لنک نہیں ہے۔

## انٹیگریشن: وہی کلید، وہی کال، ایک فلیگ

\`\`\`json
POST /v1/swap
{
  "from": "BTC",
  "to": "USDT-TRC20",
  "amount": "0.05",
  "address": "T...",
  "shielded": true
}
\`\`\`

## تعمیل، چھپانا نہیں

پرائیویٹ ٹرانسفرز پلیٹ فارم پر ہر دوسری swap کی طرح ایک ہی تعمیل پیریمیٹر کے اندر کام کرتی ہیں۔

| نقطہ نظر | بیرونی ٹریس ایبلٹی میں کمی | تعمیل کی پوزیشن | پارٹنر سائیڈ رسک |
|---|---|---|---|
| براہ راست والیٹ ٹو والیٹ ٹرانسفر | کوئی نہیں | تعمیل شدہ | اعلی ڈیٹا لیکیج |
| CoinJoin / مکسرز | اعلی | ایکسچینجز پر اعلی فلیگنگ خطرہ | آپریشنل + ساکھ |
| پرائیویسی کوائن (XMR / ZEC) | بہت اعلی | زیادہ تر CEX سے ڈی لسٹ | لیکویڈیٹی خطرہ |
| MRC Global Pay Private Transfer | معنی خیز | مکمل MSB / FINTRAC ہم آہنگی | کوئی نہیں |

## استعمال کے کیسز

- گرم اور ٹھنڈے والیٹس کے درمیان خزانہ اور ری بیلنسنگ بہاؤ
- سپلائرز، ٹھیکیداروں، اور تعاون کنندگان کو ادائیگیاں
- صارف کی طرف رخ کرنے والی پرائیویسی فیچرز
- بین دائرہ اختیار تصفیے
- OTC ڈیسک فلز

## شروع کیسے کریں

اگر آپ پہلے سے انٹیگریٹڈ ہیں، تو اپنی موجودہ کلید پر شیلڈڈ روٹنگ کو فعال کرنے کے لیے اپنے اکاؤنٹ مینیجر سے رابطہ کریں۔ نئے پارٹنرز [API رسائی کے لیے درخواست دے سکتے ہیں](/partners)۔ صارفین براہ راست [Private Transfer ٹرمینل](/private-transfer) کے ذریعے فیچر استعمال کر سکتے ہیں — کوئی رجسٹریشن نہیں۔

مکمل تکنیکی تفصیل کے لیے، [شیلڈڈ آرکیٹیکچر وائٹ پیپر](/private-transfer/whitepaper) پڑھیں۔

وہی API۔ وہی فیس۔ وہی ایگزیکیوشن۔ ایک مختلف آن چین فٹ پرنٹ۔`;

const CONTENT_UK = `Прозорість on-chain — це особливість публічних блокчейнів, але для бізнесу це також вразливість. Кожна інтеграція партнера, яка розраховується безпосередньо між двома гаманцями, витікає операційні дані: контрагенти, частота платежів, баланси казначейства та відносини з постачальниками. Приватні перекази MRC Global Pay — доступні як через [Партнерський API](/developers/api), так і через споживчий термінал [Private Transfer](/private-transfer) — змінюють те, як трафік партнерів відображається on-chain, не змінюючи модель інтеграції, комісії або позицію відповідності.

Це не міксер. Це не приватна монета. Це зміна топології маршрутизації, що застосовується на рівні транзакції, повністю узгоджена з нашою [канадською структурою MSB](/about) (FINTRAC reg. C100000015).

## Що партнери дійсно отримують

Приватні перекази постачаються як прапорець на існуючій кінцевій точці swap. Партнери використовують той самий ключ API, ту саму модель комісій і той самий шлях виконання.

| Можливість | Стандартний swap | Приватний переказ |
|---|---|---|
| Ключ API | Однаковий | Однаковий |
| Кінцева точка | /v1/swap | /v1/swap (з прапорцем shielded) |
| Комісії | Стандартні | Стандартні (без премії) |
| Перевірка AML / KYT | Так | Так (ідентичний пайплайн) |
| Покриття активів | 6 000+ токенів | Повний паритет |
| Час розрахунку | < 60 секунд | < 60 секунд |
| On-chain зв'язок відправник→одержувач | Прямий A → B | A → пул → B |

## Чому on-chain прозорість є ризиком на стороні партнера у 2026 році

Публічні блокчейни розкривають кожну взаємодію з контрагентами. Такі компанії, як Chainalysis, TRM Labs та Elliptic, проіндексували мільярди адрес у кластери та поведінкові профілі.

- Подія KYC на будь-якій централізованій біржі, до якої торкався гаманець
- Повторювані шаблони переказів, що відображаються на відомий бізнес-ритм
- Повторне використання адрес для виплат, повернень або балансування казначейства

## Як працює захищена маршрутизація

Приватний переказ змінює топологію графа транзакцій. Замість єдиного спостережуваного ребра від відправника до одержувача, переказ розкладається на дві незалежні on-chain транзакції, об'єднані лише всередині нашої інфраструктури.

1. **Фаза депозиту.** Партнер запитує swap із прапорцем shielded. Наша система генерує унікальну, одноразову адресу депозиту для цього конкретного переказу.
2. **Внутрішній розрахунок.** Після підтвердження кошти переміщуються в межах нашого [агрегованого шару ліквідності](/blog/understanding-crypto-liquidity-aggregation).
3. **Фаза виплати.** Окрема on-chain транзакція надсилається на адресу одержувача з іншої адреси виплати, яка не має on-chain зв'язку з адресою депозиту.

## Інтеграція: той самий ключ, той самий виклик, один прапорець

\`\`\`json
POST /v1/swap
{
  "from": "BTC",
  "to": "USDT-TRC20",
  "amount": "0.05",
  "address": "T...",
  "shielded": true
}
\`\`\`

## Відповідність, а не приховування

Приватні перекази працюють у тому самому периметрі відповідності, що й будь-який інший swap на платформі. Кожна транзакція проходить ту саму автоматизовану перевірку AML / KYT при депозиті, внутрішньому розрахунку та виплаті.

| Підхід | Зменшення зовнішньої відстежуваності | Позиція відповідності | Ризик на стороні партнера |
|---|---|---|---|
| Прямий переказ гаманець-до-гаманця | Немає | Відповідає | Високий витік даних |
| CoinJoin / міксери | Високий | Високий ризик позначення на біржах | Операційний + репутаційний |
| Приватна монета (XMR / ZEC) | Дуже високий | Делистована на більшості CEX | Ризик ліквідності |
| MRC Global Pay Private Transfer | Значне | Повне узгодження MSB / FINTRAC | Немає |

## Випадки використання

- Потоки казначейства та ребалансування між гарячими та холодними гаманцями
- Виплати постачальникам, підрядникам та учасникам
- Функції конфіденційності, орієнтовані на споживача
- Розрахунки між юрисдикціями
- Заповнення OTC-столу

## Як почати

Якщо ви вже інтегровані, зверніться до свого менеджера облікового запису, щоб увімкнути захищену маршрутизацію на вашому існуючому ключі. Нові партнери можуть [подати заявку на доступ до API](/partners). Споживачі можуть використовувати функцію безпосередньо через [термінал Private Transfer](/private-transfer) — без реєстрації.

Для повної технічної розбивки прочитайте [Whitepaper захищеної архітектури](/private-transfer/whitepaper).

Той самий API. Ті самі комісії. Те саме виконання. Інший on-chain слід.`;

export const PARTNER_PRIVATE_TRANSFER_POST_EN: BlogPost = {
  slug: SLUG_EN,
  title: "Private Transfers for Partners: Shielded Routing via the MRC Global Pay API",
  metaTitle: "Private Transfers for Partners — MRC Global Pay API",
  metaDescription: "Add shielded routing to your integration with one flag. Same API key, same fees, full AML/KYT screening, no observable on-chain link between sender and recipient.",
  excerpt: "On-chain transparency is a partner-side liability. Private Transfers via the MRC Global Pay API change how transfers appear on-chain — same key, same fees, full AML compliance.",
  author: seedAuthors.sophiaRamirez,
  publishedAt: "2026-04-20",
  updatedAt: "2026-04-20",
  readTime: "11 min read",
  category: "Partner Authority",
  tags: ["Partner API", "Private Transfer", "Shielded Routing", "Compliance", "B2B", "MSB"],
  content: CONTENT_EN,
};

const baseMeta = {
  author: seedAuthors.sophiaRamirez,
  publishedAt: "2026-04-20",
  updatedAt: "2026-04-20",
  category: "Partner Authority",
  tags: ["Partner API", "Private Transfer", "Shielded Routing", "Compliance", "B2B"],
};

export const TRANSLATED_PARTNER_PRIVATE_TRANSFER_POSTS: Record<string, BlogPost> = {
  pt: {
    ...baseMeta,
    slug: "transferencias-privadas-para-parceiros-api",
    title: "Transferências Privadas para Parceiros: Roteamento Blindado via API da MRC Global Pay",
    metaTitle: "Transferências Privadas para Parceiros — API MRC Global Pay",
    metaDescription: "Adicione roteamento blindado à sua integração com uma flag. Mesma chave API, mesmas taxas, triagem AML/KYT completa, sem ligação on-chain observável.",
    excerpt: "A transparência on-chain é uma vulnerabilidade do lado do parceiro. As Transferências Privadas via API da MRC Global Pay mudam como os transfers aparecem on-chain — mesma chave, mesmas taxas, conformidade AML completa.",
    readTime: "11 min",
    content: CONTENT_PT,
  },
  es: {
    ...baseMeta,
    slug: "transferencias-privadas-para-socios-api",
    title: "Transferencias Privadas para Socios: Enrutamiento Blindado vía la API de MRC Global Pay",
    metaTitle: "Transferencias Privadas para Socios — API MRC Global Pay",
    metaDescription: "Añade enrutamiento blindado a tu integración con una bandera. Misma clave API, mismas tarifas, filtrado AML/KYT completo, sin enlace on-chain observable.",
    excerpt: "La transparencia on-chain es una vulnerabilidad del lado del socio. Las Transferencias Privadas vía la API de MRC Global Pay cambian cómo aparecen los transfers on-chain — misma clave, mismas tarifas, cumplimiento AML completo.",
    readTime: "11 min",
    content: CONTENT_ES,
  },
  fr: {
    ...baseMeta,
    slug: "transferts-prives-pour-partenaires-api",
    title: "Transferts Privés pour Partenaires : Routage Blindé via l'API MRC Global Pay",
    metaTitle: "Transferts Privés pour Partenaires — API MRC Global Pay",
    metaDescription: "Ajoutez le routage blindé à votre intégration avec un drapeau. Même clé API, mêmes frais, filtrage AML/KYT complet, sans lien on-chain observable.",
    excerpt: "La transparence on-chain est une vulnérabilité côté partenaire. Les Transferts Privés via l'API MRC Global Pay changent l'apparence on-chain des transferts — même clé, mêmes frais, conformité AML complète.",
    readTime: "11 min",
    content: CONTENT_FR,
  },
  ja: {
    ...baseMeta,
    slug: "private-transfers-for-partners-api",
    title: "パートナー向けプライベート送金：MRC Global Pay APIによるシールドルーティング",
    metaTitle: "パートナー向けプライベート送金 — MRC Global Pay API",
    metaDescription: "1つのフラグで統合にシールドルーティングを追加。同じAPIキー、同じ手数料、完全なAML/KYTスクリーニング、観測可能なオンチェーンリンクなし。",
    excerpt: "オンチェーンの透明性はパートナー側の脆弱性です。MRC Global Pay API経由のプライベート送金は、オンチェーン上での送金の見え方を変えます — 同じキー、同じ手数料、完全なAMLコンプライアンス。",
    readTime: "11分",
    content: CONTENT_JA,
  },
  tr: {
    ...baseMeta,
    slug: "ortaklar-icin-ozel-transferler-api",
    title: "Ortaklar için Özel Transferler: MRC Global Pay API ile Korumalı Yönlendirme",
    metaTitle: "Ortaklar için Özel Transferler — MRC Global Pay API",
    metaDescription: "Tek bir bayrakla entegrasyonunuza korumalı yönlendirme ekleyin. Aynı API anahtarı, aynı ücretler, tam AML/KYT taraması, gözlemlenebilir zincir üstü bağlantı yok.",
    excerpt: "Zincir üstü şeffaflık ortak tarafı için bir zafiyettir. MRC Global Pay API üzerinden Özel Transferler, transferlerin zincir üstünde nasıl göründüğünü değiştirir.",
    readTime: "11 dk",
    content: CONTENT_TR,
  },
  hi: {
    ...baseMeta,
    slug: "private-transfers-for-partners-api",
    title: "पार्टनरों के लिए निजी ट्रांसफर: MRC Global Pay API द्वारा शील्डेड रूटिंग",
    metaTitle: "पार्टनरों के लिए निजी ट्रांसफर — MRC Global Pay API",
    metaDescription: "एक फ्लैग के साथ अपने एकीकरण में शील्डेड रूटिंग जोड़ें। समान API कुंजी, समान शुल्क, पूर्ण AML/KYT स्क्रीनिंग, कोई अवलोकनीय ऑन-चेन लिंक नहीं।",
    excerpt: "ऑन-चेन पारदर्शिता पार्टनर-साइड भेद्यता है। MRC Global Pay API के माध्यम से निजी ट्रांसफर बदलते हैं कि ऑन-चेन पर ट्रांसफर कैसे दिखते हैं।",
    readTime: "11 मिनट",
    content: CONTENT_HI,
  },
  vi: {
    ...baseMeta,
    slug: "chuyen-tien-rieng-tu-cho-doi-tac-api",
    title: "Chuyển Tiền Riêng Tư Cho Đối Tác: Định Tuyến Bảo Vệ Qua API MRC Global Pay",
    metaTitle: "Chuyển Tiền Riêng Tư Cho Đối Tác — API MRC Global Pay",
    metaDescription: "Thêm định tuyến bảo vệ vào tích hợp của bạn với một cờ. Cùng khóa API, cùng phí, sàng lọc AML/KYT đầy đủ, không có liên kết on-chain quan sát được.",
    excerpt: "Tính minh bạch on-chain là lỗ hổng phía đối tác. Private Transfers qua API MRC Global Pay thay đổi cách xuất hiện on-chain của các khoản chuyển — cùng khóa, cùng phí, tuân thủ AML đầy đủ.",
    readTime: "11 phút",
    content: CONTENT_VI,
  },
  af: {
    ...baseMeta,
    slug: "privaat-oordragte-vir-vennote-api",
    title: "Privaat Oordragte vir Vennote: Beskermde Roetering via die MRC Global Pay API",
    metaTitle: "Privaat Oordragte vir Vennote — MRC Global Pay API",
    metaDescription: "Voeg beskermde roetering by jou integrasie met een vlag. Dieselfde API-sleutel, dieselfde fooie, volledige AML/KYT-sifting, geen waarneembare on-chain skakel nie.",
    excerpt: "On-chain deursigtigheid is 'n vennoot-kant kwesbaarheid. Privaat Oordragte via die MRC Global Pay API verander hoe oordragte on-chain verskyn.",
    readTime: "11 min",
    content: CONTENT_AF,
  },
  fa: {
    ...baseMeta,
    slug: "private-transfers-for-partners-api",
    title: "انتقال‌های خصوصی برای شرکا: مسیریابی محافظت‌شده از طریق API MRC Global Pay",
    metaTitle: "انتقال‌های خصوصی برای شرکا — API MRC Global Pay",
    metaDescription: "با یک پرچم، مسیریابی محافظت‌شده را به یکپارچه‌سازی خود اضافه کنید. همان کلید API، همان کارمزدها، غربالگری کامل AML/KYT، بدون پیوند آن‌چین قابل مشاهده.",
    excerpt: "شفافیت آن‌چین یک آسیب‌پذیری سمت شریک است. انتقال‌های خصوصی از طریق API MRC Global Pay نحوه ظاهر شدن انتقال‌ها در آن‌چین را تغییر می‌دهد.",
    readTime: "11 دقیقه",
    content: CONTENT_FA,
  },
  he: {
    ...baseMeta,
    slug: "private-transfers-for-partners-api",
    title: "העברות פרטיות לשותפים: ניתוב מוגן דרך ה-API של MRC Global Pay",
    metaTitle: "העברות פרטיות לשותפים — MRC Global Pay API",
    metaDescription: "הוסיפו ניתוב מוגן לאינטגרציה שלכם עם דגל אחד. אותו מפתח API, אותן עמלות, סינון AML/KYT מלא, ללא קישור on-chain נצפה.",
    excerpt: "שקיפות on-chain היא פגיעות בצד השותף. העברות פרטיות דרך ה-API של MRC Global Pay משנות את האופן שבו ההעברות מופיעות on-chain.",
    readTime: "11 דקות",
    content: CONTENT_HE,
  },
  ur: {
    ...baseMeta,
    slug: "private-transfers-for-partners-api",
    title: "پارٹنرز کے لیے پرائیویٹ ٹرانسفرز: MRC Global Pay API کے ذریعے شیلڈڈ روٹنگ",
    metaTitle: "پارٹنرز کے لیے پرائیویٹ ٹرانسفرز — MRC Global Pay API",
    metaDescription: "ایک فلیگ کے ساتھ اپنی انٹیگریشن میں شیلڈڈ روٹنگ شامل کریں۔ وہی API کلید، وہی فیس، مکمل AML/KYT اسکریننگ، کوئی قابل مشاہدہ آن چین لنک نہیں۔",
    excerpt: "آن چین شفافیت پارٹنر سائیڈ کمزوری ہے۔ MRC Global Pay API کے ذریعے پرائیویٹ ٹرانسفرز تبدیل کرتی ہیں کہ آن چین پر ٹرانسفرز کیسے ظاہر ہوتے ہیں۔",
    readTime: "11 منٹ",
    content: CONTENT_UR,
  },
  uk: {
    ...baseMeta,
    slug: "pryvatni-perekazy-dlya-partneriv-api",
    title: "Приватні Перекази для Партнерів: Захищена Маршрутизація через API MRC Global Pay",
    metaTitle: "Приватні Перекази для Партнерів — API MRC Global Pay",
    metaDescription: "Додайте захищену маршрутизацію до своєї інтеграції одним прапорцем. Той самий ключ API, ті самі комісії, повна перевірка AML/KYT, без видимого on-chain зв'язку.",
    excerpt: "Прозорість on-chain — це вразливість на стороні партнера. Приватні перекази через API MRC Global Pay змінюють те, як перекази виглядають on-chain.",
    readTime: "11 хв",
    content: CONTENT_UK,
  },
};
