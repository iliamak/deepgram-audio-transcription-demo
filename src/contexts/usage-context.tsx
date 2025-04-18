import React, { createContext, useState, useContext, useEffect } from 'react';

// Максимальное время использования (10 минут в секундах)
const MAX_USAGE_TIME = 10 * 60;

type UsageContextType = {
  usedTime: number;
  remainingTime: number;
  addUsage: (seconds: number) => boolean;
  resetUsage: () => void;
  hasReachedLimit: boolean;
};

const UsageContext = createContext<UsageContextType | undefined>(undefined);

export function UsageProvider({ children }: { children: React.ReactNode }) {
  const [usedTime, setUsedTime] = useState<number>(() => {
    const saved = localStorage.getItem('transcription_used_time');
    return saved ? parseInt(saved, 10) : 0;
  });

  const remainingTime = MAX_USAGE_TIME - usedTime;
  const hasReachedLimit = remainingTime <= 0;

  // Сохраняем использованное время в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('transcription_used_time', usedTime.toString());
  }, [usedTime]);

  // Функция для добавления использованного времени
  const addUsage = (seconds: number): boolean => {
    if (remainingTime <= 0) return false;
    
    // Если добавляемое время меньше оставшегося, используем его полностью
    // В противном случае используем только оставшееся время
    const actualUsage = Math.min(seconds, remainingTime);
    setUsedTime(prevTime => prevTime + actualUsage);
    
    return true;
  };

  // Функция для сброса счетчика использования (для тестирования)
  const resetUsage = () => {
    setUsedTime(0);
  };

  const value = {
    usedTime,
    remainingTime,
    addUsage,
    resetUsage,
    hasReachedLimit
  };

  return <UsageContext.Provider value={value}>{children}</UsageContext.Provider>;
}

export function useUsage() {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error('useUsage must be used within a UsageProvider');
  }
  return context;
}
