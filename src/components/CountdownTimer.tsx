import React, { useState, useEffect } from "react";
import { Clock, Heart, Calendar, Sparkles, MapPin } from "lucide-react";
import { FireworksDisplay } from "./AnimatedElements";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  weddingDate?: Date;
  weddingTime?: string;
  weddingLocation?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  weddingDate,
  weddingTime,
  weddingLocation = "Wedding Venue",
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const isMobile = useIsMobile();

  // Wedding date - November 21, 2025 at 7:02 PM or use the prop if provided
  const targetDate = weddingDate
    ? weddingDate.getTime()
    : new Date("2025-11-21T19:02:00").getTime();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    // Animation trigger
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("countdown-timer");
    if (element) observer.observe(element);

    return () => {
      clearInterval(timer);
      observer.disconnect();
    };
  }, [targetDate]);

  // Effect to hide fireworks after a few seconds
  useEffect(() => {
    if (showFireworks) {
      const timer = setTimeout(() => {
        setShowFireworks(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showFireworks]);

  const handleTimerClick = () => {
    setShowFireworks(true);
  };

  const timeUnits = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  // Format date and time for display
  const displayDate = weddingDate
    ? weddingDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "November 21, 2025";

  const displayTime = weddingTime || "7:02 PM";

  // Function to add event to calendar
  const addToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering timer click

    const event = new Date(targetDate);
    const endEvent = new Date(targetDate);
    endEvent.setHours(endEvent.getHours() + 4); // Assuming 4-hour event

    // Calculate event start and end time in proper format
    const startTime = event.toISOString().replace(/-|:|\.\d+/g, "");
    const endTime = endEvent.toISOString().replace(/-|:|\.\d+/g, "");

    // Create calendar link for Google Calendar
    const title = "Our Wedding Day";
    const location = encodeURIComponent(weddingLocation);
    const details = encodeURIComponent(
      "We're getting married! Please join us for our special day."
    );

    // Google Calendar link
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;

    // For other calendar types (iCal, Outlook, etc.), you would generate a .ics file
    // The below is a basic structure for generating an iCal file
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${details.replace(/%20/g, " ")}`,
      `LOCATION:${location.replace(/%20/g, " ")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    // Create a dropdown/modal for calendar options
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.left = "50%";
    modal.style.top = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.backgroundColor = "white";
    modal.style.padding = "20px";
    modal.style.borderRadius = "8px";
    modal.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    modal.style.zIndex = "1000";
    modal.style.maxWidth = "90%";
    modal.style.width = "350px";

    modal.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h3 style="margin: 0 0 10px; font-size: 18px; color: #9d3c72;">Add to Calendar</h3>
        <p style="margin: 0; font-size: 14px; color: #666;">Choose your calendar type</p>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <a href="${googleCalendarUrl}" target="_blank" style="text-decoration: none; color: #333; padding: 10px; border: 1px solid #ddd; border-radius: 4px; display: flex; align-items: center; font-size: 14px;">
          <span style="margin-right: 10px;">Google Calendar</span>
        </a>
        <a href="#" id="download-ics" style="text-decoration: none; color: #333; padding: 10px; border: 1px solid #ddd; border-radius: 4px; display: flex; align-items: center; font-size: 14px;">
          <span style="margin-right: 10px;">Apple Calendar / Outlook (Download .ics)</span>
        </a>
        <button id="close-modal" style="margin-top: 10px; padding: 8px; background: #f3f3f3; border: none; border-radius: 4px; cursor: pointer;">Close</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle .ics download
    document.getElementById("download-ics")?.addEventListener("click", (e) => {
      e.preventDefault();
      const blob = new Blob([icsContent], {
        type: "text/calendar;charset=utf-8",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "wedding-invitation.ics";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    // Handle modal close
    document.getElementById("close-modal")?.addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    // Close modal when clicking outside
    document.addEventListener("mousedown", function closeModal(e) {
      if (!modal.contains(e.target as Node)) {
        document.body.removeChild(modal);
        document.removeEventListener("mousedown", closeModal);
      }
    });
  };

  return (
    <section id="countdown-timer" className="w-full py-6 md:py-8">
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="text-center mb-4 md:mb-6">
          <span
            className="inline-block py-1.5 px-4 bg-wedding-gold/10 rounded-full text-xs md:text-sm text-wedding-gold mb-2 gold-border-gradient cursor-pointer hover:bg-wedding-gold/20 transition-colors duration-300"
            onClick={addToCalendar}
          >
            <Calendar size={14} className="inline mr-1" /> Save The Date
          </span>
          <h3 className="font-great-vibes text-2xl sm:text-3xl md:text-4xl text-wedding-maroon animate-bounce-light">
            Countdown to our Wedding Day
          </h3>
        </div>

        <div
          className={`glass-card py-6 px-4 border border-wedding-gold/20 shadow-gold-soft hover:shadow-gold-glow transition-all duration-500 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          } cursor-pointer`}
          onClick={handleTimerClick}
          title="Click for a surprise!"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {timeUnits.map((unit, index) => (
              <div
                key={index}
                className={`text-center transform transition-all duration-500 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-5"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative inline-flex flex-col">
                  <div
                    className={`${
                      isMobile ? "w-16 h-16 sm:w-20 sm:h-20" : "w-24 h-24"
                    } rounded-lg bg-gradient-to-br from-wedding-blush to-wedding-cream flex items-center justify-center shadow-md relative overflow-hidden group hover:scale-105 transition-transform duration-300`}
                  >
                    <div className="absolute inset-0 bg-wedding-gold/5 group-hover:bg-wedding-gold/10 transition-colors duration-300"></div>
                    <span
                      className={`font-great-vibes ${
                        isMobile ? "text-2xl sm:text-3xl" : "text-4xl"
                      } text-wedding-maroon font-semibold relative z-10`}
                    >
                      {unit.value < 10 ? `0${unit.value}` : unit.value}
                    </span>

                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-effect"></div>

                    {/* Corner decorations */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-wedding-gold/50"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-wedding-gold/50"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-wedding-gold/50"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-wedding-gold/50"></div>
                  </div>
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2 w-5 h-5">
                      <Heart
                        size={16}
                        className="text-wedding-blush fill-wedding-blush animate-pulse-soft"
                      />
                    </div>
                  )}
                  <p
                    className={`mt-2 ${
                      isMobile ? "text-xs sm:text-sm" : "text-base"
                    } text-gray-600 font-medium font-dancing-script`}
                  >
                    {unit.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-4 text-sm md:text-base text-wedding-maroon font-medium">
            <span className="inline-flex items-center gap-2 bg-wedding-cream/50 px-4 py-2 rounded-full shadow-sm hover:bg-wedding-cream/70 transition-colors duration-300">
              <Clock size={16} className="text-wedding-gold" />
              <span className="font-dancing-script text-base md:text-lg">
                {displayDate} at {displayTime}
              </span>
              <Sparkles
                size={14}
                className="text-wedding-gold animate-pulse-soft"
              />
            </span>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4 animate-pulse-soft" hidden>
            Click for a surprise
          </p>
        </div>
      </div>

      {/* Fireworks animation */}
      <FireworksDisplay isActive={showFireworks} />
    </section>
  );
};

export default CountdownTimer;
