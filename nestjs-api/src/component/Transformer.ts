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
    try {
      if (!value) return [];

      const parsed = JSON.parse(value);

      if (!Array.isArray(parsed)) {
        console.warn(
          'Parsed access value is not an array, returning empty array',
        );
        return [];
      }

      return [...new Set(parsed.map((v) => String(v).trim()))];
    } catch (error) {
      console.error('Error parsing access string to array:', error);
      return [];
    }
  },
};

export default Transformer;
