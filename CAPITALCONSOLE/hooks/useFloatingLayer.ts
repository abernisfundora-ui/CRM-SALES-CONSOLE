'use client';

import type { RefObject } from 'react';
import { useEffect, useId } from 'react';

type FloatingLayerOptions = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refs: Array<RefObject<HTMLElement>>;
  closeOnRouteChangeKey?: string;
};

const FLOATING_LAYER_OPEN_EVENT = 'capital-console:floating-layer-open';

function eventTargetsLayer(event: PointerEvent, refs: Array<RefObject<HTMLElement>>) {
  const path = event.composedPath();
  return refs.some((ref) => {
    const node = ref.current;
    return node ? path.includes(node) || node.contains(event.target as Node) : false;
  });
}

export function useFloatingLayer({ open, onOpenChange, refs, closeOnRouteChangeKey }: FloatingLayerOptions) {
  const layerId = useId();

  useEffect(() => {
    if (!open) return;
    window.dispatchEvent(new CustomEvent(FLOATING_LAYER_OPEN_EVENT, { detail: { layerId } }));
  }, [layerId, open]);

  useEffect(() => {
    if (!open) return;

    const close = () => onOpenChange(false);

    const handlePointerDown = (event: PointerEvent) => {
      if (!eventTargetsLayer(event, refs)) close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    const handleLayerOpen = (event: Event) => {
      const nextLayerId = (event as CustomEvent<{ layerId?: string }>).detail?.layerId;
      if (nextLayerId && nextLayerId !== layerId) close();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener(FLOATING_LAYER_OPEN_EVENT, handleLayerOpen);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener(FLOATING_LAYER_OPEN_EVENT, handleLayerOpen);
    };
  }, [layerId, onOpenChange, open, refs]);

  useEffect(() => {
    if (open) onOpenChange(false);
    // closeOnRouteChangeKey intentionally gates route/navigation driven closing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeOnRouteChangeKey]);
}
