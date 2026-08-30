// Tests for assertMovieId — the guard that stops an attacker-influenced value
// from being interpolated into a request URL path.
//
// encodeURIComponent is not enough here: it leaves ".." intact inside a path
// segment, so the guard converts to a number and range-checks instead. These
// tests pin that a traversal sequence, a slash, a query character or anything
// else non-integral is rejected outright rather than escaped.

import { describe, expect, it } from "vitest";

import { assertMovieId } from "../movieId";

describe("assertMovieId", () => {
  it.each([[1], [42], [999999], [Number.MAX_SAFE_INTEGER]])(
    "accepts the positive integer %s",
    (value) => {
      expect(assertMovieId(value)).toBe(value);
    }
  );

  it("accepts a numeric string and returns it as a number", () => {
    expect(assertMovieId("550")).toBe(550);
  });

  it.each([
    ["path traversal", "../../admin"],
    ["traversal after a valid id", "550/../../admin"],
    ["a slash", "550/reviews"],
    ["a query string", "550?admin=1"],
    ["a fragment", "550#top"],
    ["an encoded traversal", "%2e%2e%2f"],
    ["a bare dot-dot", ".."],
  ])("rejects %s", (_label, value) => {
    expect(() => assertMovieId(value)).toThrow(/Invalid movie id/);
  });

  it.each([
    ["zero", 0],
    ["a negative integer", -1],
    ["a negative string", "-5"],
    ["a fraction", 1.5],
    ["a fractional string", "1.5"],
    ["NaN", NaN],
    ["Infinity", Infinity],
    ["beyond the safe integer range", Number.MAX_SAFE_INTEGER + 2],
  ])("rejects %s", (_label, value) => {
    expect(() => assertMovieId(value)).toThrow(/Invalid movie id/);
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["an empty string", ""],
    ["whitespace", "   "],
    ["an object", {}],
    ["an array", [1, 2]],
    ["false", false],
  ])("rejects %s", (_label, value) => {
    expect(() => assertMovieId(value)).toThrow(/Invalid movie id/);
  });

  // Number(true) is 1, so `true` is accepted and yields the id 1. Documented
  // rather than tightened: the guard's contract is that whatever reaches the
  // URL path is a bare integer, and 1 satisfies it. No caller passes a boolean.
  it("coerces true to 1 rather than throwing", () => {
    expect(assertMovieId(true)).toBe(1);
  });

  it("names the rejected value in the error, JSON-encoded", () => {
    expect(() => assertMovieId("../etc")).toThrow('Invalid movie id: "../etc"');
  });
});
