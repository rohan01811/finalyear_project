# app/services/nlp_utils.py

from transformers import BertTokenizer, BertModel
import torch
import numpy as np
import yake

# Load model once
print("Loading BERT model...")

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

print("BERT loaded.")

def get_embedding(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)

    with torch.no_grad():
        outputs = model(**inputs)

    # CLS token embedding
    return outputs.last_hidden_state[:, 0, :]


def cosine_similarity(vec1, vec2):
    return torch.nn.functional.cosine_similarity(vec1, vec2).item()


def semantic_similarity(text1, text2):
    emb1 = get_embedding(text1)
    emb2 = get_embedding(text2)
    return cosine_similarity(emb1, emb2)


# -------- Keyword Extraction --------

def extract_keywords(text):
    kw_extractor = yake.KeywordExtractor(n=1, top=10)
    keywords = kw_extractor.extract_keywords(text)
    return [kw[0] for kw in keywords]


def keyword_coverage(ans, ideal):
    keywords = extract_keywords(ideal)

    if not keywords:
        return 0.0

    matched = sum(1 for kw in keywords if kw.lower() in ans.lower())
    return matched / len(keywords)


# -------- Coherence --------

def coherence_score(ans):
    sentences = [s.strip() for s in ans.split('.') if s.strip()]

    if len(sentences) < 2:
        return 50

    scores = []

    for i in range(len(sentences) - 1):
        emb1 = get_embedding(sentences[i])
        emb2 = get_embedding(sentences[i + 1])

        score = cosine_similarity(emb1, emb2)
        scores.append(score)

    return np.mean(scores) * 100