# Postman API Testing Guide — Quiz App Backend

Date: January 22, 2026

Base URL (local): http://localhost:5000/api/v1

## 1) Environment Setup (Postman)
Create a Postman environment named "QuizApp Local" with these variables:
- baseUrl: http://localhost:5000/api/v1
- accessToken: (empty)
- refreshToken: (empty)
- testId: (empty)
- questionId: (empty)
- attemptId: (empty)

## 2) Auth Flow
### 2.1 Register User
- Method: POST
- URL: {{baseUrl}}/auth/register
- Body (JSON):
  {
    "name": "Student One",
    "email": "student1@gmail.com",
    "password": "password123"
  }

### 2.2 Login User
- Method: POST
- URL: {{baseUrl}}/auth/login
- Body (JSON):
  {
    "email": "student1@gmail.com",
    "password": "password123"
  }
- Save from response:
  - accessToken -> environment variable accessToken
  - refreshToken -> environment variable refreshToken

### 2.3 Refresh Token
- Method: POST
- URL: {{baseUrl}}/auth/refresh
- Body (JSON):
  {
    "refreshToken": "{{refreshToken}}"
  }

### 2.4 Logout
- Method: POST
- URL: {{baseUrl}}/auth/logout
- Header: Authorization: Bearer {{accessToken}}

## 3) User Profile
### 3.1 Get Current User
- Method: GET
- URL: {{baseUrl}}/users/me
- Header: Authorization: Bearer {{accessToken}}

## 4) Admin/Teacher Test Management
Login as admin:
Email: admin@gmail.com
Password: admin

### 4.1 Create Test (Admin)
- Method: POST
- URL: {{baseUrl}}/tests
- Header: Authorization: Bearer {{accessToken}}
- Body (JSON):
  {
    "title": "Math Basics",
    "subject": "Math",
    "durationMinutes": 30,
    "status": "ACTIVE"
  }
- Save test id as testId.

### 4.2 List Tests
- Method: GET
- URL: {{baseUrl}}/tests?page=1&limit=10
- Header: Authorization: Bearer {{accessToken}}

### 4.3 Update Test
- Method: PATCH
- URL: {{baseUrl}}/tests/{{testId}}
- Header: Authorization: Bearer {{accessToken}}
- Body (JSON):
  {
    "durationMinutes": 45
  }

## 5) Question Management
### 5.1 Create Question (Admin)
- Method: POST
- URL: {{baseUrl}}/questions
- Header: Authorization: Bearer {{accessToken}}
- Body (JSON):
  {
    "subject": "Math",
    "text": "What is 2 + 2?",
    "options": ["1", "2", "3", "4"],
    "correctIndex": 3,
    "difficulty": "EASY",
    "isBank": true
  }

### 5.2 List Questions
- Method: GET
- URL: {{baseUrl}}/questions?page=1&limit=10&subject=Math
- Header: Authorization: Bearer {{accessToken}}

### 5.3 Update Question
- Method: PATCH
- URL: {{baseUrl}}/questions/{{questionId}}
- Header: Authorization: Bearer {{accessToken}}
- Body (JSON):
  {
    "text": "What is 3 + 3?",
    "options": ["4", "5", "6", "7"],
    "correctIndex": 2
  }

### 5.4 Delete Question
- Method: DELETE
- URL: {{baseUrl}}/questions/{{questionId}}
- Header: Authorization: Bearer {{accessToken}}

## 6) Generate Questions for Test (From Bank)
- Method: POST
- URL: {{baseUrl}}/tests/{{testId}}/generate-questions
- Header: Authorization: Bearer {{accessToken}}
- Body (JSON):
  {
    "subject": "Math",
    "difficulty": "EASY",
    "count": 5
  }

## 7) AI Questions via Document (Gemini)
### 7.1 Generate Pending Questions
- Method: POST
- URL: {{baseUrl}}/tests/{{testId}}/ai-questions
- Header: Authorization: Bearer {{accessToken}}
- Body: form-data
  - file: (upload PDF/DOCX/TXT)
  - subject: Math
  - easyCount: 2
  - mediumCount: 2
  - hardCount: 1

### 7.2 List Pending Questions (Filter)
- Method: GET
- URL: {{baseUrl}}/questions?testId={{testId}}&approvalStatus=PENDING
- Header: Authorization: Bearer {{accessToken}}

### 7.3 Approve Pending Questions
- Method: POST
- URL: {{baseUrl}}/tests/{{testId}}/ai-questions/approve
- Header: Authorization: Bearer {{accessToken}}
- Body (JSON):
  {
    "questionIds": ["<id1>", "<id2>"]
  }

## 8) Attempts & Results
### 8.1 Start Attempt (Student)
- Method: POST
- URL: {{baseUrl}}/attempts
- Header: Authorization: Bearer {{accessToken}}
- Body (JSON):
  {
    "testId": "{{testId}}"
  }
- Save attemptId.

### 8.2 Submit Attempt
- Method: POST
- URL: {{baseUrl}}/attempts/{{attemptId}}/submit
- Header: Authorization: Bearer {{accessToken}}
- Body (JSON):
  {
    "status": "SUBMITTED",
    "answers": [
      { "questionId": "<questionId>", "selectedIndex": 2 }
    ]
  }

### 8.3 List Attempts (Admin)
- Method: GET
- URL: {{baseUrl}}/attempts?page=1&limit=10&testId={{testId}}
- Header: Authorization: Bearer {{accessToken}}

### 8.4 Test Results (Admin)
- Method: GET
- URL: {{baseUrl}}/analytics/tests/{{testId}}/results
- Header: Authorization: Bearer {{accessToken}}

## 9) Health Check
- Method: GET
- URL: http://localhost:5000/health

## Notes
- Use admin credentials to create tests and approve AI questions.
- Students can list only ACTIVE tests by default.
- For Gemini, ensure GEMINI_API_KEY is set in .env.
