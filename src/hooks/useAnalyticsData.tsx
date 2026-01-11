import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/appStore';
import { startOfDay, subDays, format, parseISO, differenceInMinutes } from 'date-fns';

export interface RunTrendData {
  date: string;
  total: number;
  completed: number;
  failed: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface PersonaActivityData {
  name: string;
  sessions: number;
  messages: number;
}

export interface KpiData {
  avgCompletionTime: string;
  avgCompletionChange: string;
  successRate: string;
  successRateChange: string;
  activePersonas: number;
  personasChange: string;
  totalRuns: number;
  runsChange: string;
}

export function useAnalyticsData() {
  const { currentOffice } = useAppStore();

  // Fetch run trends over the last 7 days
  const { data: runTrends, isLoading: isLoadingTrends } = useQuery({
    queryKey: ['analytics-run-trends', currentOffice?.id],
    queryFn: async () => {
      if (!currentOffice?.id) return [];

      const sevenDaysAgo = subDays(new Date(), 7);
      
      const { data, error } = await supabase
        .from('workflow_runs')
        .select('created_at, status, started_at, completed_at')
        .eq('office_id', currentOffice.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by day
      const dayMap = new Map<string, { total: number; completed: number; failed: number }>();
      
      // Initialize all 7 days
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'EEE');
        dayMap.set(date, { total: 0, completed: 0, failed: 0 });
      }

      data?.forEach((run) => {
        const day = format(parseISO(run.created_at), 'EEE');
        const current = dayMap.get(day) || { total: 0, completed: 0, failed: 0 };
        current.total += 1;
        if (run.status === 'completed') current.completed += 1;
        if (run.status === 'failed') current.failed += 1;
        dayMap.set(day, current);
      });

      return Array.from(dayMap.entries()).map(([date, stats]) => ({
        date,
        ...stats,
      })) as RunTrendData[];
    },
    enabled: !!currentOffice?.id,
  });

