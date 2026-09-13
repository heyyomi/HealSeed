/**
 * 미래지향적이고 활기찬 건강 응원 문구 컬렉션
 * 영양교사 훈화 느낌을 배제하고, 주체적이고 긍정적인 자기돌봄과 미래 성장을 응원하는 문구들로 구성
 */
export const HEALTH_FUTURE_QUOTES: string[] = [
  '오늘의 작은 선택이 더 빛나는 내일을 만들어요 ✨',
  '나를 아끼는 에너지가 오늘도 차곡차곡 자라나요 🌱',
  '더 건강하고 활기찬 나를 향한 기분 좋은 발걸음 🚀',
  '오늘 하루, 내 몸과 마음에 긍정적인 힘을 가득 채워봐요 💫',
  '작은 실천들이 모여 멋진 내일의 가능성이 피어나요 🌸',
  '나만의 속도로 만들어가는 건강하고 밝은 미래 🌿',
  '오늘 심은 건강한 씨앗이 내일의 활력이 될 거예요 ☀️',
  '몸도 마음도 가볍게, 빛나는 하루를 시작해볼까요? 🌈',
  '스스로를 소중히 돌보는 힘, 오늘 더 단단해지고 있어요 💎',
  '내 안의 맑은 활력을 깨우는 기분 좋은 하루 되세요 ⚡',
  '건강한 하루가 모여 내가 꿈꾸는 미래를 열어갑니다 🌟',
  '오늘 나를 향한 다정한 관심이 내일의 활기가 돼요 🍀',
  '어제보다 한 걸음 더 생기 넘치는 오늘을 응원해요 🏃',
  '지치지 않는 내일을 위해, 오늘 나에게 쉼과 에너지를 선물해요 🎈',
  '내 몸과 마음이 보내는 신호에 귀 기울이며 활기차게 시작해요 🪴',
  '작지만 확실한 건강습관으로 더 단단한 나를 만나요 🎯',
  '오늘 하루도 나답게, 건강한 리듬으로 힘차게 나아가요 🏄',
  '매일 조금씩 자라나는 나의 건강한 라이프스타일 🌼',
];

const LAST_QUOTE_KEY = 'healseed_last_quote_index';

/**
 * 접속할 때마다 이전과 다른 새로운 문구를 랜덤 반환
 */
export const getRandomHealthQuote = (): string => {
  const lastIndexStr = sessionStorage.getItem(LAST_QUOTE_KEY);
  const lastIndex = lastIndexStr !== null ? parseInt(lastIndexStr, 10) : -1;

  let newIndex = Math.floor(Math.random() * HEALTH_FUTURE_QUOTES.length);
  if (HEALTH_FUTURE_QUOTES.length > 1 && newIndex === lastIndex) {
    newIndex = (newIndex + 1) % HEALTH_FUTURE_QUOTES.length;
  }

  sessionStorage.setItem(LAST_QUOTE_KEY, newIndex.toString());
  return HEALTH_FUTURE_QUOTES[newIndex];
};
