'use client';

import { useState, useTransition, useRef, useEffect, useId } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown, ArrowLeft, Plus, X, Pencil, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { OutputSection } from '@/components/output/output-section';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  addDayTodo,
  toggleDayTodo,
  removeDayTodo,
  updateDayTodo,
  reorderDayTodos,
  updateDayThoughts,
} from './actions';
import type { WorkBlock, DailyLog, DailyTodo } from '@/lib/types';

interface DayPageClientProps {
  date: string;
  initialBlocks: WorkBlock[];
  initialLog: DailyLog | null;
  initialTodos: DailyTodo[];
}

function getPrevDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function getNextDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

interface SortableTodoItemProps {
  todo: DailyTodo;
  editingId: string | null;
  editText: string;
  onEditTextChange: (text: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  onRemove: (id: string) => void;
  onStartEdit: (todo: DailyTodo) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
}

function SortableTodoItem({
  todo,
  editingId,
  editText,
  onEditTextChange,
  onToggle,
  onRemove,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}: SortableTodoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start group -ml-6 rounded-md transition-colors pr-1 py-1.5 ${
        isDragging
          ? 'bg-neutral-100/70 dark:bg-muted/30 [&>*]:opacity-0'
          : 'hover:bg-neutral-100/70 dark:hover:bg-muted/30'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-0.5 rounded text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity w-6 flex justify-center mt-0.5"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id, todo.completed)}
        className="h-4 w-4 mr-2 mt-1"
      />
      {editingId === todo.id ? (
        <Input
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveEdit(todo.id);
            if (e.key === 'Escape') onCancelEdit();
          }}
          className="h-7 text-base md:text-base flex-1 border-0 shadow-none focus-visible:ring-0 px-0"
          autoFocus
        />
      ) : (
        <>
          <span
            className={`text-base flex-1 ${
              todo.completed ? 'line-through text-[#888888]' : ''
            }`}
          >
            {todo.taskText}
          </span>
          <button
            onClick={() => onStartEdit(todo)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-foreground text-muted-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onRemove(todo.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

export function DayPageClient({ date, initialBlocks, initialLog, initialTodos }: DayPageClientProps) {
  const router = useRouter();
  const [todos, setTodos] = useState(initialTodos);
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [thoughts, setThoughts] = useState(initialLog?.dailyThoughts ?? '');
  const [thoughtsOpen, setThoughtsOpen] = useState(!!(initialLog?.dailyThoughts));
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dndId = useId();

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = date === todayStr;

  const dateObj = new Date(date + 'T12:00:00');
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setTodos(initialTodos);
    setThoughts(initialLog?.dailyThoughts ?? '');
    setIsAdding(false);
    setNewText('');
    setEditingId(null);
    setEditText('');
  }, [date, initialTodos, initialLog]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleAdd = () => {
    if (!newText.trim()) return;
    const text = newText.trim();
    setNewText('');
    setIsAdding(false);

    const optimisticTodo: DailyTodo = {
      id: `temp-${Date.now()}`,
      taskText: text,
      completed: false,
      order: todos.length,
      date,
      taskId: null,
    };
    setTodos((prev) => [...prev, optimisticTodo]);

    startTransition(async () => {
      await addDayTodo(date, text);
      router.refresh();
    });
  };

  const handleToggle = (id: string, currentCompleted: boolean) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    startTransition(async () => {
      await toggleDayTodo(id, !currentCompleted, date);
      router.refresh();
    });
  };

  const handleRemove = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    startTransition(async () => {
      await removeDayTodo(id, date);
      router.refresh();
    });
  };

  const handleStartEdit = (todo: DailyTodo) => {
    setEditingId(todo.id);
    setEditText(todo.taskText);
  };

  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    const text = editText.trim();
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, taskText: text } : t)));
    setEditingId(null);
    setEditText('');
    startTransition(async () => {
      await updateDayTodo(id, text, date);
      router.refresh();
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...todos];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    setTodos(reordered);
    startTransition(async () => {
      await reorderDayTodos(reordered.map((t) => t.id), date);
      router.refresh();
    });
  };

  const handleThoughtsChange = (value: string) => {
    setThoughts(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateDayThoughts(date, value);
    }, 500);
  };

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/archive"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Archive
        </Link>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/archive/day/${getPrevDate(date)}`)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {!isToday && (
            <Button variant="outline" size="sm" onClick={() => router.push(`/archive/day/${todayStr}`)}>
              Today
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => router.push(`/archive/day/${getNextDate(date)}`)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Date heading */}
      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">{dateStr}</h1>
      </div>

      {/* To do */}
      <div className="space-y-2">
        <h3 className="text-[18px] font-semibold text-foreground tracking-[-0.02em]">To do:</h3>
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-0 ml-0 mt-2">
              {todos.map((todo) => (
                <SortableTodoItem
                  key={todo.id}
                  todo={todo}
                  editingId={editingId}
                  editText={editText}
                  onEditTextChange={setEditText}
                  onToggle={handleToggle}
                  onRemove={handleRemove}
                  onStartEdit={handleStartEdit}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId
              ? (() => {
                  const todo = todos.find((t) => t.id === activeId);
                  if (!todo) return null;
                  return (
                    <div className="flex items-start -ml-6 rounded-md bg-neutral-100/70 dark:bg-muted/30 pr-1 py-1.5 shadow-sm">
                      <div className="w-6 shrink-0" />
                      <Checkbox checked={todo.completed} className="h-4 w-4 mr-2 mt-1 shrink-0" />
                      <span className={`text-base flex-1 ${todo.completed ? 'line-through text-[#888888]' : ''}`}>
                        {todo.taskText}
                      </span>
                    </div>
                  );
                })()
              : null}
          </DragOverlay>
        </DndContext>

        {isAdding ? (
          <div className="flex items-center gap-2 mt-2 -ml-1">
            <Input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewText('');
                }
              }}
              placeholder="What's your focus?"
              className="h-8 text-sm border-0 shadow-none focus-visible:ring-0"
              autoFocus
            />
          </div>
        ) : (
          <div className="mt-2 -ml-1">
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center justify-center w-6 h-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              disabled={isPending}
              title="Add focus"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <Separator className="opacity-50" />

      {/* Output */}
      <OutputSection initialBlocks={initialBlocks} date={date} />

      <Separator className="opacity-50" />

      {/* Thoughts */}
      <div className="space-y-2 mt-8">
        <div className="relative">
          <button
            onClick={() => setThoughtsOpen((o) => !o)}
            className="absolute -left-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {thoughtsOpen
              ? <ChevronDown className="h-4 w-4" />
              : <ChevronRight className="h-4 w-4" />
            }
          </button>
          <h3
            className="text-[18px] font-semibold text-foreground tracking-[-0.02em] cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setThoughtsOpen((o) => !o)}
          >
            Thoughts:
          </h3>
        </div>
        {thoughtsOpen && (
          <Textarea
            value={thoughts}
            onChange={(e) => handleThoughtsChange(e.target.value)}
            placeholder="jot down any thoughts as you work..."
            className="min-h-[100px] resize-none text-sm border-0 shadow-none focus-visible:ring-0 px-0 bg-transparent dark:bg-transparent"
          />
        )}
      </div>
    </div>
  );
}
