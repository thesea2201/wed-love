# WedLove Testing Specification

> QA test cases for the section-based invitation system and editor.

## Section Component Tests

### 1. Hero Section

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| H-01 | Renders couple names | Load invitation with groomName="An", brideName="Linh" | Shows "An" and "Linh" prominently |
| H-02 | Displays wedding date | Set weddingDate to "2026-06-15" | Shows "15 / Tháng 6 / 2026" format |
| H-03 | Countdown visible | config.showCountdown=true, weddingDate in future | Shows countdown with days remaining |
| H-04 | Countdown hidden | config.showCountdown=false | No countdown element present |
| H-05 | Personalized greeting | guest.name="Chị Hoa" present | Shows "Kính mời Chị Hoa" (formal) or "Thân mến Chị Hoa" (casual) |
| H-06 | No guest greeting | guest is null | No personalized greeting shown |
| H-07 | Parallax effect | config.parallax=true | Background moves at different rate on scroll |
| H-08 | Formal greeting style | config.greetingStyle="formal" | Uses "Kính mời" prefix |
| H-09 | Casual greeting style | config.greetingStyle="casual" | Uses "Thân mến" prefix |
| H-10 | Background image | coverPhoto URL provided | Image displays as background with overlay |

### 2. Story Section

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| S-01 | Renders story text | story="Line 1\n\nLine 2" | Two paragraphs rendered with spacing |
| S-02 | Split layout left | layout="split", imagePosition="left" | Image on left, text on right |
| S-03 | Split layout right | layout="split", imagePosition="right" | Image on right, text on left |
| S-04 | Full layout | layout="full" | Single column, centered, max-w-2xl |
| S-05 | Empty story fallback | story=null or empty | Shows default placeholder story |
| S-06 | Gallery image | gallery[0] exists | Displays first gallery photo |
| S-07 | Unsplash fallback | gallery empty | Shows Unsplash placeholder image |

### 3. Event Section

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| E-01 | Vietnamese date format | weddingDate="2026-06-15" | Shows "Thứ Bảy, ngày 15 tháng 6 năm 2026" |
| E-02 | Venue display | venue="Trống Đồng Palace" | Venue name prominently displayed |
| E-03 | Address display | venueAddress="135A Nguyễn Hữu Cảnh..." | Full address shown |
| E-04 | Ceremony time | ceremonyTime="9:00 sáng" | Time displayed with clock icon |
| E-05 | Reception time | receptionTime="6:00 chiều", showReception=true | Reception details shown |
| E-06 | Hide reception | showReception=false | Reception time not displayed |
| E-07 | Dress code badge | showDressCode=true, dressCodeText="Áo dài" | Badge with dress code text |
| E-08 | Add to calendar | Click "Thêm vào lịch" | Opens Google Calendar with event |
| E-09 | Map directions | Click "Chỉ đường" | Opens Google Maps directions |

### 4. RSVP Section

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| R-01 | Yes response | Select "Có, tôi sẽ tham dự" | Shows attendee count selector |
| R-02 | No response | Select "Rất tiếc, tôi không thể đến" | Hides attendee count |
| R-03 | Attendee count | Set maxAttendees=5 | Shows options 1-5 |
| R-04 | Dietary options | showDietary=true | Shows checkboxes for dietaryOptions |
| R-05 | Submit RSVP | Fill form, click submit | POST to /guests/:token/rsvp, success message |
| R-06 | Already responded | Guest has rsvpStatus="attending" | Shows "Bạn đã xác nhận tham dự" |
| R-07 | Custom message | Type in textarea | Message included in RSVP payload |
| R-08 | Validation | Submit without selecting attendance | Error: "Vui lòng chọn tham dự hoặc từ chối" |

### 5. Gallery Section

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| G-01 | Grid layout 2 columns | config.columns=2, 4 photos | 2x2 grid displayed |
| G-02 | Grid layout 3 columns | config.columns=3, 6 photos | 2 rows of 3 photos |
| G-03 | Lightbox open | config.lightbox=true, click photo | Modal opens with selected photo |
| G-04 | Lightbox navigation | In lightbox, click arrows | Shows next/previous photo |
| G-05 | Lightbox close | Click outside or X button | Modal closes |
| G-06 | Empty gallery | gallery=[] | Shows "Chưa có ảnh" placeholder |
| G-07 | Hover effect | Hover over photo | Scales up slightly (transform: scale) |
| G-08 | All photos loaded | 20 photos in gallery | All render without performance issues |

