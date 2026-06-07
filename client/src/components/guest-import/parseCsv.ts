import Papa from 'papaparse';

export type GuestField = 'name' | 'email' | 'phone' | 'customMessage';

export const GUEST_FIELDS: GuestField[] = ['name', 'email', 'phone', 'customMessage'];

export const FIELD_LABELS: Record<GuestField, string> = {
  name: 'Tên khách',
  email: 'Email',
  phone: 'Số điện thoại',
  customMessage: 'Lời nhắn',
};

export const MAX_ROWS = 1000;
export const MAX_FILE_SIZE = 1024 * 1024;
export const MAX_NAME_LENGTH = 100;
export const MAX_MESSAGE_LENGTH = 500;

export interface GuestRow {
  rowIndex: number;
  name: string;
  email: string;
  phone: string;
  customMessage: string;
  errors: string[];
}

export interface DuplicateGroup {
  key: string;
  rowIndices: number[];
  preview: string;
}

export interface ParseResult {
  headers: string[];
  rows: GuestRow[];
  validCount: number;
  errorCount: number;
  duplicates: DuplicateGroup[];
}

export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CsvParseError';
  }
}

const HEADER_ALIASES: Record<GuestField, string[]> = {
  name: ['name', 'ten', 'tên', 'hoten', 'họ tên', 'ho ten', 'fullname', 'full name', 'guest', 'guestname', 'guest name'],
  email: ['email', 'e-mail', 'mail', 'thu dien tu'],
  phone: ['phone', 'sdt', 'sđt', 'sodienthoai', 'số điện thoại', 'so dien thoai', 'mobile', 'tel', 'dienthoai', 'điện thoại'],
  customMessage: ['message', 'loinhan', 'lời nhắn', 'loi nhan', 'note', 'ghichu', 'ghi chú', 'ghi chu', 'custommessage', 'custom message'],
};

function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function autoMapHeader(header: string): GuestField | null {
  const normalized = normalizeHeader(header);
  for (const field of GUEST_FIELDS) {
    if (HEADER_ALIASES[field].some((alias) => normalizeHeader(alias) === normalized)) {
      return field;
    }
  }
  return null;
}

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function validateRow(row: Record<string, string>, rowIndex: number): GuestRow {
  const errors: string[] = [];
  const name = (row.name || '').trim();
  const email = (row.email || '').trim();
  const phone = (row.phone || '').trim();
  const customMessage = (row.customMessage || '').trim();

  if (!name) {
    errors.push('Thiếu tên');
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.push(`Tên quá dài (max ${MAX_NAME_LENGTH} ký tự)`);
  }

  if (email && !EMAIL_REGEX.test(email)) {
    errors.push('Email không hợp lệ');
  }

  if (phone) {
    const phoneDigits = phone.replace(/[\s+\-]/g, '');
    if (!/^\d+$/.test(phoneDigits) || phoneDigits.length < 8 || phoneDigits.length > 15) {
      errors.push('SĐT không hợp lệ');
    }
  }

  if (customMessage.length > MAX_MESSAGE_LENGTH) {
    errors.push(`Lời nhắn quá dài (max ${MAX_MESSAGE_LENGTH} ký tự)`);
  }

  return { rowIndex, name, email, phone, customMessage, errors };
}

function dedupKey(row: GuestRow): string {
  const normName = row.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const normPhone = row.phone.replace(/[\s+\-]/g, '');
  return `${normName}|${normPhone}`;
}

export function detectDuplicates(rows: GuestRow[]): DuplicateGroup[] {
  const groups = new Map<string, number[]>();
  for (const row of rows) {
    if (!row.name) continue;
    const key = dedupKey(row);
    const list = groups.get(key) || [];
    list.push(row.rowIndex);
    groups.set(key, list);
  }
  const result: DuplicateGroup[] = [];
  for (const [key, indices] of groups) {
    if (indices.length > 1) {
      const first = rows.find((r) => r.rowIndex === indices[0]);
      result.push({
        key,
        rowIndices: indices,
        preview: first?.name || key,
      });
    }
  }
  return result;
}

export function buildRowFromMapping(
  rawRow: Record<string, string>,
  mapping: Partial<Record<GuestField, string>>,
  rowIndex: number
): GuestRow {
  const mapped: Record<string, string> = {};
  for (const field of GUEST_FIELDS) {
    const col = mapping[field];
    if (col && rawRow[col] !== undefined) {
      mapped[field] = rawRow[col];
    }
  }
  return validateRow(mapped, rowIndex);
}

export function parseCsvText(text: string): { headers: string[]; rawRows: Record<string, string>[] } {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  });

  if (result.errors.length > 0) {
    const fatal = result.errors.find((e) => e.type === 'Delimiter' || e.type === 'Quotes');
    if (fatal) {
      throw new CsvParseError(`File CSV không hợp lệ: ${fatal.message}`);
    }
  }

  const headers = (result.meta.fields || []).filter((h) => h && h.trim().length > 0);
  const rawRows = (result.data || []).filter((row) => {
    return Object.values(row).some((v) => v && String(v).trim().length > 0);
  });

  return { headers, rawRows };
}

export function autoMapAll(headers: string[]): Partial<Record<GuestField, string>> {
  const mapping: Partial<Record<GuestField, string>> = {};
  for (const header of headers) {
    const field = autoMapHeader(header);
    if (field && !mapping[field]) {
      mapping[field] = header;
    }
  }
  return mapping;
}

export function fullParse(
  text: string,
  explicitMapping?: Partial<Record<GuestField, string>>
): ParseResult {
  const { headers, rawRows } = parseCsvText(text);

  if (headers.length === 0) {
    throw new CsvParseError('File CSV không có header');
  }
  if (rawRows.length === 0) {
    throw new CsvParseError('File không có dữ liệu');
  }
  if (rawRows.length > MAX_ROWS) {
    throw new CsvParseError(
      `File có ${rawRows.length} dòng, vượt quá giới hạn ${MAX_ROWS} dòng/lần import`
    );
  }

  const mapping = explicitMapping || autoMapAll(headers);
  if (!mapping.name) {
    throw new CsvParseError(
      `Thiếu cột bắt buộc: name (Tên khách). Headers tìm thấy: ${headers.join(', ')}`
    );
  }

  const rows: GuestRow[] = rawRows.map((raw, i) => buildRowFromMapping(raw, mapping, i + 2));
  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const errorCount = rows.length - validCount;
  const duplicates = detectDuplicates(rows);

  return { headers, rows, validCount, errorCount, duplicates };
}

export function applyDuplicateChoice(
  rows: GuestRow[],
  duplicates: DuplicateGroup[],
  choice: 'skip' | 'keep'
): GuestRow[] {
  if (choice === 'keep' || duplicates.length === 0) {
    return rows;
  }
  const skipIndices = new Set<number>();
  for (const group of duplicates) {
    for (let i = 1; i < group.rowIndices.length; i++) {
      skipIndices.add(group.rowIndices[i]);
    }
  }
  return rows.filter((r) => !skipIndices.has(r.rowIndex));
}
