import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface RubricItem {
  criterion: string;
  weight: number;
  description: string;
  keyPoints: string[];
}

interface EvaluationRequest {
  response: string;
  rubric: RubricItem[];
  sampleAnswer: string;
  problemTitle: string;
  designPrompt: string;
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Evaluation service not configured" },
      { status: 503 }
    );
  }

  const body: EvaluationRequest = await request.json();
  const { response, rubric, sampleAnswer, problemTitle, designPrompt } = body;

  if (!response || !rubric || rubric.length === 0) {
    return NextResponse.json(
      { error: "Missing response or rubric" },
      { status: 400 }
    );
  }

  const rubricText = rubric
    .map(
      (r, i) =>
        `${i + 1}. **${r.criterion}** (weight: ${Math.round(r.weight * 100)}%)\n   Description: ${r.description}\n   Key points: ${r.keyPoints.join(", ")}`
    )
    .join("\n\n");

  const systemPrompt = `You are an expert system design evaluator for an AI engineering course. You evaluate student responses against a rubric with specific criteria.

Your evaluation must be:
- Fair and constructive
- Specific with references to what the student wrote
- Actionable with concrete suggestions for improvement

Return your evaluation as valid JSON only, no markdown wrapping. The format:
{
  "scores": [
    {
      "criterion": "<criterion name>",
      "score": <0-10 integer>,
      "feedback": "<2-3 sentences explaining score with specific references>"
    }
  ],
  "overallFeedback": "<3-4 sentences of high-level feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}`;

  const userPrompt = `# Problem: ${problemTitle}

## Design Prompt
${designPrompt}

## Evaluation Rubric
${rubricText}

## Reference Answer (for comparison, not exact match required)
${sampleAnswer ? sampleAnswer.slice(0, 3000) : "Not available"}

## Student Response
${response.slice(0, 5000)}

---

Evaluate the student's response against each rubric criterion. Score each 0-10 where:
- 0-2: Missing or completely wrong
- 3-4: Mentioned but superficial, missing key aspects
- 5-6: Adequate coverage with some gaps
- 7-8: Strong coverage with good depth
- 9-10: Excellent, comprehensive, insightful

Return JSON only.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON from response (handle potential markdown wrapping)
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    const evaluation = JSON.parse(jsonStr);

    // Calculate weighted score
    let totalScore = 0;
    let totalWeight = 0;
    for (const score of evaluation.scores) {
      const rubricItem = rubric.find((r) => r.criterion === score.criterion);
      const weight = rubricItem?.weight ?? 1 / rubric.length;
      totalScore += score.score * weight;
      totalWeight += weight;
    }
    const weightedScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    return NextResponse.json({
      ...evaluation,
      weightedScore: Math.round(weightedScore * 10) / 10,
      maxScore: 10,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Evaluation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
