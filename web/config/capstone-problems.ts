import type { Problem } from "@/types/problem";

export const CAPSTONE_PROBLEMS: Problem[] = [
  {
    id: "capstone-realtime-ai-search",
    type: "system_design",
    title: "Design a Real-Time AI-Powered Search Engine",
    description: "Design a search system that combines semantic search with LLM-powered answer synthesis, serving 10K QPS with sub-200ms P95 latency.",
    difficulty: "Hard",
    weekNumber: 14,
    tags: '["production-systems", "search", "embeddings", "latency", "scaling"]',
    theory: `## Production AI Search Systems

Real-time AI search combines three layers: retrieval (fast, approximate), reranking (accurate, slower), and synthesis (LLM generation). The challenge is keeping end-to-end latency under 200ms while providing LLM-quality answers.

### Key Architecture Decisions

**Retrieval Layer**: ANN indexes (HNSW, IVF) trade recall for speed. Typical: 1-5ms for top-100 candidates from millions of documents. Use quantized embeddings (int8) for memory efficiency.

**Reranking Layer**: Cross-encoder models are 100x more accurate but 100x slower than bi-encoders. Batch processing of top-K candidates (K=20-50) in parallel keeps this under 50ms.

**Synthesis Layer**: LLM generation is the bottleneck (100-2000ms). Solutions:
- Streaming responses (first token in 50ms)
- Speculative decoding
- Smaller distilled models for straightforward queries
- Cache common query patterns

### Production Concerns
- Index staleness vs rebuild cost
- Embedding model versioning (reindex on upgrade)
- Fallback to keyword search when semantic fails
- Query classification to skip synthesis for navigational queries
- Rate limiting and cost control on LLM calls`,
    hints: '["Consider a tiered approach: not every query needs LLM synthesis", "Think about how to handle index updates without downtime", "What happens when the LLM is slow or unavailable?"]',
    visualizationComponent: null,
    sortOrder: 1,
    designPrompt: `You are designing a real-time AI-powered search engine for a SaaS platform with 50M indexed documents (product docs, help articles, community posts).

**Requirements:**
- 10,000 queries per second at peak
- P95 latency under 200ms for retrieval, 2s for synthesis
- Semantic understanding (not just keyword matching)
- LLM-synthesized answers with source citations
- Real-time index updates (new content searchable within 60s)
- Multi-tenant isolation

**Constraints:**
- Budget: $50K/month compute
- Team: 4 engineers
- Must handle 3 languages (English, Spanish, Portuguese)

Design the full system. Address: architecture diagram, data flow, embedding strategy, index management, LLM integration, caching, failure modes, and capacity planning.`,
    sampleAnswer: `## Architecture

### High-Level Flow
Query -> Query Classifier -> [Semantic Retrieval | Keyword Fallback] -> Reranker -> [Cache Hit? Return | LLM Synthesis] -> Response

### Components

**1. Query Processing (5ms)**
- Intent classifier (navigational vs informational)
- Language detection + translation to English for retrieval
- Query expansion via lightweight LLM call (cached by query hash)

**2. Retrieval Layer (10-20ms)**
- Primary: HNSW index (hnswlib) with int8 quantized embeddings
- Embedding model: multilingual-e5-large (1024d, quantized to 256d via Matryoshka)
- Sharded by tenant, 4 replicas per shard
- Secondary: BM25 inverted index for keyword fallback
- Hybrid scoring: 0.7 * semantic + 0.3 * BM25

**3. Reranking (30-50ms)**
- Cross-encoder (ms-marco-MiniLM-L6) on top-30 candidates
- Batched inference on GPU, 6ms per batch of 30
- Output: top-5 with relevance scores

**4. Synthesis (100-1500ms, streamed)**
- Query classifier gates: only informational queries get synthesis
- Model: GPT-4o-mini (cost/latency balance)
- Prompt: structured with source snippets, instruction to cite
- Streaming: first token target 80ms
- Cache: hash(query_normalized + top_5_doc_ids) -> cached response (TTL 1h)
- Cache hit rate target: 30-40% for common queries

**5. Index Management**
- Kafka topic per tenant for document events
- Worker processes: embed + upsert within 30s of event
- Full reindex pipeline: nightly, zero-downtime via blue-green indexes
- Embedding model upgrades: shadow index built in background, atomic swap

**6. Infrastructure**
- 8x A10G GPUs: 4 for reranking, 2 for embedding, 2 for query expansion
- Redis cluster: query cache + rate limiting
- PostgreSQL: metadata, tenant config, access control

**7. Failure Modes**
- LLM timeout: return retrieval results without synthesis (graceful degradation)
- Index corruption: automatic failover to replica, alert for rebuild
- Embedding service down: queue documents, serve from stale index
- Rate limiting: per-tenant QPS caps, priority queues for paid tiers

**Capacity Planning:**
- 10K QPS / 4 replicas = 2.5K QPS per replica
- Each HNSW query: ~1ms, 50M vectors * 256d * 1 byte = 12.8GB per shard
- Reranker throughput: 30 docs * 2.5K QPS = 75K inferences/sec across 4 GPUs
- LLM calls: ~3K QPS (30% of queries need synthesis) * $0.0003/call = $78/hour = $56K/month -> need caching`,
    rubric: [
      { criterion: "Latency Architecture", weight: 0.25, description: "Clear separation of retrieval/reranking/synthesis with latency budgets per stage", keyPoints: ["Sub-20ms retrieval", "Streaming synthesis", "Graceful degradation"] },
      { criterion: "Scaling Strategy", weight: 0.2, description: "Sharding, replication, and capacity planning for 10K QPS", keyPoints: ["Horizontal scaling plan", "GPU utilization", "Cost awareness"] },
      { criterion: "Index Management", weight: 0.2, description: "Real-time updates, zero-downtime reindex, embedding versioning", keyPoints: ["Event-driven updates", "Blue-green deployment", "Staleness handling"] },
      { criterion: "Failure Modes", weight: 0.2, description: "Graceful degradation, fallbacks, monitoring", keyPoints: ["LLM timeout handling", "Index failover", "Alerting strategy"] },
      { criterion: "Cost Optimization", weight: 0.15, description: "Caching, query classification, model selection", keyPoints: ["Cache hit rate targets", "Skip synthesis for simple queries", "Budget-aware model choice"] },
    ],
  },
  {
    id: "capstone-ml-platform",
    type: "system_design",
    title: "Design an Internal ML Platform",
    description: "Design a platform that enables 50 ML engineers to train, evaluate, deploy, and monitor models with self-service workflows.",
    difficulty: "Hard",
    weekNumber: 14,
    tags: '["mlops", "platform", "production-systems", "infrastructure"]',
    theory: `## ML Platform Engineering

An ML platform abstracts infrastructure complexity so ML engineers focus on models, not ops. Core capabilities: experiment tracking, training orchestration, model registry, deployment automation, and monitoring.

### Design Principles

**Self-service over tickets**: Engineers deploy without platform team involvement.
**Opinionated defaults, escape hatches**: Standard paths cover 80% of use cases. Custom configs for the rest.
**Reproducibility**: Any past experiment can be recreated from metadata alone.
**Cost visibility**: Every team sees their compute spend in real-time.

### Common Pitfalls
- Building too much custom infra (use Kubernetes + off-the-shelf where possible)
- Ignoring the data layer (garbage in, garbage out - data validation matters more than model architecture)
- No resource quotas (one runaway training job shouldn't starve others)
- Monolithic model server (separate serving from training concerns)`,
    hints: '["Think about the 50 engineers: what are their daily workflows?", "How do you prevent one team from consuming all GPU resources?", "Model deployment should be as simple as git push"]',
    visualizationComponent: null,
    sortOrder: 2,
    designPrompt: `You are the tech lead designing an internal ML platform for a company with 50 ML engineers across 8 teams (recommendation, search, NLP, computer vision, fraud, ads, pricing, forecasting).

**Requirements:**
- Self-service model training (GPU cluster: 64x A100 80GB)
- Experiment tracking and reproducibility
- Model registry with versioning and lineage
- One-click deployment to production (canary, blue-green)
- Real-time model monitoring (drift, latency, accuracy decay)
- Feature store for shared features across teams
- CI/CD for ML (automated retraining triggers)
- Cost attribution per team

**Constraints:**
- Must integrate with existing Kubernetes infrastructure
- Data lives in Snowflake + S3
- Current state: each team has ad-hoc scripts, no shared tooling
- Timeline: MVP in 3 months, full platform in 9 months

Design the platform architecture. Address: component diagram, user workflows, resource management, deployment pipeline, monitoring, and migration path from current state.`,
    sampleAnswer: `## ML Platform Architecture

### Core Components

**1. Training Orchestration**
- Kubernetes-native job scheduler (Volcano or Kueue)
- Resource quotas per team (fair-share scheduling)
- GPU time-slicing for small experiments, dedicated nodes for large training
- Pre-built Docker images per framework (PyTorch, JAX, TensorFlow)
- Spot instance support for fault-tolerant jobs (checkpointing every N steps)

**2. Experiment Tracking**
- MLflow as experiment store (self-hosted, PostgreSQL backend)
- Auto-logging: hyperparams, metrics, artifacts, git SHA, Docker image hash
- Comparison UI: side-by-side runs with metric plots
- Lineage: dataset version -> training run -> model artifact -> deployment

**3. Feature Store**
- Offline: Spark jobs write to S3/Parquet (daily/hourly)
- Online: Redis cluster for real-time serving (<5ms P99)
- Feature registry: schema, owner, freshness SLA, downstream models
- Point-in-time correctness for training (avoid label leakage)

**4. Model Registry**
- S3-backed artifact storage with metadata in PostgreSQL
- States: experimental -> staging -> production -> archived
- Promotion requires: passing tests, bias checks, latency benchmark
- Rollback: one-click revert to previous production version

**5. Deployment Pipeline**
- GitOps: model config in repo, ArgoCD deploys on merge
- Serving: KServe (supports PyTorch, ONNX, TensorRT)
- Traffic management: Istio for canary (5% -> 25% -> 100%)
- Auto-scaling: HPA on QPS + GPU utilization
- A/B testing integration: route by user segment

**6. Monitoring**
- Data drift: PSI/KL-divergence on input features (hourly)
- Prediction drift: distribution shift in model outputs
- Performance: latency P50/P95/P99, throughput, error rate
- Business metrics: click-through rate, conversion (delayed feedback)
- Alerts: PagerDuty integration, auto-rollback on latency spike

**7. Cost Management**
- Kubecost for per-team attribution
- Dashboard: GPU-hours, storage, inference costs per model
- Recommendations: idle GPU detection, right-sizing suggestions
- Budget alerts at 80%/100% of team allocation

### User Workflow (Training to Production)

\`\`\`
1. Engineer writes training code + config YAML
2. \`mlp train submit --config train.yaml\` -> Kubernetes job
3. Metrics stream to MLflow, artifacts to S3
4. Engineer promotes best run: \`mlp model promote run-123 --stage staging\`
5. Automated checks run (bias, latency, integration tests)
6. PR to deployment repo -> review -> merge -> ArgoCD deploys canary
7. Monitoring validates canary metrics vs baseline
8. Auto-promote to 100% traffic or alert on regression
\`\`\`

### Migration Path (3-month MVP)
- Month 1: Training orchestration + experiment tracking (highest pain point)
- Month 2: Model registry + basic deployment (KServe)
- Month 3: Monitoring + cost dashboards
- Months 4-9: Feature store, CI/CD automation, advanced scheduling`,
    rubric: [
      { criterion: "Platform Architecture", weight: 0.25, description: "Clear component separation, integration points, technology choices", keyPoints: ["Kubernetes-native", "Composable services", "Reasonable tech choices"] },
      { criterion: "User Experience", weight: 0.2, description: "Self-service workflows, CLI/UI design, onboarding path", keyPoints: ["Simple happy path", "Escape hatches for power users", "Migration plan"] },
      { criterion: "Resource Management", weight: 0.2, description: "GPU scheduling, quotas, cost attribution, multi-tenancy", keyPoints: ["Fair scheduling", "Cost visibility", "No resource starvation"] },
      { criterion: "Production Safety", weight: 0.2, description: "Deployment pipeline, monitoring, rollback, testing", keyPoints: ["Canary deployments", "Drift detection", "Auto-rollback"] },
      { criterion: "Incremental Delivery", weight: 0.15, description: "MVP scope, migration from current state, phased rollout", keyPoints: ["3-month MVP defined", "Migration path", "Value at each phase"] },
    ],
  },
  {
    id: "capstone-ai-gateway",
    type: "system_design",
    title: "Design an AI API Gateway",
    description: "Design a gateway that routes, rate-limits, caches, and observes all LLM API calls across an organization with 200 microservices.",
    difficulty: "Hard",
    weekNumber: 14,
    tags: '["api-gateway", "llm", "production-systems", "observability", "cost-control"]',
    theory: `## AI API Gateways

As organizations adopt LLMs, every team makes direct API calls to providers (OpenAI, Anthropic, etc). This creates: uncontrolled costs, no visibility into usage, inconsistent retry/fallback logic, and security blind spots.

An AI gateway sits between your services and LLM providers, providing:
- **Routing**: Model selection, provider failover, A/B testing
- **Cost control**: Per-team budgets, request throttling, token limits
- **Observability**: Latency, cost, token usage, prompt/response logging
- **Caching**: Semantic deduplication of identical/similar requests
- **Security**: PII redaction, prompt injection detection, audit logging

### Production Considerations
- Gateway cannot add significant latency (<10ms overhead)
- Must support streaming responses (SSE)
- Semantic caching requires embedding computation (latency tradeoff)
- PII detection must be fast (regex + NER, not another LLM call)
- Multi-region for latency and compliance`,
    hints: '["The gateway MUST support streaming - most LLM responses are streamed", "Think about semantic caching: how similar is similar enough?", "What happens when the primary LLM provider has an outage?"]',
    visualizationComponent: null,
    sortOrder: 3,
    designPrompt: `You are designing an AI API Gateway for a company with 200 microservices making LLM calls. Currently each service has its own API key and retry logic, leading to $800K/month in uncontrolled LLM spend.

**Requirements:**
- Central routing for all LLM calls (OpenAI, Anthropic, open-source models)
- Per-team rate limiting and budget enforcement
- Semantic caching (similar prompts return cached responses)
- PII redaction before sending to external providers
- Automatic failover between providers
- Full observability: cost, latency, token usage per service/team/model
- Streaming support (SSE passthrough)
- <10ms added latency for non-cached requests

**Constraints:**
- 50,000 LLM requests per minute at peak
- Must not be a single point of failure
- Some teams need guaranteed SLA (priority routing)
- Compliance: EU data must not leave EU region

Design the gateway architecture. Address: request flow, caching strategy, failover logic, PII handling, multi-region deployment, and cost reduction targets.`,
    sampleAnswer: `## AI Gateway Architecture

### Request Flow (non-cached, <10ms overhead)

\`\`\`
Service -> Gateway LB -> Auth + Quota Check (1ms) -> PII Scan (2ms) ->
  Cache Lookup (3ms) -> [MISS] -> Provider Router -> LLM Provider
  [HIT] -> Return cached response
\`\`\`

### Core Components

**1. Gateway Proxy Layer**
- Envoy-based proxy with custom Lua/WASM filters
- Deployed as DaemonSet (one per node) to minimize network hops
- Streaming: bidirectional SSE relay, no buffering

**2. Auth & Quota Service (1ms)**
- API key -> team mapping in Redis
- Token bucket rate limiting per team (requests/min + tokens/day)
- Budget enforcement: hard limits and soft alerts
- Priority tiers: P0 (never throttle), P1 (throttle last), P2 (best effort)

**3. PII Redaction (2ms)**
- Fast path: regex patterns for SSN, credit card, phone, email
- NER path: spaCy NER model (quantized, runs on CPU) for names, addresses
- Configurable per team: some teams handle public data only (skip scan)
- Reversible redaction: PII tokens mapped in session, restored in response

**4. Semantic Cache (3ms for lookup)**
- Embedding: all-MiniLM-L6-v2 (384d, 5ms to embed on CPU)
- Index: Redis with RediSearch vector similarity (cosine, threshold 0.95)
- Cache key: embedding of (system_prompt + user_prompt + model + temperature)
- Only cache temperature=0 requests (deterministic)
- TTL: 24h default, configurable per endpoint
- Expected hit rate: 15-25% (saves $120-200K/month)

**5. Provider Router**
- Primary/fallback config per model capability:
  - GPT-4 class: OpenAI primary -> Anthropic Claude fallback
  - Fast/cheap: GPT-4o-mini primary -> Claude Haiku fallback
  - Open source: self-hosted Llama via vLLM (no external call)
- Health checks: per-provider error rate, latency tracking
- Circuit breaker: 5 failures in 10s -> route to fallback for 60s
- A/B testing: route X% of traffic to candidate model, compare quality metrics

**6. Observability**
- Every request logged: team, model, tokens_in, tokens_out, latency, cost, cache_hit
- Real-time dashboard: Grafana with per-team cost breakdown
- Alerts: budget approaching limit, latency spike, error rate increase
- Prompt/response logging: opt-in per team (compliance), stored encrypted in S3

**7. Multi-Region**
- EU gateway: routes to EU-hosted models only (Anthropic EU, self-hosted)
- US gateway: full provider access
- Routing decision at DNS level (GeoDNS) or service mesh
- Cache is regional (not shared across regions for latency)

### Cost Reduction Strategy
- Semantic caching: -20% ($160K/month)
- Model downgrade routing (simple queries -> cheaper models): -15% ($120K/month)
- Token limit enforcement (max_tokens caps): -10% ($80K/month)
- Total target: $440K/month -> $360K savings annually`,
    rubric: [
      { criterion: "Latency Design", weight: 0.25, description: "Gateway overhead budget, streaming support, caching architecture", keyPoints: ["<10ms overhead", "SSE passthrough", "Fast PII scan"] },
      { criterion: "Cost Control", weight: 0.25, description: "Budget enforcement, caching strategy, model routing optimization", keyPoints: ["Per-team budgets", "Semantic cache design", "Quantified savings"] },
      { criterion: "Reliability", weight: 0.2, description: "Failover logic, circuit breaking, no SPOF", keyPoints: ["Provider failover", "Circuit breaker", "Regional deployment"] },
      { criterion: "Security & Compliance", weight: 0.15, description: "PII handling, data residency, audit logging", keyPoints: ["Fast PII redaction", "EU data isolation", "Audit trail"] },
      { criterion: "Observability", weight: 0.15, description: "Metrics, dashboards, alerting, cost attribution", keyPoints: ["Per-team cost visibility", "Real-time dashboards", "Anomaly alerts"] },
    ],
  },
];
