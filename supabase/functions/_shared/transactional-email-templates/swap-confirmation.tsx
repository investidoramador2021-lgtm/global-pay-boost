import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "MRC Global Pay"
const SITE_URL = "https://mrcglobalpay.com"

interface SwapConfirmationProps {
  transactionId?: string
  fromAmount?: string
  fromCurrency?: string
  toCurrency?: string
  recipientAddress?: string
  depositAddress?: string
}

const SwapConfirmationEmail = ({
  transactionId = '',
  fromAmount = '',
  fromCurrency = '',
  toCurrency = '',
  recipientAddress = '',
  depositAddress = '',
}: SwapConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {fromCurrency?.toUpperCase()} → {toCurrency?.toUpperCase()} exchange has been created — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={headerSection}>
          <Text style={logoText}>{SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>Exchange Created Successfully</Heading>

        <Text style={text}>
          Thank you for choosing {SITE_NAME}. Your cryptocurrency exchange has been
          initiated and is now awaiting your deposit. Please find the details of
          your transaction below.
        </Text>

        {/* Transaction Details */}
        <Section style={detailsCard}>
          <Text style={detailLabel}>Transaction ID</Text>
          <Text style={detailValue}>{transactionId || '—'}</Text>

          <Hr style={divider} />

          <Text style={detailLabel}>Exchange Pair</Text>
          <Text style={detailValue}>
            {fromAmount} {fromCurrency?.toUpperCase()} → {toCurrency?.toUpperCase()}
          </Text>

          <Hr style={divider} />

          <Text style={detailLabel}>Deposit Address</Text>
          <Text style={addressValue}>{depositAddress || '—'}</Text>

          <Hr style={divider} />

          <Text style={detailLabel}>Recipient Address</Text>
          <Text style={addressValue}>{recipientAddress || '—'}</Text>
        </Section>

        {/* CTA */}
        <Section style={ctaSection}>
          <Button style={button} href={SITE_URL}>
            Track Your Exchange
          </Button>
        </Section>

        {/* Important Notice */}
        <Section style={noticeSection}>
          <Text style={noticeTitle}>Important Information</Text>
          <Text style={noticeText}>
            • Please send the exact deposit amount to the address shown above.{'\n'}
            • Your exchange will be processed automatically once the deposit is confirmed on the blockchain.{'\n'}
            • Processing times vary depending on network congestion and the currencies involved.{'\n'}
            • If you have any questions, please visit our website or contact our support team.
          </Text>
        </Section>

        <Hr style={footerDivider} />

        {/* Footer */}
        <Text style={footer}>
          This is an automated confirmation from {SITE_NAME}. Please do not reply
          to this email. For assistance, visit{' '}
          <Link href={SITE_URL} style={footerLink}>{SITE_URL}</Link>.
        </Text>
        <Text style={footerDisclaimer}>
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.{'\n'}
          Cryptocurrency transactions are irreversible. Please verify all details
          before sending funds.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SwapConfirmationEmail,
  subject: (data: Record<string, any>) =>
    `Exchange Created: ${(data.fromCurrency || '').toUpperCase()} → ${(data.toCurrency || '').toUpperCase()} — MRC Global Pay`,
  displayName: 'Swap confirmation',
  previewData: {
    transactionId: 'abc123def456',
    fromAmount: '0.5',
    fromCurrency: 'btc',
    toCurrency: 'eth',
    recipientAddress: '0x1234...abcd',
    depositAddress: 'bc1q...xyz9',
  },
} satisfies TemplateEntry

/* ── Styles ── */

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
}

const container = {
  maxWidth: '580px',
  margin: '0 auto',
  padding: '30px 25px',
}

const headerSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const logoText = {
  fontSize: '22px',
  fontWeight: '700' as const,
  color: '#0fa968',
  margin: '0',
  letterSpacing: '-0.3px',
}

const h1 = {
  fontSize: '24px',
  fontWeight: '700' as const,
  color: '#1a1a2e',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const text = {
  fontSize: '15px',
  color: '#4a4a5a',
  lineHeight: '1.6',
  margin: '0 0 24px',
}

const detailsCard = {
  backgroundColor: '#f8faf9',
  borderRadius: '12px',
  padding: '20px 24px',
  border: '1px solid #e8ece9',
  marginBottom: '24px',
}

const detailLabel = {
  fontSize: '12px',
  fontWeight: '600' as const,
  color: '#7a7a8a',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
}

const detailValue = {
  fontSize: '16px',
  fontWeight: '600' as const,
  color: '#1a1a2e',
  margin: '0 0 0',
}

const addressValue = {
  fontSize: '13px',
  fontWeight: '500' as const,
  color: '#1a1a2e',
  margin: '0',
  wordBreak: 'break-all' as const,
  fontFamily: "'Roboto Mono', monospace",
}

const divider = {
  borderColor: '#e8ece9',
  margin: '14px 0',
}

const ctaSection = {
  textAlign: 'center' as const,
  marginBottom: '28px',
}

const button = {
  backgroundColor: '#0fa968',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  padding: '12px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
}

const noticeSection = {
  backgroundColor: '#fffbf0',
  borderRadius: '10px',
  padding: '16px 20px',
  border: '1px solid #f0e6cc',
  marginBottom: '24px',
}

const noticeTitle = {
  fontSize: '14px',
  fontWeight: '600' as const,
  color: '#8a6d20',
  margin: '0 0 8px',
}

const noticeText = {
  fontSize: '13px',
  color: '#6b5a2a',
  lineHeight: '1.7',
  margin: '0',
  whiteSpace: 'pre-line' as const,
}

const footerDivider = {
  borderColor: '#e8ece9',
  margin: '24px 0',
}

const footer = {
  fontSize: '12px',
  color: '#999999',
  lineHeight: '1.5',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}

const footerLink = {
  color: '#0fa968',
  textDecoration: 'underline',
}

const footerDisclaimer = {
  fontSize: '11px',
  color: '#b0b0b0',
  lineHeight: '1.5',
  margin: '0',
  textAlign: 'center' as const,
  whiteSpace: 'pre-line' as const,
}
