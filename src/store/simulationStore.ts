import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ───
export interface SimulationResponse {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  promptText: string;
  userResponse: string;
  timestamp: string;
  variableName?: string;
}

export interface SimulationSession {
  id: string;
  flowId: string;
  flowName: string;
  platform: 'simulator' | 'whatsapp' | 'messenger' | 'instagram' | 'web';
  startedAt: string;
  endedAt: string | null;
  status: 'completed' | 'abandoned' | 'in_progress';
  completionPercentage: number;
  lastNodeId: string;
  lastNodeLabel: string;
  responses: SimulationResponse[];
  variables: Record<string, string>;
  totalNodes: number;
  visitedNodes: number;
}

export interface PlatformConfig {
  platform: 'whatsapp' | 'messenger' | 'instagram' | 'web';
  enabled: boolean;
  flowId: string | null;
  flowName: string | null;
  settings: Record<string, string>;
  lastDeployed: string | null;
  status: 'connected' | 'disconnected' | 'error';
}

interface SimulationState {
  sessions: SimulationSession[];
  platformConfigs: PlatformConfig[];
  currentSessionId: string | null;
  isInitialized: boolean;

  // Actions
  initialize: () => void;
  startSession: (flowId: string, flowName: string, platform: SimulationSession['platform'], totalNodes: number) => string;
  addResponse: (sessionId: string, response: SimulationResponse) => void;
  endSession: (sessionId: string, status: 'completed' | 'abandoned') => void;
  updateSessionProgress: (sessionId: string, visitedNodes: number, lastNodeId: string, lastNodeLabel: string) => void;

  // Platform config actions
  updatePlatformConfig: (platform: PlatformConfig['platform'], updates: Partial<PlatformConfig>) => void;
  togglePlatform: (platform: PlatformConfig['platform']) => void;
  deployFlow: (platform: PlatformConfig['platform'], flowId: string, flowName: string) => void;

  // Getters
  getSessionsByFlow: (flowId: string) => SimulationSession[];
  getSessionsByPlatform: (platform: SimulationSession['platform']) => SimulationSession[];
  getCompletionRate: () => number;
  getTotalSessions: () => number;
  getAvgResponsesPerSession: () => number;
  getSessionsOverTime: (days: number) => { date: string; count: number }[];
  getDropOffPoints: () => { nodeLabel: string; count: number; percentage: number }[];
  getPlatformDistribution: () => { platform: string; count: number }[];
  getStatusDistribution: () => { status: string; count: number }[];
}

const STORAGE_KEY = 'flowcraft_simulations';
const CONFIG_STORAGE_KEY = 'flowcraft_platform_configs';

const defaultPlatformConfigs: PlatformConfig[] = [
  {
    platform: 'whatsapp',
    enabled: false,
    flowId: null,
    flowName: null,
    settings: {
      businessPhone: '',
      apiKey: '',
      webhookUrl: '',
      businessName: '',
    },
    lastDeployed: null,
    status: 'disconnected',
  },
  {
    platform: 'messenger',
    enabled: false,
    flowId: null,
    flowName: null,
    settings: {
      pageId: '',
      appSecret: '',
      verifyToken: '',
      pageName: '',
    },
    lastDeployed: null,
    status: 'disconnected',
  },
  {
    platform: 'instagram',
    enabled: false,
    flowId: null,
    flowName: null,
    settings: {
      businessAccountId: '',
      accessToken: '',
      accountName: '',
    },
    lastDeployed: null,
    status: 'disconnected',
  },
  {
    platform: 'web',
    enabled: false,
    flowId: null,
    flowName: null,
    settings: {
      widgetColor: '#10b981',
      position: 'bottom-right',
      autoOpenDelay: '5',
      domainWhitelist: '',
      greeting: 'Hi! How can I help you?',
    },
    lastDeployed: null,
    status: 'disconnected',
  },
];

