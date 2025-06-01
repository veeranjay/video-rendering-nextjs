// File: /api/render.js
import fetch from 'node-fetch';

import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'path';



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
  const {callback} = req.body;

  try {

    renderVideo(callback);

    return res.status(200).json({response: "Started Rendering!"});
  } catch (e) {
    console.error('❌ Render failed:', e);
    return res.status(500).json({error: 'Render failed', detail: e.message});
  }
}
