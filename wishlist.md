# 📚 논문 위시리스트 (Daily 5-min Summary)
#
# 사용법:
#  - 한 줄에 arXiv ID 하나 (예: 2511.20639) 또는 전체 URL.
#  - 위에서부터 우선 처리됩니다. 처리된 항목은 done.log 에 기록되어 다시 안 나옵니다.
#  - 이 줄처럼 '#' 로 시작하면 주석(무시).
#  - 비어 있으면(미처리 항목 0개) 아래 FALLBACK 정책으로 alphaXiv 자동 검색.
#
# === FALLBACK 정책 (위시리스트 소진 시) ===
#  주제: Multi-Agent Latent Communication / Model Compression / Low-rank Decomposition
#  우선순위: 가장 최근 학회(NeurIPS·ICML·ICLR·ACL·EMNLP) accept 논문 우선.
#  범위: arXiv (CS/ML). 이미 done.log 에 있는 건 제외.
#
# ============================================================
# === ICML 2026 큐 (2026-06-22 큐잉) — ✅ 10/10 전부 처리 완료 (2026-07-21 소진) ===
# ============================================================
#
# ============================================================
# === 2026-08 큐 (2026-08-06 큐잉) ===
#  관심분야 4축 균형: Model Compression 3 / Efficient Sequence Models 3
#  / Multi-Agent & Latent Comm 2 / Shared World Models 2. 위→아래 = 우선순위.
#  선정: alphaXiv discover_papers(4축 개별 검색) · arXiv HTTP 200 실재 검증 완료 · done.log 중복 0.
#  ⚠️ 학회 accept 여부는 미검증 — 아래 주석에 venue를 적지 않았다. 요약 생성 시 [2]단계에서 직접 확인할 것.
# ============================================================
2603.15569   # [Efficient-Seq] Mamba-3: Improved Sequence Modeling using State Space Principles — CMU·Princeton·Together·Cartesia (커뮤니티 반응 최상위)
2608.02901   # [Compression·KV] AnchorKV: Anchor-Residual KV Cache Compression — eviction과 저랭크의 중간 지대
2607.26773   # [Multi-Agent·latent] Do Latent Channels Actually Communicate? A Causal Audit of Latent Multi-Agent LLM — 잠재통신 인과 감사(비판적)
2606.23568   # [Compression·low-rank] SVD-Surgeon: Optimal Singular-Value Surgery for LLM Compression
2606.32026   # [World-Model·latent] AdaJEPA: An Adaptive Latent World Model — 테스트타임 적응(반응 최상위)
2606.15378   # [Efficient-Seq·hybrid] Rethinking the Role of Efficient Attention in Hybrid Architectures — SWA·recurrent mixer 재평가
2607.24331   # [Compression·KV·low-rank] DynaCalKV: KV Cache Compression via Head Grouping and Adaptive Rank Allocation
2606.05711   # [Multi-Agent·latent] Beyond tokens: a unified framework for latent communication in LLM-based MAS — 통합 프레임워크
2608.02032   # [Efficient-Seq] DART: Decoded Attention over Recurrent States for Efficient Long-Context Sequence Modeling
2603.02263   # [World-Model·shared] Social-JEPA: Emergent Geometric Isomorphism — 서로 다른 시점의 에이전트가 공유 world model 획득
