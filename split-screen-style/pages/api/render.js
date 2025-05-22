// File: /api/render.js
import fetch from 'node-fetch';
import fs from 'fs/promises';

import { exec } from 'child_process';

import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'path';


// Constants
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const COMPOSITION_ID = 'MainClip';
const REMOTION_ROOT = path.join(process.cwd(), 'src');

// Mapping of required assets to static filenames in `public/`
const ASSET_FILENAME_MAP = {
  upper: 'upper.mp4',
  lower: 'lower.mp4',
  captions: 'upper.json',
  infographics: 'infographics.json',
};

// Helper to download asset
const downloadFile = async (url, destPath) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}`);
  const buffer = await res.arrayBuffer();
  await fs.writeFile(destPath, Buffer.from(buffer));
};


async function renderVideo (callback){
  // The composition you want to render
console.log("started render");
const compositionId = 'MainClip';

const bundleLocation = await bundle({
  entryPoint: path.resolve('./src/index.ts'),
  webpackOverride: (config) => config,
});
 
const inputProps = {
};
 
const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: compositionId,
  inputProps,
});
await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: 'h264',
  outputLocation: `public/out/${compositionId}.mp4`,
  inputProps,
});


fetch(callback);

 
console.log('Render done!');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  const {assets, callback} = req.body;
  if (!assets || typeof assets !== 'object') {
    return res.status(400).json({error: 'Missing or invalid asset list'});
  }

  try {
    // Download assets to fixed filenames in public/
    await Promise.all(
      Object.entries(ASSET_FILENAME_MAP).map(async ([key, filename]) => {
        const url = assets[key];
        if (!url) throw new Error(`Missing URL for asset: ${key}`);
        const dest = path.join(PUBLIC_DIR, filename);
        await downloadFile(url, dest);
      })
    );

    // renderVideo(callback);
    fetch(callback);



    return res.status(200).json({response: "Started Rendering!"});
  } catch (e) {
    console.error('❌ Render failed:', e);
    return res.status(500).json({error: 'Render failed', detail: e.message});
  }
}
