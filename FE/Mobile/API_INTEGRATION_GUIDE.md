# API Integration Guide

## Base URL
The API base URL is configured as: `http://localhost:8001/api`

## Authentication Endpoints

### 1. Login
- **Endpoint**: `POST /auth/login`
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Success Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "fullName": "User Name",
      "role": "user"
    }
  }
}
```
- **Error Response**:
```json
{
  "success": false,
  "message": "Invalid credentials",
  "errors": {
    "email": "Email is required",
    "password": "Password is required"
  }
}
```

### 2. Register
- **Endpoint**: `POST /auth/register`
- **Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "1234567890",
  "password": "password123",
  "confirmPassword": "password123"
}
```
- **Success Response**:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "john@example.com",
      "fullName": "John Doe"
    }
  }
}
```

### 3. Logout
- **Endpoint**: `POST /auth/logout`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 4. Forgot Password
- **Endpoint**: `POST /auth/forgot-password`
- **Request Body**:
```json
{
  "email": "user@example.com"
}
```

### 5. Reset Password
- **Endpoint**: `POST /auth/reset-password`
- **Request Body**:
```json
{
  "token": "reset_token",
  "password": "new_password"
}
```

## Testing with Mock Server

If you want to test the frontend without a real backend, you can use a mock server:

1. Install json-server: `npm install -g json-server`
2. Create a mock API response file
3. Run: `json-server --watch db.json --port 8001`

## Error Handling

The app handles these error scenarios:
- Network errors (no internet connection)
- Server errors (500, 404, etc.)
- Validation errors from backend
- Authentication errors

## Features Implemented

✅ Login with real API call
✅ Register with real API call  
✅ Logout with API call
✅ Token storage and restoration
✅ Error handling and user feedback
✅ Loading states
✅ Form validation

## Next Steps

1. Set up your backend server at `http://localhost:8001`
2. Implement the authentication endpoints
3. Test the login/register flow
4. Add forgot password functionality
5. Implement token refresh if needed