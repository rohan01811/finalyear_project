"""
Comprehensive Skill Registry
----------------------------
Structured skill categories with normalization and indexing support.
Designed for scalable resume parsing.
"""

# =========================
# Skill Categories
# =========================

COMPREHENSIVE_SKILLS = {

    # ================= PROGRAMMING =================
    "programming": {
        "domain": "IT",
        "skills": [
            "python", "java", "javascript", "typescript",
            "c++", "c#", "php", "ruby",
            "go", "golang", "rust",
            "swift", "kotlin", "scala",
            "r", "matlab", "c"
        ]
    },

    # ================= WEB =================
    "web_frontend": {
        "domain": "IT",
        "skills": [
            "react", "angular", "vue",
            "html", "css", "bootstrap",
            "tailwind", "jquery"
        ]
    },

    "web_backend": {
        "domain": "IT",
        "skills": [
            "nodejs", "django", "flask",
            "spring boot", "asp.net",
            "express", "fastapi"
        ]
    },

    # ================= MOBILE =================
    "mobile": {
        "domain": "IT",
        "skills": [
            "android", "ios",
            "react native", "flutter", "xamarin"
        ]
    },

    # ================= DEVOPS =================
    "devops": {
        "domain": "IT",
        "skills": [
            "docker", "kubernetes", "jenkins",
            "aws", "azure", "gcp",
            "terraform", "ansible"
        ]
    },

    # ================= DATA SCIENCE =================
    "data_science": {
        "domain": "IT",
        "skills": [
            "machine learning", "deep learning",
            "data analysis", "pandas", "numpy",
            "tensorflow", "pytorch",
            "scikit-learn", "keras"
        ]
    },

    # ================= DATABASES =================
    "databases": {
        "domain": "IT",
        "skills": [
            "mysql", "postgresql",
            "mongodb", "oracle",
            "sql server", "redis"
        ]
    },

    # ================= MECHANICAL =================
    "mechanical_cad": {
        "domain": "Mechanical",
        "skills": [
            "autocad", "solidworks", "catia",
            "creo", "nx", "fusion 360",
            "inventor", "pro-e", "ansys"
        ]
    },

    "mechanical_analysis": {
        "domain": "Mechanical",
        "skills": [
            "fea", "cfd", "ansys fluent",
            "abaqus", "comsol", "hyperworks"
        ]
    },

    "manufacturing": {
        "domain": "Mechanical",
        "skills": [
            "cnc", "machining", "lathe",
            "milling", "casting", "welding",
            "forging", "injection molding",
            "3d printing"
        ]
    },

    # ================= CIVIL =================
    "civil_cad": {
        "domain": "Civil",
        "skills": [
            "autocad civil 3d", "revit",
            "bim", "sketchup"
        ]
    },

    "civil_analysis": {
        "domain": "Civil",
        "skills": [
            "staad pro", "etabs",
            "sap2000", "safe", "risa"
        ]
    },

    # ================= ELECTRICAL =================
    "electrical_design": {
        "domain": "Electrical",
        "skills": [
            "pcb design", "eagle",
            "altium", "kicad",
            "circuit design",
            "power systems"
        ]
    },

    # ================= ELECTRONICS =================
    "electronics": {
        "domain": "Electronics",
        "skills": [
            "embedded systems",
            "microcontroller",
            "arduino", "raspberry pi",
            "vlsi", "verilog", "vhdl"
        ]
    },

    # ================= BUSINESS =================
    "business": {
        "domain": "Business",
        "skills": [
            "business analysis",
            "market research",
            "financial analysis",
            "excel", "powerpoint", "word"
        ]
    },

    "management": {
        "domain": "Management",
        "skills": [
            "project management",
            "team leadership",
            "agile", "scrum", "pmp"
        ]
    },

    "marketing": {
        "domain": "Business",
        "skills": [
            "digital marketing",
            "seo", "sem",
            "content marketing",
            "google analytics"
        ]
    },

    "sales": {
        "domain": "Sales",
        "skills": [
            "sales strategy",
            "crm", "salesforce",
            "business development"
        ]
    },

    "finance": {
        "domain": "Finance",
        "skills": [
            "financial modeling",
            "investment analysis",
            "tally", "quickbooks",
            "sap fico"
        ]
    },

    "soft_skills": {
        "domain": "General",
        "skills": [
            "communication",
            "teamwork",
            "problem solving",
            "leadership",
            "time management",
            "presentation"
        ]
    }
}

# =========================
# Flat Skill Index (Fast Lookup)
# =========================

FLAT_SKILL_INDEX = {
    skill: category
    for category, data in COMPREHENSIVE_SKILLS.items()
    for skill in data["skills"]
}

# =========================
# Skill Aliases (Normalization Support)
# =========================

SKILL_ALIASES = {
    "node js": "nodejs",
    "node.js": "nodejs",
    "js": "javascript",
    "py": "python",
    "ml": "machine learning",
    "dl": "deep learning",
    "reactjs": "react",
    "c sharp": "c#"
}
