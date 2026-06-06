import { cn } from '@/lib/utils';

interface TabItem {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-white/10">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors relative',
            activeKey === tab.key
              ? 'text-cyan-400'
              : 'text-gray-400 hover:text-white'
          )}
        >
          {tab.label}
          {activeKey === tab.key && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
          )}
        </button>
      ))}
    </div>
  );
}
