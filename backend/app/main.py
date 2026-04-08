from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import ats_routes, interview_routes, job_routes, auth_routes, test_routes,speech_routes,evaluation_routes,report_routes,notification_routes

app = FastAPI(title="JobReadyPro API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ats_routes.router)
app.include_router(job_routes.router)
app.include_router(auth_routes.router)
app.include_router(test_routes.router)
app.include_router(interview_routes.router)  # 👈 ADD THIS
app.include_router(speech_routes.router)
app.include_router(evaluation_routes.router)
app.include_router(report_routes.router)
app.include_router(notification_routes.router)

@app.get("/")
async def root():
    return {"message": "JobReadyPro Professional Backend"}
