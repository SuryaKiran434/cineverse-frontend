import MovieCollectionPage from "../components/MovieCollectionPage";

function Watched() {
  return (
    <MovieCollectionPage
      collection="watched"
      title="Watched Movies"
      emptyMessage="No movies in your watched list."
      label="watched movies"
    />
  );
}

export default Watched;
