import numpy as np
import re
from app.services.bert_service import get_bert_embedding


def keyword_score(answer, ideal):
    answer_words = set(re.findall(r'\w+', answer.lower()))
    ideal_words = set(re.findall(r'\w+', ideal.lower()))

    overlap = answer_words.intersection(ideal_words)
    return len(overlap) / (len(ideal_words) + 1)


def cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2.T) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))


def evaluate_answer(candidate_answer, ideal_answer):
    emb1 = get_bert_embedding(candidate_answer)
    emb2 = get_bert_embedding(ideal_answer)

    semantic_score = cosine_similarity(emb1[0], emb2[0])
    keyword_overlap = keyword_score(candidate_answer, ideal_answer)

    return (0.7 * semantic_score) + (0.3 * keyword_overlap)


def decide_next_difficulty(current, score):
    if score > 0.8:
        return "hard" if current == "medium" else "medium"
    elif score > 0.6:
        return current
    elif score > 0.4:
        return "easy"
    else:
        return "easy"