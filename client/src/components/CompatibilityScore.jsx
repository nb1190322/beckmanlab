import PropTypes from 'prop-types';

export default function CompatibilityScore({ score }) {
  if (score === null || score === undefined) return (
    <div className="track-table-wrap">
      <p className="track-table-title">Compatibility score</p>
      <p className="empty-state">Waiting for friend to connect</p>
    </div>
  );

  return (
    <div className="track-table-wrap">
      <p className="track-table-title">Compatibility score</p>
      <p className="compatibility-score">{Math.round(score)}%</p>
    </div>
  );
}

CompatibilityScore.propTypes = {
  score: PropTypes.number,
};