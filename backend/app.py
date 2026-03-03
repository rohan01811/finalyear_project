from fastapi import FastAPI, File, UploadFile, Form, HTTPException
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import io
import base64
import google.generativeai as genai
import shutil
import requests
import fitz  # PyMuPDF
from PIL import Image
import torch
from transformers import BertTokenizer, BertModel
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import re

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for ATS
page_parts = ""
resume_text = ""   # ✅ ADD THIS
ATSJobdescription = ""
atsPrompt = ""

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize BERT model
print("Loading BERT model...")
bert_tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
bert_model = BertModel.from_pretrained('bert-base-uncased')
bert_model.eval()
print("BERT model loaded successfully!")

# ==================== COMPREHENSIVE MULTI-DOMAIN SKILL DATABASE ====================

COMPREHENSIVE_SKILLS = {
    # Programming Languages
    "programming": ["python", "java", "javascript", "typescript", "c++", "c#", "php", "ruby", 
                   "go", "golang", "rust", "swift", "kotlin", "scala", "r", "matlab", "c"],
    
    # Web Development
    "web_frontend": ["react", "angular", "vue", "html", "css", "bootstrap", "tailwind", "jquery"],
    "web_backend": ["nodejs", "django", "flask", "spring boot", "asp.net", "express", "fastapi"],
    
    # Mobile Development
    "mobile": ["android", "ios", "react native", "flutter", "xamarin"],
    
    # DevOps & Cloud
    "devops": ["docker", "kubernetes", "jenkins", "aws", "azure", "gcp", "terraform", "ansible"],
    
    # Data Science & AI
    "data_science": ["machine learning", "deep learning", "data analysis", "pandas", "numpy", 
                    "tensorflow", "pytorch", "scikit-learn", "keras"],
    
    # Databases
    "databases": ["mysql", "postgresql", "mongodb", "oracle", "sql server", "redis"],
    
    # Mechanical Engineering - EXPANDED
    "mechanical_cad": ["autocad", "solidworks", "catia", "creo", "nx", "fusion 360", 
                      "inventor", "pro-e", "ansys"],
    "mechanical_analysis": ["fea", "cfd", "ansys fluent", "abaqus", "comsol", "hyperworks"],
    "manufacturing": ["cnc", "machining", "lathe", "milling", "casting", "welding", 
                     "forging", "injection molding", "3d printing"],
    "mechanical_domains": ["hvac", "thermodynamics", "heat transfer", "fluid mechanics", 
                          "machine design", "automotive", "robotics"],
    
    # Civil Engineering - EXPANDED
    "civil_cad": ["autocad civil 3d", "revit", "bim", "sketchup"],
    "civil_analysis": ["staad pro", "etabs", "sap2000", "safe", "risa"],
    "civil_project": ["primavera", "ms project", "construction management"],
    "civil_domains": ["structural design", "surveying", "gis", "arcgis", "highway design", 
                     "water resources", "geotechnical", "transportation"],
    
    # Electrical Engineering
    "electrical_design": ["pcb design", "eagle", "altium", "kicad", "circuit design", 
                         "power systems", "electrical cad"],
    "electrical_analysis": ["pspice", "ltspice", "proteus", "matlab simulink"],
    "electrical_systems": ["plc", "scada", "hmi", "automation", "control systems"],
    
    # Electronics Engineering
    "electronics": ["embedded systems", "microcontroller", "arduino", "raspberry pi", 
                   "8051", "arm", "vlsi", "verilog", "vhdl"],
    
    # Business & Management
    "business": ["business analysis", "market research", "financial analysis", "excel", 
                "powerpoint", "word"],
    "management": ["project management", "team leadership", "agile", "scrum", "pmp"],
    
    # Marketing & Sales
    "marketing": ["digital marketing", "seo", "sem", "social media marketing", 
                 "content marketing", "google analytics"],
    "sales": ["sales strategy", "crm", "salesforce", "business development"],
    
    # Finance & Accounting
    "finance": ["financial modeling", "investment analysis", "tally", "quickbooks", "sap fico"],
    "accounting": ["taxation", "auditing", "bookkeeping", "gst"],
    
    # Design & Creative
    "design": ["photoshop", "illustrator", "indesign", "figma", "adobe xd", "canva"],
    
    # HR
    "hr": ["recruitment", "talent acquisition", "employee relations", "payroll"],
    
    # Soft Skills (Critical for Freshers)
    "soft_skills": ["communication", "teamwork", "problem solving", "leadership", 
                   "time management", "presentation"]
}

# ==================== DOMAIN-SPECIFIC JOB ROLES (FRESHER-FOCUSED) ====================

