import React from 'react';

const StickerCollection: React.FC = () => {
  const stickers = [
    {
      id: 1,
      text: "GHOSTING ≠ RESOLUTION",
      shape: "starburst",
      bgColor: "bg-lime-chartreuse",
      textColor: "text-black",
      animation: "hover:rotate-6 hover:scale-110"
    },
    {
      id: 2,
      text: "SQUASH IT BEFORE IT FESTERS",
      shape: "pill",
      bgColor: "bg-vivid-orange",
      textColor: "text-white",
      animation: "hover:-rotate-3 hover:scale-105"
    },
    {
      id: 3,
      text: "CHAOS CONTAINED* (*KINDA)",
      shape: "heart",
      bgColor: "bg-green-teal",
      textColor: "text-white",
      animation: "hover:animate-bounce"
    },
    {
      id: 4,
      text: "WORLD'S OKAYEST CONFLICT RESOLVER",
      shape: "arch",
      bgColor: "bg-dark-teal",
      textColor: "text-lime-chartreuse",
      animation: "hover:rotate-2 hover:scale-110"
    },
    {
      id: 5,
      text: "SPICY TAKES, SOFT DELIVERY",
      shape: "badge",
      bgColor: "bg-lime-chartreuse",
      textColor: "text-dark-teal",
      animation: "hover:-rotate-6 hover:scale-105"
    },
    {
      id: 6,
      text: "WE DON'T DO SUBTWEETS HERE",
      shape: "oval",
      bgColor: "bg-vivid-orange",
      textColor: "text-black",
      animation: "hover:rotate-3 hover:scale-110"
    },
    {
      id: 7,
      text: "I VOTED FOR CLOSURE",
      shape: "diamond",
      bgColor: "bg-green-teal",
      textColor: "text-white",
      animation: "hover:animate-pulse"
    },
    {
      id: 8,
      text: "ACCOUNTABILITY IS SEXY",
      shape: "circle",
      bgColor: "bg-dark-teal",
      textColor: "text-lime-chartreuse",
      animation: "hover:-rotate-12 hover:scale-105"
    },
    {
      id: 9,
      text: "BIG BOUNDARIES ENERGY",
      shape: "hexagon",
      bgColor: "bg-lime-chartreuse",
      textColor: "text-black",
      animation: "hover:rotate-6 hover:scale-110"
    },
    {
      id: 10,
      text: "LET'S TALK (BUT NICELY THIS TIME)",
      shape: "speech-bubble",
      bgColor: "bg-vivid-orange",
      textColor: "text-white",
      animation: "hover:scale-110"
    }
  ];

  const getShapeClasses = (shape: string) => {
    switch (shape) {
      case 'starburst':
        return 'relative before:content-[""] before:absolute before:inset-0 before:bg-inherit before:transform before:rotate-45 before:-z-10 before:border-4 before:border-black clip-path-starburst';
      case 'pill':
        return 'rounded-full px-6 py-3';
      case 'heart':
        return 'relative before:content-[""] before:absolute before:top-0 before:left-1/2 before:w-6 before:h-6 before:bg-inherit before:rounded-full before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:border-4 before:border-black after:content-[""] after:absolute after:top-0 after:right-1/2 after:w-6 after:h-6 after:bg-inherit after:rounded-full after:transform after:translate-x-1/2 after:-translate-y-1/2 after:border-4 after:border-black rounded-b-full';
      case 'arch':
        return 'rounded-t-full px-6 py-4';
      case 'badge':
        return 'relative before:content-[""] before:absolute before:top-0 before:left-1/2 before:w-0 before:h-0 before:border-l-4 before:border-r-4 before:border-b-4 before:border-transparent before:border-b-inherit before:transform before:-translate-x-1/2 before:-translate-y-full px-6 py-3';
      case 'oval':
        return 'rounded-full px-8 py-4 transform rotate-12';
      case 'diamond':
        return 'transform rotate-45 w-24 h-24 flex items-center justify-center';
      case 'circle':
        return 'rounded-full w-32 h-32 flex items-center justify-center';
      case 'hexagon':
        return 'relative before:content-[""] before:absolute before:inset-0 before:bg-inherit before:transform before:rotate-60 before:-z-10 before:border-4 before:border-black after:content-[""] after:absolute after:inset-0 after:bg-inherit after:transform after:-rotate-60 after:-z-10 after:border-4 after:border-black';
      case 'speech-bubble':
        return 'rounded-2xl px-6 py-4 relative after:content-[""] after:absolute after:bottom-0 after:left-6 after:w-0 after:h-0 after:border-l-4 after:border-r-4 after:border-t-8 after:border-transparent after:border-t-inherit after:transform after:translate-y-full';
      default:
        return 'rounded-lg px-4 py-2';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Stickers positioned around the page */}
      <div className="relative w-full h-full">
        {/* Top left cluster */}
        <div className="absolute top-20 left-4 md:left-10 pointer-events-auto">
          <div className={`${stickers[0].bgColor} ${stickers[0].textColor} ${getShapeClasses(stickers[0].shape)} border-4 border-black shadow-brutal transition-all duration-300 ${stickers[0].animation} cursor-pointer transform rotate-12`}>
            <span className="font-black text-xs md:text-xs leading-tight relative z-10">{stickers[0].text}</span>
          </div>
        </div>

        {/* Top right */}
        <div className="absolute top-32 right-4 md:right-16 pointer-events-auto">
          <div className={`${stickers[1].bgColor} ${stickers[1].textColor} ${getShapeClasses(stickers[1].shape)} border-4 border-black shadow-brutal transition-all duration-300 ${stickers[1].animation} cursor-pointer transform -rotate-6`}>
            <span className="font-black text-xs md:text-xs leading-tight">{stickers[1].text}</span>
          </div>
        </div>

        {/* Left side middle */}
        <div className="absolute top-1/2 left-2 md:left-8 pointer-events-auto">
          <div className={`${stickers[2].bgColor} ${stickers[2].textColor} ${getShapeClasses(stickers[2].shape)} border-4 border-black shadow-brutal transition-all duration-300 ${stickers[2].animation} cursor-pointer transform rotate-3 px-6 py-4`}>
            <span className="font-black text-xs md:text-xs leading-tight">{stickers[2].text}</span>
          </div>
        </div>

        {/* Right side middle */}
        <div className="absolute top-1/2 right-2 md:right-12 pointer-events-auto">
          <div className={`${stickers[3].bgColor} ${stickers[3].textColor} ${getShapeClasses(stickers[3].shape)} border-4 border-black shadow-brutal transition-all duration-300 ${stickers[3].animation} cursor-pointer transform -rotate-12`}>
            <span className="font-black text-xs md:text-xs leading-tight text-center">{stickers[3].text}</span>
          </div>
        </div>

        {/* Bottom left */}
        <div className="absolute bottom-32 left-4 md:left-20 pointer-events-auto">
          <div className={`${stickers[4].bgColor} ${stickers[4].textColor} ${getShapeClasses(stickers[4].shape)} border-4 border-black shadow-brutal transition-all duration-300 ${stickers[4].animation} cursor-pointer transform rotate-6`}>
            <span className="font-black text-xs md:text-xs leading-tight">{stickers[4].text}</span>
          </div>
        </div>

        {/* Bottom right */}
        <div className="absolute bottom-20 right-4 md:right-20 pointer-events-auto">
          <div className={`${stickers[5].bgColor} ${stickers[5].textColor} ${getShapeClasses(stickers[5].shape)} border-4 border-black shadow-brutal transition-all duration-300 ${stickers[5].animation} cursor-pointer`}>
            <span className="font-black text-xs md:text-xs leading-tight">{stickers[5].text}</span>
          </div>
        </div>

        {/* Top center */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className={`${stickers[6].bgColor} ${stickers[6].textColor} ${getShapeClasses(stickers[6].shape)} border-4 border-black shadow-brutal transition-all duration-300 ${stickers[6].animation} cursor-pointer transform rotate-45`}>
            <span className="font-black text-xs md:text-xs leading-tight transform -rotate-45 block">{stickers[6].text}</span>
          </div>
        </div>

        {/* Center right */}
        <div className="absolute top-1/3 right-1 md:right-4 pointer-events-auto">
          <div className={`${stickers[7].bgColor} ${stickers[7].textColor} ${getShapeClasses(stickers[7].shape)} border-4 border-black shadow-brutal transition-all duration-300 ${stickers[7].animation} cursor-pointer`}>
            <span className="font-black text-xs md:text-xs leading-tight text-center">{stickers[7].text}</span>
          </div>
        </div>

        {/* Bottom center left */}
        <div className="absolute bottom-40 left-1/4 md:left-1/3 pointer-events-auto">
          <div className={`${stickers[8].bgColor} ${stickers[8].textColor} ${getShapeClasses(stickers[8].shape)} border-4 border-black shadow-brutal transition-all duration-300 ${stickers[8].animation} cursor-pointer transform -rotate-3 px-6 py-4`}>
            <span className="font-black text-xs md:text-xs leading-tight relative z-10">{stickers[8].text}</span>
          </div>
        </div>

        {/* Bottom center right */}
        <div className="absolute bottom-48 right-1/4 md:right-1/3 pointer-events-auto">
          <div className={`${stickers[9].bgColor} ${stickers[9].textColor} ${getShapeClasses(stickers[9].shape)} border-4 border-black shadow-brutal transition-all duration-300 ${stickers[9].animation} cursor-pointer transform rotate-6`}>
            <span className="font-black text-xs md:text-xs leading-tight">{stickers[9].text}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickerCollection;