import re

class PIISanitizer:
    def __init__(self):
        self.patterns = {
            "EMAIL": (re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'), "[REDACTED_EMAIL]"),
            "PHONE": (re.compile(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'), "[REDACTED_PHONE]"),
            "CREDIT_CARD": (re.compile(r'\b(?:\d[ -]*?){13,16}\b'), "[REDACTED_CREDIT_CARD]"),
            "SSN": (re.compile(r'\b\d{3}-\d{2}-\d{4}\b'), "[REDACTED_SSN]"),
            "API_KEY": (re.compile(r'\b(sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z-_]{35}|ghp_[A-Za-z0-9]{36})\b'), "[REDACTED_API_KEY]"),
            "IPV4": (re.compile(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'), "[REDACTED_IP]")
        }

    def sanitize(self, text: str):
        if not text:
            return "", False, 0
            
        sanitized_text = text
        total_redactions = 0
        
        for key, (pattern, replacement) in self.patterns.items():
            matches = pattern.findall(sanitized_text)
            if matches:
                total_redactions += len(matches)
                sanitized_text = pattern.sub(replacement, sanitized_text)
                
        has_pii = total_redactions > 0
        return sanitized_text, has_pii, total_redactions

pii_sanitizer = PIISanitizer()