DOMAIN_SPECIFIC_ROLES = {
    # ========== MECHANICAL ENGINEERING ==========
    "Mechanical Design Engineer (Fresher)": {
        "domain": "Mechanical",
        "keywords": ["mechanical design", "cad", "autocad", "solidworks", "catia", "fresher", 
                    "graduate", "design engineer", "trainee"],
        "required_skills": ["autocad", "solidworks", "mechanical"],
        "priority": 1.3
    },
    "CAD Engineer (Entry Level)": {
        "domain": "Mechanical",
        "keywords": ["cad", "autocad", "solidworks", "3d modeling", "drafting", "fresher"],
        "required_skills": ["autocad"],
        "priority": 1.2
    },
    "Production Engineer (Graduate Trainee)": {
        "domain": "Mechanical",
        "keywords": ["production", "manufacturing", "quality", "shopfloor", "fresher", 
                    "graduate trainee", "production planning"],
        "required_skills": ["manufacturing"],
        "priority": 1.2
    },
    "Quality Engineer (Fresher)": {
        "domain": "Mechanical",
        "keywords": ["quality control", "inspection", "testing", "qc", "qa", "fresher"],
        "required_skills": ["quality"],
        "priority": 1.1
    },
    "Maintenance Engineer (Entry Level)": {
        "domain": "Mechanical",
        "keywords": ["maintenance", "equipment", "mechanical maintenance", "plant", "fresher"],
        "required_skills": ["mechanical"],
        "priority": 1.0
    },
    "Manufacturing Engineer (Trainee)": {
        "domain": "Mechanical",
        "keywords": ["manufacturing", "process", "production", "cnc", "fresher", "trainee"],
        "required_skills": ["manufacturing"],
        "priority": 1.1
    },
    
    # ========== CIVIL ENGINEERING ==========
    "Civil Design Engineer (Fresher)": {
        "domain": "Civil",
        "keywords": ["civil design", "autocad", "structural design", "fresher", "graduate"],
        "required_skills": ["autocad", "civil"],
        "priority": 1.2
    },
    "Site Engineer (Entry Level)": {
        "domain": "Civil",
        "keywords": ["site engineer", "construction", "civil", "site supervision", "fresher"],
        "required_skills": ["civil", "construction"],
        "priority": 1.3
    },
    "Structural Engineer (Junior)": {
        "domain": "Civil",
        "keywords": ["structural", "staad pro", "etabs", "design", "analysis", "fresher"],
        "required_skills": ["structural"],
        "priority": 1.1
    },
    "CAD Technician Civil (Fresher)": {
        "domain": "Civil",
        "keywords": ["cad", "autocad civil", "drafting", "civil", "fresher", "technician"],
        "required_skills": ["autocad"],
        "priority": 1.1
    },
    
    # ========== ELECTRICAL ENGINEERING ==========
    "Electrical Engineer (Fresher)": {
        "domain": "Electrical",
        "keywords": ["electrical", "power systems", "electrical design", "fresher", "graduate"],
        "required_skills": ["electrical"],
        "priority": 1.2
    },
    "Electrical Design Engineer (Entry Level)": {
        "domain": "Electrical",
        "keywords": ["electrical design", "panel design", "autocad electrical", "fresher"],
        "required_skills": ["electrical", "cad"],
        "priority": 1.1
    },
    
    # ========== ELECTRONICS ENGINEERING ==========
    "Electronics Engineer (Fresher)": {
        "domain": "Electronics",
        "keywords": ["electronics", "embedded", "pcb", "circuit", "fresher", "graduate"],
        "required_skills": ["electronics"],
        "priority": 1.2
    },
    "Embedded Systems Engineer (Entry Level)": {
        "domain": "Electronics",
        "keywords": ["embedded systems", "microcontroller", "arduino", "c", "fresher"],
        "required_skills": ["embedded", "electronics"],
        "priority": 1.1
    },
    
    # ========== IT & SOFTWARE ==========
    "Software Developer (Fresher)": {
        "domain": "IT",
        "keywords": ["software", "developer", "programming", "coding", "fresher", "graduate"],
        "required_skills": ["programming"],
        "priority": 1.0
    },
    "Frontend Developer (Entry Level)": {
        "domain": "IT",
        "keywords": ["frontend", "react", "html", "css", "javascript", "fresher"],
        "required_skills": ["html", "css", "javascript"],
        "priority": 1.0
    },
    "Backend Developer (Junior)": {
        "domain": "IT",
        "keywords": ["backend", "api", "python", "java", "nodejs", "fresher"],
        "required_skills": ["programming"],
        "priority": 1.0
    },
    "Data Analyst (Entry Level)": {
        "domain": "IT",
        "keywords": ["data analyst", "excel", "sql", "python", "fresher", "analyst"],
        "required_skills": ["data analysis"],
        "priority": 0.9
    },
    
    # ========== BUSINESS & OTHERS ==========
    "Business Analyst (Fresher)": {
        "domain": "Business",
        "keywords": ["business analyst", "analysis", "requirements", "fresher"],
        "required_skills": ["business"],
        "priority": 0.9
    },
    "Management Trainee": {
        "domain": "Management",
        "keywords": ["management trainee", "mba", "graduate trainee", "operations"],
        "required_skills": ["management"],
        "priority": 1.0
    },
    "Sales Executive (Entry Level)": {
        "domain": "Sales",
        "keywords": ["sales", "marketing", "business development", "fresher"],
        "required_skills": ["sales"],
        "priority": 0.8
    },
}

