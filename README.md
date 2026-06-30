# FlowTrace
FlowTrace is a backend workflow execution and observability platform that transforms complex backend processes into interactive, traceable, and visual execution flows


# 🚀 FlowTrace

> **Learn. Execute. Observe. Understand.**

FlowTrace is an interactive backend workflow execution and observability platform that enables developers to execute real-world backend implementations while visualizing every stage of execution through live timelines, API traces, execution logs, and event monitoring.

Instead of relying on static tutorials or simulated examples, FlowTrace executes actual backend implementations, allowing developers to inspect how modern backend systems work internally.

The first module of FlowTrace focuses on **Payment Gateway Integrations**, with future modules planned for Authentication, Databases, Cloud Services, DevOps, Microservices, Caching, and more.

---

# 🎯 Vision

Modern backend systems are often treated as black boxes.

Developers learn how to call APIs but rarely understand everything happening behind the scenes.

FlowTrace aims to bridge that gap by transforming backend workflows into fully observable execution pipelines.

Every workflow can be:

- Executed
- Visualized
- Inspected
- Debugged
- Learned

Whether it's creating a payment order, authenticating a user, connecting to a database, uploading to cloud storage, or processing events through a message queue, FlowTrace exposes every step occurring inside the backend.

---

# 🌟 Core Philosophy

FlowTrace follows one simple principle:

> **If a workflow can be executed, it should be observable.**

Every execution generates:

- Runtime execution state
- Business timeline
- API request & response logs
- Incoming event logs (Webhooks)
- Performance metrics
- Final execution result

Nothing is simulated.

The platform executes real backend implementations while exposing every intermediate step.

---

# ⚡ Current Module

## Payment Gateway Integrations

The first module focuses on helping developers understand how payment gateways work internally.

Supported providers are designed to include:

- Razorpay
- Cashfree
- Stripe
- PhonePe

Supported payment flows include:

- Standard Checkout
- Payment Links
- Refunds
- Webhooks
- Subscription Payments

Each flow executes actual backend logic and communicates directly with the payment gateway SDK/API.

---

# 🏗 Architecture

FlowTrace separates **Documentation**, **Execution**, and **Observability** into independent layers.

```
Documentation Layer

Module
    │
    ▼
Flow
    │
    ▼
Code Snippet
```

```
Execution Layer

Execution
      │
      ▼
Executor Registry
      │
      ▼
Flow Executor
      │
      ▼
Provider Adapter
      │
      ▼
External Service / SDK
```

```
Observability Layer

Execution
      │
      ├──────────────┐
      ▼              ▼
TimelineEvent      ApiLog
      │
      ▼
EventLog (Webhook)
```

This separation allows documentation to evolve independently from runtime execution while maintaining complete traceability.

---

# 🔥 Key Features

## 🔐 Authentication

- JWT Authentication
- Refresh Token Support
- Guest Execution
- User Profiles
- Execution Statistics

---

## 📚 Learning First

Every workflow contains:

- Multiple code examples
- Explanations
- Supported languages
- Framework examples

Code snippets are educational and are never executed.

---

## ▶️ Real Backend Execution

Every workflow is executed using dedicated backend implementations.

No code is executed from the database.

Executors are version-controlled backend files responsible for implementing real business logic.

---

## 📈 Interactive Execution Timeline

Every execution generates a real-time business timeline.

Example:

```
Create Order
      │
      ▼
Open Checkout
      │
      ▼
Wait For Payment
      │
      ▼
Verify Payment
      │
      ▼
Completed
```

Timeline events represent business operations rather than low-level API requests.

---

## 🌐 API Inspector

Every outgoing API request is automatically captured.

Inspect:

- Endpoint
- HTTP Method
- Request Headers
- Request Body
- Response Headers
- Response Body
- Status Code
- Duration
- Errors

Developers can inspect every interaction with external services.

---

## 📩 Event Inspector

Incoming events are captured and stored.

Current implementation:

- Payment Webhooks

Future support:

- Kafka Events
- RabbitMQ Messages
- Redis Pub/Sub
- Internal Events

Each event stores:

- Headers
- Payload
- Signature
- Verification Status
- Processing Result
- Errors

---

## 📊 Execution Analytics

Track statistics across:

- Users
- Modules
- Flows
- Executions

---

# 🚀 Execution Workflow

```
User

↓

Select Module

↓

Select Flow

↓

Provide Runtime Variables

↓

Execute

↓

Execution Created

↓

Timeline Generated

↓

Executor Resolved

↓

Backend Execution Begins

↓

External API Calls

↓

API Logs Created

↓

Timeline Updates

↓

Wait For External Events

↓

Event Received

↓

Execution Resumes

↓

Timeline Completed

↓

Execution Finished
```

---

# 🛠 Current Technology Stack

Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

