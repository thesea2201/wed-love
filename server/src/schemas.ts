import { z } from 'zod';

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a hex color like #abc or #a1b2c3');

const nullableString = z
  .string()
  .trim()
  .min(1)
  .max(2000)
  .nullable()
  .or(z.literal('').transform(() => null));

const optionalNullableString = nullableString.optional();

// ─── AUTH ───
export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(200, 'Password too long'),
  groomName: z.string().trim().min(1, 'Groom name is required').max(100),
  brideName: z.string().trim().min(1, 'Bride name is required').max(100),
  weddingDate: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid date'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(200, 'Password too long'),
  })
  .strict();

export const deleteAccountSchema = z
  .object({
    password: z.string().min(1, 'Password confirmation is required'),
  })
  .strict();

// ─── INVITATION ───
export const createInvitationSchema = z.object({
  template: z.string().min(1).max(50).optional(),
  title: z.string().trim().min(1).max(200).optional(),
  subtitle: optionalNullableString,
  primaryColor: hexColor.optional(),
  secondaryColor: z.union([hexColor, z.null()]).optional(),
  fontFamily: z.string().min(1).max(100).optional(),
  venue: optionalNullableString,
  venueAddress: optionalNullableString,
  ceremonyTime: optionalNullableString,
  receptionTime: optionalNullableString,
  story: optionalNullableString,
  coverPhoto: z.string().url('coverPhoto must be a valid URL').optional(),
});

export const updateInvitationSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    subtitle: optionalNullableString,
    primaryColor: hexColor.optional(),
    secondaryColor: z.union([hexColor, z.null()]).optional(),
    fontFamily: z.string().min(1).max(100).optional(),
    venue: optionalNullableString,
    venueAddress: optionalNullableString,
    ceremonyTime: optionalNullableString,
    receptionTime: optionalNullableString,
    story: optionalNullableString,
    coverPhoto: z.string().url().optional(),
    gallery: z.array(z.string().url()).max(200, 'Too many gallery images').optional(),
    template: z.string().min(1).max(50).optional(),
    musicUrl: z.union([z.string().url(), z.null()]).optional(),
    musicAutoplay: z.boolean().optional(),
    musicFadeIn: z.boolean().optional(),
    mapUrl: z.union([z.string().url(), z.null()]).optional(),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    brideName: z.string().trim().min(1).max(100).optional(),
    groomName: z.string().trim().min(1).max(100).optional(),
    weddingDate: z
      .string()
      .refine((s) => !Number.isNaN(Date.parse(s)), 'Invalid date')
      .optional(),
  })
  .strict();

export const sectionsUpdateSchema = z.object({
  sections: z.unknown(),
});

// ─── GUEST ───
export const createGuestSchema = z.object({
  invitationId: z.string().min(1, 'invitationId is required'),
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.union([z.string().trim().email('Invalid email'), z.literal(''), z.null()]).optional(),
  phone: z
    .union([
      z.string().trim().min(6).max(30),
      z.literal(''),
      z.null(),
    ])
    .optional(),
  customMessage: z.string().max(2000).nullable().optional(),
  sharedPhoto: z.string().url().nullable().optional(),
  tableNumber: z.union([z.number().int(), z.string(), z.null()]).optional(),
});

const bulkGuestItemSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.union([z.string().trim().email(), z.literal(''), z.null()]).optional(),
  phone: z.union([z.string().trim().min(6).max(30), z.literal(''), z.null()]).optional(),
  customMessage: z.string().max(2000).nullable().optional(),
  sharedPhoto: z.string().url().nullable().optional(),
  tableNumber: z.union([z.number().int(), z.string(), z.null()]).optional(),
});

export const bulkGuestSchema = z.object({
  invitationId: z.string().min(1),
  guests: z.array(bulkGuestItemSchema).max(1000, 'Bulk import exceeds maximum of 1000 rows'),
});

export const rsvpSchema = z.object({
  status: z.enum(['attending', 'declined', 'pending']),
  attendees: z.number().int().min(0).max(20).optional(),
  dietary: z.array(z.string().max(200)).max(20).optional(),
});
