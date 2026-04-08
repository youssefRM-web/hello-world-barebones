import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Activity, Users, AlertTriangle, CheckCircle, Clock, Zap, Thermometer, Wifi, Printer, Menu, Search, User, Calendar, Plus, Filter, MoreHorizontal, FileText, BarChart3, QrCode, Building, HelpCircle, DoorClosed, TrendingDown, LayoutDashboard, Lightbulb, Image } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/language-provider';
import { useTranslation } from '@/lib/translations';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { GradualSpacing } from '@/components/ui/gradual-spacing';
import { useAuthModal } from '@/components/auth-modal-provider';
import memoji05 from '@/assets/homepage/avatar-mike.webp';
import memoji07 from '@/assets/homepage/avatar-david.webp';
import memoji08 from '@/assets/homepage/avatar-sarah.webp';
import memoji16 from '@/assets/homepage/avatar-alex.webp';

// Demo Cursor Component
interface DemoCursorProps {
  x: number;
  y: number;
  name: string;
  color: string;
  visible: boolean;
}

function DemoCursor({ x, y, name, color, visible }: DemoCursorProps) {
  if (!visible) return null;
  
  return (
    <div 
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-2px, -2px)',
        pointerEvents: 'none',
        zIndex: 50,
        transition: 'all 0.3s ease-out'
      }}
      data-testid={`demo-cursor-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Cursor SVG */}
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 20 20" 
        fill="none"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }}
      >
        <path
          d="M4.5 3L4.5 14.5L7.5 11L10.5 11L4.5 3Z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      
      {/* Name label */}
      <div 
        style={{
          position: 'absolute',
          top: '22px',
          left: '12px',
          backgroundColor: color,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {name}
        {/* Arrow pointing to cursor */}
        <div
          style={{
            position: 'absolute',
            top: '-4px',
            left: '8px',
            width: '0',
            height: '0',
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderBottom: `4px solid ${color}`
          }}
        />
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  const { openAuthModal } = useAuthModal();
  const [currentView, setCurrentView] = useState<'dashboard' | 'board' | 'issues'>('issues');
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(true);
  
  // Auto-switch views every 8 seconds (stops when user clicks a button)
  useEffect(() => {
    if (!autoSwitchEnabled) return;
    
    const viewOrder: ('issues' | 'board' | 'dashboard')[] = ['issues', 'board', 'dashboard'];
    const timeoutId = setTimeout(() => {
      setCurrentView(prev => {
        const currentIndex = viewOrder.indexOf(prev);
        const nextIndex = (currentIndex + 1) % viewOrder.length;
        return viewOrder[nextIndex];
      });
    }, 8000);
    
    return () => clearTimeout(timeoutId);
  }, [currentView, autoSwitchEnabled]);
  
  const handleViewClick = (view: 'dashboard' | 'board' | 'issues') => {
    setAutoSwitchEnabled(false);
    setCurrentView(view);
  };
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation(0.2);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Demo cursors state - mobile-friendly initial positions within 520px height
  const [cursors, setCursors] = useState([
    { id: 'visitor-anna', name: t.dashboard.cursors.visitor, x: 80, y: 80, targetX: 80, targetY: 80, color: '#3B82F6', visible: true, moveInterval: 2500, speed: 0.08 },
    { id: 'technician-max', name: t.dashboard.cursors.technician, x: 600, y: 150, targetX: 600, targetY: 150, color: '#10B981', visible: true, moveInterval: 3200, speed: 0.10 },
    { id: 'facility-manager', name: t.dashboard.cursors.manager, x: 350, y: 400, targetX: 350, targetY: 400, color: '#F59E0B', visible: true, moveInterval: 4000, speed: 0.12 }
  ]);

  // Update cursor names when language changes
  useEffect(() => {
    setCursors(prev => prev.map(cursor => ({
      ...cursor,
      name: cursor.id === 'visitor-anna' ? t.dashboard.cursors.visitor :
            cursor.id === 'technician-max' ? t.dashboard.cursors.technician :
            cursor.id === 'facility-manager' ? t.dashboard.cursors.manager :
            cursor.name
    })));
  }, [language, t.dashboard.cursors]);
  
  // Animate demo cursors asynchronously with mobile-aware bounds
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    
    // Responsive bounds based on screen size - constrain to 520px mobile height
    // Keep cursors more centered on mobile to prevent overflow
    // Desktop: larger movement range for more dynamic feel
    const maxX = isMobile ? 200 : 1000;
    const maxY = isMobile ? 400 : 550;
    const minX = isMobile ? 40 : 100;
    const minY = isMobile ? 60 : 80;
    const moveRangeX = isMobile ? 60 : 500;
    const moveRangeY = isMobile ? 100 : 350;
    
    // Create individual movement intervals for each cursor
    cursors.forEach((cursor, index) => {
      const moveInterval = setInterval(() => {
        setCursors(prev => prev.map(c => {
          if (c.id !== cursor.id) return c;
          
          // Generate new target position within mockup bounds for this specific cursor
          const newTargetX = Math.max(minX, Math.min(maxX, 
            c.targetX + (Math.random() - 0.5) * moveRangeX));
          const newTargetY = Math.max(minY, Math.min(maxY, 
            c.targetY + (Math.random() - 0.5) * moveRangeY));

          return {
            ...c,
            targetX: newTargetX,
            targetY: newTargetY,
          };
        }));
      }, cursor.moveInterval);
      
      intervals.push(moveInterval);
    });

    // Smooth movement animation for all cursors
    const animationInterval = setInterval(() => {
      setCursors(prev => prev.map(cursor => {
        const dx = cursor.targetX - cursor.x;
        const dy = cursor.targetY - cursor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 2) return cursor;

        const newX = cursor.x + dx * cursor.speed;
        const newY = cursor.y + dy * cursor.speed;

        return {
          ...cursor,
          x: newX,
          y: newY,
        };
      }));
    }, 50);
    
    intervals.push(animationInterval);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [isMobile]);
  return (
    <>
    <section>
      {/* Header area - matches previous section bg */}
      <div className="bg-gray-50 pt-16 sm:pt-20 pb-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center" ref={titleRef as React.RefObject<HTMLDivElement>}>
            <div className="mb-8">
              <GradualSpacing
                text={t.dashboard.title}
                highlightText={t.dashboard.titleHighlight}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900"
                highlightClassName="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent inline-block "
                isVisible={titleVisible}
                duration={0.8}
                delayMultiple={0.06}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Content area with gradient */}
      <div className="dashboard-bg pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* View Toggle */}
          <div className="flex flex-col sm:flex-row justify-center gap-2 mb-8 pt-4 px-4 sm:px-0">
            <Button
              onClick={() => handleViewClick('issues')}
              variant={currentView === 'issues' ? 'default' : 'outline'}
              className={`px-4 sm:px-6 py-2 w-full sm:w-auto ${
                currentView === 'issues' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-muted-foreground border-border hover:bg-gray-50'
              }`}
            >
              {t.dashboard.viewToggle.issues}
            </Button>
            <Button
              onClick={() => handleViewClick('board')}
              variant={currentView === 'board' ? 'default' : 'outline'}
              className={`px-4 sm:px-6 py-2 w-full sm:w-auto ${
                currentView === 'board' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-muted-foreground border-border hover:bg-gray-50'
              }`}
            >
              {t.dashboard.viewToggle.board}
            </Button>
            <Button
              onClick={() => handleViewClick('dashboard')}
              variant={currentView === 'dashboard' ? 'default' : 'outline'}
              className={`px-4 sm:px-6 py-2 w-full sm:w-auto ${
                currentView === 'dashboard' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-muted-foreground border-border hover:bg-gray-50'
              }`}
            >
              {t.dashboard.viewToggle.analytics}
            </Button>
          </div>

        <div className="relative max-w-6xl mx-auto overflow-hidden">
          <div className="glass-card p-4 rounded-2xl relative overflow-hidden">
            {/* Demo multiplayer cursors - positioned over the entire mockup area */}
            <div className="absolute inset-0 pointer-events-none z-40">
              {cursors.map(cursor => (
                  <DemoCursor
                    key={cursor.id}
                    x={cursor.x}
                    y={cursor.y}
                    name={cursor.name}
                    color={cursor.color}
                    visible={cursor.visible}
                  />
                ))}
            </div>
            
            {currentView === 'dashboard' ? (
              <div className="bg-slate-900 rounded-xl w-full relative overflow-hidden">
              
              {/* Desktop Layout */}
              <div className="hidden lg:flex h-[700px]">
                {/* Desktop Sidebar */}
                <div className="w-64 bg-slate-800 border-r border-slate-700 flex-shrink-0">
                  {/* Building Info */}
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center">
                        <span className="text-xs text-white font-bold">H</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Hansaplatz Building</p>
                        <p className="text-gray-400 text-xs">New Corporation</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu */}
                  <div className="p-4 flex-1 pt-2">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">{t.dashboard.sidebar.menu}</p>
                    <nav className="space-y-1">
                      <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">{t.dashboard.sidebar.problems}</span>
                        <div className="ml-auto w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">6</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{t.dashboard.sidebar.board}</span>
                      </div>
                      <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">{t.dashboard.sidebar.tasks}</span>
                      </div>
                      <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                        <DoorClosed className="w-4 h-4" />
                        <span className="text-sm">{t.dashboard.sidebar.rooms}</span>
                      </div>
                      <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                        <Printer className="w-4 h-4" />
                        <span className="text-sm">{t.dashboard.sidebar.assets}</span>
                      </div>
                      <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{t.dashboard.sidebar.documents}</span>
                      </div>
                      <div className="flex items-center space-x-3 px-3 py-2 text-blue-400 bg-slate-700 rounded-lg cursor-pointer">
                        <BarChart3 className="w-4 h-4" />
                        <span className="text-sm">{t.dashboard.sidebar.insights}</span>
                      </div>
                      <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                        <QrCode className="w-4 h-4" />
                        <span className="text-sm">{t.dashboard.sidebar.qrCodes}</span>
                      </div>
                    </nav>
                  </div>
                  
                  {/* Bottom Menu Section */}
                  <div className="p-4 border-t border-slate-700">
                    <nav className="space-y-1">
                      <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                        <Building className="w-4 h-4" />
                        <span className="text-sm">{t.dashboard.sidebar.organization}</span>
                      </div>
                      <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-sm">{t.dashboard.sidebar.helpSupport}</span>
                      </div>
                    </nav>
                  </div>
                </div>
                
                {/* Desktop Main Content */}
                <div className="flex-1 bg-slate-900">
                  {/* Header */}
                  <div className="border-b border-slate-700 p-6">
                    <div className="flex items-center justify-between">
                      <h1 className="text-white text-2xl font-semibold">{t.dashboard.content.insightsTitle}</h1>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder={t.dashboard.content.board.searchPlaceholder}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm w-64 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          <img 
                            src={memoji05} 
                            alt="Benutzer-Avatar" 
                            className="w-9 h-9 object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex space-x-8 mt-4">
                      <button className="text-blue-400 border-b-2 border-blue-400 pb-2 text-sm">{t.dashboard.content.tabs.overview}</button>
                      <button className="text-gray-400 pb-2 text-sm">{t.dashboard.content.tabs.areas}</button>
                      <button className="text-gray-400 pb-2 text-sm">{t.dashboard.content.tabs.assets}</button>
                      <button className="text-gray-400 pb-2 text-sm">{t.dashboard.content.tabs.users}</button>
                      <button className="text-gray-400 pb-2 text-sm">{t.dashboard.content.tabs.categories}</button>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-5 gap-4 mb-8">
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <p className="text-gray-400 text-sm mb-1">{t.dashboard.content.stats.toDo}</p>
                        <p className="text-white text-2xl font-bold">10</p>
                        <p className="text-green-400 text-xs">↗ {t.dashboard.content.stats.vsLastMonth}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <p className="text-gray-400 text-sm mb-1">{t.dashboard.content.stats.inProgress}</p>
                        <p className="text-white text-2xl font-bold">5</p>
                        <p className="text-green-400 text-xs">↗ {t.dashboard.content.stats.vsLastMonth}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <p className="text-gray-400 text-sm mb-1">{t.dashboard.content.stats.completed}</p>
                        <p className="text-white text-2xl font-bold">317</p>
                        <p className="text-green-400 text-xs">↗ {t.dashboard.content.stats.vsLastMonth}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <p className="text-gray-400 text-sm mb-1">{t.dashboard.content.stats.dueToday}</p>
                        <p className="text-white text-2xl font-bold">1</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <p className="text-gray-400 text-sm mb-1">{t.dashboard.content.stats.overdue}</p>
                        <p className="text-white text-2xl font-bold">3</p>
                      </div>
                    </div>
                    
                    {/* Charts Row */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      {/* Donut Chart */}
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-white font-semibold mb-4">{t.dashboard.content.charts.openTasksByPriority}</h3>
                        <div className="flex items-center justify-center">
                          <svg width="120" height="120" className="transform -rotate-90">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray="110 314" strokeDashoffset="0" />
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="130 314" strokeDashoffset="-110" />
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="74 314" strokeDashoffset="-240" />
                          </svg>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                          <div className="text-center">
                            <p className="text-gray-400">{t.dashboard.content.stats.lastWeek}</p>
                            <p className="text-white font-bold text-lg">2</p>
                            <p className="text-gray-400">↗ 100%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-400">{t.dashboard.content.stats.lastWeek}</p>
                            <p className="text-white font-bold text-lg">7</p>
                            <p className="text-gray-400">↗ 600%</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bar Chart */}
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-white font-semibold mb-4">{t.dashboard.content.charts.highPriorityTicketsByMember}</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Niklas Baron</span>
                            <div className="flex-1 mx-3 bg-slate-700 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Sami Magri</span>
                            <div className="flex-1 mx-3 bg-slate-700 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Max Muster</span>
                            <div className="flex-1 mx-3 bg-slate-700 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm">Elly Müller</span>
                            <div className="flex-1 mx-3 bg-slate-700 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{width: '35%'}}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tables Row */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Activity Table */}
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-white font-semibold mb-4">{t.dashboard.content.charts.activityByUser}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Niklas Baron</span>
                            <div className="flex-1 mx-3 bg-slate-700 rounded-full h-1">
                              <div className="bg-blue-500 h-1 rounded-full" style={{width: '70%'}}></div>
                            </div>
                            <span className="text-gray-400">56</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Sami Magri</span>
                            <div className="flex-1 mx-3 bg-slate-700 rounded-full h-1">
                              <div className="bg-blue-500 h-1 rounded-full" style={{width: '30%'}}></div>
                            </div>
                            <span className="text-gray-400">24</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Laura Moreno</span>
                            <div className="flex-1 mx-3 bg-slate-700 rounded-full h-1">
                              <div className="bg-blue-500 h-1 rounded-full" style={{width: '25%'}}></div>
                            </div>
                            <span className="text-gray-400">20</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Category Table */}
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-white font-semibold mb-4">{t.dashboard.content.charts.tasksByCategory}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Elektro</span>
                            <div className="flex-1 mx-3 bg-slate-700 rounded-full h-1">
                              <div className="bg-blue-500 h-1 rounded-full" style={{width: '80%'}}></div>
                            </div>
                            <span className="text-gray-400">56</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">Inspektion</span>
                            <div className="flex-1 mx-3 bg-slate-700 rounded-full h-1">
                              <div className="bg-blue-500 h-1 rounded-full" style={{width: '35%'}}></div>
                            </div>
                            <span className="text-gray-400">24</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-300">{t.dashboard.content.categories.plumbing}</span>
                            <div className="flex-1 mx-3 bg-slate-700 rounded-full h-1">
                              <div className="bg-blue-500 h-1 rounded-full" style={{width: '28%'}}></div>
                            </div>
                            <span className="text-gray-400">20</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tablet Layout */}
              <div className="hidden md:block lg:hidden">
                <div className="p-4 h-[600px]">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                    <div className="flex items-center space-x-3">
                      <Menu className="w-6 h-6 text-gray-400" />
                      <h1 className="text-white text-xl font-semibold">{t.dashboard.content.insightsTitle}</h1>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Search className="w-5 h-5 text-gray-400" />
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">N</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards - 2 rows */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-gray-400 text-sm mb-1">{t.dashboard.content.stats.toDo}</p>
                      <p className="text-white text-xl font-bold">10</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-gray-400 text-sm mb-1">{t.dashboard.content.stats.inProgress}</p>
                      <p className="text-white text-xl font-bold">5</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-gray-400 text-sm mb-1">{t.dashboard.content.stats.completed}</p>
                      <p className="text-white text-xl font-bold">317</p>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <h3 className="text-white font-semibold mb-3 text-sm">{t.dashboard.content.charts.tasksByPriority}</h3>
                      <div className="flex items-center justify-center">
                        <svg width="80" height="80" className="transform -rotate-90">
                          <circle cx="40" cy="40" r="30" fill="none" stroke="#ef4444" strokeWidth="12" strokeDasharray="56 188" strokeDashoffset="0" />
                          <circle cx="40" cy="40" r="30" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="47 188" strokeDashoffset="-56" />
                          <circle cx="40" cy="40" r="30" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="26 188" strokeDashoffset="-103" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <h3 className="text-white font-semibold mb-3 text-sm">Top-Mitarbeiter</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-xs">N. Baron</span>
                          <div className="flex-1 mx-2 bg-slate-700 rounded-full h-1">
                            <div className="bg-blue-500 h-1 rounded-full" style={{width: '85%'}}></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-xs">S. Magri</span>
                          <div className="flex-1 mx-2 bg-slate-700 rounded-full h-1">
                            <div className="bg-blue-500 h-1 rounded-full" style={{width: '65%'}}></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300 text-xs">M. Muster</span>
                          <div className="flex-1 mx-2 bg-slate-700 rounded-full h-1">
                            <div className="bg-blue-500 h-1 rounded-full" style={{width: '45%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-white font-semibold mb-3 text-sm">Recent Activity</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-xs">Elektro</span>
                        <span className="text-gray-400 text-xs">56 tasks</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-xs">Inspektion</span>
                        <span className="text-gray-400 text-xs">24 tasks</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-xs">{t.dashboard.content.categories.plumbing}</span>
                        <span className="text-gray-400 text-xs">20 tasks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="block md:hidden h-[520px] flex flex-col">
                <div className="flex-shrink-0 p-4 pb-0">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                    <div className="flex items-center space-x-3">
                      <Menu className="w-6 h-6 text-gray-400" />
                      <h1 className="text-white text-xl font-semibold">Dashboard</h1>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      <img 
                        src={memoji07} 
                        alt="Benutzer-Avatar" 
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 pt-0">
                  {/* Mobile Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <p className="text-gray-400 text-sm mb-2">{t.dashboard.content.stats.toDo}</p>
                      <p className="text-white text-2xl font-bold mb-1">10</p>
                      <p className="text-green-400 text-xs">↗ 2 gegenüber dem Vormonat</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <p className="text-gray-400 text-sm mb-2">Done</p>
                      <p className="text-white text-2xl font-bold mb-1">317</p>
                      <p className="text-green-400 text-xs">↗ 2 gegenüber dem Vormonat</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <p className="text-gray-400 text-sm mb-2">{t.dashboard.content.stats.inProgress}</p>
                      <p className="text-white text-2xl font-bold mb-1">5</p>
                      <p className="text-green-400 text-xs">↗ 2 gegenüber dem Vormonat</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <p className="text-gray-400 text-sm mb-2">Overdue</p>
                      <p className="text-white text-2xl font-bold mb-1">3</p>
                      <p className="text-red-400 text-xs">Needs attention</p>
                    </div>
                  </div>

                  {/* Mobile Chart */}
                  <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700 mb-6">
                    <h3 className="text-white font-semibold mb-4 text-base">Task Priority Distribution</h3>
                    <div className="flex items-center justify-center mb-4">
                      <svg width="140" height="140" className="transform -rotate-90">
                        <circle cx="70" cy="70" r="50" fill="none" stroke="#ef4444" strokeWidth="16" strokeDasharray="94 314" strokeDashoffset="0" />
                        <circle cx="70" cy="70" r="50" fill="none" stroke="#f59e0b" strokeWidth="16" strokeDasharray="78 314" strokeDashoffset="-94" />
                        <circle cx="70" cy="70" r="50" fill="none" stroke="#3b82f6" strokeWidth="16" strokeDasharray="44 314" strokeDashoffset="-172" />
                      </svg>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
                        <p className="text-gray-300 text-sm font-medium">High</p>
                        <p className="text-gray-400 text-xs">30 tasks</p>
                      </div>
                      <div>
                        <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                        <p className="text-gray-300 text-sm font-medium">Medium</p>
                        <p className="text-gray-400 text-xs">25 tasks</p>
                      </div>
                      <div>
                        <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
                        <p className="text-gray-300 text-sm font-medium">Low</p>
                        <p className="text-gray-400 text-xs">14 tasks</p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Recent Activity */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 mb-6">
                    <h3 className="text-white font-semibold mb-4 text-base">Top Categories</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Elektro</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-700 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '80%'}}></div>
                          </div>
                          <span className="text-blue-400 text-sm font-semibold">56</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Inspektion</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-700 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '43%'}}></div>
                          </div>
                          <span className="text-blue-400 text-sm font-semibold">24</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{t.dashboard.content.categories.plumbing}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-slate-700 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '36%'}}></div>
                          </div>
                          <span className="text-blue-400 text-sm font-semibold">20</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Team Performance */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-white font-semibold mb-4 text-base">Team Performance</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                            <img 
                              src={memoji05} 
                              alt="Niklas Baron avatar" 
                              className="w-7 h-7 object-cover"
                            />
                          </div>
                          <span className="text-gray-300 text-sm">Niklas Baron</span>
                        </div>
                        <span className="text-blue-400 text-sm font-semibold">85%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden">
                            <img 
                              src={memoji08} 
                              alt="Sami Magri avatar" 
                              className="w-7 h-7 object-cover"
                            />
                          </div>
                          <span className="text-gray-300 text-sm">Sami Magri</span>
                        </div>
                        <span className="text-blue-400 text-sm font-semibold">72%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                            <img 
                              src={memoji07} 
                              alt="Max Muster avatar" 
                              className="w-7 h-7 object-cover"
                            />
                          </div>
                          <span className="text-gray-300 text-sm">Max Muster</span>
                        </div>
                        <span className="text-blue-400 text-sm font-semibold">68%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ) : currentView === 'board' ? (
              // Board View Mockup
              <div className="bg-slate-900 rounded-xl w-full relative overflow-hidden">
                {/* Desktop Board Layout */}
                <div className="hidden lg:flex h-[700px]">
                  {/* Sidebar */}
                  <div className="w-64 bg-slate-800 border-r border-slate-700 flex-shrink-0">
                    {/* Building Info */}
                    <div className="p-4 border-b border-slate-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center">
                          <span className="text-xs text-white font-bold">H</span>
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">Hansaplatz Building</div>
                          <div className="text-gray-400 text-xs">Tech Company</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu */}
                    <div className="p-4 flex-1 pt-2">
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">{t.dashboard.sidebar.menu}</p>
                      <nav className="space-y-1">
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.problems}</span>
                          <div className="ml-auto w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">6</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-blue-400 bg-slate-700 rounded-lg cursor-pointer">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">Board</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.tasks}</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <DoorClosed className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.rooms}</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <Printer className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.assets}</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.documents}</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <BarChart3 className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.insights}</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <QrCode className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.qrCodes}</span>
                        </div>
                      </nav>
                    </div>
                    
                    {/* Bottom Menu Section */}
                    <div className="p-4 border-t border-slate-700">
                      <nav className="space-y-1">
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <Building className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.organization}</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <HelpCircle className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.helpSupport}</span>
                        </div>
                      </nav>
                    </div>
                  </div>
                  
                  {/* Main Board Content */}
                  <div className="flex-1 bg-slate-900">
                    {/* Header */}
                    <div className="border-b border-slate-700 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <h1 className="text-white text-2xl font-semibold">{t.dashboard.content.board.title}</h1>
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">{t.dashboard.content.board.tabs.allTasks}</button>
                            <button className="px-3 py-1 text-gray-300 text-sm rounded hover:bg-slate-700">{t.dashboard.content.board.tabs.myTasks}</button>
                            <button className="px-3 py-1 text-gray-300 text-sm rounded hover:bg-slate-700">{t.dashboard.content.board.tabs.highPrio}</button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input 
                              type="text" 
                              placeholder={t.dashboard.content.board.searchPlaceholder} 
                              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm w-64"
                            />
                          </div>
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white/20">
                            <img 
                              src={memoji05} 
                              alt="Benutzer-Avatar" 
                              className="w-9 h-9 object-cover rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Kanban Board */}
                    <div className="flex-1 p-6 overflow-x-auto">
                      <div className="flex space-x-6 min-w-max">
                        {/* TO DO Column */}
                        <div className="w-80 bg-slate-800/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-white font-semibold">{t.dashboard.content.board.columns.toDo}</h3>
                              <span className="bg-slate-600 text-white text-xs px-2 py-1 rounded">3</span>
                            </div>
                          </div>
                          
                          {/* Task Cards */}
                          <div className="space-y-3">
                            {/* Task 1 - HVAC Issue */}
                            <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-white text-sm font-medium">{language === 'de' ? 'Nordturm-Gebäude' : 'North Tower Building'}</span>
                                <span className="text-gray-400 text-xs">{t.dashboard.content.board.floor} 15</span>
                              </div>
                              <p className="text-gray-300 text-sm mb-3">{language === 'de' ? 'Klimaanlage macht laute Geräusche und kühlt nicht richtig in den Konferenzräumen.' : 'Air conditioning unit making loud noises and not cooling properly in conference rooms.'}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">{language === 'de' ? 'Hoch' : 'High'}</span>
                                  <span className="text-blue-400 text-xs">{language === 'de' ? 'HLK' : 'HVAC'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-400 text-xs">18.06.2025</span>
                                  <div className="w-6 h-6 rounded-full bg-blue-100 overflow-hidden">
                                    <img src={memoji05} alt="Avatar" className="w-full h-full object-cover" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Task 2 - Water Damage */}
                            <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-white text-sm font-medium">{language === 'de' ? 'Zentrales Bürogebäude' : 'Central Office Building'}</span>
                                <span className="text-gray-400 text-xs">{t.dashboard.content.board.basement}</span>
                              </div>
                              <p className="text-gray-300 text-sm mb-3">{language === 'de' ? 'Wasserleck in der Nähe der Schalttafel entdeckt, verursacht Sicherheitsbedenken und potenzielle Schäden.' : 'Water leak detected near electrical panel causing safety concerns and potential damage.'}</p>
                              
                              {/* Image placeholders */}
                              <div className="flex space-x-2 mb-3">
                                <div className="w-12 h-8 bg-slate-600 border border-slate-500 rounded flex items-center justify-center">
                                  <div className="w-4 h-3 bg-slate-500 rounded-sm"></div>
                                </div>
                                <div className="w-12 h-8 bg-slate-600 border border-slate-500 rounded flex items-center justify-center">
                                  <div className="w-4 h-3 bg-slate-500 rounded-sm"></div>
                                </div>
                                <div className="w-12 h-8 bg-slate-600 border border-slate-500 rounded flex items-center justify-center">
                                  <div className="w-4 h-3 bg-slate-500 rounded-sm"></div>
                                </div>
                                <span className="text-gray-400 text-xs self-center">+2</span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">{language === 'de' ? 'Hoch' : 'High'}</span>
                                  <span className="text-blue-400 text-xs">{t.dashboard.content.categories.plumbing}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-400 text-xs">17.06.2025</span>
                                  <div className="w-6 h-6 rounded-full bg-blue-100 overflow-hidden">
                                    <img src={memoji07} alt="Avatar" className="w-full h-full object-cover" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Task 3 - Security System */}
                            <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-white text-sm font-medium">{language === 'de' ? 'Haupteingang' : 'Main Entrance'}</span>
                                <span className="text-gray-400 text-xs">{t.dashboard.content.board.lobby}</span>
                              </div>
                              <p className="text-gray-300 text-sm mb-3">{language === 'de' ? 'Kartenleser defekt, Mitarbeiter können das Gebäude nicht betreten.' : 'Access card reader malfunctioning, employees unable to enter building.'}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">{language === 'de' ? 'Mittel' : 'Medium'}</span>
                                  <span className="text-blue-400 text-xs">{language === 'de' ? 'Sicherheit' : 'Security'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-400 text-xs">19.06.2025</span>
                                  <div className="w-6 h-6 rounded-full bg-blue-100 overflow-hidden">
                                    <img src={memoji05} alt="Avatar" className="w-full h-full object-cover" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Create button */}
                            <button className="w-full p-3 border-2 border-dashed border-slate-600 rounded-lg text-gray-400 text-sm hover:border-slate-500 hover:text-gray-300">
                              + {t.dashboard.content.board.createButton}
                            </button>
                          </div>
                        </div>
                        
                        {/* IN PROGRESS Column */}
                        <div className="w-80 bg-slate-800/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-white font-semibold">{t.dashboard.content.board.columns.inProgress}</h3>
                              <span className="bg-slate-600 text-white text-xs px-2 py-1 rounded">1</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-white text-sm font-medium">{language === 'de' ? 'Westflügel-Gebäude' : 'West Wing Building'}</span>
                                <span className="text-gray-400 text-xs">{t.dashboard.content.board.floor} 8</span>
                              </div>
                              <p className="text-gray-300 text-sm mb-3">{language === 'de' ? 'Installation neuer LED-Leuchten im Großraumbüro zur Verbesserung der Energieeffizienz.' : 'Installing new LED lighting fixtures in open office space to improve energy efficiency.'}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">{language === 'de' ? 'Niedrig' : 'Low'}</span>
                                  <span className="text-blue-400 text-xs">{t.dashboard.content.categories.electrical}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-400 text-xs">20.06.2025</span>
                                  <div className="w-6 h-6 rounded-full bg-blue-100 overflow-hidden">
                                    <img src={memoji07} alt="Avatar" className="w-full h-full object-cover" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <button className="w-full p-3 border-2 border-dashed border-slate-600 rounded-lg text-gray-400 text-sm hover:border-slate-500 hover:text-gray-300">
                              + {t.dashboard.content.board.createButton}
                            </button>
                          </div>
                        </div>
                        
                        {/* DONE Column */}
                        <div className="w-80 bg-slate-800/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-white font-semibold">{t.dashboard.content.board.columns.done}</h3>
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 opacity-80">
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-white text-sm font-medium">{language === 'de' ? 'Ostgebäude' : 'East Building'}</span>
                                <span className="text-gray-400 text-xs">{language === 'de' ? 'Sanitärraum 2A' : 'Restroom 2A'}</span>
                              </div>
                              <p className="text-gray-300 text-sm mb-3">{language === 'de' ? 'Defekten Toilettenpapierspender ersetzt und lockeren Türgriff repariert.' : 'Replaced broken toilet paper dispenser and fixed loose door handle mechanism.'}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">{t.dashboard.content.board.completed}</span>
                                  <span className="text-blue-400 text-xs">{t.dashboard.content.categories.maintenance}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-400 text-xs">15.06.2025</span>
                                  <div className="w-6 h-6 rounded-full bg-blue-100 overflow-hidden">
                                    <img src={memoji08} alt="Avatar" className="w-full h-full object-cover" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 opacity-80">
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-white text-sm font-medium">{language === 'de' ? 'Südliche Parkgarage' : 'South Parking Garage'}</span>
                                <span className="text-gray-400 text-xs">{language === 'de' ? 'Ebene B2' : 'Level B2'}</span>
                              </div>
                              <p className="text-gray-300 text-sm mb-3">{language === 'de' ? 'Monatliche Brandschutzinspektion abgeschlossen, alle Feuerlöscher geprüft und dokumentiert.' : 'Monthly fire safety inspection completed, all extinguishers checked and documented.'}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">{t.dashboard.content.board.completed}</span>
                                  <span className="text-blue-400 text-xs">{language === 'de' ? 'Sicherheit' : 'Safety'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-400 text-xs">14.06.2025</span>
                                  <div className="w-6 h-6 rounded-full bg-blue-100 overflow-hidden">
                                    <img src={memoji05} alt="Avatar" className="w-full h-full object-cover" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <button className="w-full p-3 border-2 border-dashed border-slate-600 rounded-lg text-gray-400 text-sm hover:border-slate-500 hover:text-gray-300">
                              + {t.dashboard.content.board.createButton}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Mobile Board Layout */}
                <div className="lg:hidden h-[520px] flex flex-col">
                  <div className="flex-shrink-0 bg-slate-800 border-b border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h1 className="text-white text-lg font-semibold">{t.dashboard.content.board.title}</h1>
                      <Button size="sm" className="bg-blue-600">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex space-x-2 overflow-x-auto">
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded whitespace-nowrap">{t.dashboard.content.board.tabs.allTasks}</button>
                      <button className="px-3 py-1 text-gray-300 text-sm rounded whitespace-nowrap">{t.dashboard.content.board.columns.toDo}</button>
                      <button className="px-3 py-1 text-gray-300 text-sm rounded whitespace-nowrap">{t.dashboard.content.board.columns.inProgress}</button>
                      <button className="px-3 py-1 text-gray-300 text-sm rounded whitespace-nowrap">{t.dashboard.content.board.columns.done}</button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-white text-sm font-medium">{language === 'de' ? 'Nordturm-Gebäude' : 'North Tower Building'}</span>
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">{language === 'de' ? 'Hoch' : 'High'}</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{language === 'de' ? 'Klimaanlage macht laute Geräusche und kühlt nicht richtig' : 'Air conditioning unit making loud noises and not cooling properly'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-400 text-xs">{t.dashboard.content.board.columns.toDo}</span>
                        <div className="w-6 h-6 rounded-full bg-blue-100 overflow-hidden">
                          <img src={memoji05} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-white text-sm font-medium">{language === 'de' ? 'Westflügel-Gebäude' : 'West Wing Building'}</span>
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">{language === 'de' ? 'Mittel' : 'Medium'}</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{language === 'de' ? 'Installation neuer LED-Leuchten im Großraumbüro' : 'Installing new LED lighting fixtures in open office space'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-orange-400 text-xs">{t.dashboard.content.board.columns.inProgress}</span>
                        <div className="w-6 h-6 rounded-full bg-blue-100 overflow-hidden">
                          <img src={memoji07} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-700 rounded-lg p-4 opacity-80">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-white text-sm font-medium">{language === 'de' ? 'Ostgebäude' : 'East Building'}</span>
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">{t.dashboard.content.board.completed}</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{language === 'de' ? 'Defekten Toilettenpapierspender ersetzt und Türgriff repariert' : 'Replaced broken toilet paper dispenser and fixed door handle'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 text-xs">{t.dashboard.content.board.columns.done}</span>
                        <div className="w-6 h-6 rounded-full bg-blue-100 overflow-hidden">
                          <img src={memoji08} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Issues View Mockup
              <div className="bg-slate-900 rounded-xl w-full relative overflow-hidden">
                {/* Desktop Issues Layout */}
                <div className="hidden lg:flex h-[700px]">
                  {/* Sidebar */}
                  <div className="w-64 bg-slate-800 border-r border-slate-700 flex-shrink-0">
                    {/* Building Info */}
                    <div className="p-4 border-b border-slate-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center">
                          <span className="text-xs text-white font-bold">H</span>
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">Hansaplatz Building</div>
                          <div className="text-gray-400 text-xs">Tech Company</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu */}
                    <div className="p-4 flex-1 pt-2">
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">{t.dashboard.sidebar.menu}</p>
                      <nav className="space-y-1">
                        <div className="flex items-center space-x-3 px-3 py-2 text-blue-400 bg-slate-700 rounded-lg cursor-pointer">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.problems}</span>
                          <div className="ml-auto w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">6</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.board}</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.tasks}</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <DoorClosed className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.rooms}</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <Printer className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.assets}</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.documents}</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <BarChart3 className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.insights}</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <QrCode className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.qrCodes}</span>
                        </div>
                      </nav>
                    </div>
                    
                    {/* Bottom Menu Section */}
                    <div className="p-4 border-t border-slate-700">
                      <nav className="space-y-1">
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <Building className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.organization}</span>
                        </div>
                        <div className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-slate-700 rounded-lg cursor-pointer">
                          <HelpCircle className="w-4 h-4" />
                          <span className="text-sm">{t.dashboard.sidebar.helpSupport}</span>
                        </div>
                      </nav>
                    </div>
                  </div>
                  
                  {/* Main Issues Content */}
                  <div className="flex-1 bg-slate-900 overflow-y-auto">
                    {/* Header */}
                    <div className="border-b border-slate-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h1 className="text-white text-2xl font-semibold">{t.dashboard.content.issues.title}</h1>
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input 
                              type="text" 
                              placeholder={t.dashboard.content.board.searchPlaceholder} 
                              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm w-48"
                            />
                          </div>
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white/20">
                            <img 
                              src={memoji05} 
                              alt="Benutzer-Avatar" 
                              className="w-9 h-9 object-cover rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Tabs */}
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button className="px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded-full font-medium flex items-center space-x-2">
                            <span>{t.dashboard.content.issues.tabs.newIssues}</span>
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">6</span>
                          </button>
                          <button className="px-4 py-2 text-gray-400 text-sm rounded-full hover:bg-slate-700 flex items-center space-x-2">
                            <span>{t.dashboard.content.issues.tabs.accepted}</span>
                            <span className="text-xs">1</span>
                          </button>
                          <button className="px-4 py-2 text-gray-400 text-sm rounded-full hover:bg-slate-700 flex items-center space-x-2">
                            <span>{t.dashboard.content.issues.tabs.declined}</span>
                            <span className="text-xs">4</span>
                          </button>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input 
                              type="text" 
                              placeholder={t.dashboard.content.board.searchPlaceholder} 
                              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm w-40"
                            />
                          </div>
                          <button className="px-4 py-2 text-gray-400 text-sm rounded border border-slate-600 hover:bg-slate-700 flex items-center space-x-2">
                            <span>{t.dashboard.content.issues.sortBy}</span>
                            <ChevronRight className="w-4 h-4 rotate-90" />
                          </button>
                          <button className="p-2 text-gray-400 hover:bg-slate-700 rounded" aria-label="Filter">
                            <Filter className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Issues List */}
                    <div className="p-6 space-y-4">
                      {/* Issue Card 1 */}
                      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                              <Building className="w-4 h-4" />
                              <span>{language === 'de' ? 'Gebäude 1 > Bereich A > Raum 101 > Drucker' : 'Building 1 > Area A > Room 101 > Printer'}</span>
                            </div>
                            <p className="text-white text-sm mb-4">
                              {language === 'de' 
                                ? 'Der große Drucker ist defekt, es kommt nur blaue Tinte heraus und keine andere Tinte ist mit dem Drucker verwendbar.'
                                : 'The big printer is broken, only blue ink is coming out of it and no other ink is usable with the printer.'}
                            </p>
                            <div className="flex items-center space-x-3">
                              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white px-4">
                                {t.dashboard.content.issues.accept}
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-400 text-red-400 hover:bg-red-400/10 px-4">
                                {t.dashboard.content.issues.decline}
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-3 ml-6">
                            <span className="text-gray-400 text-sm">30.09.25 - 16:55</span>
                            <div className="flex space-x-2">
                              <div className="w-16 h-12 bg-slate-700 rounded overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                                  <Image className="w-6 h-6 text-slate-500" />
                                </div>
                              </div>
                              <div className="w-16 h-12 bg-slate-700 rounded overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                                  <Image className="w-6 h-6 text-slate-500" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Issue Card 2 */}
                      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                              <Building className="w-4 h-4" />
                              <span>{language === 'de' ? 'Gebäude 2 > Bereich B > Konferenzraum > Klimaanlage' : 'Building 2 > Area B > Conference Room > HVAC'}</span>
                            </div>
                            <p className="text-white text-sm mb-4">
                              {language === 'de' 
                                ? 'Die Klimaanlage macht laute Geräusche und kühlt nicht richtig. Mitarbeiter beschweren sich über die Temperatur.'
                                : 'The air conditioning unit is making loud noises and not cooling properly. Staff are complaining about the temperature.'}
                            </p>
                            <div className="flex items-center space-x-3">
                              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white px-4">
                                {t.dashboard.content.issues.accept}
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-400 text-red-400 hover:bg-red-400/10 px-4">
                                {t.dashboard.content.issues.decline}
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-3 ml-6">
                            <span className="text-gray-400 text-sm">28.09.25 - 14:55</span>
                            <div className="flex space-x-2">
                              <div className="w-16 h-12 bg-slate-700 rounded overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                                  <Image className="w-6 h-6 text-slate-500" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Issue Card 3 */}
                      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2">
                              <Building className="w-4 h-4" />
                              <span>{language === 'de' ? 'Gebäude 1 > Empfang > Beleuchtung' : 'Building 1 > Reception > Lighting'}</span>
                            </div>
                            <p className="text-white text-sm mb-4">
                              {language === 'de' 
                                ? 'Mehrere Deckenleuchten im Empfangsbereich flackern und müssen ersetzt werden.'
                                : 'Several ceiling lights in the reception area are flickering and need replacement.'}
                            </p>
                            <div className="flex items-center space-x-3">
                              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white px-4">
                                {t.dashboard.content.issues.accept}
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-400 text-red-400 hover:bg-red-400/10 px-4">
                                {t.dashboard.content.issues.decline}
                              </Button>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-3 ml-6">
                            <span className="text-gray-400 text-sm">27.09.25 - 09:30</span>
                            <div className="flex space-x-2">
                              <div className="w-16 h-12 bg-slate-700 rounded overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                                  <Image className="w-6 h-6 text-slate-500" />
                                </div>
                              </div>
                              <div className="w-16 h-12 bg-slate-700 rounded overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                                  <Image className="w-6 h-6 text-slate-500" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Issues Layout */}
                <div className="lg:hidden h-[520px] flex flex-col">
                  <div className="flex-shrink-0 bg-slate-800 border-b border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h1 className="text-white text-lg font-semibold">{t.dashboard.content.issues.title}</h1>
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        <img src={memoji05} alt="Avatar" className="w-7 h-7 object-cover" />
                      </div>
                    </div>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-full whitespace-nowrap flex items-center space-x-1">
                        <span>{t.dashboard.content.issues.tabs.newIssues}</span>
                        <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">6</span>
                      </button>
                      <button className="px-3 py-1.5 text-gray-300 text-sm rounded-full whitespace-nowrap">{t.dashboard.content.issues.tabs.accepted} (1)</button>
                      <button className="px-3 py-1.5 text-gray-300 text-sm rounded-full whitespace-nowrap">{t.dashboard.content.issues.tabs.declined} (4)</button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Mobile Issue Card 1 */}
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-gray-400 text-xs mb-2">
                        <Building className="w-3 h-3" />
                        <span className="truncate">{language === 'de' ? 'Gebäude 1 > Bereich A > Raum 101' : 'Building 1 > Area A > Room 101'}</span>
                      </div>
                      <p className="text-white text-sm mb-3">
                        {language === 'de' 
                          ? 'Der große Drucker ist defekt, es kommt nur blaue Tinte heraus.'
                          : 'The big printer is broken, only blue ink is coming out.'}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-xs">30.09.25 - 16:55</span>
                        <div className="flex space-x-1">
                          <div className="w-10 h-8 bg-slate-600 rounded flex items-center justify-center">
                            <Image className="w-4 h-4 text-slate-400" />
                          </div>
                          <div className="w-10 h-8 bg-slate-600 rounded flex items-center justify-center">
                            <Image className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white flex-1">
                          {t.dashboard.content.issues.accept}
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-400 text-red-400 flex-1">
                          {t.dashboard.content.issues.decline}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Mobile Issue Card 2 */}
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-gray-400 text-xs mb-2">
                        <Building className="w-3 h-3" />
                        <span className="truncate">{language === 'de' ? 'Gebäude 2 > Bereich B > Konferenzraum' : 'Building 2 > Area B > Conference Room'}</span>
                      </div>
                      <p className="text-white text-sm mb-3">
                        {language === 'de' 
                          ? 'Die Klimaanlage macht laute Geräusche und kühlt nicht richtig.'
                          : 'The air conditioning is making loud noises and not cooling properly.'}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-xs">28.09.25 - 14:55</span>
                        <div className="flex space-x-1">
                          <div className="w-10 h-8 bg-slate-600 rounded flex items-center justify-center">
                            <Image className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white flex-1">
                          {t.dashboard.content.issues.accept}
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-400 text-red-400 flex-1">
                          {t.dashboard.content.issues.decline}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <p className="text-lg font-semibold max-w-4xl mx-auto text-center mt-16" style={{ color: '#ffffffb8' }}>
          {language === 'de' 
            ? <>Machen Sie Augen und Ohren zu Ihren stärksten Sensoren. Mendigo vernetzt Besucher, Personal und Dienstleister auf einer <span className="text-white">intuitiven Plattform</span> – für eine <span className="text-white">nahtlose und effiziente</span> Zusammenarbeit.</>
            : <>Make your eyes and ears your strongest sensors. Mendigo connects visitors, staff, and service providers on an <span className="text-white">intuitive platform</span> – for <span className="text-white">seamless and efficient</span> collaboration.</>
          }
        </p>
        
        <div className="flex justify-center mt-10 mb-20">
          <Button 
            size="lg"
            onClick={() => openAuthModal('register')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {language === 'de' ? 'Entdecke Mendigo' : 'Discover Mendigo'}
          </Button>
        </div>
      </div>
    </div>
    </section>
    
    </>
  );
}