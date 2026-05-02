import { describe, it, expect } from 'vitest';
import {
  getSectionsForTemplate,
  reorderSections,
  addSection,
  removeSection,
  toggleSectionVisibility,
  updateSectionConfig,
  TEMPLATES,
  SECTION_TYPE_LABELS,
  TEMPLATE_LIST,
} from './sections';
import type { SectionConfig } from '../types';

describe('sections utility functions', () => {
  describe('getSectionsForTemplate', () => {
    it('should return sections for a valid template id', () => {
      const sections = getSectionsForTemplate('cinematic');
      expect(sections).toBeDefined();
      expect(sections.length).toBeGreaterThan(0);
      expect(sections[0].type).toBe('hero');
    });

    it('should return cinematic sections as default for invalid template id', () => {
      const sections = getSectionsForTemplate('nonexistent');
      expect(sections).toEqual(TEMPLATES.cinematic.sections);
    });

    it('should return correct sections for each template', () => {
      const cinematic = getSectionsForTemplate('cinematic');
      expect(cinematic.length).toBe(7);

      const elegant = getSectionsForTemplate('elegant');
      expect(elegant.length).toBe(7);

      const modern = getSectionsForTemplate('modern');
      expect(modern.length).toBe(5);

      const minimal = getSectionsForTemplate('minimal');
      expect(minimal.length).toBe(3);

      const vintage = getSectionsForTemplate('vintage');
      expect(vintage.length).toBe(7);
    });

    it('should return sections with correct structure', () => {
      const sections = getSectionsForTemplate('modern');
      const firstSection = sections[0];

      expect(firstSection).toHaveProperty('id');
      expect(firstSection).toHaveProperty('type');
      expect(firstSection).toHaveProperty('order');
      expect(firstSection).toHaveProperty('visible');
      expect(firstSection).toHaveProperty('config');
    });
  });

  describe('reorderSections', () => {
    const mockSections: SectionConfig[] = [
      { id: 's1', type: 'hero', order: 0, visible: true, config: {} },
      { id: 's2', type: 'story', order: 1, visible: true, config: {} },
      { id: 's3', type: 'event', order: 2, visible: true, config: {} },
      { id: 's4', type: 'rsvp', order: 3, visible: true, config: {} },
    ];

    it('should move section from lower index to higher index', () => {
      const result = reorderSections(mockSections, 0, 2);
      expect(result[0].id).toBe('s2');
      expect(result[1].id).toBe('s3');
      expect(result[2].id).toBe('s1');
      expect(result[3].id).toBe('s4');
    });

    it('should move section from higher index to lower index', () => {
      const result = reorderSections(mockSections, 3, 0);
      expect(result[0].id).toBe('s4');
      expect(result[1].id).toBe('s1');
      expect(result[2].id).toBe('s2');
      expect(result[3].id).toBe('s3');
    });

    it('should update order properties correctly after reorder', () => {
      const result = reorderSections(mockSections, 1, 3);
      result.forEach((section, index) => {
        expect(section.order).toBe(index);
      });
    });

    it('should not mutate the original array', () => {
      const original = [...mockSections];
      reorderSections(mockSections, 0, 1);
      expect(mockSections).toEqual(original);
    });

    it('should handle reordering to same position', () => {
      const result = reorderSections(mockSections, 1, 1);
      expect(result[1].id).toBe('s2');
      expect(result[1].order).toBe(1);
    });
  });

  describe('addSection', () => {
    const existingSections: SectionConfig[] = [
      { id: 's1', type: 'hero', order: 0, visible: true, config: {} },
      { id: 's2', type: 'story', order: 1, visible: true, config: {} },
    ];

    it('should add a new section to the end', () => {
      const newSection: SectionConfig = {
        id: 's3',
        type: 'event',
        order: 0, // will be overwritten
        visible: true,
        config: {},
      };
      const result = addSection(existingSections, newSection);
      expect(result.length).toBe(3);
      expect(result[2].id).toBe('s3');
    });

    it('should set the new section order to the end index', () => {
      const newSection: SectionConfig = {
        id: 's3',
        type: 'event',
        order: 999, // will be overwritten
        visible: true,
        config: {},
      };
      const result = addSection(existingSections, newSection);
      expect(result[2].order).toBe(2);
    });

    it('should not mutate the original array', () => {
      const original = [...existingSections];
      const newSection: SectionConfig = {
        id: 's3',
        type: 'event',
        order: 0,
        visible: true,
        config: {},
      };
      addSection(existingSections, newSection);
      expect(existingSections).toEqual(original);
    });
  });

  describe('removeSection', () => {
    const existingSections: SectionConfig[] = [
      { id: 's1', type: 'hero', order: 0, visible: true, config: {} },
      { id: 's2', type: 'story', order: 1, visible: true, config: {} },
      { id: 's3', type: 'event', order: 2, visible: true, config: {} },
    ];

    it('should remove the section with matching id', () => {
      const result = removeSection(existingSections, 's2');
      expect(result.length).toBe(2);
      expect(result.find(s => s.id === 's2')).toBeUndefined();
    });

    it('should reorder remaining sections correctly', () => {
      const result = removeSection(existingSections, 's2');
      expect(result[0].order).toBe(0);
      expect(result[0].id).toBe('s1');
      expect(result[1].order).toBe(1);
      expect(result[1].id).toBe('s3');
    });

    it('should not mutate the original array', () => {
      const original = [...existingSections];
      removeSection(existingSections, 's1');
      expect(existingSections).toEqual(original);
    });

    it('should handle removing non-existent section', () => {
      const result = removeSection(existingSections, 'nonexistent');
      expect(result.length).toBe(3);
      expect(result).toEqual(existingSections);
    });
  });

  describe('toggleSectionVisibility', () => {
    const existingSections: SectionConfig[] = [
      { id: 's1', type: 'hero', order: 0, visible: true, config: {} },
      { id: 's2', type: 'story', order: 1, visible: false, config: {} },
    ];

    it('should toggle visibility from true to false', () => {
      const result = toggleSectionVisibility(existingSections, 's1');
      expect(result[0].visible).toBe(false);
      expect(result[1].visible).toBe(false); // unchanged
    });

    it('should toggle visibility from false to true', () => {
      const result = toggleSectionVisibility(existingSections, 's2');
      expect(result[1].visible).toBe(true);
      expect(result[0].visible).toBe(true); // unchanged
    });

    it('should not mutate the original array', () => {
      const original = [...existingSections];
      toggleSectionVisibility(existingSections, 's1');
      expect(existingSections).toEqual(original);
    });

    it('should handle toggling non-existent section', () => {
      const result = toggleSectionVisibility(existingSections, 'nonexistent');
      expect(result).toEqual(existingSections);
    });
  });

  describe('updateSectionConfig', () => {
    const existingSections: SectionConfig[] = [
      {
        id: 's1',
        type: 'hero',
        order: 0,
        visible: true,
        config: { showCountdown: true, parallax: false },
      },
    ];

    it('should merge new config with existing config', () => {
      const result = updateSectionConfig(existingSections, 's1', { parallax: true });
      expect(result[0].config).toEqual({
        showCountdown: true,
        parallax: true,
      });
    });

    it('should add new config properties', () => {
      const result = updateSectionConfig(existingSections, 's1', { greetingStyle: 'formal' });
      expect(result[0].config.greetingStyle).toBe('formal');
      expect(result[0].config.showCountdown).toBe(true);
    });

    it('should not mutate the original array', () => {
      const original = [...existingSections];
      updateSectionConfig(existingSections, 's1', { parallax: true });
      expect(existingSections).toEqual(original);
    });

    it('should handle updating non-existent section', () => {
      const result = updateSectionConfig(existingSections, 'nonexistent', { parallax: true });
      expect(result).toEqual(existingSections);
    });
  });

  describe('TEMPLATES object', () => {
    it('should have all expected template keys', () => {
      expect(TEMPLATES).toHaveProperty('cinematic');
      expect(TEMPLATES).toHaveProperty('elegant');
      expect(TEMPLATES).toHaveProperty('modern');
      expect(TEMPLATES).toHaveProperty('minimal');
      expect(TEMPLATES).toHaveProperty('vintage');
    });

    it('should have valid template structure', () => {
      Object.values(TEMPLATES).forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('nameVi');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('preview');
        expect(template).toHaveProperty('sections');
        expect(Array.isArray(template.sections)).toBe(true);
      });
    });
  });

  describe('SECTION_TYPE_LABELS object', () => {
    it('should have labels for all section types', () => {
      const expectedTypes = ['hero', 'story', 'event', 'rsvp', 'gallery', 'countdown', 'map', 'music', 'gift', 'voice', 'livestream', 'custom'];
      expectedTypes.forEach(type => {
        expect(SECTION_TYPE_LABELS).toHaveProperty(type);
        expect(SECTION_TYPE_LABELS[type]).toHaveProperty('name');
        expect(SECTION_TYPE_LABELS[type]).toHaveProperty('nameVi');
        expect(SECTION_TYPE_LABELS[type]).toHaveProperty('icon');
      });
    });
  });

  describe('TEMPLATE_LIST', () => {
    it('should be an array of all templates', () => {
      expect(Array.isArray(TEMPLATE_LIST)).toBe(true);
      expect(TEMPLATE_LIST.length).toBe(Object.keys(TEMPLATES).length);
    });
  });
});
