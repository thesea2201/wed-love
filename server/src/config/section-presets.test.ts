import { describe, it, expect } from 'vitest';
import { validateSections } from './section-presets';

describe('validateSections', () => {
  describe('valid section arrays', () => {
    it('should validate an empty array as valid', () => {
      const result = validateSections([]);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate a single valid section', () => {
      const sections = [
        {
          id: 's1',
          type: 'hero',
          order: 0,
          visible: true,
          config: {},
        },
      ];
      const result = validateSections(sections);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate multiple valid sections', () => {
      const sections = [
        { id: 's1', type: 'hero', order: 0, visible: true, config: { showCountdown: true } },
        { id: 's2', type: 'story', order: 1, visible: true, config: { layout: 'split' } },
        { id: 's3', type: 'event', order: 2, visible: false, config: {} },
      ];
      const result = validateSections(sections);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate all valid section types', () => {
      const validTypes = [
        'hero', 'story', 'event', 'rsvp', 'gallery', 'countdown',
        'map', 'music', 'gift', 'voice', 'livestream', 'custom',
      ];

      validTypes.forEach((type, index) => {
        const sections = [
          { id: `s${index}`, type, order: index, visible: true, config: {} },
        ];
        const result = validateSections(sections);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('invalid input', () => {
    it('should reject non-array input', () => {
      const result = validateSections(null as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Sections must be an array');
    });

    it('should reject undefined input', () => {
      const result = validateSections(undefined as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Sections must be an array');
    });

    it('should reject object input', () => {
      const result = validateSections({} as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Sections must be an array');
    });
  });

  describe('section limit', () => {
    it('should reject more than 20 sections', () => {
      const sections = Array.from({ length: 21 }, (_, i) => ({
        id: `s${i}`,
        type: 'hero',
        order: i,
        visible: true,
        config: {},
      }));
      const result = validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Maximum 20 sections allowed');
    });

    it('should accept exactly 20 sections', () => {
      const sections = Array.from({ length: 20 }, (_, i) => ({
        id: `s${i}`,
        type: 'hero',
        order: i,
        visible: true,
        config: {},
      }));
      const result = validateSections(sections);
      expect(result.valid).toBe(true);
    });
  });

  describe('missing or invalid id', () => {
    it('should reject section with missing id', () => {
      const sections = [
        { type: 'hero', order: 0, visible: true, config: {} },
      ];
      const result = validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Section at index 0 missing or invalid id');
    });

    it('should reject section with non-string id', () => {
      const sections = [
        { id: 123, type: 'hero', order: 0, visible: true, config: {} },
      ];
      const result = validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Section at index 0 missing or invalid id');
    });

    it('should detect duplicate ids', () => {
      const sections = [
        { id: 's1', type: 'hero', order: 0, visible: true, config: {} },
        { id: 's1', type: 'story', order: 1, visible: true, config: {} },
      ];
      const result = validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Duplicate section id: s1');
    });
  });

  describe('invalid section type', () => {
    it('should reject invalid section type', () => {
      const sections = [
        { id: 's1', type: 'invalid_type', order: 0, visible: true, config: {} },
      ];
      const result = validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid section type: invalid_type');
    });

    it('should reject empty type string', () => {
      const sections = [
        { id: 's1', type: '', order: 0, visible: true, config: {} },
      ];
      const result = validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid section type: ');
    });
  });

  describe('missing or invalid order', () => {
    it('should reject section with missing order', () => {
      const sections = [
        { id: 's1', type: 'hero', visible: true, config: {} },
      ];
      const result = validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Section s1 missing or invalid order');
    });

    it('should reject section with non-number order', () => {
      const sections = [
        { id: 's1', type: 'hero', order: '0', visible: true, config: {} },
      ];
      const result = validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Section s1 missing or invalid order');
    });

    it('should detect duplicate order values', () => {
      const sections = [
        { id: 's1', type: 'hero', order: 0, visible: true, config: {} },
        { id: 's2', type: 'story', order: 0, visible: true, config: {} },
      ];
      const result = validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Duplicate section order: 0');
    });
  });

  describe('missing or invalid visible', () => {
    it('should reject section with missing visible', () => {
      const sections = [
        { id: 's1', type: 'hero', order: 0, config: {} },
      ];
      const result = validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Section s1 missing or invalid visible');
    });

    it('should reject section with non-boolean visible', () => {
      const sections = [
        { id: 's1', type: 'hero', order: 0, visible: 'true', config: {} },
      ];
      const result = validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Section s1 missing or invalid visible');
    });
  });

  describe('missing or invalid config', () => {
    it('should reject section with missing config', () => {
      const sections = [
        { id: 's1', type: 'hero', order: 0, visible: true },
      ];
      const result = validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Section s1 missing or invalid config');
    });

    it('should reject section with non-object config', () => {
      const sections = [
        { id: 's1', type: 'hero', order: 0, visible: true, config: 'invalid' },
      ];
      const result = validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Section s1 missing or invalid config');
    });
  });

  describe('multiple errors', () => {
    it('should collect all validation errors', () => {
      const sections = [
        { id: 's1', type: 'hero', order: 0, visible: true, config: {} },
        { id: 's1', type: 'story', order: 0, visible: true, config: {} }, // duplicate id and order
        { type: 'invalid', order: 1, visible: true, config: {} }, // missing id, invalid type
      ];
      const result = validateSections(sections);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Duplicate section id: s1');
      expect(result.errors).toContain('Duplicate section order: 0');
    });
  });
});
