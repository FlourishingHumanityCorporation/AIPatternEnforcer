# API Architecture Pattern Decision Matrix

## Quick Decision Flow

```
Start → Multiple client types?
         ├─ Yes → Need real-time?
         │         ├─ Yes → GraphQL Subscriptions or WebSockets
         │         └─ No → GraphQL (flexible) or REST (simple)
         └─ No → Type safety critical?
                  ├─ Yes → tRPC (if TypeScript) or gRPC
                  └─ No → Simple CRUD?
                          ├─ Yes → REST
                          └─ No → GraphQL
```

## Requirements Checklist

### Client Requirements

- [ ] Web application
- [ ] Mobile application (iOS/Android)
- [ ] Third-party API consumers
- [ ] Internal microservices
- [ ] IoT/embedded devices

### Data Requirements

- [ ] Complex relational queries
- [ ] Real-time updates needed
- [ ] File upload/download
- [ ] Streaming data
- [ ] Offline-first capability

### Development Requirements

- [ ] Strong type safety
- [ ] API versioning strategy
- [ ] Self-documenting API
- [ ] Contract-first development
- [ ] AI-assisted development

### Performance Requirements

- [ ] Request volume: **\_** req/sec
- [ ] Payload size: **\_** KB avg
- [ ] Latency target: **\_** ms
- [ ] Bandwidth constraints
- [ ] Caching requirements

## Comprehensive Comparison Matrix

| Criteria                 | Weight | REST | GraphQL | gRPC | tRPC | WebSockets |
| ------------------------ | ------ | ---- | ------- | ---- | ---- | ---------- |
| **Developer Experience** |        |      |         |      |      |            |
| Learning curve           | 4      | 5/5  | 3/5     | 2/5  | 4/5  | 3/5        |
| Tooling ecosystem        | 3      | 5/5  | 4/5     | 3/5  | 3/5  | 3/5        |
| Documentation            | 3      | 5/5  | 4/5     | 4/5  | 3/5  | 3/5        |
| AI assistance            | 3      | 5/5  | 4/5     | 3/5  | 2/5  | 4/5        |
| **Flexibility**          |        |      |         |      |      |            |
| Query flexibility        | 4      | 2/5  | 5/5     | 3/5  | 4/5  | N/A        |
| Schema evolution         | 3      | 3/5  | 4/5     | 2/5  | 5/5  | 3/5        |
| Client diversity         | 4      | 5/5  | 4/5     | 3/5  | 2/5  | 4/5        |
| **Performance**          |        |      |         |      |      |            |
| Network efficiency       | 3      | 3/5  | 4/5     | 5/5  | 4/5  | 5/5        |
| Caching                  | 3      | 5/5  | 3/5     | 2/5  | 3/5  | 1/5        |
| Real-time                | 2      | 1/5  | 3/5     | 4/5  | 2/5  | 5/5        |
| **Type Safety**          |        |      |         |      |      |            |
| Contract definition      | 3      | 3/5  | 4/5     | 5/5  | 5/5  | 2/5        |
| Runtime validation       | 3      | 3/5  | 4/5     | 5/5  | 5/5  | 2/5        |
| Client generation        | 2      | 3/5  | 4/5     | 5/5  | 5/5  | 2/5        |
| **Operational**          |        |      |         |      |      |            |
| Monitoring/debugging     | 3      | 5/5  | 4/5     | 3/5  | 3/5  | 3/5        |
| Infrastructure           | 3      | 5/5  | 4/5     | 3/5  | 4/5  | 4/5        |
| Security                 | 3      | 4/5  | 3/5     | 5/5  | 4/5  | 3/5        |

## Detailed Architecture Analysis

### REST (Representational State Transfer)

**Best for:**

- Public APIs
- Simple CRUD operations
- Microservices communication
- Maximum compatibility
- CDN caching requirements

**Architecture example:**

