import { Controller, Post, Body, Get, Delete, Param, Patch } from '@nestjs/common';
import { MarketReportsService } from './market-reports.service';
import { MarketReport } from './entities/market-report.entity';
import { Paginate, Paginated } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { UpdateMarketReportDto } from './dto/update-market-report.dto';



@Controller('market-reports')
export class MarketReportsController {
  constructor(private readonly marketReportsService: MarketReportsService) {}

  /**
   * 📥 POST /market-reports
   * Recibe un mensaje en mandarín y lo convierte en registros de reportes.
   */
  @Post()
  async create(@Body('message') message: string): Promise<MarketReport[]> {
    return this.marketReportsService.createFromMessageBulk(message);
  }
  

  /**
   * 📤 GET /market-reports
   * Devuelve todos los reportes guardados.
   */
  @Get()
  findAll() {
    return this.marketReportsService.findAll();
  }
  @Get('failed')
async findFailed() {
  return this.marketReportsService.findAllFailed();
}
@Get('stats')
async getStats() {
  return this.marketReportsService.getStats();
}



  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarketReportDto: UpdateMarketReportDto) {
    return this.marketReportsService.update(id, updateMarketReportDto);
  }
  /**
   * 🧹 DELETE /market-reports
   * Limpia todos los registros (para pruebas).
   */
  @Delete()
  async clearAll(): Promise<{ message: string }> {
    await this.marketReportsService.clearAll();
    return { message: 'Todos los reportes fueron eliminados.' };
  }

  @Delete('failed')
async clearFailed() {
  return this.marketReportsService.clearFailedReports();
}


}
