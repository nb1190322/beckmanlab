import PropTypes from 'prop-types';

export default function SharedTracks({ tracks }) {
    return (
        <div className="db-card">
            <p className="db-card-title">Shared Tracks</p>
            {!tracks ? (
                <p className="db-empty">Waiting for friend to connect...</p>
            ) : tracks.length === 0 ? (
                <p className="db-empty">No shared tracks</p>
            ) : (
                <table className="db-table">
                    <colgroup>
                        <col style={{ width: "36px" }} />
                        <col />
                        <col />
                    </colgroup>
                    <thead><tr><th>#</th><th>Track</th><th>Artist</th></tr></thead>
                    <tbody>
                    {tracks.map((track, i) => (
                        <tr key={track.id}>
                            <td className="db-row-num">{i + 1}</td>
                            <td className="db-track-name cmp-shared">{track.name}</td>
                            <td>{track.artists.map((a) => a.name).join(', ')}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

SharedTracks.propTypes = {
    tracks: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        artists: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
    })),
};