# backend/app/services/bert_service.py
import torch
import re
from transformers import BertTokenizer, BertModel

bert_tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
bert_model = BertModel.from_pretrained('bert-base-uncased')
bert_model.eval()

print("Loading BERT model...")
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')
model.eval()
print("BERT loaded.")

def get_bert_embedding(text, max_length=256):
    text = re.sub(r'\s+', ' ', text).strip()[:1000]

    inputs = tokenizer(
        text,
        return_tensors='pt',
        truncation=True,
        max_length=max_length,
        padding='max_length'
    )

    with torch.no_grad():
        outputs = model(**inputs)

    return outputs.last_hidden_state.mean(dim=1).numpy()
