import { guid } from './guid.util';

// File Level Tests
describe('Guid Utilities', () => {
  // Function level tests
  describe('guid', () => {
    // Test case 1
    it('should test guid', () => {
      expect(guid).toBeDefined();
    });
  });
});
