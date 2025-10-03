from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# JWT Configuration
JWT_SECRET = "career_guidance_secret_key_2024"
JWT_ALGORITHM = "HS256"

# LLM Configuration
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    profile_completed: bool = False

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    user_id: str
    academic_level: str  # "high_school", "undergraduate", "postgraduate"
    current_class: Optional[str] = None  # "class_9", "class_10", "class_11", "class_12"
    stream: Optional[str] = None  # "science", "commerce", "arts"
    subjects: List[str] = []
    grades: Dict[str, Any] = {}
    interests: List[str] = []
    strengths: List[str] = []
    career_goals: Optional[str] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Assessment Models
class AssessmentResponse(BaseModel):
    user_id: str
    question_id: str
    response: str
    category: str  # "interest", "aptitude", "personality"

class CareerRecommendation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    career_path: str
    description: str
    education_required: List[str]
    skills_needed: List[str]
    salary_range: str
    job_prospects: str
    confidence_score: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Chat Models
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    message: str
    response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(user_id: str) -> str:
    payload = {"user_id": user_id, "exp": datetime.now(timezone.utc).timestamp() + 86400}  # 24 hours
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

from fastapi import Header

async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization token required")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        user_doc = await db.users.find_one({"id": user_id})
        if not user_doc:
            raise HTTPException(status_code=401, detail="User not found")
            
        return User(**user_doc)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Initialize LLM Chat
async def get_career_llm_chat(system_message: str = None):
    default_system = """You are an expert AI career counselor specializing in the Indian education system and job market. 
    You provide personalized, accurate, and practical career guidance to students from Class 9 to undergraduate level.
    
    Your expertise includes:
    - Indian education system (CBSE, ICSE, State boards)
    - Engineering careers (CSE, ECE, Mechanical, Civil, etc.)
    - Medical careers (MBBS, BDS, Nursing, Pharmacy, etc.)
    - Commerce careers (CA, CS, CFA, MBA, etc.)
    - Arts and Humanities careers (Journalism, Psychology, Literature, etc.)
    - Government jobs and competitive exams
    - Emerging career fields (Data Science, AI/ML, Digital Marketing, etc.)
    
    Always provide specific, actionable advice with:
    - Educational requirements and pathways
    - Skill development recommendations
    - Job market prospects in India
    - Salary expectations
    - Top colleges/institutions"""
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id="career_guidance",
        system_message=system_message or default_system
    ).with_model("openai", "gpt-4o")
    
    return chat

# Authentication Endpoints
@api_router.post("/auth/register")
async def register_user(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=hashed_password
    )
    
    # Store in database
    await db.users.insert_one(user.dict())
    
    # Create access token
    access_token = create_access_token(user.id)
    
    return {
        "message": "User registered successfully",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
    }

@api_router.post("/auth/login")
async def login_user(login_data: UserLogin):
    # Find user by email
    user_doc = await db.users.find_one({"email": login_data.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = User(**user_doc)
    
    # Verify password
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create access token
    access_token = create_access_token(user.id)
    
    return {
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "profile_completed": user.profile_completed
        }
    }

# Profile Endpoints
@api_router.post("/profile")
async def create_profile(profile_data: UserProfile, authorization: str = None):
    user = await get_current_user(authorization)
    
    # Store profile
    profile_dict = profile_data.dict()
    await db.user_profiles.insert_one(profile_dict)
    
    # Update user profile_completed status
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"profile_completed": True}}
    )
    
    return {"message": "Profile created successfully"}

@api_router.get("/profile")
async def get_profile(authorization: str = None):
    user = await get_current_user(authorization)
    
    profile_doc = await db.user_profiles.find_one({"user_id": user.id})
    if not profile_doc:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return UserProfile(**profile_doc)

