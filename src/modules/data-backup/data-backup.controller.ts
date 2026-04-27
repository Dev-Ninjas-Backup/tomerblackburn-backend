import { Controller, Get, Post, Body, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { DataBackupService, BackupData, TableKey } from './data-backup.service';

@ApiTags('Data Backup')
@Controller('data-backup')
export class DataBackupController {
  constructor(private readonly dataBackupService: DataBackupService) {}

  @Get('tables')
  @ApiOperation({ summary: 'Get all available backup tables with metadata' })
  @ApiResponse({ status: HttpStatus.OK })
  getTables() {
    return {
      message: 'Available backup tables',
      data: this.dataBackupService.getTableMeta(),
    };
  }

  @Post('export')
  @ApiOperation({ summary: 'Export selected tables as JSON backup' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Backup JSON returned' })
  async exportSelected(
    @Body() body: { tables: TableKey[] },
    @Res() res: Response,
  ) {
    const backup = await this.dataBackupService.exportSelected(body.tables);
    const filename = `backup-${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(backup, null, 2));
  }

  @Post('import')
  @ApiOperation({ summary: 'Import selected tables from backup JSON' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Import results' })
  async importSelected(@Body() backup: BackupData) {
    return this.dataBackupService.importSelected(backup);
  }
}
