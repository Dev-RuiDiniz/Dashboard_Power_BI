import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';

import { CsrfMiddleware } from './csrf.middleware';

type MockRequest = Partial<Request> & {
  cookies?: Record<string, string>;
  headers?: Record<string, string | string[] | undefined>;
  method?: string;
};

type MockResponse = Partial<Response> & {
  cookie: jest.Mock;
};

function createMockReq(overrides: MockRequest = {}): MockRequest {
  return {
    method: 'GET',
    cookies: {},
    headers: {},
    ...overrides,
  };
}

function createMockRes(): MockResponse {
  return {
    cookie: jest.fn(),
  };
}

function createNext(): jest.Mock {
  return jest.fn();
}

describe('CsrfMiddleware', () => {
  let middleware: CsrfMiddleware;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsrfMiddleware],
    }).compile();

    middleware = module.get<CsrfMiddleware>(CsrfMiddleware);
  });

  describe('GET requests', () => {
    it('should set csrf cookie if not present and call next', () => {
      const req = createMockReq({ method: 'GET', cookies: {} });
      const res = createMockRes();
      const next = createNext();

      middleware.use(req as Request, res as Response, next);

      expect(res.cookie).toHaveBeenCalledWith(
        'csrf-token',
        expect.any(String),
        expect.objectContaining({
          httpOnly: false,
          sameSite: 'lax',
        }),
      );
      expect(req.csrfToken).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it('should reuse existing csrf cookie if present', () => {
      const existingToken = 'existing-token-abc';
      const req = createMockReq({
        method: 'GET',
        cookies: { 'csrf-token': existingToken },
      });
      const res = createMockRes();
      const next = createNext();

      middleware.use(req as Request, res as Response, next);

      expect(res.cookie).not.toHaveBeenCalled();
      expect(req.csrfToken).toBe(existingToken);
      expect(next).toHaveBeenCalled();
    });

    it('should handle HEAD requests like GET', () => {
      const req = createMockReq({ method: 'HEAD', cookies: {} });
      const res = createMockRes();
      const next = createNext();

      middleware.use(req as Request, res as Response, next);

      expect(res.cookie).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should handle OPTIONS requests like GET', () => {
      const req = createMockReq({ method: 'OPTIONS', cookies: {} });
      const res = createMockRes();
      const next = createNext();

      middleware.use(req as Request, res as Response, next);

      expect(res.cookie).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('POST requests', () => {
    it('should throw ForbiddenException when no cookie and no header', () => {
      const req = createMockReq({
        method: 'POST',
        cookies: {},
        headers: {},
      });
      const res = createMockRes();
      const next = createNext();

      expect(() => middleware.use(req as Request, res as Response, next)).toThrow(
        ForbiddenException,
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when cookie exists but header missing', () => {
      const req = createMockReq({
        method: 'POST',
        cookies: { 'csrf-token': 'valid-token' },
        headers: {},
      });
      const res = createMockRes();
      const next = createNext();

      expect(() => middleware.use(req as Request, res as Response, next)).toThrow(
        ForbiddenException,
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when header exists but cookie missing', () => {
      const req = createMockReq({
        method: 'POST',
        cookies: {},
        headers: { 'x-csrf-token': 'some-token' },
      });
      const res = createMockRes();
      const next = createNext();

      expect(() => middleware.use(req as Request, res as Response, next)).toThrow(
        ForbiddenException,
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when cookie and header mismatch', () => {
      const req = createMockReq({
        method: 'POST',
        cookies: { 'csrf-token': 'cookie-token' },
        headers: { 'x-csrf-token': 'header-token' },
      });
      const res = createMockRes();
      const next = createNext();

      expect(() => middleware.use(req as Request, res as Response, next)).toThrow(
        ForbiddenException,
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when cookie and header match', () => {
      const token = 'matching-token';
      const req = createMockReq({
        method: 'POST',
        cookies: { 'csrf-token': token },
        headers: { 'x-csrf-token': token },
      });
      const res = createMockRes();
      const next = createNext();

      middleware.use(req as Request, res as Response, next);

      expect(req.csrfToken).toBe(token);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('PATCH requests', () => {
    it('should call next when cookie and header match', () => {
      const token = 'patch-token';
      const req = createMockReq({
        method: 'PATCH',
        cookies: { 'csrf-token': token },
        headers: { 'x-csrf-token': token },
      });
      const res = createMockRes();
      const next = createNext();

      middleware.use(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when tokens mismatch', () => {
      const req = createMockReq({
        method: 'PATCH',
        cookies: { 'csrf-token': 'a' },
        headers: { 'x-csrf-token': 'b' },
      });
      const res = createMockRes();
      const next = createNext();

      expect(() => middleware.use(req as Request, res as Response, next)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('DELETE requests', () => {
    it('should call next when cookie and header match', () => {
      const token = 'delete-token';
      const req = createMockReq({
        method: 'DELETE',
        cookies: { 'csrf-token': token },
        headers: { 'x-csrf-token': token },
      });
      const res = createMockRes();
      const next = createNext();

      middleware.use(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('generated token format', () => {
    it('should generate a hex token of 64 characters (32 bytes)', () => {
      const req = createMockReq({ method: 'GET', cookies: {} });
      const res = createMockRes();
      const next = createNext();

      middleware.use(req as Request, res as Response, next);

      const cookieCall = res.cookie.mock.calls[0];
      const token: string = cookieCall[1];

      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
