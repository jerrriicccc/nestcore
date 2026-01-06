const Transformer = {
  to: (value: string[]): string => {
    try {
      if (!value) return JSON.stringify([]);

      if (!Array.isArray(value)) {
        console.warn('Access value is not an array, converting to empty array');
        return JSON.stringify([]);
      }

      const uniqueValues = [...new Set(value.map((v) => String(v).trim()))];
      return JSON.stringify(uniqueValues);
    } catch (error) {
      console.error('Error transforming access array to string:', error);
      return JSON.stringify([]);
    }
  },
  from: (value: string): string[] => {
    if (!value) return [];

    // Try JSON.parse first
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return [...new Set(parsed.map((v) => String(v).trim()))];
      }
      if (typeof parsed === 'string') {
        const s = String(parsed).trim();
        return s ? [s] : [];
      }
      // not an array or string => return empty
      console.warn('Parsed access value is not an array or string, returning empty array');
      return [];
    } catch (error) {
      // fallback parsing: handle common malformed cases
      try {
        const raw = String(value).trim();

        // Case: comma-separated values like "read,write"
        if (raw.includes(',')) {
          return [...new Set(raw.split(',').map((v) => String(v).replace(/^\s+|\s+$/g, '').replace(/^['"]|['"]$/g, '').trim()).filter(Boolean))];
        }

        // Case: array-like with single quotes: ['a','b']
        if (raw.startsWith('[') && /'/.test(raw)) {
          try {
            const replaced = raw.replace(/'/g, '"');
            const parsed2 = JSON.parse(replaced);
            if (Array.isArray(parsed2)) return [...new Set(parsed2.map((v) => String(v).trim()))];
          } catch (e) {
            // fallthrough
          }
        }

        // Case: a single quoted or unquoted value
        const noQuotes = raw.replace(/^['"]|['"]$/g, '').trim();
        return noQuotes ? [noQuotes] : [];
      } catch (e2) {
        console.error('Error parsing access string to array (fallback):', e2);
        return [];
      }
    }
  },
};

export default Transformer;
