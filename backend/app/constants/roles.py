"""
Domain-Specific Roles Configuration
-----------------------------------
Structured, scalable, and production-ready format.
Internal keys are stable identifiers.
Display data is separated from identifiers.
"""

# =========================
# Supported Domains
# =========================

DOMAINS = [
    "Mechanical",
    "Civil",
    "Electrical",
    "Electronics",
    "IT",
    "Business",
    "Management",
    "Sales",
    "General"
]

# =========================
# Role Definitions
# =========================

DOMAIN_SPECIFIC_ROLES = {

    # ================= MECHANICAL =================
    "mechanical_design_engineer_fresher": {
        "title": "Mechanical Design Engineer",
        "level": "Fresher",
        "domain": "Mechanical",
        "keywords": [
            "mechanical design", "cad", "autocad",
            "solidworks", "catia", "design engineer",
            "graduate", "trainee"
        ],
        "required_skills": ["autocad", "solidworks"],
        "priority": 1.3
    },

    "cad_engineer_entry": {
        "title": "CAD Engineer",
        "level": "Entry Level",
        "domain": "Mechanical",
        "keywords": [
            "cad", "autocad", "solidworks",
            "3d modeling", "drafting"
        ],
        "required_skills": ["autocad"],
        "priority": 1.2
    },

    "production_engineer_trainee": {
        "title": "Production Engineer",
        "level": "Graduate Trainee",
        "domain": "Mechanical",
        "keywords": [
            "production", "manufacturing",
            "shopfloor", "production planning"
        ],
        "required_skills": ["manufacturing"],
        "priority": 1.2
    },

    "quality_engineer_fresher": {
        "title": "Quality Engineer",
        "level": "Fresher",
        "domain": "Mechanical",
        "keywords": [
            "quality control", "inspection",
            "testing", "qa", "qc"
        ],
        "required_skills": [],
        "priority": 1.1
    },

    # ================= CIVIL =================
    "civil_design_engineer_fresher": {
        "title": "Civil Design Engineer",
        "level": "Fresher",
        "domain": "Civil",
        "keywords": [
            "civil design", "autocad",
            "structural design"
        ],
        "required_skills": ["autocad"],
        "priority": 1.2
    },

    "site_engineer_entry": {
        "title": "Site Engineer",
        "level": "Entry Level",
        "domain": "Civil",
        "keywords": [
            "site engineer", "construction",
            "site supervision"
        ],
        "required_skills": [],
        "priority": 1.3
    },

    "structural_engineer_junior": {
        "title": "Structural Engineer",
        "level": "Junior",
        "domain": "Civil",
        "keywords": [
            "structural", "staad pro",
            "etabs", "analysis"
        ],
        "required_skills": [],
        "priority": 1.1
    },

    # ================= ELECTRICAL =================
    "electrical_engineer_fresher": {
        "title": "Electrical Engineer",
        "level": "Fresher",
        "domain": "Electrical",
        "keywords": [
            "electrical", "power systems",
            "electrical design"
        ],
        "required_skills": [],
        "priority": 1.2
    },

    "electrical_design_engineer_entry": {
        "title": "Electrical Design Engineer",
        "level": "Entry Level",
        "domain": "Electrical",
        "keywords": [
            "panel design", "electrical cad"
        ],
        "required_skills": [],
        "priority": 1.1
    },

    # ================= ELECTRONICS =================
    "electronics_engineer_fresher": {
        "title": "Electronics Engineer",
        "level": "Fresher",
        "domain": "Electronics",
        "keywords": [
            "electronics", "embedded",
            "pcb", "circuit"
        ],
        "required_skills": [],
        "priority": 1.2
    },

    "embedded_systems_engineer_entry": {
        "title": "Embedded Systems Engineer",
        "level": "Entry Level",
        "domain": "Electronics",
        "keywords": [
            "embedded systems", "microcontroller",
            "arduino"
        ],
        "required_skills": [],
        "priority": 1.1
    },

    # ================= IT =================
    "software_developer_fresher": {
        "title": "Software Developer",
        "level": "Fresher",
        "domain": "IT",
        "keywords": [
            "software", "developer",
            "programming", "coding"
        ],
        "required_skills": ["programming"],
        "priority": 1.0
    },

    "frontend_developer_entry": {
        "title": "Frontend Developer",
        "level": "Entry Level",
        "domain": "IT",
        "keywords": [
            "frontend", "react",
            "html", "css", "javascript"
        ],
        "required_skills": ["html", "css", "javascript"],
        "priority": 1.0
    },

    "backend_developer_junior": {
        "title": "Backend Developer",
        "level": "Junior",
        "domain": "IT",
        "keywords": [
            "backend", "api",
            "python", "java", "nodejs"
        ],
        "required_skills": ["programming"],
        "priority": 1.0
    },

    "data_analyst_entry": {
        "title": "Data Analyst",
        "level": "Entry Level",
        "domain": "IT",
        "keywords": [
            "data analyst", "excel",
            "sql", "python"
        ],
        "required_skills": [],
        "priority": 0.9
    },

    # ================= BUSINESS =================
    "business_analyst_fresher": {
        "title": "Business Analyst",
        "level": "Fresher",
        "domain": "Business",
        "keywords": [
            "business analysis", "requirements"
        ],
        "required_skills": [],
        "priority": 0.9
    },

    "management_trainee": {
        "title": "Management Trainee",
        "level": "Graduate",
        "domain": "Management",
        "keywords": [
            "management trainee", "operations"
        ],
        "required_skills": [],
        "priority": 1.0
    },

    "sales_executive_entry": {
        "title": "Sales Executive",
        "level": "Entry Level",
        "domain": "Sales",
        "keywords": [
            "sales", "marketing",
            "business development"
        ],
        "required_skills": [],
        "priority": 0.8
    }
}
