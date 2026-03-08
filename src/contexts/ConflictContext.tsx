import { createContext, useContext, useState, ReactNode } from 'react';
import { ConflictZone, CONFLICT_ZONES, DEFAULT_CONFLICT } from '@/lib/conflicts';

interface ConflictContextType {
  selectedConflict: ConflictZone;
  setSelectedConflict: (conflict: ConflictZone) => void;
  allConflicts: ConflictZone[];
}

const ConflictContext = createContext<ConflictContextType>({
  selectedConflict: DEFAULT_CONFLICT,
  setSelectedConflict: () => {},
  allConflicts: CONFLICT_ZONES,
});

export function ConflictProvider({ children }: { children: ReactNode }) {
  const [selectedConflict, setSelectedConflict] = useState<ConflictZone>(DEFAULT_CONFLICT);

  return (
    <ConflictContext.Provider value={{ selectedConflict, setSelectedConflict, allConflicts: CONFLICT_ZONES }}>
      {children}
    </ConflictContext.Provider>
  );
}

export const useConflict = () => useContext(ConflictContext);
