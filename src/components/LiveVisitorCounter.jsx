import { useState, useEffect, useRef } from 'react';
import './LiveVisitorCounter.css';

const AVATARS = [
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Technologist.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Student.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Mechanic.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Student.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Teacher.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Woman%20Technologist.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Person%20With%20Blond%20Hair.png"
];

const AVATAR_COLORS = ['#dbeafe', '#dcfce7', '#fce7f3', '#ffedd5', '#f3f4f6'];

class Spring {
  constructor(val) {
    this.val = val;
    this.target = val;
    this.vel = 0;
    this.k = 0.15;
    this.damp = 0.8;
  }

  update() {
    const force = (this.target - this.val) * this.k;
    this.vel += force;
    this.vel *= this.damp;
    this.val += this.vel;

    if (Math.abs(this.vel) < 0.001 && Math.abs(this.target - this.val) < 0.001) {
      this.val = this.target;
      this.vel = 0;
    }
  }
}

const LiveVisitorCounter = () => {
  const [visitorCount, setVisitorCount] = useState(113);
  const [avatarConfig, setAvatarConfig] = useState({ displayLimit: 3, showPlus: false });
  const springsRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const places = [10000, 1000, 100, 10, 1];
    springsRef.current = places.map(place => {
      const spring = new Spring(Math.floor(visitorCount / place));
      spring.target = Math.floor(visitorCount / place);
      return { place, spring };
    });

    const animate = () => {
      springsRef.current.forEach(({ spring, place }) => {
        spring.target = Math.floor(visitorCount / place);
        spring.update();
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visitorCount]);

  useEffect(() => {
    const baseVisitors = 113;
    const baseAvatars = 3;
    const visitorsAboveBase = visitorCount - baseVisitors;
    const additionalAvatars = Math.floor(visitorsAboveBase / 6);
    const calculatedLimit = baseAvatars + additionalAvatars;
    const displayLimit = Math.max(1, Math.min(calculatedLimit, 5));
    const showPlus = calculatedLimit > 5;

    setAvatarConfig({ displayLimit, showPlus });
  }, [visitorCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisitorCount(prev => {
        const change = Math.floor(Math.random() * 11) - 5;
        const newCount = prev + change;
        return Math.max(105, Math.min(140, newCount));
      });
    }, 1660);

    return () => clearInterval(interval);
  }, []);

  const DigitPlace = ({ place, springs }) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
      const spring = springs?.find(s => s.place === place)?.spring;
      if (!spring) return;

      const animate = () => {
        const val = spring.val;
        const placeValue = val % 10;
        setOffset(placeValue);
        requestAnimationFrame(animate);
      };

      const frame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(frame);
    }, [place, springs]);

    const shouldDisplay = visitorCount >= place;

    if (!shouldDisplay) return null;

    return (
      <div className="digit-place">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          let digitOffset = (10 + num - offset) % 10;
          let memo = digitOffset * 20;
          if (digitOffset > 5) {
            memo -= 10 * 20;
          }

          return (
            <span
              key={num}
              className="digit-number"
              style={{ transform: `translateY(${memo}px)` }}
            >
              {num}
            </span>
          );
        })}
      </div>
    );
  };

  const visibleAvatars = AVATARS.slice(0, avatarConfig.displayLimit);

  return (
    <div className="visitor-card">
      <div className="header">
        <span className="label">Live Visitors</span>
        <span className="pulse-dot">
          <span className="pulse-ring"></span>
          <span className="pulse-core"></span>
        </span>
      </div>

      <div className="content">
        <div className="counter">
          {[10000, 1000, 100, 10, 1].map(place => (
            <DigitPlace key={place} place={place} springs={springsRef.current} />
          ))}
        </div>

        <div className="avatar-stack">
          {visibleAvatars.map((url, index) => (
            <div
              key={index}
              className="avatar avatar-enter"
              style={{
                zIndex: 10 + index,
                backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
                animationDelay: `${index * 120}ms`
              }}
            >
              <img src={url} alt={`Visitor ${index}`} />
            </div>
          ))}
          {avatarConfig.showPlus && (
            <div className="avatar-plus avatar-enter" style={{ zIndex: 20 }}>
              <span>+</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveVisitorCounter;
