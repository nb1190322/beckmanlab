import PropTypes from 'prop-types';

function scoreColor(score) {
    if (score >= 70) return "#1DB954";
    if (score >= 40) return "#F59B00";
    return "#e74c3c";
}

export default function CompatibilityScore({ score }) {
    if (score === null || score === undefined) return (
        <div className="db-card">
            <p className="db-card-title">Compatibility Score</p>
            <p className="db-empty">Waiting for a friend to connect...</p>
        </div>
    );

    const color = scoreColor(score);
    return (
        <div className="db-card" style={{ borderLeft: `3px solid ${color}` }}>
            <p className="db-card-title">Compatibility Score</p>
            <p className="db-compat-score" style={{ color }}>{Math.round(score)}%</p>
        </div>
    );
}

CompatibilityScore.propTypes = {
  score: PropTypes.number,
};