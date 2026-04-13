import PropTypes from 'prop-types';

export default function UniqueArtists({ yourArtists, friendArtists, yourName, friendName }) {
  if (!friendArtists) return (
    <div className="track-table-wrap">
      <p className="track-table-title">Unique artists</p>
      <p className="empty-state">Waiting for friend to connect</p>
    </div>
  );

  return (
    <div className="track-table-wrap">
      <p className="track-table-title">Unique artists</p>
      <div className="unique-artists-grid">
        <div>
          <p className="unique-artists-label">{yourName} only</p>
          <ul>
            {yourArtists.map((a) => <li key={a.id}>{a.name}</li>)}
          </ul>
        </div>
        <div>
          <p className="unique-artists-label">{friendName} only</p>
          <ul>
            {friendArtists.map((a) => <li key={a.id}>{a.name}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

UniqueArtists.propTypes = {
  yourArtists: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })).isRequired,
  friendArtists: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })),
  yourName: PropTypes.string.isRequired,
  friendName: PropTypes.string,
};