import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(
        private readonly dataSource: DataSource
    ) {}

    @Get('live')
    @ApiOperation({ summary: 'Liveness probe' })
    @ApiResponse({ status: 200, description: 'Process is alive' })
    live() {
        return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        };
    }

    @Get('ready')
    @ApiOperation({ summary: 'Readiness probe' })
    @ApiResponse({ status: 200, description: 'Process and database are ready' })
    @ApiResponse({ status: 503, description: 'Database is unreachable' })
    async ready() {
        await this.dataSource.query('SELECT 1');

        return {
        status: 'ok',
        checks: { database: 'up' },
        };
    }
}
