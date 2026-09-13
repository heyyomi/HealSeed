import React, { useState, useEffect } from 'react';
import type { CharacterId, LevelNumber } from '../../types/onboarding';
import { getCharacterBaseImage, getCharacterGrowthImagePath } from '../../utils/seedRules';

export interface CharacterGrowthImageProps {
  characterId: CharacterId;
  level?: LevelNumber;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
}

/**
 * CharacterGrowthImage component:
 * 1. Immediately renders the authentic, cute 3D character representative image
 *    (e.g. /assets/chick.jpg, /assets/sprout.jpg) so there is zero placeholder or flicker.
 * 2. Asynchronously tests if a level-specific growth image exists in:
 *    - /assets/characters/{characterId}/level{level}.png
 *    - /assets/characters/{characterId}/level{level}.jpg
 *    If found, smoothly upgrades to the level-specific image.
 * 3. Never renders CSS or SVG circular placeholders.
 */
export const CharacterGrowthImage: React.FC<CharacterGrowthImageProps> = ({
  characterId,
  level = 1,
  alt,
  className,
  style,
  fallbackSrc,
}) => {
  const baseDefault = fallbackSrc || getCharacterBaseImage(characterId);
  const [activeSrc, setActiveSrc] = useState<string>(baseDefault);

  useEffect(() => {
    let isCancelled = false;
    const defaultImage = fallbackSrc || getCharacterBaseImage(characterId);

    // Always start with the cute base character image
    setActiveSrc(defaultImage);

    // If level is provided, check if a real custom level image has been placed by the user
    if (level) {
      const pngPath = getCharacterGrowthImagePath(characterId, level, 'png');
      const jpgPath = getCharacterGrowthImagePath(characterId, level, 'jpg');

      const tester = new Image();
      tester.onload = () => {
        if (!isCancelled) {
          setActiveSrc(pngPath);
        }
      };
      tester.onerror = () => {
        const testerJpg = new Image();
        testerJpg.onload = () => {
          if (!isCancelled) {
            setActiveSrc(jpgPath);
          }
        };
        testerJpg.onerror = () => {
          // If neither exists, retain the authentic cute base image
          if (!isCancelled) {
            setActiveSrc(defaultImage);
          }
        };
        testerJpg.src = jpgPath;
      };
      tester.src = pngPath;
    }

    return () => {
      isCancelled = true;
    };
  }, [characterId, level, fallbackSrc]);

  return (
    <img
      src={activeSrc}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        const target = e.currentTarget as HTMLImageElement;
        const defaultImage = fallbackSrc || getCharacterBaseImage(characterId);
        if (target.src !== defaultImage) {
          target.src = defaultImage;
        }
      }}
    />
  );
};
