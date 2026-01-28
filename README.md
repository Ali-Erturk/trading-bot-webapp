# Trading Bot Web App

Full-stack trading platform that streams live cryptocurrency market data, simulates trades in real time, and tracks portfolio performance through a web interface.

---

## Features

- Streams live cryptocurrency market data using WebSockets
- Supports simulated (paper) trading with buy and sell orders
- Tracks portfolio balance, open positions, and trade history
- Stores market data and executed trades in a SQL database
- Exposes REST APIs for trading actions and market data access
- Designed with a modular backend architecture for scalability

---

## Tech Stack

- **Language:** JavaScript
- **Frontend:** React
- **Backend:** Node.js, Express
- **Real-Time:** WebSockets
- **Database:** SQLite (SQL)
- **APIs:** REST APIs, Binance market data API
- **Tools:** Git/GitHub

---

## How It Works

1. The backend establishes a WebSocket connection to stream live market trades
2. Incoming market data is broadcast to connected clients in real time
3. Price data and executed trades are persisted in a SQL database
4. Users submit buy and sell orders through REST API endpoints
5. Trades are executed using a simulated trading engine
6. Portfolio state and trade history are updated and exposed to the frontend

---

## Notes

- Uses simulated trading only (no real funds or live brokerage accounts)
- Sensitive configuration is managed using environment variables
- Designed for educational and portfolio demonstration purposes
