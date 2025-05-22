
import { Caption, TikTokPage } from "@remotion/captions";
import { useEffect, useState } from "react";


export type TokenSchema = {
    text:string;
    fromMs: number;
    toMs:number;
}

export type PageSchema = {
    text: string;
    startMs: number;
    endMs: number;
    tokens: TokenSchema[];
  };

const useCustomStyleCaptions = ({
    captions,
    maxCharactersPerSegment,
  }: {
    captions: Caption[];
    maxCharactersPerSegment: number;
  }) =>{

    const [pages, setPages] = useState<PageSchema[]>([]);
    useEffect(()=>{
        if (!captions || captions.length === 0) return;

        let temp: PageSchema[] = [];
        let currentSegment : PageSchema = {
            text: captions[0].text,
            startMs: captions[0].startMs,
            endMs: captions[0].endMs,
            tokens: [{
                text: " " + captions[0].text + " ",
                fromMs: captions[0].startMs,
            toMs: captions[0].endMs,
            }]
        };

        let currSize = currentSegment.text.length;

        for (let i = 1; i < captions.length; ++i){
            const currCaption = captions[i];

            const currTokenizedCaption : TokenSchema = {
                text:" " + currCaption.text + " ",
                fromMs: currCaption.startMs,
                toMs: currCaption.endMs
            }

            if(currSize + currCaption.text.length  <= maxCharactersPerSegment){
                currentSegment.text += " " + currCaption.text;
                currentSegment.endMs = currCaption.endMs;
                currentSegment.tokens.push(currTokenizedCaption);
                currSize+= currCaption.text.length;
            }else{
                temp.push(currentSegment);
                currentSegment = {
                    text: currCaption.text,
                    startMs:currCaption.startMs,
                    endMs: currCaption.endMs,
                    tokens: [currTokenizedCaption]
                };
                currSize = currCaption.text.length;
            }
        }

        temp.push(currentSegment);

        setPages(temp);

    }, [captions, maxCharactersPerSegment]);

    return {pages};
}

export {useCustomStyleCaptions};