### 6. Countdown Section

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| C-01 | Days calculation | weddingDate=7 days from now | Shows 7 days |
| C-02 | Hours calculation | weddingDate=25 hours from now | Shows 1 day, 1 hour |
| C-03 | Show seconds | config.showSeconds=true | Seconds counter visible, updating |
| C-04 | Hide seconds | config.showSeconds=false | No seconds shown |
| C-05 | Vietnamese labels | config.showLabels=true | Shows "Ngày", "Giờ", "Phút", "Giây" |
| C-06 | Wedding day arrived | weddingDate=today | Shows "Hôm nay là ngày vui!" |
| C-07 | Auto-update | Wait 1 second | Counter decrements by 1 second |
| C-08 | Boxed style | config.style="boxed" | Each unit in separate box |

### 7. Map Section

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| M-01 | Google Maps embed | provider="google", mapUrl provided | Embeds Google Maps iframe |
| M-02 | Venue name | venue="Trống Đồng Palace" | Shows venue name above map |
| M-03 | Address display | venueAddress provided | Shows full address |
| M-04 | Directions button | showDirections=true | "Chỉ đường" button visible |
| M-05 | Directions link | Click "Chỉ đường" | Opens Google Maps with directions |
| M-06 | Coordinates fallback | lat/lng provided, no mapUrl | Shows static map with pin |
| M-07 | No map data | mapUrl=null, no coordinates | Shows address text only |

### 8. Music Section

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| MU-01 | Play button | Click play when paused | Audio starts, icon changes to pause |
| MU-02 | Pause button | Click pause when playing | Audio pauses, icon changes to play |
| MU-03 | Autoplay blocked | config.autoplay=true, first visit | Shows "Tap to play music" overlay |
| MU-04 | Fade in | config.fadeIn=true | Volume gradually increases |
| MU-05 | Controls visible | config.showControls=true | Volume slider visible |
| MU-06 | No music URL | musicUrl=null | Section not rendered or shows placeholder |
| MU-07 | Loop playback | Audio ends | Automatically restarts from beginning |

### 9. Gift Section

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| GI-01 | Preset amounts | Click "500.000đ" | Amount field set to 500000 |
| GI-02 | Custom amount | Type "750000" in input | Amount set to 750000 VND |
| GI-03 | MoMo method | methods includes "momo" | MoMo payment option visible |
| GI-04 | Bank transfer | methods includes "bank_transfer" | Bank transfer option visible |
| GI-05 | QR code display | showBankQR=true, bankQR exists | QR code image displayed |
| GI-06 | Anonymous toggle | Toggle on | Sets giftIsAnonymous=true |
| GI-07 | Gift message | Type in textarea | Message saved with gift |
| GI-08 | Submit gift | Select amount, method, submit | Creates payment record, shows success |

---

## Template Preset Tests

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| T-01 | Cinematic template | Select "cinematic" | Sections ordered: hero, story, event, gallery, rsvp, map, gift |
| T-02 | Elegant template | Select "elegant" | Primary color: #c9a96e, font: Cormorant Garamond |
| T-03 | Modern template | Select "modern" | Primary color: #1a1a1a, font: Inter, 4-column gallery |
| T-04 | Minimal template | Select "minimal" | Only hero, event, rsvp visible by default |
| T-05 | Vintage template | Select "vintage" | Sepia tones, Great Vibes font |
| T-06 | Template switch | Change from cinematic to modern | Sections update with new defaults, user data preserved |

---

## InvitationEditor Tests

### Content Tab

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| EC-01 | Edit groom name | Type "Minh" in groomName field | Preview updates to show "Minh" |
| EC-02 | Edit bride name | Type "Lan" in brideName field | Preview updates to show "Lan" |
| EC-03 | Edit title | Type "Minh & Lan" in title | Preview hero section updates |
| EC-04 | Date picker | Select 2026-07-20 from date picker | Preview countdown recalculates |
| EC-05 | Venue input | Type "White Palace" in venue | Preview event section updates |
| EC-06 | Address textarea | Type full address | Preview shows complete address |
| EC-07 | Time inputs | Set ceremonyTime, receptionTime | Preview event times update |
| EC-08 | Story textarea | Type multi-line story | Preview story section updates with paragraphs |
| EC-09 | Required validation | Clear groomName, attempt save | Error: "Tên chú rể là bắt buộc" |
| EC-10 | AI story button | Click "✨ Gợi ý câu chuyện" | Opens AI assistant panel |
| EC-11 | AI story select | Select suggested story | Textarea updates with selected story |

### Design Tab

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| ED-01 | Template selection | Click "Elegant" template card | Template preview shown, selected state |
| ED-02 | Color picker | Change primaryColor to #ff0000 | Preview primary color updates |
| ED-03 | Font dropdown | Select "Inter" from font list | Preview font changes to Inter |
| ED-04 | Cover photo upload | Upload new image | Preview shows new cover photo |
| ED-05 | Photo remove | Click remove on coverPhoto | Preview shows placeholder/no image |
| ED-06 | Secondary color | Set secondaryColor | Preview shows secondary color usage |

