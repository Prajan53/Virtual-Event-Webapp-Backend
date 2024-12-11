
# Virtual Event Webapp Backend

The Virtual Event Platform is a full-featured web application designed to support digital events and provide users with an interactive, online experience. This platform enables secure user access, sponsor booth management, real-time event tracking, and user insights, making it easy for event organizers to host engaging virtual events.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Secure, role-based access for different user types (attendees, speakers, sponsors).
- **Sponsor Booths**: Sponsors can add resources like images, videos, and documents, viewable by attendees, with detailed tracking for each booth interaction.
- **Event Management**: Admins can create events, assign speakers, and manage schedules.
- **Analytics Dashboard**: Sponsors and organizers can monitor metrics such as booth visits and downloads for better user engagement insights.
- **Bot Detection**: Uses a passive CAPTCHA system that analyzes user behavior to differentiate bots from human users.

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT for secure, token-based login sessions
- **Validation**: Zod for backend data validation

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) and npm
- [MongoDB](https://www.mongodb.com/)

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com.git
   cd Virtual-Event-Webapp-Backend
   ```

2. **Install Backend Dependencies**
   ```bash
   npm install
   ```

3. **Set Environment Variables**

   Create a `.env` file in the root directory and include:
   ```plaintext
   MONGODB_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_jwt_secret>
   ```

4. **Start the Server**
   ```bash
   npm start
   ```

   The application should now be running on `http://localhost:3000`.

## Usage

To test the platform's features, use Postman or any other API client to make requests to the various endpoints listed below. 

### Example Requests

#### Adding a Sponsor Booth Resource
Endpoint: `POST /api/sponsors/booth`

Request Body:
```json
{
  "title": "Assignment",
  "url": "https://example.com/resource.png",
  "type": "image"
}
```

Expected Response:
```json
{
  "message": "Your resources have been created successfully"
}
```

## API Documentation

- **Authentication**
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Log in with email and password

- **Sponsor Booths**
  - `POST /api/sponsors/booth` - Add a new booth resource

- **Events**
  - `GET /api/events` - Retrieve all events
  - `POST /api/events` - Create a new event (Admin only)

For more details on the available API endpoints, see the documentation in `docs/` (or refer to in-code comments).

## Contributing

To contribute to this project:

1. Fork the repository.
2. Create a new branch (`feature/your-feature`).
3. Commit your changes and push to your branch.
4. Open a pull request, explaining the changes and their purpose.

## License

This project is licensed under the MIT License.

---

This README provides essential information about your project and includes key sections for setup, usage, and contributions.
