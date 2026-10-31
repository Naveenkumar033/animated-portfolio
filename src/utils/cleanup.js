/* ==========================================================================
   MEMORY & SCENE CLEANUP UTILITIES
   ========================================================================== */

export function disposeHierarchy(node) {
  if (!node) return;
  node.traverse((child) => {
    if (child.isMesh) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
          Object.keys(m).forEach((prop) => {
            if (m[prop] && typeof m[prop].dispose === 'function') {
              m[prop].dispose();
            }
          });
          m.dispose();
        });
      }
    }
  });
}

export function disposeRenderer(renderer) {
  if (!renderer) return;
  renderer.dispose();
  renderer.forceContextLoss();
  if (renderer.domElement && renderer.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
}

