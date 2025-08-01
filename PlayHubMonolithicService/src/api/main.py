from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
import json
import os
import hashlib
import secrets
import jwt
from datetime import datetime, timedelta
from enum import Enum

# Initialize FastAPI app with metadata
app = FastAPI(
    title="PlayHub API",
    description="A web-based mini-games platform with user management, game mechanics, and real-time multiplayer features",
    version="1.0.0",
    openapi_tags=[
        {"name": "health", "description": "Health check endpoints"},
        {"name": "auth", "description": "Authentication and authorization operations"},
        {"name": "users", "description": "User management operations"},
        {"name": "games", "description": "Game management and gameplay operations"},
        {"name": "scores", "description": "Score tracking and leaderboard operations"},
        {"name": "admin", "description": "Administrative operations"},
        {"name": "websocket", "description": "Real-time multiplayer WebSocket connections"}
    ]
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Data storage paths
DATA_DIR = "data"
USERS_FILE = os.path.join(DATA_DIR, "users.json")
GAMES_FILE = os.path.join(DATA_DIR, "games.json")  
SCORES_FILE = os.path.join(DATA_DIR, "scores.json")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize data files if they don't exist
def init_data_files():
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump({}, f)
    
    if not os.path.exists(GAMES_FILE):
        default_games = {
            "tic-tac-toe": {
                "id": "tic-tac-toe",
                "name": "Tic-Tac-Toe",
                "description": "Classic 3x3 grid game",
                "category": "strategy",
                "max_players": 2,
                "is_active": True
            },
            "memory-match": {
                "id": "memory-match",
                "name": "Memory Match",
                "description": "Match pairs of cards",
                "category": "memory",
                "max_players": 1,
                "is_active": True
            },
            "rock-paper-scissors": {
                "id": "rock-paper-scissors",
                "name": "Rock Paper Scissors",
                "description": "Classic hand game",
                "category": "strategy",
                "max_players": 2,
                "is_active": True
            }
        }
        with open(GAMES_FILE, 'w') as f:
            json.dump(default_games, f)
    
    if not os.path.exists(SCORES_FILE):
        with open(SCORES_FILE, 'w') as f:
            json.dump({}, f)

init_data_files()

# Pydantic models
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class GameCategory(str, Enum):
    STRATEGY = "strategy"
    MEMORY = "memory"
    PUZZLE = "puzzle"

class UserCreate(BaseModel):
    username: str = Field(..., description="Unique username for the user")
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=6, description="User password (minimum 6 characters)")
    full_name: Optional[str] = Field(None, description="User's full name")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User password")

class UserProfile(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str]
    role: UserRole
    created_at: str
    total_games: int = 0
    total_wins: int = 0

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, description="Updated username")
    full_name: Optional[str] = Field(None, description="Updated full name")
    email: Optional[EmailStr] = Field(None, description="Updated email address")

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserProfile

class GameCreate(BaseModel):
    name: str = Field(..., description="Game name")
    description: str = Field(..., description="Game description")
    category: GameCategory = Field(..., description="Game category")
    max_players: int = Field(1, ge=1, le=4, description="Maximum number of players")

class Game(BaseModel):
    id: str
    name: str
    description: str
    category: GameCategory
    max_players: int
    is_active: bool = True

class ScoreSubmit(BaseModel):
    game_id: str = Field(..., description="ID of the game")
    score: int = Field(..., ge=0, description="Score achieved")
    duration: Optional[int] = Field(None, description="Game duration in seconds")
    won: bool = Field(False, description="Whether the player won")

class Score(BaseModel):
    id: str
    user_id: str
    username: str
    game_id: str
    game_name: str
    score: int
    duration: Optional[int]
    won: bool
    created_at: str

class LeaderboardEntry(BaseModel):
    username: str
    total_score: int
    total_games: int
    total_wins: int
    win_percentage: float

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.game_rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if room:
            if room not in self.game_rooms:
                self.game_rooms[room] = []
            self.game_rooms[room].append(websocket)

    def disconnect(self, websocket: WebSocket, room: str = None):
        self.active_connections.remove(websocket)
        if room and room in self.game_rooms:
            self.game_rooms[room].remove(websocket)
            if not self.game_rooms[room]:
                del self.game_rooms[room]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_room(self, message: str, room: str):
        if room in self.game_rooms:
            for connection in self.game_rooms[room]:
                await connection.send_text(message)

manager = ConnectionManager()

# Utility functions
def load_json_file(filepath: str) -> dict:
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_json_file(filepath: str, data: dict):
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        users = load_json_file(USERS_FILE)
        if user_id not in users:
            raise HTTPException(status_code=401, detail="User not found")
        
        return users[user_id]
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def get_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# PUBLIC_INTERFACE
@app.get("/", tags=["health"])
def health_check():
    """Health check endpoint to verify service status."""
    return {"message": "PlayHub API is healthy", "status": "ok"}

