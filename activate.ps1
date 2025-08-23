# --- Create Root Project Directory ---
New-Item -ItemType Directory -Name "lead-management-app"
Set-Location "lead-management-app"

# --- Backend Setup ---
New-Item -ItemType Directory -Name "backend"
Set-Location "backend"

# Create backend directories
New-Item -ItemType Directory -Name "src"
New-Item -ItemType Directory -Name "src/api"
New-Item -ItemType Directory -Name "src/api/controllers"
New-Item -ItemType Directory -Name "src/api/models"
New-Item -ItemType Directory -Name "src/api/routes"
New-Item -ItemType Directory -Name "src/config"

# Create backend files
New-Item -ItemType File -Name "server.js"
New-Item -ItemType File -Name "src/app.js"
New-Item -ItemType File -Name "src/config/db.js"
New-Item -ItemType File -Name "src/api/controllers/auth.controller.js"
New-Item -ItemType File -Name "src/api/controllers/leads.controller.js"
New-Item -ItemType File -Name "src/api/models/user.model.js"
New-Item -ItemType File -Name "src/api/models/lead.model.js"
New-Item -ItemType File -Name "src/api/routes/auth.routes.js"
New-Item -ItemType File -Name "src/api/routes/leads.routes.js"

# Create backend .env and package.json
New-Item -ItemType File -Name ".env"
New-Item -ItemType File -Name "package.json"

Set-Location ".."

# --- Frontend Setup ---
New-Item -ItemType Directory -Name "frontend"
Set-Location "frontend"

# Create frontend directories
New-Item -ItemType Directory -Name "src"
New-Item -ItemType Directory -Name "src/components"

# Create frontend files
New-Item -ItemType File -Name "src/index.js"
New-Item -ItemType File -Name "src/App.js"
New-Item -ItemType File -Name "src/components/AuthPage.js"
New-Item -ItemType File -Name "src/components/LeadsDashboard.js"
New-Item -ItemType File -Name "src/components/LeadModal.js"
New-Item -ItemType File -Name "src/components/DeleteModal.js"
New-Item -ItemType File -Name "src/index.css" # Assuming you have this for base styles

# Create frontend .env and package.json
New-Item -ItemType File -Name ".env"
New-Item -ItemType File -Name "package.json"

Set-Location ".."

Write-Host "Project structure created successfully!"
