import { useCallback, useRef, useState } from "react";

interface TouchGestureOptions {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  threshold?: number;
  longPressDelay?: number;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  isLongPress: boolean;
  longPressTimer: NodeJS.Timeout | null;
}

export function useTouchGestures(options: TouchGestureOptions = {}) {
  const {
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    onTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500,
  } = options;

  const touchState = useRef<TouchState>({
    startX: 0,
    startY: 0,
    startTime: 0,
    isLongPress: false,
    longPressTimer: null,
  });

  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const { clientX, clientY } = e;
      
      touchState.current = {
        startX: clientX,
        startY: clientY,
        startTime: Date.now(),
        isLongPress: false,
        longPressTimer: null,
      };

      // Long Press Timer
      if (onLongPress) {
        touchState.current.longPressTimer = setTimeout(() => {
          touchState.current.isLongPress = true;
          onLongPress();
        }, longPressDelay);
      }

      setIsDragging(false);
    },
    [onLongPress, longPressDelay]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!touchState.current.startTime) return;

      const { clientX, clientY } = e;
      const deltaX = Math.abs(clientX - touchState.current.startX);
      const deltaY = Math.abs(clientY - touchState.current.startY);

      // Cancel long press if moved
      if (touchState.current.longPressTimer) {
        clearTimeout(touchState.current.longPressTimer);
        touchState.current.longPressTimer = null;
      }

      // Set dragging state
      if (deltaX > 10 || deltaY > 10) {
        setIsDragging(true);
      }
    },
    []
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!touchState.current.startTime) return;

      const { clientX, clientY } = e;
      const deltaX = clientX - touchState.current.startX;
      const deltaY = clientY - touchState.current.startY;
      const deltaTime = Date.now() - touchState.current.startTime;

      // Clear long press timer
      if (touchState.current.longPressTimer) {
        clearTimeout(touchState.current.longPressTimer);
        touchState.current.longPressTimer = null;
      }

      // Reset state
      const wasLongPress = touchState.current.isLongPress;
      touchState.current = {
        startX: 0,
        startY: 0,
        startTime: 0,
        isLongPress: false,
        longPressTimer: null,
      };

      setIsDragging(false);

      // Handle gestures
      if (wasLongPress) {
        return; // Long press already handled
      }

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Determine gesture type
      if (deltaTime < 300 && absDeltaX < threshold && absDeltaY < threshold) {
        // Tap gesture
        onTap?.();
      } else if (absDeltaX > absDeltaY && absDeltaX > threshold) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
        // Vertical swipe
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    },
    [onTap, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, threshold]
  );

  const handlePointerCancel = useCallback(() => {
    // Clear long press timer
    if (touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
      touchState.current.longPressTimer = null;
    }

    // Reset state
    touchState.current = {
      startX: 0,
      startY: 0,
      startTime: 0,
      isLongPress: false,
      longPressTimer: null,
    };

    setIsDragging(false);
  }, []);

  const gestureHandlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
  };

  return {
    gestureHandlers,
    isDragging,
  };
}

// Hook für Swipe-to-Dismiss Funktionalität
export function useSwipeToDismiss(onDismiss: () => void, threshold = 100) {
  const { gestureHandlers } = useTouchGestures({
    onSwipeDown: onDismiss,
    threshold,
  });

  return gestureHandlers;
}

// Hook für Pull-to-Refresh Funktionalität
export function usePullToRefresh(onRefresh: () => void, threshold = 80) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Nur am oberen Rand starten
    if (e.clientY > 100) return;
    
    setPullDistance(0);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (e.clientY > 100) return;
    
    const distance = Math.max(0, e.clientY - 100);
    setPullDistance(distance);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      onRefresh();
      // Reset nach Refresh
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 1000);
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  return {
    pullToRefreshHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
    pullDistance,
    isRefreshing,
  };
}
