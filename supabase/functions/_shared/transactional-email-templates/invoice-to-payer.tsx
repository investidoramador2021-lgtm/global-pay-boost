import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "MRC Global Pay"
const SITE_URL = "https://mrcglobalpay.com"

interface InvoiceToPayerProps {
  payerName?: string
  requesterName?: string
  fiatAmount?: string
  fiatCurrency?: string
  cryptoAmount?: string
  cryptoTicker?: string
  serviceFeePercent?: string
  serviceFeeAmount?: string
  netCryptoAmount?: string
  invoiceId?: string
  payUrl?: string
  statusUrl?: string
  expiresAt?: string
  language?: string
}

const InvoiceToPayerEmail = ({
  payerName = 'Client',
  requesterName = '',
  fiatAmount = '0',
  fiatCurrency = 'USD',
  cryptoAmount = '0',
  cryptoTicker = 'BTC',
  serviceFeePercent = '1.5',
  serviceFeeAmount = '0',
  netCryptoAmount = '0',
  invoiceId = '',
  payUrl = '',
  statusUrl = '',
  expiresAt = '',
  language = 'en',
}: InvoiceToPayerProps) => (
  <Html lang={language} dir={['fa', 'ur', 'he'].includes(language) ? 'rtl' : 'ltr'}>
    <Head />
    <Preview>Invoice #{invoiceId} — {fiatAmount} {fiatCurrency} — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logoText}>{SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>Invoice #{invoiceId}</Heading>

        <Text style={text}>
          Hello {payerName},
        </Text>
        <Text style={text}>
          {requesterName} has issued you an invoice via {SITE_NAME}. Please review the
          details below and complete your payment before the rate expires.
        </Text>

        <Section style={detailsCard}>
          <Text style={detailLabel}>Invoice ID</Text>
          <Text style={detailValue}>{invoiceId}</Text>

          <Hr style={divider} />

          <Text style={detailLabel}>Requested Amount</Text>
          <Text style={detailValue}>
            {fiatAmount} {fiatCurrency} ≈ {cryptoAmount} {cryptoTicker}
          </Text>

          <Hr style={divider} />

          <Text style={detailLabel}>Service Fee ({serviceFeePercent}%)</Text>
          <Text style={feeValue}>−{serviceFeeAmount} {cryptoTicker}</Text>
          <Text style={feeNote}>Deducted from final settlement</Text>

          <Hr style={divider} />

          <Text style={detailLabel}>Receiver Gets</Text>
          <Text style={netValue}>{netCryptoAmount} {cryptoTicker}</Text>

          <Hr style={divider} />

          <Text style={detailLabel}>Issued By</Text>
          <Text style={detailValue}>{requesterName}</Text>

          <Hr style={divider} />

          <Text style={detailLabel}>Rate Lock Expires</Text>
          <Text style={expiryValue}>{expiresAt || '7 days from issue'}</Text>
        </Section>

        <Section style={ctaSection}>
          <Button style={payButton} href={payUrl}>
            Pay Now
          </Button>
        </Section>

        <Section style={trackingSection}>
          <Text style={trackingText}>
            Track the status of this invoice:{' '}
            <Link href={statusUrl} style={trackingLink}>View Status</Link>
          </Text>
        </Section>

        <Section style={noticeSection}>
          <Text style={noticeTitle}>Important</Text>
          <Text style={noticeText}>
            • This invoice is valid for 168 hours (7 days) from the time of issue.{'\n'}
            • The exchange rate is locked for the duration of this invoice.{'\n'}
            • Cryptocurrency transactions are irreversible. Please verify all details before paying.{'\n'}
            • After payment, both you and the requester will receive confirmation receipts.
          </Text>
        </Section>

        <Section style={taxSection}>
          <Text style={taxText}>
            MRC GlobalPay does not withhold taxes. Local tax liabilities are the sole responsibility of the client.
          </Text>
        </Section>

        <Hr style={footerDivider} />

        <Text style={footer}>
          This is an automated invoice from {SITE_NAME}. Do not reply to this email.
          For assistance, visit{' '}
          <Link href={SITE_URL} style={footerLink}>{SITE_URL}</Link>.
        </Text>
        <Text style={footerDisclaimer}>
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: InvoiceToPayerEmail,
  subject: (data: Record<string, any>) =>
    `Invoice #${data.invoiceId || ''} — ${data.fiatAmount || ''} ${data.fiatCurrency || 'USD'} — MRC Global Pay`,
  displayName: 'Invoice to Payer',
  previewData: {
    payerName: 'John Smith',
    requesterName: 'Jane Doe',
    fiatAmount: '500.00',
    fiatCurrency: 'USD',
    cryptoAmount: '0.00512',
    cryptoTicker: 'BTC',
    serviceFeePercent: '0.5',
    serviceFeeAmount: '0.0000256',
    netCryptoAmount: '0.0050944',
    invoiceId: 'INV-M1X2Y3-AB4C',
    payUrl: 'https://mrcglobalpay.com/pay/abc123',
    statusUrl: 'https://mrcglobalpay.com/status/abc123',
    expiresAt: 'January 20, 2026',
  },
} satisfies TemplateEntry

