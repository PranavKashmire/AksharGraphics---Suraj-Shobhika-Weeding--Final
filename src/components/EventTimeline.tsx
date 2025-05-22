
import React, { useRef, useState, useEffect } from 'react';
import { Calendar, Music, Heart, MapPin, ExternalLink } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Event {
  name: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  mapLink?: string;
  icon: React.ReactNode;
  color: string;
}

const EventTimeline: React.FC = () => {
  const [visibleEvents, setVisibleEvents] = useState<number[]>([]);
  const [activeEvent, setActiveEvent] = useState<number | null>(null);
  const eventRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isMobile = useIsMobile();
  
  const events: Event[] = [
    {
      name: "Mehendi Ceremony",
      date: "1st June 2025",
      time: "6:00 PM",
      venue: "Sonawane Heights",
      address: "Kathe Lane, Bankar Chowk, Dwarka, Nashik, Maharashtra 422011",
      mapLink: "https://www.google.com/maps/place/Sonawane+Heights/@19.989041,73.8029186,779m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3bddeba3a8df3da9:0x8ad4a129e4071d0f!8m2!3d19.989041!4d73.8029186!16s%2Fg%2F11tsj2gkb9?entry=ttu&g_ep=EgoyMDI1MDUxNS4xIKXMDSoASAFQAw%3D%3D",
      icon: <div className="p-2 rounded-full bg-red-100 text-red-600"><Heart size={18} /></div>,
      color: "bg-red-50 border-red-200"
    },
    {
      name: "Haladi & Sangeet Ceremony",
      date: "3rd June 2025",
      time: "5:00 PM",
      venue: "Rukmini Lawns",
      address: "Rukmini Lawns, Dinde Farm Aurangabad Road Nandur, Shivrasta, Bidi Kamgar Colony, Nashik, Maharashtra 422006",
      mapLink: "https://www.google.com/maps/place/Rukmini+Lawns/@20.010626,73.8297611,17z/data=!3m1!4b1!4m6!3m5!1s0x3bddea7b7d64e7a5:0x331f5194373fc6f0!8m2!3d20.010621!4d73.832336!16s%2Fg%2F11yjwygpt?entry=ttu&g_ep=EgoyMDI1MDUxNS4xIKXMDSoASAFQAw%3D%3D",
      icon: <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88"/>
                <path d="M19.5 9c0 3.5-3.5 6.5-7.5 11-4-4.5-7.5-7.5-7.5-11a7.5 7.5 0 1 1 15 0z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
            </div>,
      color: "bg-yellow-50 border-yellow-200"
    },
    {
      name: "Wedding Ceremony",
      date: "4th June 2025",
      time: "7:02 PM",
      venue: "Rukmini Lawns",
      address: "Rukmini Lawns, Dinde Farm Aurangabad Road Nandur, Shivrasta, Bidi Kamgar Colony, Nashik, Maharashtra 422006",
      mapLink: "https://www.google.com/maps/place/Rukmini+Lawns/@20.010626,73.8297611,17z/data=!3m1!4b1!4m6!3m5!1s0x3bddea7b7d64e7a5:0x331f5194373fc6f0!8m2!3d20.010621!4d73.832336!16s%2Fg%2F11yjwygpt?entry=ttu&g_ep=EgoyMDI1MDUxNS4xIKXMDSoASAFQAw%3D%3D",
      icon: <div className="p-2 rounded-full bg-purple-100 text-purple-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A8 8 0 1 0 4 16.2"/>
                <path d="M12 10v10"/>
                <path d="m8 14 4-4 4 4"/>
              </svg>
            </div>,
      color: "bg-purple-50 border-purple-200"
    },
    
  ];
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = eventRefs.current.indexOf(entry.target as HTMLDivElement);
          if (entry.isIntersecting && index !== -1 && !visibleEvents.includes(index)) {
            setVisibleEvents(prev => [...prev, index]);
          }
        });
      },
      { threshold: 0.2 }
    );
    
    eventRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    
    return () => observer.disconnect();
  }, [visibleEvents]);

  const handleEventHover = (index: number) => {
    setActiveEvent(index);
  };

  const handleEventLeave = () => {
    setActiveEvent(null);
  };

  return (
    <section className="w-full py-16 bg-wedding-cream bg-opacity-40">
      <div className="w-full max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block py-1.5 px-4 bg-wedding-gold/10 rounded-full text-sm font-medium text-wedding-gold mb-3 tracking-wide">
            Join Us For
          </span>
          <h2 className="font-playfair text-3xl sm:text-4xl text-wedding-maroon mb-4">वैवाहिक कार्यक्रम</h2>
          <p className="text-base text-gray-600 max-w-lg mx-auto leading-relaxed">
            We invite you to celebrate these special moments with us as we begin our journey together
          </p>
        </div>
        
        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-wedding-gold/10 via-wedding-gold/30 to-wedding-gold/10 transform -translate-x-1/2"></div>
          
          <div className="space-y-8 sm:space-y-10">
            {events.map((event, index) => (
              <div 
                key={index}
                ref={el => eventRefs.current[index] = el}
                className={`relative flex flex-col md:flex-row ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                } items-center md:items-start gap-6 md:gap-8 ${
                  visibleEvents.includes(index) 
                    ? 'opacity-100 transform translate-y-0 transition-all duration-700' 
                    : 'opacity-0 transform translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
                onMouseEnter={() => handleEventHover(index)}
                onMouseLeave={handleEventLeave}
                onTouchStart={() => handleEventHover(index)}
                onTouchEnd={handleEventLeave}
              >
                <div className="hidden md:flex absolute left-1/2 w-10 h-10 bg-wedding-gold/80 rounded-full transform -translate-x-1/2 items-center justify-center z-10 transition-all duration-300 shadow-gold-soft">
                  <div className={`w-5 h-5 bg-wedding-cream rounded-full transition-all duration-300 ${activeEvent === index ? 'scale-75' : 'scale-100'}`}></div>
                </div>
                
                <div 
                  className={`glass-card border md:w-5/12 w-full p-8 transition-all duration-300 ${
                    activeEvent === index ? 'shadow-gold-glow border-wedding-gold/40 transform scale-105' : 'shadow-gold-soft hover:shadow-gold-glow hover:scale-[1.01]'
                  } ${event.color}`}
                >
                  <div className="flex items-start gap-6">
                    <div className={`flex-shrink-0 transition-all duration-300 ${activeEvent === index ? 'transform scale-110' : ''}`}>
                      {event.icon}
                    </div>
                    <div className="w-full">
                      <h3 className="font-playfair text-xl sm:text-2xl text-wedding-maroon mb-3">{event.name}</h3>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center text-gray-700">
                          <Calendar size={18} className="mr-3 text-wedding-gold" />
                          <span className="font-medium">{event.date}</span>
                        </div>
                        <p className="text-gray-600 pl-9">{event.time}</p>
                        {event.venue && <p className="text-gray-700 font-medium pl-9">{event.venue}</p>}
                        
                        {event.mapLink ? (
                          <a 
                            href={event.mapLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-wedding-maroon hover:text-wedding-gold transition-colors duration-300 pl-9 mt-3"
                          >
                            <MapPin size={18} className="mr-2 flex-shrink-0" />
                            <span className="font-medium underline-grow">{event.address}</span>
                            <ExternalLink size={16} className="ml-2 flex-shrink-0" />
                          </a>
                        ) : (
                          <p className="flex items-center text-gray-600 pl-9 mt-3">
                            <MapPin size={18} className="mr-2 flex-shrink-0" />
                            <span className="font-medium">{event.address}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="hidden md:block md:w-5/12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventTimeline;
