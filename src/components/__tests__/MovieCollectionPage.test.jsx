// Tests for the shared collection page behind Watchlist and Watched.
//
// Watchlist.jsx and Watched.jsx were byte-identical apart from five strings, so
// every fix had to land twice. Now that the behaviour lives in one component,
// these tests cover it once — including the redirect when unauthenticated, the
// id validation on remove, and the failure paths that were silently swallowed.

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigate,
  Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

vi.mock("../Navbar", () => ({
  default: () => <nav data-testid="navbar" />,
}));

import MovieCollectionPage from "../MovieCollectionPage";

const PROPS = {
  collection: "watchlist",
  title: "My Watchlist",
  emptyMessage: "No movies in your watchlist.",
  label: "watchlist",
};

const MOVIES = [
  { movie_id: 550, title: "Fight Club", poster: "/fc.jpg" },
  { movie_id: 13, title: "Forrest Gump", poster: null },
];

const ok = (body) => ({ ok: true, json: async () => body });

beforeEach(() => {
  localStorage.clear();
  navigate.mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(cleanup);

describe("when unauthenticated", () => {
  it("redirects to /login and fetches nothing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<MovieCollectionPage {...PROPS} />);

    expect(navigate).toHaveBeenCalledWith("/login");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("when authenticated", () => {
  beforeEach(() => {
    localStorage.setItem("token", "a-token");
  });

  it("requests the collection with a bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ watchlist: [] }));
    vi.stubGlobal("fetch", fetchMock);

    render(<MovieCollectionPage {...PROPS} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("http://127.0.0.1:8000/watchlist");
    expect(options.headers.Authorization).toBe("Bearer a-token");
  });

  it("reads the list from the key named by `collection`", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok({ watchlist: MOVIES })));

    render(<MovieCollectionPage {...PROPS} />);

    expect(await screen.findByText("Fight Club")).toBeDefined();
    expect(screen.getByText("Forrest Gump")).toBeDefined();
  });

  it("uses a different endpoint and key for another collection", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ watched: MOVIES }));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MovieCollectionPage
        collection="watched"
        title="Watched Movies"
        emptyMessage="No movies in your watched list."
        label="watched movies"
      />
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe("http://127.0.0.1:8000/watched");
    expect(await screen.findByText("Fight Club")).toBeDefined();
    expect(screen.getByText("Watched Movies")).toBeDefined();
  });

  it("shows the empty message when the collection is empty", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok({ watchlist: [] })));

    render(<MovieCollectionPage {...PROPS} />);

    expect(await screen.findByText("No movies in your watchlist.")).toBeDefined();
  });

  it("shows the empty message when the key is missing entirely", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok({})));

    render(<MovieCollectionPage {...PROPS} />);

    expect(await screen.findByText("No movies in your watchlist.")).toBeDefined();
  });

  it("falls back to the default poster when a movie has none", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok({ watchlist: MOVIES })));

    render(<MovieCollectionPage {...PROPS} />);

    const poster = await screen.findByAltText("Forrest Gump");
    expect(poster.getAttribute("src")).toBe("/default_poster.jpg");
  });

  it("logs and stays empty when the fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    render(<MovieCollectionPage {...PROPS} />);

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(screen.getByText("No movies in your watchlist.")).toBeDefined();
  });

  it("logs and stays empty when the network throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    render(<MovieCollectionPage {...PROPS} />);

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(screen.getByText("No movies in your watchlist.")).toBeDefined();
  });
});

describe("removing a movie", () => {
  beforeEach(() => {
    localStorage.setItem("token", "a-token");
  });

  const renderWithMovies = async (fetchMock) => {
    vi.stubGlobal("fetch", fetchMock);
    render(<MovieCollectionPage {...PROPS} />);
    await screen.findByText("Fight Club");
  };

  it("DELETEs the validated id and drops the row", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(ok({ watchlist: MOVIES }))
      .mockResolvedValueOnce({ ok: true });
    await renderWithMovies(fetchMock);

    fireEvent.click(screen.getAllByText("Remove")[0]);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const [url, options] = fetchMock.mock.calls[1];
    expect(url).toBe("http://127.0.0.1:8000/watchlist/remove/550");
    expect(options.method).toBe("DELETE");
    await waitFor(() => expect(screen.queryByText("Fight Club")).toBeNull());
    expect(screen.getByText("Forrest Gump")).toBeDefined();
  });

  it("keeps the row when the server rejects the delete", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(ok({ watchlist: MOVIES }))
      .mockResolvedValueOnce({ ok: false });
    await renderWithMovies(fetchMock);

    fireEvent.click(screen.getAllByText("Remove")[0]);

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(screen.getByText("Fight Club")).toBeDefined();
  });

  it("never issues a request for an id that fails validation", async () => {
    const hostile = [{ movie_id: "../../admin", title: "Hostile", poster: null }];
    const fetchMock = vi.fn().mockResolvedValueOnce(ok({ watchlist: hostile }));
    vi.stubGlobal("fetch", fetchMock);
    render(<MovieCollectionPage {...PROPS} />);
    await screen.findByText("Hostile");

    fireEvent.click(screen.getByText("Remove"));

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    // Only the initial GET — assertMovieId threw before any DELETE was built.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Hostile")).toBeDefined();
  });
});

describe("layout", () => {
  beforeEach(() => {
    localStorage.setItem("token", "a-token");
  });

  it("renders the navbar and the title", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok({ watchlist: [] })));

    render(<MovieCollectionPage {...PROPS} />);

    expect(await screen.findByTestId("navbar")).toBeDefined();
    expect(screen.getByText("My Watchlist")).toBeDefined();
  });

  it("pads the final row so six movies occupy two full rows", async () => {
    const six = Array.from({ length: 6 }, (_, i) => ({
      movie_id: i + 1,
      title: `Movie ${i + 1}`,
      poster: "/p.jpg",
    }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(ok({ watchlist: six })));

    const { container } = render(<MovieCollectionPage {...PROPS} />);
    await screen.findByText("Movie 6");

    const rows = container.querySelectorAll(".grid.grid-cols-5");
    expect(rows).toHaveLength(2);
    // Second row: one real card plus four spacers.
    expect(rows[1].children).toHaveLength(5);
  });
});
