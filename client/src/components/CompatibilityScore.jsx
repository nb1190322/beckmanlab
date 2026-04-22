import PropTypes from 'prop-types';

export default function CompatibilityScore({ score }) {
  return (
      <div className="db-card">
          <p className="db-card-title">Compatibility Score</p>
          {score === null || score === undefined ? (
              <p className="db-empty">Waiting for a friend to connect...</p>
          ) : (
              <p className="db-compat-score">{Math.round(score)}%</p>
          )}
      </div>
  );
}

CompatibilityScore.propTypes = {
  score: PropTypes.number,
};