Integrations

- Razorpay SDK
- Cashfree SDK
- Stripe SDK
- REST APIs

Architecture

- Service Layer
- Repository Pattern
- Executor Pattern
- Adapter Pattern

---

# 📂 Project Structure

```
src

├── controllers
├── routes
├── middleware
├── models
├── services
├── executors
│
├── adapters
│
├── utils
├── config
└── app.js
```

---

# 🗄 Data Model

### Metadata

- User
- Module (Current: Integration)
- Flow
- CodeSnippet

### Runtime

- Execution (Current: Transaction)
- TimelineEvent
- ApiLog
- EventLog (Current: WebhookLog)

---

# 📌 Future Modules

FlowTrace is designed to expand beyond payment gateways.

Future modules include:

### Authentication

- JWT Login
- OAuth
- Password Reset
- Email Verification

### Databases

- MongoDB
- PostgreSQL
- Redis

### Cloud Services

- AWS S3
- CloudFront
- Firebase
- Supabase

### DevOps

- Docker
- Nginx
- CI/CD Pipelines

### Backend Systems

- RabbitMQ
- Kafka
- WebSockets
- Server-Sent Events

### Microservices

- Saga Pattern
- Event-Driven Architecture
- Distributed Transactions

The underlying execution engine remains unchanged while new modules introduce additional executors and adapters.

---

# 🎓 Who Is It For?

FlowTrace is built for:

- Students
- Backend Developers
- Educators
- API Integrators
- Software Engineers
- Anyone interested in understanding backend workflows

---

# 💡 Why FlowTrace?

Most learning resources show only the final result.

FlowTrace reveals the entire journey.

Instead of seeing:

```
Payment Successful
```

You observe:

```
Execution Created

↓

Timeline Generated

↓

Backend Executor

↓

API Request

↓

Gateway Response

↓

Webhook Received

↓

Verification

↓

Execution Completed
```

Every request, every event, every state transition, and every response becomes visible.

FlowTrace transforms backend systems from black boxes into fully observable execution pipelines.

---

# 🚧 Project Status

**Actively Under Development**

Current Focus

- ✅ Authentication
- ✅ Metadata Management
- ✅ Payment Module
- 🚧 Execution Engine
- 🚧 Timeline Service
- 🚧 API Logging
- 🚧 Event Processing
- 🚧 Provider Executors

---

# 📜 License

This project is intended for educational and learning purposes.

---

# 👨‍💻 Author

Designed and developed to make backend workflows transparent, observable, and easier to understand through real-world execution and interactive visualization.

Here's my understanding of the execution flow, based on the README:
When a user wants to run something, they first pick a Module (currently only "Payment Gateway Integrations" exists, with providers like Razorpay, Cashfree, Stripe, PhonePe), then pick a Flow within that module (e.g., Standard Checkout, Payment Links, Refunds, Webhooks, Subscription Payments). Each Flow has documentation and code snippets attached, but those are purely educational and never get executed — that's a separate concern from the actual runtime.
To actually run the flow, the user provides Runtime variables (things the executor needs to do real work, like amount, currency, customer details, etc., depending on the flow).
Once they hit Execute, the backend creates an Execution record (your Transaction model) tied to that user, module, and flow. This is the central object everything else hangs off of.
From there, the system looks up the right backend implementation via the Executor Registry — essentially a lookup table mapping (Module + Flow + Provider) to a specific Flow Executor function. That executor doesn't talk to Razorpay/Stripe/etc. directly — it goes through a Provider Adapter, which normalizes the different SDKs/APIs into a consistent interface so the executor logic doesn't care which gateway is being used underneath.
As the Flow Executor runs, it does two things in parallel:

Emits TimelineEvents — high-level business-state steps like "Create Order" → "Open Checkout" → "Wait For Payment" → "Verify Payment" → "Completed." These represent meaningful stages, not raw API calls.
Logs every outgoing API call as an ApiLog — capturing endpoint, method, headers, body, response, status code, duration, and errors for every interaction with the external gateway.

Some flows can't complete in one shot — they involve waiting on something external, like a payment webhook. In that case, execution pauses at a "Wait For X Event" timeline state. When the external service calls back (e.g., a payment confirmation webhook), that incoming payload is captured as an EventLog (with headers, payload, signature, and verification status). This event then resumes the paused execution, which continues forward — possibly making more API calls, emitting more timeline events — until it reaches a final state like "Completed" or "Failed."
So an Execution is really a parent record with three children logging different facets of what happened: TimelineEvent (business narrative), ApiLog (outbound HTTP), EventLog (inbound webhooks/events) — and the documentation layer (Module/Flow/CodeSnippet) stays completely decoupled from this runtime layer, only referenced by ID.
Let me know if that matches your mental model, or if I've misread any part of it before we get into the controller.
