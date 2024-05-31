import React from 'react';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import { createDetector, SupportedModels } from "@tensorflow-models/hand-pose-detection";
import '@tensorflow/tfjs-backend-webgl';
import { drawHands } from "./utlis";
import { useAnimationFrame } from "./useAnimationFrame";
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';


tfjsWasm.setWasmPaths(
    `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm`);
 
 async function setupVideo() {
      const video = document.getElementById('video');
      const stream = await window.navigator.mediaDevices.getUserMedia({ video : true });

      video.srcObject = stream;
      await new Promise((reslove) => {
          video.onloadedmetadata = () => {
            reslove();
          }
      });
      video.play();

      video.width = video.videoWidth;
      video.height = video.videoHeight;
      
      // returning the video 
      return video;
 }

 async function setupCanvas(video) {
      const canvas  = document.getElementById('canvas');
      const ctx  = canvas.getContext('2d');

      canvas.width = video.width;
      canvas.height = video.height;

      return ctx;
 }

 async function setupDetector () {
      const model = SupportedModels.MediaPipeHands;
      const detector = await createDetector(
        model,
        {
          runtime:"mediapipe",
          maxHands: 2,
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands'
        }
      );

      return detector;
 }


const App = () => {
  const videoRef = useRef(null);
  const detectorRef =useRef(null);
  const[ctx , setCtx] = useState();
  useEffect(() => {
     async function initialize() {
        videoRef.current = await setupVideo();
        const ctx = await setupCanvas(videoRef.current);
        detectorRef.current = await setupDetector();

        setCtx(ctx);
        
     }

     initialize();
  }, []);



  useAnimationFrame(async delta => {
      const hands  = await detectorRef.current.estimateHands(
         videoRef.current,
         {
          flipHorizontal: false 
         }
      );
      ctx.clearRect(0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
      ctx.drawImage(videoRef.current, 0, 0, videoRef.current.videoWidth, videoRef.current.videoHeight);
      drawHands(hands, ctx);

  }, !!(detectorRef.current && videoRef.current && ctx))



  return (
    <div className='container'>
       <main className='flex min-h-[100vh] min-w-[100vw] flex-col items-center py-[2rem] px-0 '>
           <h2 className=' font-[550] text-2xl'>Hand Pose Detection 🖐️</h2>
           <p className='mb-[1rem] mt-[1rem]'>Work in Progress ....</p>

           <canvas style={{
              transform:"scalex(-1)",
              zIndex:1,
              borderRadius:"1rem",
              boxShadow: "0 3px 10px rgb(0 0 0)",
              maxWidth: "85vw",
             

           }}
           id='canvas'
           ></canvas>

           <video 
            style={{
              visibility:"hidden",
              transform:"scaleX(-1)",
              position:"absolute",
              top:0,
              left:0,
              width:0,
              height:0
       
            }}
            id='video'
            playsInline
           ></video>

           <p className='text-black font-[300] text-xl bottom-2 mt-5'>Made with ❤️ by yash ...</p>
       </main>
    </div>
  )
}

export default App