# ==================== HELPER FUNCTIONS ====================

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
    """Extract skills across all domains"""
    found_skills = []
    skill_categories = {}
    
    for category, skills in COMPREHENSIVE_SKILLS.items():
        category_skills = []
        for skill in skills:
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
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


def get_bert_embedding(text, max_length=256):
    """Generate BERT embeddings"""
    text = re.sub(r'\s+', ' ', text).strip()[:1000]
    
    inputs = bert_tokenizer(
        text,
        return_tensors='pt',
        truncation=True,
        max_length=max_length,
        padding='max_length'
    )
    
    with torch.no_grad():
        outputs = bert_model(**inputs)
    
    token_embeddings = outputs.last_hidden_state
    attention_mask = inputs['attention_mask']
    
    input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    sum_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1)
    sum_mask = torch.clamp(input_mask_expanded.sum(1), min=1e-9)
    embedding = (sum_embeddings / sum_mask).numpy()
    
    return embedding


def calculate_role_match_score(resume_text, skills, role_name, role_data, 
                               is_fresher_candidate, candidate_domain):
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
    
    resume_emb = get_bert_embedding(combined)
    role_emb = get_bert_embedding(role_text)
    bert_sim = cosine_similarity(resume_emb, role_emb)[0][0]
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
        
        # Step 5: Score matching roles (DOMAIN-FILTERED)
        role_scores = {}
        for role_name, role_data in DOMAIN_SPECIFIC_ROLES.items():
            # Pre-filter: Only score roles matching candidate's domain
            if role_data["domain"] == candidate_domain or candidate_domain == "General":
                score = calculate_role_match_score(
                    resume_text, skills, role_name, role_data,
                    is_fresher_candidate, candidate_domain
                )
                role_scores[role_name] = score
        
        # Step 6: Get top matching roles
        top_roles = sorted(role_scores.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Filter with minimum threshold
        MIN_THRESHOLD = 0.25
        filtered_roles = [(role, score) for role, score in top_roles if score >= MIN_THRESHOLD]
        
        if not filtered_roles:
            filtered_roles = [top_roles[0]] if top_roles else []
        
        print(f"\n🏆 Top Matched Roles:")
        for role, score in filtered_roles[:3]:
            print(f"   • {role}: {score:.3f}")
        
        # Step 7: Construct search query - SIMPLIFIED for JSearch API
        if filtered_roles:
            primary_role = filtered_roles[0][0]
            
            # Clean role name - remove parentheses and extra text
            clean_role = primary_role.replace(" (Fresher)", "").replace(" (Entry Level)", "").replace(" (Junior)", "").replace(" (Graduate Trainee)", "").replace(" (Trainee)", "")
            
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


# ==================== ATS FUNCTIONS ====================

def getGeminiResponse(input_prompt, resume_text, job_description):
    model = genai.GenerativeModel("gemini-2.5-flash-lite")

    prompt = f"""
    {input_prompt}

    RESUME:
    {resume_text}

    JOB DESCRIPTION:
    {job_description}
    """

    response = model.generate_content(prompt)
    return response.text

def input_pdf_setup(pdf_path):
    """Convert PDF to images for Gemini"""
    try:
        doc = fitz.open(pdf_path)
        page_parts = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format="JPEG", quality=95)
            img_byte_arr = img_byte_arr.getvalue()
            
            page_parts.append({
                "mime_type": "image/jpeg",
                "data": base64.b64encode(img_byte_arr).decode()
            })
        
        doc.close()
        
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        
        return page_parts
    
    except Exception as e:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")


# ATS Prompts
input_prompt1 = """
You are an experienced Technical Human Resource Manager. Review the resume against the job description.
Provide professional evaluation on candidate's profile alignment with the role.
Highlight strengths and weaknesses in relation to job requirements.

IMPORTANT:
- No heading or introduction
- Use proper markdown and line spacing
- Be direct and specific
- Analyze skills, experience, education thoroughly
"""

input_prompt3 = """
You are an ATS scanner with deep industry understanding. Evaluate resume against job description.

Provide:
1. **Match Percentage**: Overall score (0-100%)
2. **Missing Keywords**: Important terms not in resume
3. **Matched Keywords**: Aligned terms
4. **Skills Gap Analysis**: Gaps and recommendations
5. **Final Thoughts**: Assessment and suggestions

IMPORTANT:
- No introduction
- Use markdown and proper spacing
- Be specific and actionable
"""

# ==================== API ENDPOINTS ====================

@app.get("/")
async def root():
    return {
        "message": "JobReadyPro API - Multi-Domain Resume Parser",
        "version": "4.0.0",
        "features": [
            "Domain-Aware BERT Parsing (Mechanical, Civil, Electrical, IT)",
            "Fresher-Focused Job Matching",
            "Education Priority Matching",
            "ATS Analysis"
        ],
        "supported_domains": [
            "Mechanical Engineering",
            "Civil Engineering", 
            "Electrical Engineering",
            "Electronics Engineering",
            "Computer Science/IT",
            "Business & Management"
        ]
    }


@app.post("/get_resume_file")
async def get_resume_file(
    ATSdescription: str = Form(...),
    prompt_number: int = Form(...),
    file: UploadFile = File(...)
):
    """Upload resume for ATS analysis"""
    global page_parts, ATSJobdescription, atsPrompt
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files supported")
    
    try:
        file_path = f"{UPLOAD_DIR}/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        global resume_text

        resume_text = extract_text_from_pdf(file_path)  # ✅ TEXT extraction
        ATSJobdescription = ATSdescription

# ❌ Stop using images for Gemini
        page_parts = ""  

        
        atsPrompt = input_prompt1 if prompt_number == 1 else input_prompt3
        
        return {
            "status": "success",
            "message": "Resume processed successfully",
            "pages": len(page_parts)
        }
    
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/ats_response")
async def sendAtsData():
    global resume_text, ATSJobdescription, atsPrompt

    if not resume_text or not ATSJobdescription or not atsPrompt:
        return {
            "status": "error",
            "message": "Upload resume first using /get_resume_file"
        }

    try:
        result = getGeminiResponse(
            atsPrompt,
            resume_text,
            ATSJobdescription
        )
        return {"status": "success", "result": result}

    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/jobSearch")
