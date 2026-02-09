import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon } from 'lucide-react';
import { mockTasks, STORAGE_KEYS } from '../data/mockData';
import type { Task } from '../types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay, startOfWeek, endOfWeek } from 'date-fns';

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.tasks);
    if (stored) {
      setTasks(JSON.parse(stored));
    } else {
      setTasks(mockTasks);
    }
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return isSameDay(taskDate, date);
    });
  };

  const handleAddTask = () => {
    if (newTaskTitle && selectedDate) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        status: 'pending',
        priority: 'medium',
        due_date: selectedDate.toISOString(),
        assigned_to: 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [...tasks, newTask];
      setTasks(updated);
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(updated));
      setNewTaskTitle('');
      setSelectedDate(null);
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-8">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <p className="text-gray-500 mt-1">
            Manage your schedule and tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card p-0 overflow-hidden">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day) => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const dayTasks = getTasksForDate(day);
            const hasCompleted = dayTasks.some(t => t.status === 'completed');
            const hasPending = dayTasks.some(t => t.status !== 'completed' && t.status !== 'cancelled');

            return (
              <div
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[120px] p-3 border-b border-r border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                  !isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : ''
                } ${isToday ? 'bg-primary-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday ? 'text-primary-950 bg-primary-200 w-7 h-7 rounded-full flex items-center justify-center' : ''
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`text-xs px-2 py-1 rounded truncate ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-700 line-through'
                          : task.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500 pl-2">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
                {hasPending && (
                  <div className="mt-2 flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h2>
              <button 
                onClick={() => {
                  setSelectedDate(null);
                  setNewTaskTitle('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Task
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    className="input-field flex-1"
                    placeholder="Enter task title..."
                  />
                  <button 
                    onClick={handleAddTask}
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tasks for this day</h3>
                {getTasksForDate(selectedDate).length === 0 ? (
                  <p className="text-gray-500 text-sm">No tasks scheduled</p>
                ) : (
                  getTasksForDate(selectedDate).map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        task.status === 'completed'
                          ? 'bg-green-50'
                          : task.priority === 'high'
                          ? 'bg-red-50'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <span className={`flex-1 text-sm ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.status === 'completed' ? 'bg-green-200 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-200 text-blue-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