/* ── Styles ── */
const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }
const container = { maxWidth: '580px', margin: '0 auto', padding: '30px 25px' }
const headerSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logoText = { fontSize: '22px', fontWeight: '700' as const, color: '#0fa968', margin: '0', letterSpacing: '-0.3px' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#1a1a2e', margin: '0 0 16px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#4a4a5a', lineHeight: '1.6', margin: '0 0 12px' }
const detailsCard = { backgroundColor: '#f8faf9', borderRadius: '12px', padding: '20px 24px', border: '1px solid #e8ece9', marginBottom: '24px' }
const detailLabel = { fontSize: '12px', fontWeight: '600' as const, color: '#7a7a8a', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '0 0 4px' }
const detailValue = { fontSize: '16px', fontWeight: '600' as const, color: '#1a1a2e', margin: '0' }
const feeValue = { fontSize: '14px', fontWeight: '600' as const, color: '#c0392b', margin: '0' }
const feeNote = { fontSize: '11px', color: '#999', fontStyle: 'italic' as const, margin: '2px 0 0' }
const netValue = { fontSize: '16px', fontWeight: '700' as const, color: '#0fa968', margin: '0' }
const expiryValue = { fontSize: '14px', fontWeight: '600' as const, color: '#b8860b', margin: '0' }
const divider = { borderColor: '#e8ece9', margin: '14px 0' }
const ctaSection = { textAlign: 'center' as const, marginBottom: '20px' }
const payButton = { backgroundColor: '#0fa968', color: '#ffffff', fontSize: '16px', fontWeight: '700' as const, padding: '14px 40px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }
const trackingSection = { textAlign: 'center' as const, marginBottom: '24px' }
const trackingText = { fontSize: '13px', color: '#7a7a8a', margin: '0' }
const trackingLink = { color: '#0fa968', textDecoration: 'underline' }
const noticeSection = { backgroundColor: '#fffbf0', borderRadius: '10px', padding: '16px 20px', border: '1px solid #f0e6cc', marginBottom: '16px' }
const noticeTitle = { fontSize: '14px', fontWeight: '600' as const, color: '#8a6d20', margin: '0 0 8px' }
const noticeText = { fontSize: '13px', color: '#6b5a2a', lineHeight: '1.7', margin: '0', whiteSpace: 'pre-line' as const }
const taxSection = { backgroundColor: '#f5f5f5', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px' }
const taxText = { fontSize: '11px', color: '#888', margin: '0', fontStyle: 'italic' as const, textAlign: 'center' as const }
const footerDivider = { borderColor: '#e8ece9', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', lineHeight: '1.5', margin: '0 0 8px', textAlign: 'center' as const }
const footerLink = { color: '#0fa968', textDecoration: 'underline' }
const footerDisclaimer = { fontSize: '11px', color: '#b0b0b0', lineHeight: '1.5', margin: '0', textAlign: 'center' as const }