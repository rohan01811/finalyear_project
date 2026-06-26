import numpy as np
import cv2

# -----------------------------------------
# Step 1: Initial Prior Probabilities
# -----------------------------------------

candidate_state = {
    "beginner": 0.33,
    "intermediate": 0.34,
    "advanced": 0.33
}


# -----------------------------------------
# Step 2: Convert Evaluation Score into
# Bayesian Likelihoods
# -----------------------------------------

def score_to_likelihood(score):
    """
    Convert answer score (0-1)
    into likelihood values.
    """

    return {
        "beginner": max(0.01, 1 - score),
        "intermediate": max(0.01, 1 - abs(score - 0.6)),
        "advanced": max(0.01, score)
    }


# -----------------------------------------
# Step 3: Bayesian Update
# Posterior = Prior × Likelihood
# -----------------------------------------

def bayesian_update(prior, likelihood):

    posterior = {}

    total = 0

    for skill in prior:
        posterior[skill] = (
            prior[skill] *
            likelihood[skill]
        )
        total += posterior[skill]

    # Normalize probabilities

    for skill in posterior:
        posterior[skill] /= total

    return posterior


# -----------------------------------------
# Step 4: Select Next Question Difficulty
# -----------------------------------------

def decide_next_difficulty(state):

    if state["advanced"] > 0.60:
        return "hard"

    elif state["intermediate"] > 0.50:
        return "medium"

    return "easy"


# -----------------------------------------
# Step 5: Generate Prompt for LLM
# -----------------------------------------

def generate_next_prompt(state, role, last_answer):

    difficulty = decide_next_difficulty(state)

    prompt = f"""
Role: {role}

Candidate Skill Estimate

Beginner: {state['beginner']:.2f}
Intermediate: {state['intermediate']:.2f}
Advanced: {state['advanced']:.2f}

Previous Candidate Answer:
{last_answer}

Generate ONE {difficulty} level technical interview question.

If the previous answer contained mistakes,
focus on that topic.

Return only the question.
"""

    return prompt



evaluation_scores = [
    0.82,
    0.91,
    0.52,
    0.74
]

state = candidate_state

for i, score in enumerate(evaluation_scores, start=1):

    likelihood = score_to_likelihood(score)

    state = bayesian_update(state, likelihood)

    difficulty = decide_next_difficulty(state)

    print(f"\nQuestion {i}")
    print(f"Answer Score : {score:.2f}")
    print("Updated Skill State :", state)
    print("Next Difficulty :", difficulty)