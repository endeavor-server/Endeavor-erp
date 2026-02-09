import { useState } from 'react';
import { 
  Folder, FolderOpen, ChevronRight, ChevronDown, Plus, Clock, Users, IndianRupee, 
  CheckCircle, AlertTriangle, Bot, Calendar, GanttChart, Search, Filter, MoreVertical,
  TrendingUp, BarChart3
} from 'lucide-react';

// Tree Structure
const programsData = [
  {
    id: 1, name: 'EdTech Platform Development', type: 'program', budget: 5000000, spent: 3200000, progress: 65, status: 'active',
    children: [
      { id: 11, name: 'AI-Powered Learning Engine', type: 'project', budget: 2000000, spent: 1400000, progress: 70, status: 'active',
        children: [
          { id: 111, name: 'Content Generation Module', type: 'task', domain: 'AI/ML', ai_usage: 85 },
          { id: 112, name: 'Adaptive Assessment System', type: 'task', domain: 'Algorithm', ai_usage: 60 },
        ]
      },
      { id: 12, name: 'Mobile Learning App', type: 'project', budget: 1800000, spent: 900000, progress: 50, status: 'active',
        children: [
          { id: 121, name: 'iOS Development', type: 'task', domain: 'Mobile', ai_usage: 20 },
          { id: 122, name: 'Android Development', type: 'task', domain: 'Mobile', ai_usage: 20 },
        ]
      },
    ]
  },
  {
    id: 2, name: 'Corporate Training Solutions', type: 'program', budget: 3000000, spent: 1200000, progress: 40, status: 'active',
    children: [
      { id: 21, name: 'Leadership Development', type: 'project', budget: 1500000, spent: 600000, progress: 40, status: 'active',
        children: [
          { id: 211, name: 'Executive Coaching Content', type: 'task', domain: 'Content', ai_usage: 75 },
          { id: 212, name: '360 Assessment Platform', type: 'task', domain: 'Platform', ai_usage: 30 },
        ]
      },
    ]
  },
];

const kanbanData = {
  todo: [
    { id: 1, title: 'Design System Audit', assignee: 'Alex K.', priority: 'high', hours: 8, ai_assist: true },
    { id: 2, title: 'API Documentation', assignee: 'Sarah M.', priority: 'medium', hours: 6, ai_assist: false },
    { id: 3, title: 'User Research', assignee: 'Mike R.', priority: 'low', hours: 16, ai_assist: false },
  ],
  inprogress: [
    { id: 4, title: 'ML Model Training', assignee: 'Dr. Chen', priority: 'high', hours: 24, ai_assist: true },
    { id: 5, title: 'Dashboard Widgets', assignee: 'Priya S.', priority: 'medium', hours: 12, ai_assist: true },
  ],
  review: [
    { id: 6, title: 'Payment Gateway Integration', assignee: 'Raj K.', priority: 'high', hours: 16, ai_assist: false },
    { id: 7, title: 'Content Migration Script', assignee: 'Bot-AI', priority: 'medium', hours: 4, ai_assist: true },
  ],
  done: [
    { id: 8, title: 'Login Flow Optimization', assignee: 'Alex K.', priority: 'high', hours: 8, ai_assist: false, rework: 1 },
    { id: 9, title: 'Automated Email Templates', assignee: 'Bot-AI', priority: 'low', hours: 2, ai_assist: true, rework: 0 },
  ],
};

function StatCard({ label, value, trend, icon: Icon, trendValue }: { 
  label: string; value: string; trend: 'up' | 'down' | 'neutral'; icon: any; trendValue: string 
}) {
  return (
    <div className="card p-5 surface-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-[var(--surface-hover)] rounded-lg">
          <Icon className="w-5 h-5 text-[var(--text-secondary)]" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${
          trend === 'up' ? 'text-[var(--success)]' : trend === 'down' ? 'text-[var(--error)]' : 'text-[var(--text-muted)]'
        }`}>
          {trendValue}
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{value}</p>
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

function TreeNode({ node, level = 0 }: { node: any; level?: number }) {
  const [expanded, setExpanded] = useState(level < 1);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2.5 px-3 rounded-lg hover:bg-[var(--surface-hover)] cursor-pointer transition-colors"
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          expanded ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
        )}
        {!hasChildren && <div className="w-4" />}
        
        {node.type === 'program' && <Folder className="w-5 h-5 text-[var(--primary)]" />}
        {node.type === 'project' && <FolderOpen className="w-5 h-5 text-[var(--info)]" />}
        {node.type === 'task' && <div className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />}
        
        <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{node.name}</span>
        
        {node.ai_usage && (
          <span className="flex items-center gap-1 text-xs text-[var(--info)]">
            <Bot className="w-3 h-3" /> {node.ai_usage}%
          </span>
        )}
        
        {node.progress !== undefined && (
          <div className="flex items-center gap-2 w-32">
            <div className="flex-1 h-1.5 bg-[var(--surface-hover)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${node.progress}%` }} />
            </div>
            <span className="text-xs text-[var(--text-muted)]">{node.progress}%</span>
          </div>
        )}
      </div>
      
      {expanded && hasChildren && (
        <div>
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function KanbanCard({ task }: { task: any }) {
  return (
    <div className="card p-3 cursor-pointer hover:border-[var(--border-hover)] transition-colors">
      <div className="flex items-start justify-between mb-2">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
          task.priority === 'high' ? 'bg-[var(--error-light)] text-[var(--error)]' :
          task.priority === 'medium' ? 'bg-[var(--warning-light)] text-[var(--warning)]' :
          'bg-[var(--success-light)] text-[var(--success)]'
        }`}>
          {task.priority}
        </span>
        {task.ai_assist && <Bot className="w-4 h-4 text-[var(--info)]" />}
      </div>
      <p className="text-sm font-medium text-[var(--text-primary)] mb-3">{task.title}</p>
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {task.hours}h
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" /> {task.assignee}
        </div>
      </div>
      {task.rework > 0 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-[var(--warning)]">
          <AlertTriangle className="w-3 h-3" /> {task.rework} rework
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ title, tasks, color }: { title: string; tasks: any[]; color: string }) {
  return (
    <div className="flex-1 min-w-0">
      <div className={`flex items-center justify-between mb-3 px-3 py-2 rounded-lg ${color}`}>
        <span className="font-medium text-sm text-[var(--text-primary)]">{title}</span>
        <span className="text-xs bg-[var(--surface)] px-2 py-0.5 rounded-full text-[var(--text-secondary)]">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.map(task => <KanbanCard key={task.id} task={task} />)}
      </div>
      <button className="w-full mt-3 py-2 border border-dashed border-[var(--border)] rounded-lg text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-1 text-sm">
        <Plus className="w-4 h-4" /> Add Task
      </button>
    </div>
  );
}

export function WorkDeliveryModule() {
  const [activeView, setActiveView] = useState<'tree' | 'kanban' | 'budget' | 'timeline'>('tree');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Active Projects" value="24" trend="up" trendValue="+4" icon={Folder} />
        <StatCard label="Overdue" value="3" trend="down" trendValue="-2" icon={AlertTriangle} />
        <StatCard label="On Track" value="18" trend="up" trendValue="+5" icon={CheckCircle} />
        <StatCard label="Budget Used" value="68%" trend="neutral" trendValue="On Plan" icon={IndianRupee} />
      </div>

      {/* View Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-[var(--surface)] rounded-lg p-1 border border-[var(--border)]">
          {[
            { id: 'tree', label: 'Programs & Projects', icon: Folder },
            { id: 'kanban', label: 'Kanban Board', icon: CheckCircle },
            { id: 'budget', label: 'Budget Tracking', icon: IndianRupee },
            { id: 'timeline', label: 'Timeline', icon: GanttChart },
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === view.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <view.icon className="w-4 h-4" />
              {view.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none"
            />
          </div>
          <button className="btn btn-secondary p-2">
            <Filter className="w-4 h-4" />
          </button>
          <button className="btn btn-primary px-4 py-2 text-sm">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Tree View */}
      {activeView === 'tree' && (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 card">
            <div className="p-4 border-b border-[var(--border)]">
              <h3 className="font-semibold text-[var(--text-primary)]">Program & Project Hierarchy</h3>
            </div>
            <div className="p-2">
              {programsData.map(program => (
                <TreeNode key={program.id} node={program} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* AI Usage */}
            <div className="card p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-[var(--info)]" />
                AI Usage Distribution
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-4 border-[var(--primary)] flex items-center justify-center">
                    <span className="text-sm font-bold text-[var(--text-primary)]">65%</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">Human Effort</p>
                    <p className="text-xs text-[var(--text-muted)]">Core development</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-4 border-[var(--info)] flex items-center justify-center">
                    <span className="text-sm font-bold text-[var(--text-primary)]">35%</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">AI Assisted</p>
                    <p className="text-xs text-[var(--text-muted)]">Code generation, testing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Metrics */}
            <div className="card p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">Quality Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[var(--text-muted)]">QA Pass Rate</span>
                    <span className="text-sm font-medium text-[var(--success)]">94%</span>
                  </div>
                  <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--success)] rounded-full" style={{ width: '94%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[var(--text-muted)]">Rework Rate</span>
                    <span className="text-sm font-medium text-[var(--warning)]">8%</span>
                  </div>
                  <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--warning)] rounded-full" style={{ width: '8%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[var(--text-muted)]">On-time Delivery</span>
                    <span className="text-sm font-medium text-[var(--primary)]">87%</span>
                  </div>
                  <div className="h-2 bg-[var(--surface-hover)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {activeView === 'kanban' && (
        <div className="card p-6">
          <div className="flex gap-6">
            <KanbanColumn title="To Do" tasks={kanbanData.todo} color="bg-[var(--surface-hover)]" />
            <KanbanColumn title="In Progress" tasks={kanbanData.inprogress} color="bg-[var(--primary-light)]" />
            <KanbanColumn title="Review" tasks={kanbanData.review} color="bg-[var(--warning-light)]" />
            <KanbanColumn title="Done" tasks={kanbanData.done} color="bg-[var(--success-light)]" />
          </div>
        </div>
      )}

      {/* Budget View */}
      {activeView === 'budget' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-6">Budget vs Actual (₹ Lakhs)</h3>
            <div className="space-y-4">
              {[
                { name: 'AI Learning', budget: 200, spent: 140, remaining: 60, status: 'good' },
                { name: 'Mobile App', budget: 180, spent: 90, remaining: 90, status: 'good' },
                { name: 'Leadership', budget: 150, spent: 60, remaining: 90, status: 'good' },
                { name: 'Platform Core', budget: 120, spent: 100, remaining: 20, status: 'warning' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === 'good' ? 'bg-[var(--success-light)] text-[var(--success)]' : 'bg-[var(--warning-light)] text-[var(--warning)]'
                    }`}>
                      {item.status === 'good' ? 'On Track' : '85% Used'}
                    </span>
                  </div>
                  <div className="h-3 bg-[var(--surface-hover)] rounded-full overflow-hidden flex">
                    <div className="h-full bg-[var(--success)]" style={{ width: `${(item.spent / item.budget) * 100}%` }} />
                    <div className="h-full bg-[var(--surface)]" style={{ width: `${(item.remaining / item.budget) * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>Spent: ₹{item.spent}L</span>
                    <span>Remaining: ₹{item.remaining}L</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Budget Alerts</h3>
            {[
              { project: 'Platform Core', alert: '85% budget consumed', severity: 'high' },
              { project: 'AI Learning', alert: 'On track', severity: 'low' },
              { project: 'Mobile App', alert: '50% utilized', severity: 'low' },
            ].map((alert, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${
                alert.severity === 'high' ? 'bg-[var(--error-light)] border-[var(--error)]/20' : 'bg-[var(--success-light)] border-[var(--success)]/20'
              }`}>
                <div className="flex items-center gap-3">
                  {alert.severity === 'high' ? (
                    <AlertTriangle className="w-5 h-5 text-[var(--error)]" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                  )}
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{alert.project}</p>
                    <p className={`text-sm ${alert.severity === 'high' ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>
                      {alert.alert}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline View */}
      {activeView === 'timeline' && (
        <div className="card p-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-6">Project Timeline - Q1 2025</h3>
          <div className="space-y-6">
            {[
              { name: 'AI Learning Engine', start: 'Jan 1', end: 'Mar 31', progress: 70, tasks: 45 },
              { name: 'Mobile App v2', start: 'Feb 1', end: 'Apr 30', progress: 50, tasks: 32 },
              { name: 'Leadership Program', start: 'Jan 15', end: 'Mar 15', progress: 40, tasks: 28 },
              { name: 'Security Audit', start: 'Mar 1', end: 'Mar 31', progress: 10, tasks: 15 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-48">
                  <p className="font-medium text-[var(--text-primary)] text-sm">{item.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.start} - {item.end}</p>
                </div>
                <div className="flex-1">
                  <div className="h-8 bg-[var(--surface-hover)] rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--info)] rounded-lg flex items-center px-3"
                      style={{ width: `${item.progress}%` }}
                    >
                      <span className="text-white text-xs font-medium">{item.progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="w-20 text-right">
                  <span className="text-sm text-[var(--text-muted)]">{item.tasks} tasks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
