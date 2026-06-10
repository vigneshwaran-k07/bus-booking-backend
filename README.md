# Bus Ticketing Backend

Node.js + Express + PostgreSQL REST API for a 40-seat bus ticketing system.

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Install dependencies
```bash
npm install
```

### Configure environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials and admin secret
```

### Create database
```sql
CREATE DATABASE bus_ticketing;
```

### Seed the database (creates table + 40 open tickets)
```bash
npm run seed
```

### Run the server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

## Environment Variables

| Variable       | Description                          | Example            |
|----------------|--------------------------------------|--------------------|
| `PORT`         | HTTP port                            | `3000`             |
| `DB_HOST`      | PostgreSQL host                      | `localhost`        |
| `DB_PORT`      | PostgreSQL port                      | `5432`             |
| `DB_NAME`      | Database name                        | `bus_ticketing`    |
| `DB_USER`      | Database user                        | `postgres`         |
| `DB_PASSWORD`  | Database password                    | `secret`           |
| `ADMIN_SECRET` | Secret key for the admin reset route | `my_admin_secret`  |

## API Reference

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | `/api/tickets`            | All 40 tickets                       |
| GET    | `/api/tickets/open`       | All open tickets                     |
| GET    | `/api/tickets/closed`     | All closed (booked) tickets          |
| GET    | `/api/tickets/:id`        | Single ticket by ID                  |
| GET    | `/api/tickets/:id/owner`  | Owner details of a booked ticket     |
| PATCH  | `/api/tickets/:id`        | Book or cancel a ticket              |
| POST   | `/api/admin/reset`        | Reset all tickets to open (admin)    |

All responses follow the shape:
```json
{ "success": true, "data": {}, "message": "..." }
```

## Event-Driven Logic

The server uses Node.js `EventEmitter` to emit and handle side effects:

| Event             | Trigger                              |
|-------------------|--------------------------------------|
| `ticket:booked`   | PATCH sets status → `closed`         |
| `ticket:cancelled`| PATCH sets status → `open`           |
| `admin:reset`     | POST `/api/admin/reset` completes    |

Events are logged to the console. Extend `src/events/ticketListeners.js` to add DB logging, notifications, etc.

## Postman Collection

Import `postman_collection.json` into Postman. Set the `base_url` variable to your server URL and `admin_secret` to match your `.env`.
