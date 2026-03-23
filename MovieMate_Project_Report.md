# MOUNT CARMEL COLLEGE
**KARUKADOM, KOTHAMANGALAM 686691**
**NAAC Accredited With A Grade (CGPA 3.21)**
*(Affiliated to MG University, Kottayam)*

<br>

**PROJECT REPORT ON**
## MOVIEMATE
**(AI-Powered Social Movie Recommendation Platform)**

<br>

*Submitted in partial fulfillment of the requirement for the award of the Bachelor of Computer Applications Degree from Mahatma Gandhi University, Kottayam.*

**Submitted By**
**ALEENA RAJU**
**(Reg.no 230021082710)**

**Department of Computer Science**
**Mount Carmel College**
**Karukadom, Kothamangalam**

---

<div style="page-break-after: always;"></div>

## DEPARTMENT OF COMPUTER SCIENCE
### CERTIFICATE

This is to certify that the project entitled **"MOVIEMATE"** is a bonafide record of the work done by **ALEENA RAJU (Reg.no 230021082710)** of the 5th Semester for the partial fulfilment of the **Bachelor of Computer Applications Degree from Mahatma Gandhi University, Kottayam** during the academic session **2023-2026**.

<br><br>

**Project Guide**
Ms. Anjali Motilal

<br>

**Head of the Department**
Ms Angel George

<br><br>
**Viva Voce Examination held on** ..............................

**Internal Examiner** ..............................    **External Examiner** ..............................

---

<div style="page-break-after: always;"></div>

## ACKNOWLEDGEMENT

It is a great privilege to express my sincere gratitude to all the respected personalities who guided, inspired, and helped complete this project effectively.

First and foremost, I thank the “God Almighty” for showering his blessings without which all the effort would not have been successful.

I sincerely thank our principal, **Fr. Shaji Mangalath**, for guiding this endeavour and making it successful.

I would like to express my deepest gratitude to Assistant Professor **Ms. Angel George**, Head of the Department of Computer Science Department, for initiating this project and for her valuable guidance and suggestions.

I also thank **Ms. Anjali Motilal** my project guide, for her immense support, timely suggestions, and technical guidance throughout the project.

I sincerely thank my colleagues and friends for their continuous motivation, insightful discussions, and moral support during this project’s challenging phases.

---

<div style="page-break-after: always;"></div>

## TABLE OF CONTENTS

1. INTRODUCTION
2. SYSTEM ANALYSIS
   - Objectives of the Analysis
   - Key Elements of the System Analysis (Feasibility Study)
   - Economic Feasibility
   - Technical Feasibility
   - Operational Feasibility
   - Behavioral Feasibility
3. EXISTING SYSTEM
   - Key Characteristics
   - Limitations of the Existing System
4. PROPOSED SYSTEM
   - Key Features of the Proposed System
5. SOFTWARE REQUIREMENT SPECIFICATION
   - About the Front-End (React, Vite, Tailwind CSS)
   - About the Back-End (FastAPI, Python, MongoDB)
   - About the OS
   - Hardware Specification
6. DATA FLOW DIAGRAM (DFD)
   - Context Level
   - Level 1: User & Admin
7. SYSTEM DESIGN
   - Input Design
   - Module Design
   - Database Design
   - Normalization
   - Table Structure
   - Output Design
8. TESTING
   - System Testing
   - Unit Testing
   - Validation Testing
   - Integration Testing
   - User Acceptance Testing
   - Beta & Alpha Testing
9. SYSTEM IMPLEMENTATION
10. FUTURE ENHANCEMENT
11. CONCLUSION
12. SCREENSHOTS & CODE

---

<div style="page-break-after: always;"></div>

## 1. INTRODUCTION

MovieMate is a web-based, AI-powered social movie recommendation platform designed to provide a structured, highly engaging digital space for cinephiles. The system aims to simplify movie discovery, social interaction, and content curation through an integrated and user-friendly interface. By combining essential social media functionalities with advanced Artificial Intelligence within a single platform, MovieMate enhances the movie-watching experience for users globally.

In many streaming environments, discovering the perfect movie can be challenging, especially when information and recommendations are generic or scattered across various sources. MovieMate addresses this issue by offering a centralized system where users can access a comprehensive movie catalog, save favorites to their personal wishlist, and manage their cinematic journey effectively. The platform enables users to interact socially through a Live Global Chat and Real-Time Direct Messaging via WebSockets.

A key feature of MovieMate is its integration with Gemini AI for dynamic, bespoke movie recommendations. Users can generate highly tailored suggestions based on their unique tastes without leaving the application. These background processes invoke seamless, interactive alert notifications so users are notified the moment their AI list is compiled or a friend sends a message.

Furthermore, the platform incorporates a dedicated Administrator Dashboard, enabling system administrators to monitor platform statistics, manage active users securely, and manually dispatch global or targeted broadcast notifications to the entire user base.

Overall, MovieMate serves as a comprehensive, technology-driven solution for modern social movie discovery. By integrating AI exploration, real-time communication, administrative validation, and instantaneous notification assistance, the system contributes to a highly organized, efficient, and user-centered entertainment platform.

---

## 2. SYSTEM ANALYSIS

System analysis is the process of breaking a problem into manageable components for detailed study. For the MovieMate Platform, system analysis focuses on understanding the operations required to address challenges in movie curation, social connectivity, and AI integration, defining system boundaries, and determining the technical requirements needed to develop a scalable solution.

### Objectives of the Analysis
The primary objective of system analysis is to determine the feasibility and effectiveness of the proposed system. The system should:
- Deliver optimal performance with minimal cost and development time (Single Page Application architecture via React & Vite).
- Fulfill its core objective of providing a reliable movie tracking and social experience.
- Be implemented using modern and sustainable technologies (Python, FastAPI, MongoDB) within budget constraints.
- Offer a significantly improved user experience compared to existing standalone movie-rating platforms.

### Key Elements of the System Analysis (Feasibility Study)
A feasibility study determines whether the MovieMate project is economically, technologically, and operationally viable.

**Economic Feasibility**
Economic feasibility evaluates whether the development is financially practical. The cost of building MovieMate is minimal since the technologies used, such as React, Node.js, Python, FastAPI, and MongoDB, are entirely open-source and freely available. No additional hardware investment is required, as existing computer systems are sufficient for development and deployment. 

**Technical Feasibility**
Technical feasibility evaluates whether the available technological resources are sufficient to develop the system efficiently. The selected technology stack (React for dynamic frontend interfaces and FastAPI serving a high-speed asynchronous backend to a NoSQL MongoDB document database) can effortlessly support all system functionalities including real-time WebSockets and LLM AI integration without significant technical limitations. 

**Operational Feasibility**
Operational feasibility assesses how well the platform can perform required tasks to meet user needs. MovieMate is designed with a responsive, modern interface. Priority is given to essential features such as the AI engine, instant notifications, and chat modules. Based on a user-centric design approach, MovieMate is operationally feasible and easy to adopt for any internet user.

**Behavioral Feasibility**
Behavioral feasibility assesses how easily users will accept and adapt to the new system. In traditional movie platforms, users must manually search for films or rely on rigid algorithms. MovieMate automates and deeply personalizes this through an AI-powered interface. The interface is highly intuitive, relying on standard social media chat mechanics (Global Chat, Friend Lists, DMs) which significantly reduces the manual effort and learning curve, ensuring rapid adaptability.

---

## 3. EXISTING SYSTEM

Traditionally, the process of finding movies and interacting with fellow cinephiles is handled through fragmented platforms. Users must browse IMDb or Letterboxd for ratings, traverse to Reddit or Discord for chatting, and jump to streaming platforms hoping to find a good recommendation.

### Key Characteristics & Limitations
- **Lack of a Unified Platform:** Most current solutions focus only on static ratings or only on forum-based discussions, but rarely fluidly combine AI recommendations with direct 1-on-1 WebSocket chats.
- **Poor Recommendation Systems:** Existing algorithms are rigid (e.g., "Because you watched X, watch Y"). They lack the conversational nuance of a generative AI assistant.
- **Absence of Live Notifications:** Users frequently lack a proper real-time alert system to monitor when friends interact with them unless they actively refresh the page.
- **Fragmented Management Approach:** Connecting discovering movies, connecting with friends, deleting abusive accounts algorithmically, and receiving administrative announcements usually involves entirely disparate tool chains.

---

## 4. PROPOSED SYSTEM

The proposed system, MovieMate, is a fully functional, web-based AI Social platform designed to address the limitations of existing isolated platforms. It enables users to browse a vast catalog, manage wishlists, chat directly with friends, and instantly prompt an AI engine. 

