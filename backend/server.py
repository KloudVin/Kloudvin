from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import bcrypt
import jwt
import math
import re
import secrets
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from slugify import slugify

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Password Hashing ---
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=24), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def calculate_read_time(content: str) -> str:
    if not content:
        return "1 min read"
    words = len(re.findall(r'\w+', content))
    minutes = max(1, math.ceil(words / 200))
    return f"{minutes} min read"

# --- Auth Helper ---
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Pydantic Models ---
class LoginRequest(BaseModel):
    email: str
    password: str

class SubscribeRequest(BaseModel):
    email: str

class ArticleCreate(BaseModel):
    title: str
    category: str
    description: str
    content: str
    author: str = "Vinod"

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None

class CategoryCreate(BaseModel):
    name: str
    icon: str
    description: str
    subcategories: List[str] = []

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    subcategories: Optional[List[str]] = None

# --- Auth Endpoints ---
@api_router.post("/auth/login")
async def login(req: LoginRequest, response: Response):
    email = req.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    uid = str(user["_id"])
    access_token = create_access_token(uid, email)
    refresh_token = create_refresh_token(uid)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": uid, "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "editor"), "token": access_token}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

# --- Articles ---
@api_router.get("/articles")
async def get_articles(category: Optional[str] = None, published: Optional[bool] = True):
    query = {}
    if published is not None:
        query["published"] = published
    if category and category != "All Topics":
        query["category"] = {"$regex": category, "$options": "i"}
    articles = await db.articles.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return articles

@api_router.get("/articles/{slug}")
async def get_article(slug: str):
    article = await db.articles.find_one({"slug": slug}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    # Increment view count
    await db.articles.update_one({"slug": slug}, {"$inc": {"views": 1}})
    return article

@api_router.post("/articles")
async def create_article(article: ArticleCreate, request: Request):
    user = await get_current_user(request)
    slug = slugify(article.title)
    existing = await db.articles.find_one({"slug": slug})
    if existing:
        slug = f"{slug}-{secrets.token_hex(3)}"
    read_time = calculate_read_time(article.content)
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "slug": slug,
        "title": article.title,
        "category": article.category,
        "description": article.description,
        "content": article.content,
        "author": article.author,
        "read_time": read_time,
        "published": True,
        "views": 0,
        "created_at": now,
        "updated_at": now,
    }
    await db.articles.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/articles/{slug}")
