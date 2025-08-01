# 🎮 PlayHub - Mini Games Platform

PlayHub is a colorful and user-friendly web-based mini-games platform that allows users to play a variety of casual games like Tic-Tac-Toe, Memory Match, and Rock-Paper-Scissors. The platform features user registration and authentication, profile management, score tracking, global leaderboards, and an admin dashboard.

## ✨ Features

### 🎯 For Players
- **Multiple Games**: Play Tic-Tac-Toe, Memory Match, and Rock-Paper-Scissors
- **User Authentication**: Secure registration and login with email/password
- **Profile Management**: Edit profile information and view gaming statistics
- **Score Tracking**: Automatic score recording and game history
- **Global Leaderboards**: Compete with players worldwide
- **Real-time Multiplayer**: WebSocket-based real-time game features
- **Responsive Design**: Colorful, modern UI that works on all devices

### 🛡️ For Administrators
- **Admin Dashboard**: Comprehensive platform management
- **User Management**: View and manage registered users
- **Game Management**: Add, edit, and delete games
- **Platform Statistics**: Monitor user activity and engagement
- **System Health**: Check API and database status

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with Python
- **Authentication**: JWT-based authentication
- **Storage**: JSON file-based database (easily migrable to MongoDB)
- **API**: RESTful API with OpenAPI documentation
- **WebSockets**: Real-time multiplayer support

### Frontend (React)
- **Framework**: React 18 with React Router
- **Styling**: Custom CSS with gradient designs and animations
- **Icons**: Lucide React icons
- **HTTP Client**: Axios for API communication
- **State Management**: React Context for authentication

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd samplegaming/PlayHubMonolithicService
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Build the frontend**:
   ```bash
   python build_frontend.py
   ```

4. **Start the server**:
   ```bash
   python start.py
   ```

5. **Access the application**:
   - Frontend: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - Admin Panel: http://localhost:8000/admin

### Demo Accounts

The system comes with pre-configured demo accounts:

**Regular User**:
- Email: `demo@playhub.com`
- Password: `demo123`

**Administrator**:
- Email: `admin@playhub.com`
- Password: `admin123`

## 🎮 Available Games

### Tic-Tac-Toe
- Classic 3x3 grid game
- Play against AI opponent
- Win by getting three in a row
- Scoring: Win = 100pts, Draw = 50pts

### Memory Match
- Match pairs of cards
- Test your memory skills
- Score based on time and moves
- Single player game

### Rock Paper Scissors
- Classic hand game
- Play against computer
- Best of multiple rounds
- Scoring: Win = 10pts, Draw = 5pts

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Users
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile

### Games
- `GET /games` - List all games
- `GET /games/{game_id}` - Get specific game

### Scores
- `POST /scores` - Submit game score
- `GET /scores/user` - Get user scores
- `GET /leaderboard` - Get global leaderboard

### Admin (Requires admin role)
- `GET /admin/users` - List all users
- `POST /admin/games` - Create new game
- `DELETE /admin/games/{game_id}` - Delete game

### WebSocket
- `WS /ws/{room_id}` - Real-time multiplayer connection

## 🔧 Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Key configuration options:
- `SECRET_KEY`: JWT signing secret (change in production)
- `SITE_URL`: Frontend URL for redirects
- `DEBUG`: Enable debug mode

## 📁 Project Structure

```
PlayHubMonolithicService/
├── src/
│   └── api/
│       ├── main.py              # FastAPI application
│       ├── generate_openapi.py  # OpenAPI schema generator
│       └── __init__.py
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/              # Page components
│   │   ├── App.js              # Main React app
│   │   └── index.js            # React entry point
│   ├── public/
│   └── package.json
├── static/                      # Built frontend files
├── data/                        # JSON database files
│   ├── users.json
│   ├── games.json
│   └── scores.json
├── interfaces/
│   └── openapi.json            # API specification
├── start.py                    # Server startup script
├── build_frontend.py           # Frontend build script
├── requirements.txt            # Python dependencies
└── README.md
```

## 🎨 Design Features

- **Colorful Gradients**: Beautiful gradient backgrounds and buttons
- **Smooth Animations**: Hover effects and transitions
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Modern Typography**: Clean, readable fonts
- **Interactive Elements**: Engaging game interfaces
- **Loading States**: Smooth loading indicators

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: SHA-256 password hashing
- **CORS Configuration**: Proper cross-origin request handling
- **Input Validation**: Pydantic model validation
- **Error Handling**: Comprehensive error responses

## 📈 Future Enhancements

- **Database Migration**: Move from JSON to MongoDB/PostgreSQL
- **OAuth Integration**: Google and GitHub login
- **Email Notifications**: Account verification and notifications
- **More Games**: Additional mini-game implementations
- **Tournaments**: Organized competitive events
- **Friends System**: Add and compete with friends
- **Chat System**: In-game messaging
- **Mobile App**: React Native mobile application

## 🧪 Development

### Running in Development Mode

1. **Start the backend with auto-reload**:
   ```bash
   uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the frontend development server**:
   ```bash
   cd frontend
   npm start
   ```

### Building for Production

1. **Build the frontend**:
   ```bash
   python build_frontend.py
   ```

2. **Run the production server**:
   ```bash
   python start.py
   ```

### API Documentation

The API documentation is automatically generated and available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Acknowledgments

- FastAPI for the excellent Python web framework
- React team for the amazing frontend library
- Lucide for beautiful icons
- All the beta testers and contributors

---

**Happy Gaming! 🎮✨**
