# Enterprise Architecture & AI Agent Operating Guidelines

> **CRITICAL DIRECTIVE FOR ALL AI AGENTS & DEVELOPERS ACROSS ALL PLATFORMS**  
> Read this document first before writing code, proposing architectures, or modifying files in this ecosystem.

---

## 1. Ecosystem Overview & Mission
This ecosystem represents a tier-1 **Production Financial Technology & Identity Intelligence Platform** engineered by **ITFreeSource Academy**. It serves as:
1. A reference architecture for enterprise financial microservices (Java 21, Spring Boot 3.3.x, gRPC, Protobuf, Kafka, PostgreSQL, MongoDB, Redis).
2. Live portfolio validation for **Senior Software Engineer / Distributed Systems** roles (specifically for **Callsign**, Tier-1 Banking, and UAE FinTech markets).
3. A commercial-grade blueprint for commercial B2B surveillance/AML and developer training.

---

## 2. Microservices Enterprise Topology

Each microservice is an independent repository designed according to real-world domain-driven boundaries:

| Enterprise Repository Name | Protocol & Tech Stack | Core Business Capability |
| :--- | :--- | :--- |
| **`fintech-contracts-grpc-dto`** | Protobuf 3, gRPC Stubs, Maven JAR | Shared contracts, DTOs, `.proto` schemas, and MDC logging filters. |
| **`fintech-api-gateway`** | Spring Cloud Gateway (Port 8080) | Edge routing, Rate limiting (Token Bucket), `X-Correlation-ID` tracing. |
| **`fintech-iam-auth-service`** | REST, OAuth2, OIDC (Port 8081) | Identity & Access Management, Callsign-style Step-Up MFA, Redis tokens. |
| **`fintech-core-banking-ledger`** | REST, JPA, Postgres (Port 8082) | Double-Entry ledger, multi-currency wallets, SBI Auto-Sweep engine. |
| **`fintech-aml-surveillance-service`** | REST (XML/JSON), Postgres (Port 8083) | Dual XML/JSON Work Items, FIU-IND (₹10L) & CBUAE (AED 55k) rules. |
| **`fintech-order-payment-orchestrator`** | REST + Kafka Producer (Port 8084) | Payment processor with `Idempotency-Key` defense & event streaming. |
| **`fintech-fulfillment-grpc-engine`** | **gRPC & Protocol Buffers** (Port 9090) | High-performance internal order fulfillment over binary HTTP/2. |
| **`fintech-enterprise-pricing-service`** | REST, Postgres, Mongo (Port 8085) | B2B tiered contracts, volume discounts, and enterprise margins. |
| **`fintech-reconciliation-stream-batch`** | Java 21 Virtual Threads (Port 8086) | 100K+ record reconciliation benchmark between NoSQL and Postgres (<30s). |
| **`fintech-commission-settlement-batch`** | Spring Batch (Port 8087) | Chunk-based high-volume commission splits and tax deduction pipeline. |
| **`fintech-webhook-dispatch-service`** | REST + Kafka DLQ (Port 8088) | Outbound webhooks, HMAC-SHA256 signatures, Dead-Letter Queue replay. |
| **`fintech-portal-web`** | React 18 + Vite SPA (Port 3001) | Dark Slate enterprise management cockpit. |
| **`fintech-devops-orchestration`** | Docker Compose & K8s | Multi-container local mesh and cloud deployment manifests. |

---

## 3. Mandatory Compliance & Non-Negotiable Rules

> [!CAUTION]
> **STRICT INTELLECTUAL PROPERTY & COMPLIANCE GUARD**:
> - **ABSOLUTE BAN ON LCTR**: Under NO circumstances should any code, documentation, test, or commit reference or implement "LCTR" (Large Cash Transaction Report) or unreleased proprietary concepts from NICE Actimize.
> - **USE PUBLIC STATUTES ONLY**: All regulatory features must strictly cite and implement published public-domain statutory rules:
>   - **FIU-IND (India)**: Prevention of Money Laundering Act (PMLA) ₹10 Lakh Cash Transaction Report (CTR) & ₹50,000 PAN mandate.
>   - **CBUAE (UAE)**: Central Bank of the UAE goAML statutory thresholds (AED 55,000 cash threshold, PEP screening).
>   - **AUSTRAC (Australia)**: Public threshold transaction rules ($10,000 AUD).
> - **COMMITS ARE BLOCKED ON VIOLATIONS**: The local pre-commit hook automatically scans for prohibited proprietary terms and blocks commits if detected.

---

## 4. Architectural Design Rules for Code Generation

1. **Protocol Separation**:
   - External client traffic MUST use REST APIs through `fintech-api-gateway`.
   - Internal high-throughput service communication between payment orchestration and order fulfillment MUST use **gRPC with Protocol Buffers** (`.proto`).
2. **Idempotency Defense**:
   - Every state-modifying payment or ledger transaction MUST require an `Idempotency-Key` header and use Redis atomic sets with database unique fallback constraints.
3. **Observability & Context Propagation**:
   - Every inbound request MUST receive or preserve `X-Correlation-ID`.
   - Correlation IDs MUST be propagated into Log4j2/SLF4J `MDC` and forwarded across downstream HTTP headers and Kafka record headers.
4. **Concurrency & Thread Safety**:
   - Use Java 21 Virtual Threads (`Executors.newVirtualThreadPerTaskExecutor()`) for high-concurrency I/O bound tasks.
   - Never use `synchronized` with blocking I/O (to prevent thread pinning); use `ReentrantLock` or `CompletableFuture`.
5. **Quality Gates**:
   - Maintain unit tests using JUnit 5 and Mockito.
   - Code coverage target is strictly $\ge 90\%$ (JaCoCo).

---

## 5. How Any New AI Agent or Engineer Should Resume Work

1. Read this file to understand the architecture and compliance boundaries.
2. Open the interview dashboard at [`callsign-senior-interview-prep-dashboard.html`](../callsign-senior-interview-prep-dashboard.html) for system design, LLD patterns, and technical cheat-sheets.
3. When authoring code in any microservice, verify that all dependencies are resolved via `fintech-contracts-grpc-dto` or standard Spring Boot starters.
4. Run `./mvnw test` before committing.
