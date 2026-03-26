// Provide global `logger` used by some widget files (injected by widget-base-helpers at runtime)
global.logger = {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
};

// Provide global `mx` (Mendix runtime) used by Core.js cleanup
global.mx = {
    data: {
        release: jest.fn(),
    },
    version: '7.0.0',
};
