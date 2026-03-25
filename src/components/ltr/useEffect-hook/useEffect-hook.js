"use client"

import { useLayoutEffect } from 'react';

const useRemoveBodyClass = (classNamesToAdd, classNamesToRemove) => {
  // Apply layout classes before paint to avoid visible width/theme jumps.
  useLayoutEffect(() => {
    if (classNamesToRemove && classNamesToRemove.length > 0) {
      classNamesToRemove.forEach(className => {
        document.body.classList.remove(className);
      });
    }
    if (classNamesToAdd && classNamesToAdd.length > 0) {
      classNamesToAdd.forEach(className => {
        document.body.classList.add(className);
      });
    }
  }, [classNamesToAdd, classNamesToRemove]);
};

export default useRemoveBodyClass;
