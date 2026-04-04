# jobreadypro/backend/app/services/job_service.py

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from ..core.config import RAPIDAPI_KEY


JSEARCH_URL = "https://jsearch.p.rapidapi.com/search"


def search_jobs(search_query: str, candidate_domain: str):
    """
    Search jobs using JSearch API with retry, timeout,
    and intelligent fallback logic.
    """

    if not RAPIDAPI_KEY:
        raise ValueError("RAPIDAPI_KEY not configured in environment variables")

    print(f"\n🔎 Searching jobs on JSearch...")
    print(f"🔍 Primary Query: {search_query}")

    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }

    params = {
        "query": search_query,
        "page": "1",
        "num_pages": "1",
        "date_posted": "all"
    }

    # Create session with retry strategy
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"]
    )

    adapter = HTTPAdapter(max_retries=retry_strategy)

    with requests.Session() as session:
        session.mount("https://", adapter)

        try:
            # 🔹 Primary Query
            response = session.get(
                JSEARCH_URL,
                headers=headers,
                params=params,
                timeout=(5, 30)  # (connect_timeout, read_timeout)
            )

            response.raise_for_status()
            jobs_json = safe_json(response)
            total_jobs = len(jobs_json.get("data", []))

            # 🔹 Fallback if no results
            if total_jobs == 0:
                print("⚠️ No results found. Trying fallback query...")

                fallback_query = get_fallback_query(candidate_domain)
                params["query"] = fallback_query

                response = session.get(
                    JSEARCH_URL,
                    headers=headers,
                    params=params,
                    timeout=(5, 30)
                )

                response.raise_for_status()
                jobs_json = safe_json(response)
                total_jobs = len(jobs_json.get("data", []))

                print(f"🔄 Fallback Query Used: {fallback_query}")
                search_query = fallback_query

            print(f"✅ Found {total_jobs} jobs\n")

            return {
                "search_query": search_query,
                "total_jobs": total_jobs,
                "jobs": jobs_json.get("data", [])
            }

        except requests.exceptions.Timeout:
            print("⚠️ JSearch API Timeout")
            return build_error_response(search_query, "Timeout")

        except requests.exceptions.RequestException as e:
            print(f"❌ API Error: {e}")
            return build_error_response(search_query, str(e))


# ========================= Helper Functions =========================

def get_fallback_query(candidate_domain: str) -> str:
    """
    Generate simplified fallback query based on candidate domain.
    """

    domain_fallback_map = {
        "Mechanical": "mechanical engineer fresher jobs India",
        "Civil": "civil engineer fresher jobs India",
        "Electrical": "electrical engineer fresher jobs India",
        "Electronics": "electronics engineer fresher jobs India",
        "IT": "software developer fresher jobs India",
    }

    return domain_fallback_map.get(candidate_domain, "fresher jobs India")


def safe_json(response: requests.Response) -> dict:
    """
    Safely parse JSON response.
    """
    try:
        return response.json()
    except ValueError:
        print("⚠️ Invalid JSON response from API")
        return {}


def build_error_response(search_query: str, error_message: str) -> dict:
    """
    Standardized error response structure.
    """
    return {
        "search_query": search_query,
        "total_jobs": 0,
        "jobs": [],
        "error": error_message
    }
