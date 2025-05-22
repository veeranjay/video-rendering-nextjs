import { useEffect, useState } from 'react';
import { staticFile } from 'remotion';

export const useDynamicOrStaticFile = (uri?: string, fallbackStaticPath?: string): string => {
  const staticPath = fallbackStaticPath ? staticFile(fallbackStaticPath) : undefined;

  if (!uri && !staticPath) {
    throw new Error("Either uri or fallbackStaticPath must be provided.");
  }

  return uri || staticPath!;
};
