"use client";

import { motion } from "framer-motion";

/**
 * Original SIQAP cartoon quiz mascot: a cheerful rounded character wearing a
 * mini graduation cap with blinking eyes, waving hand, and bouncy spring physics.
 */
export function SiqapMascot({
  size = 96,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{ scale: 1.12, rotate: -6 }}
      whileTap={{ scale: 0.9 }}
      className={`inline-block cursor-pointer select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft shadow */}
        <ellipse cx="60" cy="112" rx="28" ry="6" fill="#100820" fillOpacity="0.2" />

        {/* Waving right arm */}
        <motion.g
          style={{ originX: "88px", originY: "74px" }}
          animate={{ rotate: [0, 24, -8, 24, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
        >
          <path
            d="M88 74 C102 68, 108 56, 104 48"
            stroke="#1E1240"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="104" cy="46" r="6" fill="#FC8235" stroke="#1E1240" strokeWidth="3.5" />
        </motion.g>

        {/* Left arm */}
        <path
          d="M32 76 C22 80, 18 88, 22 94"
          stroke="#1E1240"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="22" cy="95" r="5.5" fill="#FC8235" stroke="#1E1240" strokeWidth="3.5" />

        {/* Round cartoon body */}
        <rect
          x="28"
          y="36"
          width="64"
          height="66"
          rx="30"
          fill="#FFF7F2"
          stroke="#1E1240"
          strokeWidth="4.5"
        />

        {/* Belly accent */}
        <ellipse cx="60" cy="84" rx="20" ry="12" fill="#FBF2EB" />

        {/* Rosy cheeks */}
        <circle cx="40" cy="70" r="5.5" fill="#FFA566" fillOpacity="0.85" />
        <circle cx="80" cy="70" r="5.5" fill="#FFA566" fillOpacity="0.85" />

        {/* Blinking eyes */}
        <motion.g
          style={{ originX: "60px", originY: "62px" }}
          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
          transition={{ duration: 3.6, times: [0, 0.45, 0.5, 0.55, 1], repeat: Infinity }}
        >
          <circle cx="48" cy="62" r="5.5" fill="#1E1240" />
          <circle cx="46.5" cy="60" r="2" fill="#FFFFFF" />
          <circle cx="72" cy="62" r="5.5" fill="#1E1240" />
          <circle cx="70.5" cy="60" r="2" fill="#FFFFFF" />
        </motion.g>

        {/* Happy cartoon smile */}
        <path
          d="M52 72 Q60 80 68 72"
          stroke="#1E1240"
          strokeWidth="3.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Mini graduation cap */}
        <polygon
          points="60,12 96,26 60,40 24,26"
          fill="#1E1240"
          stroke="#1E1240"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <rect x="44" y="30" width="32" height="10" rx="3" fill="#1E1240" />

        {/* Cap tassel swinging */}
        <motion.g
          style={{ originX: "92px", originY: "26px" }}
          animate={{ rotate: [-8, 10, -8] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <line x1="92" y1="26" x2="92" y2="42" stroke="#F5B031" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="92" cy="44" r="4" fill="#FC8235" stroke="#1E1240" strokeWidth="2.5" />
        </motion.g>

        {/* Little feet */}
        <ellipse cx="46" cy="103" rx="8" ry="5" fill="#FC8235" stroke="#1E1240" strokeWidth="3.5" />
        <ellipse cx="74" cy="103" rx="8" ry="5" fill="#FC8235" stroke="#1E1240" strokeWidth="3.5" />
      </svg>
    </motion.div>
  );
}

/**
 * Cartoon floating star sticker with thick outline.
 */
export function CartoonStar({
  size = 44,
  className = "",
  delay = 0,
}: {
  size?: number;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0], rotate: [-10, 12, -10] }}
      transition={{ duration: 3.2, delay, repeat: Infinity, ease: "easeInOut" }}
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path
          d="M32 6L39.8 22.2L57.6 24.6L44.6 37L47.8 54.8L32 46.2L16.2 54.8L19.4 37L6.4 24.6L24.2 22.2L32 6Z"
          fill="#F5B031"
          stroke="#1E1240"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle cx="27" cy="30" r="2.2" fill="#1E1240" />
        <circle cx="37" cy="30" r="2.2" fill="#1E1240" />
        <path d="M29 36 Q32 39 35 36" stroke="#1E1240" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

/**
 * Cartoon lightning bolt sticker for fast-quiz energy.
 */
export function CartoonBolt({
  size = 42,
  className = "",
  delay = 0.4,
}: {
  size?: number;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0], scale: [1, 1.08, 1], rotate: [6, -6, 6] }}
      transition={{ duration: 2.5, delay, repeat: Infinity, ease: "easeInOut" }}
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path
          d="M36 6L14 35H30L26 58L50 28H34L36 6Z"
          fill="#FC8235"
          stroke="#1E1240"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}

/**
 * Cartoon mini trophy sticker with happy face.
 */
export function CartoonTrophy({
  size = 52,
  className = "",
  delay = 0.2,
}: {
  size?: number;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -9, 0], rotate: [-5, 5, -5] }}
      transition={{ duration: 2.8, delay, repeat: Infinity, ease: "easeInOut" }}
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path
          d="M18 14H46V28C46 36.8 39.7 43 32 43C24.3 43 18 36.8 18 28V14Z"
          fill="#F5B031"
          stroke="#1E1240"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d="M18 18H10C10 27 14 30 18 30" stroke="#1E1240" strokeWidth="4" strokeLinecap="round" />
        <path d="M46 18H54C54 27 50 30 46 30" stroke="#1E1240" strokeWidth="4" strokeLinecap="round" />
        <line x1="32" y1="43" x2="32" y2="52" stroke="#1E1240" strokeWidth="4" />
        <rect x="21" y="51" width="22" height="7" rx="3.5" fill="#FC8235" stroke="#1E1240" strokeWidth="3.5" />
        <circle cx="27" cy="26" r="2" fill="#1E1240" />
        <circle cx="37" cy="26" r="2" fill="#1E1240" />
        <path d="M29 31 Q32 34 35 31" stroke="#1E1240" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}
