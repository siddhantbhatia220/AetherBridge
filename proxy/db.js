import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initDB() {
    const db = await open({
        filename: './shadow-bridge.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            method TEXT,
            payload TEXT,
            status TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    return db;
}
