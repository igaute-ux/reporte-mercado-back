import { PartialType } from '@nestjs/mapped-types';
import { CreateMarketReportDto } from './create-market-report.dto';

export class UpdateMarketReportDto extends PartialType(CreateMarketReportDto) {}