async def update_article(slug: str, update: ArticleUpdate, request: Request):
    user = await get_current_user(request)
    updates = {k: v for k, v in update.model_dump().items() if v is not None}
    if "content" in updates:
        updates["read_time"] = calculate_read_time(updates["content"])
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.articles.update_one({"slug": slug}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    article = await db.articles.find_one({"slug": slug}, {"_id": 0})
    return article

@api_router.delete("/articles/{slug}")
async def delete_article(slug: str, request: Request):
    user = await get_current_user(request)
    result = await db.articles.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article deleted"}

# --- Categories ---
@api_router.get("/categories")
async def get_categories():
    cats = await db.categories.find({}, {"_id": 0}).to_list(50)
    return cats

@api_router.post("/categories")
async def create_category(cat: CategoryCreate, request: Request):
    user = await get_current_user(request)
    doc = cat.model_dump()
    doc["id"] = slugify(cat.name)
    await db.categories.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/categories/{cat_id}")
async def update_category(cat_id: str, update: CategoryUpdate, request: Request):
    user = await get_current_user(request)
    updates = {k: v for k, v in update.model_dump().items() if v is not None}
    result = await db.categories.update_one({"id": cat_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    cat = await db.categories.find_one({"id": cat_id}, {"_id": 0})
    return cat

@api_router.delete("/categories/{cat_id}")
async def delete_category(cat_id: str, request: Request):
    user = await get_current_user(request)
    result = await db.categories.delete_one({"id": cat_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}

# --- Subscribers ---
@api_router.post("/subscribe")
async def subscribe(req: SubscribeRequest):
    email = req.email.lower().strip()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email")
    existing = await db.subscribers.find_one({"email": email})
    if existing:
        return {"message": "Already subscribed!", "already_subscribed": True}
    await db.subscribers.insert_one({
        "email": email,
        "subscribed_at": datetime.now(timezone.utc).isoformat(),
        "active": True,
    })
    return {"message": "Successfully subscribed!", "already_subscribed": False}

@api_router.get("/subscribers")
async def get_subscribers(request: Request):
    user = await get_current_user(request)
    subs = await db.subscribers.find({}, {"_id": 0}).sort("subscribed_at", -1).to_list(1000)
    return subs

# --- Health ---
@api_router.get("/health")
async def health():
    return {"status": "ok"}

# --- Seed Data ---
async def seed_data():
    # Seed admin user
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@kloudvin.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "KloudV1n@2026!")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Vinod H",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin user seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")

    # Seed categories
    cat_count = await db.categories.count_documents({})
    if cat_count == 0:
        categories = [
            {"id": "cloud", "name": "Cloud", "icon": "Cloud", "description": "Cloud computing and services", "subcategories": ["AWS", "Azure", "GCP", "Multi-Cloud"]},
            {"id": "devops", "name": "DevOps", "icon": "Infinity", "description": "DevOps & CI/CD practices", "subcategories": ["Jenkins", "GitHub Actions", "ArgoCD", "GitOps"]},
            {"id": "kubernetes", "name": "Kubernetes", "icon": "Container", "description": "Container orchestration", "subcategories": ["Docker", "K8s", "Helm", "Istio"]},
            {"id": "networking", "name": "Networking", "icon": "Shield", "description": "Networking & Security", "subcategories": ["VPC", "Zero Trust", "IAM", "SSL/TLS"]},
            {"id": "linux", "name": "Linux", "icon": "Terminal", "description": "Linux / Windows systems", "subcategories": ["Linux", "Bash", "PowerShell", "Windows Server"]},
            {"id": "iac", "name": "IaC", "icon": "Package", "description": "Infrastructure as Code", "subcategories": ["Terraform", "Pulumi", "Ansible", "CloudFormation"]},
        ]
        await db.categories.insert_many(categories)
        logger.info("Categories seeded")

    # Seed sample article
    article_count = await db.articles.count_documents({})
    if article_count == 0:
        sample_content = """> **28 Domains · 15+ Roles · 8 Phases · Basic to Advanced · Free Resources Included**

> *By a Principal Platform Engineer working on Azure, AWS, Akamai, Kubernetes & AI*

---

## Why I Built This Roadmap (And Why Every Other One Is Wrong)

I have been in enterprise IT for over 20 years. I currently work as a **Principal Platform Engineer / Staff SRE / Cloud FinOps Architect** across a 70-country organisation, running Azure Landing Zones, multi-cloud Kubernetes platforms, Dynatrace, Datadog, Wiz, CyberArk, Okta, and Akamai at scale every single day.

Most IT roadmaps you find online are:
- Written by people with 2-3 years of experience
- Focused only on cloud certifications
- Missing critical domains like networking, security, and on-premises foundations
- Ignoring the business and leadership skills needed at senior levels

This roadmap is different. It covers **everything** — from your first Linux terminal command to architecting multi-cloud platforms for Fortune 500 companies.

---

## Phase 1: Foundation Layer — Learn How Computers Actually Work

Before cloud, before Kubernetes, before AI — you need to understand how technology fundamentally works.

### Operating Systems
- **Linux** (Ubuntu, RHEL, CentOS) — Learn the filesystem, processes, permissions, package management
- **Windows Server** — Active Directory, Group Policy, PowerShell administration
- **macOS** — For development environments

### Networking Fundamentals
- OSI Model and TCP/IP stack
- DNS, DHCP, HTTP/HTTPS, SSL/TLS
- Subnetting and CIDR notation
- Load balancers, reverse proxies, CDNs
- Firewalls, WAF, DDoS protection

### Scripting & Automation
- **Bash** — The language of Linux automation
- **PowerShell** — For Windows and Azure automation
- **Python** — The universal automation language

**Free Resources:**
- Linux Journey (linuxjourney.com)
- Professor Messer's Network+ Course (YouTube)
- Automate the Boring Stuff with Python

---

## Phase 2: Version Control & Collaboration

### Git
- Branching strategies (Git Flow, Trunk-Based Development)
- Pull requests and code reviews
- Git hooks and automation
- Monorepos vs polyrepos

### Platforms
- **GitHub** — Actions, Packages, Security features
- **GitLab** — CI/CD pipelines, built-in DevOps
- **Azure DevOps** — Repos, Boards, Pipelines

---

## Phase 3: Cloud Platforms

### Azure (Recommended First)
- **Compute:** VMs, App Service, Functions, Container Instances
- **Networking:** VNets, NSGs, Azure Firewall, Front Door, Traffic Manager
- **Storage:** Blob, Files, Queues, Tables
- **Databases:** Azure SQL, Cosmos DB, PostgreSQL Flexible Server
- **Identity:** Entra ID (Azure AD), Managed Identities, RBAC

### AWS
- **Compute:** EC2, Lambda, ECS, EKS
- **Networking:** VPC, ALB/NLB, Route 53, CloudFront
- **Storage:** S3, EFS, EBS
- **Databases:** RDS, DynamoDB, Aurora

### GCP
- Compute Engine, Cloud Functions, GKE
- Cloud Storage, BigQuery, Spanner

**Certifications to Target:**
- AZ-900 → AZ-104 → AZ-305 (Azure path)
- CLF-C02 → SAA-C03 → SAP-C02 (AWS path)

---

## Phase 4: Infrastructure as Code (IaC)

### Terraform
- HCL syntax, providers, modules
- State management (remote backends)
- Workspaces and environments
- Testing with Terratest

### Other IaC Tools
- **Pulumi** — IaC in real programming languages
- **Ansible** — Configuration management and automation
- **CloudFormation** — AWS-native IaC
- **Bicep** — Azure-native IaC

---

## Phase 5: Containers & Orchestration

### Docker
- Dockerfile best practices
- Multi-stage builds
- Container security scanning
- Docker Compose for local development

### Kubernetes
- **Core Concepts:** Pods, Services, Deployments, StatefulSets
- **Networking:** Ingress, Network Policies, Service Mesh (Istio)
- **Storage:** PVs, PVCs, StorageClasses
- **Security:** RBAC, Pod Security Standards, OPA/Gatekeeper
- **Managed K8s:** AKS, EKS, GKE

---

## Phase 6: CI/CD & DevOps Practices

### CI/CD Pipelines
- **GitHub Actions** — Workflows, reusable actions
- **Azure Pipelines** — YAML pipelines, deployment gates
- **Jenkins** — Plugin ecosystem, shared libraries
- **ArgoCD** — GitOps for Kubernetes

### DevOps Culture
- Shift-left security
- Observability (Prometheus, Grafana, Datadog, Dynatrace)
- Incident management and SRE practices
- Change management and release engineering

---

## Phase 7: Security & Compliance

### Zero Trust Architecture
- Identity-first security
- Micro-segmentation
- Least privilege access

### Security Tools
- **Wiz** — Cloud security posture management
- **CyberArk** — Privileged access management
- **Okta/ForgeRock** — Identity and access management
- **Veracode** — Application security testing
- **Akamai** — Web application firewall and DDoS protection

---

## Phase 8: Leadership & Architecture

### Enterprise Architecture
- TOGAF framework
- Well-Architected Frameworks (Azure, AWS)
- FinOps and cost optimization
- Disaster recovery and business continuity

### Soft Skills
- Technical writing and documentation
- Stakeholder management
- Mentoring and team building
- Vendor management and negotiations

---

## Final Thoughts

This roadmap is not meant to be completed in order. Your path will depend on your current role, interests, and the organizations you work with. The key is to build a **T-shaped skill set** — broad knowledge across all domains with deep expertise in 2-3 areas.

Remember: certifications open doors, but **real-world experience** and the ability to solve complex problems is what makes you an expert.

Start somewhere. Start today. The best time to begin was yesterday — the second best time is now.

---

*If you found this useful, subscribe to KloudVin for more deep-dive technical articles from the trenches of enterprise IT.*"""

        read_time = calculate_read_time(sample_content)
        await db.articles.insert_one({
            "slug": "the-complete-it-expert-roadmap-2026",
            "title": "The Complete IT Expert Roadmap 2026",
            "category": "General",
            "description": "From On-Premises Foundations to Cloud Architecture, AI Agents & Enterprise Scale",
            "content": sample_content,
            "author": "Vinod",
            "read_time": read_time,
            "published": True,
            "views": 0,
            "created_at": "2026-04-10T00:00:00+00:00",
            "updated_at": "2026-04-10T00:00:00+00:00",
        })
        logger.info("Sample article seeded")

    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.articles.create_index("slug", unique=True)
    await db.subscribers.create_index("email", unique=True)

    # Write test credentials
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write(f"# Test Credentials\n\n## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n## Auth Endpoints\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n")

@app.on_event("startup")
async def startup():
    await seed_data()

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
