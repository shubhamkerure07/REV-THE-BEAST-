import React from 'react';
import { CarConfigState, AppView } from '../types';
import { RacingSimulator3D } from '../three/RacingSimulator3D';

interface EditorialRacingProps {
  config: CarConfigState;
  onNavigate: (view: AppView) => void;
  showToast: (msg: string) => void;
}

export const EditorialRacing: React.FC<EditorialRacingProps> = ({
  config,
  onNavigate,
  showToast,
}) => {
  return (
    <div className="w-full h-full bg-[#08080a] overflow-hidden">
      <RacingSimulator3D
        config={config}
        onExit={() => onNavigate('garage')}
        showToast={showToast}
      />
    </div>
  );
};
