import type { TourStage } from '@/lib/types';

export type AdvanceTrigger = 'click-target' | 'action' | 'manual';

export type CardPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface TourStep {
  /** target id registered via useTourTarget */
  targetId: string;
  title: string;
  body: string;
  kbd?: string[];
  advanceOn: AdvanceTrigger;
  placement?: CardPlacement;
  /** route this step is shown on — used for cross-page resume banner */
  route: string;
  /** custom label for the card primary button when advanceOn is 'manual' */
  cta?: string;
  /** optional radius override for spotlight hole */
  padding?: number;
  /** mark the final step (no next arrow, different CTA) */
  isFinale?: boolean;
}

export interface TourStageDef {
  stage: TourStage;
  steps: TourStep[];
}

export interface ResolvedStep extends TourStep {
  stage: TourStage;
  index: number;
  total: number;
}
