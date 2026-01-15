# PUP Calendar Integration Guide

## Overview
The RecoVibe calendar system now integrates official PUP academic calendar events directly from the Polytechnic University of the Philippines official website. This provides users with automatically updated academic schedules without manual entry.

## Features

### 1. **Automatic Event Fetching**
- Events are fetched directly from the official PUP calendar: https://www.pup.edu.ph/about/calendar
- Supports multiple semesters (First Semester, Second Semester, Summer Term)
- Parses dates, times, locations, and event descriptions automatically

### 2. **Smart Caching**
- 24-hour cache to reduce API calls and improve performance
- Automatic fallback to cached events if the PUP website is unavailable
- Manual cache refresh via API endpoint

### 3. **Event Categorization**
PUP events are automatically categorized by type:
- **Academic**: Class schedules, registration, enrollment
- **Examination**: Exams and departmental examinations
- **Ceremony**: Commencement and graduation exercises
- **Meeting**: Faculty and administrative meetings
- **Deadline**: Submission and application deadlines
- **Holiday**: Holidays and vacation periods

### 4. **Dual Event Sources**
The calendar displays both:
- **RecoVibe Events** (🎓 marker): Organization and campus-wide events from Firestore
- **PUP Calendar Events** (📅 marker): Official academic calendar from PUP website

## API Endpoints

### Get Events by Month
```
GET /api/pup-calendar/month/:year/:month
```
**Parameters:**
- `year`: Calendar year (e.g., 2025)
- `month`: Month number (1-12)

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "date": "2025-09-01",
      "title": "First Semester classes start",
      "time": "",
      "location": "PUP Main Campus",
      "description": "First Semester, Academic Year 2025-2026 - First Semester classes start",
      "source": "PUP Official Calendar",
      "isPUPEvent": true,
      "category": "academic"
    }
  ],
  "count": 42
}
```

### Get Events by Date Range
```
GET /api/pup-calendar/range/:startDate/:endDate
```
**Parameters:**
- `startDate`: Start date in YYYY-MM-DD format
- `endDate`: End date in YYYY-MM-DD format

**Example:**
```
GET /api/pup-calendar/range/2025-09-01/2025-09-30
```

### Get All Events
```
GET /api/pup-calendar/all
```
Fetches the complete PUP academic calendar for all available months.

### Refresh Cache
```
POST /api/pup-calendar/refresh
```
Clears the cached events and forces a fresh fetch from the PUP website on the next request.

## Calendar Display

### User Interface Changes
1. **Event Indicators**
   - Blue dot (•) indicates an event on that day
   - Events are color-coded by status:
     - **Gray**: Past events
     - **Light Green**: Current day events
     - **Light Blue**: Future events
     - **Blue**: Today's date

2. **Event Modal**
   - Click any date to see detailed event information
   - Each event shows:
     - Event title and time
     - Location (📍 icon)
     - Full description
     - Event source (PUP Official Calendar or RecoVibe)
     - Event type marker

### Example Event Display
```
First Semester classes start
📍 PUP Main Campus
First Semester, Academic Year 2025-2026 - First Semester classes start
Source: PUP Official Calendar
```

## Technical Details

### Files Modified
1. **server.js** - Added four new API endpoints for PUP calendar
2. **html/calendar.html** - Updated to fetch and display both event sources

### New File
- **pupCalendarService.js** - Core service for fetching and parsing PUP calendar

### How It Works

#### Event Fetching Process
1. Client requests events for a specific month
2. Service checks 24-hour cache
3. If cache miss, fetches HTML from PUP website via HTTPS
4. Parses HTML table structure to extract:
   - Date ranges
   - Event descriptions
   - Academic semester/term info
5. Converts dates to ISO format (YYYY-MM-DD)
6. Returns structured event objects

#### Parsing Logic
- Extracts month and day information from calendar table
- Handles date ranges (e.g., "7-18" becomes multiple events)
- Converts semester information for proper year assignment
- Categories events based on description keywords

#### Calendar Integration
- Both Firestore and PUP events are loaded in parallel
- Events are merged and displayed together
- Same filtering and sorting logic applies to both sources

## Configuration

### Cache Duration
Default: 24 hours
To modify, edit `pupCalendarService.js`:
```javascript
this.cacheDuration = 24 * 60 * 60 * 1000; // Change this value in milliseconds
```

### Event Categories
To add or modify categories, edit the `categorizeEvent()` method in `pupCalendarService.js`

## Testing

### Manual Testing Steps
1. Navigate to the calendar page
2. Observe that PUP events appear alongside RecoVibe events
3. Click on dates with PUP events
4. Verify event details are displayed correctly
5. Test month navigation
6. Test cache refresh via POST request:
   ```
   curl -X POST http://localhost:3000/api/pup-calendar/refresh
   ```

### API Testing
```bash
# Get January 2026 PUP events
curl http://localhost:3000/api/pup-calendar/month/2026/1

