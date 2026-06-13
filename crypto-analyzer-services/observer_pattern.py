"""
Observer Pattern Implementation for Crypto Data Updates

This module implements the Observer design pattern following the structure
from the Observer and Decorator presentation (Slides 1-27).

Design Pattern: Observer (GoF)
Intent: "Defines a one-to-many dependency between objects so that when one 
        object changes state, all of its dependents are notified and updated 
        automatically."

Reference: Presentation slides 1-3, 6-27
- Slides 1-3: Pattern definition and Weather Station example
- Slides 16-20: Abstract Subject and Observer classes
- Slides 22-25: Concrete Subject and Observer implementations

This implementation follows the "Pull" model (Slide 13) where observers
query the subject for specific information they need.
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any
import time


# ============================================================================
# OBSERVER PATTERN BASE CLASSES
# ============================================================================
# Following the refactored pattern from slides 16-20
# ============================================================================

class Subject(ABC):
    """
    Abstract base class for Subject in Observer pattern.
    
    This class provides default implementation for managing observers,
    following the pattern from slides 16-18.
    
    Similar to the Weather Station example (slides 1-11), but refactored
    to be reusable (slides 16-20).
    """
    
    def __init__(self):
        """Initialize the subject with an empty list of observers."""
        self._observers: List['Observer'] = []
    
    def register_observer(self, observer: 'Observer') -> None:
        """
        Register an observer to be notified of changes.
        
        Args:
            observer: The observer to register
        """
        if observer not in self._observers:
            self._observers.append(observer)
    
    def remove_observer(self, observer: 'Observer') -> None:
        """
        Remove an observer from the notification list.
        
        Args:
            observer: The observer to remove
        """
        if observer in self._observers:
            self._observers.remove(observer)
    
    def notify_observers(self, event_data: Dict[str, Any] = None) -> None:
        """
        Notify all registered observers of a change.
        
        This follows the "Pull" model (Slide 13) where observers
        receive a reference to the subject and pull the data they need.
        
        Args:
            event_data: Optional dictionary with event information
        """
        for observer in self._observers:
            observer.update(self, event_data)


class Observer(ABC):
    """
    Abstract base class for Observer in Observer pattern.
    
    This class enforces that observers register themselves with a subject
    in their constructor, following the pattern from slides 19-20.
    """
    
    def __init__(self, subject: Subject):
        """
        Initialize observer and register with subject.
        
        This ensures observers are automatically registered when created,
        following the pattern from slide 20.
        
        Args:
            subject: The subject to observe
        """
        self._subject = subject
        subject.register_observer(self)
    
    @abstractmethod
    def update(self, subject: Subject, event_data: Dict[str, Any] = None) -> None:
        """
        Called by subject when state changes.
        
        This follows the "Pull" model (Slide 13) - observers receive
        the subject reference and pull the data they need.
        
        Args:
            subject: The subject that triggered the update
            event_data: Optional dictionary with event information
        """
        pass


# ============================================================================
# CONCRETE SUBJECT: CryptoDataSubject
# ============================================================================
# Following the pattern from slides 22-23 (ConcreteSubject)
# ============================================================================

class CryptoDataSubject(Subject):
    """
    Concrete Subject for cryptocurrency price data updates.
    
    This is the equivalent of WeatherData from the Weather Station example
    (slides 6-11), but for crypto price data.
    
    When price data is updated in the database, this subject notifies
    all registered observers (cache invalidators, alert systems, etc.).
    """
    
    def __init__(self):
        """Initialize the crypto data subject."""
        super().__init__()
        self._last_update_symbol: str = None
        self._last_update_rows: int = 0
        self._last_update_timestamp: float = 0.0
        self._last_update_data: List[Dict[str, Any]] = []
    
    def data_updated(self, symbol: str, rows_inserted: int, 
                    update_data: List[Dict[str, Any]] = None) -> None:
        """
        Called when new price data is inserted into the database.
        
        This is equivalent to WeatherData.SetMeasurements() from slide 6.
        When called, it updates the state and notifies all observers.
        
        Args:
            symbol: The cryptocurrency symbol that was updated
            rows_inserted: Number of new rows inserted
            update_data: Optional list of dictionaries with update details
        """
        self._last_update_symbol = symbol
        self._last_update_rows = rows_inserted
        self._last_update_timestamp = time.time()
        self._last_update_data = update_data or []
        
        # Notify all observers (equivalent to MeasurementsChanged() from slide 6)
        event_data = {
            'symbol': symbol,
            'rows_inserted': rows_inserted,
            'timestamp': self._last_update_timestamp,
            'data': self._last_update_data
        }
        self.notify_observers(event_data)
    
    def get_last_symbol(self) -> str:
        """Get the symbol from the last update (for Pull model)."""
        return self._last_update_symbol
    
    def get_last_rows_count(self) -> int:
        """Get the number of rows from the last update (for Pull model)."""
        return self._last_update_rows
    
    def get_last_update_time(self) -> float:
        """Get the timestamp of the last update (for Pull model)."""
        return self._last_update_timestamp
    
    def get_last_update_data(self) -> List[Dict[str, Any]]:
        """Get the data from the last update (for Pull model)."""
        return self._last_update_data


# ============================================================================
# CONCRETE OBSERVERS
# ============================================================================
# Following the pattern from slides 24-25 (ConcreteObserver)
# ============================================================================

class CacheInvalidatorObserver(Observer):
    """
    Observer that invalidates cache when price data is updated.
    
    This observer invalidates the symbols cache in api.py when new data
    is inserted, ensuring users always get fresh data.
    
    Equivalent to CurrentConditionsDisplay from the Weather Station example
    (slides 9-10), but for cache management.
    """
    
    def __init__(self, subject: CryptoDataSubject):
        """
        Initialize cache invalidator observer.
        
        Args:
            subject: The CryptoDataSubject to observe
        """
        super().__init__(subject)
        self._subject = subject
    
    def update(self, subject: Subject, event_data: Dict[str, Any] = None) -> None:
        """
        Called when price data is updated - invalidates cache.
        
        This follows the Pull model (Slide 13) - we check if the subject
        is our CryptoDataSubject and then pull the data we need.
        
        Args:
            subject: The subject that triggered the update
            event_data: Dictionary with event information
        """
        if isinstance(subject, CryptoDataSubject):
            symbol = subject.get_last_symbol()
            rows_count = subject.get_last_rows_count()
            
            # Import here to avoid circular dependencies
            from api import invalidate_symbols_cache
            
            # Invalidate the cache
            invalidate_symbols_cache()
            print(f"[CACHE] Invalidated symbols cache due to {rows_count} new rows for {symbol}")


class AnalyticsLoggerObserver(Observer):
    """
    Observer that logs analytics data when price updates occur.
    
    This observer logs information about data updates for analytics
    and monitoring purposes.
    
    Equivalent to StatisticsDisplay from the Weather Station example,
    but for analytics logging.
    """
    
    def __init__(self, subject: CryptoDataSubject):
        """
        Initialize analytics logger observer.
        
        Args:
            subject: The CryptoDataSubject to observe
        """
        super().__init__(subject)
        self._subject = subject
        self._update_count = 0
        self._total_rows_inserted = 0
    
    def update(self, subject: Subject, event_data: Dict[str, Any] = None) -> None:
        """
        Called when price data is updated - logs analytics.
        
        Args:
            subject: The subject that triggered the update
            event_data: Dictionary with event information
        """
        if isinstance(subject, CryptoDataSubject):
            symbol = subject.get_last_symbol()
            rows_count = subject.get_last_rows_count()
            timestamp = subject.get_last_update_time()
            
            self._update_count += 1
            self._total_rows_inserted += rows_count
            
            # Log analytics information
            print(f"[ANALYTICS] Update #{self._update_count}: {symbol} - "
                  f"{rows_count} rows inserted (Total: {self._total_rows_inserted} rows)")
            
            # In a real system, you might write to a database or analytics service
            # analytics_db.log_update(symbol, rows_count, timestamp)


class PriceAlertObserver(Observer):
    """
    Observer that checks for price alerts when data is updated.
    
    This observer monitors price changes and triggers alerts when
    significant price movements occur (e.g., >5% change).
    
    This demonstrates how easy it is to add new observers without
    modifying the subject (following slide 11).
    """
    
    def __init__(self, subject: CryptoDataSubject, alert_threshold: float = 5.0):
        """
        Initialize price alert observer.
        
        Args:
            subject: The CryptoDataSubject to observe
            alert_threshold: Percentage change threshold for alerts (default 5%)
        """
        super().__init__(subject)
        self._subject = subject
        self._alert_threshold = alert_threshold
        self._previous_prices: Dict[str, float] = {}
    
    def update(self, subject: Subject, event_data: Dict[str, Any] = None) -> None:
        """
        Called when price data is updated - checks for price alerts.
        
        Args:
            subject: The subject that triggered the update
            event_data: Dictionary with event information
        """
        if isinstance(subject, CryptoDataSubject):
            symbol = subject.get_last_symbol()
            update_data = subject.get_last_update_data()
            
            # Check if we have price data in the update
            if update_data and len(update_data) > 0:
                # Get the latest price from the update
                latest_price = update_data[-1].get('close') if isinstance(update_data[-1], dict) else None
                
                if latest_price and symbol in self._previous_prices:
                    previous_price = self._previous_prices[symbol]
                    price_change_pct = ((latest_price - previous_price) / previous_price) * 100
                    
                    if abs(price_change_pct) >= self._alert_threshold:
                        direction = "↑" if price_change_pct > 0 else "↓"
                        print(f"[ALERT] {symbol}: Significant price change detected! "
                              f"{direction} {abs(price_change_pct):.2f}% "
                              f"({previous_price:.2f} → {latest_price:.2f})")
                
                # Update previous price
                if latest_price:
                    self._previous_prices[symbol] = latest_price
            elif update_data:
                # If update_data exists but isn't in expected format, try to extract price
                # This is a fallback for different data formats
                pass


# ============================================================================
# SINGLETON INSTANCE (Optional - for global access)
# ============================================================================
# This allows the subject to be accessed globally if needed
# ============================================================================

_global_crypto_data_subject: CryptoDataSubject = None


def get_crypto_data_subject() -> CryptoDataSubject:
    """
    Get or create the global CryptoDataSubject instance.
    
    This follows a Singleton-like pattern for easy access to the subject.
    In a real application, you might use dependency injection instead.
    
    Returns:
        The global CryptoDataSubject instance
    """
    global _global_crypto_data_subject
    if _global_crypto_data_subject is None:
        _global_crypto_data_subject = CryptoDataSubject()
        
        # Register default observers
        CacheInvalidatorObserver(_global_crypto_data_subject)
        AnalyticsLoggerObserver(_global_crypto_data_subject)
        PriceAlertObserver(_global_crypto_data_subject, alert_threshold=5.0)
    
    return _global_crypto_data_subject









