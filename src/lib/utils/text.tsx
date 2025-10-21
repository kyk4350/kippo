import React from 'react';

export const highlightText = (text: string): React.ReactNode[] => {
  const hashtagRegex = /#[\w가-힣]+/g;
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // 해시태그와 URL 찾기
  const hashtagMatches = Array.from(text.matchAll(hashtagRegex)).map(m => ({
    ...m,
    type: 'hashtag' as const
  }));
  const urlMatches = Array.from(text.matchAll(urlRegex)).map(m => ({
    ...m,
    type: 'url' as const
  }));

  const matches = [...hashtagMatches, ...urlMatches].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  matches.forEach((match, i) => {
    const matchIndex = match.index ?? 0;

    // 일반 텍스트
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }

    // 하이라이트된 텍스트
    if (match.type === 'hashtag') {
      parts.push(
        <span key={i} className="text-blue-500 hover:underline cursor-pointer">
          {match[0]}
        </span>
      );
    } else {
      parts.push(
        <a
          key={i}
          href={match[0]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {match[0]}
        </a>
      );
    }

    lastIndex = matchIndex + match[0].length;
  });

  // 남은 텍스트
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};