# PUBLIC_INTERFACE
@app.post("/auth/register", response_model=Token, tags=["auth"])
def register_user(user_data: UserCreate):
    """
    Register a new user account.
    
    Creates a new user with the provided information and returns an access token.
    """
    users = load_json_file(USERS_FILE)
    
    # Check if user already exists
    for user in users.values():
        if user["email"] == user_data.email or user["username"] == user_data.username:
            raise HTTPException(status_code=400, detail="User already exists")
    
    # Create new user
    user_id = secrets.token_urlsafe(16)
    new_user = {
        "id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "role": UserRole.USER.value,
        "created_at": datetime.utcnow().isoformat(),
        "total_games": 0,
        "total_wins": 0
    }
    
    users[user_id] = new_user
    save_json_file(USERS_FILE, users)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    # Return user profile without password
    user_profile = UserProfile(**{k: v for k, v in new_user.items() if k != "password"})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_profile
    }

# PUBLIC_INTERFACE
@app.post("/auth/login", response_model=Token, tags=["auth"])
def login_user(user_data: UserLogin):
    """
    Authenticate user and return access token.
    
    Validates user credentials and returns an access token for API access.
    """
    users = load_json_file(USERS_FILE)
    
    # Find user by email
    user = None
    for u in users.values():
        if u["email"] == user_data.email:
            user = u
            break
    
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["id"]}, expires_delta=access_token_expires
    )
    
    # Return user profile without password
    user_profile = UserProfile(**{k: v for k, v in user.items() if k != "password"})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_profile
    }

# PUBLIC_INTERFACE
@app.get("/users/profile", response_model=UserProfile, tags=["users"])
def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile information."""
    return UserProfile(**{k: v for k, v in current_user.items() if k != "password"})

# PUBLIC_INTERFACE
@app.put("/users/profile", response_model=UserProfile, tags=["users"])
def update_user_profile(user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update current user's profile information."""
    users = load_json_file(USERS_FILE)
    user_id = current_user["id"]
    
    if user_update.username:
        # Check if username is already taken
        for uid, user in users.items():
            if uid != user_id and user["username"] == user_update.username:
                raise HTTPException(status_code=400, detail="Username already taken")
        users[user_id]["username"] = user_update.username
    
    if user_update.email:
        # Check if email is already taken
        for uid, user in users.items():
            if uid != user_id and user["email"] == user_update.email:
                raise HTTPException(status_code=400, detail="Email already taken")
        users[user_id]["email"] = user_update.email
    
    if user_update.full_name is not None:
        users[user_id]["full_name"] = user_update.full_name
    
    save_json_file(USERS_FILE, users)
    
    return UserProfile(**{k: v for k, v in users[user_id].items() if k != "password"})

# PUBLIC_INTERFACE
@app.get("/games", response_model=List[Game], tags=["games"])
def list_games():
    """Get list of all available games."""
    games = load_json_file(GAMES_FILE)
    return [Game(**game) for game in games.values() if game.get("is_active", True)]

# PUBLIC_INTERFACE
@app.get("/games/{game_id}", response_model=Game, tags=["games"])
def get_game(game_id: str):
    """Get details of a specific game by ID."""
    games = load_json_file(GAMES_FILE)
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    return Game(**games[game_id])

# PUBLIC_INTERFACE
@app.post("/scores", response_model=Score, tags=["scores"])
def submit_score(score_data: ScoreSubmit, current_user: dict = Depends(get_current_user)):
    """
    Submit a game score.
    
    Records a player's score for a specific game and updates their statistics.
    """
    games = load_json_file(GAMES_FILE)
    if score_data.game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    scores = load_json_file(SCORES_FILE)
    
    # Create score record
    score_id = secrets.token_urlsafe(16)
    score_record = {
        "id": score_id,
        "user_id": current_user["id"],
        "username": current_user["username"],
        "game_id": score_data.game_id,
        "game_name": games[score_data.game_id]["name"],
        "score": score_data.score,
        "duration": score_data.duration,
        "won": score_data.won,
        "created_at": datetime.utcnow().isoformat()
    }
    
    scores[score_id] = score_record
    save_json_file(SCORES_FILE, scores)
    
    # Update user statistics
    user_id = current_user["id"]
    users[user_id]["total_games"] = users[user_id].get("total_games", 0) + 1
    if score_data.won:
        users[user_id]["total_wins"] = users[user_id].get("total_wins", 0) + 1
    save_json_file(USERS_FILE, users)
    
    return Score(**score_record)

# PUBLIC_INTERFACE
@app.get("/scores/user", response_model=List[Score], tags=["scores"])
def get_user_scores(current_user: dict = Depends(get_current_user), limit: int = 50):
    """Get current user's game scores with optional limit."""
    scores = load_json_file(SCORES_FILE)
    user_scores = [
        Score(**score) for score in scores.values() 
        if score["user_id"] == current_user["id"]
    ]
    # Sort by created_at descending and limit
    user_scores.sort(key=lambda x: x.created_at, reverse=True)
    return user_scores[:limit]

