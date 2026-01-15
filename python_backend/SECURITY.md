# GRID Security & Compliance (GRID-Friendly)

YOE is designed to be fully compliant with GRID's Data Usage Policy and Security requirements. This document outlines the technical measures implemented to ensure this compliance.

## 1. Secure Access Implementation
- **Server-Side Requests**: All calls to the GRID API are made exclusively from the YOE Python backend. No API keys or raw GRID endpoints are ever exposed to the client-side (frontend).
- **API Key Management**: GRID API keys are stored in server-side environment variables (`.env`) and are never committed to version control.
- **Header Injection**: The `x-api-key` header is injected automatically by the `GridAPIClient` in the backend service layer.

## 2. Rate Limiting & Resilience
- **Wait-and-Retry**: The `GridAPIClient` includes automatic handling for HTTP `429 Too Many Requests`. When a rate limit is hit, the client pauses for a set interval before retrying, respecting GRID's infrastructure limits.
- **Graceful Fallbacks**: If the GRID API is unavailable, the system uses structured mock data for development and testing to prevent service disruption while maintaining data integrity.

## 3. Data Privacy & Redistribution
- **No Raw Data Redistribution**: YOE does not redistribute raw data feeds from GRID. All GRID-sourced data is normalized and stored in a private relational database schema for internal processing.
- **Derived Insights Only**: The primary output of the YOE platform consists of "AI Insights" and "Extracted Features." These are high-level analytics derived from the raw data, tailored for coaching and scouting purposes.
- **Role-Based Access Control (RBAC)**: Access to normalized match data and insights is strictly controlled via RBAC, ensuring only authorized users (Admins, Coaches, Analysts) can access professional competitive intelligence.

## 4. Architecture Overview
```text
GRID GraphQL / REST APIs
   ↓ (Secure server-side call with x-api-key)
YOE Ingestion Service (python_backend)
   ↓ (Normalization & Idempotency)
Relational Database (SQLite)
   ↓ (Feature Extraction & AI Pipeline)
LLM Explanation Layer (Insights only)
   ↓ (Authenticated REST API)
Frontend Dashboards (Insights & Analytics)
```

## 5. Summary of Compliance
| Requirement | Status | Implementation Method |
| :--- | :--- | :--- |
| API key secured | ✅ | Stored in `.env`, server-side only |
| Rate limits respected | ✅ | Automatic 429 retry handling |
| No client-side calls | ✅ | All calls via `GridAPIClient` in Python |
| No raw data redistribution | ✅ | Only derived insights and normalized metadata exposed |
| Insights only | ✅ | Focus on "Judge Favorite" coaching explanations |
