# ATF Compliance Mapping: Agent Trust Verifier

> **Agentic Trust Framework Element**: 🔐 **Element 1 — Identity ("Who are you?")**
> **ATF Spec**: [github.com/massivescale-ai/agentic-trust-framework](https://github.com/massivescale-ai/agentic-trust-framework)

## ATF Identity Requirements → Implementation

| ATF Requirement | ATF Description | Implementation Status |
|:---|:---|:---|
| **Unique Identifier** | Globally unique, immutable identifier for each agent instance | ✅ `did:web` identifiers per agent |
| **Credential Binding** | Agent identity bound to cryptographic credentials | ✅ JWT-VC signing with `jose` library |
| **Ownership Chain** | Clear documentation of ownership and operational responsibility | ✅ DID Document includes controller field |
| **Purpose Declaration** | Documented intended use and operational scope | 🟡 Extensible via VC claims |
| **Capability Manifest** | Machine-readable list of claimed agent capabilities | 🟡 Extensible via VC claims |

## ATF Maturity Level Support

| Agent Level | Supported | How |
|:---|:---|:---|
| **Intern** | ✅ | Basic DID resolution + read-only verification |
| **Junior** | ✅ | JWT-based auth with role assignment |
| **Senior** | ✅ | Full VC issuance + verification + trust scoring |
| **Principal** | 🟡 | Requires OAuth2/OIDC extension (planned) |

## API Endpoints Mapped to ATF

| Endpoint | ATF Function |
|:---|:---|
| `POST /api/verify-agent` | Identity verification & DID registration |
| `POST /api/vc/issue` | Credential binding — issue Verifiable Credential |
| `POST /api/vc/verify` | Credential validation — verify VC authenticity |

## Tech Stack
- **DID Method**: `did:web` (W3C standard)
- **Credential Format**: JWT-VC (JSON Web Token Verifiable Credentials)
- **Signing**: `jose` library (ES256)
- **Persistence**: Prisma + PostgreSQL
- **Testing**: Vitest (unit) + Playwright (E2E)

---

*Berlin AI Labs — ATF Reference Implementation*
*[Cloud Security Alliance Agentic Trust Framework](https://cloudsecurityalliance.org/blog/2026/02/02/the-agentic-trust-framework-zero-trust-governance-for-ai-agents)*
