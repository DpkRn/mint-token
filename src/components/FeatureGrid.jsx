import React from 'react'

const FeatureGrid = () => {
  return (
 <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🔐</div>{" "}
              <h3>Phantom Integration</h3>
              <p>Seamless wallet connection</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div> <h3>Fast Creation</h3>
              <p>Deploy tokens in seconds</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div> <h3>Full Control</h3>
              <p>Manage mint authority</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div> <h3>Mainnet Ready</h3>
              <p>Production-grade deployment</p>
            </div>
          </div>

  )
}

export default FeatureGrid