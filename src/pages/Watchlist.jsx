import MovieCollectionPage from "../components/MovieCollectionPage";

function Watchlist() {
  return (
    <MovieCollectionPage
      collection="watchlist"
      title="My Watchlist"
      emptyMessage="No movies in your watchlist."
      label="watchlist"
    />
  );
}

export default Watchlist;
