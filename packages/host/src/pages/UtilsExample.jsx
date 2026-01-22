import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate, debounce, storage, validators, logger, eventEmitter, calculateTotal, generateId, truncate, capitalize, formatPhoneNumber } from "host/utils";
import "./CommunicationExamples.css";

/**
 * Shared Utilities Example Page
 * Demonstrates how shared utility functions can be used across all micro frontends
 */

function UtilsExample() {
  const [currencyAmount, setCurrencyAmount] = useState(1234.56);
  const [dateValue, setDateValue] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [storageValue, setStorageValue] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventLog, setEventLog] = useState([]);

  // Debounced search example
  const debouncedSearch = debounce((value) => {
    logger.info("Searching for:", value);
    setSearchTerm(value);
  }, 500);

  // Listen to events
  useEffect(() => {
    const handleEvent = (data) => {
      setEventLog(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        data: JSON.stringify(data),
      }]);
    };

    eventEmitter.on('product-added', handleEvent);
    eventEmitter.on('cart-updated', handleEvent);

    return () => {
      eventEmitter.off('product-added', handleEvent);
      eventEmitter.off('cart-updated', handleEvent);
    };
  }, []);

  // Load from storage on mount
  useEffect(() => {
    const saved = storage.get('example-data', '');
    if (saved) setStorageValue(saved);
  }, []);

  const handleStorageSave = () => {
    storage.set('example-data', storageValue);
    logger.info('Data saved to localStorage');
  };

  const handleEmitEvent = () => {
    eventEmitter.emit('product-added', {
      id: generateId(),
      message: 'Event from Utils Example',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="communication-examples">
      <h1>Shared Utilities Examples</h1>
      <p className="intro">
        These utility functions are shared across all micro frontends via Module Federation.
        Any micro frontend can import and use them.
      </p>

      <div className="examples-grid">
        {/* Format Currency */}
        <div className="example-card">
          <h3>1. Format Currency</h3>
          <div className="example-content">
            <input
              type="number"
              value={currencyAmount}
              onChange={(e) => setCurrencyAmount(parseFloat(e.target.value) || 0)}
              style={{ marginBottom: '1rem', padding: '0.5rem', width: '200px' }}
            />
            <p><strong>Formatted:</strong> {formatCurrency(currencyAmount)}</p>
            <p><strong>EUR:</strong> {formatCurrency(currencyAmount, 'EUR')}</p>
            <p><strong>GBP:</strong> {formatCurrency(currencyAmount, 'GBP')}</p>
          </div>
        </div>

        {/* Format Date */}
        <div className="example-card">
          <h3>2. Format Date</h3>
          <div className="example-content">
            <input
              type="datetime-local"
              value={dateValue.toISOString().slice(0, 16)}
              onChange={(e) => setDateValue(new Date(e.target.value))}
              style={{ marginBottom: '1rem', padding: '0.5rem' }}
            />
            <p><strong>Short:</strong> {formatDate(dateValue, 'short')}</p>
            <p><strong>Long:</strong> {formatDate(dateValue, 'long')}</p>
            <p><strong>Time:</strong> {formatDate(dateValue, 'time')}</p>
          </div>
        </div>

        {/* Debounce */}
        <div className="example-card">
          <h3>3. Debounce</h3>
          <div className="example-content">
            <input
              type="text"
              placeholder="Type to see debounce in action..."
              onChange={(e) => debouncedSearch(e.target.value)}
              style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
            />
            <p><strong>Search Term:</strong> {searchTerm || 'Waiting for input...'}</p>
            <p className="no-events">Check console for debounced logs</p>
          </div>
        </div>

        {/* Local Storage */}
        <div className="example-card">
          <h3>4. Local Storage</h3>
          <div className="example-content">
            <input
              type="text"
              value={storageValue}
              onChange={(e) => setStorageValue(e.target.value)}
              placeholder="Enter data to save"
              style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleStorageSave}>Save</button>
              <button onClick={() => {
                const value = storage.get('example-data', '');
                setStorageValue(value);
                logger.info('Data loaded from localStorage');
              }}>
                Load
              </button>
              <button onClick={() => {
                storage.remove('example-data');
                setStorageValue('');
                logger.info('Data removed from localStorage');
              }}>
                Clear
              </button>
            </div>
            <p><strong>Saved Value:</strong> {storage.get('example-data', 'No data saved')}</p>
          </div>
        </div>

        {/* Validators */}
        <div className="example-card">
          <h3>5. Validators</h3>
          <div className="example-content">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
            />
            <p>
              <strong>Email Valid:</strong>{' '}
              {validators.email(email) ? (
                <span style={{ color: 'green' }}>✓ Valid</span>
              ) : (
                <span style={{ color: 'red' }}>✗ Invalid</span>
              )}
            </p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone"
              style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
            />
            <p>
              <strong>Phone Valid:</strong>{' '}
              {validators.phone(phone) ? (
                <span style={{ color: 'green' }}>✓ Valid</span>
              ) : (
                <span style={{ color: 'red' }}>✗ Invalid</span>
              )}
            </p>
            <p><strong>Formatted Phone:</strong> {formatPhoneNumber(phone) || phone}</p>
          </div>
        </div>

        {/* String Utilities */}
        <div className="example-card">
          <h3>6. String Utilities</h3>
          <div className="example-content">
            <p><strong>Truncate:</strong> {truncate("This is a very long string that needs to be truncated", 30)}</p>
            <p><strong>Capitalize:</strong> {capitalize("hello world")}</p>
            <p><strong>Generate ID:</strong> {generateId()}</p>
          </div>
        </div>

        {/* Calculate Total */}
        <div className="example-card">
          <h3>7. Calculate Total</h3>
          <div className="example-content">
            <p><strong>Amount:</strong> {formatCurrency(currencyAmount)}</p>
            <p><strong>Tax (10%):</strong> {formatCurrency(calculateTotal(currencyAmount, 0.1) - currencyAmount)}</p>
            <p><strong>Total:</strong> {formatCurrency(calculateTotal(currencyAmount, 0.1))}</p>
          </div>
        </div>

        {/* Event Emitter */}
        <div className="example-card">
          <h3>8. Event Emitter</h3>
          <div className="example-content">
            <button onClick={handleEmitEvent} style={{ marginBottom: '1rem' }}>
              Emit Product Added Event
            </button>
            <div className="event-log">
              <h4>Event Log:</h4>
              {eventLog.length === 0 ? (
                <p className="no-events">No events yet</p>
              ) : (
                <ul>
                  {eventLog.slice(-5).reverse().map((log, index) => (
                    <li key={index}>
                      <strong>{log.timestamp}</strong> - {log.data}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="summary">
        <h2>Available Utilities</h2>
        <ul>
          <li><strong>formatCurrency:</strong> Format numbers as currency</li>
          <li><strong>formatDate:</strong> Format dates in various formats</li>
          <li><strong>debounce/throttle:</strong> Control function execution frequency</li>
          <li><strong>storage:</strong> LocalStorage helper with error handling</li>
          <li><strong>validators:</strong> Email, phone, required, etc.</li>
          <li><strong>logger:</strong> Consistent logging across apps</li>
          <li><strong>eventEmitter:</strong> Cross-micro-frontend communication</li>
          <li><strong>calculateTotal:</strong> Calculate totals with tax</li>
          <li><strong>generateId:</strong> Generate unique IDs</li>
          <li><strong>truncate/capitalize:</strong> String manipulation</li>
        </ul>
        <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
          Import in any micro frontend: <code>import {'{ formatCurrency, logger }'} from "host/utils"</code>
        </p>
      </div>
    </div>
  );
}

export default UtilsExample;

