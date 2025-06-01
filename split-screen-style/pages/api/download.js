// File: /api/render.js
import fetch from 'node-fetch';
import fs from 'fs/promises';

import { exec } from 'child_process';

import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'path';
import { spawn } from 'child_process';


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


const downloadInfographicImages = async (jobFolder) => {
  const infographicsPath = path.join(jobFolder, 'infographics.json');
  const imgsDir = path.join(jobFolder, 'imgs');

  try {
    // Ensure the imgs directory exists
    await fs.mkdir(imgsDir, { recursive: true });

    // Read and parse infographics.json
    const data = await fs.readFile(infographicsPath, 'utf-8');
    const infographics = JSON.parse(data);

    const downloadPromises = infographics.map(async (entry, index) => {
      if (entry.type === 'image' && entry.uri) {
        const url = entry.uri;
        const fileExtMatch = url.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i);
        const extension = fileExtMatch ? fileExtMatch[1].toLowerCase() : 'jpg';
        const dest = path.join(imgsDir, `${index}.${extension}`);

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to download image: ${url}`);
        const buffer = await res.arrayBuffer();
        await fs.writeFile(dest, Buffer.from(buffer));
      }
    });

    await Promise.all(downloadPromises);
  } catch (err) {
    console.error('❌ Failed to process infographic images:', err);
    throw err;
  }
};

// Helper to download asset
const downloadFile = async (url, destPath) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}`);
  const buffer = await res.arrayBuffer();
  await fs.writeFile(destPath, Buffer.from(buffer));
};



export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  const {assets} = req.body;
  if (!assets || typeof assets !== 'object') {
    return res.status(400).json({error: 'Missing or invalid asset list'});
  }

  try {
    // Download assets to fixed filenames in public/

    console.log('Started Download....');
    await Promise.all(
      Object.entries(ASSET_FILENAME_MAP).map(async ([key, filename]) => {
        const url = assets[key];
        if (!url) throw new Error(`Missing URL for asset: ${key}`);
        const dest = path.join(PUBLIC_DIR, filename);
        await downloadFile(url, dest);
      })
    );
    // fetch(callback);

    await downloadInfographicImages(PUBLIC_DIR);
    console.log('Downloaded Assets Successfully');


    // run face-detection script
    // const scriptPath = path.join(process.cwd(), 'face-detection', 'main.py');

    // const python = spawn('python3', [scriptPath]);

    //response

    return res.status(200).json({response: "Downloaded Assets Successfully!"});
  } catch (e) {
    console.error('❌ Download failed:', e);
    return res.status(500).json({error: 'Download failed', detail: e.message});
  }
}
