import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketReport } from './entities/market-report.entity';
import { CreateMarketReportDto } from './dto/create-market-report.dto';
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { UpdateMarketReportDto } from './dto/update-market-report.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FailedReport } from './entities/failed-report.entity';

@Injectable()
export class MarketReportsService {
  private readonly logger = new Logger(MarketReportsService.name);

  // 🔁 Último contexto de encabezado
  private lastOrigin: string | null = null;
  private lastItem: string | null = null;
  private lastContainer: string | null = null;

  constructor(
    @InjectRepository(MarketReport)
    private readonly reportRepository: Repository<MarketReport>,
    @InjectRepository(FailedReport)
    private readonly failedRepository: Repository<FailedReport>,
  ) {}

  // ============================================================
  // 🌍 MAPS
  // ============================================================
  private mapOrigin(chinese: string | null): string | undefined {
    const map: Record<string, string> = {
      '秘鲁': 'Perú',
      '南非': 'Sudáfrica',
      '澳': 'Australia',
      '智利': 'Chile',
    };
    return chinese ? map[chinese] : undefined;
  }

  private mapItem(chinese: string | null): string | undefined {
    const map: Record<string, string> = {
      '蓝莓': 'Blueberry',
      '橙': 'Orange',
      '柑': 'Mandarin',
      '葡萄': 'Grape',
      '樱桃': 'Cherry',
      '苹果': 'Apple',
    };
    return chinese ? map[chinese] : undefined;
  }

  private mapExporter(name: string): string {
    const map: Record<string, string> = { '淼杰': 'Miaojie', '鑫荣懋': 'Zestfruit', '农富': 'Nongfu', '泽伦': 'Zelen', '橙亿': 'Chengyi', '欧可': 'OK', '煜谦': 'YuQian', '悦福鑫': 'YueFuXin', '祥启': 'XiangQi', '果缤': 'GuoBin', '翼博': 'YiBo', '均礼': 'JunLi', '霞姐': 'Xia Jie', '电白燕2C': 'Dian Bai Yan', '大只广': 'Da Zhi Guang', '顺达': 'Shun Da', '张明': 'Zhang Ming', '山东': 'Shan Dong', '瀚海': 'Han Hai', '港隆': 'Gang Long', };
    return map[name] ?? name;
  }

