import PropTypes from 'prop-types';

export default function SharedGenres({ genres }) {
  if (!genres) return (
    <div className="track-table-wrap">
      <p className="track-table-title">Shared genres</p>
      <p className="empty-state">Waiting for friend to connect</p>
    </div>
  );

  return (
    <div className="track-table-wrap">
      <p className="track-table-title">Shared genres</p>
      <ul className="genre-list">
        {genres.length === 0 ? (
          <li className="empty-state">No shared genres</li>
        ) : (
          genres.map((genre) => (
            <li key={genre}>{genre}</li>
          ))
        )}
      </ul>
    </div>
  );
}

SharedGenres.propTypes = {
  genres: PropTypes.arrayOf(PropTypes.string),
};