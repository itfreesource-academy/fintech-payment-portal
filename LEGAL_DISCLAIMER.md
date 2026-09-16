# LEGAL DISCLAIMER, STATUTORY CITATIONS & TERMS OF USE

**Effective Date:** January 1, 2026  
**Publisher:** ITFreeSource Academy (`https://github.com/itfreesource-academy`)  
**Repository:** `itfreesource-academy-fintech-platform`

---

## ⚠️ 1. EDUCATIONAL & ACADEMIC RESEARCH PURPOSES ONLY

> ### IMPORTANT LEGAL NOTICE:
> **This software repository, including all accompanying source code, microservices, front-end interfaces, documentation, and mock data fixtures, is developed SOLELY AND EXCLUSIVELY FOR EDUCATIONAL, PEDAGOGICAL, ACADEMIC RESEARCH, AND SOFTWARE TEST AUTOMATION BENCHMARKING PURPOSES.**
>
> **UNDER NO CIRCUMSTANCES SHOULD THIS SOFTWARE BE USED AS A REAL-WORLD PRODUCTION BANKING SYSTEM, REAL FINANCIAL LEDGER, REAL INSURANCE UNDERWRITING PLATFORM, OR LIVE STATUTORY REPORTING MECHANISM.**

---

## ⚖️ 2. NO FINANCIAL, LEGAL, REGULATORY, OR TAX ADVICE

1. **Not a Financial Institution**:  
   Neither **ITFreeSource Academy**, nor any contributors, maintainers, or affiliated authors are licensed banks, non-banking financial companies (NBFCs), payment system operators (PSOs), payment aggregators (PAs), insurance companies, actuarial firms, legal advisors, or registered financial institutions under the Reserve Bank of India (RBI), Central Bank of the UAE (CBUAE), Australian Transaction Reports and Analysis Centre (AUSTRAC), or any other regulatory jurisdiction.

2. **No Fiduciary Relationship**:  
   Accessing, cloning, viewing, deploying, or testing this repository does not create any financial, legal, advisory, consulting, fiduciary, or attorney-client relationship between you (the user) and the authors.

3. **No Financial Transactions**:  
   The application does not process, hold, settle, transfer, custody, or transmit real fiat currency, legal tender, digital rupees, central bank digital currencies (CBDC), cryptocurrencies, or securities of any kind. All ledger entries, wallet balances, exchange rates, claims, and policies are purely simulated in-memory variables.

---

## 🔒 3. SYNTHETIC DATA & ZERO REAL PERSONALLY IDENTIFIABLE INFORMATION (PII)

1. **100% Synthetic Personas**:  
   All individual names (e.g., "Vikram Sharma", "Julian Sterling", "Maya Lin", "Vladimir Voronov", "Sarah Chen"), addresses, telephone numbers, emails, and identifiers used across this platform are **100% fictional test fixtures** created for automated unit and integration testing. Any resemblance to actual persons, living or deceased, businesses, or actual events is purely coincidental.

2. **Fictitious Document Numbers**:  
   - All Aadhaar numbers (e.g., `XXXX-XXXX-9821`), Permanent Account Numbers (e.g., `ABCPS8921F`), Driving License numbers, and Passport numbers are mathematically generated mock strings.
   - None of these numbers correspond to real citizens registered with the Unique Identification Authority of India (UIDAI), the Income Tax Department (ITD), the Ministry of Road Transport and Highways (MoRTH), or passport issuing authorities.

3. **DigiLocker Sandbox Zero-Cost Simulator**:  
   The DigiLocker integration provided herein is an internal mock issuer sandbox returning self-generated schema payloads. It does NOT connect to commercial API aggregators, does NOT incur commercial billing, and does NOT interface with real citizen government vaults.

---

## 🏛️ 4. PUBLIC DOMAIN STATUTORY CITATIONS

All compliance thresholds, reporting rules, and workflows implemented in this repository are derived **strictly and exclusively from publicly accessible government gazettes, statutory acts, and published open regulatory circulars**.

### Official Public Statutory Sources:

