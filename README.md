# Image Caption Generator 🔖


A full-stack AI-powered solution for generating social media captions from images_

## Features ✨

- 🖼️ Image-to-Caption AI Generation
- 🎚️ Tone Customization (Formal/Casual/Funny)
- #️⃣ Smart Hashtag Suggestions
- ⭐ Caption Rating System
- 🔒 Social Media Authentication
- 📜 Generation History
- 🌓 Dark/Light Mode
- 📱 Responsive Design

## Tech Stack 🛠️

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 | Framework |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| Shadcn UI | Component Library |

### Backend
| Technology | Purpose |
|------------|---------|
| Django 4 | Core Framework |
| DRF | REST APIs |
| PostgreSQL | Production DB |
| JWT | Authentication |
| Django-allauth | Social Login |

## Setup Guide 🚀

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL (for production)

## Backend Installation

 ### Clone repository
```bash
git clone https://github.com/Rishabh050803/Image-caption-generator.git
cd Image-caption-app
```

 ### Create virtual environment
```bash
python -m venv .venv
```
### Activate Virtual Environment
```bash
#On Linux/macOS:
source .venv/bin/activate

#On Windows
.venv\Scripts\activate
```
### Install dependencies
```bash
pip install -r requirement.txt
```

### Configure environment
```bash
cp caption_backend/.env.example caption_backend/.env
nano caption_backend/.env  # Update with your credentials
```

### Database setup
```bash
cd caption_backend
python manage.py migrate
python manage.py createsuperuser
```

### Run server
```bash
python manage.py runserver
```

## Frontend Setup
### Navigate to the Frontend Directory:
```bash
cd front-end
```

### Install Dependencies:
```bash
npm install
# or
yarn install
```

### Create a .env.local File:
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

### Run the Development Server:
```bash
npm run dev
# or
yarn run dev
```
The frontend will be available at http://localhost:3000/


## User Flow

1. **Register/Login**
   - Create an account or log in using email or a social provider (Google, GitHub).

2. **Upload Image**  
   - Upload the image you want to generate a caption for.

3. **Generate Caption**  
   - Choose options (tone, style, hashtags) and click the **Generate** button.

4. **Customize**  
   - Edit the caption as needed—adjust tone or add hashtags manually.

5. **Rate the Caption**  
   - Provide feedback by rating the generated caption.

6. **History**  
   - View and reuse your previously generated captions.


## API Endpoints

| Endpoint                  | Method | Description                                  |
|---------------------------|--------|----------------------------------------------|
| `/api/generate-caption/`  | POST   | Generate a basic caption for an image.      |
| `/api/refine-caption/`    | POST   | Refine a caption with tone, style, etc.     |
| `/api/get-hashtags/`      | POST   | Generate hashtags for a caption.            |
| `/api/captions/rate/`     | POST   | Submit a rating for a caption.              |
| `/api/captions/ratings/`  | GET    | Get user's rated captions.                  |
| `/auth/registration/`     | POST   | Register a new user.                        |
| `/auth/login/`            | POST   | Log in a user.                              |
| `/auth/logout/`           | POST   | Log out a user.                             |




## Project Structure

```plaintext
Image-caption-app/
├── caption_backend/         # Django backend
│   ├── api/                 # API endpoints
│   ├── caption_backend/     # Project settings
│   └── ...
├── front-end/               # Next.js frontend
│   ├── app/                 # Next.js app pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities and services
│   └── ...
└── requirements.txt         # Python dependencies
```



## Contributing
1. **Fork the Repository**
2. **Create a Feature Branch:**
    ```bash
    git checkout -b feature/amazing-feature
    ```

3. **Commit Your Changes:**
    ```bash
    git commit -m 'Add some amazing feature'
    ```
4. **Push to Your Branch:**
    ```bash
    git push origin feature/amazing-feature
    ```
5. **Open a Pull Request.**
