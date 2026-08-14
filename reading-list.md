# ML/AI Engineer Interview Reading List

Filtered from the full list on samitmohan.in/interviews. These are the papers that show up in real interview loops: either the interviewer asks about the mechanism directly, or the paper is the reason a design choice exists.

## Sequence models (start here)

- [Understanding LSTM Networks](https://colah.github.io/posts/2015-08-Understanding-LSTMs/) - gates, cell state, vanishing gradients. Read before attention so you know what attention replaced.

## Transformers

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) - QKV, multi-head, positional encoding, the full block. Know every component cold and be able to write the attention math from memory.
- [Language Models are Few-Shot Learners (GPT-3)](https://arxiv.org/abs/2005.14165) - in-context learning, decoder-only scaling, few-shot vs fine-tuning.
- [LLaMA 2](https://arxiv.org/abs/2307.09288) - the modern reference architecture: RMSNorm, SwiGLU, RoPE, grouped-query attention.
- [FlashAttention](https://arxiv.org/abs/2205.14135) - tiling, IO-awareness, why HBM bandwidth and not FLOPs is the bottleneck.

## Scaling

- [Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361) - loss as a power law in params, data, compute.
- [Training Compute-Optimal LLMs (Chinchilla)](https://arxiv.org/abs/2203.15556) - the correction: roughly 20 tokens per parameter. Expect a back-of-envelope compute budget question.

## Fine-tuning and efficiency

- [LoRA: Low-Rank Adaptation of LLMs](https://arxiv.org/abs/2106.09685) - rank decomposition on frozen weights. The default PEFT method in production.
- [QLoRA](https://arxiv.org/abs/2305.14314) - 4-bit NF4 quantization, double quantization, paged optimizers. Covers the quantization half of the memory question.

## Alignment

- [Training LLMs to Follow Instructions (InstructGPT)](https://arxiv.org/abs/2203.02155) - SFT, reward model, PPO. The canonical RLHF pipeline.
- [Direct Preference Optimization (DPO)](https://arxiv.org/abs/2305.18290) - drops the reward model and PPO loop. Know why the closed-form reward substitution works.

## Vision and multimodal

- [Deep Residual Learning (ResNet)](https://arxiv.org/abs/1512.03385) - skip connections and gradient flow. Still the answer to "why can we train deep nets".
- [An Image is Worth 16x16 Words (ViT)](https://arxiv.org/abs/2010.11929) - patch embeddings, and why ViTs need more data than CNNs.
- [CLIP](https://arxiv.org/abs/2103.00020) - contrastive image-text training, zero-shot transfer. Underpins most multimodal work.

## Generative

- [Auto-Encoding Variational Bayes (VAE)](https://arxiv.org/abs/1312.6114) - ELBO derivation and the reparameterization trick. Common whiteboard question.
- [Denoising Diffusion Probabilistic Models (DDPM)](https://arxiv.org/abs/2006.11239) - forward noising, reverse denoising, the training objective.

## Read only if the role calls for it

- [Mistral 7B](https://arxiv.org/abs/2310.06825) - sliding window attention. Skim if you already have GQA from LLaMA 2.
- [DeepSeek-V2](https://arxiv.org/abs/2405.04434) - MLA and fine-grained MoE. Read for frontier-lab or inference-efficiency roles.
- [GPipe](https://arxiv.org/abs/1811.06965) - pipeline parallelism and micro-batching. Read for distributed training or infra roles.
- [Constitutional AI](https://arxiv.org/abs/2212.08073) - RLAIF. Read before any Anthropic or safety-team interview.
- [Segment Anything (SAM)](https://arxiv.org/abs/2304.02643) - promptable segmentation. CV roles.
- [Whisper](https://arxiv.org/abs/2212.04356) - encoder-decoder for speech, weak supervision at scale. Audio roles.

## Cut from the interview list

- [AlexNet](https://papers.nips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html) - historical. The architecture details no longer come up.
- [Neural Turing Machines](https://arxiv.org/abs/1410.5401) - external memory, superseded by attention.
- [Unreasonable Effectiveness of RNNs](http://karpathy.github.io/2015/05/21/rnn-effectiveness/) - good intuition, but colah's post covers what gets asked.
