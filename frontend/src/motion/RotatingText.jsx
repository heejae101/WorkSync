import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

import { motion, AnimatePresence } from "motion/react";

import "./RotatingText.css";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const RotatingText = forwardRef((props, ref) => {
  const {
    texts,
    transition = { type: "spring", damping: 25, stiffness: 300 },
    initial = { y: "100%", opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit = { y: "-120%", opacity: 0 },
    animatePresenceMode = "wait",
    animatePresenceInitial = false,
    rotationInterval = 2000,
    staggerDuration = 0,
    staggerFrom = "first",
    loop = true,
    auto = true,
    splitBy = "characters",
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    ...rest
  } = props;

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const splitIntoCharacters = (text) => {
    return Array.from(text);
  };

  const elements = useMemo(() => {
  const currentText = texts[currentTextIndex];

  if (splitBy === "characters") {
    return [
      {
        characters: splitIntoCharacters(currentText),
        needsSpace: false,
      },
    ];
  }

  const words = currentText.split(" ");

  return words.map((word, i) => ({
    characters: [word],
    needsSpace: i !== words.length - 1,
  }));
}, [texts, currentTextIndex, splitBy]);

  const getStaggerDelay = useCallback(
    (index, totalChars) => {
      if (staggerFrom === "first") {
        return index * staggerDuration;
      }

      return 0;
    },
    [staggerFrom, staggerDuration]
  );

  const next = useCallback(() => {
    setCurrentTextIndex((prev) => {
      if (prev === texts.length - 1) {
        return loop ? 0 : prev;
      }

      return prev + 1;
    });
  }, [texts.length, loop]);

  useEffect(() => {
    if (!auto) return;

    const interval = setInterval(next, rotationInterval);

    return () => clearInterval(interval);
  }, [next, rotationInterval, auto]);

  useImperativeHandle(ref, () => ({
    next,
  }));

  return (
    <motion.span
      className={cn("text-rotate", mainClassName)}
      {...rest}
      layout
      transition={transition}
    >
      <AnimatePresence
        mode={animatePresenceMode}
        initial={animatePresenceInitial}
      >
        <motion.span
          key={currentTextIndex}
          className="text-rotate"
          layout
        >
          {elements.map((wordObj, wordIndex, array) => {
            const previousCharsCount = array
              .slice(0, wordIndex)
              .reduce((sum, word) => sum + word.characters.length, 0);

            return (
              <span
                key={wordIndex}
                className={cn("text-rotate-word", splitLevelClassName)}
              >
                {wordObj.characters.map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    initial={initial}
                    animate={animate}
                    exit={exit}
                    transition={{
                      ...transition,
                      delay: getStaggerDelay(
                        previousCharsCount + charIndex,
                        array.reduce(
                          (sum, word) => sum + word.characters.length,
                          0
                        )
                      ),
                    }}
                    className={cn(
                      "text-rotate-element",
                      elementLevelClassName
                    )}
                  >
                    {char}
                  </motion.span>
                ))}

                {wordObj.needsSpace && (
                  <span className="text-rotate-space"> </span>
                )}
              </span>
            );
          })}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
});

RotatingText.displayName = "RotatingText";

export default RotatingText;