'use client';

import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';
import dicomParser from 'dicom-parser';

let isInitialized = false;

export async function initCornerstone() {
  if (isInitialized) {
    return;
  }

  try {
    // Initialize Cornerstone
    await cornerstone.init();

    // Configure DICOM Image Loader
    cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
    cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;

    // Configure web worker
    cornerstoneDICOMImageLoader.webWorkerManager.initialize({
      maxWebWorkers: navigator.hardwareConcurrency || 4,
      startWebWorkersOnDemand: true,
      taskConfiguration: {
        decodeTask: {
          initializeCodecsOnStartup: true,
        },
      },
    });

    // Initialize tools
    cornerstoneTools.init();

    // Add tools
    cornerstoneTools.addTool(cornerstoneTools.PanTool);
    cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
    cornerstoneTools.addTool(cornerstoneTools.StackScrollMouseWheelTool);
    cornerstoneTools.addTool(cornerstoneTools.WindowLevelTool);
    cornerstoneTools.addTool(cornerstoneTools.LengthTool);
    cornerstoneTools.addTool(cornerstoneTools.AngleTool);
    cornerstoneTools.addTool(cornerstoneTools.RectangleROITool);
    cornerstoneTools.addTool(cornerstoneTools.EllipticalROITool);
    cornerstoneTools.addTool(cornerstoneTools.ArrowAnnotateTool);

    isInitialized = true;
    console.log('Cornerstone initialized successfully');
  } catch (error) {
    console.error('Error initializing Cornerstone:', error);
    throw error;
  }
}

export function getCornerstone() {
  return cornerstone;
}

export function getCornerstoneTools() {
  return cornerstoneTools;
}