# PUBLIC_INTERFACE
@app.get("/leaderboard", response_model=List[LeaderboardEntry], tags=["scores"])
def get_leaderboard(game_id: Optional[str] = None, limit: int = 10):
    """
    Get global leaderboard or game-specific leaderboard.
    
    Returns top players by total score, games played, and win percentage.
    """
    scores = load_json_file(SCORES_FILE)
    users = load_json_file(USERS_FILE)
    
    # Calculate user statistics
    user_stats = {}
    for score in scores.values():
        user_id = score["user_id"]
        if game_id and score["game_id"] != game_id:
            continue
            
        if user_id not in user_stats:
            user_stats[user_id] = {
                "username": score["username"],
                "total_score": 0,
                "total_games": 0,
                "total_wins": 0
            }
        
        user_stats[user_id]["total_score"] += score["score"]
        user_stats[user_id]["total_games"] += 1
        if score["won"]:
            user_stats[user_id]["total_wins"] += 1
    
    # Create leaderboard entries
    leaderboard = []
    for stats in user_stats.values():
        win_percentage = (stats["total_wins"] / stats["total_games"] * 100) if stats["total_games"] > 0 else 0
        leaderboard.append(LeaderboardEntry(
            username=stats["username"],
            total_score=stats["total_score"],
            total_games=stats["total_games"],
            total_wins=stats["total_wins"],
            win_percentage=round(win_percentage, 2)
        ))
    
    # Sort by total score descending
    leaderboard.sort(key=lambda x: x.total_score, reverse=True)
    return leaderboard[:limit]

# Admin endpoints
# PUBLIC_INTERFACE
@app.get("/admin/users", response_model=List[UserProfile], tags=["admin"])
def list_all_users(admin_user: dict = Depends(get_admin_user)):
    """Admin endpoint to list all users."""
    users = load_json_file(USERS_FILE)
    return [UserProfile(**{k: v for k, v in user.items() if k != "password"}) for user in users.values()]

# PUBLIC_INTERFACE
@app.post("/admin/games", response_model=Game, tags=["admin"])
def create_game(game_data: GameCreate, admin_user: dict = Depends(get_admin_user)):
    """Admin endpoint to create a new game."""
    games = load_json_file(GAMES_FILE)
    
    game_id = game_data.name.lower().replace(" ", "-")
    if game_id in games:
        raise HTTPException(status_code=400, detail="Game already exists")
    
    new_game = {
        "id": game_id,
        "name": game_data.name,
        "description": game_data.description,
        "category": game_data.category.value,
        "max_players": game_data.max_players,
        "is_active": True
    }
    
    games[game_id] = new_game
    save_json_file(GAMES_FILE, games)
    
    return Game(**new_game)

# PUBLIC_INTERFACE
@app.delete("/admin/games/{game_id}", tags=["admin"])
def delete_game(game_id: str, admin_user: dict = Depends(get_admin_user)):
    """Admin endpoint to delete a game."""
    games = load_json_file(GAMES_FILE)
    if game_id not in games:
        raise HTTPException(status_code=404, detail="Game not found")
    
    del games[game_id]
    save_json_file(GAMES_FILE, games)
    
    return {"message": "Game deleted successfully"}

# WebSocket endpoints
# PUBLIC_INTERFACE
@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """
    WebSocket endpoint for real-time multiplayer games.
    
    Handles real-time communication between players in a game room.  
    Players can join rooms, send moves, and receive game state updates.
    """
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Broadcast message to all players in the room
            await manager.broadcast_to_room(
                json.dumps({
                    "type": message.get("type", "message"),
                    "data": message.get("data"),
                    "timestamp": datetime.utcnow().isoformat()
                }),
                room_id
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)

# PUBLIC_INTERFACE
@app.get("/ws/docs", tags=["websocket"])
def websocket_documentation():
    """
    WebSocket usage documentation.
    
    Provides information on how to connect to and use WebSocket endpoints
    for real-time multiplayer functionality.
    """
    return {
        "websocket_url": "/ws/{room_id}",
        "description": "Connect to a game room for real-time multiplayer",
        "message_format": {
            "type": "move|chat|join|leave",
            "data": "game-specific data or message content"
        },
        "example_usage": "Connect to /ws/tic-tac-toe-room-123 to join a Tic-Tac-Toe game"
    }

# Mount static files (this will serve the React frontend)
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve React app
@app.get("/{full_path:path}")
def serve_react_app(full_path: str):
    """Serve React frontend application."""
    if full_path.startswith("api/") or full_path.startswith("ws/"):
        raise HTTPException(status_code=404, detail="Not found")
    
    static_file_path = f"static/{full_path}"
    if os.path.exists(static_file_path) and os.path.isfile(static_file_path):
        return FileResponse(static_file_path)
    
    # Serve index.html for SPA routing
    index_path = "static/index.html"
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"message": "React frontend not built yet. Please run the build process."}
