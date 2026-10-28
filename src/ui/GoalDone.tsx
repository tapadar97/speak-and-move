import { DAILY_GOAL } from '../game/profile';
import { MicIcon } from './kit';
import { Buddy, Bushes, Check, Chevron, Flame } from './scene';

interface Props {
  good: number;
  streak: number;
  onContinue: () => void;
}

/** Shown once, back on the journey, the day you meet your daily goal. */
export function GoalDone({ good, streak, onContinue }: Props) {
  return (
    <div className="goal-done" role="dialog" aria-modal="true" aria-labelledby="goal-done-title">
      <div className="screen celebrate">
        <div className="goal-done__art">
          <svg className="goal-done__cloud" viewBox="0 0 360 200" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 0H360V150Q330 120 300 140 270 100 230 128 200 96 160 126 120 100 90 132 60 106 30 136 10 120 0 130Z" fill="#ffd84d" />
          </svg>
          <Buddy className="goal-done__buddy" color="#4cc45a" mood="wink" sparks />
        </div>
        <h1 id="goal-done-title" className="goal-done__title">
          Daily goal
          <br />
          done!
        </h1>

        <ul className="result-list">
          <li>
            <span className="result-list__icon result-list__icon--pink" aria-hidden="true">
              <MicIcon size={20} />
            </span>
            <span>
              {good} good answers · Goal was {DAILY_GOAL}
            </span>
            <span className="result-list__ok" aria-hidden="true">
              <Check />
            </span>
          </li>
          <li>
            <span className="result-list__icon result-list__icon--sun" aria-hidden="true">
              <Flame size={20} />
            </span>
            <span>
              {streak}-day speaking streak
            </span>
            <span className="result-list__ok" aria-hidden="true">
              <Check />
            </span>
          </li>
          <li>
            <span className="result-list__icon result-list__icon--green" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#ffc62e" />
                <circle cx="12" cy="12" r="6.5" fill="none" stroke="#e59a00" strokeWidth="2" />
              </svg>
            </span>
            <span>+30 coins earned</span>
            <span className="result-list__ok" aria-hidden="true">
              <Check />
            </span>
          </li>
        </ul>

        <button type="button" className="btn btn--go btn--big btn--split" onClick={onContinue} autoFocus>
          Continue <Chevron />
        </button>
        <Bushes />
      </div>
    </div>
  );
}
