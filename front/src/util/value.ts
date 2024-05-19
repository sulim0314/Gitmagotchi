import { ICharacter, IMotion, InteractType } from "@/models";

export const expHandler = (exp: number) => {
  const LEVEL_EXP = [0, 10, 25, 45, 65, 90, 120, 150, 190, 230];
  let level = 0;
  let maxExp = 0;
  let curExp = 0;

  if (exp < LEVEL_EXP[1]) {
    level = 1;
    maxExp = LEVEL_EXP[1] - LEVEL_EXP[0];
    curExp = exp - LEVEL_EXP[0];
  } else if (exp < LEVEL_EXP[2]) {
    level = 2;
    maxExp = LEVEL_EXP[2] - LEVEL_EXP[1];
    curExp = exp - LEVEL_EXP[1];
  } else if (exp < LEVEL_EXP[3]) {
    level = 3;
    maxExp = LEVEL_EXP[3] - LEVEL_EXP[2];
    curExp = exp - LEVEL_EXP[2];
  } else if (exp < LEVEL_EXP[4]) {
    level = 4;
    maxExp = LEVEL_EXP[4] - LEVEL_EXP[3];
    curExp = exp - LEVEL_EXP[3];
  } else if (exp < LEVEL_EXP[5]) {
    level = 5;
    maxExp = LEVEL_EXP[5] - LEVEL_EXP[4];
    curExp = exp - LEVEL_EXP[4];
  } else if (exp < LEVEL_EXP[6]) {
    level = 6;
    maxExp = LEVEL_EXP[6] - LEVEL_EXP[5];
    curExp = exp - LEVEL_EXP[5];
  } else if (exp < LEVEL_EXP[7]) {
    level = 7;
    maxExp = LEVEL_EXP[7] - LEVEL_EXP[6];
    curExp = exp - LEVEL_EXP[6];
  } else if (exp < LEVEL_EXP[8]) {
    level = 8;
    maxExp = LEVEL_EXP[8] - LEVEL_EXP[7];
    curExp = exp - LEVEL_EXP[7];
  } else if (exp < LEVEL_EXP[9]) {
    level = 9;
    maxExp = LEVEL_EXP[9] - LEVEL_EXP[8];
    curExp = exp - LEVEL_EXP[8];
  } else {
    level = 10;
    maxExp = 200;
    curExp = 200;
  }

  return {
    level,
    curExp,
    maxExp,
    percentage: ((100 * curExp) / maxExp).toFixed(2),
  };
};

export const statusHandler = (characterData: ICharacter | null) => {
  if (!characterData)
    return { fullnessMax: 0, intimacyMax: 0, cleannessMax: 0 };
  const level = expHandler(characterData.exp).level;
  const intimacyLevel = characterData.stat.intimacyStat;
  let fullnessMax = 0;
  let intimacyMax = 0;
  let cleannessMax = 0;

  if (level === 1) {
    fullnessMax = 100;
    intimacyMax = 100;
    cleannessMax = 100;
  } else if (level === 2) {
    fullnessMax = 100;
    intimacyMax = 100;
    cleannessMax = 100;
  } else if (level === 3) {
    fullnessMax = 110;
    intimacyMax = 110;
    cleannessMax = 110;
  } else if (level === 4) {
    fullnessMax = 110;
    intimacyMax = 110;
    cleannessMax = 110;
  } else if (level === 5) {
    fullnessMax = 120;
    intimacyMax = 120;
    cleannessMax = 120;
  } else if (level === 6) {
    fullnessMax = 130;
    intimacyMax = 130;
    cleannessMax = 130;
  } else if (level === 7) {
    fullnessMax = 150;
    intimacyMax = 150;
    cleannessMax = 150;
  } else if (level === 8) {
    fullnessMax = 170;
    intimacyMax = 170;
    cleannessMax = 170;
  } else if (level === 9) {
    fullnessMax = 200;
    intimacyMax = 200;
    cleannessMax = 200;
  } else if (level === 10) {
    fullnessMax = 200;
    intimacyMax = 200;
    cleannessMax = 200;
  }

  if (intimacyLevel === 1) {
    intimacyMax += 0;
  } else if (intimacyLevel === 2) {
    intimacyMax += 5;
  } else if (intimacyLevel === 3) {
    intimacyMax += 10;
  } else if (intimacyLevel === 4) {
    intimacyMax += 15;
  } else if (intimacyLevel === 5) {
    intimacyMax += 20;
  } else if (intimacyLevel === 6) {
    intimacyMax += 25;
  } else if (intimacyLevel === 7) {
    intimacyMax += 30;
  } else if (intimacyLevel === 8) {
    intimacyMax += 40;
  } else if (intimacyLevel === 9) {
    intimacyMax += 50;
  } else if (intimacyLevel === 10) {
    intimacyMax += 70;
  }
  return { fullnessMax, intimacyMax, cleannessMax };
};

export const interactionMessage = (type: InteractType, exp: number) => {
  if (type === "SHOWER") {
    return `사워를 진행해 청결도가 상승했습니다. (EXP +${exp})`;
  } else if (type === "WALK") {
    return `산책를 진행해 친밀도가 상승했습니다. (EXP +${exp})`;
  } else if (type === "EAT") {
    return `밥을 먹어 포만감이 상승했습니다. (EXP +${exp})`;
  } else if (type === "CHAT_POSITIVE") {
    return `대화을 통해 기분이 좋아져 친밀도가 상승했습니다. (EXP +${exp})`;
  } else if (type === "CHAT_NEGATIVE") {
    return `대화을 통해 기분이 안좋아져 친밀도가 하락했습니다`;
  }
  return "";
};

export const validMotionData = (motionData: IMotion) => {
  if (!motionData) return false;
  if (
    motionData.motion.length > 0 &&
    motionData.default &&
    motionData.hello &&
    motionData.meal &&
    motionData.walk &&
    motionData.shower
  ) {
    return true;
  } else {
    return false;
  }
};