  // ============================================================
  // 🧠 PREPROCESO DE MENSAJES
  // ============================================================
  preprocessMessage(raw: string): { message: string }[] {
    if (!raw) return [];

    const normalized = raw.replace(/\\n/g, '\n').trim();
    const lines = normalized
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return [];

    // extraer fecha de cabecera
    const dateMatch = lines[0].match(
      /(\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|\d{1,2}[-\/]\d{1,2})/,
    );
    const currentYear = new Date().getFullYear();
    const parsedDate = dateMatch
      ? dateMatch[0].length === 5
        ? `${currentYear}-${dateMatch[0].replace(/\//g, '-')}`
        : dateMatch[0].replace(/\//g, '-')
      : null;

    const reports: { message: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split('&').map((p) => p.trim()).filter(Boolean);
      for (const part of parts) {
        const structured = parsedDate ? `${parsedDate}, ${part}` : part;
        reports.push({ message: structured });
      }
    }

    this.logger.debug(`📊 Preprocesados ${reports.length} reportes individuales`);
    return reports;
  }

  // ============================================================
  // 🏗️ CREACIÓN DESDE BIG MESSAGE
  // ============================================================
  async createFromMessageBulk(bigMessage: string): Promise<MarketReport[]> {
    this.lastOrigin = null;
    this.lastItem = null;
    this.lastContainer = null;

    const structured = this.preprocessMessage(bigMessage);
    const saved: MarketReport[] = [];

    for (const r of structured) {
      if (this.isHeaderLine(r.message)) {
        this.extractHeaderContext(r.message);
        continue;
      }
      const created = await this.createFromMessage(r.message);
      saved.push(...created);
    }

    this.logger.debug(`✅ Se guardaron ${saved.length} reportes en total`);
    return saved;
  }

  private extractHeaderContext(msg: string) {
    const originMatch = msg.match(/秘鲁|南非|澳|智利/);
    const itemMatch = msg.match(/蓝莓|橙|柑|葡萄|樱桃|苹果/);
    const containerMatch = msg.match(/(\d+)C/i);

    if (originMatch) this.lastOrigin = originMatch[0];
    if (itemMatch) this.lastItem = itemMatch[0];
    if (containerMatch) this.lastContainer = containerMatch[1];

    this.logger.debug(
      `📌 Header: origin=${this.lastOrigin}, item=${this.lastItem}, container=${this.lastContainer}`,
    );
  }
  private isHeaderLine(line: string): boolean {
    const afterDate = line.replace(/^\d{4}-\d{1,2}-\d{1,2},\s*/, '').trim();
    // 👉 si contiene origen + contenedor tipo ":10C" también es encabezado
    if (/秘鲁|南非|澳|智利/.test(afterDate)) return true;
    if (/新货|[:：]\d*C?$/.test(afterDate)) return true;
    return false;
  }
  
  // ============================================================
  // 📝 CREACIÓN DESDE MENSAJE UNITARIO
  // ============================================================
  async createFromMessage(message: string): Promise<MarketReport[]> {
    const dtos = this.parseMessageToReports(message).filter(
      (dto) => dto.exporter && dto.variety && dto.size && dto.price !== undefined,
    );
  
    if (dtos.length === 0) {
      // ✅ Si el mensaje es ignorado, no lo guardamos en FailedReport
      if (this.isIgnorableFailedMessage(message)) {
        this.logger.warn(`⚠️ Ignorado (no se guarda en FailedReport): ${message}`);
        return [];
      }
    
      this.logger.warn(`⚠️ No se guardó nada para: ${message}`);
      await this.failedRepository.save({ rawMessage: message });
      return [];
    }
    
  
    this.logger.debug(`📥 Se van a guardar ${dtos.length} registros`);
    const reports = this.reportRepository.create(dtos);
    return this.reportRepository.save(reports);
  }
  
  // ============================================================
  // 🧪 PARSER PRINCIPAL
  // ============================================================
  private parseMessageToReports(message: string): CreateMarketReportDto[] {
    const reports: CreateMarketReportDto[] = [];
    const clean = this.normalizeLine(message);
  
    this.logger.debug(`🧪 Analizando mensaje: ${clean}`);
  
    // 🧩 Detectar si es reporte de cerezas 🍒
    if (this.isCherryReport(clean)) {
      const dateMatch = clean.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/);
      const date = dateMatch ? dateMatch[0].replace(/\//g, '-') : new Date().toISOString().slice(0, 10);
  
      const lines = clean
        .split('\n')
        .map((l) => this.normalizeLine(l))
        .filter((l) => l && !/行情|早上|整体|价格区间/.test(l));
  
      for (const line of lines) {
        const cherries = this.parseCherryLine(line, date);
        if (cherries.length > 0) reports.push(...cherries);
      }
  
      return reports;
    }
  
    // 🫐 Detectar si es reporte de berries (Ventura, Magica, Sekoya Pop, etc.)
    if (this.isBerriesReport(clean)) {
      const dateMatch = clean.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/);
      const date = dateMatch ? dateMatch[0].replace(/\//g, '-') : new Date().toISOString().slice(0, 10);
  
      const lines = clean
        .split('\n')
        .map((l) => this.normalizeLine(l))
        .filter((l) => l && !/行情|早上|整体|价格区间/.test(l));
  
      for (const line of lines) {
        const berries = this.parseBerriesLine(line, date);
        if (berries.length > 0) reports.push(...berries);
      }
  
      return reports;
    }
  
    // 🍇 Detectar si es reporte de uvas
    if (this.isFruitLine(clean)) {
      const dateMatch = clean.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/);
      const date = dateMatch
        ? dateMatch[0].replace(/\//g, '-')
        : new Date().toISOString().slice(0, 10);
  
      return this.parseGrapesLine(clean, date);
    }
  
    // 🟧 Si no es cherry, berries ni grape → usar parsers existentes
    const type = this.detectMessageType(clean);
    if (type === 'long') return this.parseLongMessage(clean);
    if (type === 'short') return this.parseShortMessage(clean);
    return [];
  }
  private isBerriesReport(message: string): boolean {
    // Reconoce variedades comunes de arándanos / berries
    return /(VENTURA|MAGICA|SEKOYA\s?POP|ATLAS|MISS\s?O|RED\s?CROWN|AG2)/i.test(message);
  }
  

  private detectMessageType(msg: string): 'long' | 'short' | 'unknown' {
    if (/^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/.test(msg)) return 'long';
    if (/^\d{1,2}[-\/]\d{1,2}(?=[,\s])/.test(msg)) return 'short';
    return 'unknown';
  }

  // ============================================================
  // 📜 PARSER LONG Y SHORT
  // ============================================================
  private parseLongMessage(msg: string): CreateMarketReportDto[] {
    return this.parseStructuredLine(msg);
  }

  private parseShortMessage(msg: string): CreateMarketReportDto[] {
    return this.parseStructuredLine(msg);
  }

  private parseStructuredLine(msg: string): CreateMarketReportDto[] {
    const origin = this.lastOrigin ? this.mapOrigin(this.lastOrigin) : undefined;
    const item = this.lastItem ? this.mapItem(this.lastItem) : undefined;
    const container = this.lastContainer ?? undefined;
    const cleaned = this.normalizeLine(msg);

    return this.parseGroup1(cleaned, this.extractDate(msg), this.extractMarket(msg), origin, item, container);
  }

  private extractDate(msg: string): string | null {
    const m = msg.match(/\d{4}-\d{1,2}-\d{1,2}/);
    return m ? m[0] : null;
  }

  private extractMarket(msg: string): string | null {
    const m = msg.match(/([A-Z]{2})行情/);
    return m ? m[1] : null;
  }

  private parseBerriesLine(line: string, date: string): CreateMarketReportDto[] {
    const dtos: CreateMarketReportDto[] = [];
  
    // 🧹 Normalizar
    line = line
      .replace(/^\d{4}-\d{1,2}-\d{1,2},?/, '')
      .replace(/[，]/g, ',')
      .replace(/–|－|—/g, '-')
      .trim();
  
    // 🚚 Movimiento
    const movement = this.extractMovement(line);
    line = line.replace(/(走半柜|走\d+[Pp板]?|剩\d+[Pp板]?|清|没动|不动|部分代卖|部分自用|进渠道|为平台销售价)/g, '').trim();
  
    // 🪪 Tokens
    const tokens = line.split('/').filter(Boolean);
    if (tokens.length < 5) return [];
  
    // 🇨🇳 Exportador chino (solo nota)
    const exporterCn = tokens[0];
  
    // 🏭 Exportador comercial
    const exporter = tokens[2];
  
    // 🍓 Variedad
    const variety = tokens[3];
  
    // 🍇 Item → viene del header
    const item = this.lastItem ? this.mapItem(this.lastItem) : 'Blueberry';
  
    // 📦 Packaging
    const packagingToken = tokens.find(t => /\d+(?:[.,]\d+)?KG/i.test(t)) ?? '';
    let packaging: string | undefined;
    let weight: string | undefined;
    if (packagingToken) {
      const match = packagingToken.match(/^(\d+(?:[.,]\d+)?)(KG)$/i);
      if (match) {
        packaging = match[1].replace(',', '.');
        weight = match[2].toUpperCase();
      }
    }
  
    // 🌍 Origen (del header)
    let origin = this.lastOrigin ? this.mapOrigin(this.lastOrigin) : undefined;
    origin = origin ?? 'Chile';
  
    // 🪜 Tail
    const afterPackIndex = packagingToken ? tokens.indexOf(packagingToken) + 1 : tokens.length;
    const tail = tokens.slice(afterPackIndex).join('/');
    const normalizedTail = tail
      .replace(/\s+/g, '')
      .replace(/\/{2,}/g, '/')
      .trim();
  
    this.logger.debug(`🐛 Tokens: ${JSON.stringify(tokens)}`);
    this.logger.debug(`📦 Packaging token: ${packagingToken}`);
    this.logger.debug(`🐍 Tail normalizado: ${normalizedTail}`);
  
    // 📏 Calibre y precio
    const calibreRegex = /(\d{1,2}\+|[JX]{1,3})\/(\d+(?:-\d+)?)/g;
    let match: RegExpExecArray | null;
  
    while ((match = calibreRegex.exec(normalizedTail)) !== null) {
      const calibre = match[1];
      const prices = match[2]
        .split(/[,，-]/)
        .map((p) => Number(p.trim()))
        .filter((n) => !isNaN(n));
  
      for (const price of prices) {
        dtos.push({
          date,
          market: 'SH',
          origin,
          item,           // ✅ viene del header (ej. Blueberry)
          exporter,       // ✅ Red Crown
          variety,        // ✅ Ventura
          packaging,
          weight,
          size: calibre,
          price,
          movement,
          notes: `Exportador CN: ${exporterCn}`,
        });
      }
    }
  
    // 📏 Fallback: precio sin calibre
    if (dtos.length === 0 && /^\d+(?:-\d+)?$/.test(normalizedTail)) {
      const [p1, p2] = normalizedTail.split('-').map(Number);
      const prices = p2 ? [p1, p2] : [p1];
      for (const price of prices) {
        dtos.push({
          date,
          market: 'SH',
          origin,
          item,
          exporter,
          variety,
          packaging,
          weight,
          size: 'NS',
          price,
          movement,
          notes: `Exportador CN: ${exporterCn}`,
        });
      }
    }
  
    return dtos;
  }
  
  // ============================================================
  // 🟩 GROUP 1 PARSER
  // ============================================================
  private parseGroup1(
    line: string,
    date: string | null,
    market: string | null,
    origin?: string,
    item?: string,
    containerHeader?: string,
  ): CreateMarketReportDto[] {
    const reports: CreateMarketReportDto[] = [];

    const movement = this.extractMovement(line);
    const work = line.replace(/(走半柜|走\d+板|剩\d+板|清|没动|不动|开)/g, '');

    const tokens = work.split(/[\/,]/).filter(Boolean);
    const exporter = this.mapExporter(tokens[0] || '');
    const packaging = tokens.find((t) => /(KG|kg|CARTON)/i.test(t));
    const pairs = tokens.map((t) => this.parseSizeAndPrice(t)).filter((p) => p.size || p.price);

    const sizes = pairs.map((p) => p.size).filter(Boolean).join(', ');
    const maxPrice = Math.max(...pairs.map((p) => p.price || 0), 0) || undefined;

    reports.push({
      date: date ?? undefined,
      market: market ?? undefined,
      origin,
      item,
      exporter,
      packaging,
      size: sizes,
      price: maxPrice,
      movement,
      notes: containerHeader ? `Container: ${containerHeader}` : undefined,
    });

    return reports;
  }

  // ============================================================
  // 🧰 HELPERS
  // ============================================================
  private parseSizeAndPrice(token: string): { size: string | null; price: number | null } {
    const sizePriceRegex = /([A-Z]*\d*[J]{0,2}[D]{0,2})(\d+(?:-\d+)?)/i;
    const match = token.match(sizePriceRegex);
    if (match) {
      const size = match[1] || null;
      const price = match[2] ? Number(match[2].split('-').pop()) : null;
      return { size, price };
    }
    return { size: null, price: null };
  }

  private extractMovement(line: string): string {
    const normalized = line
      .replace(/[，]/g, ',')
      .replace(/\s+/g, '')
      .trim();
  
    if (/走(\d+)板/.test(normalized)) {
      return `Salieron ${normalized.match(/走(\d+)板/)![1]} pallets`;
    }
    if (/剩(\d+)板/.test(normalized)) {
      return `Quedaron ${normalized.match(/剩(\d+)板/)![1]} pallets`;
    }
    if (/走半柜/.test(normalized)) {
      return 'Salió medio contenedor';
    }
    if (/清/.test(normalized)) {
      return 'Liquidado';
    }
    if (/没动|不动/.test(normalized)) {
      return 'Sin movimiento';
    }
    if (/开/.test(normalized)) {
      return 'Abierto';
    }
  
    // 🆕 Valor por defecto si no hay match
    return 'No especificado';
  }
  
  

  private isCherryReport(message: string): boolean {
    return /(樱桃|车厘子)/.test(message) || /REGINA|LAPINS|KORDIA/i.test(message);
  }

  private normalizeLine(line: string): string {
    return line
      .replace(/[，]/g, ',')
      .replace(/[\s　]+/g, '')
      .replace(/＆/g, '&')
      .replace(/Ｘ/gi, 'X')
      .replace(/：/g, ':')
      .trim();
  }
  private lastCherryContainerId: string | null = null;

// ============================================================
// 🍒 PARSER DE CHERRIES (Shanghai) - versión final corregida
// ============================================================
private parseCherryLine(line: string, date: string): CreateMarketReportDto[] {
  // 🧹 Normalizar línea base
  line = this.normalizeLine(line)
  .replace(/[®©]/g, 'R')   // reemplaza el símbolo
  .replace(/–/g, '-')
    .replace(/^\d{4}[-/]\d{1,2}[-/]\d{1,2}[,，]?/, '')
    .replace(/[®©]/g, 'R')
    .replace(/[×xX]/g, '*')
    .replace(/–/g, '-')
    .trim();

  // 📦 Container ID
  const idMatch = line.match(/^([0-9A-Z]+(?:[\/&][0-9A-Z]+)*)/);
  let containerId: string | undefined;
  if (idMatch) {
    containerId = idMatch[1];
    this.lastCherryContainerId = containerId;  // 🆕 guardamos el último detectado
    line = line.replace(containerId, '').trim();
  } else if (this.lastCherryContainerId) {
    containerId = this.lastCherryContainerId; // 🆕 usamos el último si no hay nuevo
  }
  

  // 🚚 Movimiento
  const movement = this.extractMovement(line);
  line = line.replace(/(走半柜|走\d+板|剩\d+板|清|没动|不动|开)/g, '');

  // 🏷️ Exportador
  const tokens = line.split('/').filter(Boolean);
  const exporterRaw = tokens[0]?.replace(/^\d{4}[-/]\d{1,2}[-/]\d{1,2},?/, '');
  const exporterCn = /1C/i.test(tokens[1]) ? tokens[2] : exporterRaw;
  const exporter = this.mapExporter(exporterCn ?? '');

  if (!/SWEET|INA|REGINA|LAPINS|KORDIA|SKEENA|BING/.test(line) && containerId) {
    // sólo actualizamos el ID pero no creamos reportes
    return [];
  }
  
  // 🍒 Variedades
  const varietyRegex = /(REGINA|LAPINS|KORDIA|SWEET HEART|SKEENA|BING|INA|RINA)/gi;

  const matches = [...line.matchAll(varietyRegex)];
  if (matches.length === 0) return [];

  const dtos: CreateMarketReportDto[] = [];

  for (let i = 0; i < matches.length; i++) {
    const variety = matches[i][0].toUpperCase();
    const start = matches[i].index!;
    const end = i + 1 < matches.length ? matches[i + 1].index! : line.length;
    const segment = line.slice(start, end).trim();
    const segmentTokens = segment.split('/').filter(Boolean);

    // 📦 Packaging
// 📦 Packaging (acepta 2,5KG — 2.5KG — 2*2,5KG — 2*2.5KG)
const packagingToken = segmentTokens.find(t => /\d+(?:[.,]\d+)?(?:\*\d+(?:[.,]\d+)?)?(KG|kg)/.test(t)) ?? '';
let packaging: string | undefined;
let weight: string | undefined;

if (packagingToken) {
  const match = packagingToken.match(/^(\d+(?:[.,]\d+)?(?:\*\d+(?:[.,]\d+)?)?)(KG)$/i);
  if (match) {
    packaging = match[1].replace(/,/g, '.'); // normaliza coma -> punto
    weight = match[2].toUpperCase();
  } else {
    packaging = packagingToken.replace(/,/g, '.'); // fallback
  }
}



    // 🧹 Limpiar variedad y packaging antes de regex
    let cleanedSegment = segment
    .replace(variety, '')
    .replace(packagingToken, '')
    .replace(/[,，]+$/, '')         // 🧹 quita comas finales
    .replace(/\/+$/, '')           // 🧹 quita slashes finales
    .trim();
  

    // 📏 Regex estricta para calibres y precios
// 📏 Regex mejorado: soporta 4J1099, 2J/899, J/799, etc.
// 📏 Regex más robusta: captura también "4J1099" y "4J 1099"
const sizePriceRegex = /(\d{0,2}J[D]?)[\/\s]?(\d+(?:-\d+)?)/gi;




const calibres: string[] = [];
const precios: number[] = [];

let m: RegExpExecArray | null;
while ((m = sizePriceRegex.exec(cleanedSegment)) !== null) {
  const calibre = m[1];
  const precio = m[2] ? Number(m[2]) : undefined;

  if (calibre && precio !== undefined) {
    calibres.push(calibre);
    precios.push(precio);
  }
}

    
    // Si hay un solo precio pero varios calibres, lo duplicamos
    if (precios.length === 1 && calibres.length > 1) {
      while (precios.length < calibres.length) precios.push(precios[0]);
    }
    
    if (calibres.length === 0 || precios.length === 0 || !exporter || !variety) {
      return [];
    }

    let origin = this.lastOrigin ? this.mapOrigin(this.lastOrigin) : undefined;

    if (!origin) {
      const originMatch = line.match(/秘鲁|南非|澳|智利/);
      if (originMatch) {
        origin = this.mapOrigin(originMatch[0]);
        this.lastOrigin = originMatch[0]; // 👈 guardamos para siguientes líneas
      }
    }
    
    // 👇 Fallback si sigue vacío (por ejemplo, para mensajes sueltos sin encabezado)
    origin = origin ?? 'Chile';
    
    this.logger.debug(`✅ Calibres: ${JSON.stringify(calibres)}`);
this.logger.debug(`✅ Precios: ${JSON.stringify(precios)}`);

    // 📝 Generar filas por cada calibre
    for (let i = 0; i < calibres.length; i++) {
      dtos.push({
        date,
        market: 'SH',
        origin,
        item: 'Cherry',
        exporter,
        variety,
        packaging,
        weight: 'KG',
        size: calibres[i],
        price: precios[i],
        movement,
        notes: containerId ? `Container: ${containerId}` : undefined,
      });
    }
    
  }

  return dtos;
}
// ... (todo tu código original arriba sin cambios)

private isIgnorableFailedMessage(message: string): boolean {
  const clean = this.normalizeLine(message);

  // 🧭 1. Mensajes tipo "162/OTPU6165837" (solo container ID)
  if (/^\d{1,3}\/[A-Z0-9]+$/.test(clean.replace(/^\d{4}-\d{1,2}-\d{1,2},?/, '').trim())) {
    return true;
  }

  // 🧭 2. Mensajes con solo container ID sin variedad/exportador
  if (/^[A-Z0-9]+$/.test(clean.replace(/^\d{4}-\d{1,2}-\d{1,2},?/, '').trim())) {
    return true;
  }

  // 🧭 3. Líneas con KG pero sin variedad/exportador → ej. "5KG/JD/100-110"
  if (/^\d+KG\//i.test(clean) && !/(REGINA|VENTURA|MAGICA|KORDIA|RED|BLUE|GLOBE|SWEET)/i.test(clean)) {
    return true;
  }

  // 🧭 4. Líneas con solo calibres y precios
  if (/^\d+KG\/[A-Z0-9]+\/\d+/.test(clean) && !/[a-zA-Z\u4e00-\u9fa5]+/.test(clean.split('/')[0])) {
    return true;
  }

  // 🧭 5. Líneas con solo texto suelto tipo "中新/C"
  if (/^[\u4e00-\u9fa5A-Za-z]+\/[A-Z]+$/i.test(clean.replace(/^\d{4}-\d{1,2}-\d{1,2},?/, '').trim())) {
    return true;
  }

  return false;
}


private isFruitLine(line: string): boolean {
  const stripped = line.replace(/^\d{4}-\d{1,2}-\d{1,2},?/, '').trim();
  const normalized = stripped.replace(/\s+/g, '');

  return /(REDGLOBE|SWEETGLOBE|AUTUMNCRISP|CRIMSON|SABLE|SONAKA|SUGARPLUM|BLACKMAJESTY|D’AGEN|REGINA|KORDIA|LAPINS|INA|RINA|NECTARINE|PEACH|PLUM|CHERRY|GRAPE)/i
    .test(normalized);
}


// ============================================================
// 🍇 PARSER GRAPE (Shanghai)
// ============================================================
private parseGrapesLine(line: string, date: string): CreateMarketReportDto[] {
  const dtos: CreateMarketReportDto[] = [];

  // 🧹 Limpieza básica
  line = line.replace(/[，]/g, ',').replace(/–/g, '-').trim();
  const movement = this.extractMovement(line);
  line = line.replace(/(走半柜|走\d+[Pp板]?|剩\d+[Pp板]?|清|没动|不动|部分代卖)/g, '').trim();

  const tokens = line.split('/').filter(Boolean);

  if (tokens.length < 3) return [];

  // 🪪 Exportador: tomamos el segundo token válido (saltamos el importador)
  let exporterRaw: string | undefined;
  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i].trim();
    if (/WOODEN|PLASTIC|CARTON|FOAM|B/i.test(t)) continue;
    if (/\d+(?:[.,]\d+)?(?:\*\d+(?:[.,]\d+)?)?(?:KG|kg)/i.test(t)) continue;
    if (/^TG\d+/i.test(t)) continue;
    if (/^\d+$/.test(t)) continue;
    exporterRaw = t;
    break;
  }
  const exporter = exporterRaw ? this.mapExporter(exporterRaw) : undefined;

