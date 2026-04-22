import PropTypes from 'prop-types';

export default function SharedArtists({ artists }) {
    return (
        <div className="db-card">
            <p className="db-card-title">Shared Artists</p>
            {!artists ? (
                <p className="db-empty">Waiting for friend to connect...</p>
            ) : (
                <table className="db-table">
                    <thead><tr><th style={{ width: 28 }}>#</th><th>Artist</th></tr></thead>
                    <tbody>
                    {artists.length === 0 ? (
                        <tr className="db-empty-row"><td colSpan={2}>No shared artists</td></tr>
                    ) : (
                        artists.map((artist, i) => (
                            <tr key={artist.id}>
                                <td className="db-row-num">{i + 1}</td>
                                <td className="db-track-name">{artist.name}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            )}
        </div>
    );
}
SharedArtists.propTypes = {
    artists: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })),
};