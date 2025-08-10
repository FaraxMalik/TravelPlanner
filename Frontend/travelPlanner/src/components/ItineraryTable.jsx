import React from 'react';
import { Clock, MapPin, DollarSign, Star, Calendar } from 'lucide-react';
import './ItineraryTable.css';

const ItineraryTable = ({ itinerary, tripData }) => {
  if (!itinerary || !itinerary.dailyPlan) {
    return <div>No itinerary data available</div>;
  }

  const calculateTotalCost = () => {
    return itinerary.dailyPlan.reduce((total, day) => total + (day.totalCost || 0), 0);
  };

  return (
    <div className="itinerary-table-container">
      {/* Trip Overview Header */}
      <div className="trip-overview-header">
        <h2>🗺️ Your {itinerary.destination} Adventure</h2>
        <div className="trip-stats">
          <div className="stat-item">
            <Calendar className="stat-icon" />
            <span>{itinerary.duration} Days</span>
          </div>
          <div className="stat-item">
            <DollarSign className="stat-icon" />
            <span>${itinerary.budget} Budget</span>
          </div>
          <div className="stat-item">
            <Star className="stat-icon" />
            <span>{tripData?.travelers || 1} Traveler{(tripData?.travelers || 1) > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Personality Insight */}
      {itinerary.personalizedInsights && (
        <div className="personality-insight-box">
          <h3>🎭 Personalized for You</h3>
          <p>{itinerary.personalizedInsights}</p>
        </div>
      )}

      {/* Daily Itinerary Table */}
      <div className="itinerary-table-wrapper">
        <h3>📅 Day-by-Day Schedule</h3>
        
        {itinerary.dailyPlan.map((day, dayIndex) => (
          <div key={dayIndex} className="day-table-container">
            <div className="day-header">
              <div className="day-title">
                <span className="day-number">Day {day.day}</span>
                <span className="day-theme">{day.title}</span>
              </div>
              <div className="day-cost">
                <DollarSign size={16} />
                <span>${day.totalCost}</span>
              </div>
            </div>

            <div className="activities-table">
              <table className="table">
                <thead>
                  <tr>
                    <th className="period-col">Period</th>
                    <th className="time-col">
                      <Clock size={14} />
                      Time
                    </th>
                    <th className="activity-col">Activity</th>
                    <th className="cost-col">
                      <DollarSign size={14} />
                      Cost
                    </th>
                    <th className="personality-col">Why This Fits You</th>
                  </tr>
                </thead>
                <tbody>
                  {day.activities && day.activities.map((activity, actIndex) => {
                    // Extract period and clean activity text for new format
                    let period = 'All Day';
                    let cleanActivity = activity.activity;
                    let personalityReason = 'Customized for your travel style';
                    
                    if (activity.activity.includes('Morning:')) {
                      period = 'Morning';
                      cleanActivity = activity.activity.replace(/^Morning:\s*/, '');
                      personalityReason = 'Perfect for your morning energy levels';
                    } else if (activity.activity.includes('Afternoon:')) {
                      period = 'Afternoon';
                      cleanActivity = activity.activity.replace(/^Afternoon:\s*/, '');
                      personalityReason = 'Matches your midday preferences';
                    } else if (activity.activity.includes('Evening:')) {
                      period = 'Evening';
                      cleanActivity = activity.activity.replace(/^Evening:\s*/, '');
                      personalityReason = 'Suits your evening personality';
                    }
                    
                    return (
                      <tr key={actIndex} className="activity-row">
                        <td className="period-cell">
                          <span className={`period-badge ${period.toLowerCase().replace(' ', '-')}`}>
                            {period === 'Morning' && '🌅'}
                            {period === 'Afternoon' && '☀️'}
                            {period === 'Evening' && '🌙'}
                            {period === 'All Day' && '🌍'}
                            {period}
                          </span>
                        </td>
                        <td className="time-cell">
                          <span className="time-badge">{activity.time}</span>
                        </td>
                        <td className="activity-cell">
                          <div className="activity-info">
                            <span className="activity-name">{cleanActivity}</span>
                            {activity.location && (
                              <div className="activity-location">
                                <MapPin size={12} />
                                <span>{activity.location}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="cost-cell">
                          <span className="cost-amount">${activity.cost}</span>
                        </td>
                        <td className="personality-cell">
                          <span className="personality-reason">{personalityReason}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="day-total-row">
                    <td colSpan="4" className="total-label">Day {day.day} Total</td>
                    <td className="total-amount">
                      <strong>${day.totalCost}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}

        {/* Trip Summary */}
        <div className="trip-summary">
          <div className="summary-row">
            <div className="summary-item">
              <span className="summary-label">Total Duration:</span>
              <span className="summary-value">{itinerary.duration} days</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Activities:</span>
              <span className="summary-value">
                {itinerary.dailyPlan.reduce((total, day) => total + (day.activities?.length || 0), 0)} activities
              </span>
            </div>
            <div className="summary-item total-cost">
              <span className="summary-label">Estimated Total Cost:</span>
              <span className="summary-value">${calculateTotalCost()}</span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {itinerary.recommendations && itinerary.recommendations.length > 0 && (
          <div className="recommendations-table">
            <h4>💡 Travel Tips & Recommendations</h4>
            <div className="recommendations-grid">
              {itinerary.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <Star size={14} className="rec-icon" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryTable;