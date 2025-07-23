
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Clock } from 'lucide-react';
import { MeditationRecommendation } from '@/lib/services/meditationAgentService';

export interface MessageType {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  showMeditationStart: boolean;
  recommendation?: MeditationRecommendation;
}

interface ChatMessageProps {
  message: MessageType;
  index: number;
  isTimerRunning: boolean;
  startMeditation: (recommendation?: MeditationRecommendation) => void;
}

const formatMeditationContent = (content: string) => {
  // Split content into paragraphs and format with meditation-specific styling
  const paragraphs = content.split('\n\n');
  
  return paragraphs.map((paragraph, index) => {
    // Handle lists
    if (paragraph.includes('•') || paragraph.includes('-')) {
      const listItems = paragraph.split('\n').filter(item => item.trim());
      return (
        <div key={index} className="space-y-1">
          {listItems.map((item, itemIndex) => (
            <div key={itemIndex} className="flex items-start gap-2">
              <span className="text-vibrantOrange text-sm mt-1">•</span>
              <span className="text-white/90 text-sm leading-relaxed">
                {item.replace(/^[•\-]\s*/, '')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    
    // Handle regular paragraphs
    return (
      <p key={index} className="text-white/90 text-sm leading-relaxed">
        {paragraph}
      </p>
    );
  });
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  index,
  isTimerRunning,
  startMeditation
}) => {
  const isUser = message.role === 'user';
  const isAgent = message.role === 'agent';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {isAgent && (
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1">
          <img 
            src="/lovable-uploads/2666064f-8909-4cd1-844b-4cfbed2e83f6.png"
            alt="Rose of Jericho"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div className={`
          rounded-2xl px-4 py-3 text-sm
          ${isUser 
            ? 'bg-gradient-to-r from-vibrantPurple to-vibrantOrange text-white ml-auto' 
            : 'bg-white/10 backdrop-blur-sm border border-white/20'
          }
        `}>
          {isAgent ? (
            <div className="space-y-3">
              {formatMeditationContent(message.content)}
            </div>
          ) : (
            <p className="text-white">{message.content}</p>
          )}
        </div>
        
        {message.showMeditationStart && !isTimerRunning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.3 }}
            className="mt-3 flex gap-2"
          >
            <Button
              onClick={() => startMeditation(message.recommendation)}
              className="bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90 transition-opacity text-white text-xs px-3 py-1.5 h-auto"
            >
              <Play className="w-3 h-3 mr-1" />
              Start Meditation
            </Button>
            
            {message.recommendation && (
              <div className="flex items-center gap-1 text-white/60 text-xs">
                <Clock className="w-3 h-3" />
                <span>{Math.floor(message.recommendation.duration / 60)} min</span>
              </div>
            )}
          </motion.div>
        )}
        
        <div className="text-xs text-white/40 mt-2">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </motion.div>
  );
};
