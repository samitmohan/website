import type { Problem } from "@/types/problem";

export const NEW_PROBLEMS_13_15: Problem[] = [
  // ========== WEEK 13: Multimodal AI ==========
  {
    id: "patch-embedding",
    type: "coding",
    title: "ViT Patch Embedding",
    description: `Implement the patch embedding layer from Vision Transformers (ViT).

Given an image represented as a 3D numpy array of shape \`(H, W, C)\`, split it into non-overlapping patches of size \`patch_size x patch_size\`, flatten each patch, and project it to an embedding dimension using a linear layer (weight matrix).

**Steps:**
1. Split the image into a grid of \`(H/P) x (W/P)\` patches, each of shape \`(P, P, C)\`
2. Flatten each patch to a vector of length \`P * P * C\`
3. Multiply by a projection matrix of shape \`(P*P*C, embed_dim)\` to get the patch embedding

\`\`\`python
>>> import numpy as np
>>> image = np.random.randn(8, 8, 3)  # 8x8 RGB image
>>> W = np.random.randn(4*4*3, 64)    # patch_size=4, embed_dim=64
>>> embeddings = patch_embed(image, patch_size=4, projection_matrix=W)
>>> embeddings.shape
(4, 64)  # 4 patches, each embedded to dim 64
\`\`\``,
    difficulty: "Medium",
    weekNumber: 13,
    tags: '["vision-transformer", "vit", "patch-embedding", "multimodal"]',
    theory: `Vision Transformers treat images as sequences of patches, the same way language models treat text as sequences of tokens. The patch embedding layer converts raw pixel values into a sequence of vectors that the transformer can process.

**Why patches?** Self-attention has $O(n^2)$ complexity. A 224x224 image has 50,176 pixels. Treating each pixel as a token is computationally infeasible. Splitting into 16x16 patches gives 196 tokens - manageable.

**The projection:** Each flattened patch (a vector of P*P*C values) is linearly projected to the model's hidden dimension. This is equivalent to a 2D convolution with kernel size = stride = patch_size. The projection learns to extract features from each local image region.

**Positional information:** After projection, position embeddings are added so the model knows where each patch came from spatially. Without them, the transformer sees a bag of patches with no spatial structure.`,
    hints: '["Reshape the image to (H//P, P, W//P, P, C) then transpose to group patches", "np.reshape can flatten each patch: reshape to (num_patches, P*P*C)", "Matrix multiply flattened patches by the projection matrix", "Make sure H and W are divisible by patch_size"]',
    visualizationComponent: "PatchEmbeddingViz",
    sortOrder: 1,
    starterCode: `import numpy as np

def patch_embed(image, patch_size, projection_matrix):
    """
    Convert an image into patch embeddings.

    Args:
        image: np.array of shape (H, W, C)
        patch_size: int, size of each square patch
        projection_matrix: np.array of shape (patch_size*patch_size*C, embed_dim)

    Returns:
        np.array of shape (num_patches, embed_dim)
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def patch_embed(image, patch_size, projection_matrix):
    H, W, C = image.shape
    assert H % patch_size == 0 and W % patch_size == 0, "Image dims must be divisible by patch_size"

    num_patches_h = H // patch_size
    num_patches_w = W // patch_size

    # Reshape to (num_patches_h, patch_size, num_patches_w, patch_size, C)
    patches = image.reshape(num_patches_h, patch_size, num_patches_w, patch_size, C)
    # Transpose to (num_patches_h, num_patches_w, patch_size, patch_size, C)
    patches = patches.transpose(0, 2, 1, 3, 4)
    # Flatten to (num_patches, patch_size * patch_size * C)
    num_patches = num_patches_h * num_patches_w
    patches = patches.reshape(num_patches, -1)

    # Project to embedding dimension
    embeddings = patches @ projection_matrix
    return embeddings
\`\`\`

**Approach:** Reshape the image tensor to isolate patches, transpose to group spatial dimensions, flatten each patch, and apply the linear projection via matrix multiplication.`,
    testCases: [
      {
        id: "t1",
        name: "Basic 8x8 image with patch_size=4",
        inputs: { image_shape: [8, 8, 3], patch_size: 4, embed_dim: 64 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "16x16 image with patch_size=4 gives 16 patches",
        inputs: { image_shape: [16, 16, 3], patch_size: 4, embed_dim: 32 },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Single patch covers entire image",
        inputs: { image_shape: [4, 4, 3], patch_size: 4, embed_dim: 128 },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Rectangular grid: 8x16 image",
        inputs: { image_shape: [8, 16, 3], patch_size: 4, embed_dim: 64 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "clip-similarity-score",
    type: "coding",
    title: "CLIP Similarity Scoring",
    description: `Implement CLIP-style similarity scoring between text and image embeddings with temperature scaling.

Given a batch of image embeddings and a batch of text embeddings, compute the scaled cosine similarity matrix used in CLIP training. The similarity between image i and text j is:

$\\text{sim}(i, j) = \\frac{\\cos(\\text{image}_i, \\text{text}_j)}{\\tau}$

Then convert to probabilities using softmax along each row (image-to-text) and each column (text-to-image).

\`\`\`python
>>> import numpy as np
>>> image_embs = np.random.randn(3, 128)  # 3 images, dim 128
>>> text_embs = np.random.randn(3, 128)   # 3 texts, dim 128
>>> i2t_probs, t2i_probs = clip_similarity(image_embs, text_embs, temperature=0.07)
>>> i2t_probs.shape
(3, 3)
>>> np.allclose(i2t_probs.sum(axis=1), 1.0)
True
\`\`\``,
    difficulty: "Medium",
    weekNumber: 13,
    tags: '["clip", "cosine-similarity", "contrastive-learning", "multimodal"]',
    theory: `CLIP (Contrastive Language-Image Pre-training) learns a joint embedding space for images and text. The core idea: matching image-text pairs should have high cosine similarity, non-matching pairs should have low similarity.

**Cosine similarity** measures the angle between two vectors: $\\cos(a, b) = \\frac{a \\cdot b}{\\|a\\| \\cdot \\|b\\|}$. It ranges from -1 (opposite) to 1 (identical direction). Normalizing embeddings to unit length simplifies this to a dot product.

**Temperature scaling:** The raw cosine similarity is divided by a learned temperature parameter (typically initialized to 0.07). Low temperature makes the softmax distribution sharper - the model becomes more confident about which text matches which image. High temperature makes the distribution flatter.

**Symmetric loss:** CLIP computes two losses: image-to-text (softmax along rows) and text-to-image (softmax along columns). Both are cross-entropy losses where the target is the identity matrix (image i matches text i). The final loss averages the two.`,
    hints: '["L2-normalize each embedding: x / np.linalg.norm(x, axis=-1, keepdims=True)", "Cosine similarity matrix = normalized_images @ normalized_text.T", "Divide by temperature before softmax", "Softmax: exp(x - max(x)) / sum(exp(x - max(x))) for numerical stability"]',
    visualizationComponent: "CLIPSimilarityViz",
    sortOrder: 2,
    starterCode: `import numpy as np

def clip_similarity(image_embeddings, text_embeddings, temperature=0.07):
    """
    Compute CLIP-style similarity between image and text embeddings.

    Args:
        image_embeddings: np.array of shape (N, D)
        text_embeddings: np.array of shape (N, D)
        temperature: float, scaling factor

    Returns:
        tuple: (image_to_text_probs, text_to_image_probs)
               both of shape (N, N), rows sum to 1
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def clip_similarity(image_embeddings, text_embeddings, temperature=0.07):
    # L2 normalize
    image_norm = image_embeddings / np.linalg.norm(image_embeddings, axis=-1, keepdims=True)
    text_norm = text_embeddings / np.linalg.norm(text_embeddings, axis=-1, keepdims=True)

    # Cosine similarity matrix
    logits = (image_norm @ text_norm.T) / temperature

    # Softmax along rows (image-to-text)
    def softmax(x, axis):
        x_max = np.max(x, axis=axis, keepdims=True)
        exp_x = np.exp(x - x_max)
        return exp_x / np.sum(exp_x, axis=axis, keepdims=True)

    i2t_probs = softmax(logits, axis=1)
    t2i_probs = softmax(logits, axis=0).T  # transpose so rows correspond to texts

    return i2t_probs, t2i_probs
\`\`\`

**Approach:** Normalize embeddings, compute the cosine similarity matrix, scale by temperature, and apply softmax along each axis to get probability distributions.`,
    testCases: [
      {
        id: "t1",
        name: "Probabilities sum to 1 along rows",
        inputs: { n: 4, dim: 64, temperature: 0.07 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Identical embeddings give high diagonal",
        inputs: { n: 3, dim: 32, temperature: 0.07, identical: true },
        isPublic: true,
      },
      {
        id: "t3",
        name: "High temperature flattens distribution",
        inputs: { n: 3, dim: 64, temperature: 100.0 },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Single pair returns probability 1.0",
        inputs: { n: 1, dim: 128, temperature: 0.07 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "vision-transformers-clip-quiz",
    type: "quiz",
    title: "Vision Transformers & CLIP",
    description:
      "Test your understanding of Vision Transformer architecture, patch embedding mechanics, and CLIP's contrastive training approach.",
    difficulty: "Medium",
    weekNumber: 13,
    tags: '["vit", "clip", "vision-transformer", "multimodal", "quiz"]',
    theory: `Vision Transformers (ViT) apply the transformer architecture directly to images by treating image patches as tokens. The key insight: transformers have no inherent image-specific inductive bias (unlike CNNs with translation equivariance), so they rely on learning spatial relationships from data.

**ViT pipeline:** Split image into fixed-size patches -> flatten each patch -> linearly project to embedding dimension -> prepend a [CLS] token -> add positional embeddings -> feed through standard transformer encoder -> use [CLS] output for classification.

**CLIP training:** CLIP jointly trains an image encoder (ViT or ResNet) and a text encoder (transformer) using contrastive learning. Given $N$ image-text pairs, it maximizes the cosine similarity of the $N$ matching pairs while minimizing similarity for the $N^2 - N$ non-matching pairs. This creates an aligned embedding space where images and text describing the same concept are close together.

**Zero-shot capability:** After training, CLIP classifies images by encoding class descriptions as text and picking the one with highest similarity to the image embedding. No task-specific training data needed.`,
    hints: "[]",
    visualizationComponent: "VisionTransformerViz",
    sortOrder: 5,
    starterCode: null,
    testCases: null,
    questions: [
      {
        id: "w13-q1-1",
        questionNumber: 1,
        questionText:
          "In ViT, why are images split into patches rather than processed pixel-by-pixel?",
        options: {
          a: "Patches have more color information than individual pixels",
          b: "Self-attention is O(n^2) in sequence length, so using patches reduces n from thousands of pixels to hundreds of tokens",
          c: "Individual pixels cannot be embedded into vectors",
          d: "Patches are required for the convolutional layers in ViT",
        },
        correctAnswer: "b",
        explanation:
          "Self-attention computes pairwise interactions between all tokens, giving O(n^2) complexity. A 224x224 image has 50,176 pixels - the attention matrix would be 50,176 x 50,176. Using 16x16 patches reduces this to 196 tokens, making the attention matrix 196 x 196. ViT has no convolutional layers - it uses a linear projection on patches.",
      },
      {
        id: "w13-q1-2",
        questionNumber: 2,
        questionText:
          "What role does the [CLS] token play in Vision Transformers?",
        options: {
          a: "It stores the original image before patch splitting for reconstruction",
          b: "It aggregates information from all patch tokens through self-attention and serves as the image-level representation",
          c: "It encodes the class label during training so the model knows the target",
          d: "It is used only during inference to decide which patches to attend to",
        },
        correctAnswer: "b",
        explanation:
          "The [CLS] token is a learnable embedding prepended to the patch sequence. Through the self-attention layers, it attends to all patch tokens and accumulates a global representation. The final hidden state of [CLS] is used as the image representation for classification. This follows the same pattern BERT uses for text classification.",
      },
      {
        id: "w13-q1-3",
        questionNumber: 3,
        questionText:
          "CLIP trains its image and text encoders using a contrastive objective. For a batch of N image-text pairs, how many positive and negative pairs exist?",
        options: {
          a: "N positive pairs and N negative pairs",
          b: "N positive pairs and N*(N-1) negative pairs",
          c: "N^2 positive pairs and N^2 negative pairs",
          d: "1 positive pair and N-1 negative pairs per image",
        },
        correctAnswer: "b",
        explanation:
          "Each image matches exactly one text in the batch, giving N positive pairs (the diagonal of the N x N similarity matrix). Every other pairing is negative: each image has N-1 non-matching texts, for N*(N-1) negatives total. This is why large batch sizes help CLIP training - more negatives per positive means a harder contrastive task.",
      },
      {
        id: "w13-q1-4",
        questionNumber: 4,
        questionText:
          "How does CLIP perform zero-shot image classification?",
        options: {
          a: "It fine-tunes on a few labeled examples from the target dataset",
          b: "It encodes class names as text, encodes the image, and picks the class whose text embedding has highest cosine similarity to the image embedding",
          c: "It uses the image encoder's final layer as a fixed classifier over ImageNet classes",
          d: "It generates a text description of the image and parses the class name from it",
        },
        correctAnswer: "b",
        explanation:
          "CLIP's joint embedding space lets you classify without training data. Encode each class label (often with a prompt template like 'a photo of a {class}') to get text embeddings. Encode the input image. Compare the image embedding against all class text embeddings via cosine similarity. The highest-similarity class wins. No gradient updates, no labeled examples from the target domain.",
      },
      {
        id: "w13-q1-5",
        questionNumber: 5,
        questionText:
          "Why do Vision Transformers need positional embeddings but convolutional networks do not?",
        options: {
          a: "Convolutional networks process the entire image at once, so position is implicit",
          b: "Transformers treat input as a set by default, with no notion of ordering or spatial layout, while convolutions inherently encode local spatial structure through their sliding window",
          c: "Positional embeddings are only needed for text, not images",
          d: "Convolutional networks use positional embeddings internally in their kernels",
        },
        correctAnswer: "b",
        explanation:
          "Self-attention is permutation-equivariant: shuffling input tokens and applying the same permutation to the output gives the same result. Without positional embeddings, a ViT cannot distinguish a patch at position (0,0) from one at (14,14). Convolutions, by contrast, process spatially adjacent pixels through their kernel's fixed receptive field, so position is encoded structurally.",
      },
    ],
    solution: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "image-tokenizer",
    type: "coding",
    title: "Image Tokenizer with CLS and Position Embeddings",
    description: `Convert an image into a sequence of patch tokens with a prepended [CLS] token and added position embeddings.

This is the full input preparation pipeline for a Vision Transformer:
1. Split image into patches and flatten each to a vector
2. Linearly project each patch to the embedding dimension
3. Prepend a learnable [CLS] token embedding
4. Add learnable position embeddings to every token (including [CLS])

\`\`\`python
>>> import numpy as np
>>> image = np.random.randn(8, 8, 3)
>>> proj = np.random.randn(4*4*3, 64)  # patch_size=4, embed_dim=64
>>> cls_token = np.random.randn(1, 64)
>>> pos_emb = np.random.randn(5, 64)   # 4 patches + 1 CLS = 5 positions
>>> tokens = image_to_tokens(image, 4, proj, cls_token, pos_emb)
>>> tokens.shape
(5, 64)  # [CLS] + 4 patch tokens
\`\`\``,
    difficulty: "Easy",
    weekNumber: 13,
    tags: '["vit", "tokenization", "patch-embedding", "position-embedding"]',
    theory: `The input pipeline for Vision Transformers converts a raw image into a sequence of embedding vectors, analogous to how a tokenizer + embedding layer converts text into token embeddings.

**Patch flattening and projection** converts spatial pixels into semantic tokens. Each patch captures a local region of the image. The linear projection learns which visual features to extract - conceptually similar to learned convolutional filters.

**[CLS] token** is a special token prepended to the sequence. Through self-attention, it aggregates information from all patches. Its final hidden state serves as the image-level representation. This avoids needing global average pooling and lets the model learn which patches matter for the task.

**Position embeddings** are added (not concatenated) to each token. They can be learned or fixed (sinusoidal). ViT uses 1D learned embeddings, which works well despite the 2D spatial structure - the model learns the 2D layout from data. Some variants use 2D positional encodings for slightly better performance.`,
    hints: '["First compute patch embeddings: reshape, flatten, project", "Use np.concatenate to prepend the CLS token along axis 0", "Position embeddings are simply added element-wise to the token sequence", "The CLS token gets position embedding index 0"]',
    visualizationComponent: "ImageTokenizerViz",
    sortOrder: 7,
    starterCode: `import numpy as np

def image_to_tokens(image, patch_size, projection_matrix, cls_token, position_embeddings):
    """
    Convert image to transformer input tokens.

    Args:
        image: np.array (H, W, C)
        patch_size: int
        projection_matrix: np.array (patch_size*patch_size*C, embed_dim)
        cls_token: np.array (1, embed_dim)
        position_embeddings: np.array (num_patches + 1, embed_dim)

    Returns:
        np.array (num_patches + 1, embed_dim) - token sequence with positional info
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def image_to_tokens(image, patch_size, projection_matrix, cls_token, position_embeddings):
    H, W, C = image.shape
    ph = H // patch_size
    pw = W // patch_size

    # Extract and flatten patches
    patches = image.reshape(ph, patch_size, pw, patch_size, C)
    patches = patches.transpose(0, 2, 1, 3, 4)
    patches = patches.reshape(ph * pw, -1)

    # Project patches
    patch_embeddings = patches @ projection_matrix

    # Prepend CLS token
    tokens = np.concatenate([cls_token, patch_embeddings], axis=0)

    # Add position embeddings
    tokens = tokens + position_embeddings

    return tokens
\`\`\`

**Approach:** Extract patches via reshape/transpose, flatten and project them, prepend the CLS token, and add position embeddings element-wise.`,
    testCases: [
      {
        id: "t1",
        name: "Output shape includes CLS token",
        inputs: { image_shape: [8, 8, 3], patch_size: 4, embed_dim: 64 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Position embeddings change the output",
        inputs: { image_shape: [8, 8, 3], patch_size: 4, embed_dim: 64, check_pos: true },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Single patch plus CLS gives shape (2, embed_dim)",
        inputs: { image_shape: [4, 4, 3], patch_size: 4, embed_dim: 32 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "multimodal-search-design",
    type: "system_design",
    title: "Design a Multimodal Search Engine",
    description:
      "Design a search engine that supports text queries, image queries, and combined text+image queries to search across a corpus of images, documents, and videos.",
    difficulty: "Hard",
    weekNumber: 13,
    tags: '["multimodal", "search", "clip", "system-design", "embeddings"]',
    theory: `Multimodal search requires embedding different data types into a shared vector space where semantically similar items are close together, regardless of modality.

**Foundation models for multimodal search:** CLIP aligns images and text. ImageBind extends this to six modalities. These models produce fixed-dimensional embeddings that enable cross-modal retrieval: search images with text, search text with images, or combine both.

**Vector databases** store and index embeddings for fast approximate nearest neighbor (ANN) retrieval. Systems like Pinecone, Weaviate, Milvus, and pgvector use algorithms like HNSW or IVF to search millions of vectors in milliseconds.

**Fusion strategies for mixed queries:** Early fusion embeds the combined text+image input together. Late fusion embeds each modality separately and combines the results (weighted average, learned combination). Late fusion is more flexible and lets you weight modalities differently per query.`,
    hints: '["Consider how to handle queries that combine text and image", "Think about indexing strategies for different modalities", "Address how to rank results across different content types", "Consider freshness, personalization, and relevance signals beyond embedding similarity"]',
    visualizationComponent: "MultimodalSearchViz",
    sortOrder: 9,
    starterCode: null,
    testCases: null,
    questions: null,
    designPrompt: `Design a multimodal search engine for a media company with 100M+ items (images, documents, video clips).

Requirements:
- Support text queries, image queries (reverse image search), and combined text+image queries
- Sub-200ms p99 latency for search
- Handle 10K queries per second
- Support filtering by metadata (date, category, content type)
- Results ranked by relevance with explainability

Your design should address:

1. **Embedding Pipeline:** How do you embed images, text, and video into a shared space? Which models do you use? How do you handle new content ingestion?

2. **Indexing:** How do you store and index embeddings for fast retrieval? What vector database and indexing strategy (HNSW, IVF, etc.)? How do you handle 100M+ vectors?

3. **Query Processing:** How do you process text-only, image-only, and mixed queries? How do you fuse signals from different modalities?

4. **Ranking:** How do you rank results across different content types? What signals beyond embedding similarity matter?

5. **Scaling:** How do you shard the index? How do you handle updates and deletions? What is the reindexing strategy?

6. **Monitoring:** How do you measure search quality? What metrics do you track?`,
    sampleAnswer: `## Architecture

\`\`\`
Query -> Query Encoder(s) -> Query Embedding -> ANN Search -> Re-ranker -> Results
                                                    |
Content -> Embedding Pipeline -> Vector DB (sharded) -+
\`\`\`

## Embedding Pipeline

**Image encoder:** CLIP ViT-L/14 produces 768-dim embeddings. Process at ingestion time and store. For high-resolution images, encode both the full image and detected crops (faces, objects) as separate vectors with a parent-child relationship.

**Text encoder:** CLIP text encoder for short text. For long documents, chunk into 512-token segments, embed each, and store with document-level metadata. Use the chunk embedding for retrieval, return the full document.

**Video encoder:** Sample frames at 1 FPS, embed each with CLIP, store per-frame embeddings. Also extract audio, transcribe with Whisper, and embed the transcript. A video search hit returns the relevant timestamp.

**Ingestion pipeline:** Kafka queue receives new content. Workers embed content asynchronously, write vectors to the vector DB, and metadata to a relational DB. Processing latency target: <5 min from upload to searchable.

## Indexing

**Vector database:** Milvus or Weaviate, sharded by content type initially (images, text, video).

**Index type:** HNSW with M=32, efConstruction=200 for the primary index. HNSW provides excellent recall (>95%) at <5ms per query. Memory cost: ~1KB per vector with HNSW overhead.

**Quantization:** Use Product Quantization (PQ) to reduce memory. 768-dim float32 vectors = 3KB each. 100M vectors = 300GB raw. PQ compresses to ~100 bytes each = 10GB. Keep full vectors on disk for re-ranking.

**Metadata filtering:** Store metadata (date, category, type) in the vector DB's scalar index. Use pre-filtering (filter before ANN search) for selective queries, post-filtering for broad queries. Hybrid approach: if filter selectivity < 1%, pre-filter; otherwise, post-filter with oversampling.

## Query Processing

**Text-only query:** Encode with CLIP text encoder. Search all content type shards. Merge and re-rank.

**Image-only query:** Encode with CLIP image encoder. Search primarily image/video shards. Optionally search text shard if cross-modal results are desired.

**Mixed query (text + image):** Encode each modality separately. Combine embeddings via weighted average: q = alpha * text_emb + (1-alpha) * image_emb, where alpha is tunable (default 0.5). Normalize the combined vector. Search all shards.

**Query expansion:** For text queries, generate 2-3 reformulations using an LLM, embed each, and search. Take the union of results. This handles vocabulary mismatch.

## Ranking

**Two-stage ranking:**

Stage 1 - ANN retrieval: fetch top 200 candidates per shard using cosine similarity.

Stage 2 - Re-ranker: A learned cross-encoder scores each (query, result) pair more accurately. Features:
- Embedding cosine similarity (primary signal)
- Freshness score (newer content boosted for trending queries)
- Popularity signal (click-through rate, view count)
- Content quality score (resolution, text length, engagement)
- Diversity penalty (penalize near-duplicate results)

**Explainability:** For each result, compute which query terms or image regions contributed most to the match. Use CLIP's attention weights or gradient-based attribution.

## Scaling

**Sharding:** Shard by content type (3 shards) and within each type by hash of content ID (N sub-shards). Each sub-shard runs on a separate node with its own HNSW index. A query coordinator fans out to all relevant shards and merges results.

**Replication:** Each shard has 3 replicas for availability and load distribution. Read queries go to any replica. Writes go to the primary, replicated asynchronously.

**Updates/deletions:** Soft-delete by marking vectors as deleted in a bloom filter checked during search. Periodic compaction rebuilds the index without deleted vectors. For updates, insert the new vector and soft-delete the old one.

**Capacity:** With PQ + HNSW, each node holds ~10M vectors in ~1GB RAM. 100M vectors across images, text, video = 10 nodes per content type, 30 total + replicas.

## Monitoring

**Search quality metrics:**
- Relevance: NDCG@10, MRR from human judgments (weekly evaluation set)
- Click-through rate by query type and content type
- Zero-result rate (queries with no good matches)
- Latency: p50, p95, p99 per query type

**System metrics:**
- Embedding pipeline lag (ingestion to searchable)
- Index memory and disk usage per shard
- QPS per shard and overall
- ANN recall vs brute-force (measured on a sample)`,
    rubric: [
      {
        criterion: "Embedding Strategy",
        weight: 0.25,
        description: "How different modalities are embedded and aligned",
        keyPoints: [
          "CLIP or similar model for shared embedding space",
          "Handling video temporal dimension",
          "Document chunking strategy",
        ],
      },
      {
        criterion: "Retrieval Architecture",
        weight: 0.25,
        description: "Vector search infrastructure and query processing",
        keyPoints: [
          "ANN algorithm choice with justification",
          "Multi-modal query fusion",
          "Metadata filtering approach",
        ],
      },
      {
        criterion: "Ranking and Quality",
        weight: 0.2,
        description: "Multi-stage ranking and result quality",
        keyPoints: [
          "Two-stage retrieval + re-ranking",
          "Multiple relevance signals beyond similarity",
          "Result diversity",
        ],
      },
      {
        criterion: "Scalability",
        weight: 0.2,
        description: "Handling scale and operational concerns",
        keyPoints: [
          "Sharding strategy",
          "Quantization for memory efficiency",
          "Update and deletion handling",
        ],
      },
      {
        criterion: "Monitoring",
        weight: 0.1,
        description: "Search quality measurement and observability",
        keyPoints: [
          "Relevance metrics (NDCG, MRR)",
          "Latency tracking",
          "Index health monitoring",
        ],
      },
    ],
  },
  {
    id: "contrastive-loss",
    type: "coding",
    title: "InfoNCE Contrastive Loss",
    description: `Implement the InfoNCE contrastive loss used in CLIP-style training.

Given N image-text pairs, the loss encourages matching pairs (same index) to have high similarity and non-matching pairs to have low similarity. For each image, the correct text is the positive, and all other texts in the batch are negatives (and vice versa).

**InfoNCE loss for image i:**
$\\mathcal{L}_i = -\\log \\frac{\\exp(\\text{sim}(i,i) / \\tau)}{\\sum_j \\exp(\\text{sim}(i,j) / \\tau)}$

The total loss averages the image-to-text and text-to-image losses:
$\\mathcal{L} = \\frac{1}{2} \\left( \\text{mean}(\\mathcal{L}_{i \\to t}) + \\text{mean}(\\mathcal{L}_{t \\to i}) \\right)$

\`\`\`python
>>> import numpy as np
>>> image_embs = np.eye(4)  # 4 images, perfectly distinct
>>> text_embs = np.eye(4)   # 4 texts, matching images
>>> loss = infonce_loss(image_embs, text_embs, temperature=0.07)
>>> loss < 0.01  # perfect alignment -> near-zero loss
True
\`\`\``,
    difficulty: "Medium",
    weekNumber: 13,
    tags: '["contrastive-learning", "infonce", "clip", "loss-functions"]',
    theory: `InfoNCE (Noise Contrastive Estimation) is the loss function behind CLIP, SimCLR, and many contrastive learning methods. It frames the matching problem as a multi-class classification: given an anchor, classify which of N candidates is the positive match.

**The loss is a softmax cross-entropy** where the logits are scaled cosine similarities between the anchor and all candidates. The label is the index of the true positive. Temperature $\\tau$ controls how peaked the softmax is - lower temperature makes the loss more sensitive to small differences in similarity.

**Why contrastive learning works:** By pushing non-matching pairs apart and pulling matching pairs together, the model learns an embedding space where semantic similarity maps to geometric proximity. The N-1 negatives per positive provide strong learning signal - the model must distinguish the correct match from many distractors.

**Batch size matters:** With N pairs, each sample has N-1 negatives. Larger batches mean more negatives, making the task harder and the learned representations better. CLIP used batch sizes of 32,768. This is why contrastive learning is compute-intensive.`,
    hints: '["First L2-normalize all embeddings", "Compute the full NxN similarity matrix divided by temperature", "InfoNCE for rows: -log(exp(diagonal) / sum(exp(row)))", "Use log-sum-exp trick for numerical stability: log(sum(exp(x))) = max(x) + log(sum(exp(x - max(x))))"]',
    visualizationComponent: "ContrastiveLossViz",
    sortOrder: 10,
    starterCode: `import numpy as np

def infonce_loss(image_embeddings, text_embeddings, temperature=0.07):
    """
    Compute symmetric InfoNCE contrastive loss.

    Args:
        image_embeddings: np.array of shape (N, D)
        text_embeddings: np.array of shape (N, D)
        temperature: float, temperature scaling

    Returns:
        float: the average symmetric contrastive loss
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def infonce_loss(image_embeddings, text_embeddings, temperature=0.07):
    # L2 normalize
    image_norm = image_embeddings / np.linalg.norm(image_embeddings, axis=-1, keepdims=True)
    text_norm = text_embeddings / np.linalg.norm(text_embeddings, axis=-1, keepdims=True)

    # Scaled similarity matrix
    logits = (image_norm @ text_norm.T) / temperature
    N = logits.shape[0]
    labels = np.arange(N)

    # Cross-entropy loss along rows (image-to-text)
    def cross_entropy_rows(logits, labels):
        # Numerically stable log-softmax
        max_logits = np.max(logits, axis=1, keepdims=True)
        log_sum_exp = max_logits.squeeze() + np.log(np.sum(np.exp(logits - max_logits), axis=1))
        log_probs = logits[np.arange(N), labels] - log_sum_exp
        return -np.mean(log_probs)

    # Image-to-text loss (softmax along rows)
    i2t_loss = cross_entropy_rows(logits, labels)
    # Text-to-image loss (softmax along columns = rows of transpose)
    t2i_loss = cross_entropy_rows(logits.T, labels)

    return 0.5 * (i2t_loss + t2i_loss)
\`\`\`

**Approach:** Normalize embeddings, compute scaled cosine similarity matrix, and apply cross-entropy along both axes. The diagonal entries are the positive pairs. Use log-sum-exp for numerical stability.`,
    testCases: [
      {
        id: "t1",
        name: "Perfect alignment gives near-zero loss",
        inputs: { n: 4, dim: 4, identity: true, temperature: 0.07 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Random embeddings give positive loss",
        inputs: { n: 8, dim: 64, temperature: 0.07 },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Loss decreases with better alignment",
        inputs: { n: 4, dim: 32, temperature: 0.07, test_alignment: true },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Single pair gives zero loss",
        inputs: { n: 1, dim: 16, temperature: 0.07 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "rate-limiter",
    type: "coding",
    title: "Token-Aware Rate Limiter",
    description: `Implement a token-aware sliding window rate limiter for LLM API calls.

Standard rate limiters count requests. LLM APIs care about tokens per minute (TPM) and requests per minute (RPM). Your rate limiter must track both.

Implement a \`RateLimiter\` class with:
- \`__init__(self, max_rpm, max_tpm, window_seconds=60)\`: Initialize with limits
- \`try_acquire(self, estimated_tokens, current_time)\`: Check if a request can proceed. If yes, record it and return True. If no, return False.
- \`get_wait_time(self, estimated_tokens, current_time)\`: Return seconds to wait before a request with this many tokens can proceed. Return 0 if it can proceed now.

Sliding window: only count requests/tokens within the last \`window_seconds\`.

\`\`\`python
>>> limiter = RateLimiter(max_rpm=10, max_tpm=1000, window_seconds=60)
>>> limiter.try_acquire(estimated_tokens=100, current_time=0.0)
True
>>> limiter.try_acquire(estimated_tokens=950, current_time=0.5)
False  # would exceed 1000 TPM
\`\`\``,
    difficulty: "Medium",
    weekNumber: 14,
    tags: '["rate-limiting", "production", "api", "sliding-window"]',
    theory: `Rate limiting prevents API overuse and protects both the client (from unexpected costs) and the server (from overload). LLM APIs add a twist: the cost of a request depends on the number of tokens, not just the request count.

**Sliding window** tracks events within the last W seconds. As time passes, old events slide out of the window. This is more fair than fixed windows, which can allow bursts at window boundaries (e.g., 10 requests at 0:59 and 10 more at 1:01 creates a burst of 20 in 2 seconds).

**Token tracking:** Each request consumes an estimated number of tokens. The rate limiter must ensure the total tokens in the current window stay under the TPM limit AND the request count stays under RPM. Both constraints must be satisfied.

**Wait time calculation:** When a request is blocked, the limiter should tell the caller how long to wait. Find the earliest time when enough old requests will have expired to make room for the new request. This enables efficient backoff without polling.`,
    hints: '["Store requests as (timestamp, token_count) tuples in a list", "To clean the window, remove entries where current_time - timestamp >= window_seconds", "Check both RPM and TPM constraints in try_acquire", "For wait time, find the oldest request that needs to expire to free up capacity"]',
    visualizationComponent: "RateLimiterViz",
    sortOrder: 1,
    starterCode: `class RateLimiter:
    def __init__(self, max_rpm, max_tpm, window_seconds=60):
        """
        Args:
            max_rpm: maximum requests per window
            max_tpm: maximum tokens per window
            window_seconds: sliding window duration in seconds
        """
        pass

    def try_acquire(self, estimated_tokens, current_time):
        """
        Try to acquire permission for a request.

        Args:
            estimated_tokens: int, estimated token count for this request
            current_time: float, current timestamp in seconds

        Returns:
            bool: True if request is allowed, False if rate limited
        """
        pass

    def get_wait_time(self, estimated_tokens, current_time):
        """
        Get time to wait before this request can proceed.

        Args:
            estimated_tokens: int, estimated token count
            current_time: float, current timestamp

        Returns:
            float: seconds to wait (0 if can proceed now)
        """
        pass`,
    solution: `\`\`\`python
class RateLimiter:
    def __init__(self, max_rpm, max_tpm, window_seconds=60):
        self.max_rpm = max_rpm
        self.max_tpm = max_tpm
        self.window_seconds = window_seconds
        self.requests = []  # list of (timestamp, token_count)

    def _clean_window(self, current_time):
        cutoff = current_time - self.window_seconds
        self.requests = [(t, tok) for t, tok in self.requests if t > cutoff]

    def _current_usage(self, current_time):
        self._clean_window(current_time)
        rpm = len(self.requests)
        tpm = sum(tok for _, tok in self.requests)
        return rpm, tpm

    def try_acquire(self, estimated_tokens, current_time):
        rpm, tpm = self._current_usage(current_time)
        if rpm + 1 > self.max_rpm:
            return False
        if tpm + estimated_tokens > self.max_tpm:
            return False
        self.requests.append((current_time, estimated_tokens))
        return True

    def get_wait_time(self, estimated_tokens, current_time):
        rpm, tpm = self._current_usage(current_time)

        wait_rpm = 0.0
        if rpm + 1 > self.max_rpm:
            # Need the oldest request to expire
            oldest_time = self.requests[0][0]
            wait_rpm = (oldest_time + self.window_seconds) - current_time

        wait_tpm = 0.0
        if tpm + estimated_tokens > self.max_tpm:
            # Find how many old requests must expire to free enough tokens
            needed = (tpm + estimated_tokens) - self.max_tpm
            freed = 0
            for t, tok in self.requests:
                freed += tok
                if freed >= needed:
                    wait_tpm = (t + self.window_seconds) - current_time
                    break

        wait = max(wait_rpm, wait_tpm, 0.0)
        return wait
\`\`\`

**Approach:** Store requests with timestamps. Clean expired entries before each check. Enforce both RPM and TPM. For wait time, find the earliest expiry that frees enough capacity.`,
    testCases: [
      {
        id: "t1",
        name: "First request within limits succeeds",
        inputs: { max_rpm: 10, max_tpm: 1000, tokens: 100, time: 0.0 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Exceeding TPM blocks request",
        inputs: { max_rpm: 100, max_tpm: 1000, requests: [[500, 0.0], [600, 0.5]] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Exceeding RPM blocks request",
        inputs: { max_rpm: 2, max_tpm: 10000, requests: [[10, 0.0], [10, 0.1], [10, 0.2]] },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Old requests expire and free capacity",
        inputs: { max_rpm: 1, max_tpm: 1000, requests: [[100, 0.0], [100, 61.0]] },
        isPublic: false,
      },
      {
        id: "t5",
        name: "Wait time is correct",
        inputs: { max_rpm: 1, max_tpm: 1000, check_wait: true },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "production-ai-architecture-quiz",
    type: "quiz",
    title: "Production AI Architecture",
    description:
      "Test your understanding of caching strategies, rate limiting, monitoring, and deployment patterns for production LLM systems.",
    difficulty: "Medium",
    weekNumber: 14,
    tags: '["production", "architecture", "deployment", "monitoring", "quiz"]',
    theory: `Deploying LLM applications to production requires infrastructure patterns borrowed from traditional web engineering, adapted for the unique characteristics of LLM workloads: high latency, high cost per request, non-deterministic outputs, and token-based pricing.

**Caching:** LLM calls are expensive ($0.01-$0.10 per call for frontier models). Exact caches help with repeated queries. Semantic caches (using embedding similarity) catch paraphrased duplicates. Cache invalidation triggers on model updates or when the underlying data changes.

**Rate limiting:** LLM APIs enforce both requests-per-minute (RPM) and tokens-per-minute (TPM) limits. Client-side rate limiters prevent hitting these limits and getting 429 errors. Token counting must happen before the request, using tiktoken or similar tokenizer.

**Monitoring:** Track latency (time-to-first-token, total generation time), cost (tokens consumed per request), quality (user feedback, automated evaluation scores), and errors (rate limit hits, timeouts, content filter triggers). Logging the full prompt-response pair is essential for debugging but raises privacy concerns.

**Deployment:** Blue-green deployments for prompt changes. Canary releases for model swaps. Feature flags to control which users get which model/prompt version.`,
    hints: "[]",
    visualizationComponent: "ProductionArchViz",
    sortOrder: 5,
    starterCode: null,
    testCases: null,
    questions: [
      {
        id: "w14-q1-1",
        questionNumber: 1,
        questionText:
          "Why is semantic caching more effective than exact-match caching for LLM applications?",
        options: {
          a: "Semantic caching is faster because it uses hash lookups",
          b: "Users often ask the same question with different wording; semantic caching recognizes paraphrases by comparing embedding similarity",
          c: "Exact-match caching cannot store string responses",
          d: "Semantic caching guarantees the cached response is always correct",
        },
        correctAnswer: "b",
        explanation:
          "Exact-match caching only hits when the query string is identical. In practice, users rephrase the same question in many ways: 'What is X?', 'Explain X', 'Tell me about X'. Semantic caching embeds queries and finds cached entries with high cosine similarity, catching these paraphrases. The tradeoff: semantic caching requires embedding computation and can produce false positives if the similarity threshold is too low.",
      },
      {
        id: "w14-q1-2",
        questionNumber: 2,
        questionText:
          "A production LLM system experiences intermittent 429 (rate limit) errors during peak hours. What is the best approach?",
        options: {
          a: "Upgrade to a higher API tier immediately",
          b: "Implement client-side token-aware rate limiting with a sliding window, combined with request queuing and exponential backoff",
          c: "Add a 5-second sleep between every request",
          d: "Switch to a different LLM provider",
        },
        correctAnswer: "b",
        explanation:
          "Client-side rate limiting prevents hitting the server's limits proactively. Token-aware limiting accounts for the fact that LLM APIs limit both RPM and TPM. A sliding window gives smoother request distribution than fixed windows. Request queuing with exponential backoff handles bursts gracefully. Fixed sleeps waste capacity during quiet periods and don't help during bursts.",
      },
      {
        id: "w14-q1-3",
        questionNumber: 3,
        questionText:
          "Which metric is most critical for detecting quality degradation in a production LLM system?",
        options: {
          a: "CPU utilization on the API gateway",
          b: "Average response length in tokens",
          c: "User feedback scores (thumbs up/down) tracked over time with anomaly detection",
          d: "Number of concurrent connections to the LLM API",
        },
        correctAnswer: "c",
        explanation:
          "User feedback directly measures output quality as perceived by the end user. A drop in feedback scores signals degradation that automated metrics might miss (e.g., the model starts giving technically correct but unhelpful answers). Tracking over time with anomaly detection catches sudden drops (after model updates) and gradual drift. Response length and system metrics are useful but don't directly measure quality.",
      },
      {
        id: "w14-q1-4",
        questionNumber: 4,
        questionText:
          "When deploying a new system prompt for a production chatbot, what deployment strategy minimizes risk?",
        options: {
          a: "Deploy to all users simultaneously during low-traffic hours",
          b: "Canary deployment: route 5% of traffic to the new prompt, monitor quality metrics, gradually increase if metrics hold",
          c: "Test only in a staging environment, then deploy 100% to production",
          d: "Let users opt-in to the new version through a settings page",
        },
        correctAnswer: "b",
        explanation:
          "Canary deployment limits blast radius. If the new prompt degrades quality, only 5% of users are affected. Monitoring quality metrics (response ratings, task completion, error rates) during the canary phase catches issues before full rollout. Staging environments cannot fully replicate production traffic patterns and user behavior. Low-traffic deploys still expose all users to risk. Opt-in creates a self-selected, non-representative sample.",
      },
      {
        id: "w14-q1-5",
        questionNumber: 5,
        questionText:
          "What is the primary risk of logging full LLM prompt-response pairs for debugging?",
        options: {
          a: "Logs consume too much disk space",
          b: "The logs contain user data, PII, and potentially sensitive information that requires careful access controls and data retention policies",
          c: "Logging slows down the response time significantly",
          d: "LLM providers prohibit logging of their API responses",
        },
        correctAnswer: "b",
        explanation:
          "Full prompt-response logs contain user queries (which may include personal information, medical questions, financial data) and model responses (which may reproduce PII from the context). These logs need: encryption at rest, role-based access, automatic PII redaction, retention policies (e.g., delete after 30 days), and compliance with GDPR/CCPA. The debugging value is high, but so is the privacy risk. Many teams log sanitized versions or only log for a sample of requests.",
      },
    ],
    solution: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "ab-test-framework",
    type: "coding",
    title: "Prompt A/B Testing with Statistical Significance",
    description: `Implement an A/B testing framework for prompt variants that uses the chi-square test to determine statistical significance.

You are comparing two prompt variants (A and B). Each variant receives user interactions resulting in "success" or "failure" outcomes. The framework must determine if one variant is statistically significantly better than the other.

Implement:
- \`ABTest.__init__(self, name, variants)\`: Initialize with test name and list of variant names
- \`ABTest.record(self, variant, outcome)\`: Record a "success" or "failure" for a variant
- \`ABTest.get_stats(self)\`: Return per-variant stats: count, successes, failures, success_rate
- \`ABTest.chi_square_test(self)\`: Compute chi-square statistic and p-value. Return {"chi2": float, "p_value": float, "significant": bool} (significant if p_value < 0.05)
- \`ABTest.get_winner(self)\`: Return the variant name with the highest success rate, or None if not yet significant

Chi-square formula for 2x2 table: $\\chi^2 = \\frac{N(ad - bc)^2}{(a+b)(c+d)(a+c)(b+d)}$
where a=successes_A, b=failures_A, c=successes_B, d=failures_B, N=total.

\`\`\`python
>>> test = ABTest("prompt_test", ["variant_a", "variant_b"])
>>> for _ in range(80): test.record("variant_a", "success")
>>> for _ in range(20): test.record("variant_a", "failure")
>>> for _ in range(60): test.record("variant_b", "success")
>>> for _ in range(40): test.record("variant_b", "failure")
>>> result = test.chi_square_test()
>>> result["significant"]
True
\`\`\``,
    difficulty: "Hard",
    weekNumber: 14,
    tags: '["ab-testing", "statistics", "prompt-engineering", "production"]',
    theory: `A/B testing applied to prompts answers: "Is prompt variant B better than A, or did we get lucky with the sample?" Statistical significance testing guards against drawing conclusions from random variation.

**Chi-square test for independence** checks whether the success rate differs between variants more than expected by chance. The test compares observed frequencies (actual success/failure counts per variant) against expected frequencies (what the counts would be if both variants had the same underlying success rate). A large chi-square statistic means the difference is unlikely due to chance.

**P-value:** The probability of observing a difference this extreme if there is actually no difference between variants. Convention: $p < 0.05$ means the result is "statistically significant." This threshold is arbitrary but widely used. A p-value of 0.03 means there's a 3% chance the observed difference is due to random variation.

**Sample size matters:** Small samples produce noisy estimates. Running significance tests too early leads to false positives. A common rule of thumb: collect at least 100 observations per variant before testing. The required sample size depends on the expected effect size - smaller differences need more data to detect.

**Multiple testing:** If you test 20 prompt variants pairwise, you'll get ~1 false positive at $p=0.05$ by chance. Corrections like Bonferroni adjust the significance threshold when running multiple tests.`,
    hints: '["Store counts per variant in a dict: {variant: {success: int, failure: int}}", "For chi-square 2x2: chi2 = N*(a*d - b*c)^2 / ((a+b)*(c+d)*(a+c)*(b+d))", "P-value from chi2 with 1 degree of freedom: use the survival function approximation", "For the p-value, you can use: p = 1 - (2 * norm_cdf(sqrt(chi2)) - 1) where norm_cdf is the standard normal CDF"]',
    visualizationComponent: "ABTestViz",
    sortOrder: 7,
    starterCode: `import math

class ABTest:
    def __init__(self, name, variants):
        """
        Args:
            name: str, test name
            variants: list of str, variant names
        """
        pass

    def record(self, variant, outcome):
        """
        Record an outcome for a variant.

        Args:
            variant: str, variant name
            outcome: str, "success" or "failure"
        """
        pass

    def get_stats(self):
        """
        Get statistics for each variant.

        Returns:
            dict: {variant_name: {"count": int, "successes": int, "failures": int, "success_rate": float}}
        """
        pass

    def chi_square_test(self):
        """
        Perform chi-square test of independence.

        Returns:
            dict: {"chi2": float, "p_value": float, "significant": bool}
        """
        pass

    def get_winner(self):
        """
        Get the winning variant if result is significant.

        Returns:
            str or None: winning variant name, or None if not significant
        """
        pass`,
    solution: `\`\`\`python
import math

class ABTest:
    def __init__(self, name, variants):
        self.name = name
        self.variants = variants
        self.data = {v: {"success": 0, "failure": 0} for v in variants}

    def record(self, variant, outcome):
        if variant not in self.data:
            raise ValueError(f"Unknown variant: {variant}")
        self.data[variant][outcome] += 1

    def get_stats(self):
        stats = {}
        for v in self.variants:
            s = self.data[v]["success"]
            f = self.data[v]["failure"]
            total = s + f
            stats[v] = {
                "count": total,
                "successes": s,
                "failures": f,
                "success_rate": s / total if total > 0 else 0.0,
            }
        return stats

    def chi_square_test(self):
        if len(self.variants) != 2:
            raise ValueError("Chi-square test requires exactly 2 variants")

        a = self.data[self.variants[0]]["success"]
        b = self.data[self.variants[0]]["failure"]
        c = self.data[self.variants[1]]["success"]
        d = self.data[self.variants[1]]["failure"]
        N = a + b + c + d

        if N == 0:
            return {"chi2": 0.0, "p_value": 1.0, "significant": False}

        denom = (a + b) * (c + d) * (a + c) * (b + d)
        if denom == 0:
            return {"chi2": 0.0, "p_value": 1.0, "significant": False}

        chi2 = (N * (a * d - b * c) ** 2) / denom

        # Approximate p-value using chi2 with 1 df
        # P(X > chi2) for chi-squared(1) = 2 * (1 - Phi(sqrt(chi2)))
        # Using complementary error function: erfc(x/sqrt(2))/2 = 1 - Phi(x)
        p_value = math.erfc(math.sqrt(chi2 / 2))

        return {
            "chi2": chi2,
            "p_value": p_value,
            "significant": p_value < 0.05,
        }

    def get_winner(self):
        result = self.chi_square_test()
        if not result["significant"]:
            return None
        stats = self.get_stats()
        return max(self.variants, key=lambda v: stats[v]["success_rate"])
\`\`\`

**Approach:** Track success/failure counts per variant. The chi-square statistic measures how much observed counts deviate from what we would expect if both variants had the same success rate. Convert chi2 to p-value using the complementary error function (equivalent to the chi-squared survival function with 1 degree of freedom).`,
    testCases: [
      {
        id: "t1",
        name: "Significant difference detected",
        inputs: { a_success: 80, a_fail: 20, b_success: 60, b_fail: 40 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "No significant difference with similar rates",
        inputs: { a_success: 50, a_fail: 50, b_success: 48, b_fail: 52 },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Winner returns correct variant",
        inputs: { a_success: 90, a_fail: 10, b_success: 50, b_fail: 50 },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Empty data returns not significant",
        inputs: { a_success: 0, a_fail: 0, b_success: 0, b_fail: 0 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "document-processing-design",
    type: "system_design",
    title: "Design an AI Document Processing Pipeline",
    description:
      "Design an AI-powered document processing system that extracts structured data from unstructured documents (PDFs, scans, emails) at scale.",
    difficulty: "Hard",
    weekNumber: 14,
    tags: '["document-processing", "pipeline", "production", "system-design", "ocr"]',
    theory: `AI document processing transforms unstructured content (PDFs, scanned documents, emails, images) into structured, queryable data. This is one of the most common enterprise AI use cases.

**The pipeline:** Document ingestion -> OCR/text extraction -> classification (what type of document is this?) -> entity extraction (pull out key fields) -> validation -> output to downstream systems. Each stage can use different AI models optimized for its task.

**OCR challenges:** Scanned documents need optical character recognition. Modern OCR (Tesseract, Google Vision, Azure Document Intelligence) handles most printed text well. Handwriting, poor scans, rotated pages, and multi-column layouts remain difficult. Layout detection (identifying tables, headers, paragraphs) is a separate model.

**LLM-based extraction:** Instead of training a custom NER model for each document type, use an LLM with a structured prompt: "Extract the following fields from this invoice: vendor_name, invoice_number, line_items, total_amount." JSON mode ensures parseable output. Few-shot examples in the prompt guide the extraction format.

**Validation:** AI extraction is not 100% accurate. Confidence scores, cross-field validation (do line items sum to the total?), and human-in-the-loop review for low-confidence extractions ensure data quality.`,
    hints: '["Consider how to handle different document types with different schemas", "Think about confidence scoring and when to escalate to human review", "Address throughput requirements and parallelization", "Consider how to handle extraction errors and partial failures"]',
    visualizationComponent: "DocumentPipelineViz",
    sortOrder: 9,
    starterCode: null,
    testCases: null,
    questions: null,
    designPrompt: `Design an AI-powered document processing system for a financial services company that receives 50,000 documents per day (invoices, contracts, tax forms, bank statements, correspondence).

Requirements:
- Extract structured data from unstructured documents with >95% field-level accuracy
- Process 50K documents/day with <5 minute per-document latency
- Support 20+ document types with different schemas
- Human-in-the-loop for low-confidence extractions
- Audit trail for all extractions and corrections
- Handle PDFs, scanned images, emails with attachments

Your design should address:

1. **Ingestion:** How do documents enter the system? How do you handle different formats?

2. **Classification:** How do you determine the document type? What model/approach?

3. **Extraction:** How do you extract structured fields? LLM-based, custom models, or hybrid? How do you handle tables and line items?

4. **Validation & Confidence:** How do you score extraction confidence? What triggers human review?

5. **Human-in-the-Loop:** How does the review interface work? How do corrections feed back into the system?

6. **Scaling & Operations:** How do you handle 50K docs/day? Queue management, parallelization, monitoring?`,
    sampleAnswer: `## Architecture

\`\`\`
Ingestion -> Pre-processing -> Classification -> Extraction -> Validation -> Human Review (if needed) -> Output
    |                                                                              |
    +---- Document Store (S3) -------- Audit Trail (Postgres) ------- Feedback Loop -+
\`\`\`

## Ingestion

**Multi-channel intake:**
- Email: Monitor inboxes via IMAP, extract attachments. Parse email body for context (sender, subject, date).
- API upload: REST endpoint accepts file uploads with metadata. SDKs for major languages.
- SFTP: Batch uploads from partner systems.
- Cloud storage: Watch S3/GCS buckets for new files.

**Pre-processing:**
- Convert all formats to normalized representation: PDF -> pages, images -> single-page images, emails -> body text + extracted attachments.
- Run OCR (Google Cloud Vision or AWS Textract) on scanned/image pages. Store raw text with bounding boxes.
- Detect page orientation and correct rotations.
- Detect multi-page documents that should be treated as one unit (stapled invoices vs. separate documents in one PDF).

**Storage:** Raw documents stored in S3 with immutable keys. Metadata in Postgres. Every downstream step references the original document by ID.

## Classification

**Two-stage classifier:**

Stage 1 - Fast classifier: A fine-tuned DistilBERT on the first 512 tokens classifies into ~20 document types. <50ms per document. Trained on 10K labeled examples. Accuracy: ~97%.

Stage 2 - LLM fallback: Documents classified with <90% confidence go to an LLM classifier (GPT-4 with few-shot examples for each type). This catches unusual formats and edge cases.

**Schema registry:** Each document type has a defined schema: required fields, optional fields, field types, validation rules. Schemas are versioned and stored in a database. New document types are added by creating a schema and providing 20+ labeled examples.

## Extraction

**Hybrid extraction approach:**

**For structured documents (invoices, tax forms):** Use layout-aware extraction. AWS Textract or Azure Document Intelligence detects tables, key-value pairs, and form fields with position information. Map detected fields to the schema using field name matching and position heuristics.

**For semi-structured documents (contracts, correspondence):** Use LLM extraction with the document text and schema as input:
\`\`\`
Extract the following fields from this {document_type}:
{schema_fields_with_descriptions}

Document text:
{ocr_text}

Output as JSON:
\`\`\`

**Table extraction:** Tables are extracted by Textract as structured data. For complex tables (merged cells, multi-row headers), a specialized table extraction model (TableFormer) post-processes the layout. Line items are extracted as arrays within the JSON output.

**Chunking for long documents:** Documents exceeding the LLM context window are chunked by page. Each page is processed independently, then results are merged. Cross-page entities (e.g., a table spanning two pages) are handled by overlapping the context.

## Validation & Confidence

**Confidence scoring (0-1 per field):**
- Layout extraction: Use the model's confidence score directly.
- LLM extraction: Compute confidence from: (1) model log-probabilities if available, (2) consistency across multiple extraction runs (run 3 times, check agreement), (3) format validation (does the extracted date parse? does the number look like a dollar amount?).

**Cross-field validation:**
- Line items sum to total amount (+/- rounding tolerance)
- Invoice date is before due date
- Vendor name matches known vendor database
- Tax ID format matches expected pattern for the jurisdiction

**Routing rules:**
- All fields confidence > 0.95 AND cross-validation passes: auto-approve, no human review.
- Any field confidence < 0.7 OR cross-validation fails: flag for human review.
- Between 0.7 and 0.95: flag individual low-confidence fields for spot-check.

Expected routing: ~70% auto-approved, ~20% spot-check, ~10% full human review.

## Human-in-the-Loop

**Review interface:** Web app showing the original document alongside extracted fields. Low-confidence fields highlighted in yellow. Reviewers can:
- Accept or correct each field
- Flag the entire document as unprocessable
- Reclassify the document type
- Add notes for downstream consumers

**Feedback loop:** Corrections are stored as (original_extraction, human_correction) pairs. Batch these monthly:
- Fine-tune the classifier on misclassifications
- Add corrected examples to LLM few-shot prompts
- Update validation rules based on common error patterns
- Track accuracy trends per document type

## Scaling & Operations

**Queue architecture:** SQS queues for each pipeline stage. Documents flow: ingestion_queue -> classification_queue -> extraction_queue -> validation_queue -> review_queue (if needed).

**Parallelization:** 50K docs/day = ~35 docs/minute. Each extraction takes ~30s (including LLM calls). 20 parallel workers handle the extraction stage with margin. Auto-scale workers based on queue depth.

**Cost management:** Classify first, then route cheap document types (simple invoices) to Textract extraction ($.01/page) and complex types to LLM extraction ($.10/page). Expected cost: ~$500-$1000/day for 50K documents.

**Monitoring:**
- Per-stage latency and throughput dashboards
- Extraction accuracy by document type (measured by human review corrections)
- Queue depth alerts (growing queue = falling behind)
- Error rate per stage with automated alerting
- Daily cost report by document type and extraction method

**Audit trail:** Every extraction is logged with: document ID, extraction method, raw extraction output, confidence scores, validation results, human corrections (if any), final approved output, timestamps at each stage.`,
    rubric: [
      {
        criterion: "Pipeline Architecture",
        weight: 0.25,
        description: "End-to-end pipeline design from ingestion to output",
        keyPoints: [
          "Clear stage separation",
          "Multi-format handling",
          "Queue-based async processing",
        ],
      },
      {
        criterion: "Extraction Strategy",
        weight: 0.25,
        description: "How structured data is extracted from documents",
        keyPoints: [
          "Layout-aware extraction for forms",
          "LLM-based extraction for unstructured text",
          "Table and line item handling",
        ],
      },
      {
        criterion: "Quality Assurance",
        weight: 0.25,
        description: "Confidence scoring, validation, and human review",
        keyPoints: [
          "Per-field confidence scores",
          "Cross-field validation rules",
          "Routing logic for human review",
          "Feedback loop from corrections",
        ],
      },
      {
        criterion: "Operations & Scale",
        weight: 0.25,
        description: "Throughput, cost management, and monitoring",
        keyPoints: [
          "Parallelization strategy",
          "Cost-aware routing",
          "Monitoring and alerting",
          "Audit trail",
        ],
      },
    ],
  },
  {
    id: "tool-use-planner",
    type: "coding",
    title: "Multi-Step Tool Use Planner",
    description: `Implement a tool use planner that resolves dependencies between tool calls and produces a valid execution order.

AI agents use tools (search, calculator, code executor, API calls) to accomplish tasks. Some tools depend on others' outputs: you must search before you can summarize the results. The planner builds a dependency graph and produces a topologically sorted execution plan.

Implement:
- \`ToolCall\`: A class with \`id\` (str), \`tool\` (str), \`args\` (dict), and \`depends_on\` (list of ids)
- \`validate_plan(tool_calls)\`: Check that all dependencies reference existing tool call ids and there are no cycles. Return {"valid": bool, "errors": list of str}.
- \`topological_sort(tool_calls)\`: Return tool calls in a valid execution order (dependencies before dependents). Raise ValueError if a cycle exists.
- \`get_parallel_groups(tool_calls)\`: Group tool calls into layers that can execute in parallel. Layer 0 has no dependencies. Layer 1 depends only on layer 0. Etc.

\`\`\`python
>>> calls = [
...     ToolCall("search", "web_search", {"query": "AI news"}, []),
...     ToolCall("summarize", "llm", {"text": "$search.result"}, ["search"]),
...     ToolCall("translate", "llm", {"text": "$summarize.result"}, ["summarize"]),
... ]
>>> order = topological_sort(calls)
>>> [c.id for c in order]
["search", "summarize", "translate"]
>>> groups = get_parallel_groups(calls)
>>> [[c.id for c in g] for g in groups]
[["search"], ["summarize"], ["translate"]]
\`\`\``,
    difficulty: "Medium",
    weekNumber: 15,
    tags: '["tool-use", "agents", "planning", "dag", "topological-sort"]',
    theory: `AI agents accomplish complex tasks by decomposing them into tool calls with dependencies. The planner's job is to determine the correct execution order and identify parallelism opportunities.

**Dependency graphs:** Tool calls form a directed acyclic graph (DAG). Each tool call is a node. An edge from A to B means B depends on A's output. The graph must be acyclic - circular dependencies are unresolvable.

**Topological sorting** produces a linear ordering where every dependency comes before the dependent. Kahn's algorithm: start with nodes that have no incoming edges (no dependencies), add them to the result, remove their outgoing edges, repeat. If the result doesn't include all nodes, the graph has a cycle.

**Parallel execution:** Independent tool calls (no dependency between them) can run in parallel. Group calls into layers: layer 0 has zero dependencies, layer 1 depends only on layer 0, etc. Each layer can execute in parallel, and layers execute sequentially.

**Real-world agents:** LangChain, AutoGPT, and Claude's tool use all face this planning problem. The agent generates a plan (list of tool calls with dependencies), the planner validates and orders them, and the executor runs them with actual tool implementations.`,
    hints: '["Build an adjacency list and in-degree count from the depends_on fields", "Kahn algorithm: start with zero in-degree nodes, BFS through the graph", "If final sorted list length != number of tool calls, there is a cycle", "For parallel groups, track the layer of each node = 1 + max layer of dependencies"]',
    visualizationComponent: "ToolUsePlannerViz",
    sortOrder: 4,
    starterCode: `class ToolCall:
    def __init__(self, id, tool, args, depends_on=None):
        self.id = id
        self.tool = tool
        self.args = args
        self.depends_on = depends_on or []

def validate_plan(tool_calls):
    """
    Validate a plan of tool calls.

    Args:
        tool_calls: list of ToolCall

    Returns:
        dict: {"valid": bool, "errors": list of str}
    """
    pass

def topological_sort(tool_calls):
    """
    Sort tool calls in dependency order.

    Args:
        tool_calls: list of ToolCall

    Returns:
        list of ToolCall in valid execution order

    Raises:
        ValueError: if dependency cycle detected
    """
    pass

def get_parallel_groups(tool_calls):
    """
    Group tool calls into parallel execution layers.

    Args:
        tool_calls: list of ToolCall

    Returns:
        list of lists of ToolCall: each inner list can execute in parallel
    """
    pass`,
    solution: `\`\`\`python
from collections import deque

class ToolCall:
    def __init__(self, id, tool, args, depends_on=None):
        self.id = id
        self.tool = tool
        self.args = args
        self.depends_on = depends_on or []

def validate_plan(tool_calls):
    errors = []
    ids = {tc.id for tc in tool_calls}

    for tc in tool_calls:
        for dep in tc.depends_on:
            if dep not in ids:
                errors.append(f"Tool call '{tc.id}' depends on unknown id '{dep}'")

    # Check for cycles via topological sort
    try:
        topological_sort(tool_calls)
    except ValueError as e:
        errors.append(str(e))

    return {"valid": len(errors) == 0, "errors": errors}

def topological_sort(tool_calls):
    id_to_tc = {tc.id: tc for tc in tool_calls}
    in_degree = {tc.id: 0 for tc in tool_calls}
    dependents = {tc.id: [] for tc in tool_calls}

    for tc in tool_calls:
        for dep in tc.depends_on:
            if dep in id_to_tc:
                dependents[dep].append(tc.id)
                in_degree[tc.id] += 1

    queue = deque([tid for tid, deg in in_degree.items() if deg == 0])
    result = []

    while queue:
        tid = queue.popleft()
        result.append(id_to_tc[tid])
        for dep_id in dependents[tid]:
            in_degree[dep_id] -= 1
            if in_degree[dep_id] == 0:
                queue.append(dep_id)

    if len(result) != len(tool_calls):
        raise ValueError("Dependency cycle detected in tool call plan")

    return result

def get_parallel_groups(tool_calls):
    sorted_calls = topological_sort(tool_calls)
    id_to_layer = {}

    for tc in sorted_calls:
        if not tc.depends_on:
            id_to_layer[tc.id] = 0
        else:
            id_to_layer[tc.id] = 1 + max(id_to_layer.get(dep, 0) for dep in tc.depends_on)

    max_layer = max(id_to_layer.values()) if id_to_layer else 0
    groups = [[] for _ in range(max_layer + 1)]
    for tc in sorted_calls:
        groups[id_to_layer[tc.id]].append(tc)

    return groups
\`\`\`

**Approach:** Validation checks that all dependency IDs exist and there are no cycles. Topological sort uses Kahn's algorithm (BFS from zero in-degree nodes). Parallel groups assign each node to a layer based on the maximum layer of its dependencies + 1.`,
    testCases: [
      {
        id: "t1",
        name: "Linear chain sorts correctly",
        inputs: { chain: ["a", "b", "c"] },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Parallel independent calls in same group",
        inputs: { independent: ["a", "b", "c"] },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Cycle detected raises error",
        inputs: { cycle: ["a->b", "b->a"] },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Diamond dependency produces correct layers",
        inputs: { diamond: true },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "mixture-of-experts",
    type: "coding",
    title: "Mixture of Experts Gating Network",
    description: `Implement a Mixture of Experts (MoE) layer with a top-k gating network that routes each input to a subset of experts.

MoE uses a gating network to select which experts process each input. This enables scaling model capacity without proportionally scaling compute - only k out of N experts are activated per input.

Implement:
1. **gating_network(x, W_gate):** Compute gating scores = softmax(x @ W_gate). Return scores of shape (batch, num_experts).
2. **top_k_gating(scores, k):** Select top-k experts per input. Return (top_k_indices, top_k_weights) where weights are renormalized to sum to 1.
3. **moe_forward(x, W_gate, expert_fns, k):** Full MoE forward pass: compute gating, select top-k experts, run selected experts, combine outputs using gating weights.
4. **load_balance_loss(gating_scores, top_k_indices):** Compute auxiliary loss that encourages equal expert utilization. $\\mathcal{L}_{\\text{bal}} = N \\cdot \\sum_i f_i \\cdot P_i$ where $f_i$ = fraction of inputs routed to expert $i$ and $P_i$ = mean gating probability for expert $i$.

\`\`\`python
>>> import numpy as np
>>> x = np.random.randn(4, 32)  # batch of 4, dim 32
>>> W_gate = np.random.randn(32, 8)  # 8 experts
>>> scores = gating_network(x, W_gate)
>>> scores.shape
(4, 8)
>>> idx, weights = top_k_gating(scores, k=2)
>>> idx.shape
(4, 2)
\`\`\``,
    difficulty: "Hard",
    weekNumber: 15,
    tags: '["mixture-of-experts", "moe", "gating", "scaling", "sparse-models"]',
    theory: `Mixture of Experts enables scaling model parameters without scaling compute. A 1T parameter MoE model with top-2 gating over 64 experts uses roughly the same FLOPs as a 30B dense model, while having 30x more parameters available for knowledge storage.

**Gating network:** A simple linear layer (plus softmax) that maps each input to a probability distribution over experts. The top-k experts with highest probability are selected. The gating network learns which expert is best for which type of input.

**Top-k routing:** Only $k$ experts are activated per input (typically $k=1$ or $k=2$). The selected experts' outputs are weighted by their gating probabilities (renormalized to sum to 1). This sparsity is what makes MoE efficient: most experts are idle for any given input.

**Load balancing:** Without regularization, the gating network often collapses: it routes all inputs to 1-2 "favorite" experts while others are never used. The auxiliary load balance loss penalizes uneven routing. It encourages each expert to receive roughly an equal share of inputs.

**Switch Transformer and beyond:** Google's Switch Transformer (2021) used top-1 routing. Mixtral (2024) uses top-2 from 8 experts per layer. DeepSeek-V2 uses a more sophisticated auxiliary-loss-free load balancing strategy. MoE has become the standard architecture for frontier models.`,
    hints: '["Softmax with stability: exp(x - max(x)) / sum(exp(x - max(x)))", "np.argsort(-scores) to get indices sorted by descending score", "Renormalize top-k weights: weights / weights.sum(axis=-1, keepdims=True)", "Load balance: f_i = count of inputs routed to expert i / total inputs"]',
    visualizationComponent: "MixtureOfExpertsViz",
    sortOrder: 8,
    starterCode: `import numpy as np

def gating_network(x, W_gate):
    """
    Compute gating scores.

    Args:
        x: np.array (batch, input_dim)
        W_gate: np.array (input_dim, num_experts)

    Returns:
        np.array (batch, num_experts): softmax probabilities
    """
    pass

def top_k_gating(scores, k):
    """
    Select top-k experts per input.

    Args:
        scores: np.array (batch, num_experts)
        k: int

    Returns:
        tuple: (top_k_indices: np.array (batch, k),
                top_k_weights: np.array (batch, k) - renormalized)
    """
    pass

def moe_forward(x, W_gate, expert_fns, k):
    """
    Full MoE forward pass.

    Args:
        x: np.array (batch, input_dim)
        W_gate: np.array (input_dim, num_experts)
        expert_fns: list of callables, each takes (batch, input_dim) -> (batch, output_dim)
        k: int, number of experts per input

    Returns:
        np.array (batch, output_dim): weighted combination of expert outputs
    """
    pass

def load_balance_loss(gating_scores, top_k_indices):
    """
    Auxiliary loss for load balancing.

    Args:
        gating_scores: np.array (batch, num_experts)
        top_k_indices: np.array (batch, k)

    Returns:
        float: load balance loss
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def gating_network(x, W_gate):
    logits = x @ W_gate
    logits_stable = logits - np.max(logits, axis=-1, keepdims=True)
    exp_logits = np.exp(logits_stable)
    return exp_logits / np.sum(exp_logits, axis=-1, keepdims=True)

def top_k_gating(scores, k):
    batch_size = scores.shape[0]
    top_k_indices = np.argsort(-scores, axis=-1)[:, :k]

    top_k_weights = np.zeros((batch_size, k))
    for i in range(batch_size):
        top_k_weights[i] = scores[i, top_k_indices[i]]

    # Renormalize weights to sum to 1
    weight_sums = top_k_weights.sum(axis=-1, keepdims=True)
    top_k_weights = top_k_weights / weight_sums

    return top_k_indices, top_k_weights

def moe_forward(x, W_gate, expert_fns, k):
    scores = gating_network(x, W_gate)
    top_k_idx, top_k_w = top_k_gating(scores, k)

    batch_size = x.shape[0]
    # Compute all expert outputs (in practice, only compute selected ones)
    expert_outputs = [fn(x) for fn in expert_fns]
    output_dim = expert_outputs[0].shape[-1]

    result = np.zeros((batch_size, output_dim))
    for i in range(batch_size):
        for j in range(k):
            expert_idx = top_k_idx[i, j]
            weight = top_k_w[i, j]
            result[i] += weight * expert_outputs[expert_idx][i]

    return result

def load_balance_loss(gating_scores, top_k_indices):
    batch_size, num_experts = gating_scores.shape
    k = top_k_indices.shape[1]

    # f_i: fraction of inputs routed to expert i
    expert_counts = np.zeros(num_experts)
    for i in range(batch_size):
        for j in range(k):
            expert_counts[top_k_indices[i, j]] += 1
    f = expert_counts / (batch_size * k)

    # P_i: mean gating probability for expert i
    P = np.mean(gating_scores, axis=0)

    return num_experts * np.sum(f * P)
\`\`\`

**Approach:** Gating computes softmax over expert logits. Top-k selects the highest-scored experts and renormalizes their weights. The forward pass routes each input through its selected experts and combines outputs. Load balance loss penalizes routing imbalance using the product of routing frequency and mean gating probability.`,
    testCases: [
      {
        id: "t1",
        name: "Gating scores sum to 1 per input",
        inputs: { batch: 4, dim: 16, num_experts: 8 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Top-k selects correct number of experts",
        inputs: { batch: 4, num_experts: 8, k: 2 },
        isPublic: true,
      },
      {
        id: "t3",
        name: "MoE output shape matches expert output shape",
        inputs: { batch: 4, dim: 16, num_experts: 4, k: 2, out_dim: 32 },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Balanced routing gives low load balance loss",
        inputs: { batch: 100, num_experts: 4, k: 1, balanced: true },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "self-improving-agent-design",
    type: "system_design",
    title: "Design a Self-Improving AI Agent System",
    description:
      "Design an AI agent system that improves its own performance over time through self-evaluation, experience replay, and prompt/strategy refinement.",
    difficulty: "Hard",
    weekNumber: 15,
    tags: '["agents", "self-improvement", "meta-learning", "system-design"]',
    theory: `Self-improving AI agents learn from their own successes and failures to get better at their tasks over time. This goes beyond simple fine-tuning: the agent actively analyzes what worked, what did not, and adjusts its strategies.

**Experience replay:** Store (task, actions, outcome) tuples. Periodically review successes to extract effective patterns and failures to identify common mistakes. This is analogous to experience replay in reinforcement learning, but applied to prompt strategies and tool use patterns.

**Self-evaluation:** The agent evaluates its own outputs using rubrics, success criteria, or by comparing against gold standards. This evaluation drives the improvement loop: low-scoring outputs trigger strategy adjustment.

**Prompt refinement:** Instead of manual prompt engineering, the agent proposes prompt modifications, tests them on a held-out set, and adopts improvements. This is automated prompt optimization with the agent in the loop.

**Safety considerations:** A self-improving system must have guardrails. Performance should improve monotonically on a validation set. Rollback mechanisms revert changes that degrade performance. Human oversight at regular checkpoints prevents drift toward undesirable behavior.`,
    hints: '["Think about what data the agent collects about its own performance", "Consider how the agent decides when and how to modify its strategies", "Address safety: how do you prevent the agent from improving in harmful directions", "Include a mechanism for human oversight and intervention"]',
    visualizationComponent: "SelfImprovingAgentViz",
    sortOrder: 9,
    starterCode: null,
    testCases: null,
    questions: null,
    designPrompt: `Design a self-improving AI agent system for a customer support application. The agent handles user queries, uses tools (knowledge base search, ticket creation, escalation), and should improve its resolution rate over time.

Requirements:
- The agent must improve its success rate (query resolved without escalation) over time
- Improvement must be measurable and verifiable on held-out evaluation sets
- The system must include safety guardrails preventing degradation
- Human oversight must be built into the improvement loop
- The system must handle at least 1000 queries/day

Your design should address:

1. **Experience Collection:** What data do you collect from each interaction? How is success/failure determined?

2. **Self-Evaluation:** How does the agent assess its own performance? What metrics and evaluation criteria?

3. **Improvement Mechanisms:** How does the agent modify its behavior? Prompt refinement, strategy selection, tool use optimization?

4. **Validation & Safety:** How do you ensure improvements are real and safe? What prevents regression?

5. **Human Oversight:** When and how do humans review the agent's self-modifications?

6. **Architecture:** What are the system components and how do they interact?`,
    sampleAnswer: `## Architecture

\`\`\`
User Query -> Agent (prompt + tools) -> Response -> Outcome Tracker
                |                                        |
                |                                        v
                +--- Strategy DB <--- Improvement Engine <--- Experience Store
                                           |
                                           v
                                     Validation Gate -> Human Review (periodic)
\`\`\`

## Experience Collection

**Per-interaction data:**
- Query text, category, complexity estimate
- Agent's reasoning trace (chain-of-thought)
- Tools used and their outputs
- Response delivered to user
- Resolution outcome: resolved (user confirmed), escalated, abandoned, reopened
- User satisfaction signal (thumbs up/down, CSAT score)
- Time to resolution

**Storage:** Append-only event store. Each interaction gets a unique ID. Outcomes may arrive asynchronously (user confirms resolution hours later). Events are immutable; late-arriving signals are added as new events referencing the interaction ID.

**Labeling:** Resolution is the primary success metric. A query is "resolved" if: the user confirms resolution, the user does not reopen within 24h, or the user's follow-up is on a different topic. "Failed" if: escalated to human agent, user explicitly reports dissatisfaction, or the same issue is reopened.

## Self-Evaluation

**Automated evaluation on every interaction:**
- Response relevance: Does the response address the user's question? (LLM judge scores 1-5)
- Factual accuracy: Is the response consistent with knowledge base articles? (retrieval + comparison)
- Completeness: Did the agent address all parts of a multi-part question?
- Tone appropriateness: Professional, empathetic, matches brand voice? (classifier)

**Aggregate metrics (computed daily):**
- Resolution rate: resolved / total interactions
- Escalation rate: escalated / total
- Mean satisfaction score
- First-contact resolution rate
- Per-category breakdown of all metrics

**Regression detection:** Compare current week's metrics against 4-week rolling average. Flag any metric that drops by >2 standard deviations.

## Improvement Mechanisms

**1. Prompt refinement (weekly cycle):**
- Analyze the 50 lowest-scoring interactions from the past week
- Cluster failures by cause: wrong information, missed context, wrong tool, poor tone
- For each failure cluster, generate 3 prompt modification candidates using an LLM: "Given these failure examples, propose a system prompt change that would prevent this failure type"
- Test each candidate on a held-out evaluation set of 200 queries
- Adopt the candidate that improves resolution rate without degrading other metrics

**2. Strategy selection (per-query):**
- Maintain a library of strategies: direct answer, step-by-step walkthrough, ask clarifying question, search knowledge base, escalate
- For each incoming query, the agent selects a strategy based on query category and historical success rates for that category
- Use Thompson sampling: maintain a Beta distribution for each (category, strategy) pair. Sample from each and pick the highest. Update based on outcome.

**3. Tool use optimization (continuous):**
- Track which tool sequences lead to resolution vs. escalation
- Prune tool sequences that consistently fail (e.g., searching a deprecated KB section)
- Promote tool sequences that resolve novel query types
- Update the agent's tool-use instructions monthly based on this data

**4. Few-shot example selection (weekly):**
- Maintain a pool of 500+ resolved interactions as potential few-shot examples
- Select 5-10 examples for the prompt based on diversity and outcome quality
- Rotate examples weekly, preferring recent high-scoring resolutions
- A/B test new example sets against the current set

## Validation & Safety

**Validation gate (before any change is deployed):**
1. Run candidate change on held-out eval set (200 labeled queries, refreshed monthly)
2. Resolution rate must not decrease (95% confidence interval)
3. Satisfaction score must not decrease
4. No increase in harmful/inappropriate responses (safety classifier check)
5. Latency must not increase >20%

**Rollback mechanism:**
- Every deployed change is versioned
- If production metrics degrade within 48h of a change, auto-rollback to previous version
- Alert the engineering team for manual investigation

**Safety guardrails:**
- Prompt modifications cannot remove safety instructions (enforced by template structure: safety section is immutable, strategy section is modifiable)
- Self-generated prompt changes are reviewed by a safety classifier before deployment
- Maximum change velocity: at most 1 prompt change per week, at most 3 strategy updates per day

## Human Oversight

**Automatic human review triggers:**
- Weekly: human reviewer samples 20 interactions and scores them. Compares agent self-evaluation to human evaluation. If correlation drops below 0.7, flag for investigation.
- On prompt change: human reviews proposed changes before deployment (can be async - change waits in queue for 24h for review)
- On anomaly: if any metric drops >10% in a day, freeze all improvements and page on-call

**Monthly review:**
- Engineering team reviews improvement trajectory (is the agent actually getting better?)
- Reviews failure clusters (are there recurring problems the agent cannot fix?)
- Adjusts improvement parameters (evaluation criteria, safety thresholds, change velocity)
- Decides whether to expand agent's scope (new query categories) or add new tools

## System Components

1. **Agent runtime:** Serves queries, executes tool calls, generates responses. Stateless per-request. Reads current prompt and strategy from config.
2. **Experience store:** Append-only event database (Postgres + event sourcing). Stores all interaction data.
3. **Evaluation service:** Scores interactions on multiple dimensions. Runs as async workers on a queue.
4. **Improvement engine:** Weekly batch job. Analyzes failures, generates candidates, runs validation.
5. **Strategy DB:** Stores (category, strategy) success statistics for Thompson sampling. Updated in real-time.
6. **Validation gate:** Runs eval suite on proposed changes. Approves or rejects.
7. **Dashboard:** Visualizes metrics, improvement trajectory, failure clusters. Alerts on anomalies.`,
    rubric: [
      {
        criterion: "Experience & Evaluation",
        weight: 0.25,
        description: "How the agent collects and evaluates its own performance",
        keyPoints: [
          "Comprehensive interaction logging",
          "Multi-dimensional evaluation criteria",
          "Clear success/failure definitions",
        ],
      },
      {
        criterion: "Improvement Mechanisms",
        weight: 0.3,
        description: "Concrete methods for the agent to improve its behavior",
        keyPoints: [
          "Prompt refinement process",
          "Strategy selection/optimization",
          "Evidence-based changes",
        ],
      },
      {
        criterion: "Safety & Validation",
        weight: 0.25,
        description: "Guardrails preventing degradation and harmful drift",
        keyPoints: [
          "Held-out validation set",
          "Rollback mechanism",
          "Change velocity limits",
          "Safety classifier checks",
        ],
      },
      {
        criterion: "Human Oversight",
        weight: 0.2,
        description: "How humans stay in the loop of the improvement process",
        keyPoints: [
          "Regular review cadence",
          "Anomaly-triggered intervention",
          "Approval workflow for changes",
        ],
      },
    ],
  },
  {
    id: "constitutional-ai-filter",
    type: "coding",
    title: "Constitutional AI Filter",
    description: `Implement a principle-based response filter inspired by Constitutional AI.

Constitutional AI evaluates and revises LLM responses against a set of principles. The filter checks each response against principles, identifies violations, and rewrites the response to fix them.

Implement:
- \`Principle\`: A class with \`name\` (str), \`description\` (str), and \`check_fn\` (callable that takes text and returns (passes: bool, violation: str or None))
- \`evaluate_response(response, principles)\`: Check a response against all principles. Return list of {"principle": str, "passes": bool, "violation": str or None}.
- \`revise_response(response, violations, revise_fn)\`: Given a response and list of violations, use revise_fn to generate a revised response. revise_fn takes (response, violations) and returns revised text.
- \`constitutional_filter(response, principles, revise_fn, max_revisions=3)\`: Iteratively evaluate and revise until all principles pass or max_revisions reached. Return {"final_response": str, "revisions": int, "all_passed": bool, "evaluation_history": list}.

\`\`\`python
>>> p1 = Principle("no_harm", "Response must not contain harmful instructions",
...     lambda t: ("build a bomb" not in t.lower(), "Contains harmful instructions" if "build a bomb" in t.lower() else None))
>>> result = constitutional_filter("Here is how to build a bomb...", [p1], revise_fn)
>>> result["all_passed"]  # after revision removed harmful content
True
\`\`\``,
    difficulty: "Medium",
    weekNumber: 15,
    tags: '["constitutional-ai", "safety", "alignment", "content-filtering"]',
    theory: `Constitutional AI (Anthropic, 2022) trains models to follow principles by having them critique and revise their own outputs. The approach has two phases: supervised learning on self-revised outputs, and reinforcement learning from AI feedback (RLAI).

**The critique-revise loop:** Given a response, an LLM evaluates it against each principle: "Does this response respect the principle that...?" If any principle is violated, the LLM rewrites the response to fix the violation. This process repeats until all principles are satisfied.

**Principles as specifications:** Instead of training on examples of good/bad behavior (which cannot cover all cases), principles define behavioral rules at a high level: "Be helpful but refuse to assist with harmful activities." "Acknowledge uncertainty rather than making up facts." "Respect user privacy." The model applies these general principles to specific situations.

**Iterative refinement:** A single revision may fix one violation but introduce another (making the response safer but less helpful). Iteration handles this: each round addresses remaining violations. A maximum revision count prevents infinite loops on irreconcilable principles.

**In production:** You don't need to retrain the model. A simpler implementation runs the critique-revise loop at inference time using the same or a smaller model. The principles become part of the system prompt. The cost is higher latency (multiple LLM calls per response) but the safety improvement is significant.`,
    hints: '["Principle is a simple class with name, description, and a check function", "evaluate_response iterates principles and calls each check_fn", "constitutional_filter loops: evaluate -> if violations, revise -> re-evaluate -> until clean or max_revisions", "Track evaluation history for debugging and transparency"]',
    visualizationComponent: "ConstitutionalAIViz",
    sortOrder: 10,
    starterCode: `class Principle:
    def __init__(self, name, description, check_fn):
        """
        Args:
            name: str
            description: str
            check_fn: callable, takes str -> (bool, str|None)
        """
        self.name = name
        self.description = description
        self.check_fn = check_fn

def evaluate_response(response, principles):
    """
    Evaluate a response against all principles.

    Args:
        response: str
        principles: list of Principle

    Returns:
        list of {"principle": str, "passes": bool, "violation": str|None}
    """
    pass

def revise_response(response, violations, revise_fn):
    """
    Revise a response to fix violations.

    Args:
        response: str
        violations: list of str (violation descriptions)
        revise_fn: callable (response, violations) -> revised_response

    Returns:
        str: revised response
    """
    pass

def constitutional_filter(response, principles, revise_fn, max_revisions=3):
    """
    Iteratively evaluate and revise until all principles pass.

    Args:
        response: str
        principles: list of Principle
        revise_fn: callable (response, violations) -> revised_response
        max_revisions: int

    Returns:
        dict: {
            "final_response": str,
            "revisions": int,
            "all_passed": bool,
            "evaluation_history": list of evaluation results
        }
    """
    pass`,
    solution: `\`\`\`python
class Principle:
    def __init__(self, name, description, check_fn):
        self.name = name
        self.description = description
        self.check_fn = check_fn

def evaluate_response(response, principles):
    results = []
    for p in principles:
        passes, violation = p.check_fn(response)
        results.append({
            "principle": p.name,
            "passes": passes,
            "violation": violation,
        })
    return results

def revise_response(response, violations, revise_fn):
    return revise_fn(response, violations)

def constitutional_filter(response, principles, revise_fn, max_revisions=3):
    current_response = response
    evaluation_history = []
    revisions = 0

    for _ in range(max_revisions + 1):
        evaluation = evaluate_response(current_response, principles)
        evaluation_history.append(evaluation)

        violations = [e["violation"] for e in evaluation if not e["passes"] and e["violation"]]

        if not violations:
            return {
                "final_response": current_response,
                "revisions": revisions,
                "all_passed": True,
                "evaluation_history": evaluation_history,
            }

        if revisions >= max_revisions:
            break

        current_response = revise_response(current_response, violations, revise_fn)
        revisions += 1

    return {
        "final_response": current_response,
        "revisions": revisions,
        "all_passed": False,
        "evaluation_history": evaluation_history,
    }
\`\`\`

**Approach:** evaluate_response runs each principle's check function. The constitutional_filter loops: evaluate, collect violations, revise if any, re-evaluate. Stops when all principles pass or max revisions are reached. History tracking enables debugging and transparency.`,
    testCases: [
      {
        id: "t1",
        name: "Clean response passes immediately with 0 revisions",
        inputs: { response: "Hello, how can I help?", num_principles: 2 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Violation triggers revision",
        inputs: { response: "harmful content here", has_violation: true },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Max revisions respected",
        inputs: { response: "always bad", max_revisions: 3, never_passes: true },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Evaluation history tracks all rounds",
        inputs: { response: "needs two rounds", num_revisions_needed: 2 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  // ========== WEEK 13 ADDITIONS: Multimodal (Audio + VLM) ==========
  {
    id: "whisper-mel-spectrogram",
    type: "coding",
    title: "Whisper Audio Preprocessing: Log Mel Spectrogram",
    description: `Implement the audio preprocessing pipeline that Whisper uses before feeding audio to its encoder.

Raw audio waveforms are converted to log mel spectrograms. Implement the pipeline:

1. **STFT:** Apply a short-time Fourier transform with a Hann window to get frequency magnitudes over time.
2. **Mel filterbank:** Multiply the power spectrogram by a mel filterbank matrix to get mel-scale energy.
3. **Log compression:** Apply \`log10(max(mel_spec, 1e-10))\`.
4. **Normalize:** Clamp values to \`[log10(1e-10), max_value]\`, then scale to \`[-1, 1]\` using \`(x - max_value/2) / (max_value/2)\`.

Implement the helper functions and the full pipeline.

**Parameters (Whisper defaults):**
- \`n_fft=400\`, \`hop_length=160\`, \`n_mels=80\`
- Sample rate: 16000 Hz
- Target: 30-second clips = 3000 frames

**Example:**
\`\`\`python
>>> audio = np.zeros(16000)  # 1 second of silence
>>> spec = log_mel_spectrogram(audio, n_fft=400, hop_length=160, n_mels=80)
>>> spec.shape
(80, 101)  # (n_mels, frames)
\`\`\``,
    difficulty: "Medium",
    weekNumber: 13,
    tags: '["whisper", "audio", "mel-spectrogram", "multimodal", "preprocessing"]',
    theory: `Whisper (Radford et al. 2022) is an encoder-decoder transformer trained on 680k hours of speech. The encoder processes log mel spectrograms; the decoder generates text tokens.

**Why mel scale?** Human hearing is logarithmic in frequency. The mel scale compresses high frequencies (where humans have less resolution) and expands low frequencies (where speech information lives). This matches the audio representation to human perceptual space.

**STFT:** Breaks the waveform into overlapping frames, applies FFT to each. With n_fft=400 and hop_length=160 at 16kHz, each frame is 25ms and frames advance every 10ms. This gives 100 frames per second.

**Mel filterbank:** A matrix of triangular filters spaced on the mel scale. Multiplying the power spectrum by this matrix projects ~200 FFT bins down to 80 mel bins.

**Log compression:** Audio energy spans many orders of magnitude. Log compression maps this to a manageable range. Whisper's normalization maps the result to [-1, 1] with typical speech values near 0.

**Whisper architecture:** 80-channel mel spectrogram -> 2-layer CNN -> transformer encoder (6 to 32 layers depending on model size) -> cross-attention to decoder -> text tokens.`,
    hints: '["Use np.hanning(n_fft) as the window", "STFT: stride through audio with hop_length, apply window, FFT, take magnitude squared", "Mel filterbank: use librosa-style triangular filters or a provided matrix", "Log: np.log10(np.maximum(mel, 1e-10))", "Normalize: clamp then (x - max/2) / (max/2)"]',
    visualizationComponent: null,
    sortOrder: 11,
    starterCode: `import numpy as np

def stft_magnitude(audio, n_fft, hop_length):
    """
    Compute STFT magnitude spectrogram.

    Args:
        audio: 1D numpy array of audio samples
        n_fft: FFT window size
        hop_length: hop between frames

    Returns:
        np.array of shape (n_fft//2 + 1, num_frames): magnitude spectrogram
    """
    pass

def apply_mel_filterbank(magnitude, n_mels, sample_rate, n_fft):
    """
    Apply triangular mel filterbank to magnitude spectrogram.

    Args:
        magnitude: shape (n_fft//2 + 1, num_frames)
        n_mels: number of mel bins
        sample_rate: audio sample rate
        n_fft: FFT size

    Returns:
        np.array of shape (n_mels, num_frames)
    """
    pass

def log_mel_spectrogram(audio, n_fft=400, hop_length=160, n_mels=80, sample_rate=16000):
    """
    Full Whisper-style log mel spectrogram.

    Returns:
        np.array of shape (n_mels, num_frames) with values in [-1, 1]
    """
    pass`,
    solution: `\`\`\`python
import numpy as np

def stft_magnitude(audio, n_fft, hop_length):
    window = np.hanning(n_fft)
    frames = []
    for i in range(0, len(audio) - n_fft + 1, hop_length):
        frame = audio[i:i + n_fft] * window
        frames.append(np.abs(np.fft.rfft(frame)))
    return np.array(frames).T  # (n_fft//2+1, num_frames)

def hz_to_mel(hz):
    return 2595 * np.log10(1 + hz / 700)

def mel_to_hz(mel):
    return 700 * (10 ** (mel / 2595) - 1)

def apply_mel_filterbank(magnitude, n_mels, sample_rate, n_fft):
    mel_min = hz_to_mel(0)
    mel_max = hz_to_mel(sample_rate / 2)
    mel_points = np.linspace(mel_min, mel_max, n_mels + 2)
    hz_points = mel_to_hz(mel_points)
    bin_points = np.floor((n_fft + 1) * hz_points / sample_rate).astype(int)

    filterbank = np.zeros((n_mels, n_fft // 2 + 1))
    for m in range(1, n_mels + 1):
        f_left, f_center, f_right = bin_points[m-1], bin_points[m], bin_points[m+1]
        for k in range(f_left, f_center):
            filterbank[m-1, k] = (k - f_left) / (f_center - f_left + 1e-8)
        for k in range(f_center, f_right):
            filterbank[m-1, k] = (f_right - k) / (f_right - f_center + 1e-8)

    return filterbank @ magnitude  # (n_mels, num_frames)

def log_mel_spectrogram(audio, n_fft=400, hop_length=160, n_mels=80, sample_rate=16000):
    magnitude = stft_magnitude(audio, n_fft, hop_length)
    mel = apply_mel_filterbank(magnitude ** 2, n_mels, sample_rate, n_fft)
    log_mel = np.log10(np.maximum(mel, 1e-10))
    max_val = log_mel.max()
    log_mel = np.maximum(log_mel, max_val - 8.0)
    log_mel = (log_mel + 4.0) / 4.0
    return log_mel
\`\`\`

**Approach:** STFT slices audio into overlapping windowed frames and applies FFT to each. The mel filterbank matrix projects FFT bins to mel-scaled bins using triangular filters. Log compression followed by Whisper's clamping and scaling maps the result to [-1, 1].`,
    testCases: [
      {
        id: "t1",
        name: "Output shape for 1 second of audio",
        inputs: { audio_length: 16000, n_fft: 400, hop_length: 160, n_mels: 80 },
        isPublic: true,
      },
      {
        id: "t2",
        name: "Values are in [-1, 1] range",
        inputs: { audio_type: "random", n_fft: 400, hop_length: 160, n_mels: 80 },
        isPublic: true,
      },
      {
        id: "t3",
        name: "Silence produces low mel energy",
        inputs: { audio_type: "silence", n_fft: 400, hop_length: 160, n_mels: 80 },
        isPublic: false,
      },
      {
        id: "t4",
        name: "Pure tone concentrates energy in correct mel bin",
        inputs: { audio_type: "sine_440hz", sample_rate: 16000 },
        isPublic: false,
      },
    ],
    questions: null,
    designPrompt: null,
    sampleAnswer: null,
    rubric: null,
  },
  {
    id: "llava-vlm-design",
    type: "system_design",
    title: "Design a Vision-Language Model (LLaVA-style)",
    description:
      "Design a vision-language model that accepts image and text inputs and generates text responses. Your design should cover the vision encoder, the projection layer connecting vision to language, training stages, and inference.",
    difficulty: "Hard",
    weekNumber: 13,
    tags: '["vlm", "llava", "multimodal", "vision-encoder", "system-design"]',
    theory: `LLaVA (Large Language and Vision Assistant, Liu et al. 2023) is the canonical open-source VLM. It connects a frozen CLIP vision encoder to a language model via a simple projection layer.

**Architecture:**
1. **Vision encoder:** CLIP ViT-L/14 splits images into 14x14 patches, producing 256 visual tokens of dimension 1024.
2. **Projection:** A linear layer (or 2-layer MLP in LLaVA-1.5) maps visual tokens from vision dimension to LLM dimension. This is the only new component trained from scratch.
3. **LLM:** LLaMA or Vicuna receives the projected visual tokens concatenated with text tokens and autoregressively generates the response.

**Two-stage training:**
- Stage 1 (feature alignment): Freeze both encoder and LLM. Train only the projection on image-caption pairs (CC3M). Teaches the projection to map vision features into the LLM's embedding space.
- Stage 2 (instruction fine-tuning): Unfreeze the LLM. Train projection + LLM on instruction-following data (GPT-4V generated question-answer pairs). Teaches the model to follow multimodal instructions.

**Key design decisions:** Resolution (336px in LLaVA-1.5 via CLIP ViT-L/14@336), number of visual tokens (256-576), projection type (linear vs MLP), and LLM backbone.`,
    hints: '["Describe the vision encoder (ViT architecture, patch size, pooling strategy)", "Explain the projection layer and why it is needed (dimension mismatch, modality gap)", "Detail both training stages and what is frozen vs. trainable in each", "Address inference: how are visual tokens positioned relative to text tokens in the prompt?"]',
    visualizationComponent: null,
    sortOrder: 12,
    starterCode: null,
    testCases: null,
    questions: null,
    designPrompt: `Design a vision-language model (VLM) capable of answering questions about images, describing visual content, and following multimodal instructions.

Your design must cover:

1. **Vision Encoder:** Which architecture? ViT vs CNN. Patch size, input resolution, output tokens. Do you freeze it during training? Why does CLIP make a better vision encoder than a supervised ImageNet model for VLMs?

2. **Vision-Language Projection:** What connects the vision encoder to the LLM? Linear projection vs MLP vs cross-attention (as in Flamingo). What does this layer learn? How do you handle dimension mismatch between vision and language embedding spaces?

3. **Language Model Backbone:** What LLM do you use? Does it need to be instruction-tuned before VLM training? How do you interleave visual and text tokens in the sequence?

4. **Training Stage 1 (Alignment):** Data, frozen components, trainable components, loss function, batch size, how many steps. Goal: what should the model be able to do after this stage?

5. **Training Stage 2 (Instruction Fine-tuning):** Data format (system prompt + image + question + answer). What is now unfrozen? How do you generate training data if you lack annotators?

6. **Inference:** How do you format a prompt with an image? Where do visual tokens appear in the sequence? How does the autoregressive LLM attend to visual tokens?

7. **Scaling:** If you want to handle multiple images or video frames, what breaks? How would you extend the architecture?`,
    sampleAnswer: `## Architecture Overview

Three components: frozen CLIP encoder -> trainable projection -> LLM (frozen in stage 1, trained in stage 2).

### Vision Encoder
- **CLIP ViT-L/14@336px:** 336x336 input, 14x14 patches = 576 visual tokens of dimension 1024
- **Why CLIP?** CLIP training aligns image representations to natural language descriptions, so its features already share semantic structure with text. An ImageNet-supervised ViT encodes visual categories, not language-compatible concepts
- **Frozen during both stages:** CLIP's representations are high quality out of the box; retraining risks forgetting the rich visual-semantic alignment

### Projection Layer (LLaVA-1.5 style)
- **2-layer MLP:** Linear(1024, 4096) -> GELU -> Linear(4096, 4096)
- Maps 576 visual tokens from CLIP's 1024-dim space to the LLM's 4096-dim space
- Trainable from scratch - this is what bridges the modality gap
- Why MLP over linear? The MLP allows nonlinear adaptation; empirically +2-3 points on benchmarks

### Language Model
- **Vicuna-13B** (instruction-tuned LLaMA): the instruction tuning means it already follows text instructions, so stage 2 only needs to add visual grounding
- Visual tokens prepended to text tokens: \`[IMG_1]...[IMG_576][user_text_tokens]\`
- Full attention over all tokens - the LLM can attend to any visual token from any text position

### Training Stage 1: Feature Alignment
- **Data:** 595K image-caption pairs from CC3M filtered to 595K high-quality examples
- **Frozen:** CLIP encoder, LLM weights
- **Trainable:** Projection MLP only (~7M parameters)
- **Objective:** Next-token prediction on captions given image
- **Goal:** Projection learns to produce visual tokens that the frozen LLM can interpret as soft visual words

### Training Stage 2: Instruction Fine-tuning
- **Data:** 158K GPT-4V-generated instruction-following examples (LLaVA-Instruct-150K)
  - Generated by feeding image captions + bounding boxes to GPT-4, asking it to create diverse QA pairs
- **Frozen:** CLIP encoder
- **Trainable:** Projection MLP + full LLM
- **Loss:** Cross-entropy only on assistant response tokens (not on image or user turn)
- **Format:** \`<system>\\n<image_tokens><user_question>\\n<assistant>answer\`

### Inference
Visual tokens occupy positions 1-576 in the sequence. The LLM autoregressively generates text tokens at position 577+, attending to all prior positions including visual ones via standard causal attention.

### Scaling to Multiple Images/Video
- 576 tokens per image fills context quickly (at 4096 context, ~7 images max)
- Solutions: dynamic resolution (AnyRes in LLaVA-1.6), token compression (pooling visual tokens), or cross-attention to visual memory (Flamingo-style)`,
    rubric: [
      {
        criterion: "Vision Encoder",
        weight: 0.2,
        description: "Architecture selection and justification for VLM use",
        keyPoints: [
          "Names CLIP/ViT and explains why CLIP beats ImageNet-supervised models",
          "Explains patch tokenization and output token count",
          "Justifies freezing the encoder during training",
        ],
      },
      {
        criterion: "Projection Layer",
        weight: 0.2,
        description: "Modality bridging between vision and language spaces",
        keyPoints: [
          "Describes projection type (linear vs MLP) and its purpose",
          "Explains what the projection learns (modality gap bridging)",
          "Notes dimension mapping from vision to LLM embedding space",
        ],
      },
      {
        criterion: "Two-Stage Training",
        weight: 0.3,
        description: "Alignment pretraining followed by instruction fine-tuning",
        keyPoints: [
          "Stage 1: correct frozen/trainable split (only projection trainable)",
          "Stage 2: correct frozen/trainable split (projection + LLM)",
          "Explains why two stages are needed",
          "Describes data for each stage",
        ],
      },
      {
        criterion: "Inference",
        weight: 0.15,
        description: "Token interleaving and autoregressive generation with visual context",
        keyPoints: [
          "Describes visual token positioning in sequence",
          "Explains attention over visual tokens",
          "Addresses autoregressive generation with visual context",
        ],
      },
      {
        criterion: "Scaling",
        weight: 0.15,
        description: "Handling multiple images or video",
        keyPoints: [
          "Identifies context length as the bottleneck for multi-image/video",
          "Proposes at least one valid solution (token compression, cross-attention, dynamic resolution)",
        ],
      },
    ],
  },
];