```typescript
// Express REST API
app.get("/api/users/:id", async (req, res) => {
  const user = await db.user.findUnique({
    where: { id: req.params.id },
  });
  res.json(user);
});

app.post("/api/users", validate(userSchema), async (req, res) => {
  const user = await db.user.create({
    data: req.body,
  });
  res.status(201).json(user);
});
```

**Challenges:**

- Over/under-fetching
- N+1 query problems
- Versioning complexity
- No standard for real-time

### GraphQL

**Best for:**

- Complex data requirements
- Multiple client types
- Rapid frontend iteration
- Aggregating microservices
- Mobile apps (bandwidth)

**Architecture example:**

```typescript
// Apollo Server setup
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    posts: [Post!]!
  }

  type Query {
    user(id: ID!): User
    users(filter: UserFilter): [User!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
  }

  type Subscription {
    userUpdated(id: ID!): User!
  }
`;

const resolvers = {
  Query: {
    user: (_, { id }) => db.user.findUnique({ where: { id } }),
  },
  User: {
    posts: (user) => db.post.findMany({ where: { userId: user.id } }),
  },
};
```

**Challenges:**

- Caching complexity
- N+1 without dataloader
- Learning curve
- Security (query depth)

### gRPC

**Best for:**

- Microservices communication
- High-performance requirements
- Streaming data
- Strong contracts
- Multi-language systems

**Architecture example:**

```protobuf
// user.proto
syntax = "proto3";

service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc ListUsers(ListUsersRequest) returns (stream User);
  rpc CreateUser(CreateUserRequest) returns (User);
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
}
```

```go
// Go implementation
func (s *server) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {
    user, err := s.db.GetUser(req.Id)
    if err != nil {
        return nil, status.Errorf(codes.NotFound, "user not found")
    }
    return &pb.User{
        Id:    user.ID,
        Name:  user.Name,
        Email: user.Email,
    }, nil
}
```

**Challenges:**

- Browser support (needs proxy)
- Human readability
- Tooling complexity
- Limited ecosystem

### tRPC

**Best for:**

- TypeScript monorepos
- Full-stack type safety
- Rapid development
- Internal APIs
- Next.js applications

**Architecture example:**

```typescript
// Server definition
const appRouter = router({
  user: {
    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return await db.user.findUnique({
          where: { id: input.id },
        });
      }),

    create: protectedProcedure
      .input(userSchema)
      .mutation(async ({ input, ctx }) => {
        return await db.user.create({
          data: { ...input, createdBy: ctx.user.id },
        });
      }),
  },
});

// Client usage (fully typed!)
const user = await trpc.user.get.query({ id: "123" });
const newUser = await trpc.user.create.mutate({
  name: "John",
  email: "john@example.com",
});
```

**Challenges:**

- TypeScript-only
- Limited to Node.js
- Smaller ecosystem
- Less AI training data

### WebSockets / Server-Sent Events

**Best for:**

- Real-time updates
- Live collaboration
- Chat applications
- Streaming data
- Push notifications

**Architecture example:**

```typescript
// Socket.io implementation
io.on("connection", (socket) => {
  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    socket.on("message", async (data) => {
      const message = await saveMessage(data);
      io.to(roomId).emit("new-message", message);
    });
  });
});

// Server-Sent Events
app.get("/api/events", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });

  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ time: Date.now() })}\n\n`);
  }, 1000);

  req.on("close", () => clearInterval(interval));
});
```

## Hybrid Architecture Patterns

### Pattern 1: REST + WebSockets

```
┌─────────────┐     REST      ┌──────────────┐
│   Client    │──────────────▶│     API      │
│             │◀──────────────│   Gateway    │
│             │   WebSocket   │              │
└─────────────┘               └──────────────┘
```

Use REST for CRUD, WebSockets for real-time updates

### Pattern 2: GraphQL + Subscriptions

```
┌─────────────┐    GraphQL    ┌──────────────┐
│   Client    │──────────────▶│   GraphQL    │
│             │◀──────────────│   Server     │
│             │  Subscription │              │
└─────────────┘               └──────────────┘
```

