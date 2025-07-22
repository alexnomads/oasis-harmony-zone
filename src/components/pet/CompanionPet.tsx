
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';
import type { CompanionPet, PetEvolutionStage } from '@/types/pet';
import { PET_EVOLUTION_STAGES } from '@/types/pet';

interface CompanionPetProps {
  pet: CompanionPet;
  isAnimating?: boolean;
  size?: 'small' | 'medium' | 'large';
  showStats?: boolean;
}

const PetVisual: React.FC<{ stage: PetEvolutionStage; isAnimating: boolean; size: string }> = ({ 
  stage, 
  isAnimating, 
  size 
}) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const getStageVisual = () => {
    switch (stage) {
      case 0: // Bud
        return (
          <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
            <div className="w-8 h-12 bg-gradient-to-t from-green-600 to-green-400 rounded-full relative">
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-pink-400 to-red-400 rounded-full" />
            </div>
          </div>
        );
      
      case 1: // Sprout
        return (
          <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
            <div className="w-3 h-8 bg-gradient-to-t from-green-700 to-green-500 rounded-full" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-pink-400 to-red-400 rounded-full">
              <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full" />
            </div>
          </div>
        );
      
      case 2: // Bloom
        return (
          <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
            <div className="w-4 h-12 bg-gradient-to-t from-green-700 to-green-500 rounded-full" />
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
              <div className="relative w-16 h-16">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-6 h-8 bg-gradient-to-br from-pink-300 to-red-400 rounded-full transform-gpu"
                    style={{
                      top: `${50 + 25 * Math.sin(i * (Math.PI / 4))}%`,
                      left: `${50 + 25 * Math.cos(i * (Math.PI / 4))}%`,
                      transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                    }}
                  />
                ))}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-300 rounded-full" />
              </div>
            </div>
          </div>
        );
      
      case 3: // Mystic Rose
        return (
          <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
            <div className="w-4 h-12 bg-gradient-to-t from-green-700 to-green-500 rounded-full" />
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
              <div className="relative w-20 h-20">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-6 h-8 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full transform-gpu"
                    style={{
                      top: `${50 + 30 * Math.sin(i * (Math.PI / 6))}%`,
                      left: `${50 + 30 * Math.cos(i * (Math.PI / 6))}%`,
                      transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                      boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)'
                    }}
                  />
                ))}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full shadow-lg" />
                {/* Mystical particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute w-2 h-2 bg-purple-300 rounded-full"
                    style={{
                      top: `${50 + 40 * Math.sin(i * (Math.PI / 3))}%`,
                      left: `${50 + 40 * Math.cos(i * (Math.PI / 3))}%`,
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      animate={isAnimating ? {
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
      } : {}}
      transition={{
        duration: 2,
        repeat: isAnimating ? Infinity : 0,
        ease: "easeInOut",
      }}
      className="relative"
    >
      {getStageVisual()}
      
      {stage === 3 && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 20px rgba(147, 51, 234, 0.3)',
              '0 0 40px rgba(147, 51, 234, 0.6)',
              '0 0 20px rgba(147, 51, 234, 0.3)',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.div>
  );
};

export const CompanionPet: React.FC<CompanionPetProps> = ({ 
  pet, 
  isAnimating = false, 
  size = 'medium',
  showStats = true 
}) => {
  const stageInfo = PET_EVOLUTION_STAGES[pet.evolution_stage];

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <PetVisual 
          stage={pet.evolution_stage} 
          isAnimating={isAnimating} 
          size={size}
        />
        
        {/* Evolution sparkles */}
        {pet.evolution_stage > 0 && (
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </motion.div>
        )}
      </div>

      {showStats && (
        <div className="text-center space-y-1">
          <h3 className="text-sm font-medium text-white">{pet.pet_name}</h3>
          <p className="text-xs text-white/70">{stageInfo.name}</p>
          <p className="text-xs text-white/50">{stageInfo.description}</p>
          
          {/* Experience bar */}
          <div className="w-full max-w-24 bg-white/20 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-vibrantPurple to-vibrantOrange h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(100, (pet.experience_points % 100))}%` 
              }}
            />
          </div>
          <p className="text-xs text-white/60">
            Level {pet.level} • {pet.experience_points} XP
          </p>
        </div>
      )}
    </div>
  );
};
