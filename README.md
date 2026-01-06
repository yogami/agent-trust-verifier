## 🛑 ARCHITECTURAL ANCHOR
This project is part of the **Berlin AI Automation Studio**. 
It is governed by the global rules in **[berlin-ai-infra](https://github.com/yogami/berlin-ai-infra)**.

**Setup for new laptops:**
1. Clone this repo.
2. Run `./bootstrap-infra.sh` to link to the global Master Brain.

---

# Agent Trust Verifier (DID/VC System)

Decentralized identity and trust verification system for AI agents.

## 🚀 Part of Multi-Agent Communication Suite (App 2 of 5)

### Features
- **DID Resolution**: Resolve and verify `did:web` identities
- **Verifiable Credentials**: Issue and verify JWT-based VCs
- **Trust Scoring**: Track and update agent trust scores
- **Clean Architecture**: Domain-driven design
- **Tembo Database**: Postgres-backed persistence

### Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Prisma 7 + Postgres Adapter
- Tembo (Postgres)
- Jose (JWT/VC Signing)
- Vitest + Playwright

### Quick Start

```bash
npm install
npx prisma generate
npm run dev
```

### API Endpoints

- `POST /api/verify-agent` - Verify or register an agent DID
- `POST /api/vc/issue` - Issue a Verified Credential
- `POST /api/vc/verify` - Verify a Credential validity

### Environment Variables

Copy `.env.example` to `.env`:
- `DATABASE_URL`: Tembo Postgres connection string
- `DID_PRIVATE_KEY`: Hex-encoded private key for signing

### Testing

```bash
npm test              # Unit tests
npm run test:e2e      # E2E tests
```

### License

MIT
