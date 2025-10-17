import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateMarketReportDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  market?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  item?: string;

  @IsOptional()
  @IsString()
  exporter?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  variety?: string;

  @IsOptional()
  @IsString()
  packaging?: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  movement?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  isHeader?: boolean;
}
