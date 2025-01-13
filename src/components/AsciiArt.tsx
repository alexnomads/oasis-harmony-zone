export const AsciiArt = () => {
  return (
    <div className="w-full bg-black py-8">
      <pre className="font-mono text-xs sm:text-sm md:text-base whitespace-pre overflow-x-auto text-center">
        <span className="text-white">         ..ooo.</span>
        <span className="text-[#FF4444]">{`
        .888888888.
        88"P""T"T888 8o
     o8o 8.8"8 88o."8o
    88 . o88o8 8 88."8 
   88 o8 88 oo.8 888 8
   88."8o."T88P.88". 8
   "888o"8888oo8888 o8
     "88888ooo  888P"`}</span>
        <span className="text-sage">{`
.oo888ooo.    8888P8
8888"888"88o.  "888"
8888" "88 888.    88
"888o." 88"88o.  o8"
 8888888o "8 8  .8
  "8888888o  .8o=
      "888" 88"
            o8P
      ...oo88
"8oo...oo888"`}</span>
      </pre>
    </div>
  );
};