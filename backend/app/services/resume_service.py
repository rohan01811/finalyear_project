import re
import fitz # PyMuPDF
from sklearn.metrics.pairwise import cosine_similarity
from ..services.bert_service import get_bert_embedding
from ..constants.skills import COMPREHENSIVE_SKILLS
from ..constants.roles import DOMAIN_SPECIFIC_ROLES


def extract_text_from_pdf(pdf_path):
    """Extract and clean text from PDF"""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        
        text = text.lower()
        text = re.sub(r'[^\w\s\+\#\.\(\)]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    except Exception as e:
        print(f"Error extracting PDF: {str(e)}")
        return ""


def detect_educational_domain(text):
    """Detect educational background - CRITICAL for domain matching"""
    text = text.lower()
    
    domain_patterns = {
        "Mechanical": [
            r'\bmechanical\s+engineering\b', r'\bb\.tech\s+mechanical\b', 
            r'\bbe\s+mechanical\b', r'\bmech\s+engg\b', r'\bdiploma\s+mechanical\b',
            r'\bmechanical\s+engineer\b'
        ],
        "Civil": [
            r'\bcivil\s+engineering\b', r'\bb\.tech\s+civil\b', r'\bbe\s+civil\b',
            r'\bdiploma\s+civil\b', r'\bcivil\s+engineer\b'
        ],
        "Electrical": [
            r'\belectrical\s+engineering\b', r'\bb\.tech\s+electrical\b', 
            r'\beee\b', r'\belectrical\s+engineer\b'
        ],
        "Electronics": [
            r'\belectronics\s+engineering\b', r'\bece\b', r'\be&tc\b',
            r'\belectronics\s+and\s+communication\b', r'\bb\.tech\s+electronics\b'
        ],
        "Computer Science": [
            r'\bcomputer\s+science\b', r'\bcse\b', r'\bb\.tech\s+cs\b',
            r'\bbca\b', r'\bmca\b', r'\bb\.sc\s+computer\b'
        ],
        "IT": [
            r'\binformation\s+technology\b', r'\bb\.tech\s+it\b', r'\bbit\b'
        ]
    }
    
    for domain, patterns in domain_patterns.items():
        for pattern in patterns:
            if re.search(pattern, text):
                return domain
    
    return None


def is_fresher(text):
    """Enhanced fresher detection"""
    text = text.lower()
    
    # Strong fresher indicators
    fresher_patterns = [
        r'\bfresher\b', r'\bentry\s+level\b', r'\brecent\s+graduate\b',
        r'\bjust\s+graduated\b', r'\b0\s+years\b', r'\bno\s+experience\b',
        r'\bseeking\s+first\s+job\b', r'\bfinal\s+year\b', r'\bpursuing\b'
    ]
    
    for pattern in fresher_patterns:
        if re.search(pattern, text):
            return True
    
    # Check for education completion without work history
    has_degree = re.search(r'\b(b\.tech|be|b\.e|bca|diploma|degree)\b', text)
    has_experience = re.search(r'\b\d+\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)\b', text)
    has_work = re.search(r'\b(?:worked|employment|company|job)\b', text)
    
    if has_degree and not has_experience and not has_work:
        return True
    
    return False


def extract_skills_from_resume(text):
    found_skills = []
    skill_categories = {}

    for category, data in COMPREHENSIVE_SKILLS.items():
        category_skills = []
        skills = sorted(data["skills"], key=len, reverse=True)  # 🔥 Sort longest first

        for skill in skills:
            pattern = r'(?<!\w)' + re.escape(skill.lower()) + r'(?!\w)'
            if re.search(pattern, text):
                found_skills.append(skill)
                category_skills.append(skill)

        if category_skills:
            skill_categories[category] = category_skills

    return found_skills, skill_categories


def determine_candidate_domain(education_domain, skill_categories):
    """Determine final candidate domain - Education takes priority"""
    
    # PRIORITY 1: Education background (most reliable)
    if education_domain:
        return education_domain
    
    # PRIORITY 2: Skill-based domain detection
    domain_weights = {
        "Mechanical": 0,
        "Civil": 0,
        "Electrical": 0,
        "Electronics": 0,
        "IT": 0,
        "Business": 0
    }
    
    # Mechanical scoring
    mech_cats = ["mechanical_cad", "mechanical_analysis", "manufacturing", "mechanical_domains"]
    domain_weights["Mechanical"] = sum(len(skill_categories.get(cat, [])) for cat in mech_cats) * 2
    
    # Civil scoring
    civil_cats = ["civil_cad", "civil_analysis", "civil_project", "civil_domains"]
    domain_weights["Civil"] = sum(len(skill_categories.get(cat, [])) for cat in civil_cats) * 2
    
    # Electrical scoring
    elec_cats = ["electrical_design", "electrical_analysis", "electrical_systems"]
    domain_weights["Electrical"] = sum(len(skill_categories.get(cat, [])) for cat in elec_cats) * 2
    
    # Electronics scoring
    domain_weights["Electronics"] = len(skill_categories.get("electronics", [])) * 2
    
    # IT scoring
    it_cats = ["programming", "web_frontend", "web_backend", "mobile", "data_science"]
    domain_weights["IT"] = sum(len(skill_categories.get(cat, [])) for cat in it_cats)
    
    # Business scoring
    biz_cats = ["business", "management", "marketing", "finance"]
    domain_weights["Business"] = sum(len(skill_categories.get(cat, [])) for cat in biz_cats)
    
    top_domain = max(domain_weights.items(), key=lambda x: x[1])
    
    return top_domain[0] if top_domain[1] > 0 else "General"


def calculate_role_match_score(resume_text, skills, role_name, role_data, 
                               is_fresher_candidate, candidate_domain,resume_embedding):
    """Enhanced scoring with strong domain preference"""
    score = 0.0
    
    # CRITICAL: Domain matching (50% weight - INCREASED)
    role_domain = role_data["domain"]
    if role_domain == candidate_domain:
        score += 0.50  # Perfect match
    elif candidate_domain == "General":
        score += 0.15  # Neutral
    else:
        score += 0.02  # Heavy penalty for mismatch
    
    # Fresher alignment (20% weight)
    if is_fresher_candidate:
        score += 0.20
    
    # Keyword matching (15% weight)
    keyword_matches = sum(1 for kw in role_data["keywords"] if kw in resume_text)
    score += (keyword_matches / len(role_data["keywords"])) * 0.15
    
    # Skill matching (10% weight)
    skill_matches = sum(1 for req in role_data["required_skills"] 
                       if any(req in s for s in skills))
    if role_data["required_skills"]:
        score += (skill_matches / len(role_data["required_skills"])) * 0.10
    
    # BERT similarity (5% weight - REDUCED)
    role_text = " ".join(role_data["keywords"][:10])
    skill_text = " ".join(skills[:10])
    combined = f"{skill_text} {resume_text[:300]}"
    
    resume_embedding = get_bert_embedding(resume_text[:500])

    role_emb = get_bert_embedding(role_text)
    bert_sim = cosine_similarity(resume_embedding, role_emb)[0][0]

    

    score += bert_sim * 0.05
    
    # Apply priority multiplier
    score *= role_data["priority"]
    
    return score


def parse_resume_with_bert(pdf_path):
    """Main BERT parsing with domain-aware job matching"""
    try:
        resume_text = extract_text_from_pdf(pdf_path)
        
        if not resume_text or len(resume_text) < 50:
            return None
        
        print(f"\n{'='*70}")
        print(f"📄 Resume Analysis Started")
        print(f"{'='*70}")
        
        # Step 1: Detect education domain (HIGHEST PRIORITY)
        education_domain = detect_educational_domain(resume_text)
        print(f"🎓 Educational Domain: {education_domain or 'Not detected'}")
        
        # Step 2: Detect fresher status
        is_fresher_candidate = is_fresher(resume_text)
        print(f"👤 Candidate Type: {'FRESHER' if is_fresher_candidate else 'EXPERIENCED'}")
        
        # Step 3: Extract skills
        skills, skill_categories = extract_skills_from_resume(resume_text)
        print(f"💼 Skills Found: {len(skills)}")
        print(f"📊 Skill Categories: {list(skill_categories.keys())}")
        
        # Step 4: Determine final domain
        candidate_domain = determine_candidate_domain(education_domain, skill_categories)
        print(f"🎯 Final Candidate Domain: {candidate_domain}")
        
        # Step 5: Calculate resume embedding once
        resume_embedding = get_bert_embedding(resume_text[:500])
        
        # Step 6: Score matching roles (DOMAIN-FILTERED)
        role_scores = {}
        for role_name, role_data in DOMAIN_SPECIFIC_ROLES.items():
            # Pre-filter: Only score roles matching candidate's domain
            if role_data["domain"] == candidate_domain or candidate_domain == "General":
                score = calculate_role_match_score(
                    resume_text, skills, role_name, role_data,
                    is_fresher_candidate, candidate_domain, resume_embedding
                )
                role_scores[role_name] = score
        
        # Step 7: Get top matching roles
        top_roles = sorted(role_scores.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Filter with minimum threshold
        MIN_THRESHOLD = 0.25
        filtered_roles = [(role, score) for role, score in top_roles if score >= MIN_THRESHOLD]
        
        if not filtered_roles:
            filtered_roles = [top_roles[0]] if top_roles else []
        
        print(f"\n🏆 Top Matched Roles:")
        for role, score in filtered_roles[:3]:
            print(f"   • {role}: {score:.3f}")
        
        # Step 8: Construct search query - SIMPLIFIED for JSearch API
        if filtered_roles:
            role_key = filtered_roles[0][0]
            role_data = DOMAIN_SPECIFIC_ROLES[role_key]
            clean_role = role_data["title"]

            # Add skills (max 2 relevant skills)
            top_skills = [s for s in skills[:5] if len(s) > 2][:2]
            skill_str = " ".join(top_skills) if top_skills else ""
            
            # Simple, effective query format
            if is_fresher_candidate:
                search_query = f"{clean_role} fresher {skill_str} jobs in India"
            else:
                search_query = f"{clean_role} {skill_str} jobs in India"
        else:
            search_query = f"{candidate_domain} engineer fresher jobs in India"
        
        print(f"\n🔍 Search Query: {search_query}")
        print(f"{'='*70}\n")
        
        return {
            "query": search_query,
            "roles": [role for role, _ in filtered_roles[:3]],
            "confidence_scores": {role: float(score) for role, score in filtered_roles[:3]},
            "is_fresher": is_fresher_candidate,
            "candidate_domain": candidate_domain,
            "education_domain": education_domain,
            "top_skills": skills[:5],
            "total_skills_found": len(skills),
            "skill_categories": {k: len(v) for k, v in skill_categories.items()}
        }
        
    except Exception as e:
        print(f"❌ Error in parsing: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

