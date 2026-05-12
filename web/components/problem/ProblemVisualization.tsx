'use client'

import dynamic from 'next/dynamic'
import { ComponentType, useMemo } from 'react'

interface ProblemVisualizationProps {
  componentName: string | null | undefined
}

// Registry of all problem visualizations
// When adding a new visualization, add it here with the exact component name
const visualizationRegistry: Record<string, () => Promise<{ default: ComponentType }>> = {
  // Week 0: Math Foundations
  'SoftmaxViz': () => import('@/components/visualizations/SoftmaxViz'),
  'CrossEntropyViz': () => import('@/components/visualizations/CrossEntropyViz'),
  'SigmoidViz': () => import('@/components/visualizations/SigmoidViz'),
  'MatrixMultiplyViz': () => import('@/components/visualizations/MatrixMultiplyViz'),
  'ProbabilityBasicsViz': () => import('@/components/visualizations/ProbabilityBasicsViz'),
  'LinearAlgebraViz': () => import('@/components/visualizations/LinearAlgebraViz'),
  'GradientComputationViz': () => import('@/components/visualizations/GradientComputationViz'),
  'ChainRuleViz': () => import('@/components/visualizations/ChainRuleViz'),

  // Week 1: Neural Networks
  'NeuralNetworkViz': () => import('@/components/visualizations/NeuralNetworkViz'),
  'GradientDescentViz': () => import('@/components/visualizations/GradientDescentViz'),
  'NeuralNetQuizViz': () => import('@/components/visualizations/NeuralNetQuizViz'),
  'BackpropagationViz': () => import('@/components/visualizations/BackpropagationViz'),
  'LearningRateViz': () => import('@/components/visualizations/LearningRateViz'),
  'BatchNormViz': () => import('@/components/visualizations/BatchNormViz'),
  'ReLUViz': () => import('@/components/visualizations/ReLUViz'),
  'WeightInitViz': () => import('@/components/visualizations/WeightInitViz'),

  // Week 2: Tokenization & Embeddings
  'BPETokenizerViz': () => import('@/components/visualizations/BPETokenizerViz'),
  'PositionalEncodingViz': () => import('@/components/visualizations/PositionalEncodingViz'),
  'CosineSimilarityViz': () => import('@/components/visualizations/CosineSimilarityViz'),
  'TokenizationQuizViz': () => import('@/components/visualizations/TokenizationQuizViz'),
  'Word2VecViz': () => import('@/components/visualizations/Word2VecViz'),
  'EmbeddingLookupViz': () => import('@/components/visualizations/EmbeddingLookupViz'),
  'EncoderDecoderViz': () => import('@/components/visualizations/EncoderDecoderViz'),

  // Week 3: Attention & Transformers
  'AttentionHeatmapViz': () => import('@/components/visualizations/AttentionHeatmapViz'),
  'MultiHeadAttentionViz': () => import('@/components/visualizations/MultiHeadAttentionViz'),
  'AttentionQuizViz': () => import('@/components/visualizations/AttentionQuizViz'),
  'FeedForwardViz': () => import('@/components/visualizations/FeedForwardViz'),
  'RotaryEmbeddingViz': () => import('@/components/visualizations/RotaryEmbeddingViz'),
  'ResidualConnectionViz': () => import('@/components/visualizations/ResidualConnectionViz'),

  // Week 4: GPT & Autoregressive Models
  'CausalMaskViz': () => import('@/components/visualizations/CausalMaskViz'),
  'LayerNormViz': () => import('@/components/visualizations/LayerNormViz'),
  'KVCacheViz': () => import('@/components/visualizations/KVCacheViz'),
  'AutoregressiveViz': () => import('@/components/visualizations/AutoregressiveViz'),
  'GPTArchitectureViz': () => import('@/components/visualizations/GPTArchitectureViz'),
  'TemperatureSamplingViz': () => import('@/components/visualizations/TemperatureSamplingViz'),
  'BeamSearchViz': () => import('@/components/visualizations/BeamSearchViz'),
  'PerplexityViz': () => import('@/components/visualizations/PerplexityViz'),
  'DecodingStrategiesViz': () => import('@/components/visualizations/DecodingStrategiesViz'),

  // Week 5: Fine-Tuning & RLHF
  'LoRAViz': () => import('@/components/visualizations/LoRAViz'),
  'DPOPreferenceViz': () => import('@/components/visualizations/DPOPreferenceViz'),
  'FineTuningPipelineViz': () => import('@/components/visualizations/FineTuningPipelineViz'),
  'FineTuningQuizViz': () => import('@/components/visualizations/FineTuningQuizViz'),
  'QuantizationViz': () => import('@/components/visualizations/QuantizationViz'),
  'SFTDataViz': () => import('@/components/visualizations/SFTDataViz'),
  'RewardModelViz': () => import('@/components/visualizations/RewardModelViz'),
  'CatastrophicForgettingViz': () => import('@/components/visualizations/CatastrophicForgettingViz'),
  'RLHFPipelineViz': () => import('@/components/visualizations/RLHFPipelineViz'),
  'AlignmentQuizViz': () => import('@/components/visualizations/AlignmentQuizViz'),

  // Week 6: RAG & Retrieval
  'ChunkingViz': () => import('@/components/visualizations/ChunkingViz'),
  'VectorSearchViz': () => import('@/components/visualizations/VectorSearchViz'),
  'RAGConceptsViz': () => import('@/components/visualizations/RAGConceptsViz'),
  'EmbeddingPoolingViz': () => import('@/components/visualizations/EmbeddingPoolingViz'),
  'HybridSearchViz': () => import('@/components/visualizations/HybridSearchViz'),
  'RerankingViz': () => import('@/components/visualizations/RerankingViz'),
  'DocumentLoaderViz': () => import('@/components/visualizations/DocumentLoaderViz'),
  'RetrievalMetricsViz': () => import('@/components/visualizations/RetrievalMetricsViz'),

  // Week 7: RAG Safety & Internals
  'QueryRewritingViz': () => import('@/components/visualizations/QueryRewritingViz'),
  'PromptInjectionViz': () => import('@/components/visualizations/PromptInjectionViz'),
  'GuardrailsViz': () => import('@/components/visualizations/GuardrailsViz'),
  'CanaryTokenViz': () => import('@/components/visualizations/CanaryTokenViz'),

  // Week 8: Advanced RAG & Evaluation
  'CorrectiveRAGViz': () => import('@/components/visualizations/CorrectiveRAGViz'),
  'SelfRAGViz': () => import('@/components/visualizations/SelfRAGViz'),
  'LLMJudgeViz': () => import('@/components/visualizations/LLMJudgeViz'),
  'EvalPipelineViz': () => import('@/components/visualizations/EvalPipelineViz'),

  // Week 9: AI Agents
  'ReActAgentViz': () => import('@/components/visualizations/ReActAgentViz'),
  'FunctionCallingViz': () => import('@/components/visualizations/FunctionCallingViz'),
  'ToolUseViz': () => import('@/components/visualizations/ToolUseViz'),
  'AgentOrchestratorViz': () => import('@/components/visualizations/AgentOrchestratorViz'),

  // Week 10: Context Engineering & MCP
  'ContextWindowViz': () => import('@/components/visualizations/ContextWindowViz'),
  'MemorySystemViz': () => import('@/components/visualizations/MemorySystemViz'),
  'MCPToolViz': () => import('@/components/visualizations/MCPToolViz'),
  'MultiAgentViz': () => import('@/components/visualizations/MultiAgentViz'),
  'TokenBudgetViz': () => import('@/components/visualizations/TokenBudgetViz'),
  'MemoryCompressionViz': () => import('@/components/visualizations/MemoryCompressionViz'),

  // Week 11: Evals & Reliability
  'BLEUScoreViz': () => import('@/components/visualizations/BLEUScoreViz'),
  'ROUGEScoreViz': () => import('@/components/visualizations/ROUGEScoreViz'),
  'HallucinationViz': () => import('@/components/visualizations/HallucinationViz'),
  'FaithfulnessViz': () => import('@/components/visualizations/FaithfulnessViz'),
  'ParetoFrontierViz': () => import('@/components/visualizations/ParetoFrontierViz'),
  'RelevancyViz': () => import('@/components/visualizations/RelevancyViz'),

  // Week 12: Reasoning & LLMOps
  'ChainOfThoughtViz': () => import('@/components/visualizations/ChainOfThoughtViz'),
  'SpeculativeDecodingViz': () => import('@/components/visualizations/SpeculativeDecodingViz'),
  'ContinuousBatchingViz': () => import('@/components/visualizations/ContinuousBatchingViz'),
  'StreamingViz': () => import('@/components/visualizations/StreamingViz'),
  'ModelRoutingViz': () => import('@/components/visualizations/ModelRoutingViz'),
  'ModelServingViz': () => import('@/components/visualizations/ModelServingViz'),
  'PrefixCacheViz': () => import('@/components/visualizations/PrefixCacheViz'),

  // Week 13: Multimodal AI
  'PatchEmbeddingViz': () => import('@/components/visualizations/PatchEmbeddingViz'),
  'CLIPSimilarityViz': () => import('@/components/visualizations/CLIPSimilarityViz'),
  'NoiseScheduleViz': () => import('@/components/visualizations/NoiseScheduleViz'),
  'VAELatentViz': () => import('@/components/visualizations/VAELatentViz'),
  'VisionTransformerViz': () => import('@/components/visualizations/VisionTransformerViz'),
  'DiffusionProcessViz': () => import('@/components/visualizations/DiffusionProcessViz'),
  'ImageTokenizerViz': () => import('@/components/visualizations/ImageTokenizerViz'),
  'DenoisingStepViz': () => import('@/components/visualizations/DenoisingStepViz'),
  'MultimodalSearchViz': () => import('@/components/visualizations/MultimodalSearchViz'),
  'ContrastiveLossViz': () => import('@/components/visualizations/ContrastiveLossViz'),

  // Week 14: Capstone Project
  'RateLimiterViz': () => import('@/components/visualizations/RateLimiterViz'),
  'PromptTemplateViz': () => import('@/components/visualizations/PromptTemplateViz'),
  'SemanticCacheViz': () => import('@/components/visualizations/SemanticCacheViz'),
  'FallbackChainViz': () => import('@/components/visualizations/FallbackChainViz'),
  'ProductionArchViz': () => import('@/components/visualizations/ProductionArchViz'),
  'BestPracticesViz': () => import('@/components/visualizations/BestPracticesViz'),
  'ABTestViz': () => import('@/components/visualizations/ABTestViz'),
  'CostTrackerViz': () => import('@/components/visualizations/CostTrackerViz'),
  'DocumentPipelineViz': () => import('@/components/visualizations/DocumentPipelineViz'),
  'GuardrailPipelineViz': () => import('@/components/visualizations/GuardrailPipelineViz'),

  // Week 15: Future of AI
  'EnergyLandscapeViz': () => import('@/components/visualizations/EnergyLandscapeViz'),
  'WorldModelViz': () => import('@/components/visualizations/WorldModelViz'),
  'JEPAMaskingViz': () => import('@/components/visualizations/JEPAMaskingViz'),
  'ToolUsePlannerViz': () => import('@/components/visualizations/ToolUsePlannerViz'),
  'JEPAArchitectureViz': () => import('@/components/visualizations/JEPAArchitectureViz'),
  'AITrendsViz': () => import('@/components/visualizations/AITrendsViz'),
  'LatentInterpolationViz': () => import('@/components/visualizations/LatentInterpolationViz'),
  'MixtureOfExpertsViz': () => import('@/components/visualizations/MixtureOfExpertsViz'),
  'SelfImprovingAgentViz': () => import('@/components/visualizations/SelfImprovingAgentViz'),
  'ConstitutionalAIViz': () => import('@/components/visualizations/ConstitutionalAIViz'),

  // System Design Visualizations
  'TokenizationPipelineViz': () => import('@/components/visualizations/TokenizationPipelineViz'),
  'TransformerInferenceViz': () => import('@/components/visualizations/TransformerInferenceViz'),
  'RAGPipelineViz': () => import('@/components/visualizations/RAGPipelineViz'),
}

export default function ProblemVisualization({ componentName }: ProblemVisualizationProps) {
  const VisualizationComponent = useMemo(() => {
    if (!componentName || !visualizationRegistry[componentName]) {
      return null
    }

    return dynamic(visualizationRegistry[componentName], {
      ssr: false,
      loading: () => (
        <div className="flex items-center justify-center p-8 bg-muted/50 border border-border rounded-lg">
          <div className="text-muted-foreground text-sm">Loading visualization...</div>
        </div>
      ),
    })
  }, [componentName])

  if (!VisualizationComponent) {
    return null
  }

  return (
    <div className="my-4">
      <VisualizationComponent />
    </div>
  )
}