  // Fetch status distribution
  const { data: statusDistribution, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['analytics-status-distribution', currentOffice?.id],
    queryFn: async () => {
      if (!currentOffice?.id) return [];

      const { data, error } = await supabase
        .from('workflow_runs')
        .select('status')
        .eq('office_id', currentOffice.id);

      if (error) throw error;

      const statusCounts = {
        completed: 0,
        running: 0,
        failed: 0,
        pending: 0,
      };

      data?.forEach((run) => {
        const status = run.status as keyof typeof statusCounts;
        if (status in statusCounts) {
          statusCounts[status]++;
        }
      });

      return [
        { name: 'Completed', value: statusCounts.completed, color: 'hsl(142, 71%, 45%)' },
        { name: 'Running', value: statusCounts.running, color: 'hsl(217, 91%, 60%)' },
        { name: 'Failed', value: statusCounts.failed, color: 'hsl(0, 84%, 60%)' },
        { name: 'Pending', value: statusCounts.pending, color: 'hsl(38, 92%, 50%)' },
      ].filter(item => item.value > 0) as StatusDistribution[];
    },
    enabled: !!currentOffice?.id,
  });

  // Fetch persona activity
  const { data: personaActivity, isLoading: isLoadingPersona } = useQuery({
    queryKey: ['analytics-persona-activity', currentOffice?.id],
    queryFn: async () => {
      if (!currentOffice?.id) return [];

      // Get personas
      const { data: personas, error: personasError } = await supabase
        .from('personas')
        .select('id, name')
        .eq('office_id', currentOffice.id);

      if (personasError) throw personasError;

      // Get chat sessions with message counts
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('id, persona_id')
        .eq('office_id', currentOffice.id);

      if (sessionsError) throw sessionsError;

      // Get message counts per session
      const sessionIds = sessions?.map(s => s.id) || [];
      let messageCounts: Record<string, number> = {};

      if (sessionIds.length > 0) {
        const { data: messages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('session_id')
          .in('session_id', sessionIds);

        if (messagesError) throw messagesError;

        messages?.forEach((msg) => {
          messageCounts[msg.session_id] = (messageCounts[msg.session_id] || 0) + 1;
        });
      }

      // Aggregate by persona
      const personaStats = new Map<string, { name: string; sessions: number; messages: number }>();

      personas?.forEach((persona) => {
        personaStats.set(persona.id, { name: persona.name, sessions: 0, messages: 0 });
      });

      sessions?.forEach((session) => {
        const stats = personaStats.get(session.persona_id);
        if (stats) {
          stats.sessions += 1;
          stats.messages += messageCounts[session.id] || 0;
        }
      });

      return Array.from(personaStats.values())
        .filter(p => p.sessions > 0 || p.messages > 0)
        .sort((a, b) => b.messages - a.messages)
        .slice(0, 6) as PersonaActivityData[];
    },
    enabled: !!currentOffice?.id,
  });

  // Fetch KPI data
  const { data: kpiData, isLoading: isLoadingKpi } = useQuery({
    queryKey: ['analytics-kpi', currentOffice?.id],
    queryFn: async () => {
      if (!currentOffice?.id) return null;

      const now = new Date();
      const sevenDaysAgo = subDays(now, 7);
      const fourteenDaysAgo = subDays(now, 14);

      // Get current period runs
      const { data: currentRuns, error: currentError } = await supabase
        .from('workflow_runs')
        .select('status, started_at, completed_at')
        .eq('office_id', currentOffice.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (currentError) throw currentError;

      // Get previous period runs for comparison
      const { data: previousRuns, error: previousError } = await supabase
        .from('workflow_runs')
        .select('status, started_at, completed_at')
        .eq('office_id', currentOffice.id)
        .gte('created_at', fourteenDaysAgo.toISOString())
        .lt('created_at', sevenDaysAgo.toISOString());

      if (previousError) throw previousError;

      // Get active personas count
      const { data: personas, error: personasError } = await supabase
        .from('personas')
        .select('id, status')
        .eq('office_id', currentOffice.id);

      if (personasError) throw personasError;

      const activePersonas = personas?.filter(p => p.status === 'active' || !p.status).length || 0;

      // Calculate completion times
      const completedRuns = currentRuns?.filter(r => r.status === 'completed' && r.started_at && r.completed_at) || [];
      const avgTime = completedRuns.length > 0
        ? completedRuns.reduce((sum, r) => sum + differenceInMinutes(parseISO(r.completed_at!), parseISO(r.started_at!)), 0) / completedRuns.length
        : 0;

      const prevCompletedRuns = previousRuns?.filter(r => r.status === 'completed' && r.started_at && r.completed_at) || [];
      const prevAvgTime = prevCompletedRuns.length > 0
        ? prevCompletedRuns.reduce((sum, r) => sum + differenceInMinutes(parseISO(r.completed_at!), parseISO(r.started_at!)), 0) / prevCompletedRuns.length
        : 0;

      // Calculate success rates
      const totalCurrent = currentRuns?.length || 0;
      const successCurrent = currentRuns?.filter(r => r.status === 'completed').length || 0;
      const successRate = totalCurrent > 0 ? (successCurrent / totalCurrent) * 100 : 0;

      const totalPrev = previousRuns?.length || 0;
      const successPrev = previousRuns?.filter(r => r.status === 'completed').length || 0;
      const prevSuccessRate = totalPrev > 0 ? (successPrev / totalPrev) * 100 : 0;

      // Calculate changes
      const timeChange = prevAvgTime > 0 ? ((avgTime - prevAvgTime) / prevAvgTime) * 100 : 0;
      const rateChange = successRate - prevSuccessRate;
      const runsChange = totalCurrent - totalPrev;

      return {
        avgCompletionTime: avgTime > 0 ? `${avgTime.toFixed(1)}m` : '0m',
        avgCompletionChange: timeChange !== 0 ? `${timeChange > 0 ? '+' : ''}${timeChange.toFixed(0)}%` : '0%',
        successRate: `${successRate.toFixed(1)}%`,
        successRateChange: rateChange !== 0 ? `${rateChange > 0 ? '+' : ''}${rateChange.toFixed(1)}%` : '0%',
        activePersonas,
        personasChange: `${activePersonas}`,
        totalRuns: totalCurrent,
        runsChange: runsChange !== 0 ? `${runsChange > 0 ? '+' : ''}${runsChange}` : '0',
      } as KpiData;
    },
    enabled: !!currentOffice?.id,
  });

  return {
    runTrends: runTrends || [],
    statusDistribution: statusDistribution || [],
    personaActivity: personaActivity || [],
    kpiData,
    isLoading: isLoadingTrends || isLoadingStatus || isLoadingPersona || isLoadingKpi,
  };
}
