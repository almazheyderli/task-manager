# TaskFlow — Java Edition

Task idarəetmə sistemi: **Spring Boot 3.2** backend + **Next.js 15** frontend.

## Texnologiyalar

| Qat        | Stack                                          |
|------------|------------------------------------------------|
| Backend    | Java 21, Spring Boot 3.2, Spring Security      |
| Database   | MongoDB (Spring Data MongoDB)                  |
| Auth       | JWT (jjwt 0.12), BCrypt                        |
| Frontend   | Next.js 15, TypeScript, CSS Variables          |
| Build      | Maven (backend), npm (frontend)                |

---

## Quraşdırma

### Tələblər
- Java 21+
- Maven 3.9+
- Node.js 20+
- MongoDB (local və ya Atlas)

---

### 1. Backend

```bash
cd backend

# application.properties-i yeniləyin:
#   spring.data.mongodb.uri=your-mongo-uri
#   app.jwt.secret=your-min-32-char-secret

mvn clean package -DskipTests
java -jar target/taskflow-api-1.0.0.jar
```

Backend `http://localhost:8080` ünvanında işləyir.

**API endpointlər:**
```
POST /api/auth/register   — Qeydiyyat
POST /api/auth/login      — Giriş
GET  /api/tasks           — Taskları gətir (?status=&priority=&search=)
POST /api/tasks           — Yeni task
PUT  /api/tasks/{id}      — Task yenilə
DELETE /api/tasks/{id}    — Task sil
GET  /api/health          — Health check
```

---

### 2. Frontend

```bash
cd frontend

# .env.local yeniləyin (default olaraq localhost:8080-ə baxır):
# NEXT_PUBLIC_API_URL=http://localhost:8080

npm install
npm run dev
```

Frontend `http://localhost:3000` ünvanında açılır.

---

## Layihə strukturu

```
taskflow-java/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/taskflow/
│       ├── TaskflowApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java
│       │   ├── MongoConfig.java
│       │   └── GlobalExceptionHandler.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── TaskController.java
│       │   └── HealthController.java
│       ├── dto/Dto.java
│       ├── model/
│       │   ├── User.java
│       │   └── Task.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   └── TaskRepository.java
│       ├── security/
│       │   ├── JwtService.java
│       │   └── JwtAuthFilter.java
│       └── service/
│           ├── AuthService.java
│           └── TaskService.java
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    └── lib/
        ├── api.ts
        └── types.ts
```

## Xüsusiyyətlər

- JWT ilə qeydiyyat / giriş
- BCrypt (12 round) şifrə hash
- Hər istifadəçi yalnız öz tasklarını görür
- Task yaratma, redaktə, silmə
- Pending / Completed status dəyişikliyi
- Priority (LOW / MEDIUM / HIGH) və status filteri
- Başlıq üzrə axtarış
- Son tarix (overdue vurğulanır)
- `/api/health` endpoint
- Responsive, editorial light UI
update
