import PropTypes from 'prop-types';

export default function SharedGenres({ genres }) {
    return (
        <div className="db-card">
            <p className="db-card-title">Shared Genres</p>
            {!genres ? (
                <p className="db-empty">Waiting for friend to connect...</p>
            ) : genres.length === 0 ? (
                <p className="db-empty">No shared genres</p>
            ) : (
                <ul className="db-genre-list">
                    {genres.map((genre) => <li key={genre}>{genre}</li>)}
                </ul>
            )}
        </div>
    );
}
SharedGenres.propTypes = { genres: PropTypes.arrayOf(PropTypes.string) };