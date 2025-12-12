import React from 'react';
import { motion } from 'framer-motion';
import { useCinematicBehavior } from '@/components/hooks/useCinematicBehavior';
import { useCameraControl } from '@/components/hooks/useCameraControl';

export function CinematicContainer({ 
  children, 
  elementId, 
  enableCamera = false,
  className = '',
  ...props 
}) {
  const { elementRef, animationProps, handlers, contentPriority } = useCinematicBehavior(elementId);
  const { cameraState } = useCameraControl();

  // Calculate transform based on camera state
  const getCameraTransform = () => {
    if (!enableCamera) return {};

    const { position, rotation, fov } = cameraState;
    const scale = 1 / position.z; // Zoom effect
    const perspective = 1000 / (fov / 75); // Adjust perspective based on FOV

    return {
      transform: `
        perspective(${perspective}px)
        translate3d(${-position.x * 100}px, ${-position.y * 100}px, 0)
        rotateX(${rotation.x}deg)
        rotateY(${rotation.y}deg)
        rotateZ(${rotation.z}deg)
        scale(${scale})
      `,
      transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  // Add priority-based styling
  const getPriorityStyle = () => {
    if (!contentPriority) return {};

    const styles = {
      critical: {
        boxShadow: '0 0 30px rgba(255, 123, 0, 0.4)',
        border: '1px solid rgba(255, 123, 0, 0.3)',
      },
      high: {
        boxShadow: '0 0 20px rgba(0, 180, 216, 0.3)',
        border: '1px solid rgba(0, 180, 216, 0.2)',
      },
      medium: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      low: {
        opacity: 0.85,
      },
    };

    return styles[contentPriority.priority] || {};
  };

  return (
    <motion.div
      ref={elementRef}
      className={className}
      {...animationProps}
      {...handlers}
      style={{
        ...getCameraTransform(),
        ...getPriorityStyle(),
        position: 'relative',
      }}
      {...props}
    >
      {children}
      
      {/* Priority indicator (debug mode) */}
      {process.env.NODE_ENV === 'development' && contentPriority && (
        <div style={{
          position: 'absolute',
          top: 4,
          right: 4,
          padding: '2px 6px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          fontSize: '10px',
          borderRadius: '4px',
          pointerEvents: 'none',
        }}>
          {contentPriority.priority}
        </div>
      )}
    </motion.div>
  );
}