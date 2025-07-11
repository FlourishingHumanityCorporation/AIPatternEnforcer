# Project Requirements Discovery

## 1. Core Functionality

- [ ] What is the primary purpose of this application?
- [ ] List 3-5 core features users MUST have
- [ ] What problem does this solve that existing solutions don't?
- [ ] Is this B2B, B2C, or internal tooling?

## 2. User Profile

- [ ] Expected number of concurrent users:
  - [ ] < 100 (prototype)
  - [ ] 100-1K (small app)
  - [ ] 1K-10K (growing startup)
  - [ ] 10K-100K (scale considerations)
  - [ ] 100K+ (enterprise scale)
- [ ] User technical sophistication:
  - [ ] General public
  - [ ] Technical users
  - [ ] Internal developers
- [ ] Geographic distribution:
  - [ ] Single region
  - [ ] Multi-region
  - [ ] Global

## 3. Data Characteristics

- [ ] Data volume per user:
  - [ ] Minimal (< 1MB)
  - [ ] Moderate (1MB - 100MB)
  - [ ] Heavy (100MB - 1GB)
  - [ ] Massive (> 1GB)
- [ ] Data sensitivity:
  - [ ] Public data
  - [ ] Personal data (GDPR)
  - [ ] Financial data (PCI)
  - [ ] Health data (HIPAA)
- [ ] Real-time requirements:
  - [ ] None (static content)
  - [ ] Near real-time (< 1 second)
  - [ ] Real-time (< 100ms)
  - [ ] Hard real-time (guaranteed latency)

## 4. Business Constraints

- [ ] Timeline:
  - [ ] Prototype needed in weeks
  - [ ] MVP in 1-3 months
  - [ ] Production in 6 months
  - [ ] Long-term project (1+ year)
- [ ] Budget:
  - [ ] $0-100/month (side project)
  - [ ] $100-1K/month (startup)
  - [ ] $1K-10K/month (growing business)
  - [ ] $10K+/month (enterprise)
- [ ] Team size:
  - [ ] Solo developer
  - [ ] 2-5 developers
  - [ ] 5-20 developers
  - [ ] 20+ developers

## 5. Technical Requirements

- [ ] Platform targets:
  - [ ] Web only
  - [ ] Web + Mobile web
  - [ ] Web + Native mobile
  - [ ] Desktop app needed
- [ ] Offline functionality:
  - [ ] Not needed
  - [ ] Nice to have
  - [ ] Critical feature
- [ ] Third-party integrations:
  - [ ] None
  - [ ] Payment processing
  - [ ] Social media APIs
  - [ ] Enterprise systems (SAP, Salesforce)
  - [ ] Other: ****\_\_\_****

## 6. Performance Requirements

- [ ] Page load time budget:
  - [ ] Not critical (> 3s acceptable)
  - [ ] Standard (< 3s)
  - [ ] Fast (< 1.5s)
  - [ ] Instant (< 500ms)
- [ ] API response time:
  - [ ] Relaxed (> 1s okay)
  - [ ] Standard (< 500ms)
  - [ ] Fast (< 200ms)
  - [ ] Ultra-fast (< 50ms)

## 7. Development Priorities (Rank 1-5)

- [ ] Development speed
- [ ] Code maintainability
- [ ] Performance
- [ ] Security
- [ ] Cost efficiency

## 8. AI Development Considerations

- [ ] How much will AI assist in development?
  - [ ] Minimal (< 20% AI-generated)
  - [ ] Moderate (20-50% AI-generated)
  - [ ] Heavy (50-80% AI-generated)
  - [ ] AI-first (> 80% AI-generated)
- [ ] AI tool access:
  - [ ] Just Cursor/Claude
  - [ ] Multiple AI tools
  - [ ] Custom AI workflows
