/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SoccerBallIcon } from './SoccerBallIcon.tsx';

interface SportsShieldLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SportsShieldLogo: React.FC<SportsShieldLogoProps> = (props) => {
  return <SoccerBallIcon {...props} />;
};
