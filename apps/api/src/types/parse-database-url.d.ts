declare module 'parse-database-url' {
    interface ParsedDatabaseUrl {
        driver: string;
        user?: string;
        password?: string;
        host?: string;
        port?: number;
        database?: string;
    }

    export default function parseDatabaseUrl(url: string): ParsedDatabaseUrl;
}
