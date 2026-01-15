/**
 * PUP Calendar Service
 * Fetches official PUP academic calendar events and parses them
 * for integration into RecoVibe calendar system
 */

const https = require('https');

class PUPCalendarService {
  constructor() {
    this.cachedEvents = null;
    this.lastFetchTime = null;
    this.cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  /**
   * Parse PUP calendar HTML and extract events
   * Returns array of event objects
   */
  parsePUPCalendar(htmlContent) {
    const events = [];
    
    // Months mapping for parsing
    const months = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
    };

    // Extract table rows from HTML
    const tableRows = htmlContent.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
    
    let currentMonth = '';
    let currentYear = 2025;
    let semester = '';
    
    tableRows.forEach((row) => {
      // Extract cell contents
      const cells = row.match(/<td[^>]*>[\s\S]*?<\/td>/gi) || [];
      
      if (cells.length === 0) return;
      
      // Helper to extract text from cell
      const getCellText = (index) => {
        if (index >= cells.length) return '';
        const match = cells[index].match(/>([^<]*)</);
        return match ? match[1].trim() : '';
      };
      
      // Check for semester header
      const headerText = getCellText(0);
      if (headerText.includes('Semester') || headerText.includes('Term')) {
        semester = headerText;
        return;
      }
      
      // Extract month and days
      const monthText = getCellText(0);
      const daysText = getCellText(1);
      const eventDescription = getCellText(2);
      
      if (!monthText || !daysText || !eventDescription) return;
      
      // Update current month if found
      if (months.hasOwnProperty(monthText)) {
        currentMonth = monthText;
        if (monthText === 'January' || monthText === 'February') {
          currentYear = 2026; // Adjust year for second semester events
        }
      }
      
      // Parse day(s) from daysText (e.g., "1-30", "15", "1, 5")
      const dayRanges = daysText.split(',').map(d => d.trim());
      const parsedDates = [];
      
      dayRanges.forEach((dayRange) => {
        if (dayRange.includes('-')) {
          // Handle range like "1-30"
          const [start, end] = dayRange.split('-').map(d => parseInt(d.trim()));
          for (let day = start; day <= end; day++) {
            parsedDates.push(day);
          }
        } else {
          // Single day
          const day = parseInt(dayRange);
          if (!isNaN(day)) parsedDates.push(day);
        }
      });
      
      // Create event entries for each date
      parsedDates.forEach((day) => {
        const monthIndex = months[currentMonth];
        const dateStr = new Date(currentYear, monthIndex, day).toISOString().slice(0, 10);
        
        events.push({
          date: dateStr,
          title: eventDescription.trim(),
          time: '',
          location: 'PUP Main Campus',
          description: `${semester} - ${eventDescription.trim()}`,
          source: 'PUP Official Calendar',
          isPUPEvent: true,
          category: this.categorizeEvent(eventDescription)
        });
      });
    });
    
    return events;
  }

  /**
   * Categorize PUP events for better visualization
   */
  categorizeEvent(description) {
    const desc = description.toLowerCase();
    
    if (desc.includes('class') || desc.includes('registration') || desc.includes('enrollment')) {
      return 'academic';
    }
    if (desc.includes('exam') || desc.includes('examination')) {
      return 'examination';
    }
    if (desc.includes('commencement') || desc.includes('graduation')) {
      return 'ceremony';
    }
    if (desc.includes('meeting') || desc.includes('faculty')) {
      return 'meeting';
    }
    if (desc.includes('deadline') || desc.includes('submission')) {
      return 'deadline';
    }
    if (desc.includes('holiday') || desc.includes('vacation')) {
      return 'holiday';
    }
    
    return 'event';
  }

  /**
   * Fetch PUP calendar from official website
   * Returns parsed events array
   */
  async fetchPUPCalendar() {
    return new Promise((resolve, reject) => {
      // Check cache
      if (this.cachedEvents && this.lastFetchTime) {
        const timeSinceLastFetch = Date.now() - this.lastFetchTime;
        if (timeSinceLastFetch < this.cacheDuration) {
          console.log('Returning cached PUP calendar events');
          return resolve(this.cachedEvents);
        }
      }
      
      console.log('Fetching fresh PUP calendar from official website...');
      
      const options = {
        hostname: 'www.pup.edu.ph',
        path: '/about/calendar',
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };
      
      https.get(options, (res) => {
        let htmlData = '';
        
        res.on('data', (chunk) => {
          htmlData += chunk;
        });
        
        res.on('end', () => {
          try {
            const events = this.parsePUPCalendar(htmlData);
            
            // Cache the events
            this.cachedEvents = events;
            this.lastFetchTime = Date.now();
            
            console.log(`Successfully parsed ${events.length} PUP calendar events`);
            resolve(events);
          } catch (error) {
            console.error('Error parsing PUP calendar:', error);
            reject(error);
          }
        });
      }).on('error', (error) => {
        console.error('Error fetching PUP calendar:', error);
        
        // Return cached events if available, even if stale
        if (this.cachedEvents) {
          console.log('Returning stale cached PUP calendar events due to fetch error');
          return resolve(this.cachedEvents);
        }
        
        reject(error);
      });
    });
  }

  /**
   * Get events for a specific date range
   */
  async getEventsByDateRange(startDate, endDate) {
    const events = await this.fetchPUPCalendar();
    
    return events.filter(event => {
      return event.date >= startDate && event.date <= endDate;
    });
  }

  /**
   * Get events for a specific month
   */
  async getEventsByMonth(year, month) {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    
    return this.getEventsByDateRange(startDate, endDate);
  }

  /**
   * Clear cache to force fresh fetch on next request
   */
  clearCache() {
    this.cachedEvents = null;
    this.lastFetchTime = null;
  }
}

module.exports = new PUPCalendarService();
