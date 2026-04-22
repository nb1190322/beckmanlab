import PropTypes from 'prop-types';

export default function UniqueArtists({ yourArtists, friendArtists, yourName, friendName }) {
    return (
        <div className="db-card">
            <p className="db-card-title">Unique Artists</p>
            {!friendArtists ? (
                <p className="db-empty">Waiting for friend to connect...</p>
            ) : (
                <div className="db-unique-grid">
                    <div>
                        <p className="db-unique-label">{yourName} only</p>
                        <ul className="db-unique-list">
                            {yourArtists.map((a) => <li key={a.id}>{a.name}</li>)}
                        </ul>
                    </div>
                    <div>
                        <p className="db-unique-label">{friendName} only</p>
                        <ul className="db-unique-list">
                            {friendArtists.map((a) => <li key={a.id}>{a.name}</li>)}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
UniqueArtists.propTypes = {
    yourArtists: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })).isRequired,
    friendArtists: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })),
    yourName: PropTypes.string.isRequired,
    friendName: PropTypes.string,
};