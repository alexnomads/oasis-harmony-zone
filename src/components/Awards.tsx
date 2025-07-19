import { motion } from "framer-motion";
const awards = [{
  name: "Thrive Protocol",
  logo: "https://pbs.twimg.com/profile_images/1838974918848897025/sulX6L3i_400x400.jpg",
  link: "https://x.com/thriveprotocol/status/1915387070433939723"
}, {
  name: "Polygon",
  logo: "https://altcoinsbox.com/wp-content/uploads/2023/03/matic-logo.webp",
  link: "https://x.com/0xPolygon/status/1940408069831418021"
}, {
  name: "Soonami",
  logo: "https://pbs.twimg.com/profile_images/1709859920030347264/9SL23TTa_400x400.jpg",
  link: "https://x.com/soonami_io/status/1890440940772352257"
}];
export const Awards = () => {
  return <section className="py-8 bg-black/30 backdrop-blur-sm border-y border-white/10">
      <div className="container mx-auto px-4">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="text-center mb-8">
          <span className="inline-block px-6 py-2 text-lg font-medium bg-white/10 text-white rounded-full">
            Grants & Hackatons Won So far
          </span>
        </motion.div>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
          {awards.map((award, index) => (
            <motion.a 
              key={award.name}
              href={award.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              initial={{
                opacity: 0,
                scale: 0.8
              }} 
              whileInView={{
                opacity: 1,
                scale: 1
              }} 
              whileHover={{
                scale: 1.05
              }} 
              transition={{
                duration: 0.4,
                delay: index * 0.2
              }} 
              className="bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/20 w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center"
            >
              <img 
                src={award.logo} 
                alt={award.name} 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-contain" 
              />
            </motion.a>
          ))}
        </div>
      </div>
    </section>;
};
