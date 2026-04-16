import PropTypes from 'prop-types';

export default function SharedArtists({ artists }) {
  if (!artists) return (
    <div className="track-table-wrap">
      <p className="track-table-title">Shared artists</p>
      <p className="empty-state">Waiting for friend to connect</p>
    </div>
  );

  return (
    <div className="track-table-wrap">
      <p className="track-table-title">Shared artists</p>
      <table>
        <thead>
          <tr><th>#</th><th>Artist</th></tr>
        </thead>
        <tbody>
          {artists.length === 0 ? (
            <tr className="empty-row"><td colSpan={2}>No shared artists</td></tr>
          ) : (
            artists.map((artist, i) => (
              <tr key={artist.id}>
                <td>{i + 1}</td>
                <td className="track-name">{artist.name}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

SharedArtists.propTypes = {
  artists: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  })),
};