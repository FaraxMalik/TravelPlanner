import React, { useEffect, useState } from 'react';
import { travelAPI, feedbackAPI } from '../services/api';
import './MyTrips.css';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTripId, setExpandedTripId] = useState(null);
  const [rating, setRating] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState({});

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching trips...');
        const res = await travelAPI.getItineraries();
        console.log('📦 API Response:', res.data);
        
        if (res.data.success) {
          const trips = res.data.itineraries || [];
          setTrips(trips);
          console.log(`✅ Loaded ${trips.length} trips`);
          
        // Fetch feedback for all trips
        const feedbackMap = {};
          for (const trip of trips) {
          try {
            const fbRes = await feedbackAPI.getTourFeedback(trip._id || trip.id);
            feedbackMap[trip._id || trip.id] = fbRes.data.feedbacks || [];
            } catch (fbErr) {
              console.log(`⚠️ Could not load feedback for trip ${trip._id || trip.id}`);
            }
        }
        setFeedbacks(feedbackMap);
        } else {
          console.log('❌ API returned success: false');
          setError('Failed to load trips - API returned error');
        }
      } catch (err) {
        console.error('🚨 Error loading trips:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please sign in again.');
        } else if (err.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else if (err.code === 'NETWORK_ERROR' || !err.response) {
          setError('Network error. Please check your connection and ensure the server is running.');
        } else {
          setError(`Failed to load trips: ${err.response?.data?.message || err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const retryFetch = () => {
    setError(null);
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Retrying fetch trips...');
        const res = await travelAPI.getItineraries();
        console.log('📦 API Response:', res.data);
        
        if (res.data.success) {
          const trips = res.data.itineraries || [];
          setTrips(trips);
          console.log(`✅ Loaded ${trips.length} trips`);
          
          // Fetch feedback for all trips
          const feedbackMap = {};
          for (const trip of trips) {
            try {
              const fbRes = await feedbackAPI.getTourFeedback(trip._id || trip.id);
              feedbackMap[trip._id || trip.id] = fbRes.data.feedbacks || [];
            } catch (fbErr) {
              console.log(`⚠️ Could not load feedback for trip ${trip._id || trip.id}`);
            }
          }
          setFeedbacks(feedbackMap);
        } else {
          console.log('❌ API returned success: false');
          setError('Failed to load trips - API returned error');
        }
      } catch (err) {
        console.error('🚨 Error loading trips:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please sign in again.');
        } else if (err.response?.status === 500) {
          setError('Server error. Please try again later.');
        } else if (err.code === 'NETWORK_ERROR' || !err.response) {
          setError('Network error. Please check your connection and ensure the server is running.');
        } else {
          setError(`Failed to load trips: ${err.response?.data?.message || err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  };

  if (loading) return (
    <div className="my-trips-page">
      <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
        <h2>Loading your trips...</h2>
        <div style={{ marginTop: '1rem' }}>Please wait...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="my-trips-page">
      <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
        <h2>⚠️ Error Loading Trips</h2>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          margin: '1rem auto',
          maxWidth: '600px'
        }}>
          {error}
        </div>
        <button 
          onClick={retryFetch}
          style={{
            background: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          🔄 Retry
        </button>
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: '0.8' }}>
          💡 Tips:
          <br />• Make sure the backend server is running on port 5000
          <br />• Check the browser console (F12) for detailed error messages
          <br />• Ensure you're signed in properly
        </div>
      </div>
    </div>
  );

  return (
    <div className="my-trips-page">
      <h2>My Trips</h2>
      {trips.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
          <h3>✈️ No trips found</h3>
          <p>You haven't created any travel plans yet!</p>
          <p style={{ fontSize: '0.9rem', opacity: '0.8' }}>
            Start planning your next adventure by visiting the "Plan Trip" page.
          </p>
        </div>
      ) : (
        <div className="trips-grid">
          {trips.map(trip => (
            <div key={trip._id || trip.id} className="trip-card">
              <div className="trip-header">
                <span className="trip-destination">{trip.destination || trip.placeName || 'Adventure Destination'}</span>
                <span className={`trip-status ${trip.status || 'planned'}`}>{trip.status ? trip.status.charAt(0).toUpperCase() + trip.status.slice(1) : 'Planned'}</span>
              </div>
              <div className="trip-details">
                <div><strong>Dates:</strong> {trip.startDate || 'TBD'} - {trip.endDate || 'TBD'}</div>
                <div><strong>Duration:</strong> {trip.numberOfDays || trip.duration || 'N/A'} days</div>
                <div><strong>Budget:</strong> £{trip.budget || 'N/A'}</div>
                <div><strong>Description:</strong> {trip.details || trip.description || 'No details available.'}</div>
                <div><strong>Travelers:</strong> {trip.travelers ? trip.travelers.join(', ') : 'N/A'}</div>
                <div><strong>Created:</strong> {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'N/A'}</div>
              </div>
              <button
                className="trip-view-btn"
                onClick={() => setExpandedTripId(expandedTripId === (trip._id || trip.id) ? null : (trip._id || trip.id))}
              >
                {expandedTripId === (trip._id || trip.id) ? 'Hide Details' : 'View Details'}
              </button>
              {expandedTripId === (trip._id || trip.id) && (
                <>
                  {trip.itinerary && trip.itinerary.length > 0 && (
                    <div className="trip-itinerary-details">
                      <h4>Itinerary</h4>
                      {trip.itinerary.map((day, idx) => (
                        <div key={day.day || idx} className="itinerary-day">
                          <strong>Day {day.day || idx + 1}:</strong>
                          <ul>
                            {/* If activities array exists, render it */}
                            {Array.isArray(day.activities) && day.activities.length > 0 ? (
                              day.activities.map((activity, aidx) => (
                                <li key={activity.activityId || aidx}>
                                  <span className="activity-name">{activity.name}</span>
                                  {activity.startTime && activity.endTime && (
                                    <span className="activity-time"> ({activity.startTime} - {activity.endTime})</span>
                                  )}
                                  {activity.description && (
                                    <span className="activity-desc">: {activity.description}</span>
                                  )}
                                </li>
                              ))
                            ) : (
                              // Otherwise, check for morning/noon/evening fields
                              <>
                                {day.morning || day.noon || day.evening ? (
                                  <>
                                    {day.morning && (
                                      <li>
                                        <span className="activity-name">Morning:</span> {day.morning.activities || day.morning.description || day.morning.time || ''}
                                        {day.morning.personality_reason && (
                                          <span className="activity-desc"> ({day.morning.personality_reason})</span>
                                        )}
                                      </li>
                                    )}
                                    {day.noon && (
                                      <li>
                                        <span className="activity-name">Noon:</span> {day.noon.activities || day.noon.description || day.noon.time || ''}
                                        {day.noon.personality_reason && (
                                          <span className="activity-desc"> ({day.noon.personality_reason})</span>
                                        )}
                                      </li>
                                    )}
                                    {day.evening && (
                                      <li>
                                        <span className="activity-name">Evening:</span> {day.evening.activities || day.evening.description || day.evening.time || ''}
                                        {day.evening.personality_reason && (
                                          <span className="activity-desc"> ({day.evening.personality_reason})</span>
                                        )}
                                      </li>
                                    )}
                                  </>
                                ) : (
                                  <li>No activities for this day.</li>
                                )}
                              </>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Feedback Section */}
                  <div className="trip-feedback-section">
                    <h4>Rate this Trip</h4>
                    {feedbacks[trip._id || trip.id] && feedbacks[trip._id || trip.id].length > 0 ? (
                      <div className="trip-rating-history">
                        <strong>Your Rating:</strong>
                        <ul>
                          {feedbacks[trip._id || trip.id].map((fb, idx) => (
                            <li key={fb._id || idx}>
                              <span style={{ color: '#F95F39', fontWeight: 600 }}>{'★'.repeat(fb.rating)}</span>
                              <span style={{ color: '#888', marginLeft: 8 }}>{fb.comment}</span>
                            </li>
                          ))}
                        </ul>
                        {/* Feedback already submitted, disable further input */}
                        <div className="trip-rating-disabled" style={{ color: '#888', marginTop: '0.5rem' }}>
                          Feedback submitted. You cannot change your rating.
                        </div>
                      </div>
                    ) : (
                      <div className="trip-rating-input">
                        {[1,2,3,4,5].map(star => (
                          <span
                            key={star}
                            style={{
                              color: (rating[trip._id || trip.id] || trip.rating) >= star ? '#F95F39' : '#ccc',
                              fontSize: '1.5rem',
                              cursor: submitting ? 'not-allowed' : 'pointer',
                              pointerEvents: submitting ? 'none' : 'auto',
                            }}
                            onClick={() => !submitting && setRating(r => ({ ...r, [trip._id || trip.id]: star }))}
                          >★</span>
                        ))}
                        <button
                          className={`trip-rating-submit${submitting ? ' submitting' : ''}`}
                          disabled={submitting || !rating[trip._id || trip.id]}
                          onClick={async () => {
                            setSubmitting(true);
                            let errorMsg = '';
                            try {
                              await feedbackAPI.submitFeedback({
                                tourPlanId: trip._id || trip.id,
                                activityId: null,
                                rating: rating[trip._id || trip.id],
                                comment: ''
                              });
                              alert('Thank you for your feedback!');
                            } catch (err) {
                              errorMsg = err?.response?.data?.message || 'Failed to submit feedback.';
                              alert(errorMsg);
                            } finally {
                              setSubmitting(false);
                            }
                          }}
                          style={{
                            background: submitting ? '#F95F39cc' : '#F95F39',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.4rem 1.2rem',
                            fontWeight: 600,
                            fontSize: '1rem',
                            marginLeft: '1rem',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            boxShadow: submitting ? '0 2px 8px #F95F3933' : '0 2px 8px #F95F3955',
                            transition: 'background 0.2s, box-shadow 0.2s',
                            opacity: submitting ? 0.7 : 1
                          }}
                        >
                          {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrips;
