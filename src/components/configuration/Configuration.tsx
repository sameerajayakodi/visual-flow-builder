import React, { useEffect, useState } from 'react';
import { useSimulationStore, PlatformConfig } from '../../store/simulationStore';

// ─── Platform metadata ───
const PLATFORMS: Record<string, { name: string; color: string; icon: React.ReactNode; description: string; fields: { key: string; label: string; placeholder: string; type?: string }[] }> = {
  whatsapp: {
    name: 'WhatsApp',
    color: '#25D366',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#25D366">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    description: 'Connect your WhatsApp Business account to deploy chatbot flows to your customers.',
    fields: [
      { key: 'businessPhone', label: 'Business Phone Number', placeholder: '+94 77 123 4567' },
      { key: 'apiKey', label: 'API Key', placeholder: 'whatsapp_api_key_xxxxx', type: 'password' },
      { key: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://your-domain.com/webhook/whatsapp' },
      { key: 'businessName', label: 'Business Name', placeholder: 'My Business' },
    ],
  },
  messenger: {
    name: 'Messenger',
    color: '#0084FF',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#0084FF">
        <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.2l3.131 3.259 5.886-3.26-6.558 6.764z" />
      </svg>
    ),
    description: 'Connect your Facebook Page to deploy chatbot flows via Messenger.',
    fields: [
      { key: 'pageId', label: 'Page ID', placeholder: '123456789012345' },
      { key: 'appSecret', label: 'App Secret', placeholder: 'fb_app_secret_xxxxx', type: 'password' },
      { key: 'verifyToken', label: 'Verify Token', placeholder: 'my_verify_token' },
      { key: 'pageName', label: 'Page Name', placeholder: 'My Facebook Page' },
    ],
  },
  instagram: {
    name: 'Instagram',
    color: '#E1306C',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="url(#ig-config-grad)">
        <defs>
          <linearGradient id="ig-config-grad" x1="0" y1="24" x2="24" y2="0">
            <stop offset="0%" stopColor="#ffd600" />
            <stop offset="50%" stopColor="#ff0069" />
            <stop offset="100%" stopColor="#d300c5" />
          </linearGradient>
        </defs>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    description: 'Connect your Instagram Business account to automate direct message responses.',
    fields: [
      { key: 'businessAccountId', label: 'Business Account ID', placeholder: '17841400123456' },
      { key: 'accessToken', label: 'Access Token', placeholder: 'ig_access_token_xxxxx', type: 'password' },
      { key: 'accountName', label: 'Account Name', placeholder: '@mybusiness' },
    ],
  },
  web: {
    name: 'Web Widget',
    color: '#6366f1',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    description: 'Embed a chat widget on your website for instant customer engagement.',
    fields: [
      { key: 'widgetColor', label: 'Widget Color', placeholder: '#10b981', type: 'color' },
      { key: 'position', label: 'Position', placeholder: 'bottom-right' },
      { key: 'autoOpenDelay', label: 'Auto-Open Delay (seconds)', placeholder: '5' },
      { key: 'domainWhitelist', label: 'Domain Whitelist', placeholder: 'example.com, mysite.com' },
      { key: 'greeting', label: 'Greeting Message', placeholder: 'Hi! How can I help you?' },
    ],
  },
};

// ─── Available flows (mock from localStorage) ───
const getAvailableFlows = (): { id: string; name: string }[] => {
  try {
    const saved = localStorage.getItem('flowcraft_current_flow');
    if (saved) {
      const doc = JSON.parse(saved);
      return [{ id: doc.flowId || 'flow_1', name: doc.name || 'Untitled Flow' }];
    }
  } catch { /* ignore */ }
  return [
    { id: 'flow_customer_support', name: 'Customer Support Flow' },
    { id: 'flow_lead_qualification', name: 'Lead Qualification Bot' },
    { id: 'flow_appointment_booking', name: 'Appointment Booking' },
    { id: 'flow_faq_chatbot', name: 'FAQ Chatbot' },
  ];
};

const Configuration: React.FC = () => {
  const initialize = useSimulationStore((s) => s.initialize);
  const platformConfigs = useSimulationStore((s) => s.platformConfigs);
  const updatePlatformConfig = useSimulationStore((s) => s.updatePlatformConfig);
  const togglePlatform = useSimulationStore((s) => s.togglePlatform);
  const deployFlow = useSimulationStore((s) => s.deployFlow);

  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [deploying, setDeploying] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const availableFlows = getAvailableFlows();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleDeploy = async (platform: PlatformConfig['platform'], flowId: string, flowName: string) => {
    setDeploying(platform);
    // Simulate deployment delay
    await new Promise((res) => setTimeout(res, 1500));
    deployFlow(platform, flowId, flowName);
    setDeploying(null);
  };

  const handleSettingChange = (platform: PlatformConfig['platform'], key: string, value: string) => {
    const config = platformConfigs.find((c) => c.platform === platform);
    if (!config) return;
    updatePlatformConfig(platform, {
      settings: { ...config.settings, [key]: value },
    });
  };

  const getEmbedCode = (config: PlatformConfig) => {
    return `<!-- FlowCraft Web Widget -->
<script src="https://cdn.flowcraft.io/widget.js"></script>
<script>
  FlowCraft.init({
    flowId: "${config.flowId || 'YOUR_FLOW_ID'}",
    color: "${config.settings.widgetColor || '#10b981'}",
    position: "${config.settings.position || 'bottom-right'}",
    autoOpen: ${config.settings.autoOpenDelay || 5},
    greeting: "${config.settings.greeting || 'Hi! How can I help you?'}"
  });
</script>`;
  };

  const copyEmbed = (config: PlatformConfig) => {
    navigator.clipboard.writeText(getEmbedCode(config));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="configuration">
      {/* Header */}
      <div className="config-header">
        <div>
          <h1 className="config-title">Configuration</h1>
          <p className="config-subtitle">Deploy and manage your chatbot across platforms</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="config-overview">
        {platformConfigs.map((config) => {
          const meta = PLATFORMS[config.platform];
          if (!meta) return null;

          return (
            <div key={config.platform} className="config-platform-summary">
              <div className="config-platform-icon" style={{ color: meta.color }}>
                {meta.icon}
              </div>
              <div className="config-platform-info">
                <span className="config-platform-name">{meta.name}</span>
                <span className={`config-platform-status config-platform-status--${config.status}`}>
                  {config.status === 'connected' ? '● Connected' : '○ Not Connected'}
                </span>
              </div>
              {config.flowName && (
                <span className="config-platform-flow">{config.flowName}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Platform Cards */}
      <div className="config-platforms">
        {platformConfigs.map((config) => {
          const meta = PLATFORMS[config.platform];
          if (!meta) return null;
          const isExpanded = expandedPlatform === config.platform;

          return (
            <div key={config.platform} className={`config-card ${isExpanded ? 'expanded' : ''}`}>
              {/* Card Header */}
              <div className="config-card-header" onClick={() => setExpandedPlatform(isExpanded ? null : config.platform)}>
                <div className="config-card-left">
                  <div className="config-card-icon" style={{ background: `${meta.color}15` }}>
                    {meta.icon}
                  </div>
                  <div>
                    <h3 className="config-card-name">{meta.name}</h3>
                    <p className="config-card-desc">{meta.description}</p>
                  </div>
                </div>
                <div className="config-card-right">
                  <div className={`config-toggle ${config.enabled ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); togglePlatform(config.platform); }}
                    style={config.enabled ? { background: meta.color } : {}}
                  >
                    <div className="config-toggle-thumb" />
                  </div>
                  <svg className={`config-expand-chevron ${isExpanded ? 'rotated' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Card Body (Expanded) */}
              {isExpanded && (
                <div className="config-card-body">
                  {/* Flow Selection */}
                  <div className="config-section">
                    <h4 className="config-section-title">Select Flow</h4>
                    <div className="config-flow-select-wrap">
                      <select
                        className="config-flow-select"
                        value={config.flowId || ''}
                        onChange={(e) => {
                          const flow = availableFlows.find(f => f.id === e.target.value);
                          if (flow) updatePlatformConfig(config.platform, { flowId: flow.id, flowName: flow.name });
                        }}
                      >
                        <option value="">Choose a flow...</option>
                        {availableFlows.map((f) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                      <button
                        className="config-deploy-btn"
                        disabled={!config.flowId || deploying === config.platform}
                        onClick={() => config.flowId && config.flowName && handleDeploy(config.platform, config.flowId, config.flowName)}
                        style={{ background: meta.color }}
                      >
                        {deploying === config.platform ? (
                          <span className="config-deploy-spinner" />
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            Deploy
                          </>
                        )}
                      </button>
                    </div>
                    {config.lastDeployed && (
                      <span className="config-last-deployed">
                        Last deployed: {new Date(config.lastDeployed).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {/* Settings */}
                  <div className="config-section">
                    <h4 className="config-section-title">Platform Settings</h4>
                    <div className="config-fields">
                      {meta.fields.map((field) => (
                        <div key={field.key} className="config-field">
                          <label className="config-field-label">{field.label}</label>
                          {field.type === 'color' ? (
                            <div className="config-color-wrap">
                              <input
                                type="color"
                                className="config-color-input"
                                value={config.settings[field.key] || '#10b981'}
                                onChange={(e) => handleSettingChange(config.platform, field.key, e.target.value)}
                              />
                              <input
                                type="text"
                                className="config-field-input"
                                value={config.settings[field.key] || ''}
                                onChange={(e) => handleSettingChange(config.platform, field.key, e.target.value)}
                                placeholder={field.placeholder}
                              />
                            </div>
                          ) : (
                            <input
                              type={field.type || 'text'}
                              className="config-field-input"
                              value={config.settings[field.key] || ''}
                              onChange={(e) => handleSettingChange(config.platform, field.key, e.target.value)}
                              placeholder={field.placeholder}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Embed Code (Web only) */}
                  {config.platform === 'web' && (
                    <div className="config-section">
                      <h4 className="config-section-title">Embed Code</h4>
                      <p className="config-embed-desc">Copy and paste this code into your website's HTML, just before the closing &lt;/body&gt; tag.</p>
                      <div className="config-embed-wrap">
                        <pre className="config-embed-code">{getEmbedCode(config)}</pre>
                        <button className="config-copy-btn" onClick={() => copyEmbed(config)}>
                          {copied ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                              Copy Code
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Configuration;
