import PropTypes from 'prop-types';

export default function TopTracks({ tracks, title }) {
  return (
    <div className="db-card">
      <p className="db-card-title">{title}</p>
      <table className="db-table">
        <thead>
          <tr>
            <th style={{ width: 28 }}>#</th>
            <th>Track</th>
            <th>Artist</th>
            <th>Album</th>
          </tr>
        </thead>
        <tbody>
          {tracks.length === 0 ? (
            <tr className="db-empty-row">
              <td>—</td>
              <td colSpan={3}>Waiting for friend to connect</td>
            </tr>
          ) : (
            tracks.map((track, i) => (
              <tr key={track.id}>
                <td className="db-row-num">{i + 1}</td>
                <td className="db-track-name">{track.name}</td>
                <td>{track.artists.map((a) => a.name).join(', ')}</td>
                <td>{track.album.name}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

TopTracks.propTypes = {
  title: PropTypes.string.isRequired,
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      album: PropTypes.shape({ name: PropTypes.string }),
      artists: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
    })
  ).isRequired,
};