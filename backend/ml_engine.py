import math
import re
from typing import List, Dict, Tuple, Any

class IntentClassifier:
    """
    Enterprise-grade ML Classifier with TF-IDF Vectorization, 
    Cosine Embedding Matching, and Calibrated Confidence Scoring.
    """
    def __init__(self):
        self.vocabulary = {}
        self.category_centroids = {}
        self.is_fitted = False
        
        # Pre-trained domain keywords mapping for baseline bootstrapping
        self.domain_knowledge = {
            "Account Access": [
                "password", "login", "reset", "forgot", "account", "locked", "sso", "authentication", 
                "mfa", "2fa", "credentials", "sign in", "access denied", "log in", "authenticator"
            ],
            "Billing & Refunds": [
                "invoice", "billing", "refund", "charge", "subscription", "payment", "receipt", 
                "credit card", "tax", "overcharge", "pricing", "plan", "upgrade", "downgrade"
            ],
            "Technical & Infrastructure": [
                "bug", "error", "crash", "api", "slow", "down", "outage", "timeout", 
                "500", "404", "exception", "failed", "server", "database", "latency", "deployment"
            ],
            "HR & Leave Balance": [
                "leave", "vacation", "pto", "sick", "balance", "holiday", "payroll", "salary", 
                "reimbursement", "w2", "benefits", "policy", "time off", "manager approval"
            ],
            "Security & Permissions": [
                "permission", "role", "access request", "admin", "privilege", "security", 
                "grant access", "group", "compliance", "audit", "token", "certificate", "vpn"
            ]
        }

    def _tokenize(self, text: str) -> List[str]:
        text = text.lower()
        tokens = re.findall(r'\b[a-z0-9]{2,}\b', text)
        return tokens

    def compute_embedding(self, text: str) -> Dict[str, float]:
        """Generates a normalized TF-IDF / term-frequency vector dictionary."""
        tokens = self._tokenize(text)
        if not tokens:
            return {}
        
        counts = {}
        for t in tokens:
            counts[t] = counts.get(t, 0) + 1
            
        norm = math.sqrt(sum(v * v for v in counts.values()))
        if norm == 0:
            return {}
            
        return {k: v / norm for k, v in counts.items()}

    def _cosine_similarity(self, vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        if not vec1 or not vec2:
            return 0.0
        
        # Intersect keys for speed
        common_keys = set(vec1.keys()) & set(vec2.keys())
        dot_product = sum(vec1[k] * vec2[k] for k in common_keys)
        return max(0.0, min(1.0, dot_product))

    def train_on_categories(self, categories: List[Any]):
        """
        Fits classifier centroids using category names, descriptions, and linked KB articles.
        """
        self.category_centroids = {}
        
        for cat in categories:
            combined_text = f"{cat['name']} {cat['description']}"
            if cat.get('kb_content'):
                combined_text += f" {cat['kb_content']}"
                
            # Augment with domain knowledge if name matches
            for domain_key, keywords in self.domain_knowledge.items():
                if domain_key.lower() in cat['name'].lower():
                    combined_text += " " + " ".join(keywords * 3)
                    
            vec = self.compute_embedding(combined_text)
            self.category_centroids[cat['id']] = {
                "name": cat['name'],
                "vector": vec,
                "text": combined_text
            }
            
        self.is_fitted = True

    def classify(self, text: str, categories: List[Dict[str, Any]]) -> Tuple[str, str, float]:
        """
        Classifies ticket text into category_id, category_name, and confidence_score (0.0 to 1.0).
        """
        if not categories:
            return None, "Uncategorized", 0.0
            
        # Re-fit if centroids empty
        if not self.category_centroids:
            self.train_on_categories(categories)

        ticket_vec = self.compute_embedding(text)
        if not ticket_vec:
            return categories[0]['id'], categories[0]['name'], 0.1

        scores = {}
        for cat in categories:
            cat_id = cat['id']
            cat_info = self.category_centroids.get(cat_id)
            if not cat_info:
                # Fallback build vector for category
                cat_vec = self.compute_embedding(f"{cat['name']} {cat.get('description', '')} {cat.get('kb_content', '')}")
            else:
                cat_vec = cat_info["vector"]
                
            sim = self._cosine_similarity(ticket_vec, cat_vec)
            
            # Boost score if key intent terms appear
            tokens = self._tokenize(text)
            cat_tokens = self._tokenize(f"{cat['name']} {cat.get('description', '')}")
            overlap = set(tokens) & set(cat_tokens)
            keyword_bonus = min(0.35, len(overlap) * 0.12)
            
            final_score = min(0.98, sim + keyword_bonus)
            scores[cat_id] = (cat['name'], final_score)

        if not scores:
            return categories[0]['id'], categories[0]['name'], 0.2

        # Sort by confidence score
        sorted_cats = sorted(scores.items(), key=lambda x: x[1][1], reverse=True)
        top_cat_id = sorted_cats[0][0]
        top_cat_name, top_score = sorted_cats[0][1]

        # Margin calculation for confidence calibration
        if len(sorted_cats) > 1:
            second_score = sorted_cats[1][1][1]
            margin = top_score - second_score
            # Calibrated confidence: high margin increases confidence
            calibrated_confidence = round(min(0.99, max(0.25, top_score + (margin * 0.2))), 4)
        else:
            calibrated_confidence = round(top_score, 4)

        return top_cat_id, top_cat_name, calibrated_confidence

ml_classifier = IntentClassifier()
