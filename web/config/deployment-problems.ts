import type { Problem } from "@/types/problem";

export const DEPLOYMENT_PROBLEMS: Problem[] = [
  // ========== WEEK 14: Capstone ==========
  {
    id: "llm-output-validator",
    type: "coding",
    title: "Implement LLM Output Validator",
    description: `Implement a structured output validator that extracts and validates JSON from LLM responses.

LLMs don't always return clean JSON. Common failure modes include:
- Wrapping JSON in markdown code blocks (\\\`\\\`\\\`json ... \\\`\\\`\\\`)
- Including explanatory text before or after the JSON
- Returning partial/truncated JSON
- Adding trailing commas or comments

Your validator should:
1. **Extract** JSON from messy LLM output (strip markdown, find the JSON object/array)
2. **Validate** the extracted JSON against a provided schema (required fields, types)
3. **Return** a result object with the parsed data or structured error information

**Interface:**
\`\`\`python
schema = {
    "name": {"type": "string", "required": True},
    "age": {"type": "number", "required": True},
    "email": {"type": "string", "required": False},
}
result = validate_llm_output(raw_output, schema)
# result.success -> bool
# result.data -> parsed dict (if success)
# result.errors -> list of error strings (if failure)
\`\`\``,
    difficulty: "Medium",
    weekNumber: 14,
    tags: '["production", "validation", "structured-output", "reliability"]',
    theory: `Getting structured data out of LLMs is one of the most common production challenges. You prompt the model to return JSON, and sometimes it does, sometimes it wraps it in markdown, sometimes it adds "Here's the JSON:" before it, and sometimes it just returns prose.

**JSON mode vs function calling.** OpenAI and Anthropic offer "JSON mode" that constrains the model to output valid JSON. Function calling / tool use goes further by enforcing a schema. But these features aren't available on all models, add latency, and can fail on complex nested schemas. A robust extraction layer is still necessary as a fallback.

**Common LLM output failure modes.** Markdown wrapping is the most frequent - the model wraps output in \`\`\`json ... \`\`\`. Extra text before/after ("Here is the output:") is second most common. Truncation happens when the output hits the max_tokens limit mid-JSON. Trailing commas appear because LLMs learn from JavaScript code where they're legal. Less common: the model outputs multiple JSON objects, or embeds JSON in a larger response.

**Schema validation strategy.** Production validators check three things: (1) Is the extracted data valid JSON? (2) Are all required fields present? (3) Do field types match? You should not validate beyond what's needed - overly strict validation causes false rejections. For example, if you expect a number but get "42" (a string), coercing it to a number is better than rejecting it.

**Graceful degradation.** When extraction fails, return structured error information so the caller can decide what to do: retry with a different prompt, fall back to a default, or escalate to a human. Never silently return empty data. The error messages should be specific enough to debug: "Missing required field: age" beats "Invalid output".`,
    hints: '["Start by stripping markdown code fences: look for ```json and ``` patterns, extract what is between them", "To find JSON in mixed text, scan for the first { or [ character, then try json.loads on progressively larger substrings ending at each } or ]", "For schema validation, iterate over schema keys: check required fields exist, then check types using isinstance with a type mapping (string->str, number->int|float, etc.)", "Return a dataclass or namedtuple with success, data, and errors fields for clean error handling"]',
    visualizationComponent: null,
    sortOrder: 3,
    starterCode: `import json
from dataclasses import dataclass, field

@dataclass
class ValidationResult:
    success: bool
    data: dict | None = None
    errors: list[str] = field(default_factory=list)

def extract_json(raw_output: str) -> str | None:
    """
    Extract JSON string from potentially messy LLM output.
    Handles markdown code blocks, surrounding text, etc.

    Args:
        raw_output: Raw LLM output string

    Returns:
        Extracted JSON string, or None if no JSON found
    """
    # Your implementation here
    pass

def validate_schema(data: dict, schema: dict) -> list[str]:
    """
    Validate parsed data against a schema.

    Schema format:
        {"field_name": {"type": "string"|"number"|"boolean"|"array"|"object", "required": bool}}

    Args:
        data: Parsed JSON dict
        schema: Schema definition

    Returns:
        List of validation error strings (empty if valid)
    """
    # Your implementation here
    pass

def validate_llm_output(raw_output: str, schema: dict) -> ValidationResult:
    """
    Extract, parse, and validate JSON from raw LLM output.

    Args:
        raw_output: Raw string from LLM
        schema: Expected schema for validation

    Returns:
        ValidationResult with success status, parsed data, and any errors
    """
    # Your implementation here
    pass`,
    solution: `\`\`\`python
import json
from dataclasses import dataclass, field

@dataclass
class ValidationResult:
    success: bool
    data: dict | None = None
    errors: list[str] = field(default_factory=list)

TYPE_MAP = {
    "string": str,
    "number": (int, float),
    "boolean": bool,
    "array": list,
    "object": dict,
}

def extract_json(raw_output: str) -> str | None:
    text = raw_output.strip()

    # Strip markdown code fences
    if "\`\`\`" in text:
        lines = text.split("\\n")
        inside = False
        json_lines = []
        for line in lines:
            if line.strip().startswith("\`\`\`") and not inside:
                inside = True
                continue
            elif line.strip() == "\`\`\`" and inside:
                inside = False
                continue
            elif inside:
                json_lines.append(line)
        if json_lines:
            text = "\\n".join(json_lines).strip()

    # Try direct parse first
    try:
        json.loads(text)
        return text
    except json.JSONDecodeError:
        pass

    # Find JSON object or array in text
    for start_char, end_char in [("{", "}"), ("[", "]")]:
        start = text.find(start_char)
        if start == -1:
            continue
        # Try from each closing bracket, last to first
        for end in range(len(text) - 1, start, -1):
            if text[end] == end_char:
                candidate = text[start:end + 1]
                try:
                    json.loads(candidate)
                    return candidate
                except json.JSONDecodeError:
                    continue

    return None

def validate_schema(data: dict, schema: dict) -> list[str]:
    errors = []
    for field_name, rules in schema.items():
        required = rules.get("required", False)
        expected_type = rules.get("type")

        if field_name not in data:
            if required:
                errors.append(f"Missing required field: {field_name}")
            continue

        value = data[field_name]
        if expected_type and expected_type in TYPE_MAP:
            valid_types = TYPE_MAP[expected_type]
            if not isinstance(value, valid_types):
                # Try coercion for number type
                if expected_type == "number" and isinstance(value, str):
                    try:
                        float(value)
                        continue  # Coercible, accept it
                    except ValueError:
                        pass
                errors.append(
                    f"Field '{field_name}' expected type '{expected_type}', got '{type(value).__name__}'"
                )
    return errors

def validate_llm_output(raw_output: str, schema: dict) -> ValidationResult:
    json_str = extract_json(raw_output)
    if json_str is None:
        return ValidationResult(success=False, errors=["No JSON found in output"])

    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as e:
        return ValidationResult(success=False, errors=[f"JSON parse error: {e}"])

    if not isinstance(data, dict):
        return ValidationResult(success=False, errors=["Expected JSON object, got array or primitive"])

    errors = validate_schema(data, schema)
    if errors:
        return ValidationResult(success=False, data=data, errors=errors)

    return ValidationResult(success=True, data=data)
\`\`\`

**Approach:** Three-stage pipeline. (1) Extract: strip markdown fences, then try direct parse, then scan for the outermost JSON object/array by finding bracket pairs and attempting json.loads. (2) Parse: standard json.loads with error capture. (3) Validate: check each schema field for presence (if required) and type (using isinstance with a type mapping). Return structured ValidationResult at every stage so callers know exactly what went wrong.`,
    testCases: [
      {
        id: "t1",
        name: "Clean JSON input",
        inputs: {
          raw_output: '{"name": "Alice", "age": 30}',
          schema: { name: { type: "string", required: true }, age: { type: "number", required: true } },
        },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Markdown-wrapped JSON",
        inputs: {
          raw_output: "Here is the result:\n```json\n{\"name\": \"Bob\", \"age\": 25}\n```\nHope that helps!",
          schema: { name: { type: "string", required: true }, age: { type: "number", required: true } },
        },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Missing required field",
        inputs: {
          raw_output: '{"name": "Charlie"}',
          schema: { name: { type: "string", required: true }, age: { type: "number", required: true } },
        },
        isPublic: true,
      },
      {
        id: "t4",
        name: "No JSON in output",
        inputs: {
          raw_output: "I cannot provide that information due to safety guidelines.",
          schema: { name: { type: "string", required: true } },
        },
        isPublic: false,
      },
      {
        id: "t5",
        name: "JSON with surrounding text",
        inputs: {
          raw_output: "The extracted data is: {\"name\": \"Dana\", \"age\": 28, \"email\": \"dana@test.com\"} based on the document.",
          schema: { name: { type: "string", required: true }, age: { type: "number", required: true }, email: { type: "string", required: false } },
        },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "llm-retry-strategy",
    type: "coding",
    title: "Build a Retry Strategy with Exponential Backoff",
    description: `Implement a retry wrapper for LLM API calls with exponential backoff and jitter.

Your retry strategy must handle:
1. **Exponential backoff** - each retry waits longer: $\\text{base\\_delay} \\times 2^{\\text{attempt}}$
2. **Jitter** - add randomness to prevent thundering herd: $\\text{delay} \\times \\text{random}(0.5, 1.5)$
3. **Selective retry** - only retry on specific error types (rate limit, timeout), never on auth errors or invalid requests

**Interface:**
\`\`\`python
strategy = RetryStrategy(max_retries=3, base_delay=1.0, max_delay=60.0)
delay = strategy.get_delay(attempt=0, error_type="rate_limit")  # returns delay in seconds
should = strategy.should_retry(attempt=1, error_type="auth_error")  # returns False
\`\`\`

Error types to handle:
- \`"rate_limit"\` (429) - RETRY with backoff
- \`"timeout"\` - RETRY with backoff
- \`"server_error"\` (500/502/503) - RETRY with backoff
- \`"auth_error"\` (401/403) - DO NOT retry
- \`"invalid_request"\` (400) - DO NOT retry
- \`"context_length"\` - DO NOT retry`,
    difficulty: "Easy",
    weekNumber: 14,
    tags: '["production", "reliability", "error-handling", "api"]',
    theory: `Every production LLM application needs retry logic. API calls fail for many reasons - rate limits (429), transient server errors (500/502/503), network timeouts - and most of these are recoverable if you wait and try again.

**Exponential backoff** spaces out retries with increasing delays: 1s, 2s, 4s, 8s, etc. This gives the server time to recover and avoids hammering an already-overloaded endpoint. Without backoff, rapid retries can make rate limiting worse and even trigger IP-level blocks.

**Jitter prevents thundering herd.** If 100 clients hit a rate limit at the same time and all retry after exactly 1 second, they all hit the server again simultaneously. Adding random jitter (multiplying the delay by a random factor between 0.5 and 1.5) spreads retries across time. Full jitter (random between 0 and max_delay) is even better for high-contention scenarios, but half-jitter (0.5x to 1.5x) gives a good balance between spread and predictability.

**Not all errors should be retried.** Authentication failures (401/403) won't succeed on retry - your API key is wrong. Invalid request errors (400) mean your prompt is malformed. Context length exceeded means the input is too long. Retrying these wastes time and money. Only retry transient failures: rate limits, timeouts, and server errors.

**Max delay cap.** Without a cap, exponential backoff grows unbounded: attempt 10 = $2^{10} = 1024$ seconds (17 minutes). A max_delay of 60 seconds keeps the worst case reasonable. Most rate limit windows reset within 60 seconds anyway.

**Idempotency matters.** LLM API calls are generally safe to retry because they don't have side effects (calling GPT twice with the same prompt gives potentially different but valid responses). But if your application has side effects downstream (sending emails, writing to a database), you need to ensure the retry doesn't duplicate those effects.`,
    hints: '["Define a set of retryable error types: {\"rate_limit\", \"timeout\", \"server_error\"}", "For get_delay: compute $\\\\text{base\\\\_delay} \\\\times 2^{\\\\text{attempt}}$, then cap at max_delay, then multiply by random.uniform(0.5, 1.5)", "should_retry checks two things: (1) attempt < max_retries, and (2) error_type is in the retryable set", "Use random.uniform for jitter - do not use random.random() as it only gives 0-1 range"]',
    visualizationComponent: null,
    sortOrder: 2,
    starterCode: `import random

class RetryStrategy:
    """
    Retry strategy with exponential backoff and jitter for LLM API calls.
    """

    # Error types that should be retried
    RETRYABLE_ERRORS = {"rate_limit", "timeout", "server_error"}

    def __init__(self, max_retries: int = 3, base_delay: float = 1.0, max_delay: float = 60.0):
        """
        Args:
            max_retries: Maximum number of retry attempts
            base_delay: Initial delay in seconds before first retry
            max_delay: Maximum delay cap in seconds
        """
        # Your implementation here
        pass

    def should_retry(self, attempt: int, error_type: str) -> bool:
        """
        Determine if a request should be retried.

        Args:
            attempt: Current attempt number (0-indexed)
            error_type: Type of error encountered

        Returns:
            True if the request should be retried
        """
        # Your implementation here
        pass

    def get_delay(self, attempt: int, error_type: str) -> float:
        """
        Calculate the delay before the next retry.

        Uses exponential backoff with jitter.

        Args:
            attempt: Current attempt number (0-indexed)
            error_type: Type of error encountered

        Returns:
            Delay in seconds before next retry, or -1 if should not retry
        """
        # Your implementation here
        pass`,
    solution: `\`\`\`python
import random

class RetryStrategy:
    RETRYABLE_ERRORS = {"rate_limit", "timeout", "server_error"}

    def __init__(self, max_retries: int = 3, base_delay: float = 1.0, max_delay: float = 60.0):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay

    def should_retry(self, attempt: int, error_type: str) -> bool:
        if attempt >= self.max_retries:
            return False
        return error_type in self.RETRYABLE_ERRORS

    def get_delay(self, attempt: int, error_type: str) -> float:
        if not self.should_retry(attempt, error_type):
            return -1.0

        # Exponential backoff
        delay = self.base_delay * (2 ** attempt)

        # Cap at max_delay
        delay = min(delay, self.max_delay)

        # Add jitter: multiply by random factor in [0.5, 1.5]
        jitter = random.uniform(0.5, 1.5)
        delay *= jitter

        return delay
\`\`\`

**Approach:** Two methods with clear separation of concerns. \`should_retry\` checks the attempt count against max_retries and whether the error type is in the retryable set. \`get_delay\` computes exponential backoff ($\\text{base} \\times 2^{\\text{attempt}}$), caps it at max_delay, then applies jitter by multiplying with a random factor between 0.5 and 1.5. Returns -1 for non-retryable cases so callers can distinguish "don't retry" from "retry immediately".`,
    testCases: [
      {
        id: "t1",
        name: "Retry on rate limit",
        inputs: { max_retries: 3, attempt: 0, error_type: "rate_limit" },
        isPublic: true,
      },
      {
        id: "t2",
        name: "No retry on auth error",
        inputs: { max_retries: 3, attempt: 0, error_type: "auth_error" },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Max retries exceeded",
        inputs: { max_retries: 3, attempt: 3, error_type: "rate_limit" },
        isPublic: true,
      },
      {
        id: "t4",
        name: "Delay increases exponentially",
        inputs: { max_retries: 5, base_delay: 1.0, attempts: [0, 1, 2, 3] },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Delay capped at max_delay",
        inputs: { max_retries: 10, base_delay: 1.0, max_delay: 10.0, attempt: 8 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
];
