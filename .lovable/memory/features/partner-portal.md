---
name: Institutional Partner Portal
description: /partner-portal with TOTP 2FA, API key management (full backend), transaction monitor, 30-min idle timeout
type: feature
---
- Route: `/partner-portal` (standalone, not under LangLayout — own auth flow)
- Auth: Email/password registration → mandatory TOTP 2FA setup → challenge on every login
- Edge functions: `partner-totp` (setup/verify/status), `partner-api-keys` (generate/list/update/revoke)
- DB tables: `partner_api_keys` (with hashed secrets, webhook_url, ip_whitelist), `partner_totp_secrets` (with backup codes)
- Design: "Deep Obsidian" theme (#0B0D10 bg), 0.5px silver borders, 20px backdrop-blur, monospace code blocks
- Dashboard KPIs: Network Volume, Accrued Commission, Conversion Rate, Active API Keys
- Transaction Monitor: expandable rows with raw metadata
- 30-minute idle session timeout with auto-signout
- Localized across all 13 languages
- noindex/nofollow meta tags (private route)