export const useSimulationStore = create<SimulationState>()((set, get) => ({
  sessions: [],
  platformConfigs: defaultPlatformConfigs,
  currentSessionId: null,
  isInitialized: false,

  initialize: () => {
    if (get().isInitialized) return;

    // Load from localStorage — only real captured sessions
    try {
      const savedSessions = localStorage.getItem(STORAGE_KEY);
      const savedConfigs = localStorage.getItem(CONFIG_STORAGE_KEY);

      set({
        sessions: savedSessions ? JSON.parse(savedSessions) : [],
        isInitialized: true,
      });

      if (savedConfigs) {
        set({ platformConfigs: JSON.parse(savedConfigs) });
      }
    } catch {
      set({ sessions: [], isInitialized: true });
    }
  },

  startSession: (flowId, flowName, platform, totalNodes) => {
    const id = uuidv4();
    const session: SimulationSession = {
      id,
      flowId,
      flowName,
      platform,
      startedAt: new Date().toISOString(),
      endedAt: null,
      status: 'in_progress',
      completionPercentage: 0,
      lastNodeId: '',
      lastNodeLabel: 'Flow Start',
      responses: [],
      variables: {},
      totalNodes,
      visitedNodes: 0,
    };

    set((s) => {
      const updated = [...s.sessions, session];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { sessions: updated, currentSessionId: id };
    });

    return id;
  },

  addResponse: (sessionId, response) => {
    set((s) => {
      const updated = s.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        const newResponses = [...session.responses, response];
        const newVars = { ...session.variables };
        if (response.variableName) {
          newVars[response.variableName] = response.userResponse;
        }
        return {
          ...session,
          responses: newResponses,
          variables: newVars,
          lastNodeId: response.nodeId,
          lastNodeLabel: response.nodeLabel,
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { sessions: updated };
    });
  },

  endSession: (sessionId, status) => {
    set((s) => {
      const updated = s.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        return {
          ...session,
          status,
          endedAt: new Date().toISOString(),
          completionPercentage: status === 'completed' ? 100 : session.completionPercentage,
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { sessions: updated, currentSessionId: null };
    });
  },

  updateSessionProgress: (sessionId, visitedNodes, lastNodeId, lastNodeLabel) => {
    set((s) => {
      const updated = s.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        const pct = session.totalNodes > 0 ? Math.round((visitedNodes / session.totalNodes) * 100) : 0;
        return {
          ...session,
          visitedNodes,
          lastNodeId,
          lastNodeLabel,
          completionPercentage: Math.min(pct, 100),
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { sessions: updated };
    });
  },

  // Platform config actions
  updatePlatformConfig: (platform, updates) => {
    set((s) => {
      const updated = s.platformConfigs.map((c) =>
        c.platform === platform ? { ...c, ...updates } : c
      );
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
      return { platformConfigs: updated };
    });
  },

  togglePlatform: (platform) => {
    set((s) => {
      const updated = s.platformConfigs.map((c) =>
        c.platform === platform
          ? { ...c, enabled: !c.enabled, status: !c.enabled ? 'connected' as const : 'disconnected' as const }
          : c
      );
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
      return { platformConfigs: updated };
    });
  },

  deployFlow: (platform, flowId, flowName) => {
    set((s) => {
      const updated = s.platformConfigs.map((c) =>
        c.platform === platform
          ? { ...c, flowId, flowName, lastDeployed: new Date().toISOString(), enabled: true, status: 'connected' as const }
          : c
      );
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
      return { platformConfigs: updated };
    });
  },

  // Getters
  getSessionsByFlow: (flowId) => get().sessions.filter((s) => s.flowId === flowId),
  getSessionsByPlatform: (platform) => get().sessions.filter((s) => s.platform === platform),

  getCompletionRate: () => {
    const sessions = get().sessions;
    if (sessions.length === 0) return 0;
    const completed = sessions.filter((s) => s.status === 'completed').length;
    return Math.round((completed / sessions.length) * 100);
  },

  getTotalSessions: () => get().sessions.length,

  getAvgResponsesPerSession: () => {
    const sessions = get().sessions;
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum, s) => sum + s.responses.length, 0);
    return Math.round((total / sessions.length) * 10) / 10;
  },

  getSessionsOverTime: (days) => {
    const sessions = get().sessions;
    const result: { date: string; count: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = sessions.filter((s) => s.startedAt.startsWith(dateStr)).length;
      result.push({ date: dateStr, count });
    }
    return result;
  },

  getDropOffPoints: () => {
    const sessions = get().sessions.filter((s) => s.status === 'abandoned');
    const dropOff: Record<string, number> = {};
    sessions.forEach((s) => {
      const label = s.lastNodeLabel || 'Unknown';
      dropOff[label] = (dropOff[label] || 0) + 1;
    });
    const total = sessions.length || 1;
    return Object.entries(dropOff)
      .map(([nodeLabel, count]) => ({ nodeLabel, count, percentage: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  },

  getPlatformDistribution: () => {
    const sessions = get().sessions;
    const dist: Record<string, number> = {};
    sessions.forEach((s) => {
      dist[s.platform] = (dist[s.platform] || 0) + 1;
    });
    return Object.entries(dist).map(([platform, count]) => ({ platform, count }));
  },

  getStatusDistribution: () => {
    const sessions = get().sessions;
    const dist: Record<string, number> = {};
    sessions.forEach((s) => {
      dist[s.status] = (dist[s.status] || 0) + 1;
    });
    return Object.entries(dist).map(([status, count]) => ({ status, count }));
  },
}));