  // 🍇 Variedad
  const varietyRegex =
    /(RED\s?GLOBE|SWEET\s?GLOBE|AUTUMN\s?CRISP|CRIMSON|SABLE|SONAKA|SUGAR\s?PLUM|BLACK\s?MAJESTY|D[’']?AGEN|REGINA|KORDIA|LAPINS|INA|RINA|NECTARINE|PEACH|PLUM|CHERRY|GRAPE)/i;
  const varietyToken = tokens.find((t) => varietyRegex.test(t)) ?? '';
  const varietyMatch = varietyToken.match(varietyRegex);
  const variety = varietyMatch ? varietyMatch[0].toUpperCase().replace(/\s+/g, '') : undefined;

  // 🍑 Fruta asociada
  const fruitMap: Record<string, string> = {
    REDGLOBE: 'Grape',
    SWEETGLOBE: 'Grape',
    AUTUMNCRISP: 'Grape',
    CRIMSON: 'Grape',
    SABLE: 'Grape',
    SONAKA: 'Grape',
    SUGARPLUM: 'Plum',
    BLACKMAJESTY: 'Plum',
    "D’AGEN": 'Plum',
    REGINA: 'Cherry',
    KORDIA: 'Cherry',
    LAPINS: 'Cherry',
    INA: 'Cherry',
    RINA: 'Cherry',
    NECTARINE: 'Nectarine',
    PEACH: 'Peach',
    PLUM: 'Plum',
    CHERRY: 'Cherry',
    GRAPE: 'Grape',
  };
  const item = variety ? fruitMap[variety] ?? 'Grape' : 'Grape';

  // 📦 Packaging
  const packagingToken =
    tokens.find((t) => /\d+(?:[.,]\d+)?(?:\*\d+(?:[.,]\d+)?)?(?:KG|kg)/.test(t)) ?? '';
  const weight = 'KG';
  let packaging: string | undefined;
  if (packagingToken) {
    const match = packagingToken.match(/^(\d+(?:[.,]\d+)?(?:\*\d+(?:[.,]\d+)?)?)(?:KG|kg)$/i);
    packaging = (match ? match[1] : packagingToken).replace(/,/g, '.');
  }

  // 🌍 Origen dinámico
  let origin = this.lastOrigin ? this.mapOrigin(this.lastOrigin) : undefined;
  if (!origin) {
    const originMatch = line.match(/秘鲁|南非|澳|智利/);
    if (originMatch) origin = this.mapOrigin(originMatch[0]);
  }
  origin = origin ?? 'Chile';

  // 🪜 Tail (calibres + precios)
  const afterPackIndex = packagingToken ? tokens.indexOf(packagingToken) + 1 : tokens.length;
  const tail = tokens.slice(afterPackIndex).join('/');
  const normalizedTail = tail
    .replace(/\s+/g, '')
    .replace(/，/g, ',')
    .replace(/－/g, '-')
    .replace(/[^\x00-\x7F]/g, '');

  // 📏 Detectar calibre y precio
  const calibreRegex = /(XL|J{1,3}|[0-9]+J|[0-9]+#)\s*\/?\s*([\d]+(?:[-,，]\d+)?)/gi;
  let match: RegExpExecArray | null;

  while ((match = calibreRegex.exec(normalizedTail)) !== null) {
    const calibre = match[1];
    const prices = match[2]
      .split(/[,，-]/)
      .map((p) => Number(p.trim()))
      .filter((n) => !isNaN(n));
    for (const price of prices) {
      dtos.push({
        date,
        market: 'SH',
        origin,
        item,
        exporter,
        variety,
        packaging,
        weight,
        size: calibre,
        price,
        movement,
        notes: undefined,
      });
    }
  }

  // 📏 Si sólo hay precio sin calibre
  if (dtos.length === 0 && /^\d+(?:-\d+)?$/.test(normalizedTail)) {
    const [p1, p2] = normalizedTail.split('-').map(Number);
    const prices = p2 ? [p1, p2] : [p1];
    for (const price of prices) {
      dtos.push({
        date,
        market: 'SH',
        origin,
        item,
        exporter,
        variety,
        packaging,
        weight,
        size: 'NS',
        price,
        movement,
        notes: undefined,
      });
    }
  }

  return dtos;
}


  // ============================================================
  // 📊 FIND, CLEAR & UPDATE
  // ============================================================
async findAll(): Promise<MarketReport[]> {
  return this.reportRepository.find({
    order: { date: 'DESC' },
  });
}

  async clearAll(): Promise<void> {
    await this.reportRepository.clear();
  }

  async clearFailedReports(): Promise<void> {
    await this.failedRepository.clear();
    this.logger.warn('🧹 Todos los reportes fallidos fueron eliminados');
  }

  async update(id: string, dto: UpdateMarketReportDto) {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) throw new NotFoundException('report not found');

    const merged = this.reportRepository.merge(report, dto);
    return this.reportRepository.save(merged);
  }

  async findAllFailed(): Promise<FailedReport[]> {
    return this.failedRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
  async getStats() {
    const totalSaved = await this.reportRepository.count();
    const totalFailed = await this.failedRepository.count();
    return { totalSaved, totalFailed };
  }
  
}
