# Ramadan Schedule Rules

**Theoretical Lectures Schedule**

Before Ramadan | During Ramadan
---------------|----------------
08:00 - 08:50  | 10:00 - 10:35
09:00 - 09:50  | 10:35 - 11:10
10:00 - 10:50  | 11:15 - 11:50
11:00 - 11:50  | 11:50 - 12:25
12:00 - 12:50  | 12:30 - 01:05
01:00 - 01:50  | 01:30 - 02:05
02:00 - 02:50  | 02:05 - 02:40
03:00 - 03:50  | 02:45 - 03:20
04:00 - 04:50  | 03:20 - 03:55
05:00 - 05:50  | 03:55 - 04:30
06:00 - 06:50  | 04:50 - 05:25
07:00 - 07:50  | 05:25 - 06:00
08:00 - 08:50  | Not in use

**Practical/Lab Sessions Schedule**

Before Ramadan | During Ramadan
---------------|----------------
08:00 - 09:20  | 10:00 - 10:50
09:30 - 10:50  | 11:00 - 11:50
11:00 - 12:20  | 12:00 - 12:50
12:30 - 01:50  | 01:10 - 02:00
02:00 - 03:20  | 02:10 - 03:00
03:30 - 04:50  | 03:10 - 04:00
05:00 - 06:20  | 04:20 - 05:10

**Key Rules and Implementation Details:**

1. **Session Type Identification:**
   - Practical sessions are automatically identified by their duration
   - A session is considered practical if its duration is approximately 80 minutes (±5 minutes)
   - Sessions not matching this duration are treated as theoretical lectures
   - The activity type in the schedule is used for display purposes

2. **Time Conversion Rules:**
   - Theoretical lectures are exactly 35 minutes during Ramadan
   - Practical sessions are exactly 50 minutes during Ramadan
   - Each regular time slot maps to a specific Ramadan time slot
   - Evening sessions (8:00 PM) are marked as "Not in use" during Ramadan

3. **Time Format and Display:**
   - Times are displayed in 12-hour format with Arabic meridiem indicators (ص/م)
   - Time conversion preserves the original format style
   - Proper handling of 12-hour time conversions (12 PM/AM edge cases)
   - Consistent formatting for both input and output times

4. **Schedule Adjustments:**
   - Morning classes start at 10:00 AM during Ramadan
   - Fixed time slots for both theoretical and practical sessions
   - No overlapping time slots between different session types
   - Automatic handling of breaks between sessions

5. **Implementation Notes:**
   - 5-minute flexibility window for practical session identification
   - Exact minute-level precision in time conversions
   - Consistent handling of time periods (AM/PM)
   - Automatic adjustment of session durations

This schedule implementation:
- Automatically identifies and converts session types
- Maintains consistent time formatting
- Handles edge cases and special time slots
- Provides exact mapping between regular and Ramadan timings
- Ensures accurate time conversions while preserving format