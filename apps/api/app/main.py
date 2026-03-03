from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import jobs_router, matches_router, resumes_router

app = FastAPI(title="AI Resume Matching API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs_router)
app.include_router(resumes_router)
app.include_router(matches_router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
