import { fileURLToPath } from 'node:url';
import {
    runMigrations,
    type RunMigrationsOptions,
} from '../../apps/api/src/migrations/migration-runner';

function parseDirection(argv: string[]): RunMigrationsOptions['direction'] {
    if (argv.includes('--down') || argv.includes('down')) return 'down';
    if (argv.includes('--up') || argv.includes('up')) return 'up';
    return 'up';
}

async function main() {
    await runMigrations({
        direction: parseDirection(process.argv.slice(2)),
    });
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
    main().catch((error) => {
        console.error('Migration failed:', error);
        process.exitCode = 1;
    });
}
