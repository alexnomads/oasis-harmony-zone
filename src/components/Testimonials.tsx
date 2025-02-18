
import { motion } from "framer-motion";
import { Tweet } from 'react-tweet';

export const Testimonials = () => {
  return <section className="py-16 bg-gradient-to-br from-[#9C27B0] to-[#FF8A00]">
      <div className="container mx-auto px-6">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white/10 text-white rounded-full">
            They say about us
          </span>
          <h2 className="text-4xl font-bold mb-4 text-white">Testimonials and Milestones</h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            See what our community members are saying about Rose of Jericho
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="bg-black/20 rounded-xl p-4">
            <Tweet id="1890440940772352257" />
          </motion.div>
          
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.3
        }} className="bg-black/20 rounded-xl p-4">
            <Tweet id="1886523932330627224" />
          </motion.div>
          
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.4
        }} className="bg-black/20 rounded-xl p-4">
            <Tweet id="1884682972248371583" />
          </motion.div>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.5
        }} className="bg-black/20 rounded-xl p-4 h-[600px] overflow-hidden">
            <iframe src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7294695290186432512" height="600" width="100%" frameBorder="0" allowFullScreen title="Embedded LinkedIn post" className="max-w-full -mt-16" />
          </motion.div>
        </div>
      </div>
    </section>;
};