# Career Assessment Endpoints
@api_router.post("/assessment/analyze")
async def analyze_career_fit(profile_data: UserProfile, authorization: str = None):
    user = await get_current_user(authorization)
    
    try:
        # Prepare analysis prompt
        analysis_prompt = f"""
        Analyze this Indian student's profile and provide top 5 career recommendations:
        
        Academic Level: {profile_data.academic_level}
        Current Class: {profile_data.current_class}
        Stream: {profile_data.stream}
        Subjects: {', '.join(profile_data.subjects)}
        Interests: {', '.join(profile_data.interests)}
        Strengths: {', '.join(profile_data.strengths)}
        Career Goals: {profile_data.career_goals}
        Grades: {profile_data.grades}
        
        For each career recommendation, provide:
        1. Career path name
        2. Brief description (2-3 sentences)
        3. Educational requirements
        4. Key skills needed
        5. Salary range in India
        6. Job market prospects
        7. Confidence score (0.1-1.0)
        
        Format as JSON array of career objects.
        """
        
        # Get LLM analysis
        chat = await get_career_llm_chat()
        user_message = UserMessage(text=analysis_prompt)
        response = await chat.send_message(user_message)
        
        # Parse and store recommendations
        # Note: In production, you'd want to parse JSON properly
        # For now, returning the AI response directly
        
        return {
            "analysis": response,
            "recommendations_generated": True,
            "user_id": user.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Chatbot Endpoints
@api_router.post("/chat")
async def chat_with_bot(chat_request: ChatRequest, authorization: str = None):
    user = await get_current_user(authorization)
    
    try:
        # Get user profile for context
        profile_doc = await db.user_profiles.find_one({"user_id": user.id})
        context = ""
        
        if profile_doc:
            profile = UserProfile(**profile_doc)
            context = f"""
            User Context:
            - Name: {user.name}
            - Academic Level: {profile.academic_level}
            - Stream: {profile.stream}
            - Interests: {', '.join(profile.interests)}
            - Current Goals: {profile.career_goals}
            
            Please provide personalized guidance based on this context.
            """
        
        # Prepare chatbot message
        full_message = f"{context}\n\nUser Question: {chat_request.message}"
        
        # Get LLM response
        chat = await get_career_llm_chat()
        user_message = UserMessage(text=full_message)
        response = await chat.send_message(user_message)
        
        # Store chat history
        chat_record = ChatMessage(
            user_id=user.id,
            message=chat_request.message,
            response=response
        )
        await db.chat_history.insert_one(chat_record.dict())
        
        return {
            "response": response,
            "timestamp": datetime.now(timezone.utc)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@api_router.get("/chat/history")
async def get_chat_history(authorization: str = None):
    user = await get_current_user(authorization)
    
    chat_docs = await db.chat_history.find({"user_id": user.id}).sort("timestamp", -1).limit(20).to_list(20)
    return [ChatMessage(**doc) for doc in chat_docs]

# Career Information Endpoints
@api_router.get("/careers/domains")
async def get_career_domains():
    domains = {
        "engineering": {
            "name": "Engineering & Technology",
            "fields": ["Computer Science", "Electronics", "Mechanical", "Civil", "Chemical", "Aerospace", "Biotechnology"]
        },
        "medical": {
            "name": "Medical & Healthcare",
            "fields": ["MBBS", "BDS", "Nursing", "Pharmacy", "Physiotherapy", "Veterinary", "Public Health"]
        },
        "commerce": {
            "name": "Commerce & Finance",
            "fields": ["Chartered Accountancy", "Company Secretary", "Banking", "Investment Banking", "Financial Analysis", "Actuarial Science"]
        },
        "arts": {
            "name": "Arts & Humanities",
            "fields": ["Psychology", "Journalism", "Literature", "History", "Political Science", "Sociology", "Fine Arts"]
        },
        "science": {
            "name": "Pure Sciences",
            "fields": ["Physics", "Chemistry", "Mathematics", "Biology", "Environmental Science", "Research"]
        },
        "government": {
            "name": "Government & Services",
            "fields": ["IAS", "IPS", "IFS", "Defense", "Teaching", "Banking", "Railways"]
        }
    }
    return domains

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "AI Career Guidance API - Ready to help students find their perfect career path!"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()