The system is developed using a modern and scalable technology stack — FastAPI & Python for backend core development, raw WebSockets for low-latency live streaming, React (JS/JSX) orchestrated by Vite with Tailwind CSS for the front-end interface, and a highly flexible MongoDB relational document database.

### Key Features of the Proposed System
- **Dynamic and User-Centric Interface:** The platform features a glassmorphism/dark-mode aesthetic utilizing Tailwind CSS for sleek navigational elements.
- **Instantaneous Real-Time Social Layer:** WebSockets process both a Global interactive chatroom and private, encrypted 1-on-1 Direct Messages seamlessly.
- **Intelligent Prompt Engine:** Users can click to generate AI recommendations, securely routing internal requests to the Google Gemini LLM, returning precisely curated lists.
- **Intelligent Notification Center:** To prevent blocking the UI, background tasks operate heavily. When a process (such as a friend messaging or an AI list finishing) completes, a notification silently cascades to the user's interface, illuminating a red bell icon that immediately redirects them to the relevant page upon clicking.
- **Admin Dashboard:** Administrators are armed with a robust portal that aggregates platform statistics, lists all database records, handles user termination manually, and dispatches native Broadcasts to alert the user-base globally.

---

## 5. SOFTWARE REQUIREMENT SPECIFICATION

### ABOUT THE FRONT-END
**React, JSX, and Tailwind CSS**
The front-end of the MovieMate system is developed using modern Web Framework conventions via **React 18** and **Vite**. Instead of traditional static HTML/PHP, MovieMate utilizes a Component-Based Architecture powered by JSX. This acts as a highly dynamic presentation layer.

**Tailwind CSS** is heavily utilized to enhance the visual appearance of the website by instantly applying utility classes for colors, layout, flexbox, grid systems, and spacing. Tailwind assures that the application remains extremely responsive, adapting fluidly across all tablets, laptops, and mobile smartphones. Furthermore, modules like `lucide-react` inject modern iconography that guides users intuitively. State management is handled through React Hooks (`useState`, `useEffect`, `useContext`) linking internal application logic flawlessly.

### ABOUT THE BACK-END
**FastAPI & MongoDB Data Management**
A scalable JSON document database, **MongoDB**, acts as the primary storage retrieval mechanism. Unlike SQL systems, MongoDB perfectly accommodates fluctuating arrays of data, such as tracking arrays of user `favorites` or rapidly streaming chat logs in `messages`. We use the `Motor/PyMongo` suite for purely asynchronous database operations. 

**FastAPI** serves as the system's backend core. Written in Python 3.10+, FastAPI relies on high-speed automated routing and Pydantic data validation schemas. It enforces rigorous API data integrity instantly without manual boilerplate. Additionally, it provides native built-in dependency injections for stateless **JWT (JSON Web Token)** authentication to perfectly secure users from viewing data they aren't authorized to access. 

Overall, the backend processes user requests, handles the `ConnectionManager` for WebSockets, validates AI calls through the `.env` API keys, and generates protected API pathways for the React frontend to fetch.

### ABOUT THE OS & HARDWARE
- **Windows Operating System:** Designed and compiled successfully within a Windows 10/11 environment utilizing standard PowerShell tooling. Total platform independence guarantees it will serve successfully on Linux/Mac utilizing standard Node and Python processes.
- **Hardware Resources:** An Intel Core i5/Ryzen 5 or greater, 8GB minimum RAM, and a Standard Solid State Drive are well-equipped to host the local host processing threads without encountering bottleneck CPU latency.

---

## 6. DATA FLOW DIAGRAM (DFD)

A Data Flow Diagram is a network that describes the flow of data and processes that transform data throughout the system.

### Context Level (Level 0)
- **Entities:** User, Admin, Gemini AI Engine.
- **Inputs:** Login Credentials, Search Queries, Chat Payloads, AI Prompts.
- **Processing System:** MovieMate Application (Frontend/Backend API).
- **Outputs:** JWT Security Tokens, Live Messages, Movie Data Arrays, Broad-caster Notifications.

### Level 1 
1. **User Module:** Contains Request pipelines for (`Register`, `Login`, `View Movies`, `Add to Wishlist`, `Create Friend Connection`, `Send Local Message`, `Trigger AI`).
2. **Admin Module:** Extends the Request pipelines for (`Login`, `Fetch Platform Stats`, `Fetch all Users`, `Delete Malicious User`, `Dispatch Push Notification Blueprint`).