1. **🇮🇳 India — Income-tax Rules, 1962 (Rule 114B ₹50,000 Cash PAN Mandate)**:
   - *Public Citation*: Government of India, Ministry of Finance (Department of Revenue), Gazette Notification S.O. 3548(E) dated 30th December 2015.
   - *Public URL*: [https://incometaxindia.gov.in](https://incometaxindia.gov.in)
   - *Rule Summary*: Mandates quoting of Permanent Account Number (PAN) in all cash transactions exceeding ₹50,000 in banking companies or financial institutions.

2. **🇮🇳 India — Prevention of Money-laundering (Maintenance of Records) Rules, 2005 (Rule 3 CTR & CBWTR)**:
   - *Public Citation*: Gazette of India, Extraordinary, Part II, Section 3, Sub-section (i) dated 1st July 2005; amended vide Notification No. G.S.R. 882(E) dated 12th November 2015.
   - *Public URL*: [https://fiuindia.gov.in](https://fiuindia.gov.in)
   - *Rule Summary*: Rule 3(1)(A) requires reporting of all cash transactions $\ge \text{₹}10 \text{ Lakhs}$ (Cash Transaction Report - CTR); Rule 3(1)(BA) requires reporting of all cross-border wire transfers $\ge \text{₹}5 \text{ Lakhs}$ (CBWTR).

3. **🇮🇳 India — RBI Master Direction – Know Your Customer (KYC) Direction, 2016**:
   - *Public Citation*: Reserve Bank of India Master Direction DBR.AML.BC.No.81/14.01.001/2015-16 (Updated periodically).
   - *Public URL*: [https://rbi.org.in](https://rbi.org.in)
   - *Rule Summary*: Details customer due diligence, Video Customer Identification Process (V-CIP), and document verification protocols.

4. **🇮🇳 India — Digital Personal Data Protection (DPDP) Act, 2023**:
   - *Public Citation*: Act No. 22 of 2023 published in the Gazette of India on August 11, 2023.
   - *Public URL*: [https://www.meity.gov.in/content/digital-personal-data-protection-act-2023](https://www.meity.gov.in/content/digital-personal-data-protection-act-2023)
   - *Rule Summary*: Section 12 establishes Data Principal rights to erasure ("Right-to-be-Forgotten"), simulated via cryptographic zero-overwrite shredding.

5. **🇦🇪 UAE — Central Bank of the UAE (CBUAE) High Cash Transaction Mandate (AED 55,000)**:
   - *Public Citation*: Federal Decree-Law No. (20) of 2018 On Anti-Money Laundering and Combating the Financing of Terrorism and Financing of Illegal Organisations, and CBUAE Notice No. 74/2019.
   - *Public URL*: [https://www.centralbank.ae](https://www.centralbank.ae)
   - *Rule Summary*: Requires financial institutions to report physical cash transactions $\ge \text{AED } 55,000$ to the UAE Financial Intelligence Unit using the United Nations Office on Drugs and Crime (UNODC) **goAML XML** schema standard.

6. **🇦🇺 Australia — AUSTRAC Threshold Transaction Reporting (AUD 10,000)**:
   - *Public Citation*: Anti-Money Laundering and Counter-Terrorism Financing Act 2006 (AML/CTF Act) Section 43.
   - *Public URL*: [https://www.austrac.gov.au](https://www.austrac.gov.au)
   - *Rule Summary*: Reporting entities must report threshold transactions involving physical currency or electronic funds transfers $\ge \text{AUD } 10,000$.

7. **🌐 Global — United Nations Security Council Consolidated Sanctions List & FATF Standards**:
   - *Public Citation*: UN Security Council Committee established pursuant to resolutions 1267 (1999), 1989 (2011) and 2253 (2015); FATF Recommendation 10 & 12.
   - *Public URL*: [https://www.un.org/securitycouncil/content/un-sc-consolidated-list](https://www.un.org/securitycouncil/content/un-sc-consolidated-list)
   - *Rule Summary*: Mandates freezing of funds without delay for designated entities on the Consolidated United Nations Security Council Sanctions List.

---

## 🌐 5. JURISDICTIONAL SCOPE

This repository focuses specifically on statutory compliance frameworks across India (FIU-IND, RBI, Income Tax Department), the UAE (CBUAE goAML), Australia (AUSTRAC), and International Sanctions (UN Security Council). Other regional frameworks are outside the scope of this reference project.

---

## 📄 6. DISCLAIMER OF WARRANTIES & LIMITATION OF LIABILITY

### "AS IS" WARRANTY DISCLAIMER
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, COMPLETENESS, SYSTEM INTEGRATION, AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS, MAINTAINERS, CONTRIBUTORS, OR ITFREESOURCE ACADEMY BE LIABLE FOR ANY CLAIM, DAMAGES, LOSSES, COSTS, FINES, PENALTIES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### LIMITATION OF LIABILITY
UNDER NO CIRCUMSTANCES AND UNDER NO LEGAL THEORY (WHETHER IN CONTRACT, TORT, STRICT LIABILITY, OR OTHERWISE) SHALL THE AUTHORS, MAINTAINERS, OR AFFILIATES BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES OF ANY CHARACTER INCLUDING, WITHOUT LIMITATION:
- LOSS OF CAPITAL, DEPOSITS, OR ASSETS;
- REGULATORY FINES, ENFORCEMENT ACTIONS, OR STATUTORY PENALTIES;
- LOSS OF GOODWILL, BUSINESS REPUTATION, OR COMMERCIAL OPPORTUNITY;
- WORK STOPPAGE, COMPUTER FAILURE, OR SYSTEM OUTAGES;
- DATA CORRUPTION, PRIVACY BREACHES, OR UNAUTHORIZED DATA EXPOSURE;
- ANY AND ALL OTHER COMMERCIAL OR CIVIC DAMAGES OR LOSSES ARISING OUT OF THE USE, REUSE, FORKING, OR MODIFICATION OF THIS CODEBASE.

### INDEMNIFICATION BY DOWNSTREAM USERS
ANY INDIVIDUAL OR ENTITY WHO CLONES, DOWNLOADS, RUNS, MODIFIES, DISTRIBUTES, OR INCORPORATES THIS CODEBASE INTO ANY APPLICATION AGREES TO INDEMNIFY, DEFEND, AND HOLD HARMLESS ITFREESOURCE ACADEMY AND ITS CONTRIBUTORS AGAINST ANY AND ALL CLAIMS, LIABILITIES, INQUIRIES, INVESTIGATIONS, AUDITS, PROCEEDINGS, OR EXPENSES ARISING FROM OR RELATED TO ANY UNAPPROVED COMMERCIAL, REAL-WORLD FINANCIAL, OR UNLAWFUL USE OF THIS EDUCATIONAL MATERIAL.

---

## 🤝 7. ACCEPTANCE OF TERMS

By using, cloning, reading, executing, or contributing to this repository, you acknowledge that you have read this Legal Disclaimer in its entirety, understand its binding limitations, and agree that **zero risk, liability, or legal responsibility is assumed by ITFreeSource Academy or the repository maintainers**.
