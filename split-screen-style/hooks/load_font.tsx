import { continueRender, delayRender, staticFile } from "remotion";

const DrPunk = `DrPunk`;
const AntonSC = `AntonSC`;
const DrGlitch = `DrGlitch`;
const CaptureIt = `CaptureIt`;
const GimmeDanger = `GimmeDanger`;
const Oswald = 'Oswald';
const Bebas = 'Bebas';



let loaded = false;

export const loadFont = async (): Promise<void> => {
  if (loaded) {
    return Promise.resolve();
  }

  const waitForFont = delayRender();

  loaded = true;


  // DrPunk
  const font1 = new FontFace(
    DrPunk,
    `url('${staticFile("doctor_punk.otf")}') format('opentype')`,
  );

  await font1.load();
  document.fonts.add(font1);


// AntonSC
  const font2 = new FontFace(
  AntonSC,
  `url('${staticFile("antonsc.ttf")}') format('truetype')`,
);

  await font2.load();
  document.fonts.add(font2);

  // Capture IT

    const font3 = new FontFace(
  CaptureIt,
  `url('${staticFile("capture_it.ttf")}') format('truetype')`,
);

  await font3.load();
  document.fonts.add(font3);


  //Oswald
      const font4 = new FontFace(
  Oswald,
  `url('${staticFile("Oswald-VariableFont_wght.ttf")}') format('truetype')`,
);

  await font4.load();
  document.fonts.add(font4);



    //Bebas
      const font5 = new FontFace(
  Bebas,
  `url('${staticFile("bebas.ttf")}') format('truetype')`,
);

  await font5.load();
  document.fonts.add(font5);

  continueRender(waitForFont);
};