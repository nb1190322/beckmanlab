import PropTypes from 'prop-types';

export default function SharedArtists({ artists }) {
    return (
        <div className="db-card">
            <p className="db-card-title">Shared Artists</p>
            {!artists ? (
                <p className="db-empty">Waiting for friend to connect...</p>
            ) : artists.length === 0 ? (
                <p className="db-empty">No shared artists</p>
            ) : (
                <table className="db-table">
                    <colgroup>
                        <col style={{ width: "36px" }} />
                        <col />
                    </colgroup>
                    <thead><tr><th>#</th><th>Artist</th></tr></thead>
                    <tbody>
                    {artists.map((artist, i) => (
                        <tr key={artist.id}>
                            <td className="db-row-num">{i + 1}</td>
                            <td className="db-track-name cmp-shared">{artist.name}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

SharedArtists.propTypes = {
    artists: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })),
};