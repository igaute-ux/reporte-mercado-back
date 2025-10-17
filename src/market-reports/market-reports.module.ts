import { Module } from '@nestjs/common';
import { MarketReportsService } from './market-reports.service';
import { MarketReportsController } from './market-reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketReport } from './entities/market-report.entity';
import { FailedReport } from './entities/failed-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MarketReport, FailedReport])],
  controllers: [MarketReportsController],
  providers: [MarketReportsService],
})
export class MarketReportsModule {}
