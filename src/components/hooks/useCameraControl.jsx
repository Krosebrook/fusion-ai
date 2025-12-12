import { useState, useEffect, useCallback } from 'react';
import { cinematicEngine } from '@/components/cinematic-engine/CinematicInteractionEngine';

export function useCameraControl() {
  const [cameraState, setCameraState] = useState(cinematicEngine.getCameraState());
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const unsubscribe = cinematicEngine.subscribe((event) => {
      if (event.type === 'camera-update') {
        setCameraState(event.camera);
      } else if (event.type === 'focus-change') {
        setCameraState(event.camera);
      }
    });

    return unsubscribe;
  }, []);

  const setPreset = useCallback((preset) => {
    setIsTransitioning(true);
    cinematicEngine.setCameraPreset(preset);
    setTimeout(() => setIsTransitioning(false), 1000);
  }, []);

  const focusElement = useCallback((elementId, smooth = true) => {
    cinematicEngine.focusElement(elementId, smooth);
  }, []);

  const animateTo = useCallback((targetState, duration = 1000) => {
    setIsTransitioning(true);
    cinematicEngine.animateCameraTo(targetState, duration);
    setTimeout(() => setIsTransitioning(false), duration);
  }, []);

  const pan = useCallback((x, y, duration = 500) => {
    const current = cinematicEngine.getCameraState();
    animateTo({
      ...current,
      position: {
        x: current.position.x + x,
        y: current.position.y + y,
        z: current.position.z,
      }
    }, duration);
  }, [animateTo]);

  const zoom = useCallback((delta, duration = 500) => {
    const current = cinematicEngine.getCameraState();
    animateTo({
      ...current,
      position: {
        ...current.position,
        z: Math.max(0.5, Math.min(3, current.position.z + delta)),
      }
    }, duration);
  }, [animateTo]);

  const rotate = useCallback((x, y, z, duration = 500) => {
    const current = cinematicEngine.getCameraState();
    animateTo({
      ...current,
      rotation: {
        x: current.rotation.x + x,
        y: current.rotation.y + y,
        z: current.rotation.z + z,
      }
    }, duration);
  }, [animateTo]);

  return {
    cameraState,
    isTransitioning,
    setPreset,
    focusElement,
    animateTo,
    pan,
    zoom,
    rotate,
  };
}