Single endpoint for queries, mutations, and real-time

### Pattern 3: BFF (Backend for Frontend)

```
┌────────┐  GraphQL  ┌─────┐  gRPC  ┌──────────┐
│  Web   │──────────▶│     │───────▶│          │
└────────┘           │ BFF │        │ Services │
┌────────┐   REST    │     │───────▶│          │
│ Mobile │──────────▶│     │        └──────────┘
└────────┘           └─────┘
```

Different API styles for different clients

## Decision Factors by Industry

### E-commerce

**Recommendation**: REST + GraphQL

- REST for public catalog API
- GraphQL for complex cart/checkout flows

### Social Media

**Recommendation**: GraphQL + WebSockets

- GraphQL for flexible queries
- WebSockets for real-time feed updates

### Banking/Finance

**Recommendation**: REST or gRPC

- REST for public APIs (standards)
- gRPC for internal microservices

### SaaS B2B

**Recommendation**: REST + Webhooks

- REST for predictable API
- Webhooks for event notifications

### Gaming

**Recommendation**: WebSockets + gRPC

- WebSockets for real-time gameplay
- gRPC for backend services

## Migration Strategies

### Incremental Migration

```
1. Identify boundaries
2. Create API gateway
3. Route legacy to old system
4. Implement new endpoints in new style
5. Migrate clients gradually
6. Deprecate old endpoints
```

### Parallel Running

```typescript
// Run both REST and GraphQL
app.use("/api/v1", restRouter); // Legacy
app.use("/api/v2", restV2Router); // Improved REST
app.use("/graphql", apolloServer); // New GraphQL
```

## AI Integration Considerations

### Best for AI Development

1. **GraphQL** - Self-documenting schema
2. **tRPC** - Type inference helps AI
3. **REST** - Most training data available

### AI-Friendly Documentation

```yaml
# API Documentation for AI
endpoints:
  - path: /api/users/{id}
    method: GET
    description: Retrieve user by ID
    example_request: GET /api/users/123
    example_response: |
      {
        "id": "123",
        "name": "John Doe",
        "email": "john@example.com"
      }
```

## Cost Analysis

### Development Time (Relative)

- REST: 1x (baseline)
- GraphQL: 1.5x (initial setup)
- gRPC: 1.3x (tooling setup)
- tRPC: 0.8x (if TypeScript)
- WebSockets: 1.2x (complexity)

### Operational Costs

```
# 1M requests/day cost estimate

REST (with CDN):        $50/month
GraphQL (no CDN):       $120/month
gRPC:                   $80/month
tRPC:                   $90/month
WebSockets (persistent): $200/month
```

## Decision Template

**Project**: ultrathink
**Selected Pattern**: ******\_\_\_******

**Primary Requirements**:

1. ***
2. ***
3. ***

**Architecture Decision**:

- Primary: ******\_\_\_****** (for ******\_\_\_******)
- Secondary: ******\_\_\_****** (for ******\_\_\_******)

**Implementation Plan**:

- Week 1-2: ******\_\_\_******
- Week 3-4: ******\_\_\_******
- Week 5-6: ******\_\_\_******

**Success Metrics**:

- [ ] API response time < **\_** ms
- [ ] Developer onboarding < **\_** days
- [ ] Client SDK generation automated
- [ ] 95th percentile latency < **\_** ms

**Review Checkpoint**: ******\_\_\_******

## Quick Reference

| If you need...        | Consider...       |
| --------------------- | ----------------- |
| Maximum compatibility | REST              |
| Flexible queries      | GraphQL           |
| Type safety           | tRPC (TS) or gRPC |
| Real-time updates     | WebSockets        |
| High performance      | gRPC              |
| Rapid development     | REST or tRPC      |
| Public API            | REST              |
| Mobile optimization   | GraphQL           |
| Microservices         | gRPC or REST      |
| File uploads          | REST or gRPC      |