### Sections Tab

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| ES-01 | Toggle section | Toggle "story" section off | Preview hides story section |
| ES-02 | Enable section | Toggle "story" section on | Preview shows story section |
| ES-03 | Reorder sections | Drag "event" above "story" | Preview shows event before story |
| ES-04 | Section config | Edit story layout to "full" | Preview story uses full layout |
| ES-05 | Gallery columns | Set gallery columns to 4 | Preview gallery shows 4 columns |
| ES-06 | Reset defaults | Click "Reset to template defaults" | Sections revert to template defaults |
| ES-07 | All sections visible | Enable all 9 sections | Preview shows all sections in order |

### Preview & Save

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| EP-01 | Real-time preview | Edit title, wait 300ms | Preview iframe updates without save |
| EP-02 | Save changes | Click "Save Changes" | PATCH request sent, success toast |
| EP-03 | Save error | Network error during save | Error toast, retry button visible |
| EP-04 | Publish | Click "Publish Invitation" | POST /publish, preview URL live |
| EP-05 | Draft vs published | Edit after publish | Save shows "Unpublished changes" |
| EP-06 | Preview URL | Copy preview URL | Opens invitation with current draft |
| EP-07 | Mobile preview | Resize window to mobile | Preview scales to mobile viewport |

---

## End-to-End User Flows

### Flow 1: Create New Invitation

```
1. Login as couple
2. Click "Tạo thiệp mới"
3. Fill Content tab (names, date, venue)
4. Select Design template
5. Toggle Sections (disable gift, enable countdown)
6. Save changes
7. Preview invitation
8. Publish invitation
9. Copy public URL
```

**Expected Results:**
- Invitation created with unique slug
- All content saved correctly
- Preview reflects all customizations
- Public URL accessible without login

### Flow 2: Edit Existing Invitation

```
1. Login as couple
2. Select existing invitation
3. Change wedding date in Content tab
4. Switch template in Design tab
5. Reorder sections (move story to end)
6. Save changes
7. Verify preview shows changes
```

**Expected Results:**
- Date change reflects in countdown
- Template switch preserves content
- Section order persists after save

### Flow 3: Guest RSVP Flow

```
1. Receive invitation link with token
2. View personalized hero with name
3. Scroll to RSVP section
4. Select "Có, tôi sẽ tham dự"
5. Set 2 attendees
6. Select dietary option
7. Add custom message
8. Submit RSVP
9. See confirmation
```

**Expected Results:**
- Guest sees personalized greeting
- RSVP data saved to database
- Couple sees updated guest list

---

## Regression Tests

| ID | Test Case | Risk Area |
|----|-----------|-----------|
| REG-01 | Seed data loads | Database schema changes |
| REG-02 | Auth token persists | Session management |
| REG-03 | Invitation list loads | Dashboard performance |
| REG-04 | Image upload works | File handling, S3/local |
| REG-05 | Font loading | Google Fonts availability |

---

## Performance Tests

| ID | Test Case | Metric |
|----|-----------|--------|
| PERF-01 | Initial load | < 3 seconds |
| PERF-02 | Preview update | < 500ms after edit |
| PERF-03 | Gallery 50 photos | < 2 seconds to render |
| PERF-04 | Save operation | < 1 second |
| PERF-05 | Tab switching | < 100ms |

---

## Accessibility Tests

| ID | Test Case | WCAG Standard |
|----|-----------|---------------|
| A11Y-01 | Keyboard navigation | 2.1.1 Keyboard |
| A11Y-02 | Form labels | 3.3.2 Labels or Instructions |
| A11Y-03 | Color contrast | 1.4.3 Contrast (Minimum) |
| A11Y-04 | Focus indicators | 2.4.7 Focus Visible |
| A11Y-05 | Screen reader sections | 1.3.1 Info and Relationships |

---

## Testing Commands

```bash
# Run all tests
pnpm test

# Run specific section tests
pnpm test HeroSection

# Run e2e tests
pnpm test:e2e

# Test with seed data
pnpm db:seed && pnpm test
```

## Test Data (Seed)

**Demo Couple:**
- Email: demo@wedlove.pro
- Password: 123456
- Groom: An
- Bride: Linh
- Date: 2026-06-15

**Demo Invitation:**
- Slug: an-va-linh-demo
- Template: cinematic
- Sections: hero, story, event, gallery, rsvp, map, gift

**Test Guest:**
- Name: Chị Linh
- Token: (auto-generated)
- RSVP: pending
