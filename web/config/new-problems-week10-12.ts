import type { Problem } from "@/types/problem";

export const NEW_PROBLEMS_10_12: Problem[] = [
  // ========== WEEK 10: Context Engineering & MCP ==========
  {
    id: "context-window-manager",
    type: "coding",
    title: "Sliding Window Context Manager",
    description: `Implement a sliding window context manager that tracks token usage and evicts messages by priority when the window is full.

You will implement a \`ContextWindowManager\` class:

1. **__init__(self, max_tokens, token_counter):** Initialize with a max token budget and a token counting function.

2. **add_message(self, message, priority):** Add a message dict (\`{"role": str, "content": str}\`) with a priority (higher = more important). If adding would exceed max_tokens, evict lowest-priority messages until it fits. Return True if added, False if the message itself exceeds max_tokens.

3. **get_context(self):** Return the current list of messages in insertion order.

4. **token_count(self):** Return total tokens currently in the window.

5. **evict_lowest(self):** Remove and return the lowest-priority message.

\`\`\`python
>>> mgr = ContextWindowManager(max_tokens=50, token_counter=lambda s: len(s.split()))
>>> mgr.add_message({"role": "system", "content": "You are helpful"}, priority=10)
True
>>> mgr.add_message({"role": "user", "content": "Hello there"}, priority=5)
True
>>> mgr.token_count()
5
>>> mgr.add_message({"role": "user", "content": " ".join(["word"] * 48)}, priority=8)
True  # evicts the priority-5 message to make room
>>> len(mgr.get_context())
2
\`\`\``,
    difficulty: "Medium",
    weekNumber: 10,
    tags: '["context-engineering", "token-management", "sliding-window", "memory"]',
    theory: `LLMs have fixed context windows. Every token in the prompt counts against this budget: system instructions, conversation history, retrieved documents, and the user's latest message. When the total exceeds the limit, you must decide what to drop.

**Priority-based eviction** assigns importance scores to each message. System prompts get high priority (never evict). Recent user messages get medium priority. Old assistant responses get low priority. Retrieved documents vary by relevance score. When space runs out, the manager evicts from the bottom of the priority queue.

**Token counting** matters because different tokenizers produce different counts for the same text. A word-split approximation works for prototyping, but production systems use the model's actual tokenizer (tiktoken for OpenAI, sentencepiece for others). Off-by-one errors in token counting cause silent truncation.

**Insertion order vs. priority order:** The context sent to the model must preserve conversation order (system, then chronological messages). The eviction order is by priority. These are independent orderings that the manager must track separately.`,
    hints: '["Store messages with both their insertion index and priority", "Use a min-heap or sorted structure keyed by priority for fast eviction", "Token count of a message = token_counter(message[\\"content\\"])", "When evicting, keep removing lowest-priority messages until enough space exists"]',
    visualizationComponent: "ContextWindowViz",
    sortOrder: 1,
    starterCode: `class ContextWindowManager:
    def __init__(self, max_tokens, token_counter):
        """
        Args:
            max_tokens: maximum token budget for the context window
            token_counter: callable that takes a string and returns token count
        """
        pass

    def add_message(self, message, priority=0):
        """
        Add a message to the context window. Evict low-priority messages if needed.

        Args:
            message: dict with "role" and "content" keys
            priority: int, higher = more important

        Returns:
            bool - True if added, False if message alone exceeds max_tokens
        """
        pass

    def get_context(self):
        """Return messages in insertion order."""
        pass

    def token_count(self):
        """Return total tokens currently in the window."""
        pass

    def evict_lowest(self):
        """Remove and return the lowest-priority message."""
        pass`,
    solution: `\`\`\`python
import heapq

class ContextWindowManager:
    def __init__(self, max_tokens, token_counter):
        self.max_tokens = max_tokens
        self.token_counter = token_counter
        self._messages = []  # list of (insertion_order, priority, message, tokens)
        self._current_tokens = 0
        self._counter = 0  # monotonic insertion counter

    def add_message(self, message, priority=0):
        msg_tokens = self.token_counter(message["content"])
        if msg_tokens > self.max_tokens:
            return False

        while self._current_tokens + msg_tokens > self.max_tokens and self._messages:
            self.evict_lowest()

        if self._current_tokens + msg_tokens > self.max_tokens:
            return False

        self._messages.append((self._counter, priority, message, msg_tokens))
        self._current_tokens += msg_tokens
        self._counter += 1
        return True

    def get_context(self):
        sorted_msgs = sorted(self._messages, key=lambda x: x[0])
        return [entry[2] for entry in sorted_msgs]

    def token_count(self):
        return self._current_tokens

    def evict_lowest(self):
        if not self._messages:
            return None
        lowest_idx = min(range(len(self._messages)), key=lambda i: self._messages[i][1])
        entry = self._messages.pop(lowest_idx)
        self._current_tokens -= entry[3]
        return entry[2]
\`\`\`

**Approach:** Store each message with its insertion order, priority, and token count. On add, evict the lowest-priority messages until space exists. Return messages sorted by insertion order for correct conversation sequencing.`,
    testCases: [
      {
        id: "t1",
        name: "Add message within budget",
        inputs: { max_tokens: 100, messages: [{ role: "user", content: "hello world" }], priorities: [5] },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Evicts lowest priority when full",
        inputs: { max_tokens: 10, messages: [{ role: "system", content: "be helpful" }, { role: "user", content: "short" }, { role: "user", content: "a longer message that needs room" }], priorities: [10, 1, 5] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Rejects message exceeding max_tokens",
        inputs: { max_tokens: 5, messages: [{ role: "user", content: "this message has way too many tokens to fit" }], priorities: [5] },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Preserves insertion order in get_context",
        inputs: { max_tokens: 50, messages: [{ role: "system", content: "sys" }, { role: "user", content: "first" }, { role: "assistant", content: "reply" }, { role: "user", content: "second" }], priorities: [10, 5, 3, 5] },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Multiple evictions for large message",
        inputs: { max_tokens: 20, messages: [{ role: "user", content: "a b c" }, { role: "user", content: "d e f" }, { role: "user", content: "g h i" }, { role: "user", content: "this needs fifteen tokens so evict multiple old ones please now" }], priorities: [1, 2, 3, 10] },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "conversation-memory-store",
    type: "coding",
    title: "Short-Term + Long-Term Memory Store",
    description: `Build a dual-memory system with short-term (recent messages) and long-term (persistent facts) stores, with retrieval by recency and relevance.

Implement a \`MemoryStore\` class:

1. **__init__(self, short_term_limit):** Initialize with a max number of short-term memories.

2. **add_short_term(self, message, timestamp):** Add a message to short-term memory. If at capacity, move the oldest to a discard pile.

3. **add_long_term(self, fact, embedding, metadata=None):** Store a persistent fact with its embedding vector and optional metadata.

4. **retrieve_recent(self, k):** Return the k most recent short-term memories.

5. **retrieve_relevant(self, query_embedding, k):** Return the k most relevant long-term memories by cosine similarity to the query embedding.

6. **consolidate(self, summarize_fn):** Summarize all short-term memories into a single long-term fact using the provided function.

\`\`\`python
>>> store = MemoryStore(short_term_limit=5)
>>> store.add_short_term("User asked about Python", timestamp=1.0)
>>> store.add_long_term("User prefers dark mode", embedding=np.array([0.1, 0.9, 0.0]))
>>> recent = store.retrieve_recent(k=1)
>>> recent[0]["message"]
"User asked about Python"
\`\`\``,
    difficulty: "Medium",
    weekNumber: 10,
    tags: '["memory-systems", "context-engineering", "retrieval", "embeddings"]',
    theory: `Human memory has distinct systems: working memory (limited, immediate), episodic memory (recent events), and semantic memory (long-term facts). LLM memory systems mirror this architecture.

**Short-term memory** holds the current conversation. It is bounded by a fixed size (e.g., last 20 messages). When full, old messages rotate out. Retrieval is by recency - the most recent messages are most relevant to the current turn.

**Long-term memory** stores persistent facts extracted from past conversations: user preferences, important decisions, recurring topics. These persist across sessions. Retrieval is by semantic similarity - given a query, find the most relevant stored facts using embedding cosine similarity.

**Consolidation** bridges the two: periodically summarize short-term memories into long-term facts. A summarization function extracts the key information (user preferences mentioned, decisions made, topics discussed) and stores it with an embedding for future retrieval.

**Production systems** (e.g., MemGPT) add a third tier: archival storage backed by a vector database for unbounded long-term memory. The three-tier design lets agents maintain context across sessions without blowing up the context window.`,
    hints: '["Use a list or deque for short-term memory, sorted by timestamp", "Cosine similarity: np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))", "consolidate should call summarize_fn on all short-term messages and add the result to long-term", "Store long-term facts as dicts with fact, embedding, and metadata fields"]',
    visualizationComponent: "MemorySystemViz",
    sortOrder: 2,
    starterCode: `import numpy as np
from collections import deque

class MemoryStore:
    def __init__(self, short_term_limit=20):
        """
        Args:
            short_term_limit: max number of short-term memories
        """
        pass

    def add_short_term(self, message, timestamp):
        """
        Add a message to short-term memory.

        Args:
            message: string content
            timestamp: float, unix timestamp
        """
        pass

    def add_long_term(self, fact, embedding, metadata=None):
        """
        Store a persistent fact with its embedding.

        Args:
            fact: string content
            embedding: numpy array
            metadata: optional dict of metadata
        """
        pass

    def retrieve_recent(self, k=5):
        """Return k most recent short-term memories."""
        pass

    def retrieve_relevant(self, query_embedding, k=5):
        """Return k most relevant long-term memories by cosine similarity."""
        pass

    def consolidate(self, summarize_fn):
        """
        Summarize short-term memories into a long-term fact.

        Args:
            summarize_fn: callable that takes list of message strings
                          and returns (summary_string, embedding_array)
        """
        pass`,
    solution: `\`\`\`python
import numpy as np
from collections import deque

class MemoryStore:
    def __init__(self, short_term_limit=20):
        self.short_term_limit = short_term_limit
        self.short_term = []  # list of {"message": str, "timestamp": float}
        self.long_term = []   # list of {"fact": str, "embedding": np.array, "metadata": dict}

    def add_short_term(self, message, timestamp):
        entry = {"message": message, "timestamp": timestamp}
        self.short_term.append(entry)
        self.short_term.sort(key=lambda x: x["timestamp"])
        while len(self.short_term) > self.short_term_limit:
            self.short_term.pop(0)

    def add_long_term(self, fact, embedding, metadata=None):
        self.long_term.append({
            "fact": fact,
            "embedding": np.array(embedding),
            "metadata": metadata or {},
        })

    def retrieve_recent(self, k=5):
        return self.short_term[-k:][::-1]  # most recent first

    def retrieve_relevant(self, query_embedding, k=5):
        if not self.long_term:
            return []
        query = np.array(query_embedding)
        scored = []
        for entry in self.long_term:
            sim = np.dot(query, entry["embedding"]) / (
                np.linalg.norm(query) * np.linalg.norm(entry["embedding"]) + 1e-10
            )
            scored.append((sim, entry))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [{"fact": e["fact"], "metadata": e["metadata"], "score": s} for s, e in scored[:k]]

    def consolidate(self, summarize_fn):
        if not self.short_term:
            return
        messages = [m["message"] for m in self.short_term]
        summary, embedding = summarize_fn(messages)
        self.add_long_term(summary, embedding, metadata={"source": "consolidation", "num_messages": len(messages)})
        self.short_term.clear()
\`\`\`

**Approach:** Short-term memory is a bounded list sorted by timestamp. Long-term memory stores facts with embeddings. Retrieval uses recency for short-term and cosine similarity for long-term. Consolidation summarizes and transfers short-term content to long-term.`,
    testCases: [
      {
        id: "t1",
        name: "Add and retrieve short-term memories",
        inputs: { short_term_limit: 5, messages: ["msg1", "msg2", "msg3"], timestamps: [1.0, 2.0, 3.0], retrieve_k: 2 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Short-term evicts oldest at capacity",
        inputs: { short_term_limit: 2, messages: ["old", "mid", "new"], timestamps: [1.0, 2.0, 3.0] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Retrieve relevant long-term memories",
        inputs: { facts: ["likes python", "hates java", "uses vim"], query_embedding: [0.9, 0.1, 0.0], k: 2 },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Consolidate moves short-term to long-term",
        inputs: { short_term_limit: 10, messages: ["discussed ML", "asked about GPT"], timestamps: [1.0, 2.0] },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Empty store returns empty results",
        inputs: { short_term_limit: 5, retrieve_k: 3 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "mcp-tool-router",
    type: "coding",
    title: "MCP Tool Router",
    description: `Implement a tool router that dispatches tool calls to the correct handler based on JSON schema matching.

Build a \`ToolRouter\` class:

1. **register_tool(self, name, schema, handler):** Register a tool with its JSON schema (describing expected parameters) and a handler function.

2. **validate_call(self, tool_name, arguments):** Validate that the arguments match the tool's registered schema. Return a list of validation errors (empty if valid).

3. **route(self, tool_call):** Given a tool call dict \`{"name": str, "arguments": dict}\`, validate the arguments and dispatch to the correct handler. Return the handler's result or raise an error.

4. **list_tools(self):** Return all registered tool schemas in MCP-compatible format.

\`\`\`python
>>> router = ToolRouter()
>>> router.register_tool("get_weather", {
...     "type": "object",
...     "properties": {"city": {"type": "string"}, "units": {"type": "string", "enum": ["celsius", "fahrenheit"]}},
...     "required": ["city"]
... }, handler=lambda city, units="celsius": f"{city}: 20{units[0]}")
>>> result = router.route({"name": "get_weather", "arguments": {"city": "London"}})
>>> result
"London: 20c"
\`\`\``,
    difficulty: "Medium",
    weekNumber: 10,
    tags: '["mcp", "tool-calling", "json-schema", "routing"]',
    theory: `The Model Context Protocol (MCP) standardizes how LLMs interact with external tools. A tool is defined by a JSON schema describing its inputs. The LLM generates a tool call with arguments, and a router validates and dispatches it to the correct handler.

**JSON Schema validation** checks type constraints (string, number, object), required fields, enum values, and nested structures. A tool call with missing required fields or wrong types should be rejected before reaching the handler.

**Routing** maps tool names to registered handlers. The router acts as a gateway: it receives the LLM's tool call, validates the arguments against the schema, and invokes the handler with the validated arguments. If validation fails, the router returns structured errors that the LLM can use to retry.

**MCP tool listing** returns all available tools with their schemas. The LLM uses this to decide which tool to call and how to format arguments. The schema serves dual purpose: documentation for the LLM and validation for the router.`,
    hints: '["For basic schema validation, check required fields and types without a full JSON Schema library", "Map Python types: \\"string\\" -> str, \\"number\\" -> (int, float), \\"boolean\\" -> bool, \\"object\\" -> dict, \\"array\\" -> list", "For enum validation, check if the value is in the allowed list", "Use **kwargs to pass validated arguments to the handler"]',
    visualizationComponent: "MCPToolViz",
    sortOrder: 3,
    starterCode: `class ToolRouter:
    def __init__(self):
        """Initialize the tool router."""
        pass

    def register_tool(self, name, schema, handler):
        """
        Register a tool with its schema and handler.

        Args:
            name: tool name string
            schema: JSON schema dict describing expected parameters
            handler: callable to invoke when this tool is called
        """
        pass

    def validate_call(self, tool_name, arguments):
        """
        Validate arguments against the tool's schema.

        Args:
            tool_name: name of the registered tool
            arguments: dict of arguments to validate

        Returns:
            list of error strings (empty if valid)
        """
        pass

    def route(self, tool_call):
        """
        Validate and dispatch a tool call.

        Args:
            tool_call: dict with "name" and "arguments" keys

        Returns:
            Result from the handler function

        Raises:
            ValueError: if tool not found or validation fails
        """
        pass

    def list_tools(self):
        """Return list of registered tools with their schemas."""
        pass`,
    solution: `\`\`\`python
class ToolRouter:
    TYPE_MAP = {
        "string": str,
        "number": (int, float),
        "integer": int,
        "boolean": bool,
        "object": dict,
        "array": list,
    }

    def __init__(self):
        self._tools = {}

    def register_tool(self, name, schema, handler):
        self._tools[name] = {"schema": schema, "handler": handler}

    def validate_call(self, tool_name, arguments):
        if tool_name not in self._tools:
            return [f"Unknown tool: {tool_name}"]

        schema = self._tools[tool_name]["schema"]
        errors = []

        required = schema.get("required", [])
        for field in required:
            if field not in arguments:
                errors.append(f"Missing required field: {field}")

        properties = schema.get("properties", {})
        for key, value in arguments.items():
            if key not in properties:
                continue
            prop_schema = properties[key]

            expected_type = prop_schema.get("type")
            if expected_type and expected_type in self.TYPE_MAP:
                if not isinstance(value, self.TYPE_MAP[expected_type]):
                    errors.append(f"Field '{key}' expected type {expected_type}, got {type(value).__name__}")

            if "enum" in prop_schema and value not in prop_schema["enum"]:
                errors.append(f"Field '{key}' must be one of {prop_schema['enum']}, got '{value}'")

        return errors

    def route(self, tool_call):
        name = tool_call["name"]
        arguments = tool_call.get("arguments", {})

        if name not in self._tools:
            raise ValueError(f"Unknown tool: {name}")

        errors = self.validate_call(name, arguments)
        if errors:
            raise ValueError(f"Validation errors: {'; '.join(errors)}")

        handler = self._tools[name]["handler"]
        return handler(**arguments)

    def list_tools(self):
        return [
            {"name": name, "schema": info["schema"]}
            for name, info in self._tools.items()
        ]
\`\`\`

**Approach:** Store tools in a dict keyed by name. Validation checks required fields, type constraints (mapped from JSON Schema types to Python types), and enum values. Routing validates first, then dispatches via **kwargs.`,
    testCases: [
      {
        id: "t1",
        name: "Route valid tool call",
        inputs: { tool_name: "greet", schema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] }, arguments: { name: "Alice" } },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Reject missing required field",
        inputs: { tool_name: "greet", schema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] }, arguments: {} },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Reject wrong type",
        inputs: { tool_name: "add", schema: { type: "object", properties: { a: { type: "number" }, b: { type: "number" } }, required: ["a", "b"] }, arguments: { a: "not a number", b: 5 } },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Enum validation",
        inputs: { tool_name: "set_mode", schema: { type: "object", properties: { mode: { type: "string", enum: ["fast", "slow"] } }, required: ["mode"] }, arguments: { mode: "invalid" } },
        isPublic: false,
      },
      {
        id: "t5",
        name: "List tools returns all registered",
        inputs: { num_tools: 3 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "multi-agent-message-passing",
    type: "coding",
    title: "Multi-Agent Message Bus",
    description: `Implement a message bus for a multi-agent system with role-based routing, broadcast, and message history.

Build a \`MessageBus\` class:

1. **register_agent(self, agent_id, roles):** Register an agent with a list of roles (e.g., ["planner", "coder"]).

2. **send(self, from_agent, to_agent, message, msg_type="direct"):** Send a direct message to a specific agent. Store in history.

3. **broadcast(self, from_agent, message, target_role=None):** Send to all agents (or all agents with a specific role). Store in history.

4. **get_inbox(self, agent_id, limit=None):** Return messages for an agent (direct + role-broadcast), most recent first.

5. **get_conversation(self, agent_a, agent_b):** Return all direct messages between two agents in chronological order.

\`\`\`python
>>> bus = MessageBus()
>>> bus.register_agent("planner", roles=["planner"])
>>> bus.register_agent("coder", roles=["coder"])
>>> bus.register_agent("reviewer", roles=["coder", "reviewer"])
>>> bus.send("planner", "coder", "Implement the parser")
>>> bus.broadcast("planner", "Sprint started", target_role="coder")
>>> inbox = bus.get_inbox("reviewer")
>>> len(inbox)  # got the broadcast (has "coder" role)
1
\`\`\``,
    difficulty: "Hard",
    weekNumber: 10,
    tags: '["multi-agent", "message-passing", "routing", "orchestration"]',
    theory: `Multi-agent systems need a communication layer. Agents are specialized: a planner decomposes tasks, a coder writes code, a reviewer checks quality. The message bus routes messages between them.

**Direct messaging** is point-to-point: agent A sends to agent B. The bus stores the message in B's inbox and in the global history. This handles task delegation and response passing.

**Role-based broadcast** sends a message to all agents with a matching role. When the planner says "sprint started" to all coders, every agent registered with the "coder" role receives it. This enables coordination patterns like fanout (one-to-many) and pub-sub.

**Message history** enables agents to build context. An agent's inbox contains both direct messages and relevant broadcasts. The conversation view filters to just the bilateral exchange between two agents. Production systems add message types (task, result, error, status) and priority levels.

**Ordering guarantees** matter: messages arrive in the order sent. In distributed systems this requires sequence numbers or vector clocks. For a single-process bus, append order suffices.`,
    hints: '["Store messages as dicts with from, to, content, type, and timestamp fields", "For broadcasts, iterate registered agents and filter by role", "An agent inbox = direct messages to them + broadcasts matching their roles", "Use a monotonic counter for message ordering"]',
    visualizationComponent: "MultiAgentViz",
    sortOrder: 4,
    starterCode: `import time

class MessageBus:
    def __init__(self):
        """Initialize the message bus."""
        pass

    def register_agent(self, agent_id, roles=None):
        """
        Register an agent with optional roles.

        Args:
            agent_id: unique string identifier
            roles: list of role strings
        """
        pass

    def send(self, from_agent, to_agent, message, msg_type="direct"):
        """
        Send a direct message.

        Args:
            from_agent: sender agent_id
            to_agent: recipient agent_id
            message: string content
            msg_type: message type label
        """
        pass

    def broadcast(self, from_agent, message, target_role=None):
        """
        Broadcast to all agents or those with a specific role.

        Args:
            from_agent: sender agent_id
            message: string content
            target_role: if set, only agents with this role receive it
        """
        pass

    def get_inbox(self, agent_id, limit=None):
        """Return messages for an agent, most recent first."""
        pass

    def get_conversation(self, agent_a, agent_b):
        """Return direct messages between two agents in chronological order."""
        pass`,
    solution: `\`\`\`python
import time

class MessageBus:
    def __init__(self):
        self._agents = {}  # agent_id -> {"roles": set}
        self._messages = []  # global ordered message log
        self._seq = 0

    def register_agent(self, agent_id, roles=None):
        self._agents[agent_id] = {"roles": set(roles or [])}

    def _make_msg(self, from_agent, to_agent, message, msg_type):
        self._seq += 1
        return {
            "seq": self._seq,
            "from": from_agent,
            "to": to_agent,
            "content": message,
            "type": msg_type,
            "timestamp": time.time(),
        }

    def send(self, from_agent, to_agent, message, msg_type="direct"):
        msg = self._make_msg(from_agent, to_agent, message, msg_type)
        self._messages.append(msg)

    def broadcast(self, from_agent, message, target_role=None):
        for agent_id, info in self._agents.items():
            if agent_id == from_agent:
                continue
            if target_role and target_role not in info["roles"]:
                continue
            msg = self._make_msg(from_agent, agent_id, message, "broadcast")
            self._messages.append(msg)

    def get_inbox(self, agent_id, limit=None):
        inbox = [m for m in self._messages if m["to"] == agent_id]
        inbox.sort(key=lambda m: m["seq"], reverse=True)
        if limit:
            inbox = inbox[:limit]
        return inbox

    def get_conversation(self, agent_a, agent_b):
        convo = [
            m for m in self._messages
            if m["type"] == "direct"
            and ((m["from"] == agent_a and m["to"] == agent_b)
                 or (m["from"] == agent_b and m["to"] == agent_a))
        ]
        convo.sort(key=lambda m: m["seq"])
        return convo
\`\`\`

**Approach:** Messages are stored in a global ordered log with sequence numbers. Inbox filters by recipient. Broadcast creates individual messages for each matching agent. Conversation view filters bilateral direct messages.`,
    testCases: [
      {
        id: "t1",
        name: "Direct message appears in inbox",
        inputs: { agents: [["a", ["planner"]], ["b", ["coder"]]], send: ["a", "b", "do task"] },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Role broadcast reaches correct agents",
        inputs: { agents: [["a", ["planner"]], ["b", ["coder"]], ["c", ["reviewer"]]], broadcast: ["a", "hello coders", "coder"] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Conversation returns bilateral messages",
        inputs: { agents: [["a", []], ["b", []]], messages: [["a", "b", "hi"], ["b", "a", "hey"], ["a", "b", "ok"]] },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Inbox respects limit",
        inputs: { agents: [["a", []], ["b", []]], num_messages: 10, limit: 3 },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Broadcast excludes sender",
        inputs: { agents: [["a", ["dev"]], ["b", ["dev"]]], broadcast: ["a", "msg", "dev"] },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "context-engineering-quiz",
    type: "quiz",
    title: "Context Engineering Fundamentals",
    description: "Test your understanding of context windows, token budgets, memory systems, and context management strategies for LLM applications.",
    difficulty: "Medium",
    weekNumber: 10,
    tags: '["context-engineering", "token-management", "memory", "quiz"]',
    theory: `Context engineering is the discipline of deciding what information enters the LLM's context window and in what order. The context window is finite (4K to 2M tokens depending on model), and every token has a cost: monetary, latency, and attention dilution.

**Token budget allocation** partitions the window into segments: system prompt (fixed instructions), retrieved context (RAG documents), conversation history (recent messages), and the user's current input. Each segment has a budget. The system prompt might get 500 tokens, retrieved docs 2000, history 1000, and the rest for the user message and model response.

**Priority-based management** assigns importance to each piece of context. System instructions are critical (never evict). Recent user messages are high priority. Older assistant responses are low priority. Retrieved documents are ranked by relevance score. When the total exceeds the budget, the manager evicts from the bottom of the priority list.

**Memory architectures** extend beyond the context window. Short-term memory is the current context. Long-term memory persists across sessions in a vector store or database. Consolidation pipelines summarize conversations into persistent facts. MemGPT introduced the idea of LLM-managed virtual memory with explicit load/save operations.

**Lost-in-the-middle** is a documented failure mode: information placed in the middle of a long context is retrieved less reliably than information at the beginning or end. Context engineering accounts for this by placing critical information at the edges of the context window.`,
    hints: '[]',
    visualizationComponent: "ContextWindowViz",
    sortOrder: 5,
    starterCode: null,
    testCases: null,
    questions: [
      {
        id: "w10-q1-1",
        questionNumber: 1,
        questionText: "A context window has 8192 tokens. Your system prompt uses 600, retrieved docs use 3000, and conversation history uses 2500. How many tokens remain for the user message and model response combined?",
        options: {
          a: "1092 tokens",
          b: "2092 tokens",
          c: "3092 tokens",
          d: "4092 tokens",
        },
        correctAnswer: "b",
        explanation: "8192 - 600 - 3000 - 2500 = 2092 tokens remain. This budget must cover both the user's input and the model's generated response. If the user message is long, the max_tokens for generation must be reduced accordingly.",
      },
      {
        id: "w10-q1-2",
        questionNumber: 2,
        questionText: "The 'lost-in-the-middle' phenomenon in long-context LLMs means:",
        options: {
          a: "Models cannot process contexts longer than 4096 tokens",
          b: "Information placed in the middle of the context is retrieved less reliably than at the beginning or end",
          c: "The middle layers of the transformer lose information due to gradient vanishing",
          d: "Tokenization errors occur more frequently in the middle of long documents",
        },
        correctAnswer: "b",
        explanation: "Research by Liu et al. (2023) showed that LLMs perform best when relevant information is at the very beginning or very end of the context. Performance degrades for information placed in the middle, even for models with long context windows. This is a retrieval/attention pattern, not a tokenization or architecture issue.",
      },
      {
        id: "w10-q1-3",
        questionNumber: 3,
        questionText: "In a MemGPT-style memory architecture, what distinguishes it from simply stuffing everything into the context window?",
        options: {
          a: "MemGPT uses a smaller model that needs less context",
          b: "MemGPT lets the LLM explicitly manage virtual memory with load/save operations, paging information in and out of context",
          c: "MemGPT compresses all text to half its original length",
          d: "MemGPT eliminates the need for a context window entirely",
        },
        correctAnswer: "b",
        explanation: "MemGPT treats the context window like an OS treats main memory. The LLM can issue function calls to load facts from long-term storage into its working context, or save current context to long-term storage. This gives the LLM explicit control over what it 'remembers' at any given time, rather than relying on a fixed sliding window.",
      },
      {
        id: "w10-q1-4",
        questionNumber: 4,
        questionText: "When allocating token budgets, which strategy best handles variable-length user inputs?",
        options: {
          a: "Assign fixed budgets to all segments and truncate anything that overflows",
          b: "Give the user message the entire context window minus the system prompt",
          c: "Use dynamic allocation: fix the system prompt budget, then allocate remaining tokens proportionally based on actual content lengths",
          d: "Always use the maximum context window regardless of input length",
        },
        correctAnswer: "c",
        explanation: "Dynamic allocation fixes only what must be fixed (system prompt) and distributes the rest based on actual needs. A short user message frees tokens for more retrieved context. A long user message reduces the retrieval budget. Static allocation wastes tokens on unused segments or truncates important content.",
      },
      {
        id: "w10-q1-5",
        questionNumber: 5,
        questionText: "A consolidation pipeline in a memory system serves what purpose?",
        options: {
          a: "Compresses the model weights to reduce inference cost",
          b: "Summarizes short-term conversation memories into persistent long-term facts",
          c: "Converts text embeddings back into readable text",
          d: "Deduplicates identical messages in the conversation history",
        },
        correctAnswer: "b",
        explanation: "Consolidation bridges short-term and long-term memory. After a conversation, a summarization step extracts key facts (user preferences, decisions made, important information) and stores them with embeddings in long-term memory. Future sessions can retrieve these facts without replaying the entire conversation history.",
      },
    ],
    solution: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "token-budget-allocator",
    type: "coding",
    title: "Token Budget Allocator",
    description: `Implement a token budget allocator that distributes a fixed context window across multiple segments: system prompt, retrieved context, conversation history, and response reserve.

Implement:

1. **allocate_budget(total_tokens, segments):** Given total tokens and a list of segment dicts \`{"name": str, "content": str, "priority": int, "min_tokens": int}\`, allocate tokens to each segment. Higher priority segments get their full token count first. Lower priority segments split the remainder. Each segment gets at least min_tokens.

2. **truncate_to_budget(content, max_tokens, token_counter):** Truncate content to fit within max_tokens (by sentences, preserving complete sentences).

3. **build_prompt(allocations, token_counter):** Given the allocations, truncate each segment's content to its budget and assemble the final prompt string.

\`\`\`python
>>> segments = [
...     {"name": "system", "content": "You are helpful.", "priority": 10, "min_tokens": 0},
...     {"name": "context", "content": "Doc1... Doc2... Doc3...", "priority": 5, "min_tokens": 50},
...     {"name": "history", "content": "User: hi\\nAssistant: hello", "priority": 3, "min_tokens": 20},
... ]
>>> allocs = allocate_budget(total_tokens=500, segments=segments)
>>> allocs["system"]["budget"]  # gets full allocation (highest priority)
3
\`\`\``,
    difficulty: "Easy",
    weekNumber: 10,
    tags: '["context-engineering", "token-budget", "prompt-construction"]',
    theory: `Token budget allocation decides how many tokens each part of the prompt gets. A naive approach gives fixed budgets, but this wastes tokens when segments are short and truncates when they are long.

**Priority-based allocation** processes segments in priority order. The highest priority segment (system prompt) gets its full token count. The next highest gets up to its full count from the remaining budget. Lower-priority segments split whatever remains.

**Minimum guarantees** ensure every segment gets at least some representation. Even if the budget is tight, conversation history should have at least enough tokens for the most recent exchange. Min_tokens prevents complete starvation of any segment.

**Sentence-level truncation** preserves readability. Rather than cutting mid-word or mid-sentence, truncate at the last complete sentence that fits within the budget. This prevents the model from seeing incomplete information that could cause hallucination.`,
    hints: '["Sort segments by priority (descending) before allocating", "For each segment, its budget = min(actual_token_count, remaining_budget)", "Enforce min_tokens by reserving them before the main allocation pass", "For sentence truncation, split on periods and add sentences until the budget is reached"]',
    visualizationComponent: "TokenBudgetViz",
    sortOrder: 7,
    starterCode: `def allocate_budget(total_tokens, segments, token_counter=None):
    """
    Allocate token budget across segments by priority.

    Args:
        total_tokens: total available tokens
        segments: list of {"name": str, "content": str, "priority": int, "min_tokens": int}
        token_counter: callable(str) -> int, defaults to word count

    Returns:
        dict mapping segment name to {"content": str, "budget": int}
    """
    if token_counter is None:
        token_counter = lambda s: len(s.split())
    pass

def truncate_to_budget(content, max_tokens, token_counter=None):
    """
    Truncate content to fit within max_tokens, preserving complete sentences.

    Args:
        content: string to truncate
        max_tokens: maximum token count
        token_counter: callable(str) -> int

    Returns:
        str - truncated content
    """
    if token_counter is None:
        token_counter = lambda s: len(s.split())
    pass

def build_prompt(allocations, token_counter=None):
    """
    Assemble final prompt from allocated segments.

    Args:
        allocations: dict from allocate_budget
        token_counter: callable(str) -> int

    Returns:
        str - assembled prompt
    """
    if token_counter is None:
        token_counter = lambda s: len(s.split())
    pass`,
    solution: `\`\`\`python
def allocate_budget(total_tokens, segments, token_counter=None):
    if token_counter is None:
        token_counter = lambda s: len(s.split())

    # Calculate actual token counts
    for seg in segments:
        seg["actual_tokens"] = token_counter(seg["content"])

    # Reserve minimums first
    reserved = sum(seg.get("min_tokens", 0) for seg in segments)
    remaining = total_tokens - reserved

    # Sort by priority descending
    sorted_segs = sorted(segments, key=lambda s: s["priority"], reverse=True)

    allocations = {}
    for seg in sorted_segs:
        min_t = seg.get("min_tokens", 0)
        need = seg["actual_tokens"] - min_t  # additional tokens beyond minimum
        extra = max(0, min(need, remaining))
        budget = min_t + extra
        remaining -= extra
        allocations[seg["name"]] = {"content": seg["content"], "budget": budget}

    return allocations

def truncate_to_budget(content, max_tokens, token_counter=None):
    if token_counter is None:
        token_counter = lambda s: len(s.split())

    if token_counter(content) <= max_tokens:
        return content

    sentences = content.replace("\\n", " ").split(". ")
    result = []
    for sent in sentences:
        candidate = ". ".join(result + [sent])
        if result:
            candidate += "."
        if token_counter(candidate) > max_tokens:
            break
        result.append(sent)

    return ". ".join(result) + ("." if result else "")

def build_prompt(allocations, token_counter=None):
    if token_counter is None:
        token_counter = lambda s: len(s.split())

    parts = []
    for name, info in allocations.items():
        truncated = truncate_to_budget(info["content"], info["budget"], token_counter)
        parts.append(truncated)

    return "\\n\\n".join(parts)
\`\`\`

**Approach:** Reserve minimum tokens first, then distribute remaining budget in priority order. Truncation operates at sentence boundaries. Assembly joins truncated segments with double newlines.`,
    testCases: [
      {
        id: "t1",
        name: "High priority gets full budget",
        inputs: { total_tokens: 100, segments: [{ name: "sys", content: "be helpful", priority: 10, min_tokens: 0 }, { name: "ctx", content: "a long context string with many words", priority: 5, min_tokens: 0 }] },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Min tokens are respected",
        inputs: { total_tokens: 10, segments: [{ name: "a", content: "word ".repeat(20).trim(), priority: 10, min_tokens: 3 }, { name: "b", content: "word ".repeat(20).trim(), priority: 1, min_tokens: 3 }] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Truncation preserves complete sentences",
        inputs: { content: "First sentence. Second sentence. Third sentence.", max_tokens: 4 },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Build prompt assembles all segments",
        inputs: { total_tokens: 50, num_segments: 3 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "memory-compression",
    type: "coding",
    title: "Conversation Memory Compression",
    description: `Implement extractive summarization to compress conversation history while preserving key facts, decisions, and user preferences.

Implement:

1. **extract_key_sentences(conversation, max_sentences):** Score each sentence by importance (keyword density, named entities, question/answer pairs) and return the top sentences in original order.

2. **extract_facts(conversation):** Extract structured facts from conversation: user preferences, decisions made, entities mentioned, action items. Return as a list of fact dicts.

3. **compress_history(messages, target_ratio, token_counter):** Compress a list of message dicts to target_ratio of original token count. Use extractive summarization on assistant messages while preserving all user messages.

\`\`\`python
>>> messages = [
...     {"role": "user", "content": "I prefer Python over Java for ML projects"},
...     {"role": "assistant", "content": "Great choice. Python has excellent ML libraries like PyTorch, TensorFlow, and scikit-learn. The ecosystem is mature and well-documented. Java has some ML tools but Python dominates the field."},
...     {"role": "user", "content": "What about deployment?"},
... ]
>>> result = compress_history(messages, target_ratio=0.5, token_counter=lambda s: len(s.split()))
>>> # Assistant message compressed, user messages preserved
\`\`\``,
    difficulty: "Hard",
    weekNumber: 10,
    tags: '["memory", "compression", "summarization", "context-engineering"]',
    theory: `As conversations grow, they consume the entire context window. Compression reduces token count while retaining information that matters for future turns.

**Extractive summarization** selects the most important sentences from the original text. Unlike abstractive summarization (which generates new text), extractive methods preserve exact wording, avoiding hallucinated facts. Importance scoring considers: keyword density (sentences with rare, specific terms score higher), presence of named entities (people, tools, dates), and structural cues (sentences starting with "I prefer", "We decided", "The key point").

**Fact extraction** goes beyond sentence selection. It identifies structured information: user preferences ("I prefer dark mode"), decisions ("we will use PostgreSQL"), action items ("need to implement caching"), and entity references. These facts are stored as structured data, not raw text, enabling precise retrieval.

**Asymmetric compression** treats user and assistant messages differently. User messages are short and information-dense - compress them less. Assistant messages are verbose explanations - compress them more. This preserves the user's intent while reducing the assistant's redundant elaboration.

**Target ratio** controls compression aggressiveness. A ratio of 0.5 means the compressed output should be roughly half the original token count. The algorithm selects sentences until the budget is reached.`,
    hints: '["Score sentences by counting capitalized words, specific keywords, and question marks", "For fact extraction, look for patterns like \\"I prefer\\", \\"we decided\\", \\"use X\\"", "Preserve user messages fully - only compress assistant messages", "Select top-scoring sentences until token budget is reached"]',
    visualizationComponent: "MemoryCompressionViz",
    sortOrder: 8,
    starterCode: `import re

def extract_key_sentences(text, max_sentences=3):
    """
    Extract the most important sentences from text.

    Args:
        text: input text string
        max_sentences: maximum sentences to return

    Returns:
        list of selected sentences in original order
    """
    pass

def extract_facts(conversation):
    """
    Extract structured facts from conversation messages.

    Args:
        conversation: list of {"role": str, "content": str}

    Returns:
        list of {"type": str, "content": str, "source_role": str}
    """
    pass

def compress_history(messages, target_ratio=0.5, token_counter=None):
    """
    Compress conversation history to target ratio.

    Args:
        messages: list of {"role": str, "content": str}
        target_ratio: float, target size as fraction of original
        token_counter: callable(str) -> int

    Returns:
        list of {"role": str, "content": str} - compressed messages
    """
    if token_counter is None:
        token_counter = lambda s: len(s.split())
    pass`,
    solution: `\`\`\`python
import re

def score_sentence(sentence):
    score = 0
    # Length bonus (not too short, not too long)
    words = sentence.split()
    if 5 <= len(words) <= 30:
        score += 1
    # Named entity proxy: capitalized words (not sentence-start)
    caps = re.findall(r'(?<!^)(?<!\\.\\s)[A-Z][a-z]+', sentence)
    score += len(caps) * 0.5
    # Specific keywords
    important_keywords = ["important", "key", "must", "should", "prefer", "decided", "because", "however", "therefore"]
    for kw in important_keywords:
        if kw in sentence.lower():
            score += 1
    # Questions and answers
    if "?" in sentence:
        score += 0.5
    # Preference/decision patterns
    if re.search(r'\\b(I prefer|we decided|use |choose |recommend)', sentence, re.IGNORECASE):
        score += 2
    return score

def extract_key_sentences(text, max_sentences=3):
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\\s+', text) if s.strip()]
    if len(sentences) <= max_sentences:
        return sentences
    scored = [(i, score_sentence(s), s) for i, s in enumerate(sentences)]
    scored.sort(key=lambda x: x[1], reverse=True)
    selected = scored[:max_sentences]
    selected.sort(key=lambda x: x[0])  # restore original order
    return [s for _, _, s in selected]

def extract_facts(conversation):
    facts = []
    patterns = {
        "preference": r'(?:I prefer|I like|I want|I use|my favorite)\\s+(.+?)(?:\\.|$)',
        "decision": r'(?:we decided|we will|we should|let\\'s use|going with)\\s+(.+?)(?:\\.|$)',
        "action_item": r'(?:need to|must|TODO|action item|should implement)\\s+(.+?)(?:\\.|$)',
    }
    for msg in conversation:
        for fact_type, pattern in patterns.items():
            matches = re.findall(pattern, msg["content"], re.IGNORECASE)
            for match in matches:
                facts.append({
                    "type": fact_type,
                    "content": match.strip(),
                    "source_role": msg["role"],
                })
    return facts

def compress_history(messages, target_ratio=0.5, token_counter=None):
    if token_counter is None:
        token_counter = lambda s: len(s.split())

    total_tokens = sum(token_counter(m["content"]) for m in messages)
    target_tokens = int(total_tokens * target_ratio)

    compressed = []
    used_tokens = 0

    for msg in messages:
        msg_tokens = token_counter(msg["content"])
        if msg["role"] == "user":
            compressed.append({"role": msg["role"], "content": msg["content"]})
            used_tokens += msg_tokens
        else:
            remaining_budget = target_tokens - used_tokens
            if remaining_budget <= 0:
                continue
            sentences = extract_key_sentences(msg["content"])
            result = ". ".join(sentences)
            if not result.endswith("."):
                result += "."
            result_tokens = token_counter(result)
            if result_tokens > remaining_budget:
                words = result.split()[:remaining_budget]
                result = " ".join(words)
            compressed.append({"role": msg["role"], "content": result})
            used_tokens += token_counter(result)

    return compressed
\`\`\`

**Approach:** Score sentences by keyword density, entity presence, and structural patterns. Extract facts using regex patterns for preferences, decisions, and action items. Compression preserves user messages fully and applies extractive summarization to assistant messages within the token budget.`,
    testCases: [
      {
        id: "t1",
        name: "Extract key sentences from text",
        inputs: { text: "The weather is nice. We decided to use PostgreSQL for the database. It was a Tuesday. Python is the preferred language because of its ML ecosystem.", max_sentences: 2 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Extract facts from conversation",
        inputs: { conversation: [{ role: "user", content: "I prefer Python over Java" }, { role: "assistant", content: "We decided to use Python for the project." }] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Compress preserves user messages",
        inputs: { messages: [{ role: "user", content: "short" }, { role: "assistant", content: "a very long response with many words that should be compressed significantly" }], target_ratio: 0.5 },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Compression meets target ratio",
        inputs: { num_messages: 10, target_ratio: 0.3 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "multi-agent-system-design",
    type: "system_design",
    title: "Design a Multi-Agent Customer Support System",
    description: "Design a multi-agent system for automated customer support that handles routing, escalation, tool use, and memory across conversations.",
    difficulty: "Hard",
    weekNumber: 10,
    tags: '["multi-agent", "system-design", "mcp", "customer-support", "orchestration"]',
    theory: `Multi-agent customer support systems decompose the monolithic chatbot into specialized agents. Each agent handles a domain (billing, technical, general) with domain-specific tools, knowledge bases, and conversation styles.

**Routing** is the first decision: which agent handles this request? A classifier agent analyzes the user's message and routes to the appropriate specialist. Misrouting wastes time and produces poor responses. The router must handle ambiguous requests (billing question with a technical component) and multi-intent messages.

**Tool integration via MCP** gives each agent access to relevant APIs. The billing agent can look up invoices and process refunds. The technical agent can check system status and query documentation. MCP provides the schema-based tool calling protocol that keeps agent-tool interactions validated and structured.

**Memory across conversations** ensures continuity. If a customer calls back about the same issue, the system retrieves the prior conversation summary, the customer's known preferences, and any open tickets. This requires a persistent memory layer linked to customer identity.

**Escalation** handles cases where automation fails. Confidence scoring on agent responses triggers escalation to a human when the agent is uncertain. The handoff includes full conversation context so the human does not start from scratch.`,
    hints: '["Consider how agents hand off context to each other during routing", "Think about what happens when a request spans multiple domains", "Address how you maintain conversation state across sessions", "Include fallback and escalation paths for edge cases"]',
    visualizationComponent: "MultiAgentViz",
    sortOrder: 9,
    starterCode: null,
    testCases: null,
    questions: null,
    designPrompt: `Design a multi-agent customer support system for a SaaS company with 50,000 users. The system handles billing questions, technical support, account management, and general inquiries.

Requirements:
- Must route requests to the correct specialist agent within 1 second
- Must maintain conversation context across multiple sessions with the same customer
- Must integrate with external tools (billing API, ticket system, knowledge base) via MCP
- Must escalate to human agents when confidence is low
- Must handle multi-intent messages (e.g., "my payment failed AND I can't log in")

Your design should address:

1. **Agent Architecture:** What agents exist? What are their specializations? How do they communicate?

2. **Routing Logic:** How does the system decide which agent handles a request? How do you handle multi-intent messages?

3. **Tool Integration:** What MCP tools does each agent have access to? How are tool schemas defined?

4. **Memory System:** How do you maintain context within and across sessions? What gets stored in short-term vs long-term memory?

5. **Escalation Policy:** When does the system escalate to humans? How is context transferred during handoff?

6. **Failure Handling:** What happens when an agent produces a low-confidence response? How do you handle tool failures?`,
    sampleAnswer: `## Architecture

\`\`\`
User Message -> Router Agent -> Specialist Agent (with MCP tools) -> Response
                    |                    |
                    v                    v
            Intent Classifier     Memory Store (short-term + long-term)
                    |                    |
                    v                    v
            Multi-intent Splitter  Escalation Monitor -> Human Agent
\`\`\`

## Agents

**Router Agent:** Classifies intent and routes to specialists. Uses a fine-tuned classifier (not LLM inference) for speed. Handles multi-intent by splitting into sub-requests dispatched in parallel.

**Billing Agent:** Handles payment issues, invoices, refunds, plan changes. MCP tools: lookup_invoice, process_refund, get_plan_details, update_subscription.

**Technical Agent:** Handles bugs, feature questions, integrations. MCP tools: check_system_status, search_docs, create_ticket, get_user_config.

**Account Agent:** Handles login issues, profile changes, permissions. MCP tools: reset_password, update_profile, check_permissions, get_login_history.

**General Agent:** Handles everything that doesn't fit above. Fallback for misrouted requests. Can re-route to specialists.

## Routing Logic

**Fast path:** Keyword + embedding classifier (fine-tuned DistilBERT) runs in <50ms. Confidence threshold: 0.85.

**Ambiguous path:** If confidence < 0.85, the Router Agent (LLM) analyzes the message and decides. Takes ~500ms.

**Multi-intent:** Split message into segments. Example: "my payment failed AND I can't log in" -> billing sub-request + account sub-request. Run specialists in parallel, merge responses.

## Tool Integration (MCP)

Each agent has a registered tool set with JSON schemas:

\`\`\`json
{
  "name": "lookup_invoice",
  "description": "Look up invoice details by invoice ID or date range",
  "parameters": {
    "type": "object",
    "properties": {
      "invoice_id": {"type": "string"},
      "date_from": {"type": "string", "format": "date"},
      "date_to": {"type": "string", "format": "date"}
    }
  }
}
\`\`\`

Tool calls are validated against schemas before execution. Failed validations return structured errors for LLM retry.

## Memory System

**Short-term (per session):** Current conversation messages in a sliding window. Max 20 messages. Stored in Redis with 30-minute TTL.

**Long-term (per customer):** Vector store (Pinecone) with customer-specific memories. Contains: past issue summaries, known preferences, resolution history. Queried by semantic similarity at session start.

**Consolidation:** After each session ends, a background job extracts facts (issue type, resolution, preferences discovered) and stores them as long-term memories with embeddings.

## Escalation Policy

**Automatic escalation triggers:**
- Agent confidence < 0.6 on response
- Customer explicitly requests human
- 3+ failed tool calls in a session
- Customer sentiment score drops below threshold
- Sensitive topics detected (legal, safety)

**Handoff:** Full conversation transcript + extracted context summary + customer long-term memory profile sent to human agent. Human sees: "Customer has billing issue, 2 previous contacts about same problem, refund was previously denied."

## Failure Handling

**Tool failure:** Retry once. If still failing, inform user of the issue and offer to create a ticket for follow-up. Never hallucinate tool results.

**Misrouting:** General Agent detects domain-specific questions and re-routes. Track misrouting rate per category for classifier retraining.

**Low confidence:** Qualify the response: "Based on what I can see, [answer]. Would you like me to connect you with a specialist?" This is better than a confident wrong answer.`,
    rubric: [
      {
        criterion: "Agent Architecture",
        weight: 0.25,
        description: "Clear specialist agents with well-defined responsibilities and communication patterns",
        keyPoints: ["Specialized agents per domain", "Clear communication protocol", "Router agent design"],
      },
      {
        criterion: "Tool Integration",
        weight: 0.2,
        description: "MCP-based tool schemas with validation and error handling",
        keyPoints: ["Schema definitions per agent", "Validation before execution", "Tool failure handling"],
      },
      {
        criterion: "Memory System",
        weight: 0.25,
        description: "Short-term and long-term memory with cross-session continuity",
        keyPoints: ["Dual memory architecture", "Consolidation pipeline", "Customer-specific retrieval"],
      },
      {
        criterion: "Escalation & Failure Handling",
        weight: 0.2,
        description: "Clear escalation triggers with context-preserving handoff",
        keyPoints: ["Confidence-based escalation", "Context transfer to humans", "Graceful degradation"],
      },
      {
        criterion: "Routing Quality",
        weight: 0.1,
        description: "Fast, accurate routing with multi-intent support",
        keyPoints: ["Fast classifier for common cases", "LLM fallback for ambiguous cases", "Multi-intent splitting"],
      },
    ],
  },
  {
    id: "tool-schema-validator",
    type: "coding",
    title: "MCP Tool Schema Validator",
    description: `Validate MCP tool schemas and function call arguments against those schemas.

Implement:

1. **validate_schema(schema):** Check that a tool schema is well-formed: must have "type": "object", "properties" must be a dict, "required" must list strings that exist in properties. Return a list of errors.

2. **validate_arguments(arguments, schema):** Validate function call arguments against a schema. Check required fields, types, enum values, and nested objects. Return a list of errors.

3. **generate_example(schema):** Generate a valid example arguments dict from a schema using default-like values ("string" -> "example", "number" -> 0, "boolean" -> true).

\`\`\`python
>>> schema = {
...     "type": "object",
...     "properties": {
...         "query": {"type": "string"},
...         "limit": {"type": "integer", "minimum": 1, "maximum": 100}
...     },
...     "required": ["query"]
... }
>>> validate_schema(schema)
[]  # no errors
>>> validate_arguments({"limit": 5}, schema)
["Missing required field: query"]
>>> validate_arguments({"query": "test", "limit": 200}, schema)
["Field 'limit' exceeds maximum 100"]
\`\`\``,
    difficulty: "Easy",
    weekNumber: 10,
    tags: '["mcp", "json-schema", "validation", "tool-calling"]',
    theory: `JSON Schema validation is the safety net between LLM-generated tool calls and actual tool execution. Without validation, a malformed tool call could cause runtime errors, inject unexpected data, or trigger unintended side effects.

**Schema validation** checks the schema itself: is it well-formed? Does it have the required "type" field? Are "required" fields listed in "properties"? This catches configuration errors when tools are registered.

**Argument validation** checks the LLM's output against the schema. Required fields must be present. Values must match declared types. Numbers must respect minimum/maximum constraints. Strings must match enum values if declared. Nested objects must recursively validate.

**Example generation** from schemas helps with testing and documentation. Given a schema, produce a valid example by mapping types to default values. This is useful for showing the LLM what a correct tool call looks like.`,
    hints: '["Check schema has type=object and properties is a dict", "For argument validation, iterate required fields first, then check types", "For minimum/maximum, only check if the value is a number", "For generate_example, map each type to a sensible default"]',
    visualizationComponent: "MCPToolViz",
    sortOrder: 10,
    starterCode: `def validate_schema(schema):
    """
    Validate that a tool schema is well-formed.

    Args:
        schema: dict representing a JSON schema

    Returns:
        list of error strings (empty if valid)
    """
    pass

def validate_arguments(arguments, schema):
    """
    Validate arguments against a tool schema.

    Args:
        arguments: dict of arguments
        schema: JSON schema dict

    Returns:
        list of error strings (empty if valid)
    """
    pass

def generate_example(schema):
    """
    Generate example arguments from a schema.

    Args:
        schema: JSON schema dict

    Returns:
        dict of example arguments
    """
    pass`,
    solution: `\`\`\`python
def validate_schema(schema):
    errors = []
    if not isinstance(schema, dict):
        return ["Schema must be a dict"]
    if schema.get("type") != "object":
        errors.append("Schema type must be 'object'")
    props = schema.get("properties")
    if props is not None and not isinstance(props, dict):
        errors.append("'properties' must be a dict")
    required = schema.get("required", [])
    if not isinstance(required, list):
        errors.append("'required' must be a list")
    else:
        prop_keys = set((props or {}).keys())
        for field in required:
            if not isinstance(field, str):
                errors.append(f"Required field must be a string, got {type(field).__name__}")
            elif field not in prop_keys:
                errors.append(f"Required field '{field}' not found in properties")
    return errors

TYPE_MAP = {
    "string": str,
    "number": (int, float),
    "integer": int,
    "boolean": bool,
    "object": dict,
    "array": list,
}

def validate_arguments(arguments, schema):
    errors = []
    properties = schema.get("properties", {})
    required = schema.get("required", [])

    for field in required:
        if field not in arguments:
            errors.append(f"Missing required field: {field}")

    for key, value in arguments.items():
        if key not in properties:
            continue
        prop = properties[key]
        expected_type = prop.get("type")
        if expected_type and expected_type in TYPE_MAP:
            if not isinstance(value, TYPE_MAP[expected_type]):
                errors.append(f"Field '{key}' expected type {expected_type}, got {type(value).__name__}")
                continue
        if "enum" in prop and value not in prop["enum"]:
            errors.append(f"Field '{key}' must be one of {prop['enum']}, got '{value}'")
        if "minimum" in prop and isinstance(value, (int, float)) and value < prop["minimum"]:
            errors.append(f"Field '{key}' below minimum {prop['minimum']}")
        if "maximum" in prop and isinstance(value, (int, float)) and value > prop["maximum"]:
            errors.append(f"Field '{key}' exceeds maximum {prop['maximum']}")

    return errors

DEFAULTS = {
    "string": "example",
    "number": 0,
    "integer": 0,
    "boolean": True,
    "object": {},
    "array": [],
}

def generate_example(schema):
    properties = schema.get("properties", {})
    example = {}
    for key, prop in properties.items():
        if "enum" in prop:
            example[key] = prop["enum"][0]
        elif "default" in prop:
            example[key] = prop["default"]
        else:
            t = prop.get("type", "string")
            example[key] = DEFAULTS.get(t, None)
    return example
\`\`\`

**Approach:** Schema validation checks structural requirements (type=object, properties is a dict, required fields exist). Argument validation checks required fields, types, enums, and min/max constraints. Example generation maps schema types to sensible defaults.`,
    testCases: [
      {
        id: "t1",
        name: "Valid schema passes validation",
        inputs: { schema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] } },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Missing required field detected",
        inputs: { schema: { type: "object", properties: { x: { type: "number" } }, required: ["x"] }, arguments: {} },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Type mismatch detected",
        inputs: { schema: { type: "object", properties: { count: { type: "integer" } } }, arguments: { count: "five" } },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Min/max validation",
        inputs: { schema: { type: "object", properties: { age: { type: "integer", minimum: 0, maximum: 150 } } }, arguments: { age: -1 } },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Generate example from schema",
        inputs: { schema: { type: "object", properties: { name: { type: "string" }, active: { type: "boolean" }, tags: { type: "array" } } } },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },

  // ========== WEEK 11: Evals & Reliability ==========
  {
    id: "bleu-score",
    type: "coding",
    title: "BLEU Score from Scratch",
    description: `Implement the BLEU (Bilingual Evaluation Understudy) metric from scratch, including n-gram precision, clipped counts, and the brevity penalty.

Implement:

1. **ngrams(tokens, n):** Extract all n-grams from a token list.

2. **modified_precision(reference, candidate, n):** Compute clipped n-gram precision: for each n-gram in the candidate, clip its count to the max count in the reference. Return clipped_count / total_candidate_ngrams.

3. **brevity_penalty(reference, candidate):** Compute BP = exp(1 - ref_len/cand_len) if cand_len < ref_len, else 1.0.

4. **bleu_score(reference, candidate, max_n=4, weights=None):** Compute BLEU: BP * exp(sum(w_i * log(p_i))). Default weights are uniform (1/max_n each).

\`\`\`python
>>> ref = "the cat sat on the mat".split()
>>> cand = "the cat sat on the mat".split()
>>> bleu_score(ref, cand)
1.0
>>> cand2 = "the the the the".split()
>>> bleu_score(ref, cand2)  # low due to clipping and brevity penalty
< 0.1
\`\`\``,
    difficulty: "Medium",
    weekNumber: 11,
    tags: '["evals", "bleu", "metrics", "nlp", "n-grams"]',
    theory: `BLEU measures how many n-grams in the candidate translation appear in the reference. It was designed for machine translation but is used across NLG tasks.

**N-gram precision** counts how many candidate n-grams match the reference. Raw precision is gamed by repeating common words. Clipped precision caps each n-gram count at its reference frequency. "the the the the" against "the cat sat on the mat" gets clipped: "the" appears twice in the reference, so only 2 of 4 count. Clipped precision = 2/4 = 0.5.

**Brevity penalty** punishes short candidates. A single correct word would get 100% unigram precision. BP = exp(1 - r/c) when the candidate is shorter than the reference, 1.0 otherwise. This ensures short outputs cannot cheat by producing only confident tokens.

**Combined BLEU** takes the geometric mean of n-gram precisions (typically 1-4) weighted by w_i (typically uniform 0.25), multiplied by BP. The geometric mean means a zero precision at any n kills the entire score. This makes BLEU strict: you need overlap at all levels.

**Limitations:** BLEU treats all n-grams equally (no semantic weighting), requires exact matches (synonyms score 0), and correlates poorly with human judgment for short texts or creative tasks. It works best for translation where multiple valid references are provided.`,
    hints: '["Use collections.Counter for efficient n-gram counting", "Clipped count = min(candidate_count, reference_count) for each n-gram", "Handle zero precision with a small epsilon to avoid log(0)", "Brevity penalty only applies when candidate is shorter than reference"]',
    visualizationComponent: "BLEUScoreViz",
    sortOrder: 1,
    starterCode: `from collections import Counter
import math

def ngrams(tokens, n):
    """
    Extract n-grams from a token list.

    Args:
        tokens: list of strings
        n: n-gram size

    Returns:
        list of n-gram tuples
    """
    pass

def modified_precision(reference, candidate, n):
    """
    Compute clipped n-gram precision.

    Args:
        reference: list of reference tokens
        candidate: list of candidate tokens
        n: n-gram size

    Returns:
        float - clipped precision
    """
    pass

def brevity_penalty(reference, candidate):
    """
    Compute brevity penalty.

    Args:
        reference: list of reference tokens
        candidate: list of candidate tokens

    Returns:
        float - brevity penalty (0 to 1)
    """
    pass

def bleu_score(reference, candidate, max_n=4, weights=None):
    """
    Compute BLEU score.

    Args:
        reference: list of reference tokens
        candidate: list of candidate tokens
        max_n: maximum n-gram order
        weights: list of weights per n-gram order (default: uniform)

    Returns:
        float - BLEU score (0 to 1)
    """
    pass`,
    solution: `\`\`\`python
from collections import Counter
import math

def ngrams(tokens, n):
    return [tuple(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]

def modified_precision(reference, candidate, n):
    cand_ngrams = Counter(ngrams(candidate, n))
    ref_ngrams = Counter(ngrams(reference, n))

    if not cand_ngrams:
        return 0.0

    clipped = 0
    for ng, count in cand_ngrams.items():
        clipped += min(count, ref_ngrams.get(ng, 0))

    total = sum(cand_ngrams.values())
    return clipped / total if total > 0 else 0.0

def brevity_penalty(reference, candidate):
    r = len(reference)
    c = len(candidate)
    if c == 0:
        return 0.0
    if c >= r:
        return 1.0
    return math.exp(1 - r / c)

def bleu_score(reference, candidate, max_n=4, weights=None):
    if weights is None:
        weights = [1.0 / max_n] * max_n

    bp = brevity_penalty(reference, candidate)

    log_avg = 0.0
    for i in range(max_n):
        p = modified_precision(reference, candidate, i + 1)
        if p == 0:
            return 0.0
        log_avg += weights[i] * math.log(p)

    return bp * math.exp(log_avg)
\`\`\`

**Approach:** Extract n-grams as tuples, count with Counter, clip candidate counts to reference maximums. Brevity penalty penalizes short candidates. Final score is BP times the weighted geometric mean of n-gram precisions.`,
    testCases: [
      {
        id: "t1",
        name: "Perfect match scores 1.0",
        inputs: { reference: "the cat sat on the mat", candidate: "the cat sat on the mat" },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Repeated tokens get clipped",
        inputs: { reference: "the cat sat on the mat", candidate: "the the the the the the" },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Short candidate gets brevity penalty",
        inputs: { reference: "the cat sat on the mat", candidate: "the cat" },
        isPublic: true,
      },
      {
        id: "t4",
        name: "No overlap scores 0",
        inputs: { reference: "the cat sat on the mat", candidate: "a dog ran in a park" },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Partial overlap computes correctly",
        inputs: { reference: "the cat sat on the mat", candidate: "the cat was on a mat today" },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "rouge-score",
    type: "coding",
    title: "ROUGE Metrics Implementation",
    description: `Implement ROUGE-1, ROUGE-2, and ROUGE-L metrics from scratch.

Implement:

1. **rouge_n(reference, candidate, n):** Compute ROUGE-N recall, precision, and F1. ROUGE-N recall = overlap n-grams / reference n-grams. Precision = overlap / candidate n-grams.

2. **lcs_length(x, y):** Compute the length of the longest common subsequence.

3. **rouge_l(reference, candidate):** Compute ROUGE-L using LCS. Recall = LCS/ref_len, Precision = LCS/cand_len, F1 = harmonic mean.

\`\`\`python
>>> ref = "the cat sat on the mat".split()
>>> cand = "the cat is on the mat".split()
>>> r1 = rouge_n(ref, cand, n=1)
>>> r1["recall"]  # 5/6 unigrams match
0.833...
>>> rl = rouge_l(ref, cand)
>>> rl["f1"]  # LCS = "the cat on the mat" (length 5)
> 0.8
\`\`\``,
    difficulty: "Medium",
    weekNumber: 11,
    tags: '["evals", "rouge", "metrics", "nlp", "summarization"]',
    theory: `ROUGE (Recall-Oriented Understudy for Gisting Evaluation) measures summary quality by comparing against reference summaries. Unlike BLEU (precision-focused), ROUGE emphasizes recall: did the candidate capture the content of the reference?

**ROUGE-N** counts overlapping n-grams. ROUGE-1 (unigrams) measures word-level overlap. ROUGE-2 (bigrams) captures phrase-level similarity. Recall = overlapping n-grams / total reference n-grams. Precision = overlapping / total candidate n-grams. F1 is the harmonic mean.

**ROUGE-L** uses the Longest Common Subsequence (LCS). Unlike n-grams, LCS captures sentence-level structure without requiring consecutive matches. "the cat on the mat" is a subsequence of both "the cat sat on the mat" and "the cat is on the mat". LCS length = 5. ROUGE-L recall = 5/6, precision = 5/6.

**LCS computation** uses dynamic programming. Build a (len(x)+1) x (len(y)+1) table. If characters match, dp[i][j] = dp[i-1][j-1] + 1. Otherwise, dp[i][j] = max(dp[i-1][j], dp[i][j-1]). The bottom-right cell is the LCS length. Time: O(m*n), space: O(m*n) or O(min(m,n)) with optimization.

**When to use which:** ROUGE-1 for general content overlap. ROUGE-2 for checking phrasing preservation. ROUGE-L for structural similarity. In practice, all three are reported together. ROUGE-L is the most robust for summarization evaluation.`,
    hints: '["Use Counter intersection for n-gram overlap counting", "LCS is a classic DP problem: build a 2D table", "F1 = 2 * precision * recall / (precision + recall), handle zero division", "ROUGE-N with n=1 is ROUGE-1, n=2 is ROUGE-2"]',
    visualizationComponent: "ROUGEScoreViz",
    sortOrder: 2,
    starterCode: `from collections import Counter

def rouge_n(reference, candidate, n=1):
    """
    Compute ROUGE-N recall, precision, and F1.

    Args:
        reference: list of reference tokens
        candidate: list of candidate tokens
        n: n-gram size

    Returns:
        dict with "recall", "precision", "f1"
    """
    pass

def lcs_length(x, y):
    """
    Compute length of the longest common subsequence.

    Args:
        x: first sequence (list)
        y: second sequence (list)

    Returns:
        int - LCS length
    """
    pass

def rouge_l(reference, candidate):
    """
    Compute ROUGE-L using longest common subsequence.

    Args:
        reference: list of reference tokens
        candidate: list of candidate tokens

    Returns:
        dict with "recall", "precision", "f1"
    """
    pass`,
    solution: `\`\`\`python
from collections import Counter

def _ngrams(tokens, n):
    return [tuple(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]

def rouge_n(reference, candidate, n=1):
    ref_ngrams = Counter(_ngrams(reference, n))
    cand_ngrams = Counter(_ngrams(candidate, n))

    overlap = 0
    for ng, count in cand_ngrams.items():
        overlap += min(count, ref_ngrams.get(ng, 0))

    ref_total = sum(ref_ngrams.values())
    cand_total = sum(cand_ngrams.values())

    recall = overlap / ref_total if ref_total > 0 else 0.0
    precision = overlap / cand_total if cand_total > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0

    return {"recall": recall, "precision": precision, "f1": f1}

def lcs_length(x, y):
    m, n = len(x), len(y)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if x[i-1] == y[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]

def rouge_l(reference, candidate):
    lcs = lcs_length(reference, candidate)
    ref_len = len(reference)
    cand_len = len(candidate)

    recall = lcs / ref_len if ref_len > 0 else 0.0
    precision = lcs / cand_len if cand_len > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0

    return {"recall": recall, "precision": precision, "f1": f1}
\`\`\`

**Approach:** ROUGE-N uses Counter-based n-gram overlap with recall/precision/F1. ROUGE-L uses dynamic programming LCS. Both handle edge cases (empty inputs, zero denominators).`,
    testCases: [
      {
        id: "t1",
        name: "Perfect ROUGE-1 match",
        inputs: { reference: "the cat sat on the mat", candidate: "the cat sat on the mat", n: 1 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Partial ROUGE-2 overlap",
        inputs: { reference: "the cat sat on the mat", candidate: "the cat is on the mat", n: 2 },
        isPublic: true,
      },
      {
        id: "t3",
        name: "ROUGE-L with subsequence match",
        inputs: { reference: "the cat sat on the mat", candidate: "the big cat sat right on the large mat" },
        isPublic: true,
      },
      {
        id: "t4",
        name: "No overlap returns zeros",
        inputs: { reference: "hello world", candidate: "foo bar", n: 1 },
        isPublic: false,
      },
      {
        id: "t5",
        name: "LCS length correct",
        inputs: { x: ["a", "b", "c", "d", "e"], y: ["a", "c", "e"] },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "hallucination-detector",
    type: "coding",
    title: "Hallucination Detector",
    description: `Detect factual inconsistencies between a source document and generated text using NLI-style claim extraction and verification.

Implement:

1. **extract_claims(text):** Split generated text into individual factual claims. Each sentence that makes a factual assertion is a claim. Filter out opinions, questions, and meta-statements.

2. **check_entailment(claim, source, similarity_fn):** Check if the source text entails (supports) the claim. Use sentence-level similarity between the claim and each source sentence. Return "supported", "contradicted", or "unverifiable" with a confidence score.

3. **detect_hallucinations(source, generated, similarity_fn, threshold=0.5):** Extract claims from generated text, check each against the source. Return a report with supported, contradicted, and unverifiable claims, plus an overall faithfulness score.

\`\`\`python
>>> source = "Python was created by Guido van Rossum in 1991. It emphasizes code readability."
>>> generated = "Python was created by Guido van Rossum in 1989. It is the fastest programming language."
>>> report = detect_hallucinations(source, generated, sim_fn)
>>> report["hallucinations"]  # wrong year, unsupported speed claim
2
\`\`\``,
    difficulty: "Hard",
    weekNumber: 11,
    tags: '["hallucination", "faithfulness", "nli", "evals", "reliability"]',
    theory: `Hallucination in LLMs means generating content not grounded in the provided source. There are two types: intrinsic (contradicts the source) and extrinsic (adds information not in the source). Both are problematic for factual applications.

**Claim extraction** breaks generated text into atomic facts. "Python was created by Guido in 1991 and emphasizes readability" becomes two claims: "Python was created by Guido in 1991" and "Python emphasizes readability". Each claim is verified independently. Extracting claims requires identifying factual assertions and filtering out hedging, opinions, and meta-commentary.

**NLI-style verification** treats each claim as a hypothesis and the source as a premise. Natural Language Inference classifies the relationship as entailment (source supports claim), contradiction (source denies claim), or neutral (source says nothing about it). Production systems use fine-tuned NLI models. For this problem, sentence similarity serves as a proxy: high similarity to a source sentence suggests support; low similarity suggests the claim is unverifiable.

**Faithfulness scoring** aggregates claim-level results. Faithfulness = supported_claims / total_claims. A score of 1.0 means every claim is grounded in the source. Contradictions are worse than unverifiable claims (wrong is worse than unsupported), so weighted scoring penalizes contradictions more.

**Limitations:** Similarity-based checking misses paraphrased facts, implicit information, and logical inference. A claim "Guido is Dutch" might be unverifiable from "Python was created by Guido van Rossum" even though it is true. Production systems combine similarity with NLI models and knowledge graphs.`,
    hints: '["Split text into sentences, then filter to keep only factual assertions", "For entailment checking, find the most similar source sentence and threshold", "High similarity -> supported, low similarity -> unverifiable", "For contradiction detection, look for similar sentences with negation or conflicting numbers"]',
    visualizationComponent: "HallucinationViz",
    sortOrder: 3,
    starterCode: `import re

def extract_claims(text):
    """
    Extract factual claims from generated text.

    Args:
        text: generated text string

    Returns:
        list of claim strings
    """
    pass

def check_entailment(claim, source, similarity_fn):
    """
    Check if source entails the claim.

    Args:
        claim: a single claim string
        source: source document string
        similarity_fn: callable(str, str) -> float (0 to 1)

    Returns:
        dict with "verdict" ("supported"/"contradicted"/"unverifiable"),
        "confidence": float, "best_match": str
    """
    pass

def detect_hallucinations(source, generated, similarity_fn, threshold=0.5):
    """
    Detect hallucinations in generated text given source.

    Args:
        source: source document string
        generated: generated text string
        similarity_fn: callable(str, str) -> float
        threshold: similarity threshold for support

    Returns:
        dict with "claims", "supported", "contradicted",
        "unverifiable", "hallucinations", "faithfulness_score"
    """
    pass`,
    solution: `\`\`\`python
import re

def extract_claims(text):
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\\s+', text) if s.strip()]
    claims = []
    skip_patterns = [
        r'^(I think|In my opinion|Maybe|Perhaps)',
        r'\\?$',  # questions
        r'^(Note:|However,|Also,|Additionally,)\\s*$',
    ]
    for sent in sentences:
        is_claim = True
        for pattern in skip_patterns:
            if re.search(pattern, sent, re.IGNORECASE):
                is_claim = False
                break
        if is_claim and len(sent.split()) >= 3:
            claims.append(sent)
    return claims

def check_entailment(claim, source, similarity_fn):
    source_sentences = [s.strip() for s in re.split(r'(?<=[.!?])\\s+', source) if s.strip()]
    if not source_sentences:
        return {"verdict": "unverifiable", "confidence": 0.0, "best_match": ""}

    best_sim = 0.0
    best_sent = ""
    for sent in source_sentences:
        sim = similarity_fn(claim, sent)
        if sim > best_sim:
            best_sim = sim
            best_sent = sent

    if best_sim >= 0.7:
        # Check for number contradictions
        claim_nums = set(re.findall(r'\\b\\d+\\b', claim))
        match_nums = set(re.findall(r'\\b\\d+\\b', best_sent))
        if claim_nums and match_nums and claim_nums != match_nums:
            # Similar topic but different numbers = contradiction
            common_words = set(claim.lower().split()) & set(best_sent.lower().split())
            if len(common_words) > 3:
                return {"verdict": "contradicted", "confidence": best_sim, "best_match": best_sent}
        return {"verdict": "supported", "confidence": best_sim, "best_match": best_sent}
    elif best_sim >= 0.3:
        return {"verdict": "unverifiable", "confidence": best_sim, "best_match": best_sent}
    else:
        return {"verdict": "unverifiable", "confidence": best_sim, "best_match": best_sent}

def detect_hallucinations(source, generated, similarity_fn, threshold=0.5):
    claims = extract_claims(generated)
    results = []
    supported = 0
    contradicted = 0
    unverifiable = 0

    for claim in claims:
        result = check_entailment(claim, source, similarity_fn)
        results.append({"claim": claim, **result})
        if result["verdict"] == "supported":
            supported += 1
        elif result["verdict"] == "contradicted":
            contradicted += 1
        else:
            unverifiable += 1

    total = len(claims)
    faithfulness = supported / total if total > 0 else 1.0

    return {
        "claims": results,
        "supported": supported,
        "contradicted": contradicted,
        "unverifiable": unverifiable,
        "hallucinations": contradicted + unverifiable,
        "faithfulness_score": faithfulness,
        "total_claims": total,
    }
\`\`\`

**Approach:** Extract factual sentences as claims. For each claim, find the most similar source sentence. High similarity with matching content = supported. High similarity with conflicting numbers = contradicted. Low similarity = unverifiable. Faithfulness = supported/total.`,
    testCases: [
      {
        id: "t1",
        name: "Detect supported claims",
        inputs: { source: "Python was created in 1991.", generated: "Python was created in 1991." },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Detect unverifiable claim",
        inputs: { source: "Python was created in 1991.", generated: "Python is the most popular language in the world." },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Extract claims filters non-factual",
        inputs: { text: "I think this is good. Python was created in 1991. What do you think?" },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Mixed supported and unsupported",
        inputs: { source: "The Eiffel Tower is in Paris. It was built in 1889.", generated: "The Eiffel Tower is in Paris. It is 500 meters tall. It was built in 1889." },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "llm-judge-scorer",
    type: "coding",
    title: "LLM-as-Judge Pairwise Scorer",
    description: `Implement a pairwise comparison scoring system for LLM-as-judge evaluation.

Given two model responses to the same prompt, build a system that:

1. **build_judge_prompt(question, response_a, response_b, criteria):** Construct a structured evaluation prompt that asks the judge to compare two responses on given criteria. Include position-debiasing by randomly swapping A/B order.

2. **parse_judgment(judgment_text):** Parse the judge's response to extract: winner ("A"/"B"/"tie"), score_a (1-10), score_b (1-10), reasoning string.

3. **aggregate_scores(judgments):** Given a list of judgment results, compute win rates, average scores, and confidence intervals using bootstrap resampling.

4. **detect_position_bias(judgments_original, judgments_swapped):** Compare judgments with original vs swapped order to detect if the judge favors the first-presented response.

\`\`\`python
>>> prompt = build_judge_prompt("What is ML?", "ML is machine learning...", "Machine learning is a subset of AI...", ["accuracy", "clarity"])
>>> parsed = parse_judgment("Winner: B\\nScore A: 7\\nScore B: 9\\nReasoning: B is more comprehensive.")
>>> parsed["winner"]
"B"
\`\`\``,
    difficulty: "Medium",
    weekNumber: 11,
    tags: '["evals", "llm-judge", "pairwise-comparison", "scoring"]',
    theory: `LLM-as-judge uses a strong model (e.g., GPT-4) to evaluate outputs from other models. Pairwise comparison is more reliable than absolute scoring because humans and LLMs find it easier to compare than to rate on an absolute scale.

**Pairwise evaluation** presents two responses side by side and asks: which is better? The judge provides a winner, optional scores, and reasoning. This reduces the calibration problem: the judge only needs to determine relative quality, not an absolute number.

**Position bias** is the primary failure mode. LLM judges tend to prefer the first-presented response (primacy bias) or, in some models, the second (recency bias). Detection: run each comparison twice with swapped order. If the judge picks the first-presented response >60% of the time regardless of content, position bias is present. Mitigation: randomly swap order and average across both presentations.

**Criteria-based evaluation** breaks the comparison into dimensions (accuracy, clarity, helpfulness, safety). The judge scores each criterion separately. This produces more consistent results than a single holistic "which is better?" because it forces the judge to consider specific aspects.

**Bootstrap confidence intervals** quantify uncertainty in win rates. Resample the judgment set with replacement 1000 times, compute win rate for each sample, and take the 2.5th and 97.5th percentiles. Narrow intervals = reliable result; wide intervals = need more judgments.`,
    hints: '["Use random.random() > 0.5 to decide whether to swap A/B presentation order", "Parse judgment with regex: look for Winner: X, Score A: N, Score B: N patterns", "For bootstrap, use numpy random choice with replacement", "Position bias = abs(first_win_rate - 0.5) > 0.1"]',
    visualizationComponent: "LLMJudgeViz",
    sortOrder: 4,
    starterCode: `import random
import re
import numpy as np

def build_judge_prompt(question, response_a, response_b, criteria):
    """
    Build a pairwise evaluation prompt with position debiasing.

    Args:
        question: the original question/prompt
        response_a: first response
        response_b: second response
        criteria: list of evaluation criteria strings

    Returns:
        dict with "prompt": str, "swapped": bool
    """
    pass

def parse_judgment(judgment_text):
    """
    Parse judge output to extract verdict and scores.

    Args:
        judgment_text: raw text from the judge model

    Returns:
        dict with "winner", "score_a", "score_b", "reasoning"
    """
    pass

def aggregate_scores(judgments):
    """
    Aggregate multiple judgments into win rates and confidence intervals.

    Args:
        judgments: list of parsed judgment dicts

    Returns:
        dict with "win_rate_a", "win_rate_b", "tie_rate",
        "avg_score_a", "avg_score_b", "ci_95"
    """
    pass

def detect_position_bias(judgments_original, judgments_swapped):
    """
    Detect position bias by comparing original and swapped judgments.

    Args:
        judgments_original: judgments with original A/B order
        judgments_swapped: judgments with swapped B/A order

    Returns:
        dict with "first_position_win_rate", "bias_detected": bool,
        "bias_magnitude": float
    """
    pass`,
    solution: `\`\`\`python
import random
import re
import numpy as np

def build_judge_prompt(question, response_a, response_b, criteria):
    swapped = random.random() > 0.5
    if swapped:
        first, second = response_b, response_a
    else:
        first, second = response_a, response_b

    criteria_text = "\\n".join(f"- {c}" for c in criteria)

    prompt = f"""Evaluate the following two responses to the question.

Question: {question}

Response A:
{first}

Response B:
{second}

Evaluation criteria:
{criteria_text}

Provide your evaluation in this exact format:
Winner: A or B or Tie
Score A: (1-10)
Score B: (1-10)
Reasoning: (your explanation)"""

    return {"prompt": prompt, "swapped": swapped}

def parse_judgment(judgment_text):
    winner_match = re.search(r'Winner:\\s*([ABab]|[Tt]ie)', judgment_text)
    score_a_match = re.search(r'Score A:\\s*(\\d+)', judgment_text)
    score_b_match = re.search(r'Score B:\\s*(\\d+)', judgment_text)
    reasoning_match = re.search(r'Reasoning:\\s*(.+)', judgment_text, re.DOTALL)

    winner = winner_match.group(1).upper() if winner_match else "TIE"
    if winner.lower() == "tie":
        winner = "TIE"

    return {
        "winner": winner,
        "score_a": int(score_a_match.group(1)) if score_a_match else 5,
        "score_b": int(score_b_match.group(1)) if score_b_match else 5,
        "reasoning": reasoning_match.group(1).strip() if reasoning_match else "",
    }

def aggregate_scores(judgments):
    n = len(judgments)
    if n == 0:
        return {"win_rate_a": 0, "win_rate_b": 0, "tie_rate": 0, "avg_score_a": 0, "avg_score_b": 0, "ci_95": (0, 0)}

    wins_a = sum(1 for j in judgments if j["winner"] == "A")
    wins_b = sum(1 for j in judgments if j["winner"] == "B")
    ties = n - wins_a - wins_b

    scores_a = [j["score_a"] for j in judgments]
    scores_b = [j["score_b"] for j in judgments]

    # Bootstrap CI for win_rate_a
    bootstrap_rates = []
    for _ in range(1000):
        sample = np.random.choice(judgments, size=n, replace=True)
        rate = sum(1 for j in sample if j["winner"] == "A") / n
        bootstrap_rates.append(rate)

    ci_low = float(np.percentile(bootstrap_rates, 2.5))
    ci_high = float(np.percentile(bootstrap_rates, 97.5))

    return {
        "win_rate_a": wins_a / n,
        "win_rate_b": wins_b / n,
        "tie_rate": ties / n,
        "avg_score_a": sum(scores_a) / n,
        "avg_score_b": sum(scores_b) / n,
        "ci_95": (ci_low, ci_high),
    }

def detect_position_bias(judgments_original, judgments_swapped):
    # In original: A is first. In swapped: B is first.
    first_wins_orig = sum(1 for j in judgments_original if j["winner"] == "A")
    first_wins_swap = sum(1 for j in judgments_swapped if j["winner"] == "B")

    total = len(judgments_original) + len(judgments_swapped)
    first_wins = first_wins_orig + first_wins_swap
    first_rate = first_wins / total if total > 0 else 0.5

    bias_magnitude = abs(first_rate - 0.5)
    return {
        "first_position_win_rate": first_rate,
        "bias_detected": bias_magnitude > 0.1,
        "bias_magnitude": bias_magnitude,
    }
\`\`\`

**Approach:** Build structured prompts with random A/B swapping. Parse with regex for structured fields. Aggregate with bootstrap resampling for confidence intervals. Detect position bias by measuring first-position win rate across original and swapped presentations.`,
    testCases: [
      {
        id: "t1",
        name: "Parse well-formed judgment",
        inputs: { judgment_text: "Winner: A\nScore A: 8\nScore B: 6\nReasoning: A is more detailed." },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Build prompt includes criteria",
        inputs: { question: "What is AI?", response_a: "AI is...", response_b: "Artificial intelligence...", criteria: ["accuracy", "clarity"] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Aggregate scores computes win rates",
        inputs: { num_judgments: 10 },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Position bias detection",
        inputs: { num_original: 20, num_swapped: 20 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "eval-metrics-quiz",
    type: "quiz",
    title: "Evaluation Metrics Deep Dive",
    description: "Test your understanding of BLEU, ROUGE, BERTScore, human evaluation correlation, and metric selection for different NLG tasks.",
    difficulty: "Medium",
    weekNumber: 11,
    tags: '["evals", "metrics", "bleu", "rouge", "bertscore", "quiz"]',
    theory: `NLG evaluation metrics fall into three categories: n-gram overlap (BLEU, ROUGE, METEOR), embedding-based (BERTScore, MoverScore), and model-based (GPT-4 judge, reward models). Each makes different tradeoffs between cost, speed, and correlation with human judgment.

**BLEU** is precision-oriented with brevity penalty. It measures what fraction of candidate n-grams appear in the reference. Good for translation where a single correct output exists. Poor for open-ended generation where many valid outputs exist.

**ROUGE** is recall-oriented. It measures what fraction of reference n-grams appear in the candidate. Good for summarization where you want to check that key content is preserved. ROUGE-L uses longest common subsequence for structural matching.

**BERTScore** computes token-level cosine similarity using contextual embeddings from BERT. It captures semantic similarity beyond exact word matching. "car" and "automobile" get high similarity even though BLEU/ROUGE give zero credit. The cost is a model forward pass per evaluation.

**Human correlation** is the gold standard: does the metric agree with human quality rankings? BERTScore and model-based evaluators correlate highest with human judgment. BLEU and ROUGE correlate well for their target tasks (translation, summarization) but poorly for open-ended generation.

**Metric selection** depends on the task. Translation: BLEU + COMET. Summarization: ROUGE + BERTScore. Dialogue: model-based evaluation. Factual QA: exact match + F1. No single metric works for everything.`,
    hints: '[]',
    visualizationComponent: "BLEUScoreViz",
    sortOrder: 5,
    starterCode: null,
    testCases: null,
    questions: [
      {
        id: "w11-q1-1",
        questionNumber: 1,
        questionText: "BLEU uses clipped n-gram counts. What problem does clipping solve?",
        options: {
          a: "It prevents the metric from penalizing long outputs",
          b: "It prevents gaming by repeating high-frequency words (e.g., 'the the the the' scoring high unigram precision)",
          c: "It speeds up computation by limiting the vocabulary size",
          d: "It normalizes scores across different languages",
        },
        correctAnswer: "b",
        explanation: "Without clipping, a candidate of 'the the the the' would get 100% unigram precision if 'the' appears in the reference. Clipping caps each n-gram's count at its reference frequency. If 'the' appears twice in the reference, only 2 of 4 candidate occurrences count. Clipped precision = 2/4 = 0.5.",
      },
      {
        id: "w11-q1-2",
        questionNumber: 2,
        questionText: "Why does ROUGE emphasize recall while BLEU emphasizes precision?",
        options: {
          a: "They were designed for different hardware constraints",
          b: "ROUGE evaluates summaries (did we capture the reference content?), BLEU evaluates translations (is the output fluent and accurate?)",
          c: "Recall is always better than precision for NLG tasks",
          d: "BLEU was designed first and ROUGE was designed to be the opposite",
        },
        correctAnswer: "b",
        explanation: "Summarization needs recall: did the summary capture the key points of the reference? Missing important content is the main failure mode. Translation needs precision: is every word in the output correct? Generating incorrect words is the main failure mode. The metrics are oriented toward detecting the most common errors in their target tasks.",
      },
      {
        id: "w11-q1-3",
        questionNumber: 3,
        questionText: "BERTScore's main advantage over BLEU/ROUGE is:",
        options: {
          a: "It runs 10x faster than BLEU",
          b: "It captures semantic similarity, giving credit for synonyms and paraphrases that exact-match metrics miss",
          c: "It does not require reference texts",
          d: "It works only with BERT models, making it more specialized",
        },
        correctAnswer: "b",
        explanation: "BERTScore uses contextual embeddings to compute token-level similarity. 'automobile' and 'car' are semantically similar in embedding space even though they share zero characters. BLEU and ROUGE require exact n-gram matches, so valid paraphrases score zero. The cost is a BERT forward pass per evaluation.",
      },
      {
        id: "w11-q1-4",
        questionNumber: 4,
        questionText: "You are evaluating a creative writing assistant. Which evaluation approach is most appropriate?",
        options: {
          a: "BLEU-4 with a single reference",
          b: "ROUGE-1 recall",
          c: "Model-based evaluation (LLM-as-judge) with human-defined criteria for creativity, coherence, and engagement",
          d: "Exact match against a reference story",
        },
        correctAnswer: "c",
        explanation: "Creative writing has many valid outputs - no single reference captures the space of good responses. N-gram metrics (BLEU, ROUGE) punish creative paraphrasing and novel phrasing, which is exactly what you want. Model-based evaluation with custom criteria (creativity, coherence, engagement) can assess open-ended quality. Human evaluation remains the gold standard for creative tasks.",
      },
      {
        id: "w11-q1-5",
        questionNumber: 5,
        questionText: "The brevity penalty in BLEU penalizes candidates shorter than the reference. Why is this necessary?",
        options: {
          a: "Short texts are always lower quality",
          b: "Without it, a candidate can achieve 100% precision by outputting a single correct n-gram, gaming the metric",
          c: "It ensures the candidate has the same length as the reference",
          d: "It compensates for tokenization differences between languages",
        },
        correctAnswer: "b",
        explanation: "A candidate consisting of just the word 'the' achieves 100% unigram precision against most English references. Without brevity penalty, the optimal strategy is to output only high-confidence words. BP = exp(1 - r/c) when c < r penalizes this: a 1-word candidate against a 20-word reference gets BP = exp(1-20) which is near zero. This forces the candidate to be roughly reference-length to score well.",
      },
    ],
    solution: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "hallucination-reliability-quiz",
    type: "quiz",
    title: "Hallucination Types & Reliability",
    description: "Test your understanding of hallucination taxonomy, grounding techniques, faithfulness evaluation, and strategies for building reliable LLM systems.",
    difficulty: "Medium",
    weekNumber: 11,
    tags: '["hallucination", "reliability", "grounding", "faithfulness", "quiz"]',
    theory: `LLM hallucinations are outputs that are fluent and confident but factually wrong or ungrounded. They are the primary reliability concern for production LLM systems.

**Intrinsic hallucinations** contradict the provided source. The source says "built in 1889" but the model says "built in 1887". These are detectable: compare model output against source facts.

**Extrinsic hallucinations** add information not in the source. The source discusses the Eiffel Tower but the model adds "it is the tallest structure in Europe" (which is false and not in the source). Detection requires knowing what the source does NOT say - harder than detecting contradictions.

**Grounding techniques** reduce hallucinations. RAG grounds the model in retrieved documents. System prompts like "only answer based on the provided context" instruct the model to stay grounded. Citation requirements force the model to reference specific passages, making unsupported claims more obvious.

**Faithfulness evaluation** measures how well the output sticks to the source. NLI-based approaches extract claims from the output and verify each against the source. RAGAS and similar frameworks automate this: claim extraction -> evidence retrieval -> entailment classification. Faithfulness = supported_claims / total_claims.

**Chain-of-verification** is a self-correction technique: the model generates an answer, then generates verification questions about its own claims, answers those questions from the source, and revises if inconsistencies are found. This reduces hallucination rates by 30-50% in benchmarks.`,
    hints: '[]',
    visualizationComponent: "HallucinationViz",
    sortOrder: 6,
    starterCode: null,
    testCases: null,
    questions: [
      {
        id: "w11-q2-1",
        questionNumber: 1,
        questionText: "The source says 'The Eiffel Tower is 330 meters tall.' The model outputs 'The Eiffel Tower is 300 meters tall.' This is an example of:",
        options: {
          a: "Extrinsic hallucination - the model added new information",
          b: "Intrinsic hallucination - the model contradicted the source",
          c: "Correct output - 300 is close enough to 330",
          d: "A tokenization artifact that does not indicate hallucination",
        },
        correctAnswer: "b",
        explanation: "The source states 330 meters, the model says 300 meters. This directly contradicts the provided information, making it an intrinsic hallucination. Proximity of the numbers does not matter - the model claimed a specific wrong number that differs from the source.",
      },
      {
        id: "w11-q2-2",
        questionNumber: 2,
        questionText: "Which grounding technique is MOST effective at reducing hallucinations in a RAG system?",
        options: {
          a: "Increasing the model temperature to explore more options",
          b: "Using a larger context window to include more documents",
          c: "Requiring the model to cite specific retrieved passages for each claim and verifying those citations",
          d: "Training the model on more data",
        },
        correctAnswer: "c",
        explanation: "Citation requirements make unsupported claims explicit: if the model cannot point to a specific passage, the claim is flagged. Verification checks that cited passages actually support the claims. Larger context windows can actually increase hallucination (more noise). Higher temperature increases randomness. More training data helps but does not eliminate the fundamental issue.",
      },
      {
        id: "w11-q2-3",
        questionNumber: 3,
        questionText: "In NLI-based faithfulness evaluation, what are the three possible relationships between a claim and the source?",
        options: {
          a: "True, False, Unknown",
          b: "Entailment (supported), Contradiction (denied), Neutral (neither supported nor denied)",
          c: "Positive, Negative, Zero",
          d: "Match, Partial Match, No Match",
        },
        correctAnswer: "b",
        explanation: "Natural Language Inference classifies premise-hypothesis pairs as: entailment (the premise supports the hypothesis), contradiction (the premise denies the hypothesis), or neutral (the premise says nothing about the hypothesis). For faithfulness, the source is the premise and each output claim is a hypothesis.",
      },
      {
        id: "w11-q2-4",
        questionNumber: 4,
        questionText: "A chain-of-verification approach to hallucination reduction works by:",
        options: {
          a: "Training a separate verification model from scratch",
          b: "Having the model generate an answer, then generate questions about its own claims, answer those from the source, and revise if inconsistencies are found",
          c: "Running the same prompt multiple times and taking the majority vote",
          d: "Verifying the model's weights have not been corrupted",
        },
        correctAnswer: "b",
        explanation: "Chain-of-verification is a self-correction loop: (1) generate initial answer, (2) decompose answer into verification questions, (3) answer those questions using only the source, (4) check for inconsistencies between the initial answer and the verified answers, (5) revise the initial answer. This catches hallucinations that the model would miss in a single pass.",
      },
      {
        id: "w11-q2-5",
        questionNumber: 5,
        questionText: "Why are extrinsic hallucinations harder to detect than intrinsic hallucinations?",
        options: {
          a: "Extrinsic hallucinations use more complex vocabulary",
          b: "Detecting contradiction (intrinsic) only needs the source, but detecting unsupported additions (extrinsic) requires knowing what the source does NOT say",
          c: "Extrinsic hallucinations only occur in large models",
          d: "Intrinsic hallucinations are always obviously wrong",
        },
        correctAnswer: "b",
        explanation: "Intrinsic hallucination detection compares the claim to the source and checks for conflict - the information is there to compare against. Extrinsic hallucination detection must determine that the source contains no supporting information for the claim, which requires reasoning about absence. The claim might also be factually true (just not grounded in the source), adding another layer of complexity.",
      },
    ],
    solution: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "faithfulness-score",
    type: "coding",
    title: "Faithfulness Scoring with Claim Extraction",
    description: `Measure how faithfully a response sticks to provided context by extracting atomic claims and verifying each one.

Implement:

1. **decompose_into_claims(text):** Break text into atomic claims. Each claim should be a single fact that can be independently verified. "Python was created by Guido in 1991" -> ["Python was created by Guido", "Python was created in 1991"].

2. **find_supporting_evidence(claim, context_sentences, similarity_fn):** Find the best supporting sentence in the context for a given claim. Return the sentence and its similarity score.

3. **score_faithfulness(context, response, similarity_fn, threshold=0.6):** Compute faithfulness score. Extract claims from response, find supporting evidence for each, classify as grounded (above threshold) or ungrounded. Return score = grounded / total.

\`\`\`python
>>> context = "Python was created by Guido van Rossum. It was first released in 1991."
>>> response = "Python was created by Guido van Rossum in 1991. It is the most popular language."
>>> result = score_faithfulness(context, response, sim_fn)
>>> result["score"]  # 2 out of 3 claims are grounded
0.666...
\`\`\``,
    difficulty: "Hard",
    weekNumber: 11,
    tags: '["faithfulness", "evals", "claim-extraction", "grounding", "reliability"]',
    theory: `Faithfulness measures whether a model's response is grounded in the provided context. In RAG systems, the context is the retrieved documents. A faithful response only makes claims supported by those documents.

**Atomic claim decomposition** breaks complex sentences into independent facts. "X and Y" becomes two claims: X, Y. This granularity matters because a sentence can be partially faithful: "Python was created by Guido in 1989" contains one supported fact (creator) and one unsupported (year). Atomic decomposition catches the partial failure.

**Evidence retrieval** maps each claim to its best supporting sentence in the context. A claim is grounded if at least one context sentence supports it with similarity above a threshold. The threshold balances precision and recall: too high and valid paraphrases are rejected; too low and loose matches count as support.

**Faithfulness score** = grounded_claims / total_claims. A score of 1.0 means every claim has evidence. This metric is used in RAGAS, a popular RAG evaluation framework. Unlike BLEU/ROUGE, it directly measures what matters for RAG: does the response stick to the retrieved information?

**Practical considerations:** Claim decomposition is hard to do well with rules alone. Production systems use LLMs to decompose claims. Similarity functions range from simple (word overlap) to sophisticated (embedding cosine similarity, NLI models). The choice affects whether paraphrased evidence is detected.`,
    hints: '["Split on conjunctions (and, but) and relative clauses to get atomic claims", "Filter claims that are too short (< 4 words) as they are usually fragments", "Evidence retrieval is a max-similarity search over context sentences", "Handle edge cases: empty context, empty response, no claims extracted"]',
    visualizationComponent: "FaithfulnessViz",
    sortOrder: 7,
    starterCode: `import re

def decompose_into_claims(text):
    """
    Break text into atomic factual claims.

    Args:
        text: input text string

    Returns:
        list of atomic claim strings
    """
    pass

def find_supporting_evidence(claim, context_sentences, similarity_fn):
    """
    Find the best supporting sentence for a claim.

    Args:
        claim: a single claim string
        context_sentences: list of context sentences
        similarity_fn: callable(str, str) -> float

    Returns:
        dict with "sentence", "score"
    """
    pass

def score_faithfulness(context, response, similarity_fn, threshold=0.6):
    """
    Compute faithfulness score of response given context.

    Args:
        context: source context string
        response: model response string
        similarity_fn: callable(str, str) -> float
        threshold: minimum similarity for a claim to be grounded

    Returns:
        dict with "score", "grounded_claims", "ungrounded_claims", "details"
    """
    pass`,
    solution: `\`\`\`python
import re

def decompose_into_claims(text):
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\\s+', text) if s.strip()]
    claims = []
    for sent in sentences:
        # Split compound sentences on conjunctions
        parts = re.split(r'\\b(?:and|but|however|also|moreover|furthermore)\\b', sent, flags=re.IGNORECASE)
        for part in parts:
            part = part.strip().rstrip('.,;')
            if len(part.split()) >= 4:  # skip fragments
                claims.append(part.strip())
    return claims

def find_supporting_evidence(claim, context_sentences, similarity_fn):
    if not context_sentences:
        return {"sentence": "", "score": 0.0}
    best_score = 0.0
    best_sent = ""
    for sent in context_sentences:
        score = similarity_fn(claim, sent)
        if score > best_score:
            best_score = score
            best_sent = sent
    return {"sentence": best_sent, "score": best_score}

def score_faithfulness(context, response, similarity_fn, threshold=0.6):
    context_sentences = [s.strip() for s in re.split(r'(?<=[.!?])\\s+', context) if s.strip()]
    claims = decompose_into_claims(response)

    if not claims:
        return {"score": 1.0, "grounded_claims": [], "ungrounded_claims": [], "details": []}

    grounded = []
    ungrounded = []
    details = []

    for claim in claims:
        evidence = find_supporting_evidence(claim, context_sentences, similarity_fn)
        entry = {"claim": claim, "evidence": evidence["sentence"], "score": evidence["score"]}
        details.append(entry)
        if evidence["score"] >= threshold:
            grounded.append(claim)
        else:
            ungrounded.append(claim)

    score = len(grounded) / len(claims)
    return {
        "score": score,
        "grounded_claims": grounded,
        "ungrounded_claims": ungrounded,
        "details": details,
    }
\`\`\`

**Approach:** Decompose text into atomic claims by splitting sentences on conjunctions. Find the most similar context sentence for each claim. Classify as grounded or ungrounded based on threshold. Faithfulness = grounded/total.`,
    testCases: [
      {
        id: "t1",
        name: "Fully grounded response scores 1.0",
        inputs: { context: "Python was created by Guido.", response: "Python was created by Guido." },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Ungrounded claims reduce score",
        inputs: { context: "Python was created by Guido.", response: "Python was created by Guido. It is the fastest language." },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Decompose compound sentences",
        inputs: { text: "Python was created by Guido and it was first released in 1991." },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Empty response returns score 1.0",
        inputs: { context: "Some context.", response: "" },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "cost-latency-quality-tradeoff",
    type: "coding",
    title: "Cost-Latency-Quality Tradeoff Calculator",
    description: `Calculate Pareto-optimal model configurations given cost, latency, and quality constraints.

Implement:

1. **is_dominated(config_a, config_b):** Return True if config_a is dominated by config_b (config_b is better or equal on all metrics and strictly better on at least one). Lower cost and latency are better; higher quality is better.

2. **find_pareto_frontier(configs):** Return all non-dominated configurations. These form the Pareto frontier: no config improves on all three metrics simultaneously.

3. **select_best(configs, constraints):** Given constraints like {"max_cost": 0.01, "max_latency_ms": 500, "min_quality": 0.8}, filter to feasible configs and return the one with the best quality. If multiple tie on quality, prefer lower cost. Return None if no config meets all constraints.

\`\`\`python
>>> configs = [
...     {"name": "gpt4", "cost": 0.03, "latency_ms": 1000, "quality": 0.95},
...     {"name": "gpt3.5", "cost": 0.002, "latency_ms": 300, "quality": 0.80},
...     {"name": "local", "cost": 0.0001, "latency_ms": 100, "quality": 0.60},
... ]
>>> pareto = find_pareto_frontier(configs)
>>> len(pareto)  # all three are Pareto-optimal (each best on some dimension)
3
>>> best = select_best(configs, {"max_cost": 0.01, "max_latency_ms": 500, "min_quality": 0.7})
>>> best["name"]
"gpt3.5"
\`\`\``,
    difficulty: "Easy",
    weekNumber: 11,
    tags: '["tradeoffs", "pareto", "model-selection", "cost-optimization"]',
    theory: `Every model deployment involves three-way tradeoffs: cost (per-token price, infrastructure spend), latency (time to first token, total response time), and quality (accuracy, helpfulness, safety). No model wins on all three.

**Pareto optimality** identifies the set of configurations where no other configuration is better on every dimension. GPT-4 dominates on quality but loses on cost. A local model wins on cost and latency but loses on quality. Both are Pareto-optimal because neither dominates the other. A config is dominated if another config beats or ties it on every metric.

**Constraint-based selection** narrows the Pareto frontier to feasible options. The product team sets requirements: max cost per query, max latency, minimum quality threshold. Only configs meeting all constraints are candidates. Among feasible configs, you pick the best on your primary objective (usually quality).

**Real-world model menus** include: GPT-4o (high quality, high cost, moderate latency), GPT-3.5-turbo (moderate quality, low cost, low latency), Claude Haiku (low cost, low latency, moderate quality), local Llama (zero API cost, variable latency, variable quality). The right choice depends on the use case: customer-facing chat might need quality > 0.9, while internal log analysis might accept quality > 0.7 with minimal cost.`,
    hints: '["Dominated means worse or equal on ALL metrics and strictly worse on at least one", "For Pareto frontier, a config is non-dominated if no other config dominates it", "Filter configs against constraints first, then optimize", "Handle ties by secondary criteria (cost if quality ties)"]',
    visualizationComponent: "ParetoFrontierViz",
    sortOrder: 8,
    starterCode: `def is_dominated(config_a, config_b):
    """
    Check if config_a is dominated by config_b.

    Lower cost and latency are better. Higher quality is better.

    Args:
        config_a: dict with "cost", "latency_ms", "quality"
        config_b: dict with "cost", "latency_ms", "quality"

    Returns:
        bool - True if config_a is dominated by config_b
    """
    pass

def find_pareto_frontier(configs):
    """
    Find all non-dominated configurations.

    Args:
        configs: list of config dicts

    Returns:
        list of Pareto-optimal configs
    """
    pass

def select_best(configs, constraints):
    """
    Select best config meeting all constraints.

    Args:
        configs: list of config dicts
        constraints: dict with optional "max_cost", "max_latency_ms", "min_quality"

    Returns:
        best config dict or None
    """
    pass`,
    solution: `\`\`\`python
def is_dominated(config_a, config_b):
    # b must be <= a on cost, <= a on latency, >= a on quality
    # AND strictly better on at least one
    cost_ok = config_b["cost"] <= config_a["cost"]
    latency_ok = config_b["latency_ms"] <= config_a["latency_ms"]
    quality_ok = config_b["quality"] >= config_a["quality"]

    all_ok = cost_ok and latency_ok and quality_ok

    strictly_better = (
        config_b["cost"] < config_a["cost"]
        or config_b["latency_ms"] < config_a["latency_ms"]
        or config_b["quality"] > config_a["quality"]
    )

    return all_ok and strictly_better

def find_pareto_frontier(configs):
    frontier = []
    for i, config in enumerate(configs):
        dominated = False
        for j, other in enumerate(configs):
            if i != j and is_dominated(config, other):
                dominated = True
                break
        if not dominated:
            frontier.append(config)
    return frontier

def select_best(configs, constraints):
    feasible = []
    for config in configs:
        if "max_cost" in constraints and config["cost"] > constraints["max_cost"]:
            continue
        if "max_latency_ms" in constraints and config["latency_ms"] > constraints["max_latency_ms"]:
            continue
        if "min_quality" in constraints and config["quality"] < constraints["min_quality"]:
            continue
        feasible.append(config)

    if not feasible:
        return None

    feasible.sort(key=lambda c: (-c["quality"], c["cost"]))
    return feasible[0]
\`\`\`

**Approach:** Dominance check compares all three metrics (cost and latency: lower is better; quality: higher is better). Pareto frontier includes all non-dominated configs. Selection filters by constraints, then picks highest quality with cost as tiebreaker.`,
    testCases: [
      {
        id: "t1",
        name: "Dominated config detected",
        inputs: { config_a: { cost: 0.05, latency_ms: 1000, quality: 0.7 }, config_b: { cost: 0.01, latency_ms: 500, quality: 0.9 } },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Non-dominated configs on Pareto frontier",
        inputs: { configs: [{ name: "A", cost: 0.01, latency_ms: 1000, quality: 0.95 }, { name: "B", cost: 0.001, latency_ms: 100, quality: 0.6 }] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Select best within constraints",
        inputs: { configs: [{ name: "A", cost: 0.03, latency_ms: 1000, quality: 0.95 }, { name: "B", cost: 0.002, latency_ms: 300, quality: 0.8 }], constraints: { max_cost: 0.01, max_latency_ms: 500, min_quality: 0.7 } },
        isPublic: true,
      },
      {
        id: "t4",
        name: "No feasible config returns None",
        inputs: { configs: [{ name: "A", cost: 0.1, latency_ms: 2000, quality: 0.5 }], constraints: { max_cost: 0.01, min_quality: 0.9 } },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "eval-pipeline-design",
    type: "system_design",
    title: "Design an LLM Evaluation Pipeline",
    description: "Design a production LLM evaluation pipeline that runs automated evals, tracks metrics over time, and gates deployments.",
    difficulty: "Hard",
    weekNumber: 11,
    tags: '["evals", "system-design", "ci-cd", "monitoring", "reliability"]',
    theory: `LLM evaluation pipelines automate the process of measuring model quality. In production, models get updated (fine-tuned, prompted differently, swapped for cheaper options). Each change needs evaluation before deployment.

**Eval datasets** are curated sets of inputs with expected outputs or quality criteria. Gold-standard datasets have human-annotated references. Synthetic datasets are generated by stronger models. Both have trade-offs: human annotations are expensive but reliable; synthetic data scales but inherits the generator's biases.

**Multi-metric evaluation** runs several metrics per dataset: automatic (BLEU, ROUGE, BERTScore), model-based (LLM-as-judge), and task-specific (exact match for QA, code execution for coding). No single metric captures everything, so the pipeline produces a dashboard of scores.

**Regression detection** compares new model scores against baseline. Statistical tests (paired t-test, bootstrap confidence intervals) determine if differences are significant. A 0.5% BLEU drop might be noise; a 5% drop is a real regression. The pipeline flags significant regressions for human review.

**Deployment gating** blocks bad models from reaching production. Minimum thresholds on safety evals are non-negotiable (hard gates). Quality regressions require human approval (soft gates). The pipeline integrates with CI/CD: eval results determine whether a model promotion proceeds.`,
    hints: '["Think about what happens when you swap from GPT-4 to a fine-tuned smaller model", "Address how you handle eval dataset drift over time", "Consider cost of running evals vs frequency of model changes", "Include human-in-the-loop for ambiguous cases"]',
    visualizationComponent: "EvalPipelineViz",
    sortOrder: 9,
    starterCode: null,
    testCases: null,
    questions: null,
    designPrompt: `Design an LLM evaluation pipeline for a company with 5 LLM-powered products (chatbot, code assistant, summarizer, classifier, translator).

Requirements:
- Must evaluate automatically on every model/prompt change before deployment
- Must track metrics over time and detect regressions
- Must support multiple metric types: automatic, model-based, human
- Must gate deployments: block if safety fails, warn if quality regresses
- Must be cost-efficient: not every change needs a full eval suite

Your design should address:

1. **Eval Dataset Management:** How do you create, version, and maintain eval datasets? How do you handle dataset drift?

2. **Metric Selection:** What metrics do you use per product? How do you combine them into an overall quality signal?

3. **Pipeline Architecture:** What runs when? How do you trigger evals? What infrastructure runs them?

4. **Regression Detection:** How do you determine if a quality change is significant vs noise? What statistical methods do you use?

5. **Deployment Gates:** What are hard gates (block deployment) vs soft gates (require approval)? How do you set thresholds?

6. **Cost Management:** Full eval suite is expensive. How do you decide what to run? How do you handle eval budget constraints?`,
    sampleAnswer: `## Architecture

\`\`\`
Model/Prompt Change -> CI Trigger -> Eval Orchestrator -> Metric Runners -> Results DB
                                          |                                    |
                                    Eval Dataset Store                   Dashboard
                                                                              |
                                                                    Gate Decision -> Deploy/Block
\`\`\`

## Eval Dataset Management

**Per-product datasets:** Each product maintains its own eval set:
- Chatbot: 500 multi-turn conversations with quality ratings
- Code assistant: 200 coding tasks with test suites
- Summarizer: 300 document-summary pairs with human scores
- Classifier: 1000 labeled examples per category
- Translator: 500 parallel text pairs

**Versioning:** Datasets are versioned in git (metadata) + S3 (data). Every eval run records the dataset version used.

**Drift management:** Monthly review cycle. Add 10% new examples from recent production traffic. Remove examples that no longer represent the product's use case. Track dataset-level statistics (length distribution, topic coverage) to detect drift.

**Gold vs synthetic split:** 60% human-annotated gold standard, 40% synthetic (generated by GPT-4 with human spot-checks). Gold data is the source of truth for regression detection.

## Metric Selection

| Product | Auto Metrics | Model-Based | Task-Specific |
|---------|-------------|-------------|---------------|
| Chatbot | BERTScore | LLM judge (helpfulness, safety) | User satisfaction proxy |
| Code | - | - | Test pass rate, compilation rate |
| Summarizer | ROUGE-L, BERTScore | LLM judge (faithfulness) | Compression ratio |
| Classifier | - | - | F1, precision, recall per class |
| Translator | BLEU, COMET | - | Human ranking correlation |

**Composite score per product:** Weighted combination. Safety metrics get 0 veto weight (any failure = block). Quality metrics are weighted by business impact.

## Pipeline Architecture

**Trigger:** Every PR that changes a model config, system prompt, or model version triggers the eval pipeline.

**Tiered execution:**
- Tier 1 (every PR, <5 min): Smoke test on 50 examples. Catches obvious regressions.
- Tier 2 (merge to staging, <30 min): Full eval on 500 examples with automatic metrics.
- Tier 3 (before production, <2 hours): Full eval + LLM judge + sample human review.

**Infrastructure:** Eval runners are containerized jobs. Metric computation is parallelized across examples. LLM judge calls are batched for cost efficiency.

## Regression Detection

**Statistical test:** Paired bootstrap test. For each metric:
1. Compute metric on current (baseline) model and new model over the same examples
2. Bootstrap the paired differences 10,000 times
3. If the 95% CI of the difference excludes 0 and the direction is negative, flag regression

**Practical thresholds per metric:**
- BLEU: significant if |delta| > 1.0 point
- ROUGE-L: significant if |delta| > 0.02
- LLM judge score: significant if |delta| > 0.5 (on 1-10 scale)
- Test pass rate: significant if |delta| > 2%

**Trend tracking:** Store all eval results. Plot metrics over time. Alert if 3 consecutive evaluations show downward trend even if each individual change is within noise.

## Deployment Gates

**Hard gates (automatic block):**
- Safety eval failure (any toxicity/harmful content generated)
- >10% regression on primary metric
- Test pass rate below 90% (code assistant)

**Soft gates (require human approval):**
- 2-10% regression on any metric
- New failure mode detected (fails on examples that previously passed)
- LLM judge flags quality concerns

**Override process:** Engineering lead can override soft gates with written justification. Hard gate overrides require VP approval.

## Cost Management

**Budget allocation:** $X/month eval budget. Tier 1 uses ~5% (small sample, cheap metrics). Tier 2 uses ~30% (full sample, auto metrics). Tier 3 uses ~65% (LLM judge is expensive).

**Smart sampling:** For large eval sets, use stratified sampling to maintain coverage across difficulty levels and topics while reducing total examples.

**Caching:** Cache LLM judge results for unchanged (input, output) pairs. If only the system prompt changed, re-evaluate affected examples only.

**Frequency control:** Batch small changes. If 5 prompt tweaks happen in a day, run Tier 2 once on the latest version rather than 5 times.`,
    rubric: [
      {
        criterion: "Dataset Management",
        weight: 0.2,
        description: "How eval datasets are created, versioned, and maintained over time",
        keyPoints: ["Per-product datasets", "Versioning strategy", "Drift handling", "Gold vs synthetic data"],
      },
      {
        criterion: "Metric Coverage",
        weight: 0.2,
        description: "Appropriate metrics per product with combination strategy",
        keyPoints: ["Multi-metric approach", "Task-specific metrics", "Composite scoring"],
      },
      {
        criterion: "Pipeline Design",
        weight: 0.25,
        description: "Architecture, triggers, and tiered execution strategy",
        keyPoints: ["Tiered eval (smoke/full/deep)", "CI/CD integration", "Parallelization"],
      },
      {
        criterion: "Regression & Gating",
        weight: 0.2,
        description: "Statistical rigor and deployment decision logic",
        keyPoints: ["Statistical significance testing", "Hard vs soft gates", "Threshold setting"],
      },
      {
        criterion: "Cost Efficiency",
        weight: 0.15,
        description: "Managing eval costs without sacrificing coverage",
        keyPoints: ["Budget allocation across tiers", "Smart sampling", "Caching"],
      },
    ],
  },
  {
    id: "answer-relevancy-score",
    type: "coding",
    title: "Answer Relevancy Scorer",
    description: `Score how relevant an answer is to a given question using embedding similarity and keyword overlap.

Implement:

1. **keyword_overlap(question, answer):** Compute the fraction of non-stopword question tokens that appear in the answer. Return a score between 0 and 1.

2. **embedding_relevancy(question, answer, embed_fn):** Compute cosine similarity between question and answer embeddings.

3. **combined_relevancy(question, answer, embed_fn, keyword_weight=0.3, embedding_weight=0.7):** Weighted combination of keyword overlap and embedding similarity.

4. **batch_score(questions, answers, embed_fn):** Score a batch of question-answer pairs. Return list of score dicts.

\`\`\`python
>>> keyword_overlap("What is machine learning?", "Machine learning is a subset of AI that learns from data.")
0.666...  # "machine" and "learning" found, "what" and "is" are stopwords
>>> combined_relevancy("What is ML?", "The weather is nice today.", embed_fn)
< 0.3  # irrelevant answer
\`\`\``,
    difficulty: "Medium",
    weekNumber: 11,
    tags: '["evals", "relevancy", "embeddings", "scoring"]',
    theory: `Answer relevancy measures whether the response addresses the question asked. A factually correct but off-topic answer is irrelevant. A relevant but wrong answer at least addresses the right topic.

**Keyword overlap** is a simple baseline: what fraction of the question's content words appear in the answer? Content words exclude stopwords (the, is, what, how). If the question asks about "machine learning" and the answer mentions both words, keyword overlap is high. This catches topic drift but misses semantic similarity.

**Embedding similarity** uses dense vector representations. The question and answer embeddings capture meaning beyond exact word matching. "ML" and "machine learning" are semantically similar even with zero word overlap. Cosine similarity between question and answer embeddings measures this semantic alignment.

**Combined scoring** weights both signals. Keyword overlap is a strong signal for direct matches. Embedding similarity catches paraphrases and semantic connections. A typical weighting: 30% keyword, 70% embedding. This avoids false negatives from either metric alone.

**Use in evaluation pipelines:** Relevancy is orthogonal to faithfulness. An answer can be faithful (grounded in context) but irrelevant (answers a different question). Both metrics are needed: faithfulness checks grounding, relevancy checks topic alignment.`,
    hints: '["Define a stopword set: {the, is, a, an, in, on, at, to, for, of, and, or, what, how, why, when, where, who, which}", "Lowercase both question and answer before comparison", "Cosine similarity: np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))", "Handle division by zero when question has no content words"]',
    visualizationComponent: "RelevancyViz",
    sortOrder: 10,
    starterCode: `import numpy as np

STOPWORDS = {"the", "is", "a", "an", "in", "on", "at", "to", "for", "of", "and", "or",
             "what", "how", "why", "when", "where", "who", "which", "it", "was", "are",
             "be", "been", "being", "have", "has", "had", "do", "does", "did", "that", "this"}

def keyword_overlap(question, answer):
    """
    Compute fraction of question content words found in answer.

    Args:
        question: question string
        answer: answer string

    Returns:
        float - overlap score (0 to 1)
    """
    pass

def embedding_relevancy(question, answer, embed_fn):
    """
    Compute cosine similarity between question and answer embeddings.

    Args:
        question: question string
        answer: answer string
        embed_fn: callable(str) -> np.array

    Returns:
        float - cosine similarity (-1 to 1)
    """
    pass

def combined_relevancy(question, answer, embed_fn, keyword_weight=0.3, embedding_weight=0.7):
    """
    Weighted combination of keyword and embedding relevancy.

    Args:
        question: question string
        answer: answer string
        embed_fn: callable(str) -> np.array
        keyword_weight: weight for keyword overlap
        embedding_weight: weight for embedding similarity

    Returns:
        float - combined relevancy score
    """
    pass

def batch_score(questions, answers, embed_fn):
    """
    Score a batch of question-answer pairs.

    Args:
        questions: list of question strings
        answers: list of answer strings
        embed_fn: callable(str) -> np.array

    Returns:
        list of {"question", "answer", "keyword", "embedding", "combined"}
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

STOPWORDS = {"the", "is", "a", "an", "in", "on", "at", "to", "for", "of", "and", "or",
             "what", "how", "why", "when", "where", "who", "which", "it", "was", "are",
             "be", "been", "being", "have", "has", "had", "do", "does", "did", "that", "this"}

def keyword_overlap(question, answer):
    q_tokens = set(question.lower().split()) - STOPWORDS
    a_tokens = set(answer.lower().split())
    if not q_tokens:
        return 0.0
    overlap = q_tokens & a_tokens
    return len(overlap) / len(q_tokens)

def embedding_relevancy(question, answer, embed_fn):
    q_emb = embed_fn(question)
    a_emb = embed_fn(answer)
    norm_q = np.linalg.norm(q_emb)
    norm_a = np.linalg.norm(a_emb)
    if norm_q == 0 or norm_a == 0:
        return 0.0
    return float(np.dot(q_emb, a_emb) / (norm_q * norm_a))

def combined_relevancy(question, answer, embed_fn, keyword_weight=0.3, embedding_weight=0.7):
    kw = keyword_overlap(question, answer)
    emb = embedding_relevancy(question, answer, embed_fn)
    return keyword_weight * kw + embedding_weight * emb

def batch_score(questions, answers, embed_fn):
    results = []
    for q, a in zip(questions, answers):
        kw = keyword_overlap(q, a)
        emb = embedding_relevancy(q, a, embed_fn)
        combined = 0.3 * kw + 0.7 * emb
        results.append({
            "question": q,
            "answer": a,
            "keyword": kw,
            "embedding": emb,
            "combined": combined,
        })
    return results
\`\`\`

**Approach:** Keyword overlap strips stopwords and computes set intersection ratio. Embedding relevancy uses cosine similarity. Combined score weights both. Batch processing iterates pairs and computes all metrics.`,
    testCases: [
      {
        id: "t1",
        name: "High keyword overlap",
        inputs: { question: "What is machine learning?", answer: "Machine learning is a method of data analysis." },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Zero overlap with irrelevant answer",
        inputs: { question: "What is machine learning?", answer: "The weather is sunny today." },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Combined relevancy weights correctly",
        inputs: { question: "How does Python handle memory?", answer: "Python uses garbage collection for automatic memory management." },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Batch scoring returns correct count",
        inputs: { num_pairs: 5 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },

  // ========== WEEK 12: Reasoning & LLMOps ==========
  {
    id: "chain-of-thought-parser",
    type: "coding",
    title: "Chain-of-Thought Parser & Validator",
    description: `Parse and validate chain-of-thought reasoning steps, detecting logical gaps and unsupported conclusions.

Implement:

1. **parse_cot(text):** Parse chain-of-thought text into structured steps. Each step has a number, content, and type (premise/inference/conclusion). Look for numbered steps, "therefore", "because", "so", "thus" as inference markers, and the final statement as conclusion.

2. **validate_chain(steps):** Check that the reasoning chain is valid: (a) at least one premise exists, (b) inferences reference prior steps, (c) a conclusion exists, (d) no circular references. Return a list of issues found.

3. **detect_gaps(steps):** Detect logical gaps: steps that introduce new information not derivable from prior steps (new entities/facts not mentioned before). Return gap locations.

\`\`\`python
>>> text = """
... 1. All mammals are warm-blooded. (premise)
... 2. Dogs are mammals. (premise)
... 3. Therefore, dogs are warm-blooded. (conclusion)
... """
>>> steps = parse_cot(text)
>>> len(steps)
3
>>> issues = validate_chain(steps)
>>> len(issues)
0  # valid chain
\`\`\``,
    difficulty: "Medium",
    weekNumber: 12,
    tags: '["reasoning", "chain-of-thought", "validation", "logic"]',
    theory: `Chain-of-thought (CoT) prompting asks the model to show its reasoning step by step before giving a final answer. This improves accuracy on reasoning tasks because intermediate steps constrain each subsequent step.

**Parsing CoT** structures free-form reasoning text into discrete steps. Each step is classified: premises are given facts, inferences derive new facts from prior steps, and the conclusion is the final answer. Parsing uses structural cues: numbered lists, keywords like "therefore", "because", "so", and position (first steps are usually premises, last step is usually the conclusion).

**Chain validation** checks logical coherence. A valid chain has at least one premise (cannot reason from nothing), inferences that reference prior steps (no unsupported leaps), and a conclusion. Common failures: missing premises, circular reasoning (step 3 depends on step 5 which depends on step 3), and leaps of logic (step goes from A to C without establishing B).

**Gap detection** identifies where the chain introduces new information without justification. If step 1 mentions "dogs" and "mammals", step 2 should not introduce "cats" without a premise establishing that. Each new entity or fact should trace back to a prior step or be explicitly marked as a new premise.

**Why this matters:** When LLMs produce CoT, the reasoning sometimes looks plausible but contains gaps. Automated validation catches these before the conclusion is trusted. This is a building block for self-consistency checks and tree-of-thought verification.`,
    hints: '["Split text by numbered lines (regex: ^\\\\d+\\\\.)", "Classify by keywords: \\"therefore\\"/\\"thus\\"/\\"so\\" -> inference/conclusion", "For gap detection, track entities mentioned in each step and flag new ones", "Circular reference: if step N references step M where M > N"]',
    visualizationComponent: "ChainOfThoughtViz",
    sortOrder: 1,
    starterCode: `import re

def parse_cot(text):
    """
    Parse chain-of-thought text into structured steps.

    Args:
        text: chain-of-thought reasoning text

    Returns:
        list of {"number": int, "content": str, "type": str}
        where type is "premise", "inference", or "conclusion"
    """
    pass

def validate_chain(steps):
    """
    Validate logical chain of reasoning steps.

    Args:
        steps: list of step dicts from parse_cot

    Returns:
        list of issue strings (empty if valid)
    """
    pass

def detect_gaps(steps):
    """
    Detect logical gaps where new information is introduced without support.

    Args:
        steps: list of step dicts from parse_cot

    Returns:
        list of {"step_number": int, "new_entities": list, "description": str}
    """
    pass`,
    solution: `\`\`\`python
import re

def parse_cot(text):
    lines = re.split(r'\\n+', text.strip())
    steps = []
    step_num = 0

    for line in lines:
        line = line.strip()
        if not line:
            continue
        match = re.match(r'^(\\d+)\\.\\s*(.+)', line)
        if not match:
            continue
        step_num = int(match.group(1))
        content = match.group(2).strip()

        # Remove parenthetical type hints
        content_clean = re.sub(r'\\s*\\((?:premise|conclusion|inference)\\)\\s*$', '', content, flags=re.IGNORECASE)

        # Classify step type
        conclusion_markers = ["therefore", "thus", "hence", "in conclusion", "we conclude"]
        inference_markers = ["so,", "because", "since", "this means", "it follows"]

        content_lower = content.lower()
        if any(m in content_lower for m in conclusion_markers):
            step_type = "conclusion"
        elif any(m in content_lower for m in inference_markers):
            step_type = "inference"
        elif step_num == 1:
            step_type = "premise"
        else:
            step_type = "premise"

        steps.append({"number": step_num, "content": content_clean, "type": step_type})

    return steps

def validate_chain(steps):
    issues = []
    if not steps:
        return ["Empty reasoning chain"]

    has_premise = any(s["type"] == "premise" for s in steps)
    has_conclusion = any(s["type"] == "conclusion" for s in steps)

    if not has_premise:
        issues.append("No premise found: reasoning must start from given facts")
    if not has_conclusion:
        issues.append("No conclusion found: reasoning must reach a final statement")

    # Check step numbering continuity
    numbers = [s["number"] for s in steps]
    for i in range(1, len(numbers)):
        if numbers[i] != numbers[i-1] + 1:
            issues.append(f"Step numbering gap between {numbers[i-1]} and {numbers[i]}")

    # Check conclusion is last
    for s in steps[:-1]:
        if s["type"] == "conclusion":
            issues.append(f"Conclusion at step {s['number']} is not the final step")

    return issues

def _extract_entities(text):
    words = set(re.findall(r'\\b[a-zA-Z]{3,}\\b', text.lower()))
    stopwords = {"the", "and", "are", "was", "were", "that", "this", "from", "with",
                 "for", "all", "therefore", "thus", "hence", "because", "since",
                 "not", "can", "will", "have", "has", "been"}
    return words - stopwords

def detect_gaps(steps):
    gaps = []
    known_entities = set()

    for step in steps:
        step_entities = _extract_entities(step["content"])
        if step["type"] == "premise":
            known_entities.update(step_entities)
        else:
            new_entities = step_entities - known_entities
            if new_entities:
                gaps.append({
                    "step_number": step["number"],
                    "new_entities": sorted(new_entities),
                    "description": f"Step {step['number']} introduces new entities not from prior steps: {', '.join(sorted(new_entities))}",
                })
            known_entities.update(step_entities)

    return gaps
\`\`\`

**Approach:** Parse numbered lines with regex. Classify steps by keyword markers (therefore/thus = conclusion, because/since = inference, else = premise). Validate structure: must have premise and conclusion, sequential numbering, conclusion last. Gap detection tracks entities across steps and flags new introductions.`,
    testCases: [
      {
        id: "t1",
        name: "Parse valid 3-step chain",
        inputs: { text: "1. All mammals are warm-blooded.\n2. Dogs are mammals.\n3. Therefore, dogs are warm-blooded." },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Detect missing conclusion",
        inputs: { text: "1. All birds have feathers.\n2. Penguins are birds." },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Detect logical gap",
        inputs: { text: "1. All cats are animals.\n2. Therefore, elephants are large." },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Valid chain returns no issues",
        inputs: { text: "1. All X are Y.\n2. Z is X.\n3. Therefore, Z is Y." },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "speculative-decoding",
    type: "coding",
    title: "Speculative Decoding Simulator",
    description: `Implement the draft-then-verify speculative decoding algorithm that uses a small draft model to propose tokens and a large target model to verify them in parallel.

Implement:

1. **draft_tokens(draft_model_fn, prefix, k):** Generate k draft tokens autoregressively using the draft model. Return tokens and their probabilities under the draft model.

2. **verify_tokens(target_model_fn, prefix, draft_tokens, draft_probs):** Verify draft tokens against the target model. Accept tokens where target_prob >= draft_prob. Reject at the first failure point and sample a correction from the adjusted distribution. Return accepted tokens + optional correction.

3. **speculative_decode(draft_model_fn, target_model_fn, prefix, num_tokens, k=5):** Full speculative decoding loop. Alternate between drafting k tokens and verifying. Continue until num_tokens are generated.

\`\`\`python
>>> # draft_model_fn(prefix) returns {"tokens": [...], "probs": [...]}
>>> # target_model_fn(prefix, tokens) returns {"probs": [...]}
>>> result = speculative_decode(draft_fn, target_fn, "The cat", num_tokens=20, k=5)
>>> len(result["tokens"]) == 20
True
>>> result["acceptance_rate"]  # fraction of draft tokens accepted
> 0.5
\`\`\``,
    difficulty: "Hard",
    weekNumber: 12,
    tags: '["speculative-decoding", "inference", "optimization", "model-serving"]',
    theory: `Speculative decoding accelerates LLM inference by using a small, fast model to draft tokens that a large, accurate model verifies in parallel. The key insight: verifying N tokens in a single forward pass of the large model is much faster than generating N tokens autoregressively.

**The algorithm:** (1) The draft model generates k tokens autoregressively (fast, because it is small). (2) The target model scores all k tokens in a single forward pass. (3) Tokens are accepted or rejected based on probability comparison. (4) The first rejected token is replaced by sampling from an adjusted distribution. (5) All tokens after the rejection point are discarded.

**Acceptance criterion:** For each draft token, compare p_target(token) vs p_draft(token). If p_target >= p_draft, accept (the target model agrees or likes the token more). If p_target < p_draft, accept with probability p_target/p_draft (stochastic acceptance preserves the target distribution). On rejection, sample from the residual distribution: (p_target - p_draft * acceptance) normalized.

**Why it works:** If the draft and target models agree on most tokens (high acceptance rate), you generate k tokens per target model forward pass instead of 1. A well-matched draft model achieves 70-80% acceptance rate, yielding 2-3x speedup. The output distribution is mathematically identical to the target model's distribution - speculative decoding is lossless.

**Choosing k:** Larger k means more draft tokens per verification step, but also more wasted computation when rejection happens early. Optimal k depends on the acceptance rate: higher acceptance -> larger k is better. Typical values: k=4 to k=8.`,
    hints: '["Draft model generates tokens one at a time (autoregressive)", "Target model scores all k draft tokens in one call", "Accept token i if random() < min(1, target_prob[i] / draft_prob[i])", "On rejection at position i, discard tokens i+1 to k and sample correction from adjusted distribution"]',
    visualizationComponent: "SpeculativeDecodingViz",
    sortOrder: 2,
    starterCode: `import random

def draft_tokens(draft_model_fn, prefix, k):
    """
    Generate k draft tokens using the draft model.

    Args:
        draft_model_fn: callable(prefix_str) -> {"token": str, "prob": float}
        prefix: string prefix to continue from
        k: number of tokens to draft

    Returns:
        {"tokens": list[str], "probs": list[float]}
    """
    pass

def verify_tokens(target_model_fn, prefix, draft_tokens, draft_probs):
    """
    Verify draft tokens against the target model.

    Args:
        target_model_fn: callable(prefix_str, tokens_list) -> {"probs": list[float]}
        prefix: original prefix string
        draft_tokens: list of drafted token strings
        draft_probs: list of draft model probabilities

    Returns:
        {"accepted_tokens": list[str], "correction": str or None, "num_accepted": int}
    """
    pass

def speculative_decode(draft_model_fn, target_model_fn, prefix, num_tokens, k=5):
    """
    Full speculative decoding loop.

    Args:
        draft_model_fn: draft model function
        target_model_fn: target model function
        prefix: starting text
        num_tokens: total tokens to generate
        k: draft length per iteration

    Returns:
        {"tokens": list[str], "text": str, "acceptance_rate": float,
         "num_iterations": int}
    """
    pass`,
    solution: `\`\`\`python
import random

def draft_tokens(draft_model_fn, prefix, k):
    tokens = []
    probs = []
    current_prefix = prefix

    for _ in range(k):
        result = draft_model_fn(current_prefix)
        tokens.append(result["token"])
        probs.append(result["prob"])
        current_prefix = current_prefix + result["token"]

    return {"tokens": tokens, "probs": probs}

def verify_tokens(target_model_fn, prefix, draft_tokens_list, draft_probs):
    target_result = target_model_fn(prefix, draft_tokens_list)
    target_probs = target_result["probs"]

    accepted = []
    correction = None

    for i in range(len(draft_tokens_list)):
        tp = target_probs[i]
        dp = draft_probs[i]

        # Accept with probability min(1, tp/dp)
        if dp > 0:
            accept_prob = min(1.0, tp / dp)
        else:
            accept_prob = 1.0 if tp > 0 else 0.0

        if random.random() < accept_prob:
            accepted.append(draft_tokens_list[i])
        else:
            # Rejection: sample correction from adjusted distribution
            # In practice, sample from (target - draft * acceptance_prob) normalized
            # Simplified: use the target model's preferred token
            correction = target_result.get("correction_token", draft_tokens_list[i])
            break

    return {
        "accepted_tokens": accepted,
        "correction": correction,
        "num_accepted": len(accepted),
    }

def speculative_decode(draft_model_fn, target_model_fn, prefix, num_tokens, k=5):
    generated = []
    current_prefix = prefix
    total_drafted = 0
    total_accepted = 0
    iterations = 0

    while len(generated) < num_tokens:
        remaining = num_tokens - len(generated)
        draft_k = min(k, remaining)

        draft = draft_tokens(draft_model_fn, current_prefix, draft_k)
        total_drafted += len(draft["tokens"])
        iterations += 1

        result = verify_tokens(
            target_model_fn, current_prefix,
            draft["tokens"], draft["probs"]
        )

        accepted = result["accepted_tokens"]
        total_accepted += len(accepted)
        generated.extend(accepted)

        # Update prefix with accepted tokens
        for token in accepted:
            current_prefix = current_prefix + token

        # Add correction token if rejection occurred
        if result["correction"] and len(generated) < num_tokens:
            generated.append(result["correction"])
            current_prefix = current_prefix + result["correction"]

    # Trim to exact length
    generated = generated[:num_tokens]

    acceptance_rate = total_accepted / total_drafted if total_drafted > 0 else 0.0

    return {
        "tokens": generated,
        "text": prefix + "".join(generated),
        "acceptance_rate": acceptance_rate,
        "num_iterations": iterations,
    }
\`\`\`

**Approach:** Draft model generates k tokens autoregressively. Target model scores all k in one pass. Accept each token with probability min(1, p_target/p_draft). On rejection, use the target model's correction. Loop until enough tokens are generated. Track acceptance rate for diagnostics.`,
    testCases: [
      {
        id: "t1",
        name: "Draft generates k tokens",
        inputs: { prefix: "The cat", k: 5 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Verify accepts matching tokens",
        inputs: { prefix: "The", draft_tokens: ["cat", "sat"], draft_probs: [0.8, 0.7], target_probs: [0.9, 0.8] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Full decode produces correct length",
        inputs: { prefix: "Once upon", num_tokens: 10, k: 3 },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Acceptance rate computed correctly",
        inputs: { prefix: "Hello", num_tokens: 20, k: 5 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "kv-cache-manager",
    type: "coding",
    title: "KV Cache Manager for Transformer Inference",
    description: `Implement a key-value cache for transformer inference that stores computed attention keys and values, avoiding redundant computation during autoregressive generation.

Implement a \`KVCacheManager\` class:

1. **__init__(self, num_layers, max_seq_len):** Initialize caches for each layer.

2. **update(self, layer_idx, new_keys, new_values):** Append new K/V tensors for a layer. Evict oldest entries if max_seq_len exceeded.

3. **get(self, layer_idx):** Return cached (keys, values) for a layer.

4. **get_length(self):** Return current sequence length in cache.

5. **clear(self):** Reset all caches.

6. **memory_usage(self):** Return total elements stored across all layers.

\`\`\`python
>>> import numpy as np
>>> cache = KVCacheManager(num_layers=4, max_seq_len=512)
>>> cache.update(0, np.ones((1, 8, 1, 64)), np.ones((1, 8, 1, 64)))
>>> cache.get_length()
1
>>> cache.update(0, np.ones((1, 8, 1, 64)), np.ones((1, 8, 1, 64)))
>>> cache.get_length()
2  # concatenated along sequence dimension
\`\`\``,
    difficulty: "Medium",
    weekNumber: 12,
    tags: '["kv-cache", "transformer", "inference", "optimization"]',
    theory: `During autoregressive generation, each new token attends to all previous tokens. Without caching, generating token N requires recomputing attention keys and values for tokens 1 through N-1 at every step. This is O(N^2) total computation for N tokens.

**KV caching** stores the keys and values computed at each step. When generating token N, the cache already contains K/V for tokens 1..N-1. The model only computes K/V for token N and concatenates with the cache. This reduces per-step computation from O(N) to O(1), making total generation O(N).

**Memory cost:** Each layer stores keys and values of shape (batch, heads, seq_len, head_dim). For a 32-layer model with 32 heads and head_dim=128, each token adds 32 * 2 * 32 * 128 = 262,144 float16 values = 512KB per token. A 2048-token sequence consumes ~1GB of cache per batch item.

**Eviction:** When the sequence exceeds max_seq_len, the cache must evict old entries. Simple FIFO eviction drops the oldest tokens. Smarter strategies (like PagedAttention in vLLM) manage cache memory like virtual memory pages, enabling efficient sharing across requests.

**Implementation details:** Keys and values are 4D tensors: (batch, num_heads, seq_len, head_dim). Appending means concatenating along the seq_len dimension (axis 2). The cache must maintain this for every layer independently, as each layer has different K/V values.`,
    hints: '["Store K and V as lists of numpy arrays per layer, concatenate on get", "Sequence length = shape[2] of the cached key tensor", "For eviction, slice off the first N positions along axis 2", "Memory usage = sum of .size across all stored arrays"]',
    visualizationComponent: "KVCacheViz",
    sortOrder: 3,
    starterCode: `import numpy as np

class KVCacheManager:
    def __init__(self, num_layers, max_seq_len):
        """
        Args:
            num_layers: number of transformer layers
            max_seq_len: maximum cached sequence length
        """
        pass

    def update(self, layer_idx, new_keys, new_values):
        """
        Append new keys and values for a layer.

        Args:
            layer_idx: which transformer layer
            new_keys: numpy array of shape (batch, heads, new_len, head_dim)
            new_values: numpy array of shape (batch, heads, new_len, head_dim)
        """
        pass

    def get(self, layer_idx):
        """
        Get cached keys and values for a layer.

        Returns:
            tuple of (keys, values) numpy arrays, or (None, None) if empty
        """
        pass

    def get_length(self):
        """Return current sequence length in cache."""
        pass

    def clear(self):
        """Reset all caches."""
        pass

    def memory_usage(self):
        """Return total number of elements stored."""
        pass`,
    solution: `\`\`\`python
import numpy as np

class KVCacheManager:
    def __init__(self, num_layers, max_seq_len):
        self.num_layers = num_layers
        self.max_seq_len = max_seq_len
        self._keys = [None] * num_layers
        self._values = [None] * num_layers

    def update(self, layer_idx, new_keys, new_values):
        if self._keys[layer_idx] is None:
            self._keys[layer_idx] = new_keys
            self._values[layer_idx] = new_values
        else:
            self._keys[layer_idx] = np.concatenate([self._keys[layer_idx], new_keys], axis=2)
            self._values[layer_idx] = np.concatenate([self._values[layer_idx], new_values], axis=2)

        # Evict if over max_seq_len
        seq_len = self._keys[layer_idx].shape[2]
        if seq_len > self.max_seq_len:
            excess = seq_len - self.max_seq_len
            self._keys[layer_idx] = self._keys[layer_idx][:, :, excess:, :]
            self._values[layer_idx] = self._values[layer_idx][:, :, excess:, :]

    def get(self, layer_idx):
        if self._keys[layer_idx] is None:
            return None, None
        return self._keys[layer_idx], self._values[layer_idx]

    def get_length(self):
        for i in range(self.num_layers):
            if self._keys[i] is not None:
                return self._keys[i].shape[2]
        return 0

    def clear(self):
        self._keys = [None] * self.num_layers
        self._values = [None] * self.num_layers

    def memory_usage(self):
        total = 0
        for i in range(self.num_layers):
            if self._keys[i] is not None:
                total += self._keys[i].size + self._values[i].size
        return total
\`\`\`

**Approach:** Store K/V arrays per layer, concatenate along sequence dimension (axis 2) on update. Evict oldest entries (front of axis 2) when exceeding max_seq_len. Memory usage sums .size across all stored arrays.`,
    testCases: [
      {
        id: "t1",
        name: "Update and get returns correct shape",
        inputs: { num_layers: 2, max_seq_len: 100, update_shape: [1, 8, 1, 64] },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Sequence length tracks correctly",
        inputs: { num_layers: 2, max_seq_len: 100, num_updates: 5 },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Eviction at max_seq_len",
        inputs: { num_layers: 1, max_seq_len: 3, num_updates: 5 },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Clear resets everything",
        inputs: { num_layers: 4, max_seq_len: 100, num_updates: 10 },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Memory usage computed correctly",
        inputs: { num_layers: 4, max_seq_len: 512, shape: [1, 8, 1, 64] },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "continuous-batching",
    type: "coding",
    title: "Continuous Batching Scheduler",
    description: `Implement a continuous batching scheduler for model serving that dynamically adds and removes requests from the batch as they complete, maximizing GPU utilization.

Implement a \`BatchScheduler\` class:

1. **__init__(self, max_batch_size, max_seq_len):** Initialize the scheduler.

2. **submit_request(self, request_id, prompt_tokens, max_new_tokens):** Add a request to the waiting queue.

3. **step(self):** Run one generation step. Fill the batch from the queue up to max_batch_size. For each active request, generate one token (simulate with a callback). Remove completed requests (hit max_new_tokens or EOS). Return step results.

4. **get_stats(self):** Return utilization stats: avg batch size, throughput (tokens/step), total completed.

\`\`\`python
>>> scheduler = BatchScheduler(max_batch_size=4, max_seq_len=512)
>>> scheduler.submit_request("r1", prompt_tokens=10, max_new_tokens=5)
>>> scheduler.submit_request("r2", prompt_tokens=20, max_new_tokens=3)
>>> result = scheduler.step()
>>> result["active_batch_size"]
2  # both requests in batch
>>> # After enough steps, r2 completes first (shorter max_new_tokens)
>>> # r2's slot is immediately available for the next queued request
\`\`\``,
    difficulty: "Hard",
    weekNumber: 12,
    tags: '["model-serving", "batching", "inference", "scheduling"]',
    theory: `Traditional static batching waits for all requests in a batch to complete before starting the next batch. If one request generates 500 tokens and another generates 10, the GPU sits idle for 490 steps waiting for the long request. This wastes 50%+ of compute.

**Continuous batching** (also called in-flight batching) removes completed requests mid-batch and immediately fills their slots with waiting requests. The batch size fluctuates dynamically. A request generating 10 tokens frees its slot after 10 steps, and a new request takes that slot without waiting for the 500-token request to finish.

**Iteration-level scheduling** runs the generation step for all active requests simultaneously (one token per step per request). After each step, the scheduler checks which requests are done (hit max_tokens or generated EOS token), removes them, and admits new requests from the queue. This keeps the GPU at maximum batch utilization.

**Memory management:** Each request in the batch holds KV cache memory proportional to its sequence length. When a request completes, its KV cache is freed. New requests start with smaller caches. The scheduler must track total memory to avoid OOM: max_batch_size is bounded by available GPU memory divided by per-request cache size at max_seq_len.

**vLLM's approach:** PagedAttention manages KV cache as pages (blocks of tokens) that can be allocated and freed independently. This eliminates memory fragmentation and enables higher batch utilization than monolithic per-request allocation.`,
    hints: '["Use a queue (list or deque) for waiting requests and a dict for active requests", "Each step: (1) fill batch from queue, (2) generate one token per active request, (3) check completion, (4) remove completed", "Track tokens_generated per request to know when it hits max_new_tokens", "Utilization = active_batch_size / max_batch_size per step"]',
    visualizationComponent: "ContinuousBatchingViz",
    sortOrder: 4,
    starterCode: `from collections import deque

class BatchScheduler:
    def __init__(self, max_batch_size, max_seq_len):
        """
        Args:
            max_batch_size: maximum concurrent requests in batch
            max_seq_len: maximum sequence length per request
        """
        pass

    def submit_request(self, request_id, prompt_tokens, max_new_tokens):
        """
        Add a request to the waiting queue.

        Args:
            request_id: unique string identifier
            prompt_tokens: number of tokens in the prompt
            max_new_tokens: maximum tokens to generate
        """
        pass

    def step(self):
        """
        Run one generation step.

        Returns:
            dict with "active_batch_size", "completed_this_step",
            "waiting_queue_size", "tokens_generated_this_step"
        """
        pass

    def get_stats(self):
        """
        Return scheduler statistics.

        Returns:
            dict with "total_completed", "total_steps", "avg_batch_utilization",
            "total_tokens_generated"
        """
        pass`,
    solution: `\`\`\`python
from collections import deque

class BatchScheduler:
    def __init__(self, max_batch_size, max_seq_len):
        self.max_batch_size = max_batch_size
        self.max_seq_len = max_seq_len
        self.queue = deque()
        self.active = {}  # request_id -> request_info
        self.total_completed = 0
        self.total_steps = 0
        self.total_tokens = 0
        self._utilization_sum = 0.0

    def submit_request(self, request_id, prompt_tokens, max_new_tokens):
        self.queue.append({
            "request_id": request_id,
            "prompt_tokens": prompt_tokens,
            "max_new_tokens": max_new_tokens,
            "tokens_generated": 0,
        })

    def step(self):
        # Fill batch from queue
        while len(self.active) < self.max_batch_size and self.queue:
            req = self.queue.popleft()
            self.active[req["request_id"]] = req

        # Generate one token per active request
        completed = []
        for req_id, req in self.active.items():
            req["tokens_generated"] += 1
            self.total_tokens += 1

            if req["tokens_generated"] >= req["max_new_tokens"]:
                completed.append(req_id)

        # Remove completed requests
        for req_id in completed:
            del self.active[req_id]
            self.total_completed += 1

        self.total_steps += 1
        batch_size = len(self.active) + len(completed)  # size at start of step
        self._utilization_sum += batch_size / self.max_batch_size

        return {
            "active_batch_size": len(self.active),
            "completed_this_step": completed,
            "waiting_queue_size": len(self.queue),
            "tokens_generated_this_step": batch_size,
        }

    def get_stats(self):
        avg_util = self._utilization_sum / self.total_steps if self.total_steps > 0 else 0.0
        return {
            "total_completed": self.total_completed,
            "total_steps": self.total_steps,
            "avg_batch_utilization": avg_util,
            "total_tokens_generated": self.total_tokens,
        }
\`\`\`

**Approach:** Queue for waiting requests, dict for active batch. Each step: fill batch from queue, generate one token per request, remove completed requests. Track utilization as active/max_batch_size per step. Completed slots are immediately available for the next step's fill phase.`,
    testCases: [
      {
        id: "t1",
        name: "Requests enter batch from queue",
        inputs: { max_batch_size: 4, requests: [["r1", 10, 5], ["r2", 20, 3]] },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Short requests complete first",
        inputs: { max_batch_size: 2, requests: [["r1", 10, 2], ["r2", 10, 5]], steps: 3 },
        isPublic: true,
      },
      {
        id: "t3",
        name: "New requests fill completed slots",
        inputs: { max_batch_size: 2, requests: [["r1", 10, 1], ["r2", 10, 1], ["r3", 10, 1]], steps: 3 },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Utilization stats tracked correctly",
        inputs: { max_batch_size: 4, num_requests: 8, steps: 20 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "reasoning-cot-quiz",
    type: "quiz",
    title: "Reasoning & Chain-of-Thought",
    description: "Test your understanding of chain-of-thought prompting, self-consistency, tree-of-thought, and reasoning model architectures.",
    difficulty: "Medium",
    weekNumber: 12,
    tags: '["reasoning", "chain-of-thought", "self-consistency", "tree-of-thought", "quiz"]',
    theory: `Chain-of-thought (CoT) prompting unlocks reasoning capabilities in LLMs by asking them to show intermediate steps. Without CoT, a model might jump from question to answer, missing complex multi-step reasoning. With CoT, the model generates intermediate steps that constrain subsequent reasoning.

**Zero-shot CoT** adds "Let's think step by step" to the prompt. This simple instruction activates reasoning behavior in large models. It works because the training data contains step-by-step solutions, and the instruction biases the model toward that distribution.

**Few-shot CoT** provides examples of step-by-step reasoning. The model mimics the demonstrated reasoning style. This is more reliable than zero-shot because the examples show the expected format and depth of reasoning.

**Self-consistency** generates multiple CoT paths and takes the majority answer. If 8 out of 10 paths arrive at "42", that answer is more likely correct than one from a single path. This works because correct reasoning paths tend to converge on the same answer, while errors are more random.

**Tree-of-thought (ToT)** extends CoT from a single chain to a tree. At each step, the model generates multiple candidate next-steps, evaluates them, and expands the most promising ones. This enables search and backtracking: if a reasoning path hits a dead end, the model can return to an earlier branch point and try a different direction.

**Reasoning models** (o1, DeepSeek-R1) are trained specifically for extended reasoning. They use reinforcement learning on reasoning tasks and produce long internal thought chains before answering. The key difference from prompted CoT: the reasoning behavior is baked into the model weights, not elicited by prompting.`,
    hints: '[]',
    visualizationComponent: "ChainOfThoughtViz",
    sortOrder: 5,
    starterCode: null,
    testCases: null,
    questions: [
      {
        id: "w12-q1-1",
        questionNumber: 1,
        questionText: "Why does chain-of-thought prompting improve accuracy on multi-step reasoning tasks?",
        options: {
          a: "It increases the model's context window size",
          b: "It forces the model to generate intermediate steps that constrain subsequent reasoning, reducing the chance of skipping critical logic",
          c: "It makes the model run more forward passes through the network",
          d: "It reduces the temperature to zero, making output deterministic",
        },
        correctAnswer: "b",
        explanation: "CoT breaks a complex reasoning problem into steps. Each generated step becomes part of the context for the next step, constraining what the model can say next. Without CoT, the model must make the entire logical leap at once, which is more error-prone. The intermediate steps serve as working memory for the reasoning process.",
      },
      {
        id: "w12-q1-2",
        questionNumber: 2,
        questionText: "Self-consistency decoding improves CoT by:",
        options: {
          a: "Training the model on more diverse reasoning examples",
          b: "Generating multiple reasoning paths and selecting the answer that appears most frequently (majority vote)",
          c: "Forcing all reasoning paths to be identical",
          d: "Reducing the number of reasoning steps to minimize errors",
        },
        correctAnswer: "b",
        explanation: "Self-consistency samples multiple CoT paths (typically 5-40) and takes the majority answer. Correct reasoning paths tend to converge on the same answer through different routes. Errors are more random and unlikely to all agree. This is analogous to ensemble methods in ML: combining diverse predictions reduces variance.",
      },
      {
        id: "w12-q1-3",
        questionNumber: 3,
        questionText: "Tree-of-thought differs from chain-of-thought in that it:",
        options: {
          a: "Uses a smaller model for faster inference",
          b: "Explores multiple reasoning branches at each step and can backtrack from dead ends",
          c: "Always produces shorter reasoning chains",
          d: "Requires fine-tuning the model on tree-structured data",
        },
        correctAnswer: "b",
        explanation: "CoT is a single linear chain: step 1 -> step 2 -> step 3. ToT is a tree: at each step, multiple candidates are generated and evaluated. The most promising branches are expanded while dead ends are pruned. This enables search and backtracking, which is critical for problems where the first attempted path may not lead to a solution.",
      },
      {
        id: "w12-q1-4",
        questionNumber: 4,
        questionText: "What is the key architectural difference between reasoning models (like o1) and standard LLMs using CoT prompting?",
        options: {
          a: "Reasoning models have more parameters",
          b: "Reasoning models are trained with reinforcement learning on reasoning tasks, internalizing extended reasoning in their weights rather than relying on prompt engineering",
          c: "Reasoning models use a different tokenizer",
          d: "Reasoning models can only do math tasks",
        },
        correctAnswer: "b",
        explanation: "Standard CoT relies on prompt engineering to elicit reasoning behavior from a general-purpose model. Reasoning models are specifically trained (via RL on reasoning chains) to produce extended internal reasoning before answering. The reasoning behavior is in the weights, making it more reliable and capable of longer reasoning chains than prompted CoT.",
      },
      {
        id: "w12-q1-5",
        questionNumber: 5,
        questionText: "For which type of task does chain-of-thought prompting provide the LEAST benefit?",
        options: {
          a: "Multi-step arithmetic problems",
          b: "Simple factual recall (e.g., 'What is the capital of France?')",
          c: "Logic puzzles requiring multiple deduction steps",
          d: "Code generation requiring algorithmic planning",
        },
        correctAnswer: "b",
        explanation: "Simple factual recall is a single lookup - there are no intermediate reasoning steps to benefit from. 'The capital of France is Paris' requires no chain of thought. CoT helps when the answer requires multiple reasoning steps that build on each other. Arithmetic, logic, and algorithmic planning all involve multi-step reasoning where CoT prevents the model from skipping steps.",
      },
    ],
    solution: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "model-serving-quiz",
    type: "quiz",
    title: "Model Serving & Inference Optimization",
    description: "Test your understanding of vLLM, PagedAttention, speculative decoding, continuous batching, and model serving infrastructure.",
    difficulty: "Medium",
    weekNumber: 12,
    tags: '["model-serving", "vllm", "paged-attention", "speculative-decoding", "quiz"]',
    theory: `Model serving translates a trained model into a production service. The challenges are latency (time to first token, total generation time), throughput (requests per second), and cost (GPU utilization, memory efficiency).

**vLLM** is an open-source inference engine that achieves high throughput through PagedAttention and continuous batching. It manages KV cache memory like an operating system manages virtual memory: in fixed-size pages that can be allocated, shared, and freed independently.

**PagedAttention** solves KV cache fragmentation. Traditional serving pre-allocates max_seq_len memory per request, wasting space when the actual sequence is shorter. PagedAttention allocates pages (e.g., 16 tokens each) on demand. A request generating 50 tokens uses ceil(50/16)=4 pages, not 512 tokens worth of contiguous memory. This increases effective batch size by 2-4x.

**Speculative decoding** uses a small draft model to propose tokens verified by the target model in parallel. The target model processes k draft tokens in one forward pass instead of k sequential passes. Speedup depends on the acceptance rate (how often the target agrees with the draft). Typical: 2-3x speedup with 70-80% acceptance.

**Continuous batching** removes completed requests mid-batch and fills slots with queued requests. Static batching wastes GPU cycles waiting for the slowest request. Continuous batching keeps utilization near max_batch_size at all times.

**Quantization** (INT8, INT4, GPTQ, AWQ) reduces model memory and speeds up inference by using lower-precision weights. INT4 quantization cuts memory 4x vs FP16 with modest quality loss. This enables serving larger models on fewer GPUs.`,
    hints: '[]',
    visualizationComponent: "KVCacheViz",
    sortOrder: 6,
    starterCode: null,
    testCases: null,
    questions: [
      {
        id: "w12-q2-1",
        questionNumber: 1,
        questionText: "PagedAttention improves KV cache memory efficiency by:",
        options: {
          a: "Compressing key-value pairs using quantization",
          b: "Allocating KV cache in fixed-size pages on demand instead of pre-allocating max_seq_len per request, reducing fragmentation and waste",
          c: "Storing KV cache on CPU instead of GPU",
          d: "Sharing a single KV cache across all requests",
        },
        correctAnswer: "b",
        explanation: "Traditional serving pre-allocates max_seq_len memory per request. A request that generates 50 tokens but has max_seq_len=2048 wastes 97% of its allocated memory. PagedAttention allocates small pages (e.g., 16 tokens) on demand. A 50-token request uses 4 pages. This eliminates internal fragmentation and increases the number of requests that fit in GPU memory.",
      },
      {
        id: "w12-q2-2",
        questionNumber: 2,
        questionText: "In speculative decoding, what happens when the target model rejects a draft token?",
        options: {
          a: "The entire sequence is regenerated from scratch",
          b: "All draft tokens are accepted anyway to save time",
          c: "The rejected token is replaced by sampling from an adjusted distribution, and all subsequent draft tokens are discarded",
          d: "The draft model is retrained to better match the target",
        },
        correctAnswer: "c",
        explanation: "On rejection at position i: (1) the draft token is replaced by a sample from the residual distribution (target minus draft, normalized), (2) all draft tokens after position i are discarded because they were conditioned on the rejected token, (3) the next drafting round starts from the corrected position. This preserves the target model's exact output distribution.",
      },
      {
        id: "w12-q2-3",
        questionNumber: 3,
        questionText: "Continuous batching provides higher throughput than static batching because:",
        options: {
          a: "It uses a faster GPU",
          b: "It removes completed requests immediately and fills their slots with new requests, keeping the GPU busy instead of waiting for the slowest request in the batch",
          c: "It processes requests one at a time instead of in batches",
          d: "It compresses request data before processing",
        },
        correctAnswer: "b",
        explanation: "Static batching: if batch has requests generating 10, 50, 200 tokens, the GPU generates 200 steps but does useful work for the short requests only during their first 10/50 steps. The rest is waste. Continuous batching: the 10-token request finishes at step 10, its slot is filled by a new request at step 11. GPU stays at full utilization throughout.",
      },
      {
        id: "w12-q2-4",
        questionNumber: 4,
        questionText: "INT4 quantization reduces model memory by ~4x compared to FP16. What is the primary tradeoff?",
        options: {
          a: "The model can no longer be fine-tuned",
          b: "Inference speed decreases because INT4 operations are slower",
          c: "Some quality degradation due to reduced numerical precision, especially on reasoning-heavy tasks",
          d: "The model can only process English text",
        },
        correctAnswer: "c",
        explanation: "Quantization reduces precision: FP16 has 16-bit floating point, INT4 has 4-bit integers. This approximation introduces small errors in weight values. For many tasks (classification, simple generation), the quality loss is negligible. For reasoning-heavy or math tasks, the accumulated numerical errors can degrade performance. Modern quantization methods (GPTQ, AWQ) minimize this by calibrating quantization parameters on representative data.",
      },
      {
        id: "w12-q2-5",
        questionNumber: 5,
        questionText: "For a service with highly variable request lengths (some 10 tokens, some 5000 tokens), which optimization has the biggest impact on throughput?",
        options: {
          a: "Speculative decoding",
          b: "PagedAttention combined with continuous batching",
          c: "INT8 quantization",
          d: "Using a single large batch size",
        },
        correctAnswer: "b",
        explanation: "Variable request lengths cause two problems: (1) static memory allocation wastes memory on short requests (PagedAttention fixes this), (2) static batching wastes compute waiting for long requests (continuous batching fixes this). Together, PagedAttention maximizes memory utilization while continuous batching maximizes compute utilization. Speculative decoding helps latency per request but does not directly address the length variability problem.",
      },
    ],
    solution: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "token-streaming-buffer",
    type: "coding",
    title: "Streaming Token Output Buffer",
    description: `Implement a streaming token buffer that outputs text at word boundaries, avoiding partial word display in real-time streaming.

Implement a \`StreamingBuffer\` class:

1. **__init__(self):** Initialize the buffer.

2. **add_token(self, token):** Add a new token to the buffer. Return text ready to flush (complete words only) or empty string if buffer is not ready.

3. **flush(self):** Force flush all remaining buffered content.

4. **get_full_text(self):** Return all text outputted so far (flushed + buffered).

The key rule: only output text at word boundaries (after spaces, newlines, or punctuation). Buffer partial words until a boundary arrives.

\`\`\`python
>>> buf = StreamingBuffer()
>>> buf.add_token("Hel")
""  # "Hel" is partial - buffer it
>>> buf.add_token("lo")
""  # "Hello" still no boundary
>>> buf.add_token(" wor")
"Hello"  # space detected - flush "Hello", buffer "wor"
>>> buf.add_token("ld!")
" world!"  # punctuation at end - flush all
>>> buf.flush()
""  # nothing left
\`\`\``,
    difficulty: "Easy",
    weekNumber: 12,
    tags: '["streaming", "inference", "token-buffering", "ux"]',
    theory: `LLM streaming sends tokens to the user as they are generated, reducing perceived latency. The user sees text appearing in real-time rather than waiting for the full response. But tokens do not align with word boundaries - a word might span multiple tokens.

**The problem:** Tokens are subword units. "Hello" might be two tokens: "Hel" + "lo". If you display each token immediately, the user sees "Hel" flash briefly before "Hello" appears. This creates a flickering, janky experience. Partial words are confusing to read.

**Word-boundary buffering** accumulates tokens until a word boundary is detected (space, newline, or punctuation). When a space arrives, all buffered text up to and including the last complete word is flushed to display. The partial word after the last space stays in the buffer.

**Punctuation handling:** Punctuation usually signals a word boundary. "Hello!" should flush as one unit, not "Hello" then "!". The buffer waits for a boundary character, then flushes everything before the boundary plus the boundary itself.

**Tradeoff:** Buffering increases smoothness but adds latency. A very long word delays display. In practice, word-boundary buffering adds 1-3 token delays, which is imperceptible at typical generation speeds (20-50 tokens/second). The visual improvement is significant.`,
    hints: '["Track a buffer string that accumulates tokens", "When a space or newline appears, split at the last boundary", "Return the flushed portion and keep the rest in the buffer", "flush() returns whatever remains, clearing the buffer"]',
    visualizationComponent: "StreamingViz",
    sortOrder: 7,
    starterCode: `class StreamingBuffer:
    def __init__(self):
        """Initialize the streaming buffer."""
        pass

    def add_token(self, token):
        """
        Add a token to the buffer.

        Args:
            token: string token from the model

        Returns:
            str - text to display (complete words) or "" if buffering
        """
        pass

    def flush(self):
        """
        Force flush all remaining buffer content.

        Returns:
            str - remaining buffered text
        """
        pass

    def get_full_text(self):
        """Return all text (displayed + buffered)."""
        pass`,
    solution: `\`\`\`python
class StreamingBuffer:
    def __init__(self):
        self._buffer = ""
        self._displayed = ""

    def add_token(self, token):
        self._buffer += token

        # Find the last word boundary in the buffer
        last_boundary = -1
        for i in range(len(self._buffer) - 1, -1, -1):
            if self._buffer[i] in " \\n\\t":
                last_boundary = i
                break

        if last_boundary == -1:
            # Check if buffer ends with punctuation
            if self._buffer and self._buffer[-1] in ".,!?;:)]\\"'":
                output = self._buffer
                self._displayed += output
                self._buffer = ""
                return output
            return ""

        # Flush up to and including the boundary
        output = self._buffer[:last_boundary + 1]
        self._buffer = self._buffer[last_boundary + 1:]
        self._displayed += output
        return output

    def flush(self):
        output = self._buffer
        self._displayed += output
        self._buffer = ""
        return output

    def get_full_text(self):
        return self._displayed + self._buffer
\`\`\`

**Approach:** Accumulate tokens in a buffer. On each add, find the last word boundary (space, newline, tab). Flush everything before and including the boundary. Keep the remainder buffered. Handle end-of-sentence punctuation as a flush trigger. force flush() clears whatever remains.`,
    testCases: [
      {
        id: "t1",
        name: "Buffers partial words",
        inputs: { tokens: ["Hel", "lo"] },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Flushes at space boundary",
        inputs: { tokens: ["Hel", "lo", " wor", "ld"] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Flush returns remaining text",
        inputs: { tokens: ["par", "tial"], then_flush: true },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Full text includes all content",
        inputs: { tokens: ["The ", "quick ", "brown ", "fox"] },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "request-complexity-router",
    type: "coding",
    title: "Request Complexity Router",
    description: `Route incoming requests to the appropriate model tier (small/medium/large) based on complexity scoring.

Implement:

1. **score_complexity(request):** Analyze a request dict \`{"prompt": str, "task_type": str}\` and return a complexity score 0-1. Consider: prompt length, presence of multi-step instructions, technical vocabulary density, task type difficulty.

2. **assign_model(score, thresholds):** Given a complexity score and thresholds dict \`{"small": 0.3, "medium": 0.7}\`, return the model tier. score < small threshold -> "small", score < medium threshold -> "medium", else -> "large".

3. **route_batch(requests, thresholds):** Route a batch of requests. Return a dict mapping model tier to list of requests.

4. **estimate_cost(routed, pricing):** Given routed requests and pricing dict \`{"small": 0.001, "medium": 0.01, "large": 0.03}\` per request, estimate total cost.

\`\`\`python
>>> req = {"prompt": "What is 2+2?", "task_type": "qa"}
>>> score_complexity(req)
< 0.3  # simple factual question
>>> req2 = {"prompt": "Design a distributed system for...", "task_type": "system_design"}
>>> score_complexity(req2)
> 0.7  # complex design task
\`\`\``,
    difficulty: "Medium",
    weekNumber: 12,
    tags: '["model-serving", "routing", "cost-optimization", "inference"]',
    theory: `Not every request needs GPT-4. A simple "What time is it in Tokyo?" can be answered by a tiny model. A complex "Design a microservices architecture for..." needs a large reasoning model. Routing requests to the right model tier saves cost without sacrificing quality.

**Complexity scoring** analyzes the request to estimate required model capability. Signals include: prompt length (longer prompts often indicate complex tasks), presence of multi-step instructions ("first... then... finally..."), technical vocabulary density (domain-specific terms suggest specialized knowledge needs), and explicit task type (summarization is easier than code generation).

**Threshold-based routing** maps scores to model tiers. Simple requests (score < 0.3) go to a small model (Haiku, GPT-3.5). Medium requests (0.3-0.7) go to a medium model (Sonnet, GPT-4-mini). Complex requests (> 0.7) go to the large model (Opus, GPT-4). Thresholds are tuned empirically by measuring quality at each tier.

**Cost savings** can be significant. If 60% of requests are simple and route to a model costing 1/30th of the large model, total cost drops substantially. The key is ensuring routing quality: misrouting complex requests to small models produces bad answers. Monitoring the quality at each tier catches routing errors.

**Dynamic thresholds** adapt to load. Under high load, raise the small-model threshold to handle more requests cheaply. Under low load, route more to large models for better quality. This balances cost and quality based on current demand.`,
    hints: '["Count multi-step markers: \\"first\\", \\"then\\", \\"next\\", \\"finally\\", numbered lists", "Technical vocabulary: words > 8 characters or domain-specific terms", "Task type difficulty: qa < summarization < code_generation < system_design", "Weight signals and normalize to 0-1 range"]',
    visualizationComponent: "ModelRoutingViz",
    sortOrder: 8,
    starterCode: `def score_complexity(request):
    """
    Score request complexity from 0 (trivial) to 1 (very complex).

    Args:
        request: dict with "prompt" (str) and "task_type" (str)

    Returns:
        float - complexity score between 0 and 1
    """
    pass

def assign_model(score, thresholds=None):
    """
    Assign model tier based on complexity score.

    Args:
        score: float 0-1
        thresholds: dict with "small" and "medium" cutoffs

    Returns:
        str - "small", "medium", or "large"
    """
    if thresholds is None:
        thresholds = {"small": 0.3, "medium": 0.7}
    pass

def route_batch(requests, thresholds=None):
    """
    Route a batch of requests to model tiers.

    Args:
        requests: list of request dicts
        thresholds: routing thresholds

    Returns:
        dict mapping tier name to list of requests
    """
    pass

def estimate_cost(routed, pricing=None):
    """
    Estimate total cost for routed requests.

    Args:
        routed: dict from route_batch
        pricing: dict mapping tier to cost per request

    Returns:
        dict with per-tier costs and total
    """
    if pricing is None:
        pricing = {"small": 0.001, "medium": 0.01, "large": 0.03}
    pass`,
    solution: `\`\`\`python
import re

TASK_DIFFICULTY = {
    "qa": 0.1,
    "classification": 0.15,
    "summarization": 0.3,
    "translation": 0.35,
    "code_generation": 0.6,
    "analysis": 0.5,
    "reasoning": 0.7,
    "system_design": 0.8,
    "research": 0.7,
}

MULTI_STEP_MARKERS = ["first", "then", "next", "finally", "step", "after that", "subsequently"]

def score_complexity(request):
    prompt = request.get("prompt", "")
    task_type = request.get("task_type", "qa")

    scores = []

    # Length score (0-1)
    word_count = len(prompt.split())
    length_score = min(word_count / 200, 1.0)
    scores.append(length_score * 0.2)

    # Multi-step score
    lower_prompt = prompt.lower()
    step_count = sum(1 for marker in MULTI_STEP_MARKERS if marker in lower_prompt)
    # Also check for numbered lists
    step_count += len(re.findall(r'\\b\\d+\\.\\s', prompt))
    multi_step_score = min(step_count / 4, 1.0)
    scores.append(multi_step_score * 0.25)

    # Technical vocabulary density
    words = prompt.split()
    long_words = [w for w in words if len(w) > 8]
    tech_density = len(long_words) / max(len(words), 1)
    scores.append(min(tech_density * 3, 1.0) * 0.2)

    # Task type difficulty
    task_score = TASK_DIFFICULTY.get(task_type, 0.3)
    scores.append(task_score * 0.35)

    total = sum(scores)
    return min(max(total, 0.0), 1.0)

def assign_model(score, thresholds=None):
    if thresholds is None:
        thresholds = {"small": 0.3, "medium": 0.7}
    if score < thresholds["small"]:
        return "small"
    elif score < thresholds["medium"]:
        return "medium"
    else:
        return "large"

def route_batch(requests, thresholds=None):
    routed = {"small": [], "medium": [], "large": []}
    for req in requests:
        score = score_complexity(req)
        tier = assign_model(score, thresholds)
        routed[tier].append(req)
    return routed

def estimate_cost(routed, pricing=None):
    if pricing is None:
        pricing = {"small": 0.001, "medium": 0.01, "large": 0.03}
    costs = {}
    total = 0
    for tier, requests in routed.items():
        tier_cost = len(requests) * pricing.get(tier, 0)
        costs[tier] = tier_cost
        total += tier_cost
    costs["total"] = total
    return costs
\`\`\`

**Approach:** Complexity scoring weights four signals: prompt length (20%), multi-step markers (25%), technical vocabulary density (20%), and task type difficulty (35%). Routing maps scores to tiers via thresholds. Cost estimation multiplies request counts by per-tier pricing.`,
    testCases: [
      {
        id: "t1",
        name: "Simple QA scores low",
        inputs: { request: { prompt: "What is 2+2?", task_type: "qa" } },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Complex design scores high",
        inputs: { request: { prompt: "Design a distributed microservices architecture with load balancing, fault tolerance, and automatic scaling. First, define the service boundaries. Then, design the communication layer.", task_type: "system_design" } },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Route batch distributes correctly",
        inputs: { num_requests: 10 },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Cost estimation correct",
        inputs: { routed: { small: 5, medium: 3, large: 2 } },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "model-serving-design",
    type: "system_design",
    title: "Design Model Serving Infrastructure with Autoscaling",
    description: "Design a production model serving system that handles variable traffic with GPU autoscaling, request routing, and cost optimization.",
    difficulty: "Hard",
    weekNumber: 12,
    tags: '["model-serving", "system-design", "autoscaling", "infrastructure", "gpu"]',
    theory: `Model serving at scale requires infrastructure that handles variable traffic patterns: low overnight traffic, spike during business hours, burst during product launches. GPUs are expensive, so overprovisioning wastes money while underprovisioning causes timeouts.

**Request lifecycle:** Client sends request -> load balancer routes to available GPU server -> server runs prefill (encode prompt, fill KV cache) -> server runs decode (generate tokens one by one) -> stream tokens back to client. Total latency = queue wait + prefill + decode.

**GPU autoscaling** adjusts the number of GPU instances based on demand. Scale-up triggers: queue depth exceeding threshold, latency exceeding SLA, GPU utilization above target. Scale-down triggers: low utilization for sustained period, empty queues. GPU instances take 2-5 minutes to start, so predictive scaling (based on time-of-day patterns) supplements reactive scaling.

**Multi-model serving** hosts multiple model sizes on the same infrastructure. Small models run on older/cheaper GPUs. Large models require A100/H100. A request router directs each request to the appropriate model based on complexity, and the infrastructure ensures each model tier has sufficient capacity.

**Cost optimization levers:** spot/preemptible instances for non-latency-sensitive workloads, reserved instances for baseline capacity, on-demand for burst capacity. KV cache sharing (prefix caching) reduces redundant computation. Quantized models stretch GPU memory further.`,
    hints: '["Think about what metrics drive scale-up vs scale-down decisions", "Address cold start: how do you handle the 2-5 minute GPU startup time?", "Consider how you handle model updates without downtime", "Include monitoring and alerting for SLA violations"]',
    visualizationComponent: "ModelServingViz",
    sortOrder: 9,
    starterCode: null,
    testCases: null,
    questions: null,
    designPrompt: `Design a model serving infrastructure for a company handling 10,000 requests/minute at peak, serving three model tiers (small/medium/large) on GPU instances.

Requirements:
- P95 latency < 2 seconds for small model, < 5 seconds for medium, < 15 seconds for large
- Must handle 10x traffic spikes within 3 minutes
- Must minimize GPU cost (GPUs are $2-4/hour each)
- Must support rolling model updates without downtime
- Must serve 24/7 with 99.9% availability

Your design should address:

1. **Infrastructure Architecture:** What components exist? Load balancers, GPU pools, request queues, autoscalers?

2. **Autoscaling Strategy:** What metrics trigger scale-up/down? How do you handle cold start? Predictive vs reactive scaling?

3. **Request Routing:** How are requests routed to the right model tier and available GPU? How do you handle overload?

4. **Model Updates:** How do you deploy new model versions without downtime? Canary deployments? Blue-green?

5. **Cost Optimization:** How do you minimize GPU spend? Spot instances, right-sizing, idle shutdown?

6. **Monitoring & Reliability:** What do you monitor? How do you detect and handle failures?`,
    sampleAnswer: `## Architecture

\`\`\`
Client -> API Gateway -> Request Router -> Per-Tier Queues -> GPU Pool (per tier)
                              |                                      |
                         Complexity Scorer                    Autoscaler (per tier)
                                                                     |
                                                              Metrics Store -> Dashboard
\`\`\`

## Infrastructure Components

**API Gateway:** Rate limiting, authentication, request validation. Strips invalid requests before they consume GPU resources.

**Request Router:** Scores request complexity, assigns to tier, places in tier-specific queue. If a tier is overloaded (queue depth > threshold), can optionally route to the next tier up.

**Per-Tier GPU Pools:**
- Small tier: 8-16 GPUs (A10G), batch size 64, vLLM with continuous batching
- Medium tier: 4-8 GPUs (A100-40G), batch size 32, vLLM
- Large tier: 2-4 GPUs (H100-80G), batch size 8, vLLM with PagedAttention

**Autoscaler:** One per tier. Monitors queue depth, P95 latency, GPU utilization. Manages instance pool.

## Autoscaling Strategy

**Reactive scaling:**
- Scale up: queue depth > 100 OR P95 > SLA * 0.8 for 30 seconds
- Scale down: GPU utilization < 20% for 5 minutes AND queue empty
- Min instances per tier: small=2, medium=1, large=1 (always warm)

**Predictive scaling:**
- Train a time-series model on historical traffic patterns
- Pre-scale 10 minutes before predicted peak
- Override reactive scaling when prediction confidence > 0.8

**Cold start mitigation:**
- Keep 1-2 warm standby instances per tier (loaded model, ready to serve)
- Use GPU instance pools with pre-loaded container images (reduces startup from 5min to 1min)
- During spike: immediately activate warm standbys while cold instances boot

## Request Routing

**Primary routing:** Complexity score -> tier assignment -> tier queue

**Overload handling:**
1. Queue depth < 50: normal routing
2. Queue depth 50-200: increase batch size, accept higher latency
3. Queue depth > 200: route overflow to next tier up (small -> medium GPU is cheaper than dropping requests)
4. Queue depth > 500: return 503 with retry-after header (graceful degradation)

**Load balancing within tier:** Least-connections with health checks. Sticky routing for requests that share prompt prefixes (enables prefix caching).

## Model Updates

**Blue-green deployment:**
1. Bring up new instances with new model version (green fleet)
2. Run automated eval suite against green fleet
3. If evals pass: shift 10% traffic to green (canary)
4. Monitor quality metrics for 15 minutes
5. If clean: shift remaining 90% traffic
6. Keep old fleet (blue) alive for 30 minutes as rollback target
7. Terminate blue fleet

**Rollback trigger:** quality metric drops > 5%, error rate increases > 2%, latency regression > 20%. Automatic rollback shifts all traffic back to blue fleet within 30 seconds.

## Cost Optimization

**Baseline capacity:** Reserved instances for minimum traffic level. Cover overnight + weekday morning. ~40% of peak capacity.

**Burst capacity:** On-demand instances for daytime peaks. Start at predicted peak time, terminate at night.

**Spot instances:** For non-latency-sensitive batch processing (offline eval, data processing). Save 60-70% vs on-demand. Handle interruption by checkpointing.

**Right-sizing:** Monitor actual GPU memory usage. If small-tier GPUs use <60% memory, downsize to cheaper instances. If large-tier requests rarely exceed 2K tokens, reduce max_seq_len allocation.

**Idle shutdown:** If a tier has zero requests for 10 minutes and more than min_instances running, scale down. Keep minimum warm.

**Prefix caching:** Common system prompts and few-shot examples are cached in GPU memory. Reduces prefill cost by 30-50% for repetitive workloads.

## Monitoring & Reliability

**Metrics:**
- Per-request: latency (TTFT, total), tokens generated, model tier, queue wait time
- Per-tier: throughput (req/s), GPU utilization, memory usage, cache hit rate, error rate
- Per-instance: health check status, VRAM usage, inference errors

**Alerts:**
- P95 latency > SLA for 2 minutes -> page on-call
- Error rate > 1% -> alert
- GPU utilization > 90% for 5 minutes -> warn (approaching capacity)
- Instance health check fail -> automatic removal from pool

**Reliability:**
- Multi-AZ deployment: GPU pools spread across 2+ availability zones
- Auto-restart: crashed inference processes restart automatically
- Circuit breaker: if a model version has >5% error rate, stop routing to it and alert
- Graceful degradation: under extreme load, serve small-model responses for medium-tier requests rather than failing`,
    rubric: [
      {
        criterion: "Infrastructure Design",
        weight: 0.25,
        description: "Clear architecture with appropriate components for each concern",
        keyPoints: ["Per-tier GPU pools", "Request queuing", "Load balancing", "Gateway"],
      },
      {
        criterion: "Autoscaling",
        weight: 0.25,
        description: "Effective scaling strategy handling spikes and cold starts",
        keyPoints: ["Reactive + predictive scaling", "Cold start mitigation", "Min instances for warmth"],
      },
      {
        criterion: "Cost Optimization",
        weight: 0.2,
        description: "Strategies to minimize GPU spend without sacrificing quality",
        keyPoints: ["Reserved + on-demand + spot mix", "Right-sizing", "Prefix caching", "Idle shutdown"],
      },
      {
        criterion: "Reliability",
        weight: 0.2,
        description: "High availability with graceful degradation and rollback",
        keyPoints: ["Multi-AZ", "Blue-green deploys", "Circuit breakers", "Graceful degradation"],
      },
      {
        criterion: "Monitoring",
        weight: 0.1,
        description: "Comprehensive observability with actionable alerts",
        keyPoints: ["Per-request and per-tier metrics", "SLA-based alerting", "Health checks"],
      },
    ],
  },
  {
    id: "prefix-caching",
    type: "coding",
    title: "Prefix-Aware KV Caching",
    description: `Implement prefix-aware KV caching that identifies shared prompt prefixes across requests and reuses their cached KV states.

Implement a \`PrefixCache\` class:

1. **__init__(self, max_entries):** Initialize with a max cache size.

2. **compute_prefix_hash(self, tokens):** Compute a hash for a token prefix to use as cache key.

3. **lookup(self, prompt_tokens):** Find the longest cached prefix matching the start of prompt_tokens. Return the cached KV state and the number of tokens matched.

4. **store(self, prompt_tokens, kv_state):** Store the KV state for a prompt prefix. Use LRU eviction if at capacity.

5. **get_stats(self):** Return hit rate, average prefix match length, and cache size.

\`\`\`python
>>> cache = PrefixCache(max_entries=100)
>>> system_prompt = [1, 2, 3, 4, 5]  # shared system prompt tokens
>>> cache.store(system_prompt, kv_state_for_system)
>>> # New request with same system prompt + different user message
>>> req_tokens = [1, 2, 3, 4, 5, 10, 11, 12]
>>> result = cache.lookup(req_tokens)
>>> result["matched_length"]
5  # reuse KV for the system prompt
>>> result["kv_state"] is not None
True
\`\`\``,
    difficulty: "Medium",
    weekNumber: 12,
    tags: '["prefix-caching", "kv-cache", "inference", "optimization"]',
    theory: `Many LLM requests share common prefixes: system prompts, few-shot examples, or RAG preambles. If 100 requests use the same system prompt, computing its KV state 100 times is wasteful. Prefix caching computes it once and reuses the cached KV for subsequent requests.

**How it works:** The cache stores KV states keyed by token prefix hashes. When a new request arrives, the cache finds the longest prefix that matches the start of the request's tokens. The matching KV state is loaded, and the model only needs to compute KV for the non-matching suffix. For a 500-token system prompt shared across requests, this saves 500 tokens of prefill computation per request.

**Hash-based lookup** is efficient. Hash the token sequence at multiple prefix lengths (e.g., every 16 tokens). Lookup checks from longest to shortest until a match is found. This avoids O(N^2) comparison of token sequences.

**LRU eviction** manages cache capacity. Frequently used prefixes (shared system prompts) stay cached. Rarely used prefixes (unique conversation histories) are evicted. The cache size is bounded by GPU memory allocated for prefix caching.

**vLLM implementation:** vLLM's prefix caching uses a radix tree (trie) structure to efficiently match token prefixes. Each path from root to a node represents a token sequence. Branching occurs where requests diverge. This enables O(L) lookup where L is the prefix length.

**Savings:** For workloads with high prefix reuse (same system prompt, shared few-shot examples), prefix caching reduces prefill computation by 40-70%. The hit rate depends on prompt diversity: highly structured applications (customer support with fixed system prompt) benefit most.`,
    hints: '["Use tuple(tokens) as a hashable key", "For longest prefix match, try decreasing prefix lengths until a hit", "Track access timestamps for LRU eviction", "Hit rate = cache_hits / (cache_hits + cache_misses)"]',
    visualizationComponent: "PrefixCacheViz",
    sortOrder: 10,
    starterCode: `from collections import OrderedDict
import hashlib

class PrefixCache:
    def __init__(self, max_entries=100):
        """
        Args:
            max_entries: maximum number of cached prefix entries
        """
        pass

    def compute_prefix_hash(self, tokens):
        """
        Compute a hash key for a token sequence.

        Args:
            tokens: list of token ids

        Returns:
            str - hash string
        """
        pass

    def lookup(self, prompt_tokens):
        """
        Find the longest cached prefix matching the start of prompt_tokens.

        Args:
            prompt_tokens: list of token ids for the full prompt

        Returns:
            dict with "kv_state" (cached state or None),
            "matched_length" (int), "cache_hit" (bool)
        """
        pass

    def store(self, prompt_tokens, kv_state):
        """
        Store KV state for a prompt prefix. LRU eviction if at capacity.

        Args:
            prompt_tokens: list of token ids
            kv_state: the KV cache state to store
        """
        pass

    def get_stats(self):
        """Return cache statistics."""
        pass`,
    solution: `\`\`\`python
from collections import OrderedDict
import hashlib

class PrefixCache:
    def __init__(self, max_entries=100):
        self.max_entries = max_entries
        self._cache = OrderedDict()  # hash -> {"tokens": tuple, "kv_state": ..., "length": int}
        self._hits = 0
        self._misses = 0
        self._total_matched = 0

    def compute_prefix_hash(self, tokens):
        token_str = ",".join(str(t) for t in tokens)
        return hashlib.md5(token_str.encode()).hexdigest()

    def lookup(self, prompt_tokens):
        best_match = None
        best_length = 0

        # Try decreasing prefix lengths
        for length in range(len(prompt_tokens), 0, -1):
            prefix = prompt_tokens[:length]
            prefix_hash = self.compute_prefix_hash(prefix)
            if prefix_hash in self._cache:
                entry = self._cache[prefix_hash]
                if tuple(prefix) == entry["tokens"]:
                    # Move to end (most recently used)
                    self._cache.move_to_end(prefix_hash)
                    best_match = entry["kv_state"]
                    best_length = length
                    break

        if best_match is not None:
            self._hits += 1
            self._total_matched += best_length
            return {"kv_state": best_match, "matched_length": best_length, "cache_hit": True}
        else:
            self._misses += 1
            return {"kv_state": None, "matched_length": 0, "cache_hit": False}

    def store(self, prompt_tokens, kv_state):
        prefix_hash = self.compute_prefix_hash(prompt_tokens)

        if prefix_hash in self._cache:
            self._cache.move_to_end(prefix_hash)
            self._cache[prefix_hash]["kv_state"] = kv_state
            return

        if len(self._cache) >= self.max_entries:
            self._cache.popitem(last=False)  # evict LRU (oldest)

        self._cache[prefix_hash] = {
            "tokens": tuple(prompt_tokens),
            "kv_state": kv_state,
            "length": len(prompt_tokens),
        }

    def get_stats(self):
        total_lookups = self._hits + self._misses
        return {
            "hit_rate": self._hits / total_lookups if total_lookups > 0 else 0.0,
            "total_hits": self._hits,
            "total_misses": self._misses,
            "avg_match_length": self._total_matched / self._hits if self._hits > 0 else 0.0,
            "cache_size": len(self._cache),
            "max_entries": self.max_entries,
        }
\`\`\`

**Approach:** Store KV states in an OrderedDict for LRU ordering. Hash token sequences with MD5. Lookup tries decreasing prefix lengths until a match is found. Store evicts the least recently used entry when at capacity. Stats track hit rate and average match length.`,
    testCases: [
      {
        id: "t1",
        name: "Store and lookup exact prefix",
        inputs: { prefix: [1, 2, 3, 4, 5], lookup: [1, 2, 3, 4, 5, 6, 7] },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Cache miss for unknown prefix",
        inputs: { prefix: [1, 2, 3], lookup: [4, 5, 6] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "LRU eviction at capacity",
        inputs: { max_entries: 2, store_count: 3 },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Hit rate computed correctly",
        inputs: { lookups: 10, expected_hits: 7 },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Longest prefix matched",
        inputs: { stored_prefixes: [[1, 2], [1, 2, 3, 4]], lookup: [1, 2, 3, 4, 5] },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
];
