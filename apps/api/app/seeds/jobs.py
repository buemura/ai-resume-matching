import asyncio

from sqlalchemy import select

from app.database import async_session
from app.models.job import Job
from app.services.embedding import EmbeddingService

JOBS_SEED_DATA = [
    {
        "title": "Senior Backend Engineer",
        "company": "TechCorp",
        "description": (
            "We are looking for a Senior Backend Engineer to design and build "
            "scalable microservices. You will work with Python, FastAPI, and "
            "PostgreSQL to deliver high-performance APIs. Experience with "
            "distributed systems, message queues, and containerization is "
            "required. You will mentor junior engineers and participate in "
            "architecture decisions."
        ),
        "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Kubernetes", "Redis", "RabbitMQ"],
    },
    {
        "title": "Full Stack Developer",
        "company": "WebFlow Inc.",
        "description": (
            "Join our product team as a Full Stack Developer. You will build "
            "user-facing features using React and TypeScript on the frontend "
            "and Node.js on the backend. We value clean code, testing, and "
            "continuous delivery. Experience with AWS and CI/CD pipelines is "
            "a plus."
        ),
        "skills": ["React", "TypeScript", "Node.js", "AWS", "PostgreSQL", "CI/CD", "Jest"],
    },
    {
        "title": "Machine Learning Engineer",
        "company": "AI Solutions Ltd.",
        "description": (
            "We are seeking a Machine Learning Engineer to develop and deploy "
            "production ML models. You will work on NLP pipelines, "
            "recommendation systems, and real-time inference services. Strong "
            "background in Python, PyTorch, and MLOps practices is essential. "
            "Experience with vector databases and embeddings is highly valued."
        ),
        "skills": ["Python", "PyTorch", "TensorFlow", "NLP", "MLOps", "Docker", "SQL"],
    },
    {
        "title": "DevOps Engineer",
        "company": "CloudScale",
        "description": (
            "We need a DevOps Engineer to manage and improve our cloud "
            "infrastructure on AWS. You will build and maintain CI/CD "
            "pipelines, implement infrastructure as code with Terraform, and "
            "ensure system reliability. Experience with Kubernetes, monitoring "
            "tools, and security best practices is required."
        ),
        "skills": ["AWS", "Terraform", "Kubernetes", "Docker", "GitHub Actions", "Prometheus", "Linux"],
    },
    {
        "title": "Frontend Engineer",
        "company": "DesignHub",
        "description": (
            "We are looking for a Frontend Engineer passionate about building "
            "beautiful, accessible, and performant web applications. You will "
            "work closely with designers to implement pixel-perfect UIs using "
            "React, Next.js, and Tailwind CSS. Strong knowledge of web "
            "performance optimization and accessibility standards is expected."
        ),
        "skills": ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML", "CSS", "Accessibility"],
    },
    {
        "title": "Data Engineer",
        "company": "DataStream Analytics",
        "description": (
            "Join us as a Data Engineer to build and maintain scalable data "
            "pipelines. You will design ETL workflows, manage data warehouses, "
            "and ensure data quality across the organization. Proficiency in "
            "Python, SQL, Apache Spark, and cloud data platforms is required."
        ),
        "skills": ["Python", "SQL", "Apache Spark", "Airflow", "AWS", "Snowflake", "dbt"],
    },
    {
        "title": "iOS Developer",
        "company": "MobileFirst",
        "description": (
            "We are hiring an iOS Developer to build and maintain our mobile "
            "application. You will develop new features using Swift and "
            "SwiftUI, integrate with RESTful APIs, and ensure a smooth user "
            "experience. Experience with Core Data, Combine, and App Store "
            "submission process is a plus."
        ),
        "skills": ["Swift", "SwiftUI", "iOS", "Xcode", "Core Data", "REST APIs", "Git"],
    },
    {
        "title": "Security Engineer",
        "company": "SecureNet",
        "description": (
            "We are looking for a Security Engineer to strengthen our "
            "application and infrastructure security posture. You will "
            "perform security assessments, implement authentication and "
            "authorization systems, and respond to security incidents. "
            "Experience with OWASP, penetration testing, and cloud security "
            "is required."
        ),
        "skills": ["Security", "OWASP", "AWS", "Python", "Penetration Testing", "IAM", "Cryptography"],
    },
    {
        "title": "Site Reliability Engineer",
        "company": "UpTime Systems",
        "description": (
            "Join our SRE team to ensure the reliability and scalability of "
            "our production systems. You will define SLOs, automate incident "
            "response, and optimize system performance. Strong experience "
            "with Linux, observability tools, and distributed systems is "
            "essential."
        ),
        "skills": ["Linux", "Kubernetes", "Prometheus", "Grafana", "Python", "Go", "Terraform"],
    },
    {
        "title": "Product Manager - Technical",
        "company": "InnovateTech",
        "description": (
            "We are seeking a Technical Product Manager to drive the roadmap "
            "for our developer tools platform. You will work closely with "
            "engineering teams to define requirements, prioritize features, "
            "and deliver products that developers love. A technical background "
            "and experience with agile methodologies is required."
        ),
        "skills": ["Product Management", "Agile", "Jira", "SQL", "API Design", "User Research", "Roadmapping"],
    },
]


async def seed_jobs():
    async with async_session() as session:
        result = await session.execute(select(Job).limit(1))
        if result.scalars().first() is not None:
            print("Jobs table already has data, skipping seed.")
            return

        embedding_service = EmbeddingService()

        for i, job_data in enumerate(JOBS_SEED_DATA, 1):
            job_text = f"{job_data['title']} at {job_data['company']}\n\n{job_data['description']}"
            print(f"  [{i}/{len(JOBS_SEED_DATA)}] Generating embedding for {job_data['title']}...")
            embedding = await embedding_service.get_embedding(job_text)
            job = Job(**job_data, embedding=embedding)
            session.add(job)

        await session.commit()
        print(f"Seeded {len(JOBS_SEED_DATA)} jobs with embeddings successfully.")


if __name__ == "__main__":
    asyncio.run(seed_jobs())
