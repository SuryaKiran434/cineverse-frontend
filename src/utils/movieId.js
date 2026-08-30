/**
 * Validates a movie identifier before it is interpolated into a request URL path.
 *
 * Movie ids are always positive integers (they originate from TMDB). Converting to
 * a number and range-checking it means the value placed in the path can only ever be
 * a bare integer, so traversal sequences ("../"), slashes, or query/fragment
 * characters cannot reach the URL. Escaping alone would not achieve this:
 * encodeURIComponent leaves ".." intact inside a path segment.
 *
 * @param {unknown} value candidate movie id
 * @returns {number} the validated id as a number
 * @throws {Error} if the value is not a positive integer
 */
export function assertMovieId(value) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error(`Invalid movie id: ${JSON.stringify(value)}`);
  }

  return id;
}