---

## 7. SYSTEM DESIGN

The system leverages a classic Three-Tier Architectural model modified for modern Single-Page Applications:
1. **Presentation Layer (React Frontend)**: Employs Axios to contact the server and renders Data arrays securely into the Document Object Model (DOM).
2. **Business Logic Layer (FastAPI Backend)**: Receives HTTP Protocol endpoints, executes Python asynchronous functions, enforces `is_admin` or `get_current_user` dependencies.
3. **Data Layer (MongoDB)**: Executes efficient NoSQL queries to retrieve the physical datasets stored in BSON formats.

### Database Design & Normalization
Designing a database is a critical task, and normalization ensures the database is efficient, consistent, and scalable without massive repetition anomalies. 
MovieMate utilizes NoSQL Document structures optimized for high-speed read/write access.

**Collections Structure:**
1. `users`: Stores (`_id`, `username`, `email`, `hashed_password`, `favorites` [Array], `is_admin` [Boolean]).
2. `movies`: Stores (`_id`, `title`, `description`, `genre`, `poster_url`, `rating`).
3. `reviews`: Stores (`_id`, `movie_id`, `user_id`, `rating`, `comment`).
4. `friend_connections`: Stores (`_id`, `user_id_1`, `user_id_2`, `status`).
5. `messages`: Stores (`_id`, `sender_id`, `receiver_id`, `content`, `timestamp`).
6. `notifications`: Stores (`_id`, `target_user_id`, `message`, `is_read`, `link`, `created_at`).

*(The collections are rigorously normalized via ObjectID relational referencing to ensure `target_user_id` reliably targets the primary key of the User account without duplicating user information inside the messages table.)*

---

## 8. TESTING

Testing involves correcting the applications to uncover hidden internal errors or structural UI flaws before going live.

- **System Testing:** The React dev server and Python Uvicorn server were run sequentially. All API hooks correctly tethered to the frontend components.
- **Unit Testing / Static Analysis:** The Python backend passed all unhandled-variable tests utilizing `flake8` static analysis. It compiled strictly with 0 logic breaks.
- **Integration Testing:** Used an Automated Playwright browser subagent to interact dynamically with the site. The subagent successfully generated AI recipes, interacted with the live WebSockets, caught the cascading Bell Notification state parameters, verified Dashboard numeric tracking, and dispatched Global Broadcasts effectively bridging all disparate modules perfectly together! 
- **User Acceptance Testing:** The final platform gracefully guards against Cross-Site Forgery, prevents unauthorized 401 exceptions on Protected Routes, limits Administrator execution strictly via JWT verification grids, and enforces seamless form-data validation securely. 

---

## 9. SYSTEM IMPLEMENTATION

Implementation commenced immediately succeeding backend stabilization. The integration of `AdminRoute.jsx` guarded the specialized `Dashboard.jsx`, `ManageUsers.jsx`, and `SendNotification.jsx` endpoints heavily. Once backend MongoDB connections were mapped, Vite successfully injected module-hot-reloading locally, and native dependencies mapped successfully over port 8000 and 5173 bridging the local domain network effectively!

## 10. FUTURE ENHANCEMENT

MovieMate exhibits immense potential for upward vertical scaling:
1. **Machine Learning Model Swapping:** The AI engine could be updated to cross-reference real-time newly released Netflix / Amazon prime API databases instead of solely local historical dictionaries.
2. **Mobile Deployment:** Recompiling the React frontend inside React Native frameworks to supply a native Android / iOS application.
3. **Advanced Biometric / 2FA Login:** Encrypting user sessions heavily with facial recognition and mobile 2-Factor Authentication APIs.

## 11. CONCLUSION

In conclusion, the MovieMate project powerfully demonstrates how a digital platform can unify the isolated movie-reviewing environment with a highly social, collaborative architecture. The platform significantly enhances discovery options using state-of-the-art Artificial Intelligence to automate the research pipeline.

MovieMate flawlessly weaves encrypted Live messaging to prevent viewers from exiting the ecosystem to share information. By implementing robust Administrative oversight and dynamic algorithmic alerts, the web application guarantees continuous community expansion in a tightly secure, highly enjoyable user environment.

---
### END OF REPORT
*(Refer to the repository `/src` and `/app` directories to locate the codebase and specific modular screenshots.)*
