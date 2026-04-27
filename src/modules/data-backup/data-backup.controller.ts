import { Controller, Get, Post, Body, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { DataBackupService, BackupData } from './data-backup.service';

@ApiTags('Data Backup')
@Controller('data-backup')
export class DataBackupController {
  constructor(private readonly dataBackupService: DataBackupService) {}

  @Get('export')
  @ApiOperation({
    summary: 'Export all data',
    description:
      'Export all project types, service categories, services, cost code categories, cost codes, and cost code options as a JSON backup file.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Backup JSON returned' })
  async exportAll(@Res() res: Response) {
    const backup = await this.dataBackupService.exportAll();
    const filename = `backup-${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(backup, null, 2));
  }

  @Post('import')
  @ApiOperation({
    summary: 'Import backup data',
    description:
      'Import a previously exported JSON backup. Existing records (matched by ID) are skipped. New records are created.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Import results' })
  async importAll(@Body() backup: BackupData) {
    return this.dataBackupService.importAll(backup);
  }
}
