# AI Agent Engineering Rules & Guardrails

All AI coding assistants (Antigravity, Claude, Copilot, ChatGPT) must strictly abide by these rules:

1. **NO PROPRIETARY IP**: Never write code referencing unreleased products, internal company acronyms, or non-public specifications (especially LCTR). Use FIU-IND, CBUAE, or AUSTRAC public statutory rules instead.
2. **JAVA 21 & SPRING BOOT 3.3**: Never use legacy Java 7/8 syntax (e.g. raw types, synchronized blocking). Use Java 21 features (records, pattern matching for switch, Virtual Threads, sealed classes).
3. **STRONG TYPING & ENVELOPES**: All REST endpoints must return `ResponseEntity<ApiResponse<T>>` with standardized timestamp, correlationId, success, and data fields.
4. **NO HARDCODED SECRETS**: Never commit API keys, private tokens, or passwords to git. Use environment variables or Spring application properties.
5. **IDEMPOTENCY**: State-mutating POST/PUT endpoints must support the `Idempotency-Key` HTTP header.