# Get events in January 2026
curl http://localhost:3000/api/pup-calendar/range/2026-01-01/2026-01-31

# Get all events
curl http://localhost:3000/api/pup-calendar/all

# Refresh cache
curl -X POST http://localhost:3000/api/pup-calendar/refresh
```

## Expected Data

### Academic Year 2025-2026 Events Include

**First Semester:**
- July 7-18: First Year Admission & Enrollment
- August: Online Registration (by year level)
- September 1: First Semester classes start
- October 3: Last day of fee payment
- October 20-25: Mid-Term Examinations
- December 15-20: Final Examinations for Graduating Students
- December 22 - January 4: Christmas Vacation

**Second Semester:**
- January-February: Online Registrations
- February 9: Second Semester classes start
- April 2-5: Holy Week (Maundy Thursday - Black Saturday)
- April 6-11: Mid-Term Examinations
- May 25-30: Final Examinations for Graduating Students
- June 15-21: Final Examinations for Non-Graduating Students
- August 18-20: Year-End Commencement Exercises

**Summer Term:**
- June 29: Summer Classes start
- July 16-18: Mid-Term Examinations
- August 6-8: Final Examinations
- August 8: Summer Term Ends

## Performance Considerations

### Caching Benefits
- Reduces external API calls
- Faster calendar load times
- Graceful degradation when PUP website is down

### Load Impact
- Initial fetch: ~2-3 seconds (includes HTTPS request)
- Cached response: <100ms
- Parser processes ~200-300 events

## Error Handling

### Network Failures
- Returns cached events if available
- Logs errors to server console
- Client-side error handling prevents UI crashes

### Invalid Dates
- API returns 400 error for malformed dates
- Calendar continues functioning without PUP events

### Parsing Issues
- Failed to parse dates are skipped
- Successfully parsed events are returned
- Server logs indicate which events had parsing issues

## Future Enhancements

1. **WebSocket Updates** - Real-time calendar updates
2. **Event Notifications** - Alert users to important deadlines
3. **iCal Export** - Export calendar to standard calendar apps
4. **Recurring Events** - Better handling of repeating events
5. **Mobile App Integration** - Push notifications for upcoming events
6. **Event Subscriptions** - Users choose which event types to display
7. **Custom Reminders** - Set alerts before specific events

## Troubleshooting

### PUP Events Not Appearing
1. Check browser console for errors (F12)
2. Verify internet connection
3. Check server logs for fetch errors
4. Clear browser cache
5. Test API endpoint directly: `curl http://localhost:3000/api/pup-calendar/all`

### Duplicate Events
- Check Firestore to ensure no duplicate local events
- Clear cache and reload: `curl -X POST http://localhost:3000/api/pup-calendar/refresh`

### Incorrect Dates
- Verify PUP website still has calendar in same format
- Check parsing logic in `categorizeEvent()` and date parsing sections
- Update parser if PUP website format changes

## Support & Maintenance

For issues or updates needed:
1. Monitor PUP website changes (format updates require parser changes)
2. Check API responses for unusual data
3. Review server logs for persistent errors
4. Update parsing logic if PUP website redesigns their calendar

---

**Last Updated:** January 15, 2026
**Version:** 1.0
