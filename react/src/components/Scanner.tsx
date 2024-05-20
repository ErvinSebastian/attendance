import React, { useRef, useState } from 'react';

const Scanner = () => {
  const videoEl = useRef<HTMLVideoElement>(null);
  const qrBoxEl = useRef<HTMLDivElement>(null);
  return <div className="qr-reader"></div>;
};

export default Scanner;
