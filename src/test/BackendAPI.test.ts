const { BackendAPI } = require('../backend/BackendAPI');

describe('BackendAPI Test Suite', () => {
    test('Constructor()', () => {
        const backendAPI = new BackendAPI("mockURL", 123);
    });
});
