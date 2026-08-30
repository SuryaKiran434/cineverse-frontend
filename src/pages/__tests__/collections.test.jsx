// The two collection pages are now thin wrappers that supply the strings which
// used to be the only difference between two identical files. These tests pin
// those strings, so a copy-paste slip (Watched pointing at /watchlist, say)
// fails here rather than in the browser.

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

vi.mock("../../components/Navbar", () => ({
  default: () => <nav data-testid="navbar" />,
}));

import Watched from "../Watched";
import Watchlist from "../Watchlist";

let fetchMock;

beforeEach(() => {
  localStorage.setItem("token", "a-token");
  fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(cleanup);

describe("Watchlist", () => {
  it("renders its own heading and empty state", async () => {
    render(<Watchlist />);
    expect(await screen.findByText("My Watchlist")).toBeDefined();
    expect(screen.getByText("No movies in your watchlist.")).toBeDefined();
  });

  it("reads from the watchlist endpoint", async () => {
    render(<Watchlist />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe("http://127.0.0.1:8000/watchlist");
  });
});

describe("Watched", () => {
  it("renders its own heading and empty state", async () => {
    render(<Watched />);
    expect(await screen.findByText("Watched Movies")).toBeDefined();
    expect(screen.getByText("No movies in your watched list.")).toBeDefined();
  });

  it("reads from the watched endpoint", async () => {
    render(<Watched />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe("http://127.0.0.1:8000/watched");
  });
});
