# PUP Calendar Integration - Quick Reference

## What Changed?

### New Files
- `pupCalendarService.js` - Service that fetches and parses PUP calendar
- `PUP_CALENDAR_INTEGRATION.md` - Full documentation

### Modified Files
- `server.js` - Added 4 new API endpoints
- `html/calendar.html` - Updated to display PUP events

## Quick Start

### 1. Start the server
```bash
node server.js
```

### 2. Navigate to calendar
Open browser to: `http://localhost:3000/html/calendar.html`

### 3. View PUP events
- PUP events appear automatically on the calendar
- Click any date to see event details
- PUP events marked with "🎓 PUP Calendar"

## API Quick Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pup-calendar/month/:year/:month` | GET | Get events for specific month |
| `/api/pup-calendar/range/:startDate/:endDate` | GET | Get events for date range |
| `/api/pup-calendar/all` | GET | Get all PUP events |
| `/api/pup-calendar/refresh` | POST | Clear cache & force refresh |

## Event Structure

```javascript
{
  "date": "2025-09-01",           // ISO format YYYY-MM-DD
  "title": "First Semester...",   // Event name
  "time": "",                     // Time (if available)
  "location": "PUP Main Campus",  // Location
  "description": "...",           // Full description
  "source": "PUP Official Calendar", // Event source
  "isPUPEvent": true,             // Flag for PUP events
  "category": "academic"          // academic|examination|ceremony|meeting|deadline|holiday|event
}
```

## Testing Events

### Terminal Test
```bash
# Get January 2026 events
curl http://localhost:3000/api/pup-calendar/month/2026/1
```

### Browser Console Test
```javascript
// Fetch September 2025 events
fetch('/api/pup-calendar/month/2025/9')
  .then(r => r.json())
  .then(data => console.log(data.events));
```

## Common Tasks

### Add Custom Category
Edit `pupCalendarService.js`, `categorizeEvent()` method:
```javascript
if (desc.includes('your keyword')) {
  return 'your-category';
}
```

### Change Cache Duration
Edit `pupCalendarService.js`:
```javascript
this.cacheDuration = 12 * 60 * 60 * 1000; // 12 hours instead of 24
```

### Force Fresh Events
```bash
curl -X POST http://localhost:3000/api/pup-calendar/refresh
```

## Event Categories

| Category | Examples |
|----------|----------|
| academic | Classes, registration, enrollment |
| examination | Exams, departmental examinations |
| ceremony | Commencement, graduation |
| meeting | Faculty meetings, council meetings |
| deadline | Application deadlines, submissions |
| holiday | Christmas, New Year, holidays |
| event | Other events |

## Visual Indicators

| Indicator | Meaning |
|-----------|---------|
| 🎓 PUP Calendar | Official PUP academic calendar event |
| 📅 Campus Event | RecoVibe local event |
| • (blue dot) | Event on this date |
| Gray background | Past event |
| Light green | Current day event |
| Light blue | Future event |
| Blue | Today's date |

## Performance Tips

1. **First load** (~2-3 seconds) - Initial fetch and parse
2. **Subsequent loads** (<100ms) - Uses 24-hour cache
3. **Cache clears daily** - Automatic sync with PUP updates
4. **Parallel loading** - Fetches Firestore + PUP events simultaneously

## Debugging

### Enable verbose logging
Add to `pupCalendarService.js`:
```javascript
console.log(`Parsing event: ${eventDescription}`);
console.log(`Parsed dates for event: ${parsedDates}`);
```

### Check browser network tab
- Look for `/api/pup-calendar/month/...` requests
- Verify response contains event data
- Check response time and payload size

### Check server logs
```
Fetching fresh PUP calendar from official website...
Successfully parsed 145 PUP calendar events
```

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| No PUP events showing | Check server is running, browser console for errors |
| Duplicate events | Clear browser cache, restart server |
| Wrong dates | Verify parsing in `pupCalendarService.js` |
| Slow calendar load | Wait for cache to warm up (first 2-3 seconds) |
| API returns 400 | Check date format (must be YYYY-MM-DD) |

## File Locations

- Calendar page: `/html/calendar.html`
- Service: `/pupCalendarService.js`
- Server: `/server.js`
- Documentation: `/PUP_CALENDAR_INTEGRATION.md` (this file)

## Next Steps

1. Test the calendar in your browser
2. Verify PUP events appear correctly
3. Check browser console for any errors
4. Review server logs for any warnings
5. Customize event categories if needed
6. Share with users!

---

**Questions?** Check `PUP_CALENDAR_INTEGRATION.md` for detailed docs.
