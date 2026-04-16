import PropTypes from 'prop-types';

export default function SharedTracks({ tracks }) {
  if (!tracks) return (
    <div className="track-table-wrap">
      <p className="track-table-title">Shared tracks</p>
      <p className="empty-state">Waiting for friend to connect</p>
    </div>
  );

  return (
    <div className="track-table-wrap">
      <p className="track-table-title">Shared tracks</p>
      <table>
        <thead>
          <tr><th>#</th><th>Track</th><th>Artist</th></tr>
        </thead>
        <tbody>
          {tracks.length === 0 ? (
            <tr className="empty-row"><td colSpan={3}>No shared tracks</td></tr>
          ) : (
            tracks.map((track, i) => (
              <tr key={track.id}>
                <td>{i + 1}</td>
                <td className="track-name">{track.name}</td>
                <td>{track.artists.map((a) => a.name).join(', ')}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
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