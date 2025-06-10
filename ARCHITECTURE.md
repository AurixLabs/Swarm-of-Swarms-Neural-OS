
# 🧬 Neural System (NS) Architecture Guidelines

## ✨ Overview

GoodyMorgan is a state-driven productivity super app combining messaging, team collaboration, real-time AI, and business tools into a modular Neural System. This document defines the architectural principles and structure that all contributors must follow.

## 🧱 Architecture Goals

- **Neural**: Each component functions like a neuron with specialized capabilities
- **State-driven**: Context and views are determined by internal state, not routing alone
- **AI-integrated**: GPT agents are first-class citizens, not bolt-ons
- **Fault-tolerant**: Nothing crashes the core app layout
- **Scalable**: Supports chat, workspace, files, listings, payments, and more in harmony

## 📁 Folder Structure

```
/src
  /components
    /ui              → design-agnostic UI building blocks
    /chat            → ChatPanel, ConversationToWorkspace, MessageBubble
    /workspace       → TeamWorkspace, TaskList, SharedFiles, AgentTools
    /feature         → Listings, Calendar, Storefront, Profiles
    /common          → FeatureBoundary, ViewStateWrapper, SuspenseFallback
  /pages             → Route containers only
  /hooks             → Global shared hooks
  /lib
    /models          → Supabase data logic
    /ai              → AI prompt logic, intent detection
  /context           → App-wide state providers
  /features          → Feature-specific components, hooks, and logic
    /agent
    /chat
    /workspace
    /business
```

## 🍏 Neural GPT Stack (Layered Design)

Organized as a clean vertical system from UI → Logic → Execution → Storage:

### Layer 1: UI Surface (Presentation)
What the user interacts with in `/pages` and `/components`

### Layer 2: Feature Logic (Neural Hooks)
Feature-specific behavior in `/features/*/hooks` and `/hooks`

### Layer 3: GPT Core Logic (Neural Processing)
Pure AI logic in `/lib/ai/*` - decoupled from frontend

### Layer 4: Edge Functions (Neural Execution)
All GPT calls run securely via Supabase Functions in `/supabase/functions`

### Layer 5: Storage & Data (Neural Memory)
User files, profiles, and state storage in Supabase

## 🚫 Rules for Development

### ✅ DO:
- Move logic into `/features/<name>/`
- Use dedicated hooks for GPT calls
- Add reusable prompt logic to `/lib/ai/`
- Keep UI strictly prop-driven
- Only store tokens in edge functions
- Use path aliases for imports

### ❌ DO NOT:
- Put new logic in `/components/`
- Write GPT calls in React components
- Expose OpenAI keys in client code
- Use fetch inline in JSX files
- Hardcode Supabase URLs
- Create functions without a matching feature module

## 🧩 Feature Boundary Component

All intelligent components must be wrapped in the `<FeatureBoundary>` component to provide fault tolerance and loading states.

## 🧠 UX Philosophy

### "Chat is the neural interface"
Features don't live alongside chat — they emerge from it based on context and intent.

### Neural Visibility
- **Always visible**: navigation, header, user profile
- **Soft-visible**: task list, shared files (can be collapsed)
- **Context-aware**: supplier search, agent insights (appear based on intent)

## 🧪 Testing Guidelines

- All hooks should have unit tests
- Edge functions should be tested in isolation
- Components should be tested for layout and interactions
- AI responses should be verified in integration tests

## 🛠 Future Extensions

- Team workflows and project agents
- GPT-generated listings and storefronts
- Chat + knowledge file synthesis
- Multi-agent autonomous workflows