async def getJobs(resume: UploadFile = File(...)):
    """Search jobs using domain-aware BERT parsing"""
    try:
        if not resume.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files supported")
        
        file_path = f"{UPLOAD_DIR}/{resume.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)
        
        # Parse resume with BERT
        bert_result = parse_resume_with_bert(file_path)
        
        if bert_result:
            search_query = bert_result["query"]
        else:
            search_query = "fresher engineer entry level jobs India"
            bert_result = {
                "query": search_query,
                "roles": ["Engineer"],
                "confidence_scores": {},
                "is_fresher": True,
                "candidate_domain": "General",
                "education_domain": None,
                "top_skills": [],
                "total_skills_found": 0,
                "skill_categories": {}
            }
        
        # Clean up file
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Search jobs using JSearch API
        print(f"\n🔎 Searching jobs on JSearch...")
        url = "https://jsearch.p.rapidapi.com/search"
        headers = {
            "X-RapidAPI-Key": os.getenv("RAPIDAPI_KEY"),  # MOVE KEY TO .env
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
        }
        
        # Try primary query first
        params = {
            "query": search_query,
            "page": "1",
            "num_pages": "1",
            "date_posted": "all"
        }
        
        jobs_response = requests.get(url, headers=headers, params=params, timeout=25)
        jobs_json = jobs_response.json()
        
        total_jobs = len(jobs_json.get("data", []))
        
        # If no results, try simplified fallback query
        if total_jobs == 0:
            print(f"⚠️  No results with primary query, trying fallback...")
            
            # Simplified fallback based on domain
            if bert_result["candidate_domain"] == "Mechanical":
                fallback_query = "mechanical engineer fresher jobs India"
            elif bert_result["candidate_domain"] == "Civil":
                fallback_query = "civil engineer fresher jobs India"
            elif bert_result["candidate_domain"] == "Electrical":
                fallback_query = "electrical engineer fresher jobs India"
            elif bert_result["candidate_domain"] == "Electronics":
                fallback_query = "electronics engineer fresher jobs India"
            elif bert_result["candidate_domain"] == "IT":
                fallback_query = "software developer fresher jobs India"
            else:
                fallback_query = "fresher jobs India"
            
            params["query"] = fallback_query
            jobs_response = requests.get(url, headers=headers, params=params, timeout=15)
            jobs_json = jobs_response.json()
            total_jobs = len(jobs_json.get("data", []))
            
            print(f"🔄 Fallback query: {fallback_query}")
            search_query = fallback_query  # Update for response
        
        from requests.adapters import HTTPAdapter
        from urllib3.util.retry import Retry

        print(f"\n🔎 Searching jobs on JSearch...")

        url = "https://jsearch.p.rapidapi.com/search"

        headers = {        
    "X-RapidAPI-Key": os.getenv("RAPIDAPI_KEY"),  # MOVE KEY TO .env
    "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
}

        session = requests.Session()

        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504]
        )

        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("https://", adapter)

        params = {
    "query": search_query,
    "page": "1",
    "num_pages": "1",
    "date_posted": "all"
}

        try:
            jobs_response = session.get(
                url,
                headers=headers,
                params=params,
               timeout=(5, 30)   # 5 sec connect, 30 sec read
            )

            jobs_response.raise_for_status()
            jobs_json = jobs_response.json()
            total_jobs = len(jobs_json.get("data", []))

        except requests.exceptions.Timeout:
           print("⚠️ JSearch API Timeout")
           jobs_json = {"data": []}
           total_jobs = 0

        except requests.exceptions.RequestException as e:
            print(f"❌ API Error: {e}")
            jobs_json = {"data": []}
            total_jobs = 0

        
        return {
            "status": "success",
            "search_query": search_query,
            "parsing_method": "Domain-Aware BERT with Education Priority",
            "total_jobs": total_jobs,
            "jobs": jobs_json.get("data", []),
            "analysis": {
                "candidate_domain": bert_result["candidate_domain"],
                "education_background": bert_result["education_domain"],
                "is_fresher": bert_result["is_fresher"],
                "matched_roles": bert_result["roles"],
                "confidence_scores": bert_result["confidence_scores"],
                "top_skills": bert_result["top_skills"],
                "total_skills_found": bert_result["total_skills_found"],
                "skill_categories": bert_result["skill_categories"]
            }
        }
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            "status": "error",
            "message": str(e),
            "jobs": [],
            "analysis": None
        }


@app.post("/clearData")
async def clearData():
    """Clear stored ATS data"""
    global page_parts, ATSJobdescription, atsPrompt
    
    page_parts = ""
    ATSJobdescription = ""
    atsPrompt = ""
    
    return {"status": "success", "message": "Data cleared"}


@app.get("/test-gemini")
async def test_gemini():
    """Test Gemini API"""
    try:
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        response = model.generate_content("Say 'Gemini API working!'")
        return {
            "status": "success",
            "message": "Gemini connected",
            "response": response.text
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/test-bert")
async def test_bert():
    """Test BERT model"""
    try:
        test_text = "Mechanical engineer with AutoCAD and SolidWorks experience"
        embedding = get_bert_embedding(test_text)
        
        test_resume = """
        B.Tech Mechanical Engineering graduate with knowledge of AutoCAD, SolidWorks, and CATIA.
        Final year project on heat transfer analysis. Seeking fresher opportunities in design.
        """
        
        education = detect_educational_domain(test_resume.lower())
        is_fresh = is_fresher(test_resume.lower())
        skills, categories = extract_skills_from_resume(test_resume.lower())
        
        return {
            "status": "success",
            "message": "BERT model working correctly",
            "tests": {
                "embedding": {
                    "shape": str(embedding.shape),
                    "sample": embedding[0][:5].tolist()
                },
                "domain_detection": {
                    "detected": education,
                    "is_fresher": is_fresh
                },
                "skill_extraction": {
                    "skills": skills,
                    "categories": list(categories.keys()),
                    "total": len(skills)
                }
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

from pydantic import BaseModel

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


@app.post("/signup")
async def signup(data: SignupRequest):
    # TEMP implementation (for demo / testing)
    if not data.email or not data.password:
        raise HTTPException(status_code=400, detail="Email and password required")

    return {
        "status": "success",
        "message": "Signup successful",
        "user": {
            "name": data.name,
            "email": data.email
        }
    }

from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str


@app.post("/login")
async def login(data: LoginRequest):
    # TEMP demo logic
    if not data.email or not data.password:
        raise HTTPException(status_code=400, detail="Email and password required")

    # Normally you'd verify from DB here
    return {
        "token": "demo-jwt-token-123",
        "username": data.email.split("@")[0]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
                